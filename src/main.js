import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScrollReveals, initAmbientScrollMotion } from './animations.js';
import { initScrollVideo } from './scrollVideo.js';

gsap.registerPlugin(ScrollTrigger);

initScrollReveals(gsap, ScrollTrigger);
initAmbientScrollMotion(gsap, ScrollTrigger);
initScrollVideo(gsap, ScrollTrigger);

window.addEventListener('load', () => ScrollTrigger.refresh());
