/**
 * Ribyon Studios CMS â€” Cloudflare Worker API
 *
 * The Ribyon CMS keeps its whole dataset in one JSON blob (the same shape as
 * the localStorage `rs_data` document). This worker persists that blob in a
 * Cloudflare D1 database and stores image files in an R2 bucket.
 *
 * Bindings (wrangler.toml):
 *   DB    -> Cloudflare D1 database  (ribyon-cms-db)
 *   MEDIA -> Cloudflare R2 bucket    (ribyon-media)
 *
 * Auth:
 *   - `POST /api/auth/login` with {username, password} returns a signed JWT.
 *   - Every other /api/* call must include `Authorization: Bearer <JWT>`.
 *   - The master ADMIN_TOKEN secret also works as a Bearer token and grants
 *     the `superadmin` role (used by the worker-owner / first-run setup).
 *
 * Roles: superadmin > admin > editor > viewer.
 *
 * Secrets:
 *   npx wrangler secret put ADMIN_TOKEN   (master token)
 *   npx wrangler secret put JWT_SECRET    (JWT signing key)
 */

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function corsHeaders(env, req) {
  const origin = req.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status = 200, env, req) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...corsHeaders(env, req),
    },
  });
}

function err(msg, status = 400, env, req) {
  return json({ error: msg }, status, env, req);
}

async function safeJSON(req) {
  try { return await req.json(); } catch (e) { return null; }
}

function constantTimeEq(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// JWT (HS256 via WebCrypto)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TE = new TextEncoder();
const TD = new TextDecoder();

function b64url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str) {
  const pad = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(pad + '='.repeat((4 - (pad.length % 4)) % 4));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', TE.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function signJWT(payload, secret) {
  const header = b64url(TE.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = b64url(TE.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), TE.encode(`${header}.${body}`));
  return `${header}.${body}.${b64url(new Uint8Array(sig))}`;
}

