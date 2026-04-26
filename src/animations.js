export function initScrollReveals(gsap, ScrollTrigger) {
  setupTextReveals(gsap, ScrollTrigger);
  setupImageReveals(gsap, ScrollTrigger);
}

export function initAmbientScrollMotion(gsap, ScrollTrigger) {
  gsap.utils.toArray('.section-inner').forEach((section, index) => {
    gsap.to(section, {
      yPercent: index % 2 === 0 ? -5 : 5,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });
}

function setupTextReveals(gsap, ScrollTrigger) {
  gsap.utils.toArray('.reveal-text').forEach((element) => {
    const originalText = element.textContent.trim();
    element.setAttribute('aria-label', originalText);
    element.textContent = '';

    const words = originalText.split(' ');
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'word-fragment';
      span.textContent = word;
      span.style.setProperty('--delay-index', index);
      element.appendChild(span);
      if (index < words.length - 1) element.append(' ');
    });

    const fragments = element.querySelectorAll('.word-fragment');
    gsap.fromTo(
      fragments,
      {
        opacity: 0,
        y: 28,
        filter: 'blur(18px)',
        scaleY: 1.45,
        skewX: 10
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        scaleY: 1,
        skewX: 0,
        stagger: 0.035,
        duration: 1.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 82%',
          end: 'top 42%',
          scrub: 0.7
        }
      }
    );
  });
}

function setupImageReveals(gsap, ScrollTrigger) {
  gsap.utils.toArray('.reveal-image').forEach((figure) => {
    const surface = figure.querySelector('.image-surface');

    gsap.fromTo(
      figure,
      {
        opacity: 0.25,
        filter: 'blur(22px) contrast(1.7)',
        clipPath: 'inset(18% 16% 24% 12%)'
      },
      {
        opacity: 1,
        filter: 'blur(0px) contrast(1)',
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: {
          trigger: figure,
          start: 'top 88%',
          end: 'center 45%',
          scrub: true
        }
      }
    );

    gsap.fromTo(
      surface,
      {
        backgroundPosition: '0% 50%, 100% 0%, 50% 50%'
      },
      {
        backgroundPosition: '100% 50%, 0% 100%, 50% 35%',
        ease: 'none',
        scrollTrigger: {
          trigger: figure,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );
  });
}
