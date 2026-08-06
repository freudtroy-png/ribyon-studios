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
 *   npx wrangler secret put BREVO_API_KEY (Brevo transactional email key)
 */

import { buildEmail, sendBrevo } from './emails.js';

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
    // Defense-in-depth headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'",
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

// Respond with JSON, optionally attaching extra headers (e.g. Set-Cookie).
function jsonEx(data, status = 200, env, req, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...corsHeaders(env, req),
      ...extraHeaders,
    },
  });
}

// ── HttpOnly session cookies ──
const SESSION_COOKIE = 'rs_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// SameSite=None; Secure so the cookie can be sent from the Vercel CMS origin
// (https://ribyon-cms.vercel.app) to the worker origin over cross-site XHR.
function sessionCookieHeader(token) {
  const base = `${SESSION_COOKIE}=${encodeURIComponent(token || '')}; Path=/; HttpOnly; SameSite=None; Secure`;
  return token ? `${base}; Max-Age=${SESSION_MAX_AGE}` : `${base}; Max-Age=0`;
}

function readCookie(req, name) {
  const c = req.headers.get('Cookie') || '';
  for (const part of c.split(';')) {
    const idx = part.indexOf('=');
    if (idx > -1 && part.slice(0, idx).trim() === name) {
      try { return decodeURIComponent(part.slice(idx + 1).trim()); } catch (e) { return ''; }
    }
  }
  return '';
}

// Normalize one or many base64 attachments into Brevo's `attachment` shape.
function normalizeAttachments(att) {
  if (att == null) return undefined;
  const list = Array.isArray(att) ? att : [att];
  const out = list
    .filter((a) => a && a.name && a.content)
    .map((a) => ({
      name: String(a.name).slice(0, 160),
      content: String(a.content),
      type: a.type || 'application/octet-stream',
    }));
  return out.length ? out : undefined;
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
  let token = h.replace(/^Bearer\s+/i, '').trim();

  // Session-cookie fallback (HttpOnly cookie set at login).
  if (!token) token = readCookie(req, SESSION_COOKIE);
  if (!token) return null;

  // Master ADMIN_TOKEN grants superadmin (kept out of the client — server-only secret).
  if (env.ADMIN_TOKEN && constantTimeEq(token, env.ADMIN_TOKEN)) {
    return { username: 'admin', role: 'superadmin', master: true };
  }

  // Otherwise verify the JWT
  const payload = await verifyJWT(token, env.JWT_SECRET || 'dev-jwt-secret');
  if (!payload) return null;
  return { username: payload.sub, role: payload.role || 'viewer' };
}

// Portal token: JWT signed with scope "portal" — carries client identity.
async function authenticatePortal(req, env) {
  const h = req.headers.get('Authorization') || '';
  const token = h.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const payload = await verifyJWT(token, env.JWT_SECRET || 'dev-jwt-secret');
  if (!payload || payload.scope !== 'portal') return null;
  return { email: payload.sub, cid: payload.cid, cname: payload.cname };
}

function portalToken(user, env) {
  const payload = {
    sub: user.email, scope: 'portal', cid: user.client_id, cname: user.client_name,
    iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  };
  return signJWT(payload, env.JWT_SECRET || 'dev-jwt-secret');
}

async function loadBlob(env) {
  const row = await env.DB.prepare('SELECT payload FROM cms_data WHERE id=1').first();
  let data = {};
  try { if (row && row.payload) data = JSON.parse(row.payload); } catch (e) { data = {}; }
  return data;
}

async function saveBlob(env, data) {
  const payload = JSON.stringify(data);
  await env.DB.prepare(
    'INSERT INTO cms_data (id, payload, updated_at) VALUES (1, ?, datetime(\'now\')) ' +
    'ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at'
  ).bind(payload).run();
}

