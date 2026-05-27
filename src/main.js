import { fractureText, initScrollReveals, resetScrollReveals } from './animations.js';
import { StoreLanding, CollectionGrid, ArchiveCollections } from './storeComponents.js';
import { storeCategories, storeProducts, archiveCollections } from './storeData.js';
import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs';

const app = document.querySelector('#app');
const basePath = getBasePath();
// Replace this file to change the scroll-controlled opening video.
const heroVideoSrc = getHeroVideoSrc();
// Replace this file to change the scroll-reactive background behind site content.
const contentBackgroundVideoSrc = getContentBackgroundVideoSrc();
// Replace this file to change the exact PDF shown in the Portfolio category.
const portfolioPdfSrc = getPortfolioPdfSrc();
const mainCategories = [
  { id: 'about', label: 'About' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'press', label: 'Press' },
  { id: 'store', label: 'Store' },
];
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
const pdfWorkerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs';
const pdfSupportPath = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/';
const maxPdfSliceHeight = 1400;
const maxPdfRenderScale = 2;
const scrubEndSafetySeconds = 0.06;
const heroRequiredBufferRatio = 0.95;
const backgroundRequiredBufferRatio = 0.16;

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

let portfolio = null;
let activeSectionId = null;
let destroyScrollHero = null;
let destroyContentBackgroundVideo = null;
let activePdfRenderController = null;
let routeListenerBound = false;

init();

async function init() {
  const loader = initLoadingScreen();
  addPreloadHint(heroVideoSrc, 'video');
  addPreloadHint(contentBackgroundVideoSrc, 'video');

  try {
    loader.setProgress(0.08);
    portfolio = await loadPortfolio();
    loader.setProgress(0.24);
    bindRouteListener();
    renderRoute();
    await waitForInitialAssets(loader);
  } catch (error) {
    console.warn('Initial site loading finished with a fallback.', error);
    if (!portfolio) portfolio = { sections: [], shop: {} };
    bindRouteListener();
    renderRoute();
  } finally {
    loader.complete();
  }
}

function bindRouteListener() {
  if (routeListenerBound) return;
  routeListenerBound = true;
  window.addEventListener('hashchange', renderRoute);
}

function initLoadingScreen() {
  const loader = document.createElement('div');
  loader.className = 'site-loader';
  loader.innerHTML = `
    <div class="site-loader__content" role="status" aria-live="polite">
      <div class="site-loader__ring" aria-hidden="true">
        <span></span>
      </div>
      <p class="site-loader__text">Entering Dor Fellous</p>
    </div>
  `;
  document.body.prepend(loader);
  document.body.classList.add('is-loading');

  let currentProgress = 0;
  const ring = loader.querySelector('.site-loader__ring');
  const text = loader.querySelector('.site-loader__text');

  const setProgress = (value) => {
    currentProgress = Math.max(currentProgress, Math.min(1, value));
    ring.style.setProperty('--loader-progress', `${currentProgress * 100}%`);
  };

  const complete = () => {
    setProgress(1);
    text.textContent = 'Dor Fellous';
    window.setTimeout(() => {
      loader.classList.add('is-complete');
      document.body.classList.remove('is-loading');
      window.setTimeout(() => loader.remove(), 720);
    }, 520);
  };
  const setMessage = (message) => {
    text.textContent = message;
  };

  return { setProgress, setMessage, complete };
}

async function waitForInitialAssets(loader) {
  const requiredAssets = Promise.allSettled([
    waitForVideoBuffer(document.querySelector('.scroll-hero-video'), {
      label: 'Opening hero video',
      targetBufferRatio: heroRequiredBufferRatio,
      timeoutMs: 45000,
      progressBase: 0.24,
      progressSpan: 0.5,
      loader,
      seekProbe: true,
    }).then(() => loader.setProgress(0.74)),
    waitForVideoBuffer(document.querySelector('.content-background-video'), {
      label: 'Content background video',
      targetBufferRatio: backgroundRequiredBufferRatio,
      timeoutMs: 18000,
      progressBase: 0.74,
      progressSpan: 0.1,
      loader,
    }).then(() => loader.setProgress(0.84)),
    withTimeout(
      waitForPortfolioDocument(),
      4500,
      'Portfolio PDF preload timed out; pages will render progressively.',
    ).then(() => loader.setProgress(0.9)),
  ]);

  await withTimeout(requiredAssets, 52000, 'Initial visual assets took too long to preload.');
}

