<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portfolio Builder</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap');
 
  :root {
    --bg: #111110;
    --bg2: #191917;
    --bg3: #222220;
    --border: #2e2e2b;
    --border-light: #3a3a37;
    --text: #e8e6e0;
    --text-muted: #888882;
    --accent: #c8c4b8;
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
 
  /* Admin Toolbar */
  #admin-bar {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    gap: 8px;
    align-items: center;
    background: rgba(17,17,16,0.92);
    border: 1px solid var(--border-light);
    padding: 10px 14px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
 
  .admin-btn {
    background: transparent;
    border: 1px solid var(--border-light);
    color: var(--text-muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 7px 13px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .admin-btn:hover { border-color: var(--accent); color: var(--text); }
  .admin-btn.active { border-color: var(--accent); color: var(--text); background: rgba(200,196,184,0.07); }
  .admin-btn.export-btn { color: var(--accent); border-color: var(--accent); }
  .admin-btn.export-btn:hover { background: var(--accent); color: var(--bg); }
 
  .edit-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #888882;
    flex-shrink: 0;
    transition: background 0.3s;
  }
  .edit-indicator.on { background: #a8c090; box-shadow: 0 0 6px #a8c09066; }
 
  /* Page Header */
  #page-header {
    padding: 80px 60px 60px;
    border-bottom: 1px solid var(--border);
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
    box-shadow: 0 0 0 1px var(--border-light);
  }
  body:not(.edit-mode) [contenteditable] {
    pointer-events: none;
  }
 
  .portfolio-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.8rem, 6vw, 5.5rem);
    font-weight: 300;
    line-height: 0.95;
    letter-spacing: -0.02em;
    color: var(--text);
    display: block;
    min-width: 40px;
    min-height: 1em;
  }
  .portfolio-tagline {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-top: 16px;
    display: block;
    min-width: 60px;
    min-height: 1em;
  }
 
  /* Sections */
  .sections-wrap {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 60px 120px;
  }
 
  .portfolio-section {
    padding: 72px 0;
    border-bottom: 1px solid var(--border);
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
    color: var(--accent2);
    text-transform: uppercase;
    flex-shrink: 0;
    font-weight: 500;
    margin-top: 4px;
  }
 
  .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1.6rem, 3vw, 2.8rem);
    font-weight: 300;
    letter-spacing: -0.01em;
    color: var(--text);
    min-width: 80px;
    min-height: 1em;
    line-height: 1.1;
  }
 
  .section-desc {
    font-size: 13px;
    line-height: 1.75;
    color: var(--text-muted);
    max-width: 540px;
    margin-top: 14px;
    min-height: 1em;
    min-width: 80px;
  }
 
  /* Image Grid */
  .images-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 12px;
  }
 
  .image-slot {
    position: relative;
    aspect-ratio: 3 / 4;
    background: var(--bg2);
    border: 1px solid var(--border);
    overflow: hidden;
    cursor: default;
    transition: border-color 0.2s;
  }
  body.edit-mode .image-slot { cursor: pointer; }
  .image-slot:hover { border-color: var(--border-light); }
  body.edit-mode .image-slot:hover { border-color: var(--accent2); }
 
  .image-slot img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: opacity 0.4s;
    pointer-events: none;
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
    color: var(--accent2);
    opacity: 0;
    transition: opacity 0.2s;
  }
  body.edit-mode .image-slot:hover .upload-placeholder span { opacity: 1; }
 
  .slot-has-image .upload-placeholder { display: none; }
 
  .drag-over { border-color: var(--accent) !important; background: rgba(200,196,184,0.06) !important; }
 
  .image-slot input[type="file"] { display: none; }
 
  /* Captions row */
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
    min-height: 1.4em;
    min-width: 30px;
    line-height: 1.6;
  }
 
  /* Video Slot */
  .video-outer { position: relative; }
 
  .video-slot {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 7;
    background: var(--bg2);
    border: 1px solid var(--border);
    overflow: hidden;
    transition: border-color 0.2s;
    cursor: default;
  }
  body.edit-mode .video-slot { cursor: pointer; }
  body.edit-mode .video-slot:hover { border-color: var(--accent2); }
 
  .video-slot video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
  }
 
  .video-upload-ui {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    pointer-events: none;
  }
  body.edit-mode .video-upload-ui { pointer-events: auto; }
  .has-video .video-upload-ui { display: none; }
 
  .video-upload-ui svg { opacity: 0.22; }
 
  .video-upload-hint {
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent2);
  }
 
  .video-url-input {
    background: var(--bg3);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    padding: 8px 14px;
    width: 280px;
    max-width: 90%;
    outline: none;
    transition: border-color 0.2s;
    letter-spacing: 0.02em;
    text-align: center;
    pointer-events: auto;
  }
  .video-url-input::placeholder { color: var(--accent2); }
  .video-url-input:focus { border-color: var(--border-light); }
 
  .video-clear-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(17,17,16,0.8);
    border: 1px solid var(--border-light);
    color: var(--text-muted);
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 5px 10px;
    cursor: pointer;
    display: none;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    z-index: 3;
    pointer-events: auto;
  }
  .video-clear-btn:hover { color: var(--text); border-color: var(--accent); }
  body.edit-mode .has-video .video-clear-btn { display: block; }
 
  .video-slot input[type="file"] { display: none; }
 
  .video-caption {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent2);
    padding: 10px 2px 0;
    min-height: 1.4em;
    min-width: 30px;
  }
 
  /* Remove image button */
  .img-remove-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 22px;
    height: 22px;
    background: rgba(17,17,16,0.85);
    border: 1px solid var(--border-light);
    color: var(--text-muted);
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    cursor: pointer;
    display: none;
    z-index: 2;
    transition: all 0.2s;
    pointer-events: auto;
  }
  .img-remove-btn:hover { color: var(--text); border-color: var(--accent); }
  body.edit-mode .slot-has-image:hover .img-remove-btn { display: block; }
 
  /* Edit mode side indicator */
  body.edit-mode .portfolio-section::before {
    content: '';
    position: absolute;
    left: -60px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, transparent, var(--border-light) 20%, var(--border-light) 80%, transparent);
    pointer-events: none;
  }
 
  /* Responsive */
  @media (max-width: 900px) {
    #page-header { padding: 60px 24px 40px; }
    .sections-wrap { padding: 0 24px 80px; }
    .images-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .captions-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .video-slot { aspect-ratio: 16 / 9; }
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
    <span class="portfolio-name" contenteditable="true">Your Name</span>
  </div>
  <span class="portfolio-tagline" contenteditable="true">Portfolio &mdash; 2025</span>
</div>
 
<!-- Sections Container -->
<div class="sections-wrap" id="sections-wrap"></div>
 
<script>
// Section defaults
var SECTION_DEFAULTS = [
  { title: "Selected Work",    desc: "A curated selection of recent projects spanning digital and physical mediums." },
  { title: "Identity & Branding", desc: "Visual identity systems, logotype design, and brand strategy." },
  { title: "Photography",      desc: "Documentary and editorial photography from ongoing personal projects." },
  { title: "Editorial",        desc: "Magazine layouts, typographic compositions, and print design." },
  { title: "Motion & Film",    desc: "Short films, motion graphics, and experimental video work." },
  { title: "Spatial Design",   desc: "Exhibition design, installations, and environmental graphics." },
  { title: "Digital Products", desc: "Interface design, web experiences, and interactive installations." },
  { title: "Illustration",     desc: "Hand-drawn and digital illustration across editorial and commercial contexts." },
  { title: "Collaborations",   desc: "Selected collaborative work with studios, brands, and institutions." },
  { title: "Archive",          desc: "Earlier work, experiments, and ongoing personal research." }
];
 
var editMode = true;
var state = [];
 
// Init state
for (var s = 0; s < 10; s++) {
  state[s] = { images: [null,null,null,null], video: null, videoIsObjectURL: false };
}
 
// Build all sections
function buildSections() {
  var wrap = document.getElementById('sections-wrap');
  wrap.innerHTML = '';
  for (var i = 0; i < 10; i++) {
    wrap.appendChild(createSection(i));
  }
}
 
function createSection(idx) {
  var def = SECTION_DEFAULTS[idx];
  var sec = document.createElement('div');
  sec.className = 'portfolio-section';
  sec.dataset.idx = idx;
 
  var num = idx < 9 ? '0' + (idx + 1) : '10';
 
  sec.innerHTML =
    '<div class="section-header">' +
      '<div>' +
        '<div style="display:flex;align-items:baseline;gap:20px">' +
          '<span class="section-index">' + num + '</span>' +
          '<span class="section-title" contenteditable="true">' + def.title + '</span>' +
        '</div>' +
        '<div class="section-desc" contenteditable="true">' + def.desc + '</div>' +
      '</div>' +
    '</div>' +
 
    '<div class="images-row" id="images-row-' + idx + '">' +
      [0,1,2,3].map(function(j) {
        return '<div class="image-slot" id="img-slot-' + idx + '-' + j + '">' +
          '<img id="img-preview-' + idx + '-' + j + '" src="" style="display:none" alt="">' +
          '<div class="upload-placeholder">' +
            '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">' +
              '<rect x="3" y="3" width="18" height="18" rx="1"/>' +
              '<circle cx="8.5" cy="8.5" r="1.5"/>' +
              '<polyline points="21 15 16 10 5 21"/>' +
            '</svg>' +
            '<span>Drop or click</span>' +
          '</div>' +
          '<div class="img-remove-btn" data-sec="' + idx + '" data-img="' + j + '">&times;</div>' +
          '<input type="file" accept="image/*" id="img-input-' + idx + '-' + j + '">' +
        '</div>';
      }).join('') +
    '</div>' +
 
    '<div class="captions-row">' +
      [0,1,2,3].map(function(j) {
        return '<div class="img-caption" contenteditable="true" id="img-cap-' + idx + '-' + j + '">Image caption</div>';
      }).join('') +
    '</div>' +
 
    '<div class="video-outer">' +
      '<div class="video-slot" id="video-slot-' + idx + '">' +
        '<video id="video-el-' + idx + '" autoplay muted loop playsinline style="display:none"></video>' +
        '<div class="video-upload-ui" id="video-ui-' + idx + '">' +
          '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round">' +
            '<polygon points="23 7 16 12 23 17 23 7"/>' +
            '<rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>' +
          '</svg>' +
          '<div style="text-align:center">' +
            '<div class="video-upload-hint" style="margin-bottom:12px">Drop video or click to upload</div>' +
            '<input type="text" class="video-url-input" id="video-url-' + idx + '" placeholder="or paste video URL">' +
          '</div>' +
        '</div>' +
        '<div class="video-clear-btn" data-sec="' + idx + '">Clear</div>' +
        '<input type="file" accept="video/*" id="video-input-' + idx + '">' +
      '</div>' +
      '<div class="video-caption" contenteditable="true" id="video-cap-' + idx + '">Project title &mdash; Location, Year</div>' +
    '</div>';
 
  // Attach image slot events
  for (var j = 0; j < 4; j++) {
    (function(secIdx, imgIdx) {
      var slot  = sec.querySelector('#img-slot-' + secIdx + '-' + imgIdx);
      var input = sec.querySelector('#img-input-' + secIdx + '-' + imgIdx);
      var rmBtn = slot.querySelector('.img-remove-btn');
 
      slot.addEventListener('click', function(e) {
        if (!editMode) return;
        if (e.target === rmBtn || rmBtn.contains(e.target)) return;
        if (slot.classList.contains('slot-has-image')) return;
        input.click();
      });
 
      rmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        removeImage(secIdx, imgIdx);
      });
 
      input.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) loadImageFile(secIdx, imgIdx, e.target.files[0]);
      });
 
      slot.addEventListener('dragenter', function(e) { e.preventDefault(); });
      slot.addEventListener('dragover',  function(e) {
        e.preventDefault();
        if (editMode) slot.classList.add('drag-over');
      });
      slot.addEventListener('dragleave', function(e) {
        if (!slot.contains(e.relatedTarget)) slot.classList.remove('drag-over');
      });
      slot.addEventListener('drop', function(e) {
        e.preventDefault();
        slot.classList.remove('drag-over');
        if (!editMode) return;
        var file = e.dataTransfer.files[0];
        if (file && file.type.indexOf('image/') === 0) loadImageFile(secIdx, imgIdx, file);
      });
    })(idx, j);
  }
 
  // Attach video slot events
  (function(secIdx) {
    var vslot  = sec.querySelector('#video-slot-' + secIdx);
    var vinput = sec.querySelector('#video-input-' + secIdx);
    var vurl   = sec.querySelector('#video-url-' + secIdx);
    var vclr   = sec.querySelector('.video-clear-btn');
 
    vslot.addEventListener('click', function(e) {
      if (!editMode) return;
      if (vclr.contains(e.target)) return;
      if (vurl.contains(e.target)) return;
      if (vslot.classList.contains('has-video')) return;
      vinput.click();
    });
 
    vclr.addEventListener('click', function(e) {
      e.stopPropagation();
      clearVideo(secIdx);
    });
 
    vinput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files[0]) loadVideoFile(secIdx, e.target.files[0]);
    });
 
    vurl.addEventListener('click', function(e) { e.stopPropagation(); });
 
    vurl.addEventListener('input', function() {
      var val = vurl.value.trim();
      if (val) handleVideoURL(secIdx, val);
    });
 
    vslot.addEventListener('dragenter', function(e) { e.preventDefault(); });
    vslot.addEventListener('dragover',  function(e) {
      e.preventDefault();
      if (editMode) vslot.classList.add('drag-over');
    });
    vslot.addEventListener('dragleave', function(e) {
      if (!vslot.contains(e.relatedTarget)) vslot.classList.remove('drag-over');
    });
    vslot.addEventListener('drop', function(e) {
      e.preventDefault();
      vslot.classList.remove('drag-over');
      if (!editMode) return;
      var file = e.dataTransfer.files[0];
      if (file && file.type.indexOf('video/') === 0) loadVideoFile(secIdx, file);
    });
  })(idx);
 
  return sec;
}
 