function inviteUrl(env, token) {
  const host = (env.PORTAL_URL || 'https://ribyon-portal.vercel.app').replace(/\/$/, '');
  return `${host}/?invite=${token}`;
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
    return jsonEx({ token, user: { username: 'admin', email: 'freudtroy@gmail.com', role: 'superadmin' } }, 200, env, req, { 'Set-Cookie': sessionCookieHeader(token) });
  }

  const row = await env.DB.prepare('SELECT username, email, password_hash, role FROM cms_users WHERE LOWER(email) = ? OR LOWER(username) = ?').bind(identifier, identifier).first();
  if (!row) return err('Invalid credentials', 401, env, req);
  const ok = await verifyPassword(body.password, row.password_hash);
  if (!ok) return err('Invalid credentials', 401, env, req);

  const payload = { sub: row.username, role: row.role, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 };
  const token = await signJWT(payload, env.JWT_SECRET || 'dev-jwt-secret');
  return jsonEx({ token, user: { username: row.username, email: row.email, role: row.role } }, 200, env, req, { 'Set-Cookie': sessionCookieHeader(token) });
}

async function handleLogout(req, env) {
  return jsonEx({ ok: true }, 200, env, req, { 'Set-Cookie': sessionCookieHeader('') });
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
// ─── File scanning (magic-byte + content sniffing before storage) ───
// Returns { ok:true, mime } or { ok:false, error }. Rejects content whose magic
// bytes do not match the declared extension, and blocks executable/embeddable
// payloads regardless of extension. Defense-in-depth pre-store scan (not a
// full AV engine — pair with a real scanner for high-risk use).
function asciiSlice(buf, start, end) { return Buffer.from(new Uint8Array(buf, start, Math.min(end, buf.byteLength))).toString('latin1'); }

async function scanFileBytes(mimeType, ext, buf) {
  const head8 = asciiSlice(buf, 0, 32);
  const fullAscii = asciiSlice(buf, 0, 4096);

  // Always-block executable / script / wasm magic no matter the claimed ext.
  const BLOCK = [
    { name: 'Windows PE/executable', sig: 'MZ' },
    { name: 'ELF binary', sig: '\x7FELF' },
    { name: 'Mach-O binary', sig: '\xFE\xED\xFA\xCE' },
    { name: 'Java class', sig: '\xCA\xFE\xBA\xBE' },
    { name: 'WebAssembly', sig: '\x00asm' },
    { name: 'shell script', sig: '#!' },
  ];
  for (const b of BLOCK) {
    if (head8.slice(0, b.sig.length) === b.sig) return { ok: false, error: `Blocked: ${b.name} content is not allowed` };
  }

  // For anything that should be an image, reject embedded HTML/JS regardless.
  const isHtmlLike = /<(script|body|html|!DOCTYPE)/i.test(head8);

  // Extension-driven magic-byte matching.
  function matched(rule) {
    const [sig, kind] = rule;
    if (kind === 'latin1') return head8.slice(0, sig.length) === sig;
    const off = rule[2] || 0;
    const need = sig.length;
    if (buf.byteLength < off + need) return false;
    const u = new Uint8Array(buf, off, need);
    return sig.every((v, i) => u[i] === v);
  }

  // SVG: must contain <svg>, must NOT contain scripts / event handlers / javascript:.
  if (ext === 'svg') {
    const body = asciiSlice(buf, 0, 16384);
    if (!/<svg/i.test(body)) return { ok: false, error: 'Invalid SVG (no <svg> root element)' };
    if (/<script|onload\s*=|onerror\s*=|onclick\s*=|onmouseover\s*=|\bjavascript\s*:/i.test(body)) {
      return { ok: false, error: 'SVG cannot contain scripts or event handlers' };
    }
    // Fuzz the MIME even if the client lied.
    return { ok: true, mime: 'image/svg+xml' };
  }

  // Text-ish files: reject HTML/script smuggling.
  if (ext === 'txt' || ext === 'csv') {
    const body = asciiSlice(buf, 0, 4096);
    if (/<script|<!doctype\s+html|<html\b|<body\b/i.test(body)) {
      return { ok: false, error: 'Blocked: HTML/script content is not allowed in text files' };
    }
    return { ok: true, mime: (mimeType && mimeType !== 'application/octet-stream') ? mimeType : (ext === 'csv' ? 'text/csv' : 'text/plain') };
  }

  // Binary formats: require matching magic bytes, and reject embedded HTML/JS.
  const sigs = signaturesFor(ext);
  if (sigs) {
    const any = sigs.some((s) => matched(s));
    if (!any) return { ok: false, error: `File content does not match expected "${ext}" format (possible spoof or corruption)` };
  } else if (isHtmlLike) {
    return { ok: false, error: 'Blocked: HTML/script content is not allowed for this file type' };
  }

  // Mime tightening for known formats.
  const mimeFor = {
    pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    png: 'image/png', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif',
    zip: 'application/zip',
  };
  return { ok: true, mime: mimeFor[ext] || mimeType || 'application/octet-stream' };

  function signaturesFor(e) {
    switch (e) {
      case 'pdf': return [['%PDF-', 'latin1']];
      case 'jpg': case 'jpeg': return [[[0xFF, 0xD8, 0xFF], 'bytes']];
      case 'png': return [[[0x89, 0x50, 0x4E, 0x47], 'bytes']];
      case 'gif': return [[[0x47, 0x49, 0x46, 0x38], 'bytes']];
      case 'webp': return [[[0x52, 0x49, 0x46, 0x46], 'bytes', 0], [[0x57, 0x45, 0x42, 0x50], 'bytes', 8]];
      case 'avif': return [[[0x00, 0x00, 0x00], 'bytes', 0], [[0x66, 0x74, 0x79, 0x70], 'bytes', 4]];
      case 'doc': return [[[0xD0, 0xCF, 0x11, 0xE0], 'bytes']];
      case 'zip': case 'docx': case 'xlsx': case 'pptx': return [[[0x50, 0x4B, 0x03, 0x04], 'bytes']];
      case 'ppt': return [[[0xD0, 0xCF, 0x11, 0xE0], 'bytes']];
      case 'xls': return [[[0xD0, 0xCF, 0x11, 0xE0], 'bytes']];
      default: return null;
    }
  }
}

async function handleMediaUpload(req, env, user) {
  const forbidden = requireRole(user, 'editor', env, req);
  if (forbidden) return forbidden;

  let form;
  try { form = await req.formData(); } catch (e) { return err('Invalid form', 400, env, req); }
  const file = form.get('file');
  if (!file) return err('No file provided', 400, env, req);

  const name = file.name || 'upload';
  const ext = (name.split('.').pop() || '').toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'txt', 'csv'];
  if (!allowed.includes(ext)) return err('Invalid file type', 400, env, req);

  // Size limit (25 MB) — reject without reading a huge body into memory.
  const MAX = 25 * 1024 * 1024;
  if (file.size > MAX) return err('File too large (max 25 MB)', 413, env, req);

  const arrayBuffer = await file.arrayBuffer();
  const scan = await scanFileBytes(file.type, ext, arrayBuffer);
  if (!scan.ok) return err(scan.error || 'File scan failed', 400, env, req);

  const mimeType = scan.mime || file.type || 'application/octet-stream';
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

// ─── Email (via Resend if env.RESEND_API_KEY is set) ───
async function handleSendEmail(req, env, user) {
  const forbidden = requireRole(user, 'editor', env, req);
  if (forbidden) return forbidden;
  const body = await safeJSON(req);
  if (!body || !body.to) return err('recipient required', 400, env, req);
  const sender = env.EMAIL_FROM || 'ribyonstudios@gmail.com';
  const senderName = env.EMAIL_FROM_NAME || 'Ribyon Studios';

  // Scenario mode: body.template selects a designed template; data fills it.
  if (body.template) {
    const scenario = String(body.template);
    const { subject, html } = buildEmail(scenario, body.data || body.params || {});
    const res = await sendBrevo(env, {
      to: String(body.to),
      toName: (body.data && body.data.clientName) || body.toName || '',
      subject,
      html,
      text: body.text,
      replyTo: body.replyTo,
      tags: ['ribyon', scenario],
      attachments: normalizeAttachments(body.attachment || body.attachments),
    });
    if (!res.ok) {
      const msg = (res.body && res.body.message) || 'Email provider error';
      return err(msg, res.status || 502, env, req);
    }
    return json({ ok: true, messageId: res.body.messageId }, 200, env, req);
  }

  // Legacy/raw mode: free-form subject + text / html.
  const subject = String(body.subject || 'Message from Ribyon Studios').slice(0, 300);
  const text = String(body.text || '');
  const res = await sendBrevo(env, {
    to: String(body.to),
    toName: body.toName || '',
    subject,
    html: body.html,
    text,
    replyTo: body.replyTo,
    tags: body.tags || ['ribyon'],
    attachments: normalizeAttachments(body.attachment || body.attachments),
  });
  if (!res.ok) {
    const msg = (res.body && res.body.message) || 'Email provider error';
    return err(msg, res.status || 502, env, req);
  }
  return json({ ok: true, messageId: res.body.messageId }, 200, env, req);
}

// Generate an .ics calendar invite that the browser can download.
function icsTimestamp(d) {
  let x;
  try { x = new Date(d); } catch (e) { return ''; }
  if (isNaN(x.getTime())) return '';
  return x.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
async function handleCalendar(req, env, user) {
  const forbidden = requireRole(user, 'editor', env, req);
  if (forbidden) return forbidden;
  const url = new URL(req.url);
  const summary = url.searchParams.get('summary') || 'Ribyon event';
  const description = url.searchParams.get('description') || '';
  const location = url.searchParams.get('location') || '';
  const start = icsTimestamp(url.searchParams.get('start'));
  const end = icsTimestamp(url.searchParams.get('end')) || start;
  if (!start) return err('start date required (ISO)', 400, env, req);
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ribyon//Calendar//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${crypto.randomUUID()}@ribyonstudios`,
    `DTSTAMP:${now}`, `DTSTART:${start}`, `DTEND:${end}`,
    `SUMMARY:${summary.replace(/[;,]/g, '\\$&')}`,
    description ? `DESCRIPTION:${description.replace(/[;,]/g, '\\$&')}` : '',
    location ? `LOCATION:${location.replace(/[,;]/g, '\\$&')}` : '',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
  return new Response(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ribyon-event.ics"',
      'Cache-Control': 'no-store',
      ...corsHeaders(env, req),
    },
  });
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Client Portal (portal_accounts + scoped data)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function handlePortalInvite(req, env, user) {
  // superadmin or admin can create invites
  const forbidden = requireRole(user, 'admin', env, req);
  if (forbidden) return forbidden;
  const body = await safeJSON(req);
  if (!body || !body.email) return err('email required', 400, env, req);
  const email = String(body.email).toLowerCase().trim();
  const clientName = String(body.clientName || email.split('@')[0]).trim();

  const existing = await env.DB.prepare('SELECT id, status, invite_token FROM portal_accounts WHERE LOWER(email) = ?').bind(email).first();
  const token = crypto.randomUUID().replace(/-/g, '').slice(0, 24);
  if (existing) {
    await env.DB.prepare('UPDATE portal_accounts SET client_name = ?, invite_token = ?, status = \'invited\' WHERE id = ?').bind(clientName, token, existing.id).run();
  } else {
    // Dummy hash placeholder — password set on accept.
    await env.DB.prepare('INSERT INTO portal_accounts (client_id, client_name, email, password_hash, invite_token, status) VALUES (?, ?, ?, \'!\', ?, \'invited\')')
      .bind(body.clientId || null, clientName, email, token).run();
  }
  const url = inviteUrl(env, token);
  if (env.BREVO_API_KEY) {
    // fire-and-forget branded invite email (don't block on provider)
    const built = buildEmail('invite', { clientName, email, inviteUrl: url });
    sendBrevo(env, { to: email, toName: clientName, subject: built.subject, html: built.html, tags: ['ribyon', 'invite'] }).catch(function () {});
  }
  return json({ ok: true, invite: token, url, email }, 200, env, req);
}

async function handlePortalList(req, env, user) {
  const forbidden = requireRole(user, 'admin', env, req);
  if (forbidden) return forbidden;
  const { results } = await env.DB.prepare('SELECT id, client_id, client_name, email, status, created_at, last_login FROM portal_accounts ORDER BY id DESC').all();
  return json({ accounts: results }, 200, env, req);
}

async function handlePortalDelete(req, env, user) {
  const forbidden = requireRole(user, 'admin', env, req);
  if (forbidden) return forbidden;
  const url = new URL(req.url);
  const id = Number(url.searchParams.get('id'));
  if (!id) return err('Missing id', 400, env, req);
  await env.DB.prepare('DELETE FROM portal_accounts WHERE id = ?').bind(id).run();
  return json({ ok: true }, 200, env, req);
}

async function handlePortalAccept(req, env) {
  const body = await safeJSON(req);
  if (!body || !body.invite || !body.password || !body.email) return err('invite, email and password required', 400, env, req);
  if (String(body.password).length < 6) return err('Password must be at least 6 characters', 400, env, req);
  const email = String(body.email).toLowerCase().trim();
  const row = await env.DB.prepare('SELECT id, client_id, client_name, email, invite_token, status FROM portal_accounts WHERE LOWER(email) = ?').bind(email).first();
  if (!row) return err('No invite found for this email', 404, env, req);
  if (!constantTimeEq(String(body.invite), row.invite_token || '')) return err('Invalid invite code', 401, env, req);
  if (row.status === 'active') return err('Account already active — sign in', 400, env, req);
  const passwordHash = await hashPassword(body.password);
  await env.DB.prepare('UPDATE portal_accounts SET password_hash = ?, status = \'active\', last_login = datetime(\'now\') WHERE id = ?').bind(passwordHash, row.id).run();
  const token = await portalToken({ email: row.email, client_id: row.client_id, client_name: row.client_name }, env);
  return json({ ok: true, token, client: { name: row.client_name, email: row.email } }, 200, env, req);
}

async function handlePortalLogin(req, env) {
  const body = await safeJSON(req);
  if (!body || !body.email || !body.password) return err('Email and password required', 400, env, req);
  const email = String(body.email).toLowerCase().trim();
  const row = await env.DB.prepare('SELECT id, client_id, client_name, email, password_hash, status FROM portal_accounts WHERE LOWER(email) = ?').bind(email).first();
  if (!row) return err('Invalid credentials', 401, env, req);
  if (row.status !== 'active') return err('Account not activated — use your invite link', 403, env, req);
  const ok = await verifyPassword(body.password, row.password_hash);
  if (!ok) return err('Invalid credentials', 401, env, req);
  await env.DB.prepare('UPDATE portal_accounts SET last_login = datetime(\'now\') WHERE id = ?').bind(row.id).run();
  const token = await portalToken({ email: row.email, client_id: row.client_id, client_name: row.client_name }, env);
  return json({ token, client: { name: row.client_name, email: row.email } }, 200, env, req);
}

// Scoped data for one client: projects/invoices/media/messages where client matches.
function clientMatch(record, cname) {
  if (!record || !cname) return false;
  const a = String(record.client || '').trim().toLowerCase();
  const b = String(cname).trim().toLowerCase();
  return a === b;
}

async function handlePortalData(req, env, portal) {
  const data = await loadBlob(env);
  const cname = portal.cname;
  const projects = (data.projects || []).filter(p => clientMatch(p, cname));
  const invoices = (data.invoices || []).filter(i => clientMatch(i, cname));
  const media = (data.media || []).filter(m => clientMatch(m, cname));
  const messages = (data.messages || []).filter(m => clientMatch(m, cname));
  const feed = (data.feed || []).filter(f => clientMatch(f, cname)).slice(-50).reverse();
  const clients = data.clients || [];
  const client = clients.find(c => String(c.name).trim().toLowerCase() === String(cname).trim().toLowerCase()) || { name: cname, email: '', phone: '', logo: '', displayName: '' };
  return json({ client, projects, invoices, media, messages, feed }, 200, env, req);
}

// Client-uploaded file to R2, tagged with the client's name so the admin sees it.
async function handlePortalUpload(req, env, portal) {
  if (!portal.cname) return err('Unauthorized', 401, env, req);
  let form;
  try { form = await req.formData(); } catch (e) { return err('Invalid form', 400, env, req); }
  const file = form.get('file');
  if (!file) return err('No file provided', 400, env, req);
  const name = file.name || 'upload';
  const ext = (name.split('.').pop() || '').toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'txt', 'csv'];
  if (!allowed.includes(ext)) return err('Invalid file type', 400, env, req);
  if (file.size > 25 * 1024 * 1024) return err('File too large (max 25 MB)', 413, env, req);
  const arrayBuffer = await file.arrayBuffer();
  const scan = await scanFileBytes(file.type, ext, arrayBuffer);
  if (!scan.ok) return err(scan.error || 'File scan failed', 400, env, req);
  const mimeType = scan.mime || file.type || 'application/octet-stream';
  const filename = `${crypto.randomUUID()}.${ext === 'jpeg' ? 'jpg' : ext}`;
  const key = `media/${filename}`;
  await env.MEDIA.put(key, arrayBuffer, { httpMetadata: { contentType: mimeType } });
  const base = `https://${new URL(req.url).host}`;
  const data = await loadBlob(env);
  if (!data.media) data.media = [];
  data.media.push({
    id: data.media.length ? Math.max(...data.media.map(m => m.id)) + 1 : 1,
    name,
    url: `${base}/media/${filename}`,
    key,
    data: '',
    date: new Date().toISOString().slice(0, 10),
    client: portal.cname,
    fromPortal: true,
  });
  await saveBlob(env, data);
  return json({ url: `${base}/media/${filename}`, name, key, client: portal.cname }, 201, env, req);
}

