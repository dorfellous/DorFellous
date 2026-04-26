import * as THREE from 'three';
import { createPortfolioScene } from './scene.js';
import { createFirstPersonControls } from './controls.js';
import { createNavigation } from './navigation.js';

const canvas = document.querySelector('#scene-canvas');
const desktopStart = document.querySelector('#desktop-start');
const enterButton = document.querySelector('#enter-button');
const sectionPage = document.querySelector('#section-page');
const sectionTitle = document.querySelector('#section-title');
const sectionCopy = document.querySelector('#section-copy');
const sectionKicker = document.querySelector('#section-kicker');
const backButton = document.querySelector('#back-button');
const transitionLayer = document.querySelector('#transition-layer');
const mobileFallback = document.querySelector('#mobile-fallback');
const mobileLinks = document.querySelector('#mobile-section-links');

const sceneState = createPortfolioScene(canvas);
const controls = createFirstPersonControls(sceneState.camera, canvas);
const navigation = createNavigation({
  camera: sceneState.camera,
  canvas,
  controls,
  buildingTargets: sceneState.buildingTargets,
  sectionPage,
  sectionTitle,
  sectionCopy,
  sectionKicker,
  backButton,
  transitionLayer,
  mobileLinks,
  sceneState
});

const clock = new THREE.Clock();

enterButton.addEventListener('click', () => {
  desktopStart.classList.add('is-hidden');
  controls.lockPointer();
});

if (isCoarsePointer()) {
  mobileFallback.hidden = false;
  desktopStart.hidden = true;
} else {
  mobileFallback.hidden = true;
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.05);
  controls.update(delta);
  navigation.update(delta);
  sceneState.render();
  requestAnimationFrame(animate);
}

animate();

function isCoarsePointer() {
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760;
}