function waitForVideoBuffer(video, options = {}) {
  if (!video) return Promise.resolve();
  const {
    label = 'Video',
    targetBufferRatio = 0.2,
    timeoutMs = 18000,
    progressBase = 0,
    progressSpan = 0,
    loader = null,
    seekProbe = false,
  } = options;
  video.autoplay = false;
  video.controls = false;
  video.loop = false;
  video.preload = 'auto';
  video.muted = true;
  video.playsInline = true;
  try {
    video.currentTime = 0;
  } catch {
    // Metadata may not be available yet.
  }
  video.pause();

  return new Promise((resolve) => {
    let settled = false;
    let warmupStarted = false;
    const updateProgress = () => {
      const bufferRatio = getVideoBufferedRatio(video);
      const scaledProgress = targetBufferRatio > 0
        ? Math.min(1, bufferRatio / targetBufferRatio)
        : 1;
      loader?.setProgress(progressBase + progressSpan * scaledProgress);
      return bufferRatio;
    };
    const done = async (reason) => {
      if (settled) return;
      settled = true;
      cleanup();
      const bufferRatio = updateProgress();
      if (seekProbe) await probeVideoSeek(video, label);
      try {
        video.currentTime = 0;
      } catch {
        // Leave the first available frame if the browser blocks early seeking.
      }
      video.pause();
      if (reason === 'timeout') {
        loader?.setMessage('Connection is slow');
        console.warn(
          `${label} continued after buffering ${(bufferRatio * 100).toFixed(1)}% ` +
            `of the target ${(targetBufferRatio * 100).toFixed(0)}%.`,
          video.currentSrc || video.src,
        );
      }
      resolve();
    };
    const onData = () => {
      const bufferRatio = updateProgress();
      if (!warmupStarted && video.readyState >= 2) {
        warmupStarted = true;
        const playAttempt = video.play();
        if (playAttempt?.then) {
          playAttempt
            .then(() => {
              video.pause();
            })
            .catch(() => {
              video.pause();
            });
        }
      }
      if (
        video.readyState >= 2 &&
        Number.isFinite(video.duration) &&
        video.duration > 0 &&
        bufferRatio >= targetBufferRatio
      ) {
        done('buffered');
      }
    };
    const onError = () => {
      console.warn(`${label} preload fell back before full readiness.`, video.currentSrc || video.src);
      done('error');
    };
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
      video.removeEventListener('loadedmetadata', onData);
      video.removeEventListener('loadeddata', onData);
      video.removeEventListener('progress', onData);
      video.removeEventListener('canplay', onData);
      video.removeEventListener('canplaythrough', onData);
      video.removeEventListener('suspend', onData);
      video.removeEventListener('stalled', onData);
      video.removeEventListener('error', onError);
    };
    const timeoutId = window.setTimeout(() => {
      done('timeout');
    }, timeoutMs);
    const intervalId = window.setInterval(onData, 250);

    video.addEventListener('loadedmetadata', onData);
    video.addEventListener('loadeddata', onData);
    video.addEventListener('progress', onData);
    video.addEventListener('canplay', onData);
    video.addEventListener('canplaythrough', onData);
    video.addEventListener('suspend', onData);
    video.addEventListener('stalled', onData);
    video.addEventListener('error', onError);
    video.load();
    onData();
  });
}

function getVideoBufferedRatio(video) {
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  if (!duration || !video.buffered?.length) return 0;

  let contiguousEnd = 0;
  for (let index = 0; index < video.buffered.length; index += 1) {
    const start = video.buffered.start(index);
    const end = video.buffered.end(index);
    if (start <= contiguousEnd + 0.35) {
      contiguousEnd = Math.max(contiguousEnd, end);
    }
  }

  return Math.min(1, Math.max(0, contiguousEnd / duration));
}

