-- Ribyon Studios CMS — Cloudflare D1 Schema
-- Run: npx wrangler d1 execute ribyon-cms-db --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS cms_data (
  id         INTEGER PRIMARY KEY CHECK (id = 1),
  payload    TEXT NOT NULL DEFAULT '{}',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  email         TEXT,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'viewer',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Existing databases (v4 with username-only users): run once to add the email column
-- ALTER TABLE cms_users ADD COLUMN email TEXT;
