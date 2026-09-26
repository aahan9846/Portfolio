// server.js
// Express backend for the portfolio. Serves the static frontend from
// /public and exposes a small REST API backed by SQLite (see db.js).
//
// Run locally:   npm install && npm run seed && npm start
// Then visit:    http://localhost:3000

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change-me';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Simple admin guard for write operations -------------------------------
// Send header  x-admin-token: <ADMIN_TOKEN>  to create/update/delete.
// This is intentionally minimal (no user accounts) since the site has a
// single owner; swap in real auth if you add multiple editors.
function requireAdmin(req, res, next) {
  const token = req.header('x-admin-token');
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid admin token.' });
  }
  next();
}

function toProjectView(row) {
  return {
    ...row,
    tech_stack: row.tech_stack ? row.tech_stack.split(',').map((s) => s.trim()) : [],
    featured: Boolean(row.featured)
  };
}

// --- Projects ----------------------------------------------------------
app.get('/api/projects', (req, res) => {
  const rows = db.prepare('SELECT * FROM projects ORDER BY featured DESC, sort_order ASC, id DESC').all();
  res.json(rows.map(toProjectView));
});

app.get('/api/projects/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Project not found.' });
  res.json(toProjectView(row));
});

app.post('/api/projects', requireAdmin, (req, res) => {
  const { title, description, tech_stack, repo_url, live_url, image_url, featured, sort_order } = req.body;
  if (!title || !description || !tech_stack) {
    return res.status(400).json({ error: 'title, description, and tech_stack are required.' });
  }
  const stmt = db.prepare(`
    INSERT INTO projects (title, description, tech_stack, repo_url, live_url, image_url, featured, sort_order)
    VALUES (@title, @description, @tech_stack, @repo_url, @live_url, @image_url, @featured, @sort_order)
  `);
  const info = stmt.run({
    title,
    description,
    tech_stack: Array.isArray(tech_stack) ? tech_stack.join(',') : tech_stack,
    repo_url: repo_url || '',
    live_url: live_url || '',
    image_url: image_url || '',
    featured: featured ? 1 : 0,
    sort_order: sort_order || 0
  });
  const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(toProjectView(created));
});

app.put('/api/projects/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Project not found.' });

  const merged = { ...existing, ...req.body };
  merged.tech_stack = Array.isArray(merged.tech_stack) ? merged.tech_stack.join(',') : merged.tech_stack;
  merged.featured = merged.featured ? 1 : 0;

  db.prepare(`
    UPDATE projects SET title=@title, description=@description, tech_stack=@tech_stack,
      repo_url=@repo_url, live_url=@live_url, image_url=@image_url,
      featured=@featured, sort_order=@sort_order
    WHERE id=@id
  `).run(merged);

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  res.json(toProjectView(updated));
});

app.delete('/api/projects/:id', requireAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Project not found.' });
  res.status(204).end();
});

// --- Skills --------------------------------------------------------------
app.get('/api/skills', (req, res) => {
  const rows = db.prepare('SELECT * FROM skills ORDER BY category ASC, level DESC').all();
  res.json(rows);
});

// --- Contact messages ------------------------------------------------------
app.post('/api/messages', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required.' });
  }
  const info = db.prepare('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)').run(name, email, message);
  res.status(201).json({ id: info.lastInsertRowid, ok: true });
});

app.get('/api/messages', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM messages ORDER BY id DESC').all();
  res.json(rows);
});

// --- Health check for hosting platforms ------------------------------------
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Fallback to index.html for any non-API route (simple SPA-friendly routing)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
});
