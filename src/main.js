import { fractureText, initScrollReveals, resetScrollReveals } from './animations.js';

const app = document.querySelector('#app');
const basePath = getBasePath();
// Replace this file to change the scroll-controlled opening video.
const heroVideoSrc = getHeroVideoSrc();
const mainCategories = [
  { id: 'about', label: 'About' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'press', label: 'Press' },
  { id: 'store', label: 'Store' },
];
const portfolioExcludedSectionIds = new Set(['about', 'press']);
const cleanPdfTitles = {
  'early-material': 'Early Emotional / Material Work',
  milestones: 'Early Exhibitions and Milestones',
  'digital-tools': 'Digital Patternmaking / Transition Into Digital Tools',
  'wearable-archive': 'Daily Collection and Nightlife Collection / Wearable Collection',
  shoes: 'Product Development / Exhibit 1: Shoes',
  bags: 'Product Development / Exhibit 2: Bags',
  glasses: 'Product Development / Exhibit 3: Glasses',
  'body-extensions': 'Product Development / Exhibit 4: Accessories / Body Extensions',
};
const contentBoundaryFixes = {
  'digital-fashion': {
    startMarker: 'Digital Fashion Digital fashion',
    replacement: 'Digital Fashion Digital fashion',
  },
};

let portfolio = null;
let activeSectionId = null;
let destroyScrollHero = null;

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
  const data = await response.json();
  return {
    ...data,
    sections: data.sections.map(normalizeSection),
  };
}

function normalizeSection(section) {
  const fixedSection = {
    ...section,
    title: cleanPdfTitles[section.id] || section.title,
  };
  const boundaryFix = contentBoundaryFixes[section.id];
  if (!boundaryFix) return fixedSection;

  const startIndex = fixedSection.blocks.findIndex((block) =>
    block.text.includes(boundaryFix.startMarker),
  );
  if (startIndex < 0) return fixedSection;

  return {
    ...fixedSection,
    blocks: fixedSection.blocks.slice(startIndex).map((block, index) => {
      if (index !== 0) return block;
      return {
        ...block,
        type: 'heading',
        text: block.text.replace(
          new RegExp(`^.*?${escapeRegExp(boundaryFix.startMarker)}`),
          boundaryFix.replacement,
        ),
      };
    }),
  };
}

function renderRoute() {
  destroyScrollHero?.();
  destroyScrollHero = null;

  const route = getRoute();
  if (route.type === 'category') {
    renderHome(route.id);
  } else if (route.type === 'section') {
    renderSection(route.id);
  } else if (route.type === 'shop') {
    renderHome('store');
  } else {
    renderHome();
  }
  resetScrollReveals();
  initScrollReveals();
}

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) return { type: 'home' };
  if (mainCategories.some((category) => category.id === hash)) {
    return { type: 'category', id: hash };
  }
  if (hash === 'shop') return { type: 'shop' };
  if (hash.startsWith('section/')) return { type: 'section', id: hash.replace('section/', '') };
  return { type: 'home' };
}

function renderHome(activeCategory = null) {
  activeSectionId = activeCategory;
  app.innerHTML = `
    <main class="home-shell" aria-labelledby="home-title">
      <section class="scroll-video-hero" aria-label="Dor Fellous opening video">
        <div class="scroll-video-sticky">
          <video
            class="scroll-hero-video"
            src="${heroVideoSrc}"
            muted
            playsinline
            preload="auto"
          ></video>
          <div class="scroll-hero-shade" aria-hidden="true"></div>
          <h1 id="home-title" class="scroll-hero-brand">Dor Fellous</h1>
        </div>
      </section>
      <section class="home-hero" aria-label="Site categories">
        <nav class="main-category-menu reveal-item" aria-label="Main categories">
          ${mainCategories.map((category, index) => mainCategoryButton(category, index, activeCategory)).join('')}
        </nav>
        ${activeCategory ? renderMainCategoryContent(activeCategory) : ''}
      </section>
    </main>
  `;
  destroyScrollHero = initScrollVideoHero();
  bindMainCategoryButtons();
}

