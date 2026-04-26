<!DOCTYPE html>

<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portfolio Builder</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap');

:root {
–bg: #111110;
–bg2: #191917;
–bg3: #222220;
–border: #2e2e2b;
–border-light: #3a3a37;
–text: #e8e6e0;
–text-muted: #888882;
–accent: #c8c4b8;
–accent2: #6b6960;
–grain-opacity: 0.035;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
background: var(–bg);
color: var(–text);
font-family: ‘DM Sans’, sans-serif;
font-weight: 300;
min-height: 100vh;
position: relative;
overflow-x: hidden;
}

/* Grain overlay */
body::before {
content: ‘’;
position: fixed;
inset: 0;
pointer-events: none;
z-index: 9999;
opacity: var(–grain-opacity);
background-image: url(“data:image/svg+xml,%3Csvg viewBox=‘0 0 512 512’ xmlns=‘http://www.w3.org/2000/svg’%3E%3Cfilter id=‘noise’%3E%3CfeTurbulence type=‘fractalNoise’ baseFrequency=‘0.9’ numOctaves=‘4’ stitchTiles=‘stitch’/%3E%3C/filter%3E%3Crect width=‘100%25’ height=‘100%25’ filter=‘url(%23noise)’/%3E%3C/svg%3E”);
background-size: 200px 200px;
}

/* ── Admin Toolbar ── */
#admin-bar {
position: fixed;
top: 20px;
right: 20px;
z-index: 10000;
display: flex;
gap: 8px;
align-items: center;
background: rgba(17,17,16,0.92);
border: 1px solid var(–border-light);
padding: 10px 14px;
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
}

.admin-btn {
background: transparent;
border: 1px solid var(–border-light);
color: var(–text-muted);
font-family: ‘DM Sans’, sans-serif;
font-size: 10px;
font-weight: 500;
letter-spacing: 0.12em;
text-transform: uppercase;
padding: 7px 13px;
cursor: pointer;
transition: all 0.2s;
white-space: nowrap;
}
.admin-btn:hover { border-color: var(–accent); color: var(–text); }
.admin-btn.active { border-color: var(–accent); color: var(–text); background: rgba(200,196,184,0.07); }
.admin-btn.export-btn { color: var(–accent); border-color: var(–accent); }
.admin-btn.export-btn:hover { background: var(–accent); color: var(–bg); }

.edit-indicator {
width: 6px; height: 6px;
border-radius: 50%;
background: #888882;
flex-shrink: 0;
transition: background 0.3s;
}
.edit-indicator.on { background: #a8c090; box-shadow: 0 0 6px #a8c09066; }

/* ── Page Header ── */
#page-header {
padding: 80px 60px 60px;
border-bottom: 1px solid var(–border);
max-width: 1400px;
margin: 0 auto;
}

.page-title-wrap { margin-bottom: 6px; }

[contenteditable] {
outline: none;
transition: background 0.2s;
border-radius: 2px;
}

body.edit-mode [contenteditable]:hover {
background: rgba(200,196,184,0.04);
}
body.edit-mode [contenteditable]:focus {
background: rgba(200,196,184,0.07);
box-shadow: 0 0 0 1px var(–border-light);
}
body:not(.edit-mode) [contenteditable] {
pointer-events: none;
}

.portfolio-name {
font-family: ‘Cormorant Garamond’, serif;
font-size: clamp(2.8rem, 6vw, 5.5rem);
font-weight: 300;
line-height: 0.95;
letter-spacing: -0.02em;
color: var(–text);
display: block;
min-width: 40px;
min-height: 1em;
}
.portfolio-tagline {
font-size: 11px;
letter-spacing: 0.18em;
text-transform: uppercase;
color: var(–text-muted);
margin-top: 16px;
display: block;
min-width: 60px;
min-height: 1em;
}

/* ── Sections ── */
.sections-wrap {
max-width: 1400px;
margin: 0 auto;
padding: 0 60px 120px;
}

.portfolio-section {
padding: 72px 0;
border-bottom: 1px solid var(–border);
position: relative;
}
.portfolio-section:last-child { border-bottom: none; }

.section-header {
display: flex;
align-items: baseline;
gap: 24px;
margin-bottom: 48px;
}

.section-index {
font-size: 10px;
letter-spacing: 0.2em;
color: var(–accent2);
text-transform: uppercase;
flex-shrink: 0;
font-weight: 500;
margin-top: 4px;
}