async function probeVideoSeek(video, label) {
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  if (!duration) return;

  const testTime = Math.min(getSafeScrubEndTime(duration), Math.max(0.2, duration * 0.18));
  const canSeek = await seekVideoTo(video, testTime, 1800);
  const canReturn = await seekVideoTo(video, 0, 1200);
  video.pause();

  if (!canSeek || !canReturn) {
    console.warn(`${label} did not finish its preload seek probe; entering with scroll fallback.`);
  }
}

function seekVideoTo(video, time, timeoutMs) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (result) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };
    const onSeeked = () => done(true);
    const onError = () => done(false);
    const timeoutId = window.setTimeout(() => done(false), timeoutMs);

    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });

    try {
      video.currentTime = time;
      if (Math.abs(video.currentTime - time) < 0.015) done(true);
    } catch {
      done(false);
    }
  });
}

async function waitForPortfolioDocument() {
  try {
    const pdf = await pdfjsLib.getDocument({
      url: portfolioPdfSrc,
      cMapUrl: `${pdfSupportPath}cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `${pdfSupportPath}standard_fonts/`,
      wasmUrl: `${pdfSupportPath}wasm/`,
    }).promise;
    await pdf.getPage(1);
  } catch (error) {
    console.warn('Portfolio PDF preload fell back.', error);
  }
}

function addPreloadHint(href, as) {
  if (!href || document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = href;
  if (as === 'video') link.type = 'video/mp4';
  document.head.appendChild(link);
}

function withTimeout(promise, timeoutMs, warning) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      window.setTimeout(() => {
        console.warn(warning);
        resolve();
      }, timeoutMs);
    }),
  ]);
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
  destroyContentBackgroundVideo?.();
  destroyContentBackgroundVideo = null;
  activePdfRenderController?.abort();
  activePdfRenderController = null;

  const route = getRoute();
  if (route.type === 'category') {
    renderHome(route.id, route);
  } else if (route.type === 'section') {
    renderSection(route.id);
  } else if (route.type === 'shop') {
    renderHome('store', route);
  } else {
    renderHome();
  }
  resetScrollReveals();
  initScrollReveals();
  if (route.type === 'category' && route.id === 'portfolio') {
    initPortfolioPdfViewer();
  }
}

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [path, queryString = ''] = hash.split('?');
  const params = Object.fromEntries(new URLSearchParams(queryString));
  if (path === 'store') return { type: 'category', id: 'store', storeView: 'landing', params };
  if (path.startsWith('store/')) {
    const storePath = path.replace('store/', '');
    if (storePath === 'archive') {
      return { type: 'category', id: 'store', storeView: 'archive', params };
    }
    if (storeCategories.some((category) => category.id === storePath && category.id !== 'archive')) {
      return { type: 'category', id: 'store', storeView: 'collection', collectionId: storePath, params };
    }
    return { type: 'category', id: 'store', storeView: 'landing', params };
  }
  if (!hash) return { type: 'home' };
  if (mainCategories.some((category) => category.id === path)) {
    return { type: 'category', id: path, params };
  }
  if (path === 'shop') return { type: 'shop', storeView: 'landing', params };
  if (path.startsWith('section/')) return { type: 'section', id: path.replace('section/', '') };
  return { type: 'home' };
}

function renderHome(activeCategory = null, route = {}) {
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
      <section class="content-video-region" data-content-video-region aria-label="Site categories">
        <div class="content-background-video-layer" aria-hidden="true">
          <video
            class="content-background-video"
            src="${contentBackgroundVideoSrc}"
            muted
            playsinline
            preload="auto"
          ></video>
          <div class="content-background-scrim"></div>
        </div>
        <div class="content-video-foreground home-hero">
          <nav class="main-category-menu reveal-item" aria-label="Main categories">
            ${mainCategories.map((category, index) => mainCategoryButton(category, index, activeCategory)).join('')}
          </nav>
          ${activeCategory ? renderMainCategoryContent(activeCategory, route) : ''}
        </div>
      </section>
    </main>
  `;
  destroyScrollHero = initScrollVideoHero();
  destroyContentBackgroundVideo = initContentBackgroundVideo();
  bindMainCategoryButtons();
  bindStoreControls(route);
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
    const targetTime = getScrollScrubTime(progress, getDuration());
    const seekThreshold = Math.max(0.03, getDuration() / 900);

    if (metadataReady && Math.abs(video.currentTime - targetTime) > seekThreshold) {
      unlockVideoSeeking();
      try {
        seekVideoForScroll(video, targetTime);
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

function initContentBackgroundVideo() {
  const region = document.querySelector('[data-content-video-region]');
  const video = document.querySelector('.content-background-video');
  if (!region || !video) return null;

  const fallbackDuration = 10;
  let metadataReady = Number.isFinite(video.duration) && video.duration > 0;
  let rafId = 0;
  let hasUnlockedSeek = false;
  let latestTargetTime = 0;

  video.autoplay = false;
  video.loop = false;
  video.controls = false;
  video.pause();
  video.muted = true;
  video.playsInline = true;
  video.removeAttribute('autoplay');
  video.removeAttribute('loop');
  video.removeAttribute('controls');

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const getDuration = () => (metadataReady && Number.isFinite(video.duration) ? video.duration : fallbackDuration);

  const update = () => {
    rafId = 0;
    const regionTop = region.getBoundingClientRect().top + window.scrollY;
    const scrollableDistance = Math.max(1, region.scrollHeight - window.innerHeight);
    const progress = clamp((window.scrollY - regionTop) / scrollableDistance);
    const targetTime = getScrollScrubTime(progress, getDuration());
    const seekThreshold = Math.max(0.03, getDuration() / 900);
    latestTargetTime = targetTime;

    if (metadataReady && Math.abs(video.currentTime - targetTime) > seekThreshold) {
      unlockVideoSeeking();
      try {
        seekVideoForScroll(video, targetTime);
      } catch {
        // Some mobile browsers reject seeks until the video is fully ready.
      }
    }

    if (!video.paused) video.pause();
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
          try {
            video.currentTime = latestTargetTime;
          } catch {
            // Keep the fallback frame if the browser still blocks seeking.
          }
          requestUpdate();
        })
        .catch(() => {
          video.pause();
          requestUpdate();
        });
      window.setTimeout(() => {
        video.pause();
        requestUpdate();
      }, 80);
    } else {
      video.pause();
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

function getScrollScrubTime(progress, duration) {
  const safeProgress = Math.min(1, Math.max(0, progress));
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  if (!safeDuration) return 0;
  return safeProgress * getSafeScrubEndTime(safeDuration);
}

function getSafeScrubEndTime(duration) {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return Math.max(0, duration - Math.min(scrubEndSafetySeconds, duration * 0.01));
}

function seekVideoForScroll(video, targetTime) {
  if (typeof video.fastSeek === 'function' && Math.abs(video.currentTime - targetTime) > 0.65) {
    video.fastSeek(targetTime);
  } else {
    video.currentTime = targetTime;
  }
  if (!video.paused) video.pause();
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

function renderMainCategoryContent(category, route = {}) {
  if (category === 'about') return renderAboutCategory();
  if (category === 'portfolio') return renderPortfolioCategory();
  if (category === 'press') return renderEmptyCategory('Press', 'Press coming soon');
  if (category === 'store') return renderStoreCategory(route);
  return '';
}

function renderStoreCategory(route = {}) {
  if (route.storeView === 'archive') {
    const filters = normalizeStoreFilters(route.params);
    return ArchiveCollections({
      archiveGroups: archiveCollections,
      filteredProducts: getFilteredStoreProducts({ ...filters, category: null }),
      filters,
    });
  }

  if (route.storeView === 'collection') {
    const category = storeCategories.find((item) => item.id === route.collectionId);
    const filters = normalizeStoreFilters(route.params);
    return CollectionGrid({
      category,
      products: getFilteredStoreProducts({ ...filters, category: route.collectionId }),
      filters,
    });
  }

  return StoreLanding({ categories: storeCategories });
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
  return `
    <section class="category-content category-content--portfolio" aria-labelledby="portfolio-title">
      <header class="category-content-header reveal-item">
        <p class="section-count">02</p>
        <h2 id="portfolio-title">Portfolio</h2>
      </header>
      <div class="portfolio-pdf-pages" data-pdf-src="${portfolioPdfSrc}" aria-label="Dor Fellous portfolio PDF pages"></div>
      <p class="portfolio-pdf-fallback">
        <a href="${portfolioPdfSrc}" target="_blank" rel="noreferrer">Open Full Portfolio PDF</a>
      </p>
    </section>
  `;
}

async function initPortfolioPdfViewer() {
  const container = document.querySelector('.portfolio-pdf-pages');
  if (!container) return;

  const controller = new AbortController();
  activePdfRenderController = controller;
  container.innerHTML = '<p class="portfolio-pdf-loading">Loading portfolio...</p>';

  try {
    const pdf = await pdfjsLib.getDocument({
      url: portfolioPdfSrc,
      cMapUrl: `${pdfSupportPath}cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `${pdfSupportPath}standard_fonts/`,
      wasmUrl: `${pdfSupportPath}wasm/`,
    }).promise;
    if (controller.signal.aborted) return;

    container.innerHTML = '';
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      if (controller.signal.aborted) return;
      await renderPortfolioPdfPage(pdf, pageNumber, container, controller.signal);
      await waitForIdleFrame();
    }
  } catch (error) {
    if (controller.signal.aborted) return;
    container.innerHTML = `
      <p class="portfolio-pdf-error">
        The portfolio PDF could not be rendered here. Please use the link below to open it directly.
      </p>
    `;
    console.error('Portfolio PDF could not be rendered.', error);
  }
}

async function renderPortfolioPdfPage(pdf, pageNumber, container, signal) {
  const page = await pdf.getPage(pageNumber);
  if (signal.aborted) return;

  const baseViewport = page.getViewport({ scale: 1 });
  const availableWidth = Math.min(container.clientWidth || 1180, 1180);
  const cssScale = availableWidth / baseViewport.width;
  const viewport = page.getViewport({ scale: cssScale });
  const sliceCount = Math.ceil(viewport.height / maxPdfSliceHeight);

  for (let sliceIndex = 0; sliceIndex < sliceCount; sliceIndex += 1) {
    if (signal.aborted) return;
    await renderPortfolioPdfSlice(page, viewport, pageNumber, sliceIndex, sliceCount, container, signal);
    await waitForIdleFrame();
  }
}

async function renderPortfolioPdfSlice(page, viewport, pageNumber, sliceIndex, sliceCount, container, signal) {
  const sliceTop = sliceIndex * maxPdfSliceHeight;
  const sliceHeight = Math.min(maxPdfSliceHeight, viewport.height - sliceTop);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, maxPdfRenderScale);
  const pageShell = document.createElement('figure');
  pageShell.className = 'portfolio-pdf-page';
  pageShell.style.minHeight = `${Math.round(sliceHeight)}px`;
  pageShell.innerHTML = '<span>Rendering page...</span>';

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false });

  canvas.width = Math.ceil(viewport.width * pixelRatio);
  canvas.height = Math.ceil(sliceHeight * pixelRatio);
  canvas.style.width = `${Math.ceil(viewport.width)}px`;
  canvas.style.height = `${Math.ceil(sliceHeight)}px`;
  container.appendChild(pageShell);

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const renderTask = page.render({
    canvasContext: context,
    viewport,
    transform: [pixelRatio, 0, 0, pixelRatio, 0, -sliceTop * pixelRatio],
    background: '#ffffff',
  });

  try {
    await renderTask.promise;
  } catch (error) {
    pageShell.classList.add('has-error');
    pageShell.textContent = sliceCount > 1
      ? `Page ${pageNumber}, section ${sliceIndex + 1} could not render.`
      : `Page ${pageNumber} could not render.`;
    throw error;
  }

  if (!signal.aborted) {
    pageShell.style.minHeight = '';
    pageShell.replaceChildren(canvas);
    pageShell.classList.add('is-rendered');
  }
}

function waitForIdleFrame() {
  return new Promise((resolve) => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(resolve, { timeout: 160 });
    } else {
      window.requestAnimationFrame(resolve);
    }
  });
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
      ${StoreLanding({ categories: storeCategories })}
    </main>
  `;
  bindStoreControls({ storeView: 'landing', params: {} });
}

function bindStoreControls(route = {}) {
  const form = document.querySelector('[data-store-filter-form]');
  if (!form) return;

  const updateStoreHash = () => {
    const formData = new FormData(form);
    const params = new URLSearchParams();
    const availability = formData.get('availability');
    const from = formData.get('from');
    const to = formData.get('to');
    const sort = formData.get('sort');

    if (availability && availability !== 'all') params.set('availability', availability);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (sort && sort !== 'featured') params.set('sort', sort);
    if (route.params?.tag) params.set('tag', route.params.tag);

    const path = route.storeView === 'collection' && route.collectionId
      ? `store/${route.collectionId}`
      : 'store/archive';
    window.location.hash = `#/${path}${params.toString() ? `?${params.toString()}` : ''}`;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    updateStoreHash();
  });

  form.querySelectorAll('input[type="radio"], select, input[type="number"]').forEach((control) => {
    control.addEventListener('change', updateStoreHash);
  });
}

function normalizeStoreFilters(params = {}) {
  return {
    availability: params.availability || 'all',
    from: params.from || '',
    to: params.to || '',
    sort: params.sort || 'featured',
    tag: params.tag || '',
  };
}

function getFilteredStoreProducts(filters = {}) {
  const from = Number.parseFloat(filters.from);
  const to = Number.parseFloat(filters.to);
  const hasFrom = Number.isFinite(from);
  const hasTo = Number.isFinite(to);

  return storeProducts
    .filter((product) => !filters.category || product.category === filters.category)
    .filter((product) => !filters.tag || product.tags?.includes(filters.tag))
    .filter((product) => {
      if (filters.availability === 'in-stock') return product.available;
      if (filters.availability === 'out-of-stock') return !product.available;
      return true;
    })
    .filter((product) => {
      if (!Number.isFinite(product.price)) return true;
      if (hasFrom && product.price < from) return false;
      if (hasTo && product.price > to) return false;
      return true;
    })
    .sort((a, b) => sortStoreProducts(a, b, filters.sort));
}

function sortStoreProducts(a, b, sort = 'featured') {
  if (sort === 'best-selling') return (a.bestSelling || 999) - (b.bestSelling || 999);
  if (sort === 'az') return a.name.localeCompare(b.name);
  if (sort === 'za') return b.name.localeCompare(a.name);
  if (sort === 'price-low-high') return getProductPrice(a) - getProductPrice(b);
  if (sort === 'price-high-low') return getProductPrice(b) - getProductPrice(a);
  if (sort === 'date-old-new') return new Date(a.date) - new Date(b.date);
  if (sort === 'date-new-old') return new Date(b.date) - new Date(a.date);
  return (a.featured || 999) - (b.featured || 999);
}

function getProductPrice(product) {
  return Number.isFinite(product.price) ? product.price : Number.POSITIVE_INFINITY;
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
  const encodedVideoName = 'VIDEO%20FOR%20WEBSITE%20READY%20.mp4';
  if (import.meta.env?.BASE_URL) return `${basePath}assets/video/${encodedVideoName}`;
  return `./${encodedVideoName}`;
}

function getContentBackgroundVideoSrc() {
  const encodedVideoName = 'Background%20opmtimized%20.mp4';
  if (import.meta.env?.BASE_URL) return `${basePath}assets/video/${encodedVideoName}`;
  return `./${encodedVideoName}`;
}

function getPortfolioPdfSrc() {
  const encodedPdfName = 'ready%20Dor%20fellous%20Creative%20protfolio%202026%202.pdf';
  if (import.meta.env?.BASE_URL) return `${basePath}assets/pdf/${encodedPdfName}`;
  return `./public/assets/pdf/${encodedPdfName}`;
}
