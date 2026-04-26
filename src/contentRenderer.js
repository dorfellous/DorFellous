const CONTENT_URLS = ['./content/site-content.json', './public/content/site-content.json'];

export async function loadSiteContent() {
  for (const url of CONTENT_URLS) {
    const response = await fetch(url, { cache: 'no-cache' });
    if (response.ok) return response.json();
  }
  throw new Error(`Could not load content from ${CONTENT_URLS.join(' or ')}`);
}

export function renderSiteContent(content, app = document.querySelector('#app')) {
  app.innerHTML = '';

  content.sections.forEach((section) => {
    const sectionElement = document.createElement('section');
    sectionElement.className = `section ${section.className || ''}`.trim();
    sectionElement.dataset.section = section.id;

    const inner = document.createElement('div');
    inner.className = `section-inner ${section.layout || 'section-stack'}`;

    section.blocks.forEach((block) => {
      inner.appendChild(renderBlock(block));
    });

    sectionElement.appendChild(inner);
    app.appendChild(sectionElement);
  });
}

export function renderBlock(block) {
  if (block.type === 'text') return renderTextBlock(block);
  if (block.type === 'image') return renderImageBlock(block);
  if (block.type === 'video') return renderVideoBlock(block);

  // Add future block renderers here, for example gallery, quote, link-list, or project-grid.
  const fallback = document.createElement('div');
  fallback.className = 'content-block unsupported-block';
  fallback.textContent = `Unsupported block type: ${block.type}`;
  return fallback;
}

function renderTextBlock(block) {
  const tag = getTextTag(block.size);
  const element = document.createElement(tag);
  element.className = `content-block reveal-text align-${block.alignment || 'left'} ${getTextClass(block.size)} ${getMotionClass(block)}`.trim();
  element.dataset.blockId = block.id;
  applyMotionData(element, block);
  element.textContent = block.title || block.body || '';
  return element;
}

function renderImageBlock(block) {
  const figure = document.createElement('figure');
  figure.className = `content-block reveal-image media-${block.size || 'large'} align-${block.alignment || 'right'} ${getMotionClass(block)}`.trim();
  figure.dataset.blockId = block.id;
  applyMotionData(figure, block);
  figure.setAttribute('aria-label', block.alt || block.caption || 'Portfolio image');

  const surface = document.createElement('div');
  surface.className = 'image-surface';

  if (block.src) {
    const image = document.createElement('img');
    image.className = 'content-image';
    image.src = normalizeMediaPath(block.src);
    image.alt = block.alt || '';
    surface.appendChild(image);
  }

  const caption = document.createElement('figcaption');
  caption.textContent = block.caption || '';

  figure.append(surface, caption);
  return figure;
}

function renderVideoBlock(block) {
  const wrapper = document.createElement('div');
  wrapper.className = `content-block scrub-video align-${block.alignment || 'right'} ${getMotionClass(block)}`.trim();
  wrapper.dataset.blockId = block.id;
  wrapper.dataset.scrollVideo = '';
  wrapper.dataset.src = block.src ? normalizeMediaPath(block.src) : '';
  wrapper.dataset.behavior = block.behavior || 'scroll-scrub';
  applyMotionData(wrapper, block);
  wrapper.setAttribute('aria-label', block.caption || 'Scroll-controlled video');

  const canvas = document.createElement('canvas');
  canvas.className = 'video-canvas';
  canvas.width = 1280;
  canvas.height = 720;

  const label = document.createElement('p');
  label.className = 'video-label';
  label.textContent = block.caption || 'video placeholder / scroll scrub';

  wrapper.append(canvas, label);
  return wrapper;
}

function getTextTag(size) {
  if (size === 'hero') return 'h1';
  if (size === 'title') return 'h2';
  return 'p';
}

function getTextClass(size) {
  if (size === 'hero') return 'hero-title';
  if (size === 'title') return 'section-title';
  if (size === 'eyebrow') return 'eyebrow';
  return 'body-copy';
}

function getMotionClass(block) {
  return block.motion ? `motion-${block.motion}` : '';
}

function applyMotionData(element, block) {
  if (block.motion) element.dataset.motion = block.motion;
}

export function normalizeMediaPath(src) {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('/') || src.startsWith('data:')) return src;
  if (src.startsWith('./public/') || src.startsWith('./media/') || src.startsWith('./content/')) return src;
  if (src.startsWith('./')) return src;
  return `./public/media/${src}`;
}
