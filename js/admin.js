// ════════════════════════════════════════════════════════════
//  STATE — this mirrors the DATA object in index.js
// ════════════════════════════════════════════════════════════
const DEFAULTS = {
  latestVolume: {
    number: "Volume I",
    year: "2024–2025",
    description: "Our inaugural volume explores foundational questions at the intersection of law, policy, and emerging technology.",
    articles: []
  },
  masthead: {
    editorInChief: { name: "", year: "" },
    submissionEditors: [],
    articleEditors: []
  },
  guidelines: [
    "Manuscripts must be original, unpublished work not under review elsewhere",
    "Submissions should be 8,000–15,000 words including footnotes; shorter Notes (4,000–8,000 words) are also accepted",
    "All citations must comply with The Bluebook (21st edition)",
    "Submissions must be anonymized — remove all identifying author information before upload",
    "Accepted formats: Microsoft Word (.docx) or PDF",
    "Authors will be notified of a decision within 8–10 weeks of submission"
  ],
  settings: {
    registrationUrl: "https://stevens.edu",
    contactEmail: "sjolt@stevens.edu"
  }
};

let S = JSON.parse(JSON.stringify(DEFAULTS));

// ════════════════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════════════════
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

async function login() {
  const pw = document.getElementById('pwInput').value.trim();
  if (!pw) return;
  const hash = await sha256(pw);
  const stored = localStorage.getItem('sjolt_pw_hash');

  let valid = false;
  if (stored) {
    valid = (hash === stored);
  } else {
    const defaultHash = await sha256('sjolt2025');
    if (hash === defaultHash) {
      localStorage.setItem('sjolt_pw_hash', defaultHash);
      valid = true;
    }
  }

  if (valid) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDash').style.display = 'block';
    loadState();
    renderAll();
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
}

function logout() {
  saveState();
  document.getElementById('adminDash').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('pwInput').value = '';
}

// ════════════════════════════════════════════════════════════
//  STATE PERSISTENCE
// ════════════════════════════════════════════════════════════
function saveState() {
  localStorage.setItem('sjolt_admin_state', JSON.stringify(S));
}

function loadState() {
  const raw = localStorage.getItem('sjolt_admin_state');
  if (raw) {
    try { S = JSON.parse(raw); } catch(e) { S = JSON.parse(JSON.stringify(DEFAULTS)); }
  }
}

function saveAndToast() {
  saveState();
  toast('Progress saved!', 'success');
}

// ════════════════════════════════════════════════════════════
//  TAB SWITCHING
// ════════════════════════════════════════════════════════════
function switchTab(name, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  el.classList.add('active');
  const content = document.getElementById('tab-' + name);
  content.style.display = 'block';
  if (name === 'articles')   renderArticles();
  if (name === 'masthead')   renderMasthead();
  if (name === 'guidelines') renderGuidelines();
  if (name === 'settings')   renderSettings();
}