async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify('HMAC', key, b64urlDecode(parts[2]), TE.encode(`${parts[0]}.${parts[1]}`));
    if (!ok) return null;
    const payload = JSON.parse(TD.decode(b64urlDecode(parts[1])));
    if (!payload || !payload.exp || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch (e) { return null; }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Password hashing (PBKDF2-SHA256 via WebCrypto)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ITERATIONS = 100000;

async function hashPassword(password, saltB64) {
  const salt = saltB64 ? b64urlDecode(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', TE.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, 256);
  return `pbkdf2$${b64url(salt)}$${b64url(new Uint8Array(bits))}`;
}

async function verifyPassword(password, stored) {
  try {
    const parts = (stored || '').split('$');
    if (parts.length !== 3 || parts[0] !== 'pbkdf2') return false;
    const hash = await hashPassword(password, parts[1]);
    return constantTimeEq(hash, stored);
  } catch (e) { return false; }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Auth / roles
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ROLES = { superadmin: 4, admin: 3, editor: 2, viewer: 1 };

function roleAtLeast(role, min) {
  return (ROLES[role] || 0) >= (ROLES[min] || 0);
}

async function authenticate(req, env) {
  const h = req.headers.get('Authorization') || '';
  const token = h.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  // Master ADMIN_TOKEN grants superadmin
  if (env.ADMIN_TOKEN && constantTimeEq(token, env.ADMIN_TOKEN)) {
    return { username: 'admin', role: 'superadmin', master: true };
  }

  // Otherwise verify the JWT
  const payload = await verifyJWT(token, env.JWT_SECRET || 'dev-jwt-secret');
  if (!payload) return null;
  return { username: payload.sub, role: payload.role || 'viewer' };
}

function requireRole(user, min, env, req) {
  if (!user) return err('Unauthorized', 401, env, req);
  if (!roleAtLeast(user.role, min)) return err('Forbidden', 403, env, req);
  return null;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Users (cms_users)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function handleLogin(req, env) {
  const body = await safeJSON(req);
  if (!body) return err('Email and password required', 400, env, req);
  const identifier = String(body.identifier || body.username || '').toLowerCase().trim();
  if (!identifier || !body.password) return err('Email and password required', 400, env, req);

  // Master token double-duty: if the single ADMIN_TOKEN is used as a password
  // with the admin email or "admin", log in as superadmin (backwards compatible).
  if ((identifier === 'admin' || identifier === 'freudtroy@gmail.com') && env.ADMIN_TOKEN && constantTimeEq(body.password, env.ADMIN_TOKEN)) {
    const payload = { sub: 'admin', role: 'superadmin', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 };
    const token = await signJWT(payload, env.JWT_SECRET || 'dev-jwt-secret');
    return json({ token, user: { username: 'admin', email: 'freudtroy@gmail.com', role: 'superadmin' } }, 200, env, req);
  }

  const row = await env.DB.prepare('SELECT username, email, password_hash, role FROM cms_users WHERE LOWER(email) = ? OR LOWER(username) = ?').bind(identifier, identifier).first();
  if (!row) return err('Invalid credentials', 401, env, req);
  const ok = await verifyPassword(body.password, row.password_hash);
  if (!ok) return err('Invalid credentials', 401, env, req);

  const payload = { sub: row.username, role: row.role, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 };
  const token = await signJWT(payload, env.JWT_SECRET || 'dev-jwt-secret');
  return json({ token, user: { username: row.username, email: row.email, role: row.role } }, 200, env, req);
}

async function handleUsers(method, req, env, user) {
  const forbidden = requireRole(user, 'superadmin', env, req);
  if (forbidden) return forbidden;

  if (method === 'GET') {
    const { results } = await env.DB.prepare('SELECT id, username, email, role, created_at FROM cms_users ORDER BY id').all();
    return json({ users: results }, 200, env, req);
  }

  if (method === 'POST') {
    const body = await safeJSON(req);
    if (!body || !body.email || !body.password) return err('email and password required', 400, env, req);
    const email = String(body.email).toLowerCase().trim();
    const username = String(body.username || email.split('@')[0]).toLowerCase().trim();
    const role = ['superadmin', 'admin', 'editor', 'viewer'].includes(body.role) ? body.role : 'viewer';
    const existing = await env.DB.prepare('SELECT id FROM cms_users WHERE LOWER(email) = ? OR LOWER(username) = ?').bind(email, username).first();
    if (existing) return err('User already exists', 409, env, req);
    const passwordHash = await hashPassword(body.password);
    await env.DB.prepare('INSERT INTO cms_users (username, email, password_hash, role) VALUES (?, ?, ?, ?)')
      .bind(username, email, passwordHash, role).run();
    return json({ ok: true }, 201, env, req);
  }

  if (method === 'PUT') {
    const url = new URL(req.url);
    const id = Number(url.searchParams.get('id'));
    if (!id) return err('Missing id', 400, env, req);
    const body = await safeJSON(req);
    if (!body) return err('Bad request', 400, env, req);
    const row = await env.DB.prepare('SELECT username, email, role FROM cms_users WHERE id = ?').bind(id).first();
    if (!row) return err('User not found', 404, env, req);
    if (body.password) {
      const passwordHash = await hashPassword(body.password);
      await env.DB.prepare('UPDATE cms_users SET password_hash = ? WHERE id = ?').bind(passwordHash, id).run();
    }
    if (body.email) {
      const email = String(body.email).toLowerCase().trim();
      const clash = await env.DB.prepare('SELECT id FROM cms_users WHERE LOWER(email) = ? AND id != ?').bind(email, id).first();
      if (clash) return err('Email already in use', 409, env, req);
      await env.DB.prepare('UPDATE cms_users SET email = ? WHERE id = ?').bind(email, id).run();
    }
    if (body.role && ['superadmin', 'admin', 'editor', 'viewer'].includes(body.role) && body.role !== row.role) {
      await env.DB.prepare('UPDATE cms_users SET role = ? WHERE id = ?').bind(body.role, id).run();
    }
    return json({ ok: true }, 200, env, req);
  }

  if (method === 'DELETE') {
    const url = new URL(req.url);
    const id = Number(url.searchParams.get('id'));
    if (!id) return err('Missing id', 400, env, req);
    const row = await env.DB.prepare('SELECT role FROM cms_users WHERE id = ?').bind(id).first();
    if (!row) return err('User not found', 404, env, req);
    if (row.role === 'superadmin') return err('Cannot delete superadmin', 400, env, req);
    await env.DB.prepare('DELETE FROM cms_users WHERE id = ?').bind(id).run();
    return json({ ok: true }, 200, env, req);
  }

  return err('Method not allowed', 405, env, req);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Data endpoints (D1 document store)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function handleData(method, req, env, user) {
  const forbidden = requireRole(user, 'viewer', env, req);
  if (forbidden) return forbidden;

  if (method === 'GET') {
    const row = await env.DB.prepare('SELECT payload FROM cms_data WHERE id=1').first();
    if (!row) return json({ data: null, updated_at: null }, 200, env, req);
    return json({ data: JSON.parse(row.payload || '{}'), updated_at: row.updated_at }, 200, env, req);
  }

  if (method === 'PUT') {
    const forbiddenWrite = requireRole(user, 'editor', env, req);
    if (forbiddenWrite) return forbiddenWrite;
    const body = await safeJSON(req);
    if (!body || body.data === undefined) return err('Missing data', 400, env, req);
    const payload = JSON.stringify(body.data);
    await env.DB.prepare(
      'INSERT INTO cms_data (id, payload, updated_at) VALUES (1, ?, datetime(\'now\')) ' +
      'ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at'
    ).bind(payload).run();
    return json({ ok: true }, 200, env, req);
  }

  return err('Method not allowed', 405, env, req);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Media endpoints (R2)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function handleMediaUpload(req, env, user) {
  const forbidden = requireRole(user, 'editor', env, req);
  if (forbidden) return forbidden;

  let form;
  try { form = await req.formData(); } catch (e) { return err('Invalid form', 400, env, req); }
  const file = form.get('file');
  if (!file) return err('No file provided', 400, env, req);

  const name = file.name || 'upload';
  const ext = (name.split('.').pop() || '').toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'];
  if (!allowed.includes(ext)) return err('Invalid file type', 400, env, req);

  const arrayBuffer = await file.arrayBuffer();
  const mimeType = file.type || 'image/jpeg';
  const filename = `${crypto.randomUUID()}.${ext === 'jpeg' ? 'jpg' : ext}`;
  const key = `media/${filename}`;
  await env.MEDIA.put(key, arrayBuffer, { httpMetadata: { contentType: mimeType } });
  const base = `https://${new URL(req.url).host}`;
  return json({ url: `${base}/media/${filename}`, name, key }, 201, env, req);
}

async function handleMediaDelete(req, env, user) {
  const forbidden = requireRole(user, 'editor', env, req);
  if (forbidden) return forbidden;
  const url = new URL(req.url);
  const key = url.searchParams.get('key');
  if (!key) return err('Missing key', 400, env, req);
  if (!key.startsWith('media/')) return err('Invalid key', 400, env, req);
  await env.MEDIA.delete(key);
  return json({ ok: true }, 200, env, req);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Worker entry
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default {
  async fetch(req, env) {
    const method = req.method.toUpperCase();
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env, req) });
    }

    // Serve media files from R2 (public read)
    if (path.startsWith('/media/')) {
      const key = path.replace('/media/', '');
      const obj = await env.MEDIA.get(`media/${key}`);
      if (!obj) return new Response('Not Found', { status: 404 });
      const headers = new Headers({
        'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        ...corsHeaders(env, req),
      });
      return new Response(obj.body, { headers });
    }

    if (method === 'GET' && path === '/api/health') {
      return json({ ok: true, service: 'ribyon-cms-api' }, 200, env, req);
    }

    // Public login
    if (method === 'POST' && path === '/api/auth/login') return handleLogin(req, env);

    // Everything below requires a token
    const user = await authenticate(req, env);

    if (method === 'GET' && path === '/api/auth/me') {
      if (!user) return err('Unauthorized', 401, env, req);
      return json({ user: { username: user.username, role: user.role } }, 200, env, req);
    }

    if (path === '/api/users') return handleUsers(method, req, env, user);
    if (path === '/api/data') return handleData(method, req, env, user);
    if (path === '/api/media/upload') return handleMediaUpload(req, env, user);
    if (path === '/api/media/delete') return handleMediaDelete(req, env, user);

    return err('Not Found', 404, env, req);
  },
};