function initScrollVideoHero() {
  const section = document.querySelector('.scroll-video-hero');
  const video = document.querySelector('.scroll-hero-video');
  if (!section || !video) return null;

  const fallbackDuration = 8;
  let metadataReady = Number.isFinite(video.duration) && video.duration > 0;
  let rafId = 0;
  let hasUnlockedSeek = false;

  video.pause();
  video.muted = true;
  video.playsInline = true;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const getDuration = () => (metadataReady && Number.isFinite(video.duration) ? video.duration : fallbackDuration);

  const update = () => {
    rafId = 0;
    const scrollableDistance = Math.max(1, section.offsetHeight - window.innerHeight);
    const progress = clamp(-section.getBoundingClientRect().top / scrollableDistance);
    const targetTime = progress * getDuration();

    if (metadataReady && Math.abs(video.currentTime - targetTime) > 0.025) {
      unlockVideoSeeking();
      try {
        video.currentTime = targetTime;
      } catch {
        // Some mobile browsers reject early seeks until the video is fully ready.
      }
    }

    const brandOpacity = clamp((progress - 0.8) / 0.16);
    const endFade = clamp((progress - 0.84) / 0.16) * 0.58;
    section.style.setProperty('--brand-opacity', brandOpacity.toFixed(3));
    section.style.setProperty('--brand-lift', `${((1 - brandOpacity) * 12).toFixed(2)}px`);
    section.style.setProperty('--end-fade', endFade.toFixed(3));
  };

  const requestUpdate = () => {
    if (!rafId) rafId = window.requestAnimationFrame(update);
  };

  const onMetadata = () => {
    metadataReady = true;
    unlockVideoSeeking();
    requestUpdate();
  };

  const unlockVideoSeeking = () => {
    if (hasUnlockedSeek) return;
    hasUnlockedSeek = true;

    const playAttempt = video.play();
    if (playAttempt?.then) {
      playAttempt
        .then(() => {
          video.pause();
          requestUpdate();
        })
        .catch(() => {
          requestUpdate();
        });
    }
  };

  video.addEventListener('loadedmetadata', onMetadata);
  video.addEventListener('canplay', onMetadata);
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  video.load();
  requestUpdate();

  return () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    video.removeEventListener('loadedmetadata', onMetadata);
    video.removeEventListener('canplay', onMetadata);
    window.removeEventListener('scroll', requestUpdate);
    window.removeEventListener('resize', requestUpdate);
  };
}

function mainCategoryButton(category, index, activeCategory) {
  return `
    <button
      class="main-category-link${activeCategory === category.id ? ' is-active' : ''}"
      type="button"
      data-category="${category.id}"
      style="--delay:${index * 90}ms"
      ${activeCategory === category.id ? 'aria-current="page"' : ''}
    >
      <span>${escapeHtml(category.label)}</span>
    </button>
  `;
}

function bindMainCategoryButtons() {
  document.querySelectorAll('.main-category-link').forEach((button) => {
    button.addEventListener('click', async () => {
      const category = button.dataset.category;
      await fractureText(button);
      window.location.hash = `#/${category}`;
    });
  });
}

function renderMainCategoryContent(category) {
  if (category === 'about') return renderAboutCategory();
  if (category === 'portfolio') return renderPortfolioCategory();
  if (category === 'press') return renderEmptyCategory('Press', 'Press coming soon');
  if (category === 'store') return renderEmptyCategory('Store', portfolio.shop?.status || 'Store coming soon');
  return '';
}

function renderAboutCategory() {
  const about = portfolio.sections.find((section) => section.id === 'about');
  if (!about) return renderEmptyCategory('About', 'About content could not be found');
  const aboutBlocks = about.blocks.filter((block, index) =>
    !(index === 0 && block.type === 'heading' && block.text === about.title),
  );

  return `
    <section class="category-content category-content--about reveal-item" aria-labelledby="about-title">
      <header class="category-content-header">
        <p class="section-count">01</p>
        <h2 id="about-title">${escapeHtml(about.title)}</h2>
      </header>
      ${renderBlocks(aboutBlocks)}
    </section>
  `;
}

function renderPortfolioCategory() {
  const sections = portfolio.sections.filter((section) => !portfolioExcludedSectionIds.has(section.id));
  return `
    <section class="category-content category-content--portfolio" aria-labelledby="portfolio-title">
      <header class="category-content-header reveal-item">
        <p class="section-count">02</p>
        <h2 id="portfolio-title">Portfolio</h2>
      </header>
      ${sections.map((section) => renderPortfolioCategorySection(section)).join('')}
    </section>
  `;
}

function renderPortfolioCategorySection(section) {
  return `
    <article class="portfolio-section category-portfolio-section reveal-item" aria-labelledby="portfolio-${section.id}">
      <header class="section-hero">
        <p class="section-count">${String(section.order).padStart(2, '0')}</p>
        <h3 id="portfolio-${section.id}">${escapeHtml(section.title)}</h3>
      </header>
      <div class="section-body">
        ${renderBlocks(section.blocks)}
        ${renderSectionMedia(section)}
      </div>
    </article>
  `;
}

function renderEmptyCategory(title, message) {
  return `
    <section class="category-content category-content--empty reveal-item" aria-labelledby="${title.toLowerCase()}-title">
      <header class="category-content-header">
        <p class="section-count">${escapeHtml(title)}</p>
        <h2 id="${title.toLowerCase()}-title">${escapeHtml(message)}</h2>
      </header>
    </section>
  `;
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
          ${renderSectionMedia(section)}
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
        ${mainCategories.map((category) => `
          <a href="#/${category.id}" ${activeSectionId === category.id ? 'aria-current="page"' : ''}>${escapeHtml(category.label)}</a>
        `).join('')}
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

function renderSectionMedia(section) {
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

  const images = section.images || [];
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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getBasePath() {
  if (import.meta.env?.BASE_URL) return import.meta.env.BASE_URL;
  return './public/';
}

function getHeroVideoSrc() {
  if (import.meta.env?.BASE_URL) return `${basePath}assets/video/0428.mp4`;
  return './0428.mp4';
}
