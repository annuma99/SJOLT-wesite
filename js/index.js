/* ╔══════════════════════════════════════════════════════════╗
   ║  CONTENT DATA — Edit this section to update the site!   ║
   ╚══════════════════════════════════════════════════════════╝ */

const DATA = {
  "mission": [
    {
      "icon": "⚖️",
      "title": "Bridging Law & Technology",
      "text": "We publish rigorous scholarship that navigates the legal dimensions of emerging technologies — from AI and data privacy to cybersecurity and intellectual property."
    },
    {
      "icon": "🎓",
      "title": "Student-Driven Scholarship",
      "text": "Founded and operated by Stevens students, SJOLT provides a platform for the next generation of legal-tech thinkers to share original research."
    },
    {
      "icon": "🌐",
      "title": "Open Access",
      "text": "All SJOLT publications are freely available to the public. We believe that cutting-edge legal scholarship should be accessible to everyone."
    }
  ],
  "involved": [
    {
      "icon": "📖",
      "title": "Read the Journal",
      "text": "Explore our published volumes — each article is freely available as a PDF download.",
      "actionLabel": "Browse Latest Volume",
      "actionPage": "volume"
    },
    {
      "icon": "🔗",
      "title": "Join as a Member",
      "text": "Register through Stevens to become a passive member of SJOLT and stay informed on new publications and events.",
      "actionLabel": "Register at Stevens →",
      "actionUrl": "https://stevens.edu"
    },
    {
      "icon": "✉️",
      "title": "Get in Touch",
      "text": "Interested in submitting, collaborating, or learning more about our team? We'd love to hear from you.",
      "actionLabel": "Go to Submissions",
      "actionPage": "submissions"
    }
  ],
  "latestVolume": {
    "number": "Volume I",
    "year": "2024–2025",
    "description": "Our inaugural volume explores foundational questions at the intersection of law, policy, and emerging technology.",
    "articles": [
      {
        "title": "",
        "author": "",
        "affiliation": "",
        "abstract": "",
        "pdfUrl": ""
      }
    ]
  },
  "guidelines": [
    "Manuscripts must be original, unpublished work not under review elsewhere",
    "Submissions should be 8,000–15,000 words including footnotes; shorter Notes (4,000–8,000 words) are also accepted",
    "All citations must comply with The Bluebook (21st edition)",
    "Submissions must be anonymized — remove all identifying author information before upload",
    "Accepted formats: Microsoft Word (.docx) or PDF",
    "Authors will be notified of a decision within 8–10 weeks of submission"
  ],
  "masthead": {
    "editorInChief": {
      "name": "",
      "year": "",
      "bio": "Editor in Chief"
    },
    "submissionEditors": [],
    "articleEditors": []
  }
};
/* ══════════════════ END OF CONTENT DATA ══════════════════════ */


/* ─── RENDER FUNCTIONS ────────────────────────────────────── */

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
}

function colorForName(name) {
  const colors = ['#A32638','#1B3A6B','#2E5FA3','#7A1C2A','#345995'];
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
}

function renderMission() {
  document.getElementById('missionCards').innerHTML = DATA.mission.map(m => `
    <div class="card">
      <div class="card-icon">${m.icon}</div>
      <h3>${m.title}</h3>
      <p>${m.text}</p>
    </div>
  `).join('');
}

function renderInvolved() {
  document.getElementById('involvedCards').innerHTML = DATA.involved.map(c => `
    <div class="card">
      <div class="card-icon">${c.icon}</div>
      <h3>${c.title}</h3>
      <p>${c.text}</p>
      ${c.actionPage
        ? `<button class="card-action" onclick="navigate('${c.actionPage}')">${c.actionLabel}</button>`
        : `<a class="card-action" href="${c.actionUrl}" target="_blank">${c.actionLabel}</a>`
      }
    </div>
  `).join('');
}

function renderVolume() {
  const v = DATA.latestVolume;
  document.getElementById('volumeHeroTitle').textContent = v.number + ' · ' + v.year;
  document.getElementById('volumeHeroSub').textContent = v.description;
  document.getElementById('articleList').innerHTML = v.articles.map((a, i) => `
    <div class="article-item">
      <div>
        <div class="article-meta">Article ${String(i+1).padStart(2,'0')} · ${v.number}</div>
        <div class="article-title">${a.title}</div>
        <div class="article-author">${a.author} — ${a.affiliation}</div>
        <div class="article-abstract">${a.abstract}</div>
      </div>
      <a class="article-download" href="${a.pdfUrl}" download title="Download PDF">
        <span class="article-download-icon">⬇</span>
        PDF
      </a>
    </div>
  `).join('');
}

