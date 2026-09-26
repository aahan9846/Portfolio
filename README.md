# Personal Portfolio Website

A full-stack portfolio: a static HTML/CSS/JS frontend served by an
Express backend, backed by a SQLite database. Meets the brief's key
features — frontend, backend, database, and a path to deployment — in one
small, easy-to-read codebase you can extend.

```
portfolio-project/
├── public/            frontend (served as static files)
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js           Express app + REST API routes
├── db.js               SQLite connection + schema
├── seed.js             one-time starter data (projects & skills)
├── package.json
└── .env.example
```

## 1. Run it locally

Requires Node.js 18+.

```bash
npm install
cp .env.example .env      # then edit ADMIN_TOKEN to your own secret
npm run seed               # loads a few starter projects & skills
npm start
```

Visit **http://localhost:3000**.

For auto-restart on file changes during development:

```bash
npm run dev
```

## 2. How the pieces fit together

- **Frontend** (`public/`) is plain HTML/CSS/JS. `script.js` calls the API
  with `fetch()` and renders the Projects and Skills sections dynamically,
  and posts the contact form to the API.
- **Backend** (`server.js`) is an Express app that serves the static
  frontend and exposes a JSON REST API under `/api/*`.
- **Database** (`db.js`) is SQLite via `better-sqlite3`, stored in a local
  `portfolio.db` file with three tables: `projects`, `skills`, `messages`.

## 3. API reference

| Method | Route              | Auth        | Description                     |
|--------|--------------------|-------------|----------------------------------|
| GET    | `/api/projects`    | —           | List all projects                |
| GET    | `/api/projects/:id`| —           | Get one project                  |
| POST   | `/api/projects`    | admin token | Create a project                 |
| PUT    | `/api/projects/:id`| admin token | Update a project                 |
| DELETE | `/api/projects/:id`| admin token | Delete a project                 |
| GET    | `/api/skills`      | —           | List all skills                  |
| POST   | `/api/messages`    | —           | Submit the contact form          |
| GET    | `/api/messages`    | admin token | List contact submissions         |
| GET    | `/api/health`      | —           | Health check (used by hosts)     |

Admin routes require a header: `x-admin-token: <ADMIN_TOKEN>` (set in `.env`).

Example — add a project from the command line:

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your-token-here" \
  -d '{
    "title": "E-commerce Cart API",
    "description": "REST API for a shopping cart with JWT auth.",
    "tech_stack": ["Node.js", "Express", "MongoDB"],
    "repo_url": "https://github.com/you/cart-api",
    "featured": true
  }'
```

## 4. Customize

- Edit `seed.js` with your real projects/skills, then re-run `npm run seed`
  (or use the admin API above once deployed).
- Edit the "About" section copy directly in `public/index.html`.
- Colors, fonts, and spacing are all defined as CSS custom properties at
  the top of `public/style.css`.

## 5. Deploying

This app needs a **persistent Node process** (not a static host), because
it runs Express and reads/writes a SQLite file. Two good free-tier options:

### Option A — Render (recommended, simplest)
1. Push this project to a GitHub repo.
2. On [render.com](https://render.com), create a **New Web Service** from
   that repo.
3. Build command: `npm install`. Start command: `npm start`.
4. Add an environment variable `ADMIN_TOKEN` with your own secret.
5. Deploy. Render gives you a live URL.

> Note: Render's free tier disks are ephemeral on redeploy — for a
> production site, either re-run `npm run seed` after deploys, or swap
> SQLite for a hosted database (see below).

### Option B — Railway
Same idea as Render: connect the repo, set `ADMIN_TOKEN`, it detects
`npm start` automatically and deploys.

### Netlify / Vercel note
Netlify and Vercel are built for static sites and serverless functions,
not a long-running Express server with a local SQLite file. If you want
to deploy there, you'd deploy `public/` as the static site and rewrite
`server.js`'s routes as serverless functions backed by a hosted database
(e.g. **Neon** or **Supabase** for Postgres, **MongoDB Atlas** for Mongo)
instead of SQLite — a natural next step once you outgrow a single-file
database.

## 6. Swapping the database

All database access is isolated in `db.js` and the route handlers in
`server.js`. To move to PostgreSQL or MongoDB:
1. Replace `db.js` with a client for that database (e.g. `pg` or
   `mongodb`).
2. Update the SQL/queries in `server.js`'s route handlers to match — the
   route paths, request/response shapes, and frontend don't need to
   change.
