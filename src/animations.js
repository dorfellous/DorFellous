let revealObserver = null;

export function initScrollReveals() {
  const items = document.querySelectorAll('.reveal-item');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );

  items.forEach((item) => revealObserver.observe(item));
}

export function resetScrollReveals() {
  if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }
}

export function disperseText(button) {
  return fragmentText(button, 'disperse-layer');
}

export function fractureText(button) {
  return fragmentText(button, 'fracture-layer');
}

function fragmentText(button, layerClassName) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return Promise.resolve();
  }

  const label = button.textContent.trim();
  const rect = button.getBoundingClientRect();
  const overlay = document.createElement('div');
  overlay.className = layerClassName;
  overlay.style.left = `${rect.left}px`;
  overlay.style.top = `${rect.top}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;

  const characters = [...label];
  characters.forEach((character, index) => {
    const span = document.createElement('span');
    span.textContent = character === ' ' ? '\u00a0' : character;
    span.style.setProperty('--x', `${Math.cos(index * 1.7) * (22 + index * 1.2)}px`);
    span.style.setProperty('--y', `${Math.sin(index * 1.3) * (16 + index * 0.9)}px`);
    span.style.setProperty('--r', `${(index % 2 ? 1 : -1) * (8 + index * 0.4)}deg`);
    overlay.appendChild(span);
  });

  document.body.appendChild(overlay);
  button.classList.add('is-disappearing');

  return new Promise((resolve) => {
    window.setTimeout(() => {
      overlay.remove();
      resolve();
    }, 540);
  });
}