function renderGuidelines() {
  document.getElementById('guidelinesList').innerHTML = `
    <h3>Author Guidelines</h3>
    <ul>${DATA.guidelines.map(g => `<li>${g}</li>`).join('')}</ul>
  `;
}

function renderMasthead() {
  const m = DATA.masthead;
  const eic = m.editorInChief;
  document.getElementById('mastheadContent').innerHTML = `
    <div class="masthead-section">
      <div class="masthead-role">Editor in Chief</div>
      <div class="masthead-eic">
        <div class="masthead-avatar" style="background:${colorForName(eic.name)}">${initials(eic.name)}</div>
        <div>
          <div class="masthead-name">${eic.name}</div>
          <div class="masthead-title-tag">${eic.year}</div>
        </div>
      </div>
    </div>
    <div class="masthead-section">
      <div class="masthead-role">Submissions Editors</div>
      <div class="masthead-grid">
        ${m.submissionEditors.map(e => `
          <div class="masthead-member">
            <div class="masthead-avatar sm" style="background:${colorForName(e.name)}">${initials(e.name)}</div>
            <div>
              <div class="masthead-name" style="font-size:1rem;">${e.name}</div>
              <div class="masthead-title-tag" style="font-size:0.8rem;">${e.year}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="masthead-section" style="margin-top:40px;">
      <div class="masthead-role">Article Editors</div>
      <div class="masthead-grid">
        ${m.articleEditors.map(e => `
          <div class="masthead-member">
            <div class="masthead-avatar sm" style="background:${colorForName(e.name)}">${initials(e.name)}</div>
            <div>
              <div class="masthead-name" style="font-size:1rem;">${e.name}</div>
              <div class="masthead-title-tag" style="font-size:0.8rem;">${e.year}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ─── NAVIGATION ──────────────────────────────────────────── */

function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
  document.getElementById('page-' + page).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('navLinks').classList.remove('open');
}

document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    navigate(a.dataset.page);
  });
});

document.getElementById('burger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

/* ─── FORMS ───────────────────────────────────────────────── */

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw3F1oBxRvs9xpbjhHPEHgmnkAmg9joMYPHNSCs0LicmOsol1E_fHX0mXihcV6HpOK4rQ/exec';

async function submitForm(type) {
  // Gather fields depending on which form was submitted
  let payload = { formType: type };

  if (type === 'interest') {
    payload = {
      ...payload,
      name:        document.getElementById('if-name').value,
      email:       document.getElementById('if-email').value,
      topic:       document.getElementById('if-topic').value,
      description: document.getElementById('if-desc').value
    };
  } else if (type === 'submission') {
    payload = {
      ...payload,
      firstName:   document.getElementById('sf-fname').value,
      lastName:    document.getElementById('sf-lname').value,
      email:       document.getElementById('sf-email').value,
      institution: document.getElementById('sf-institution').value,
      title:       document.getElementById('sf-title').value,
      abstract:    document.getElementById('sf-abstract').value
    };
  } else if (type === 'editor') {
    payload = {
      ...payload,
      firstName: document.getElementById('ea-fname').value,
      lastName:  document.getElementById('ea-lname').value,
      email:     document.getElementById('ea-email').value,
      year:      document.getElementById('ea-year').value,
      major:     document.getElementById('ea-major').value,
      role:      document.getElementById('ea-role').value,
      why:       document.getElementById('ea-why').value
    };
  }

  try {
    // Apps Script requires no-cors mode because of how Google's CORS headers work
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Show success (we can't read the response in no-cors, but if fetch didn't throw, it sent)
    document.getElementById('success-' + type).style.display = 'block';
    showToast('✓ Form submitted!');
  } catch (err) {
    showToast('Something went wrong. Please try again.');
  }
}

/* ─── INIT ────────────────────────────────────────────────── */
renderMission();
renderInvolved();
renderVolume();
renderGuidelines();
renderMasthead();
