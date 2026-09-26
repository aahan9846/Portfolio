// script.js — talks to the Express API and renders the dynamic sections.

async function loadProjects() {
  const list = document.getElementById('project-list');
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Request failed');
    const projects = await res.json();

    if (projects.length === 0) {
      list.innerHTML = '<p class="loading">No projects yet — add one via the API.</p>';
      return;
    }

    list.innerHTML = projects.map(renderProjectCard).join('');
  } catch (err) {
    list.innerHTML = '<p class="loading">Couldn\'t load projects right now.</p>';
    console.error(err);
  }
}

function renderProjectCard(p) {
  const links = [];
  if (p.live_url) links.push(`<a href="${escapeAttr(p.live_url)}" target="_blank" rel="noopener">Live site</a>`);
  if (p.repo_url) links.push(`<a href="${escapeAttr(p.repo_url)}" target="_blank" rel="noopener">Source</a>`);

  return `
    <article class="project-card ${p.featured ? 'featured' : ''}">
      <div>
        <div class="project-title-row">
          <h3>${escapeHtml(p.title)}</h3>
          ${p.featured ? '<span class="badge">Featured</span>' : ''}
        </div>
        <p>${escapeHtml(p.description)}</p>
        <ul class="tech-tags">
          ${p.tech_stack.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
        </ul>
      </div>
      <div class="project-links">${links.join('')}</div>
    </article>
  `;
}

async function loadSkills() {
  const grid = document.getElementById('skills-grid');
  try {
    const res = await fetch('/api/skills');
    if (!res.ok) throw new Error('Request failed');
    const skills = await res.json();

    if (skills.length === 0) {
      grid.innerHTML = '<p class="loading">No skills listed yet.</p>';
      return;
    }

    const byCategory = {};
    for (const s of skills) {
      (byCategory[s.category] = byCategory[s.category] || []).push(s);
    }

    grid.innerHTML = Object.entries(byCategory)
      .map(
        ([category, items]) => `
        <div class="skill-group">
          <h3>${escapeHtml(category)}</h3>
          ${items
            .map(
              (s) => `
            <div class="skill-row">
              <span>${escapeHtml(s.name)}</span>
              <span class="skill-dots">
                ${[1, 2, 3, 4, 5].map((n) => `<span class="dot ${n <= s.level ? 'on' : ''}"></span>`).join('')}
              </span>
            </div>`
            )
            .join('')}
        </div>`
      )
      .join('');
  } catch (err) {
    grid.innerHTML = '<p class="loading">Couldn\'t load skills right now.</p>';
    console.error(err);
  }
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Sending…';
    status.className = 'form-status';

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim()
    };

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Send failed');
      }
      status.textContent = 'Message sent — thanks, I\'ll reply by email.';
      form.reset();
    } catch (err) {
      status.textContent = err.message || 'Something went wrong. Please try again.';
      status.className = 'form-status error';
    }
  });
}

function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(str = '') {
  return escapeHtml(str);
}

loadProjects();
loadSkills();
setupContactForm();
