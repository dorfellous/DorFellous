import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScrollReveals, initAmbientScrollMotion } from './animations.js';
import { initScrollVideo } from './scrollVideo.js';
import { loadSiteContent, renderSiteContent } from './contentRenderer.js';
import { initEditor } from './editor.js';

gsap.registerPlugin(ScrollTrigger);

const app = document.querySelector('#app');
const params = new URLSearchParams(window.location.search);
const isEditorMode = params.get('edit') === 'true' || window.location.pathname.endsWith('/editor');

try {
  const content = await loadSiteContent();
  renderSiteContent(content, app);
  initializeAnimations();

  if (isEditorMode) {
    initEditor({ content, app, onPreview: initializeAnimations });
  }
} catch (error) {
  app.innerHTML = `<section class="section"><div class="section-inner"><p class="body-copy">Content could not load. Check public/content/site-content.json.</p></div></section>`;
  console.error(error);
}

function initializeAnimations() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  gsap.killTweensOf('*');
  initScrollReveals(gsap, ScrollTrigger);
  initAmbientScrollMotion(gsap, ScrollTrigger);
  initScrollVideo(gsap, ScrollTrigger);
  ScrollTrigger.refresh();
}

window.addEventListener('load', () => ScrollTrigger.refresh());
