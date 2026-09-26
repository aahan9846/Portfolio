// seed.js
// Populates the database with starter content so the site isn't empty on
// first run. Edit the arrays below with your own projects/skills, then run:
//   npm run seed

const db = require('./db');

const projectCount = db.prepare('SELECT COUNT(*) AS c FROM projects').get().c;

if (projectCount === 0) {
  const insertProject = db.prepare(`
    INSERT INTO projects (title, description, tech_stack, repo_url, live_url, image_url, featured, sort_order)
    VALUES (@title, @description, @tech_stack, @repo_url, @live_url, @image_url, @featured, @sort_order)
  `);

  const projects = [
    {
      title: 'Personal Portfolio Website',
      description: 'This site. A full-stack portfolio with an Express API, a SQLite database, and a hand-built frontend — built to showcase projects and skills, and to practice tying a frontend, backend, and database together into one deployed app.',
      tech_stack: 'HTML,CSS,JavaScript,Node.js,Express,SQLite',
      repo_url: '',
      live_url: '',
      image_url: '',
      featured: 1,
      sort_order: 1
    },
    {
      title: 'Task Tracker API',
      description: 'A REST API for managing tasks with due dates and status, backed by a relational database, with full CRUD endpoints and input validation.',
      tech_stack: 'Node.js,Express,PostgreSQL',
      repo_url: '',
      live_url: '',
      image_url: '',
      featured: 0,
      sort_order: 2
    },
    {
      title: 'Weather Dashboard',
      description: 'A small client-side app that fetches live weather data for a searched city and renders a responsive forecast view.',
      tech_stack: 'JavaScript,HTML,CSS,REST API',
      repo_url: '',
      live_url: '',
      image_url: '',
      featured: 0,
      sort_order: 3
    }
  ];

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insertProject.run(row);
  });
  insertMany(projects);
  console.log(`Seeded ${projects.length} projects.`);
}

const skillCount = db.prepare('SELECT COUNT(*) AS c FROM skills').get().c;

if (skillCount === 0) {
  const insertSkill = db.prepare(`
    INSERT INTO skills (name, category, level) VALUES (@name, @category, @level)
  `);

  const skills = [
    { name: 'HTML/CSS', category: 'Frontend', level: 5 },
    { name: 'JavaScript', category: 'Frontend', level: 4 },
    { name: 'React', category: 'Frontend', level: 3 },
    { name: 'Node.js / Express', category: 'Backend', level: 4 },
    { name: 'Python / Flask', category: 'Backend', level: 3 },
    { name: 'SQL (PostgreSQL/MySQL)', category: 'Database', level: 4 },
    { name: 'MongoDB', category: 'Database', level: 3 },
    { name: 'Git & GitHub', category: 'Tooling', level: 4 },
    { name: 'Deployment (Render/Vercel/Netlify)', category: 'Tooling', level: 3 }
  ];

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insertSkill.run(row);
  });
  insertMany(skills);
  console.log(`Seeded ${skills.length} skills.`);
}

console.log('Seed complete.');