// Image loading
function loadImageFile(sec, img, file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var src = e.target.result;
    state[sec].images[img] = src;
    var preview = document.getElementById('img-preview-' + sec + '-' + img);
    var slot    = document.getElementById('img-slot-'    + sec + '-' + img);
    preview.src = src;
    preview.style.display = 'block';
    slot.classList.add('slot-has-image');
  };
  reader.readAsDataURL(file);
}
 
function removeImage(sec, img) {
  state[sec].images[img] = null;
  var preview = document.getElementById('img-preview-' + sec + '-' + img);
  var slot    = document.getElementById('img-slot-'    + sec + '-' + img);
  preview.src = '';
  preview.style.display = 'none';
  slot.classList.remove('slot-has-image');
  var input = document.getElementById('img-input-' + sec + '-' + img);
  if (input) input.value = '';
}
 
// Video loading
function loadVideoFile(sec, file) {
  if (file.size < 80 * 1024 * 1024) {
    var reader = new FileReader();
    reader.onload = function(e) { setVideo(sec, e.target.result, false); };
    reader.readAsDataURL(file);
  } else {
    var url = URL.createObjectURL(file);
    setVideo(sec, url, true);
  }
}
 
function setVideo(sec, src, isObjectURL) {
  state[sec].video = src;
  state[sec].videoIsObjectURL = isObjectURL || false;
  var vslot = document.getElementById('video-slot-' + sec);
  var vel   = document.getElementById('video-el-'   + sec);
  vel.src = src;
  vel.style.display = 'block';
  vel.play().catch(function(){});
  vslot.classList.add('has-video');
}
 