async function handlePortalMessage(req, env, portal) {
  const body = await safeJSON(req);
  if (!body || !body.text) return err('text required', 400, env, req);
  const text = String(body.text).slice(0, 2000);
  const data = await loadBlob(env);
  if (!data.messages) data.messages = [];
  data.messages.push({ id: data.messages.length ? Math.max(...data.messages.map(m => m.id)) + 1 : 1, client: portal.cname, from: 'client', text, date: new Date().toISOString(), read: false });
  addFeed(data, portal.cname, 'message', 'Sent a message');
  await saveBlob(env, data);
  return json({ ok: true }, 200, env, req);
}

async function handlePortalReply(req, env, user) {
  const forbidden = requireRole(user, 'admin', env, req);
  if (forbidden) return forbidden;
  const body = await safeJSON(req);
  if (!body || !body.client || !body.text) return err('client and text required', 400, env, req);
  const text = String(body.text).slice(0, 2000);
  const data = await loadBlob(env);
  if (!data.messages) data.messages = [];
  data.messages.push({ id: data.messages.length ? Math.max(...data.messages.map(m => m.id)) + 1 : 1, client: String(body.client), from: 'ribyon', text, date: new Date().toISOString(), read: true, clientRead: false });
  addFeed(data, String(body.client), 'message', 'Ribyon replied');
  await saveBlob(env, data);
  return json({ ok: true }, 200, env, req);
}