.section-title {
font-family: ‘Cormorant Garamond’, serif;
font-size: clamp(1.6rem, 3vw, 2.8rem);
font-weight: 300;
letter-spacing: -0.01em;
color: var(–text);
min-width: 80px;
min-height: 1em;
line-height: 1.1;
}

.section-desc {
font-size: 13px;
line-height: 1.75;
color: var(–text-muted);
max-width: 540px;
margin-top: 14px;
min-height: 1em;
min-width: 80px;
}

/* ── Image Grid ── */
.images-row {
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 12px;
margin-bottom: 12px;
}

.image-slot {
position: relative;
aspect-ratio: 3/4;
background: var(–bg2);
border: 1px solid var(–border);
overflow: hidden;
cursor: pointer;
transition: border-color 0.2s;
}

.image-slot:hover { border-color: var(–border-light); }
body.edit-mode .image-slot:hover { border-color: var(–accent2); }

.image-slot img {
width: 100%; height: 100%;
object-fit: cover;
display: block;
transition: opacity 0.4s;
}

.upload-placeholder {
position: absolute;
inset: 0;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
gap: 10px;
pointer-events: none;
}
.upload-placeholder svg {
opacity: 0.25;
transition: opacity 0.2s;
}
body.edit-mode .image-slot:hover .upload-placeholder svg { opacity: 0.45; }

.upload-placeholder span {
font-size: 9px;
letter-spacing: 0.2em;
text-transform: uppercase;
color: var(–accent2);
opacity: 0;
transition: opacity 0.2s;
}
body.edit-mode .image-slot:hover .upload-placeholder span { opacity: 1; }

.slot-has-image .upload-placeholder { display: none; }

.drag-over { border-color: var(–accent) !important; background: rgba(200,196,184,0.04) !important; }

.image-slot input[type=file] { display: none; }

/* ── Captions row ── */
.captions-row {
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 12px;
margin-bottom: 40px;
}
.img-caption {
font-size: 10px;
letter-spacing: 0.12em;
text-transform: uppercase;
color: var(–accent2);
padding: 8px 2px 0;
min-height: 1.4em;
min-width: 30px;
line-height: 1.6;
}

/* ── Video Slot ── */
.video-outer {
position: relative;
}

.video-slot {
position: relative;
width: 100%;
aspect-ratio: 16/7;
background: var(–bg2);
border: 1px solid var(–border);
overflow: hidden;
transition: border-color 0.2s;
}
body.edit-mode .video-slot:hover { border-color: var(–accent2); }

.video-slot video {
width: 100%; height: 100%;
object-fit: cover;
display: block;
}

.video-upload-ui {
position: absolute;
inset: 0;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
gap: 16px;
}
.has-video .video-upload-ui { display: none; }

.video-upload-ui svg { opacity: 0.22; }
.video-upload-hint {
font-size: 9px;
letter-spacing: 0.2em;
text-transform: uppercase;
color: var(–accent2);
}
.video-url-input {
background: var(–bg3);
border: 1px solid var(–border);
color: var(–text);
font-family: ‘DM Sans’, sans-serif;
font-size: 11px;
padding: 8px 14px;
width: 280px;
max-width: 90%;
outline: none;
transition: border-color 0.2s;
letter-spacing: 0.02em;
text-align: center;
}
.video-url-input::placeholder { color: var(–accent2); }
.video-url-input:focus { border-color: var(–border-light); }

.video-clear-btn {
position: absolute;
top: 12px;
right: 12px;
background: rgba(17,17,16,0.8);
border: 1px solid var(–border-light);
color: var(–text-muted);
font-size: 9px;
letter-spacing: 0.15em;
text-transform: uppercase;
padding: 5px 10px;
cursor: pointer;
display: none;
font-family: ‘DM Sans’, sans-serif;
transition: all 0.2s;
}
.video-clear-btn:hover { color: var(–text); border-color: var(–accent); }
body.edit-mode .has-video .video-clear-btn { display: block; }

.video-slot input[type=file] { display: none; }

.video-caption {
font-size: 10px;
letter-spacing: 0.12em;
text-transform: uppercase;
color: var(–accent2);
padding: 10px 2px 0;
min-height: 1.4em;
min-width: 30px;
}