function handleVideoURL(sec, url) {
  setVideo(sec, url, false);
}
 
function clearVideo(sec) {
  state[sec].video = null;
  state[sec].videoIsObjectURL = false;
  var vslot  = document.getElementById('video-slot-' + sec);
  var vel    = document.getElementById('video-el-'   + sec);
  var urlIn  = document.getElementById('video-url-'  + sec);
  var vinput = document.getElementById('video-input-' + sec);
  vel.pause();
  vel.removeAttribute('src');
  vel.load();
  vel.style.display = 'none';
  vslot.classList.remove('has-video');
  if (urlIn)  urlIn.value  = '';
  if (vinput) vinput.value = '';
}
 
// Edit mode toggle
function toggleEditMode() {
  editMode = !editMode;
  document.body.classList.toggle('edit-mode', editMode);
  var btn = document.getElementById('toggle-edit-btn');
  var dot = document.getElementById('edit-dot');
  btn.textContent = editMode ? 'Edit Mode' : 'View Mode';
  btn.classList.toggle('active', editMode);
  dot.classList.toggle('on', editMode);
}
 
// Clear all
function clearAll() {
  if (!confirm('Clear all content? This cannot be undone.')) return;
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 4; j++) removeImage(i, j);
    clearVideo(i);
  }
  document.querySelector('.portfolio-name').textContent = 'Your Name';
  document.querySelector('.portfolio-tagline').textContent = 'Portfolio \u2014 2025';
  var titles = document.querySelectorAll('.section-title');
  var descs  = document.querySelectorAll('.section-desc');
  for (var k = 0; k < 10; k++) {
    titles[k].textContent = SECTION_DEFAULTS[k].title;
    descs[k].textContent  = SECTION_DEFAULTS[k].desc;
  }
  document.querySelectorAll('.img-caption').forEach(function(el) { el.textContent = 'Image caption'; });
  document.querySelectorAll('.video-caption').forEach(function(el) { el.textContent = 'Project title \u2014 Location, Year'; });
}
 
