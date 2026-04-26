import { renderSiteContent } from './contentRenderer.js';

export function initEditor({ content, app, onPreview }) {
  document.body.classList.add('editor-mode');

  const editorRoot = document.querySelector('#editor-root');
  editorRoot.hidden = false;

  const state = structuredClone(content);
  const dragState = { sectionId: null, blockId: null };

  editorRoot.innerHTML = `
    <aside class="editor-panel" aria-label="Content editor">
      <header class="editor-header">
        <div>
          <p class="editor-kicker">Editor mode</p>
          <h1>Site content</h1>
        </div>
        <a href="./" class="editor-link">Public view</a>
      </header>
      <div class="editor-actions">
        <button type="button" data-action="preview">Preview</button>
        <button type="button" data-action="export-copy">Copy JSON</button>
        <button type="button" data-action="export-download">Download JSON</button>
      </div>
      <p class="editor-note">Drag blocks to reorder them. Use the section dropdown to move a block to another section. Save exported JSON back into public/content/site-content.json.</p>
      <div class="editor-sections"></div>
      <textarea class="editor-export" readonly aria-label="Exported JSON"></textarea>
    </aside>
  `;

  const sectionsRoot = editorRoot.querySelector('.editor-sections');
  const exportField = editorRoot.querySelector('.editor-export');

  editorRoot.addEventListener('click', (event) => {
    const action = event.target.dataset.action;
    if (!action) return;

    if (action === 'preview') preview();
    if (action === 'export-copy') copyJson(exportField, state);
    if (action === 'export-download') downloadJson(state);
    if (action === 'add-text') addBlock(event.target.dataset.sectionId, 'text');
    if (action === 'add-image') addBlock(event.target.dataset.sectionId, 'image');
    if (action === 'add-video') addBlock(event.target.dataset.sectionId, 'video');
    if (action === 'remove-block') removeBlock(event.target.dataset.sectionId, event.target.dataset.blockId);
  });

  editorRoot.addEventListener('input', (event) => {
    const field = event.target.dataset.field;
    if (!field) return;

    const block = findBlock(event.target.dataset.sectionId, event.target.dataset.blockId);
    if (!block) return;
    block[field] = event.target.value;
    updateExport();
  });

  editorRoot.addEventListener('change', (event) => {
    const field = event.target.dataset.field;
    if (!field) return;

    const sectionId = event.target.dataset.sectionId;
    const blockId = event.target.dataset.blockId;

    if (field === 'section') {
      moveBlockToSection(sectionId, blockId, event.target.value);
      return;
    }

    const block = findBlock(sectionId, blockId);
    if (!block) return;
    block[field] = event.target.value;
    updateExport();
  });

  function renderEditor() {
    sectionsRoot.innerHTML = '';

    state.sections.forEach((section) => {
      const sectionElement = document.createElement('section');
      sectionElement.className = 'editor-section';
      sectionElement.dataset.sectionId = section.id;
      sectionElement.innerHTML = `
        <div class="editor-section-header">
          <div>
            <p>${section.id}</p>
            <h2>${section.label || section.id}</h2>
          </div>
          <div class="editor-add-actions">
            <button type="button" data-action="add-text" data-section-id="${section.id}">Add text</button>
            <button type="button" data-action="add-image" data-section-id="${section.id}">Add image</button>
            <button type="button" data-action="add-video" data-section-id="${section.id}">Add video</button>
          </div>
        </div>
        <div class="editor-block-list" data-section-id="${section.id}"></div>
      `;

      const list = sectionElement.querySelector('.editor-block-list');
      list.addEventListener('dragover', (event) => event.preventDefault());
      list.addEventListener('drop', (event) => handleDrop(event, section.id));

      section.blocks.forEach((block) => list.appendChild(renderBlockEditor(section.id, block)));
      sectionsRoot.appendChild(sectionElement);
    });

    updateExport();
  }

  function renderBlockEditor(sectionId, block) {
    const card = document.createElement('article');
    card.className = 'editor-block';
    card.draggable = true;
    card.dataset.sectionId = sectionId;
    card.dataset.blockId = block.id;
    card.addEventListener('dragstart', () => {
      dragState.sectionId = sectionId;
      dragState.blockId = block.id;
    });

    card.innerHTML = `
      <div class="editor-block-topline">
        <strong>${block.type}</strong>
        <select data-field="section" data-section-id="${sectionId}" data-block-id="${block.id}">
          ${state.sections.map((section) => `<option value="${section.id}" ${section.id === sectionId ? 'selected' : ''}>${section.label || section.id}</option>`).join('')}
        </select>
        <button type="button" data-action="remove-block" data-section-id="${sectionId}" data-block-id="${block.id}">Remove</button>
      </div>
      ${renderFields(sectionId, block)}
    `;

    return card;
  }

  function renderFields(sectionId, block) {
    if (block.type === 'image') {
      return `
        ${field('src', 'Media path', block.src || '', sectionId, block.id, 'input', 'Example: ./public/media/image.jpg')}
        ${field('alt', 'Alt text', block.alt || '', sectionId, block.id)}
        ${field('caption', 'Caption', block.caption || '', sectionId, block.id)}
        ${selectField('size', 'Size', block.size || 'large', ['small', 'medium', 'large'], sectionId, block.id)}
        ${selectField('alignment', 'Alignment', block.alignment || 'right', ['left', 'center', 'right'], sectionId, block.id)}
      `;
    }

    if (block.type === 'video') {
      return `
        ${field('src', 'Media path', block.src || '', sectionId, block.id, 'input', 'Optional: ./public/media/video.mp4')}
        ${field('caption', 'Caption', block.caption || '', sectionId, block.id)}
        ${selectField('behavior', 'Behavior', block.behavior || 'scroll-scrub', ['scroll-scrub', 'static'], sectionId, block.id)}
        ${selectField('alignment', 'Alignment', block.alignment || 'right', ['left', 'center', 'right'], sectionId, block.id)}
      `;
    }

    return `
      ${field('title', 'Title', block.title || '', sectionId, block.id)}
      ${field('body', 'Body', block.body || '', sectionId, block.id, 'textarea')}
      ${selectField('size', 'Size', block.size || 'body', ['eyebrow', 'hero', 'title', 'body'], sectionId, block.id)}
      ${selectField('alignment', 'Alignment', block.alignment || 'left', ['left', 'center', 'right'], sectionId, block.id)}
    `;
  }

  function field(name, label, value, sectionId, blockId, element = 'input', placeholder = '') {
    const escapedValue = escapeHtml(value);
    const attrs = `data-field="${name}" data-section-id="${sectionId}" data-block-id="${blockId}" placeholder="${placeholder}"`;
    return `
      <label class="editor-field">
        <span>${label}</span>
        ${element === 'textarea' ? `<textarea ${attrs}>${escapedValue}</textarea>` : `<input value="${escapedValue}" ${attrs} />`}
      </label>
    `;
  }

  function selectField(name, label, value, options, sectionId, blockId) {
    return `
      <label class="editor-field">
        <span>${label}</span>
        <select data-field="${name}" data-section-id="${sectionId}" data-block-id="${blockId}">
          ${options.map((option) => `<option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>`).join('')}
        </select>
      </label>
    `;
  }

  function handleDrop(event, targetSectionId) {
    event.preventDefault();
    if (!dragState.blockId) return;

    const sourceSection = state.sections.find((section) => section.id === dragState.sectionId);
    const targetSection = state.sections.find((section) => section.id === targetSectionId);
    if (!sourceSection || !targetSection) return;

    const sourceIndex = sourceSection.blocks.findIndex((block) => block.id === dragState.blockId);
    if (sourceIndex < 0) return;

    const [block] = sourceSection.blocks.splice(sourceIndex, 1);
    const dropCard = event.target.closest('.editor-block');
    const targetIndex = dropCard
      ? targetSection.blocks.findIndex((candidate) => candidate.id === dropCard.dataset.blockId)
      : targetSection.blocks.length;

    targetSection.blocks.splice(Math.max(targetIndex, 0), 0, block);
    dragState.sectionId = null;
    dragState.blockId = null;
    renderEditor();
  }

  function addBlock(sectionId, type) {
    const section = state.sections.find((candidate) => candidate.id === sectionId);
    if (!section) return;

    section.blocks.push(createBlock(type));
    renderEditor();
  }

  function removeBlock(sectionId, blockId) {
    const section = state.sections.find((candidate) => candidate.id === sectionId);
    if (!section) return;
    section.blocks = section.blocks.filter((block) => block.id !== blockId);
    renderEditor();
  }

  function moveBlockToSection(fromSectionId, blockId, toSectionId) {
    if (fromSectionId === toSectionId) return;
    const fromSection = state.sections.find((section) => section.id === fromSectionId);
    const toSection = state.sections.find((section) => section.id === toSectionId);
    if (!fromSection || !toSection) return;

    const blockIndex = fromSection.blocks.findIndex((block) => block.id === blockId);
    if (blockIndex < 0) return;
    const [block] = fromSection.blocks.splice(blockIndex, 1);
    toSection.blocks.push(block);
    renderEditor();
  }

  function createBlock(type) {
    const id = `${type}-${Date.now()}`;
    if (type === 'image') {
      return { id, type, src: '', alt: '', caption: 'New image block', size: 'large', alignment: 'right' };
    }
    if (type === 'video') {
      return { id, type, src: '', caption: 'New video block', behavior: 'scroll-scrub', alignment: 'right' };
    }
    return { id, type: 'text', title: 'New text block', body: '', size: 'body', alignment: 'left' };
  }

  function findBlock(sectionId, blockId) {
    return state.sections.find((section) => section.id === sectionId)?.blocks.find((block) => block.id === blockId);
  }

  function preview() {
    renderSiteContent(state, app);
    onPreview?.();
    updateExport();
  }

  function updateExport() {
    exportField.value = JSON.stringify(state, null, 2);
  }

  renderEditor();
  preview();
}

async function copyJson(field, state) {
  const json = JSON.stringify(state, null, 2);
  field.value = json;
  await navigator.clipboard?.writeText(json);
}

function downloadJson(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'site-content.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
