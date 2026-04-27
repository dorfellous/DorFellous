import { disperseText, initScrollReveals, resetScrollReveals } from './animations.js';

const app = document.querySelector('#app');
const basePath = getBasePath();

let portfolio = null;
let activeSectionId = null;

init();

async function init() {
  portfolio = await loadPortfolio();
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}

async function loadPortfolio() {
  const response = await fetch(`${basePath}data/portfolio-sections.json`);
  if (!response.ok) {
    throw new Error('Portfolio data could not be loaded.');
  }
  return response.json();
}

function renderRoute() {
  const route = getRoute();
  if (route.type === 'section') {
    renderSection(route.id);
  } else if (route.type === 'shop') {
    renderShop();
  } else {
    renderHome();
  }
  resetScrollReveals();
  initScrollReveals();
}

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) return { type: 'home' };
  if (hash === 'shop') return { type: 'shop' };
  if (hash.startsWith('section/')) return { type: 'section', id: hash.replace('section/', '') };
  return { type: 'home' };
}

function renderHome() {
  activeSectionId = null;
  app.innerHTML = `
    <main class="home-shell" aria-labelledby="home-title">
      <section class="home-hero">
        <p class="home-kicker reveal-item">Creative portfolio / future store</p>
        <h1 id="home-title" class="home-title">Dor Fellous</h1>
        <nav class="category-menu" aria-label="Portfolio categories">
          ${portfolio.sections.map((section, index) => categoryButton(section.title, `section/${section.id}`, index)).join('')}
          ${categoryButton('Shop', 'shop', portfolio.sections.length)}
        </nav>
      </section>
    </main>
  `;
  bindCategoryButtons();
}

function categoryButton(label, route, index) {
  return `
    <button class="category-link" type="button" data-route="${route}" style="--delay:${index * 78}ms">
      <span>${escapeHtml(label)}</span>
    </button>
  `;
}

function bindCategoryButtons() {
  document.querySelectorAll('.category-link').forEach((button) => {
    button.addEventListener('click', async () => {
      const route = button.dataset.route;
      await disperseText(button);
      window.location.hash = `#/${route}`;
    });
  });
}

function renderSection(sectionId) {
  const section = portfolio.sections.find((item) => item.id === sectionId);
  if (!section) {
    renderHome();
    return;
  }

  activeSectionId = section.id;
  const currentIndex = portfolio.sections.findIndex((item) => item.id === section.id);
  const prev = portfolio.sections[currentIndex - 1];
  const next = portfolio.sections[currentIndex + 1];

  app.innerHTML = `
    <main class="section-shell">
      ${siteHeader()}
      <article class="portfolio-section" aria-labelledby="section-title">
        <header class="section-hero reveal-item">
          <p class="section-count">${String(section.order).padStart(2, '0')}</p>
          <h1 id="section-title">${escapeHtml(section.title)}</h1>
        </header>
        <div class="section-body">
          ${renderBlocks(section.blocks)}
          ${renderImageSequence(section.images)}
        </div>
      </article>
      ${sectionPager(prev, next)}
    </main>
  `;
}

function renderShop() {
  activeSectionId = 'shop';
  app.innerHTML = `
    <main class="section-shell">
      ${siteHeader()}
      <section class="shop-page reveal-item" aria-labelledby="shop-title">
        <p class="section-count">Store foundation</p>
        <h1 id="shop-title">Shop</h1>
        <p>Shop coming soon</p>
      </section>
    </main>
  `;
}

function siteHeader() {
  return `
    <header class="site-header">
      <a href="#/" class="home-link">Dor Fellous</a>
      <nav aria-label="Category navigation">
        <a href="#/">Menu</a>
        <a href="#/shop" ${activeSectionId === 'shop' ? 'aria-current="page"' : ''}>Shop</a>
      </nav>
    </header>
  `;
}

function renderBlocks(blocks) {
  return `
    <div class="text-flow">
      ${blocks.map((block) => {
        if (block.type === 'heading') {
          return `<h2 class="reveal-item">${linkify(block.text)}</h2>`;
        }
        return `<p class="reveal-item">${linkify(block.text)}</p>`;
      }).join('')}
    </div>
  `;
}

function renderImageSequence(images) {
  const section = portfolio.sections.find((item) => item.id === activeSectionId);
  if (section?.sheets?.length) {
    return `
      <div class="image-sequence">
        ${section.sheets.map((sheet) => `
          <figure class="portfolio-sheet reveal-item">
            <img src="${basePath}${sheet.src}" alt="${escapeHtml(section.title)} visual sequence" loading="lazy" decoding="async" width="${sheet.width}" height="${sheet.height}">
          </figure>
        `).join('')}
      </div>
    `;
  }

  if (!images.length) return '';
  const rows = groupImages(images);
  return `
    <div class="image-sequence">
      ${rows.map((row) => `
        <div class="image-row reveal-item" style="--cols:${row.length}">
          ${row.map((image) => `
            <figure class="portfolio-image" style="--ratio:${image.width} / ${image.height}">
              <img src="${basePath}${image.src}" alt="${escapeHtml(activeSectionId)} portfolio image ${escapeHtml(image.id)}" loading="lazy" decoding="async" width="${image.width}" height="${image.height}">
            </figure>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

function groupImages(images) {
  const rows = [];
  images.forEach((image) => {
    const current = rows[rows.length - 1];
    if (!current) {
      rows.push([image]);
      return;
    }
    const averageTop = current.reduce((sum, item) => sum + item.sourceTop, 0) / current.length;
    const threshold = Math.max(120, Math.min(430, Math.max(...current.map((item) => item.layoutHeight)) * 0.42));
    if (Math.abs(image.sourceTop - averageTop) <= threshold && current.length < 4) {
      current.push(image);
    } else {
      rows.push([image]);
    }
  });
  return rows.map((row) => row.sort((a, b) => a.sourceX - b.sourceX));
}

function sectionPager(prev, next) {
  return `
    <nav class="section-pager" aria-label="Adjacent categories">
      ${prev ? `<a href="#/section/${prev.id}">Previous<br><span>${escapeHtml(prev.title)}</span></a>` : '<span></span>'}
      ${next ? `<a href="#/section/${next.id}">Next<br><span>${escapeHtml(next.title)}</span></a>` : '<a href="#/shop">Next<br><span>Shop</span></a>'}
    </nav>
  `;
}

function linkify(text) {
  const escaped = escapeHtml(text);
  return escaped.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getBasePath() {
  if (import.meta.env?.BASE_URL) return import.meta.env.BASE_URL;
  return './public/';
}