// Collect state from DOM
function collectState() {
  var portfolioName    = document.querySelector('.portfolio-name').innerHTML;
  var portfolioTagline = document.querySelector('.portfolio-tagline').innerHTML;
  var sections = [];
  for (var i = 0; i < 10; i++) {
    var sec        = document.querySelector('.portfolio-section[data-idx="' + i + '"]');
    var title      = sec.querySelector('.section-title').innerHTML;
    var desc       = sec.querySelector('.section-desc').innerHTML;
    var imgCaptions = [0,1,2,3].map(function(j) { return document.getElementById('img-cap-' + i + '-' + j).innerHTML; });
    var videoCap   = document.getElementById('video-cap-' + i).innerHTML;
    var images     = state[i].images.slice();
    var video      = (state[i].video && !state[i].videoIsObjectURL) ? state[i].video : null;
    sections.push({ title: title, desc: desc, imgCaptions: imgCaptions, videoCap: videoCap, images: images, video: video });
  }
  return { portfolioName: portfolioName, portfolioTagline: portfolioTagline, sections: sections };
}
 
// Export
function exportHTML() {
  var data = collectState();
  var html = buildExportHTML(data);
  var blob = new Blob([html], { type: 'text/html' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'index.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function() { URL.revokeObjectURL(a.href); }, 1000);
}
 
function buildExportHTML(data) {
  var sectionsHTML = data.sections.map(function(sec, idx) {
    var num = idx < 9 ? '0' + (idx + 1) : '10';
 
    var imagesHTML = [0,1,2,3].map(function(j) {
      if (sec.images[j]) {
        return '<div class="image-slot"><img src="' + sec.images[j] + '" alt=""></div>';
      }
      return '<div class="image-slot empty-slot"></div>';
    }).join('\n');
 
    var captionsHTML = sec.imgCaptions.map(function(cap) {
      return '<div class="img-caption">' + cap + '</div>';
    }).join('\n');
 
    var videoHTML = sec.video
      ? '<video autoplay muted loop playsinline src="' + sec.video + '"></video>'
      : '';
 
    return '<div class="portfolio-section">' +
      '<div class="section-header">' +
        '<div>' +
          '<div style="display:flex;align-items:baseline;gap:20px">' +
            '<span class="section-index">' + num + '</span>' +
            '<span class="section-title">' + sec.title + '</span>' +
          '</div>' +
          '<div class="section-desc">' + sec.desc + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="images-row">' + imagesHTML + '</div>' +
      '<div class="captions-row">' + captionsHTML + '</div>' +
      '<div class="video-outer">' +
        '<div class="video-slot' + (sec.video ? ' has-video' : '') + '">' + videoHTML + '</div>' +
        '<div class="video-caption">' + sec.videoCap + '</div>' +
      '</div>' +
    '</div>';
  }).join('\n');
 
  return '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'<meta charset="UTF-8">\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'<title>Portfolio</title>\n' +
'<style>\n' +
'  @import url(\'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap\');\n' +
'  :root {\n' +
'    --bg: #111110;\n' +
'    --bg2: #191917;\n' +
'    --border: #2e2e2b;\n' +
'    --text: #e8e6e0;\n' +
'    --text-muted: #888882;\n' +
'    --accent2: #6b6960;\n' +
'  }\n' +
'  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\n' +
'  html { scroll-behavior: smooth; }\n' +
'  body {\n' +
'    background: var(--bg);\n' +
'    color: var(--text);\n' +
'    font-family: \'DM Sans\', sans-serif;\n' +
'    font-weight: 300;\n' +
'    min-height: 100vh;\n' +
'    position: relative;\n' +
'    overflow-x: hidden;\n' +
'  }\n' +
'  body::before {\n' +
'    content: \'\';\n' +
'    position: fixed;\n' +
'    inset: 0;\n' +
'    pointer-events: none;\n' +
'    z-index: 9999;\n' +
'    opacity: 0.035;\n' +
'    background-image: url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E");\n' +
'    background-size: 200px 200px;\n' +
'  }\n' +
'  #page-header { padding: 80px 60px 60px; border-bottom: 1px solid var(--border); max-width: 1400px; margin: 0 auto; }\n' +
'  .portfolio-name { font-family: \'Cormorant Garamond\', serif; font-size: clamp(2.8rem, 6vw, 5.5rem); font-weight: 300; line-height: 0.95; letter-spacing: -0.02em; color: var(--text); display: block; }\n' +
'  .portfolio-tagline { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); margin-top: 16px; display: block; }\n' +
'  .sections-wrap { max-width: 1400px; margin: 0 auto; padding: 0 60px 120px; }\n' +
'  .portfolio-section { padding: 72px 0; border-bottom: 1px solid var(--border); }\n' +
'  .portfolio-section:last-child { border-bottom: none; }\n' +
'  .section-header { margin-bottom: 48px; }\n' +
'  .section-index { font-size: 10px; letter-spacing: 0.2em; color: var(--accent2); text-transform: uppercase; font-weight: 500; }\n' +
'  .section-title { font-family: \'Cormorant Garamond\', serif; font-size: clamp(1.6rem, 3vw, 2.8rem); font-weight: 300; letter-spacing: -0.01em; color: var(--text); line-height: 1.1; }\n' +
'  .section-desc { font-size: 13px; line-height: 1.75; color: var(--text-muted); max-width: 540px; margin-top: 14px; }\n' +
'  .images-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px; }\n' +
'  .image-slot { position: relative; aspect-ratio: 3/4; background: var(--bg2); border: 1px solid var(--border); overflow: hidden; }\n' +
'  .image-slot.empty-slot { opacity: 0.3; }\n' +
'  .image-slot img { width: 100%; height: 100%; object-fit: cover; display: block; }\n' +
'  .captions-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 40px; }\n' +
'  .img-caption { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent2); padding: 8px 2px 0; line-height: 1.6; }\n' +
'  .video-slot { width: 100%; aspect-ratio: 16/7; background: var(--bg2); border: 1px solid var(--border); overflow: hidden; }\n' +
'  .video-slot video { width: 100%; height: 100%; object-fit: cover; display: block; }\n' +
'  .video-caption { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent2); padding: 10px 2px 0; }\n' +
'  @media (max-width: 900px) {\n' +
'    #page-header { padding: 60px 24px 40px; }\n' +
'    .sections-wrap { padding: 0 24px 80px; }\n' +
'    .images-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }\n' +
'    .captions-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }\n' +
'    .video-slot { aspect-ratio: 16/9; }\n' +
'  }\n' +
'  @media (max-width: 520px) {\n' +
'    #page-header { padding: 40px 20px 28px; }\n' +
'    .sections-wrap { padding: 0 20px 60px; }\n' +
'    .images-row { grid-template-columns: 1fr 1fr; }\n' +
'    .captions-row { grid-template-columns: 1fr 1fr; }\n' +
'  }\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'<div id="page-header">\n' +
'  <div><span class="portfolio-name">' + data.portfolioName + '</span></div>\n' +
'  <span class="portfolio-tagline">' + data.portfolioTagline + '</span>\n' +
'</div>\n' +
'<div class="sections-wrap">\n' +
sectionsHTML +
'\n</div>\n' +
'</body>\n' +
'</html>';
}
 
// Init
buildSections();
</script>
</body>
</html>
 