/* ── Remove image button ── */
.img-remove-btn {
position: absolute;
top: 8px;
right: 8px;
width: 22px; height: 22px;
background: rgba(17,17,16,0.85);
border: 1px solid var(–border-light);
color: var(–text-muted);
font-size: 13px;
line-height: 20px;
text-align: center;
cursor: pointer;
display: none;
z-index: 2;
transition: all 0.2s;
}
.img-remove-btn:hover { color: var(–text); border-color: var(–accent); }
body.edit-mode .slot-has-image:hover .img-remove-btn { display: block; }

/* ── Edit mode indicator line on sections ── */
body.edit-mode .portfolio-section::before {
content: ‘’;
position: absolute;
left: -60px;
top: 0; bottom: 0;
width: 1px;
background: linear-gradient(to bottom, transparent, var(–border-light) 20%, var(–border-light) 80%, transparent);
pointer-events: none;
}

/* ── Responsive ── */
@media (max-width: 900px) {
#page-header { padding: 60px 24px 40px; }
.sections-wrap { padding: 0 24px 80px; }
.images-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
.captions-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
.video-slot { aspect-ratio: 16/9; }
body.edit-mode .portfolio-section::before { left: -24px; }
}
@media (max-width: 520px) {
#page-header { padding: 48px 20px 32px; }
.sections-wrap { padding: 0 20px 60px; }
#admin-bar { top: 12px; right: 12px; padding: 8px 10px; gap: 6px; }
.admin-btn { padding: 6px 9px; font-size: 9px; }
.images-row { grid-template-columns: 1fr 1fr; }
.captions-row { grid-template-columns: 1fr 1fr; }
}
</style>

</head>
<body class="edit-mode">

<!-- Admin Bar -->

<div id="admin-bar">
  <div class="edit-indicator on" id="edit-dot"></div>
  <button class="admin-btn active" id="toggle-edit-btn" onclick="toggleEditMode()">Edit Mode</button>
  <button class="admin-btn" onclick="clearAll()">Clear All</button>
  <button class="admin-btn export-btn" onclick="exportHTML()">Export Final HTML</button>
</div>

<!-- Page Header -->

<div id="page-header">
  <div class="page-title-wrap">
    <span class="portfolio-name" contenteditable="true" data-placeholder="Your Name">Your Name</span>
  </div>
  <span class="portfolio-tagline" contenteditable="true" data-placeholder="Portfolio — 2025">Portfolio — 2025</span>
</div>

<!-- Sections Container -->

<div class="sections-wrap" id="sections-wrap">
</div>

<script>
// ─── Section Titles & Defaults ───────────────────────────────────────────────
const SECTION_DEFAULTS = [
  { title: "Selected Work", desc: "A curated selection of recent projects spanning digital and physical mediums." },
  { title: "Identity & Branding", desc: "Visual identity systems, logotype design, and brand strategy." },
  { title: "Photography", desc: "Documentary and editorial photography from ongoing personal projects." },
  { title: "Editorial", desc: "Magazine layouts, typographic compositions, and print design." },
  { title: "Motion & Film", desc: "Short films, motion graphics, and experimental video work." },
  { title: "Spatial Design", desc: "Exhibition design, installations, and environmental graphics." },
  { title: "Digital Products", desc: "Interface design, web experiences, and interactive installations." },
  { title: "Illustration", desc: "Hand-drawn and digital illustration across editorial and commercial contexts." },
  { title: "Collaborations", desc: "Selected collaborative work with studios, brands, and institutions." },
  { title: "Archive", desc: "Earlier work, experiments, and ongoing personal research." }
];

// ─── State ────────────────────────────────────────────────────────────────────
let editMode = true;
const state = [];

// ─── Build Sections ───────────────────────────────────────────────────────────
function buildSections() {
  const wrap = document.getElementById('sections-wrap');
  wrap.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    state[i] = state[i] || { images: [null,null,null,null], imageCaptions: ['','','',''], video: null, videoCaption: '' };
    const el = createSection(i);
    wrap.appendChild(el);
  }
}