// Mark a client's messages as read by the admin (or a client's thread read by the client).
async function handlePortalRead(req, env, portal) {
  const body = await safeJSON(req);
  const data = await loadBlob(env);
  const cname = portal.cname;
  const markClient = body && body.mark === 'client'; // client read the ribyon replies
  let changed = false;
  (data.messages || []).forEach(m => {
    if (!clientMatch(m, cname)) return;
    if (markClient) {
      if (m.from === 'ribyon' && !m.clientRead) { m.clientRead = true; changed = true; }
    } else {
      if (m.from === 'client' && !m.read) { m.read = true; changed = true; }
    }
  });
  if (changed) await saveBlob(env, data);
  return json({ ok: true }, 200, env, req);
}

// Admin marks a client's inbound messages as read.
async function handlePortalMarkRead(req, env, user) {
  const forbidden = requireRole(user, 'admin', env, req);
  if (forbidden) return forbidden;
  const body = await safeJSON(req);
  if (!body || !body.client) return err('client required', 400, env, req);
  const data = await loadBlob(env);
  const cname = String(body.client);
  let changed = false;
  (data.messages || []).forEach(m => {
    if (clientMatch(m, cname) && m.from === 'client' && !m.read) { m.read = true; changed = true; }
  });
  if (changed) await saveBlob(env, data);
  return json({ ok: true }, 200, env, req);
}

