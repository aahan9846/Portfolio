// db.js
// Sets up a local SQLite database file (portfolio.db) and creates the
// tables the app needs the first time it runs. SQLite keeps this project
// dependency-free for local dev; swap this file for a Postgres/MySQL/Mongo
// client later without touching server.js's route logic much, since all
// queries are isolated here.

const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'portfolio.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tech_stack TEXT NOT NULL,       -- comma-separated, e.g. "React,Node.js,PostgreSQL"
    repo_url TEXT,
    live_url TEXT,
    image_url TEXT,
    featured INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,          -- e.g. "Frontend", "Backend", "Database", "Tooling"
    level INTEGER NOT NULL DEFAULT 3 -- 1-5
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