function createSection(idx) {
  const def = SECTION_DEFAULTS[idx];
  const sec = document.createElement('div');
  sec.className = 'portfolio-section';
  sec.dataset.idx = idx;

  sec.innerHTML = `
    <div class="section-header">
      <div>
        <div style="display:flex;align-items:baseline;gap:20px">
          <span class="section-index">0${idx+1}</span>
          <span class="section-title" contenteditable="true">${def.title}</span>
        </div>
        <div class="section-desc" contenteditable="true">${def.desc}</div>
      </div>
    </div>

    <div class="images-row" id="images-row-${idx}">
      ${[0,1,2,3].map(j => `
        <div class="image-slot" id="img-slot-${idx}-${j}" data-sec="${idx}" data-img="${j}">
          <img id="img-preview-${idx}-${j}" src="" style="display:none" alt="">
          <div class="upload-placeholder">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span>Drop or click</span>
          </div>
          <div class="img-remove-btn" onclick="removeImage(${idx},${j})">×</div>
          <input type="file" accept="image/*" id="img-input-${idx}-${j}">
        </div>
      `).join('')}
    </div>

    <div class="captions-row">
      ${[0,1,2,3].map(j => `
        <div class="img-caption" contenteditable="true" id="img-cap-${idx}-${j}">Image caption</div>
      `).join('')}
    </div>

    <div class="video-outer">
      <div class="video-slot" id="video-slot-${idx}" data-sec="${idx}">
        <video id="video-el-${idx}" autoplay muted loop playsinline style="display:none"></video>
        <div class="video-upload-ui" id="video-ui-${idx}">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          <div class="video-hint" style="text-align:center">
            <div class="video-upload-hint" style="margin-bottom:12px">Drop video or click to upload</div>
            <input type="text" class="video-url-input" id="video-url-${idx}" placeholder="or paste video URL" oninput="handleVideoURL(${idx}, this.value)">
          </div>
        </div>
        <div class="video-clear-btn" onclick="clearVideo(${idx})">Clear</div>
        <input type="file" accept="video/*" id="video-input-${idx}">
      </div>
      <div class="video-caption" contenteditable="true" id="video-cap-${idx}">Project title — Location, Year</div>
    </div>
  `;

  // Image slot events
  for (let j = 0; j < 4; j++) {
    const slot = sec.querySelector(`#img-slot-${idx}-${j}`);
    const input = sec.querySelector(`#img-input-${idx}-${j}`);

    slot.addEventListener('click', () => { if(editMode) input.click(); });
    input.addEventListener('change', (e) => {
      if (e.target.files[0]) loadImageFile(idx, j, e.target.files[0]);
    });
    slot.addEventListener('dragover', (e) => { e.preventDefault(); if(editMode) slot.classList.add('drag-over'); });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      if (!editMode) return;
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) loadImageFile(idx, j, file);
    });
  }

  // Video slot events
  const vslot = sec.querySelector(`#video-slot-${idx}`);
  const vinput = sec.querySelector(`#video-input-${idx}`);

  vslot.addEventListener('click', (e) => {
    if (!editMode) return;
    if (e.target.tagName === 'INPUT' || e.target.closest('.video-clear-btn')) return;
    if (!vslot.classList.contains('has-video')) vinput.click();
  });
  vinput.addEventListener('change', (e) => {
    if (e.target.files[0]) loadVideoFile(idx, e.target.files[0]);
  });
  vslot.addEventListener('dragover', (e) => { e.preventDefault(); if(editMode) vslot.classList.add('drag-over'); });
  vslot.addEventListener('dragleave', () => vslot.classList.remove('drag-over'));
  vslot.addEventListener('drop', (e) => {
    e.preventDefault();
    vslot.classList.remove('drag-over');
    if (!editMode) return;
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) loadVideoFile(idx, file);
  });

  return sec;
}

// ─── Image Loading ─────────────────────────────────────────────────────────────
function loadImageFile(sec, img, file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const src = e.target.result;
    state[sec].images[img] = src;
    const preview = document.getElementById(`img-preview-${sec}-${img}`);
    const slot = document.getElementById(`img-slot-${sec}-${img}`);
    preview.src = src;
    preview.style.display = 'block';
    slot.classList.add('slot-has-image');
  };
  reader.readAsDataURL(file);
}

function removeImage(sec, img) {
  state[sec].images[img] = null;
  const preview = document.getElementById(`img-preview-${sec}-${img}`);
  const slot = document.getElementById(`img-slot-${sec}-${img}`);
  preview.src = '';
  preview.style.display = 'none';
  slot.classList.remove('slot-has-image');
}

