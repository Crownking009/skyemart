document.addEventListener('DOMContentLoaded', function () {
  const section = document.querySelector('.reviews-section');
  if (!section) return;

  const slider = section.querySelector('.reviews-slider');
  const slides = Array.from(section.querySelectorAll('.review-slide'));
  const prev = section.querySelector('.reviews-prev');
  const next = section.querySelector('.reviews-next');
  const dotsWrap = section.querySelector('.reviews-dots');

  let dots = [];

  // create dots based on visible positions (will be built in layout())
  function buildDots(positions) {
    // clear existing
    dotsWrap.innerHTML = '';
    dots = [];
    for (let i = 0; i < positions; i++) {
      const d = document.createElement('button');
      d.className = 'reviews-dot';
      d.setAttribute('aria-label', `Go to reviews page ${i+1}`);
      d.addEventListener('click', () => { goTo(i); start(); });
      dotsWrap.appendChild(d);
      dots.push(d);
    }
  }

  let index = 0;
  let interval = null;
  const delayAttr = section.getAttribute('data-delay');
  const delay = delayAttr ? parseInt(delayAttr, 10) : 4500;

  function visibleCount() {
    const w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 768) return 2;
    return 1;
  }

  function layout() {
    const visible = visibleCount();
    const pct = 100 / visible;
    slides.forEach(s => s.style.flex = `0 0 ${pct}%`);
    // ensure index is within bounds
    const maxIndex = Math.max(0, slides.length - visible);
    index = Math.min(index, maxIndex);
    // build dots for positions (maxIndex + 1)
    buildDots(maxIndex + 1);
    update();
  }

  function update() {
    const visible = visibleCount();
    const shift = (100 / visible) * index;
    slider.style.transform = `translateX(-${shift}%)`;
    slides.forEach((s, i) => s.classList.toggle('active', i >= index && i < index + visible));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  function nextSlide() {
    const visible = visibleCount();
    const maxIndex = Math.max(0, slides.length - visible);
    index = (index + 1) % (maxIndex + 1);
    update();
  }

  function prevSlide() {
    const visible = visibleCount();
    const maxIndex = Math.max(0, slides.length - visible);
    index = (index - 1 + (maxIndex + 1)) % (maxIndex + 1);
    update();
  }

  function goTo(i) { index = i; update(); }

  function start() { stop(); interval = setInterval(nextSlide, delay); }
  function stop() { if (interval) clearInterval(interval); interval = null; }

  // handlers
  if (next) next.addEventListener('click', () => { nextSlide(); start(); });
  if (prev) prev.addEventListener('click', () => { prevSlide(); start(); });

  section.addEventListener('mouseenter', stop);
  section.addEventListener('mouseleave', start);
  window.addEventListener('resize', () => { layout(); });

  // initial layout
  layout();
  start();

  // small pause until images load (if any) then animate entry stagger
  setTimeout(() => {
    slides.forEach((s, i) => s.style.animationDelay = `${i * 80}ms`);
  }, 60);
});