async function handlePortalApprove(req, env, portal) {  const body = await safeJSON(req);
  if (!body || !body.projectId) return err('projectId required', 400, env, req);
  const data = await loadBlob(env);
  const p = (data.projects || []).find(pr => pr.id === Number(body.projectId) && clientMatch(pr, portal.cname));
  if (!p) return err('Project not found', 404, env, req);
  p.approved = body.approved === true ? 'approved' : 'rejected';
  p.approvedAt = new Date().toISOString();
  if (!data.messages) data.messages = [];
  data.messages.push({ id: data.messages.length ? Math.max(...data.messages.map(m => m.id)) + 1 : 1, client: portal.cname, from: 'client', text: body.approved === true ? 'Approved deliverable: ' + p.title : 'Requested changes on: ' + p.title + (body.note ? ' — ' + body.note : ''), date: new Date().toISOString(), read: false });
  addFeed(data, portal.cname, 'approval', body.approved === true ? 'Approved deliverable: ' + p.title : 'Requested changes on: ' + p.title);
  await saveBlob(env, data);
  return json({ ok: true }, 200, env, req);
}

// Append an entry to the per-client activity feed (kept inside the same blob).
function addFeed(data, cname, type, text) {
  if (!data.feed) data.feed = [];
  data.feed.push({ id: data.feed.length ? Math.max(...data.feed.map(f => f.id)) + 1 : 1, client: cname, type, text, date: new Date().toISOString() });
  if (data.feed.length > 300) data.feed = data.feed.slice(-300);
}