// ─── Video Loading ─────────────────────────────────────────────────────────────
function loadVideoFile(sec, file) {
  // Base64 for files under 80MB, otherwise use object URL
  if (file.size < 80 * 1024 * 1024) {
    const reader = new FileReader();
    reader.onload = (e) => setVideo(sec, e.target.result);
    reader.readAsDataURL(file);
  } else {
    const url = URL.createObjectURL(file);
    setVideo(sec, url);
    // mark as objectURL so we know it's not serializable
    state[sec].videoIsObjectURL = true;
  }
}

function setVideo(sec, src) {
  state[sec].video = src;
  state[sec].videoIsObjectURL = false;
  const vslot = document.getElementById(`video-slot-${sec}`);
  const vel = document.getElementById(`video-el-${sec}`);
  vel.src = src;
  vel.style.display = 'block';
  vel.play().catch(()=>{});
  vslot.classList.add('has-video');
}

function handleVideoURL(sec, url) {
  if (!url.trim()) return;
  state[sec].video = url.trim();
  state[sec].videoIsObjectURL = false;
  const vslot = document.getElementById(`video-slot-${sec}`);
  const vel = document.getElementById(`video-el-${sec}`);
  vel.src = url.trim();
  vel.style.display = 'block';
  vel.play().catch(()=>{});
  vslot.classList.add('has-video');
}

function clearVideo(sec) {
  state[sec].video = null;
  state[sec].videoIsObjectURL = false;
  const vslot = document.getElementById(`video-slot-${sec}`);
  const vel = document.getElementById(`video-el-${sec}`);
  const urlInput = document.getElementById(`video-url-${sec}`);
  vel.src = '';
  vel.style.display = 'none';
  vslot.classList.remove('has-video');
  if (urlInput) urlInput.value = '';
}

// ─── Edit Mode ────────────────────────────────────────────────────────────────
function toggleEditMode() {
  editMode = !editMode;
  document.body.classList.toggle('edit-mode', editMode);
  const btn = document.getElementById('toggle-edit-btn');
  const dot = document.getElementById('edit-dot');
  btn.textContent = editMode ? 'Edit Mode' : 'View Mode';
  btn.classList.toggle('active', editMode);
  dot.classList.toggle('on', editMode);
}

// ─── Clear All ────────────────────────────────────────────────────────────────
function clearAll() {
  if (!confirm('Clear all content? This cannot be undone.')) return;
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 4; j++) removeImage(i, j);
    clearVideo(i);
  }
  // Reset text
  document.querySelector('.portfolio-name').textContent = 'Your Name';
  document.querySelector('.portfolio-tagline').textContent = 'Portfolio — 2025';
  document.querySelectorAll('.section-title').forEach((el, i) => el.textContent = SECTION_DEFAULTS[i].title);
  document.querySelectorAll('.section-desc').forEach((el, i) => el.textContent = SECTION_DEFAULTS[i].desc);
  document.querySelectorAll('.img-caption').forEach(el => el.textContent = 'Image caption');
  document.querySelectorAll('.video-caption').forEach(el => el.textContent = 'Project title — Location, Year');
}

// ─── Collect Current State ────────────────────────────────────────────────────
function collectState() {
  const portfolioName = document.querySelector('.portfolio-name').innerHTML;
  const portfolioTagline = document.querySelector('.portfolio-tagline').innerHTML;

  const sections = [];
  for (let i = 0; i < 10; i++) {
    const sec = document.querySelector(`.portfolio-section[data-idx="${i}"]`);
    const title = sec.querySelector('.section-title').innerHTML;
    const desc = sec.querySelector('.section-desc').innerHTML;
    const imgCaptions = [0,1,2,3].map(j => document.getElementById(`img-cap-${i}-${j}`).innerHTML);
    const videoCap = document.getElementById(`video-cap-${i}`).innerHTML;
    const images = [0,1,2,3].map(j => state[i].images[j] || null);
    const video = (state[i].video && !state[i].videoIsObjectURL) ? state[i].video : null;

    sections.push({ title, desc, imgCaptions, videoCap, images, video });
  }
  return { portfolioName, portfolioTagline, sections };
}

// ─── Export ───────────────────────────────────────────────────────────────────
function exportHTML() {
  const data = collectState();
  const html = buildExportHTML(data);
  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'portfolio.html';
  a.click();
}

