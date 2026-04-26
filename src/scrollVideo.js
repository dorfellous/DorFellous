export function initScrollVideo(gsap, ScrollTrigger) {
  document.querySelectorAll('[data-scroll-video]').forEach((container) => {
    initOneScrollVideo(container, gsap, ScrollTrigger);
  });
}

function initOneScrollVideo(container, gsap, ScrollTrigger) {
  const canvas = container.querySelector('canvas');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  const state = { progress: 0 };
  const src = container.dataset.src;

  if (src) {
    const video = document.createElement('video');
    video.src = src;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.style.display = 'none';
    container.appendChild(video);

    video.addEventListener('loadedmetadata', () => {
      drawVideoFrame(context, canvas, video);
      gsap.to(state, {
        progress: 1,
        ease: 'none',
        onUpdate: () => {
          video.currentTime = state.progress * Math.max(video.duration, 0.01);
          drawVideoFrame(context, canvas, video);
        },
        scrollTrigger: getVideoTrigger(container)
      });
    });
    return;
  }

  drawPlaceholderFrame(context, canvas, state.progress);
  gsap.to(state, {
    progress: 1,
    ease: 'none',
    onUpdate: () => drawPlaceholderFrame(context, canvas, state.progress),
    scrollTrigger: getVideoTrigger(container)
  });
}

function getVideoTrigger(container) {
  return {
    trigger: container,
    start: 'top 82%',
    end: 'bottom 12%',
    scrub: true
  };
}

function drawVideoFrame(context, canvas, video) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
}

function drawPlaceholderFrame(context, canvas, progress) {
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#050505');
  gradient.addColorStop(0.42, '#141414');
  gradient.addColorStop(1, '#020202');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.save();
  context.globalAlpha = 0.22;
  context.fillStyle = '#d8d0bd';
  const bandX = -width * 0.35 + progress * width * 1.35;
  context.translate(bandX, height * 0.5);
  context.rotate(-0.26);
  context.fillRect(-80, -height, 150, height * 2);
  context.restore();

  context.save();
  context.globalAlpha = 0.14;
  context.strokeStyle = '#f1ead8';
  context.lineWidth = 2;
  for (let i = 0; i < 18; i += 1) {
    const offset = (i / 18) * width;
    const x = (offset + progress * width * 0.9) % width;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x - width * 0.18, height);
    context.stroke();
  }
  context.restore();

  context.save();
  context.globalAlpha = 0.9;
  context.fillStyle = '#f4f0e4';
  context.font = '700 44px Arial, sans-serif';
  context.fillText(`FRAME ${String(Math.round(progress * 120)).padStart(3, '0')}`, 70, height - 80);
  context.font = '400 22px Arial, sans-serif';
  context.fillText('replace this canvas with real video once source media is ready', 72, height - 44);
  context.restore();

  context.save();
  context.globalAlpha = 0.16;
  for (let y = 0; y < height; y += 5) {
    context.fillStyle = y % 10 === 0 ? '#ffffff' : '#000000';
    context.fillRect(0, y, width, 1);
  }
  context.restore();
}