// Pay an invoice (records a full-balance payment in the portal).
async function handlePortalPay(req, env, portal) {
  const body = await safeJSON(req);
  if (!body || !body.invoiceId) return err('invoiceId required', 400, env, req);
  const data = await loadBlob(env);
  const inv = (data.invoices || []).find(i => i.id === Number(body.invoiceId) && clientMatch(i, portal.cname));
  if (!inv) return err('Invoice not found', 404, env, req);
  const total = inv.total !== undefined ? inv.total : (inv.amount || 0);
  const paid = (inv.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const bal = Math.max(0, total - paid);
  if (bal <= 0) return err('Invoice already paid', 400, env, req);
  if (!inv.payments) inv.payments = [];
  inv.payments.push({ amount: bal, date: new Date().toISOString(), method: 'portal' });
  inv.status = 'paid';
  inv.balance = 0;
  addFeed(data, portal.cname, 'payment', 'Paid ' + (inv.number || 'invoice') + ' — ' + bal.toLocaleString() + ' ' + (inv.currency || 'KSh'));
  await saveBlob(env, data);
  return json({ ok: true }, 200, env, req);
}

// Approve / request changes on a single milestone.
async function handlePortalMilestone(req, env, portal) {
  const body = await safeJSON(req);
  if (!body || !body.projectId || body.milestoneIndex === undefined) return err('projectId and milestoneIndex required', 400, env, req);
  const data = await loadBlob(env);
  const p = (data.projects || []).find(pr => pr.id === Number(body.projectId) && clientMatch(pr, portal.cname));
  if (!p) return err('Project not found', 404, env, req);
  const m = (p.milestones || [])[Number(body.milestoneIndex)];
  if (!m) return err('Milestone not found', 404, env, req);
  m.approved = body.approved === true ? 'approved' : 'rejected';
  m.approvedAt = new Date().toISOString();
  addFeed(data, portal.cname, 'milestone', (m.approved === 'approved' ? 'Approved milestone: ' : 'Requested changes on milestone: ') + (m.label || m.title || ''));
  await saveBlob(env, data);
  return json({ ok: true }, 200, env, req);
}

// Client submits a new project / quote request from the portal.
async function handlePortalRequest(req, env, portal) {
  const body = await safeJSON(req);
  if (!body || !body.title) return err('title required', 400, env, req);
  const title = String(body.title).slice(0, 160);
  const details = String(body.details || '').slice(0, 2000);
  const data = await loadBlob(env);
  if (!data.inquiries) data.inquiries = [];
  data.inquiries.push({ id: data.inquiries.length ? Math.max(...data.inquiries.map(i => i.id)) + 1 : 1, name: portal.cname, email: portal.email, subject: title, message: details, status: 'new', date: new Date().toISOString().split('T')[0], source: 'portal' });
  addFeed(data, portal.cname, 'request', 'Requested a new project: ' + title);
  await saveBlob(env, data);
  return json({ ok: true }, 200, env, req);
}

// Update client profile (phone, display name, prefs) + optional password change.
async function handlePortalProfile(req, env, portal) {
  const body = await safeJSON(req) || {};
  const data = await loadBlob(env);
  const cname = portal.cname;
  const client = (data.clients || []).find(c => String(c.name).trim().toLowerCase() === String(cname).trim().toLowerCase());
  if (client) {
    if (body.phone !== undefined) client.phone = String(body.phone).slice(0, 40);
    if (body.name !== undefined && String(body.name).trim()) client.displayName = String(body.name).slice(0, 80);
    if (body.prefs && typeof body.prefs === 'object') client.prefs = Object.assign(client.prefs || {}, body.prefs);
  }
  if (body.password && String(body.password).length >= 6) {
    const hash = await hashPassword(body.password, null);
    await env.DB.prepare('UPDATE portal_accounts SET password_hash = ? WHERE LOWER(email) = ?').bind(hash, String(portal.email).toLowerCase()).run();
  }
  addFeed(data, cname, 'profile', 'Updated profile');
  await saveBlob(env, data);
  return json({ ok: true, client: client || { name: cname, phone: '', displayName: '' } }, 200, env, req);
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

    // Public login / logout
    if (method === 'POST' && path === '/api/auth/login') return handleLogin(req, env);
    if (method === 'POST' && path === '/api/auth/logout') return handleLogout(req, env);

    // Client portal — public endpoints
    if (method === 'POST' && path === '/api/portal/accept') return handlePortalAccept(req, env);
    if (method === 'POST' && path === '/api/portal/login') return handlePortalLogin(req, env);

    // Client portal — admin endpoints
    if (path === '/api/portal/invite') return handlePortalInvite(req, env, await authenticate(req, env));
    if (path === '/api/portal/accounts') {
      const admin = await authenticate(req, env);
      if (method === 'GET') return handlePortalList(req, env, admin);
      if (method === 'DELETE') return handlePortalDelete(req, env, admin);
    }

    // Client portal — authenticated client endpoints
    const portal = await authenticatePortal(req, env);
    if (portal && path === '/api/portal/data' && method === 'GET') return handlePortalData(req, env, portal);
    if (portal && path === '/api/portal/message' && method === 'POST') return handlePortalMessage(req, env, portal);
    if (portal && path === '/api/portal/read' && method === 'POST') return handlePortalRead(req, env, portal);
    if (portal && path === '/api/portal/upload' && method === 'POST') return handlePortalUpload(req, env, portal);
    if (portal && path === '/api/portal/approve' && method === 'POST') return handlePortalApprove(req, env, portal);
    if (portal && path === '/api/portal/pay' && method === 'POST') return handlePortalPay(req, env, portal);
    if (portal && path === '/api/portal/milestone' && method === 'POST') return handlePortalMilestone(req, env, portal);
    if (portal && path === '/api/portal/request' && method === 'POST') return handlePortalRequest(req, env, portal);
    if (portal && path === '/api/portal/profile' && method === 'POST') return handlePortalProfile(req, env, portal);

    // Client portal — admin replies to a client's thread
    if (path === '/api/portal/reply' && method === 'POST') return handlePortalReply(req, env, await authenticate(req, env));
    if (path === '/api/portal/markread' && method === 'POST') return handlePortalMarkRead(req, env, await authenticate(req, env));

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
    if (path === '/api/email/send') return handleSendEmail(req, env, user);
    if (path === '/api/calendar/ics') return handleCalendar(req, env, user);

    return err('Not Found', 404, env, req);
  },
};