function buildExportHTML(data) {
  const sections = data.sections.map((sec, idx) => {
    const imagesHTML = [0,1,2,3].map(j => {
      if (sec.images[j]) {
        return `<div class="image-slot slot-has-image"><img src="${sec.images[j]}" alt=""></div>`;
      } else {
        return `<div class="image-slot empty-slot"></div>`;
      }
    }).join('\n');

    const captionsHTML = sec.imgCaptions.map(cap =>
      `<div class="img-caption">${cap}</div>`
    ).join('\n');

    let videoHTML = '';
    if (sec.video) {
      videoHTML = `<video autoplay muted loop playsinline src="${sec.video}"></video>`;
    }

    return `
    <div class="portfolio-section">
      <div class="section-header">
        <div>
          <div style="display:flex;align-items:baseline;gap:20px">
            <span class="section-index">0${idx+1}</span>
            <span class="section-title">${sec.title}</span>
          </div>
          <div class="section-desc">${sec.desc}</div>
        </div>
      </div>

      <div class="images-row">
        ${imagesHTML}
      </div>
      <div class="captions-row">
        ${captionsHTML}
      </div>

      <div class="video-outer">
        <div class="video-slot${sec.video ? ' has-video' : ''}">
          ${videoHTML}
        </div>
        <div class="video-caption">${sec.videoCap}</div>
      </div>
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portfolio</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap');

  :root {
    --bg: #111110;
    --bg2: #191917;
    --border: #2e2e2b;
    --text: #e8e6e0;
    --text-muted: #888882;
    --accent2: #6b6960;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }

  #page-header {
    padding: 80px 60px 60px;
    border-bottom: 1px solid var(--border);
    max-width: 1400px;
    margin: 0 auto;
  }
  .portfolio-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.8rem, 6vw, 5.5rem);
    font-weight: 300;
    line-height: 0.95;
    letter-spacing: -0.02em;
    color: var(--text);
    display: block;
  }
  .portfolio-tagline {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-top: 16px;
    display: block;
  }

  .sections-wrap {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 60px 120px;
  }
  .portfolio-section {
    padding: 72px 0;
    border-bottom: 1px solid var(--border);
  }
  .portfolio-section:last-child { border-bottom: none; }
  .section-header { margin-bottom: 48px; }
  .section-index {
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--accent2);
    text-transform: uppercase;
    font-weight: 500;
  }
  .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1.6rem, 3vw, 2.8rem);
    font-weight: 300;
    letter-spacing: -0.01em;
    color: var(--text);
    line-height: 1.1;
  }
  .section-desc {
    font-size: 13px;
    line-height: 1.75;
    color: var(--text-muted);
    max-width: 540px;
    margin-top: 14px;
  }
  .images-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 12px;
  }
  .image-slot {
    position: relative;
    aspect-ratio: 3/4;
    background: var(--bg2);
    border: 1px solid var(--border);
    overflow: hidden;
  }
  .image-slot.empty-slot { opacity: 0.35; }
  .image-slot img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }
  .captions-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 40px;
  }
  .img-caption {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent2);
    padding: 8px 2px 0;
    line-height: 1.6;
  }
  .video-slot {
    width: 100%;
    aspect-ratio: 16/7;
    background: var(--bg2);
    border: 1px solid var(--border);
    overflow: hidden;
  }
  .video-slot video {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }
  .video-caption {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent2);
    padding: 10px 2px 0;
  }

  @media (max-width: 900px) {
    #page-header { padding: 60px 24px 40px; }
    .sections-wrap { padding: 0 24px 80px; }
    .images-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .captions-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .video-slot { aspect-ratio: 16/9; }
  }
  @media (max-width: 520px) {
    #page-header { padding: 40px 20px 28px; }
    .sections-wrap { padding: 0 20px 60px; }
    .images-row { grid-template-columns: 1fr 1fr; }
    .captions-row { grid-template-columns: 1fr 1fr; }
  }
</style>

</head>
<body>

<div id="page-header">
  <div><span class="portfolio-name">${data.portfolioName}</span></div>
  <span class="portfolio-tagline">${data.portfolioTagline}</span>
</div>

<div class="sections-wrap">
  ${sections}
</div>

</body>
</html>`;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
buildSections();
</script>

</body>
</html>