// ════════════════════════════════════════════════════════════
//  RENDER — ARTICLES TAB
// ════════════════════════════════════════════════════════════
function renderArticles() {
  const v = S.latestVolume;
  let html = `
    <div class="info-box">
      <strong>How this works:</strong> Fill in the volume details and add each article below.
      For the PDF, drag and drop your PDF file onto the upload zone — the filename will be used
      as the path (e.g. <code>articles/yourfile.pdf</code>). Place PDFs in an <code>articles/</code>
      folder next to <code>index.html</code> before deploying. When done, hit <strong>Save Progress</strong>
      then <strong>Export index.js</strong>.
    </div>

    <div class="section-label">Volume Info</div>
    <div class="field-row">
      <div class="field">
        <label>Volume Number</label>
        <input id="vol-number" value="${esc(v.number)}" placeholder="e.g. Volume I" />
      </div>
      <div class="field">
        <label>Academic Year</label>
        <input id="vol-year" value="${esc(v.year)}" placeholder="e.g. 2024–2025" />
      </div>
    </div>
    <div class="field">
      <label>Volume Description (shows under the header)</label>
      <textarea id="vol-desc" rows="2">${esc(v.description)}</textarea>
    </div>

    <div class="section-label" style="margin-top:32px;">
      Articles
      <button class="btn-add" onclick="addArticle()">+ Add Article</button>
    </div>
    <div id="articlesList">
  `;

  if (v.articles.length === 0) {
    html += `<div style="color:var(--muted); font-style:italic; padding:16px 0;">
      No articles yet. Click "+ Add Article" to get started.
    </div>`;
  }

  v.articles.forEach((a, i) => {
    const hasFile = !!a.pdfUrl && a.pdfUrl !== '';
    html += `
      <div class="card-editor" id="article-card-${i}">
        <div class="card-editor-header">
          <span>Article ${i + 1}${a.title ? ': ' + a.title : ''}</span>
          <button class="btn-remove" onclick="removeArticle(${i})">✕ Remove</button>
        </div>
        <div class="field">
          <label>Title</label>
          <input value="${esc(a.title)}"
            onchange="S.latestVolume.articles[${i}].title=this.value; refreshArticleHeader(${i}, this.value)" />
        </div>
        <div class="field-row">
          <div class="field">
            <label>Author Full Name</label>
            <input value="${esc(a.author)}"
              onchange="S.latestVolume.articles[${i}].author=this.value" />
          </div>
          <div class="field">
            <label>Author Affiliation</label>
            <input value="${esc(a.affiliation)}"
              placeholder="Stevens Institute of Technology, '25"
              onchange="S.latestVolume.articles[${i}].affiliation=this.value" />
          </div>
        </div>
        <div class="field">
          <label>Abstract</label>
          <textarea rows="4"
            onchange="S.latestVolume.articles[${i}].abstract=this.value">${esc(a.abstract)}</textarea>
        </div>

        <div class="field">
          <label>PDF File</label>
          <div class="pdf-drop-zone ${hasFile ? 'dz-ready' : ''}"
            id="pdf-dz-${i}"
            ondragover="pdfDzOver(event, ${i})"
            ondragleave="pdfDzLeave(event, ${i})"
            ondrop="pdfDzDrop(event, ${i})"
            onclick="document.getElementById('pdf-input-${i}').click()">
            <div class="pdf-drop-icon" id="pdf-dz-icon-${i}">${hasFile ? '✅' : '📄'}</div>
            <div class="pdf-drop-label" id="pdf-dz-label-${i}">
              ${hasFile ? 'PDF attached' : 'Drop PDF here, or click to browse'}
            </div>
            ${hasFile ? `<div class="pdf-drop-filename" id="pdf-dz-name-${i}">${esc(a.pdfUrl)}</div>` : `<div class="pdf-drop-filename" id="pdf-dz-name-${i}" style="display:none;"></div>`}
            <div class="pdf-drop-path" id="pdf-dz-path-${i}">
              ${hasFile ? 'Will be served from <code>articles/</code> folder' : 'Place the PDF in an <code>articles/</code> folder next to <code>index.html</code>'}
            </div>
            <input type="file" id="pdf-input-${i}" accept=".pdf" style="display:none;"
              onchange="pdfPicked(this, ${i})" />
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  document.getElementById('tab-articles').innerHTML = html;
}

// ── PDF Drag & Drop handlers ──────────────────────────────

function pdfDzOver(e, i) {
  e.preventDefault();
  document.getElementById('pdf-dz-' + i).classList.add('dz-over');
}

function pdfDzLeave(e, i) {
  document.getElementById('pdf-dz-' + i).classList.remove('dz-over');
}

function pdfDzDrop(e, i) {
  e.preventDefault();
  document.getElementById('pdf-dz-' + i).classList.remove('dz-over');
  const file = e.dataTransfer.files[0];
  if (file) acceptPdf(file, i);
}

function pdfPicked(input, i) {
  if (input.files[0]) acceptPdf(input.files[0], i);
}

function acceptPdf(file, i) {
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    toast('Please drop a .pdf file.', 'error');
    return;
  }
  const path = 'articles/' + file.name;
  S.latestVolume.articles[i].pdfUrl = path;

  const dz = document.getElementById('pdf-dz-' + i);
  dz.classList.remove('dz-over');
  dz.classList.add('dz-ready');
  document.getElementById('pdf-dz-icon-' + i).textContent = '✅';
  document.getElementById('pdf-dz-label-' + i).textContent = 'PDF attached';
  const nameEl = document.getElementById('pdf-dz-name-' + i);
  nameEl.textContent = path;
  nameEl.style.display = 'block';
  document.getElementById('pdf-dz-path-' + i).innerHTML = 'Will be served from <code>articles/</code> folder';
}

// ─────────────────────────────────────────────────────────

function addArticle() {
  collectArticleFields();
  S.latestVolume.articles.push({ title: '', author: '', affiliation: '', abstract: '', pdfUrl: '' });
  renderArticles();
  setTimeout(() => {
    const cards = document.querySelectorAll('.card-editor');
    if (cards.length) cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}

function removeArticle(i) {
  if (!confirm(`Remove Article ${i + 1}? This can't be undone until you reload.`)) return;
  S.latestVolume.articles.splice(i, 1);
  renderArticles();
}

function refreshArticleHeader(i, title) {
  const header = document.querySelector(`#article-card-${i} .card-editor-header span`);
  if (header) header.textContent = `Article ${i + 1}${title ? ': ' + title : ''}`;
}

function collectArticleFields() {
  const v = document.getElementById('vol-number');
  const y = document.getElementById('vol-year');
  const d = document.getElementById('vol-desc');
  if (v) S.latestVolume.number = v.value;
  if (y) S.latestVolume.year = y.value;
  if (d) S.latestVolume.description = d.value;
}

// ════════════════════════════════════════════════════════════
//  RENDER — MASTHEAD TAB
// ════════════════════════════════════════════════════════════
function renderMasthead() {
  const m = S.masthead;
  let html = `
    <div class="info-box">
      <strong>Tip:</strong> Update this whenever editors join or leave, or at the start of each academic year.
      The colored avatar circles on the public site generate automatically from each person's name.
    </div>

    <div class="section-label">Editor in Chief</div>
    <div class="eic-card">
      <div>
        <label>Full Name</label>
        <input id="eic-name" value="${esc(m.editorInChief.name)}"
          placeholder="First Last"
          onchange="S.masthead.editorInChief.name=this.value" />
      </div>
      <div>
        <label>Class Year</label>
        <input id="eic-year" value="${esc(m.editorInChief.year)}"
          placeholder="Class of '25"
          onchange="S.masthead.editorInChief.year=this.value" />
      </div>
    </div>

    <div class="section-label" style="margin-top:28px;">
      Submissions Editors
      <button class="btn-add" onclick="addEditor('submission')">+ Add</button>
    </div>
    <div id="subEditorsList">
  `;

  if (m.submissionEditors.length === 0) {
    html += `<div style="color:var(--muted); font-style:italic; padding:8px 0;">None added yet.</div>`;
  }
  m.submissionEditors.forEach((e, i) => { html += personRow('sub', i, e); });

  html += `
    </div>
    <div class="section-label" style="margin-top:28px;">
      Article Editors
      <button class="btn-add" onclick="addEditor('article')">+ Add</button>
    </div>
    <div id="artEditorsList">
  `;

  if (m.articleEditors.length === 0) {
    html += `<div style="color:var(--muted); font-style:italic; padding:8px 0;">None added yet.</div>`;
  }
  m.articleEditors.forEach((e, i) => { html += personRow('art', i, e); });

  html += `</div>`;
  document.getElementById('tab-masthead').innerHTML = html;
}

function personRow(type, i, e) {
  const arr = type === 'sub' ? 'submissionEditors' : 'articleEditors';
  return `
    <div class="person-row">
      <input value="${esc(e.name)}" placeholder="Full Name"
        onchange="S.masthead.${arr}[${i}].name=this.value" />
      <input class="year-field" value="${esc(e.year)}" placeholder="Class of '26"
        onchange="S.masthead.${arr}[${i}].year=this.value" />
      <button class="btn-remove" onclick="removeEditor('${type}', ${i})">✕</button>
    </div>
  `;
}

function addEditor(type) {
  const arr = type === 'sub' ? 'submissionEditors' : 'articleEditors';
  S.masthead[arr].push({ name: '', year: '' });
  renderMasthead();
}

function removeEditor(type, i) {
  const arr = type === 'sub' ? 'submissionEditors' : 'articleEditors';
  S.masthead[arr].splice(i, 1);
  renderMasthead();
}

// ════════════════════════════════════════════════════════════
//  RENDER — GUIDELINES TAB
// ════════════════════════════════════════════════════════════
function renderGuidelines() {
  let html = `
    <div class="info-box">
      <strong>Submission Guidelines</strong> appear as a bulleted list on the Submissions page.
      Edit any line, or add/remove as needed.
    </div>
    <div class="section-label">
      Guidelines
      <button class="btn-add" onclick="addGuideline()">+ Add Line</button>
    </div>
    <div id="guidelineRows">
  `;

  S.guidelines.forEach((g, i) => {
    html += `
      <div class="guideline-row">
        <input value="${esc(g)}" placeholder="Guideline text..."
          onchange="S.guidelines[${i}]=this.value" />
        <button class="btn-remove" onclick="removeGuideline(${i})">✕</button>
      </div>
    `;
  });

  html += `</div>`;
  document.getElementById('tab-guidelines').innerHTML = html;
}

function addGuideline() {
  S.guidelines.push('');
  renderGuidelines();
  setTimeout(() => {
    const rows = document.querySelectorAll('.guideline-row input');
    if (rows.length) rows[rows.length - 1].focus();
  }, 50);
}

function removeGuideline(i) {
  S.guidelines.splice(i, 1);
  renderGuidelines();
}

// ════════════════════════════════════════════════════════════
//  RENDER — SETTINGS TAB
// ════════════════════════════════════════════════════════════
function renderSettings() {
  const st = S.settings;
  document.getElementById('tab-settings').innerHTML = `
    <div class="settings-block">
      <h3>Site Links</h3>
      <div class="field">
        <label>Stevens Registration URL</label>
        <input id="set-regUrl" value="${esc(st.registrationUrl)}"
          placeholder="https://stevens.edu/..."
          onchange="S.settings.registrationUrl=this.value" />
        <div class="field-hint">This is the link on the "Join as a Member" card and hero button.</div>
      </div>
      <div class="field">
        <label>Contact Email</label>
        <input id="set-email" value="${esc(st.contactEmail)}"
          placeholder="sjolt@stevens.edu"
          onchange="S.settings.contactEmail=this.value" />
        <div class="field-hint">Shown in the site footer.</div>
      </div>
      <button class="btn-action btn-action-blue" onclick="saveAndToast()">Save</button>
    </div>

    <div class="settings-block">
      <h3>Change Admin Password</h3>
      <div class="field">
        <label>New Password</label>
        <input type="password" id="new-pw" placeholder="Enter new password" />
      </div>
      <div class="field">
        <label>Confirm New Password</label>
        <input type="password" id="confirm-pw" placeholder="Repeat new password" />
      </div>
      <button class="btn-action btn-action-primary" onclick="changePassword()">Update Password</button>
      <div id="pw-msg" style="margin-top:10px; font-size:0.83rem;"></div>
    </div>

    <div class="settings-block">
      <h3>Backup &amp; Restore</h3>
      <p style="font-size:0.88rem; color:var(--muted); margin-bottom:16px;">
        Download a backup of your admin data (useful when switching computers).
        Restore by uploading a backup file.
      </p>
      <div style="display:flex; gap:12px; flex-wrap:wrap;">
        <button class="btn-action btn-action-blue" onclick="backupData()">⬇ Download Backup</button>
        <label class="btn-action btn-action-primary" style="cursor:pointer;">
          ⬆ Restore from Backup
          <input type="file" accept=".json" onchange="restoreData(this)" style="display:none;" />
        </label>
      </div>
    </div>
  `;
}

async function changePassword() {
  const np = document.getElementById('new-pw').value;
  const cp = document.getElementById('confirm-pw').value;
  const msg = document.getElementById('pw-msg');
  if (!np) { msg.textContent = 'Please enter a new password.'; msg.style.color = 'var(--red)'; return; }
  if (np !== cp) { msg.textContent = 'Passwords do not match.'; msg.style.color = 'var(--red)'; return; }
  if (np.length < 6) { msg.textContent = 'Password must be at least 6 characters.'; msg.style.color = 'var(--red)'; return; }
  const hash = await sha256(np);
  localStorage.setItem('sjolt_pw_hash', hash);
  msg.textContent = '✓ Password updated successfully.';
  msg.style.color = 'var(--green)';
  document.getElementById('new-pw').value = '';
  document.getElementById('confirm-pw').value = '';
}

function backupData() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `sjolt-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  toast('Backup downloaded!', 'success');
}

function restoreData(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      S = parsed;
      saveState();
      renderAll();
      toast('Data restored from backup!', 'success');
    } catch(err) {
      toast('Invalid backup file.', 'error');
    }
  };
  reader.readAsText(file);
}

// ════════════════════════════════════════════════════════════
//  RENDER ALL
// ════════════════════════════════════════════════════════════
function renderAll() {
  renderArticles();
  renderMasthead();
  renderGuidelines();
  renderSettings();
}

// ════════════════════════════════════════════════════════════
//  EXPORT — generates and downloads a new index.js
// ════════════════════════════════════════════════════════════
function openExportModal() {
  collectAllFields();
  document.getElementById('exportModal').classList.add('open');
}

function closeExportModal() {
  document.getElementById('exportModal').classList.remove('open');
}

function collectAllFields() {
  const vn = document.getElementById('vol-number');
  const vy = document.getElementById('vol-year');
  const vd = document.getElementById('vol-desc');
  if (vn) S.latestVolume.number      = vn.value;
  if (vy) S.latestVolume.year        = vy.value;
  if (vd) S.latestVolume.description = vd.value;

  const ru = document.getElementById('set-regUrl');
  const em = document.getElementById('set-email');
  if (ru) S.settings.registrationUrl = ru.value;
  if (em) S.settings.contactEmail    = em.value;
}

function exportSite() {
  collectAllFields();
  saveState();
  closeExportModal();

  const newData = buildDataObject();

  // Build a new index.js with the updated DATA block
  const output =
`/* ╔══════════════════════════════════════════════════════════╗
   ║  CONTENT DATA — Edit this section to update the site!   ║
   ╚══════════════════════════════════════════════════════════╝ */

const DATA = ${JSON.stringify(newData, null, 2)};
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
  document.getElementById('missionCards').innerHTML = DATA.mission.map(m => \`
    <div class="card">
      <div class="card-icon">\${m.icon}</div>
      <h3>\${m.title}</h3>
      <p>\${m.text}</p>
    </div>
  \`).join('');
}

function renderInvolved() {
  document.getElementById('involvedCards').innerHTML = DATA.involved.map(c => \`
    <div class="card">
      <div class="card-icon">\${c.icon}</div>
      <h3>\${c.title}</h3>
      <p>\${c.text}</p>
      \${c.actionPage
        ? \`<button class="card-action" onclick="navigate('\${c.actionPage}')">\${c.actionLabel}</button>\`
        : \`<a class="card-action" href="\${c.actionUrl}" target="_blank">\${c.actionLabel}</a>\`
      }
    </div>
  \`).join('');
}

function renderVolume() {
  const v = DATA.latestVolume;
  document.getElementById('volumeHeroTitle').textContent = v.number + ' · ' + v.year;
  document.getElementById('volumeHeroSub').textContent = v.description;
  document.getElementById('articleList').innerHTML = v.articles.map((a, i) => \`
    <div class="article-item">
      <div>
        <div class="article-meta">Article \${String(i+1).padStart(2,'0')} · \${v.number}</div>
        <div class="article-title">\${a.title}</div>
        <div class="article-author">\${a.author} — \${a.affiliation}</div>
        <div class="article-abstract">\${a.abstract}</div>
      </div>
      <a class="article-download" href="\${a.pdfUrl}" download title="Download PDF">
        <span class="article-download-icon">⬇</span>
        PDF
      </a>
    </div>
  \`).join('');
}

function renderGuidelines() {
  document.getElementById('guidelinesList').innerHTML = \`
    <h3>Author Guidelines</h3>
    <ul>\${DATA.guidelines.map(g => \`<li>\${g}</li>\`).join('')}</ul>
  \`;
}

function renderMasthead() {
  const m = DATA.masthead;
  const eic = m.editorInChief;
  document.getElementById('mastheadContent').innerHTML = \`
    <div class="masthead-section">
      <div class="masthead-role">Editor in Chief</div>
      <div class="masthead-eic">
        <div class="masthead-avatar" style="background:\${colorForName(eic.name)}">\${initials(eic.name)}</div>
        <div>
          <div class="masthead-name">\${eic.name}</div>
          <div class="masthead-title-tag">\${eic.year}</div>
        </div>
      </div>
    </div>
    <div class="masthead-section">
      <div class="masthead-role">Submissions Editors</div>
      <div class="masthead-grid">
        \${m.submissionEditors.map(e => \`
          <div class="masthead-member">
            <div class="masthead-avatar sm" style="background:\${colorForName(e.name)}">\${initials(e.name)}</div>
            <div>
              <div class="masthead-name" style="font-size:1rem;">\${e.name}</div>
              <div class="masthead-title-tag" style="font-size:0.8rem;">\${e.year}</div>
            </div>
          </div>
        \`).join('')}
      </div>
    </div>
    <div class="masthead-section" style="margin-top:40px;">
      <div class="masthead-role">Article Editors</div>
      <div class="masthead-grid">
        \${m.articleEditors.map(e => \`
          <div class="masthead-member">
            <div class="masthead-avatar sm" style="background:\${colorForName(e.name)}">\${initials(e.name)}</div>
            <div>
              <div class="masthead-name" style="font-size:1rem;">\${e.name}</div>
              <div class="masthead-title-tag" style="font-size:0.8rem;">\${e.year}</div>
            </div>
          </div>
        \`).join('')}
      </div>
    </div>
  \`;
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

// ── Paste your Apps Script URL here ──────────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/a/macros/stevens.edu/s/AKfycbziElN6e24rL70CG8vmC1-xTKZ8Axz9zHAcNStmupEkeGciOsIzN6wi_wuyEuV7p4E4Yg/exec';

async function submitForm(type) {
  let data = {};

  if (type === 'interest') {
    data = {
      formType:    'interest',
      name:        document.getElementById('if-name').value,
      email:       document.getElementById('if-email').value,
      topic:       document.getElementById('if-topic').value,
      description: document.getElementById('if-desc').value
    };
  }

  else if (type === 'submission') {
    data = {
      formType:    'submission',
      firstName:   document.getElementById('sf-fname').value,
      lastName:    document.getElementById('sf-lname').value,
      email:       document.getElementById('sf-email').value,
      institution: document.getElementById('sf-institution').value,
      title:       document.getElementById('sf-title').value,
      abstract:    document.getElementById('sf-abstract').value
    };
  }

  else if (type === 'editor') {
    data = {
      formType:  'editor',
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
    // Note: mode 'no-cors' is required here — see explanation below
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode:   'no-cors',
      body:   JSON.stringify(data)
    });

    document.getElementById('success-' + type).style.display = 'block';
    showToast('✓ Submitted successfully!');

  } catch (err) {
    showToast('Something went wrong. Please try again.');
    console.error(err);
  }
}

/* ─── INIT ────────────────────────────────────────────────── */
renderMission();
renderInvolved();
renderVolume();
renderGuidelines();
renderMasthead();
`;

  const blob = new Blob([output], { type: 'application/javascript' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'index.js';
  a.click();

  toast('index.js exported! Replace the old file with this one.', 'success');
}

function buildDataObject() {
  return {
    mission: [
      {
        icon: "⚖️",
        title: "Bridging Law & Technology",
        text: "We publish rigorous scholarship that navigates the legal dimensions of emerging technologies — from AI and data privacy to cybersecurity and intellectual property."
      },
      {
        icon: "🎓",
        title: "Student-Driven Scholarship",
        text: "Founded and operated by Stevens students, SJOLT provides a platform for the next generation of legal-tech thinkers to share original research."
      },
      {
        icon: "🌐",
        title: "Open Access",
        text: "All SJOLT publications are freely available to the public. We believe that cutting-edge legal scholarship should be accessible to everyone."
      }
    ],
    involved: [
      {
        icon: "📖",
        title: "Read the Journal",
        text: "Explore our published volumes — each article is freely available as a PDF download.",
        actionLabel: "Browse Latest Volume",
        actionPage: "volume"
      },
      {
        icon: "🔗",
        title: "Join as a Member",
        text: "Register through Stevens to become a passive member of SJOLT and stay informed on new publications and events.",
        actionLabel: "Register at Stevens →",
        actionUrl: S.settings.registrationUrl
      },
      {
        icon: "✉️",
        title: "Get in Touch",
        text: "Interested in submitting, collaborating, or learning more about our team? We'd love to hear from you.",
        actionLabel: "Go to Submissions",
        actionPage: "submissions"
      }
    ],
    latestVolume: {
      number:      S.latestVolume.number,
      year:        S.latestVolume.year,
      description: S.latestVolume.description,
      articles:    S.latestVolume.articles
    },
    guidelines: S.guidelines,
    masthead: {
      editorInChief: {
        name: S.masthead.editorInChief.name,
        year: S.masthead.editorInChief.year,
        bio:  "Editor in Chief"
      },
      submissionEditors: S.masthead.submissionEditors,
      articleEditors:    S.masthead.articleEditors
    }
  };
}

// ════════════════════════════════════════════════════════════
//  UTILITIES
// ════════════════════════════════════════════════════════════
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

let toastTimer;
function toast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.className = '', 3500);
}

// Allow pressing Enter in login
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('pwInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') login();
  });
});
