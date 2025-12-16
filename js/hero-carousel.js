/* Hero background carousel
   - By default uses images/hero-1.jpg ... images/hero-5.jpg
   - Or set comma-separated list on <section class="hero" data-images="path1,path2,..."> 
*/
document.addEventListener('DOMContentLoaded', function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Read images from data attribute or fall back to hero-1..hero-5
  const attr = hero.getAttribute('data-images');
  let images = [];
  if (attr) {
    images = attr.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (!images.length) {
    for (let i = 1; i <= 5; i++) images.push(`images/hero-${i}.jpg`);
  }

  // Create carousel container
  const carousel = document.createElement('div');
  carousel.className = 'hero-carousel';

  images.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide';
    if (i === 0) slide.classList.add('active');
    // lazy-set background for slide; active slide will be visible immediately
    slide.setAttribute('data-bg', src);
    if (i === 0) slide.style.backgroundImage = `url('${src}')`;
    carousel.appendChild(slide);
  });

  // Insert behind the overlay but inside hero (before hero-content)
  const content = hero.querySelector('.hero-content');
  if (content) hero.insertBefore(carousel, content);

  const slides = carousel.querySelectorAll('.hero-slide');
  let index = 0;
  let interval = null;
  // allow configurable delay via data-delay (ms) on .hero, default 4000ms
  const delayAttr = hero.getAttribute('data-delay');
  const delay = delayAttr ? parseInt(delayAttr, 10) : 4000;

  // Create controls: prev/next and dots
  const controls = document.createElement('div');
  controls.className = 'hero-controls';

  const prev = document.createElement('button');
  prev.className = 'hero-arrow hero-prev';
  prev.setAttribute('aria-label', 'Previous slide');
  prev.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'hero-arrow hero-next';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const dots = document.createElement('div');
  dots.className = 'hero-dots';
  images.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'hero-dot';
    d.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) d.classList.add('active');
    d.addEventListener('click', () => {
      index = i;
      show(index);
      // reset autoplay
      start();
    });
    dots.appendChild(d);
  });

  controls.appendChild(dots);
  hero.appendChild(controls);
  // append arrows separately so they can be positioned at left/right edges
  hero.appendChild(prev);
  hero.appendChild(nextBtn);

  // Attach arrow handlers
  prev.addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    show(index);
    start();
  });
  nextBtn.addEventListener('click', () => {
    next();
    start();
  });

  function show(i) {
    slides.forEach((s, idx) => {
      const isActive = idx === i;
      s.classList.toggle('active', isActive);
      // ensure background image is set (lazy) when slide becomes active or next to active
      if (isActive && !s.style.backgroundImage) {
        const bg = s.getAttribute('data-bg');
        if (bg) s.style.backgroundImage = `url('${bg}')`;
      }
    });
    // update dots
    const dotButtons = hero.querySelectorAll('.hero-dot');
    dotButtons.forEach((d, idx) => d.classList.toggle('active', idx === i));
  }

  function next() {
    index = (index + 1) % slides.length;
    show(index);
  }

  function start() {
    if (interval) clearInterval(interval);
    interval = setInterval(next, delay);
  }

  function stop() {
    if (interval) clearInterval(interval);
    interval = null;
  }

  // Pause on hover
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);

  // Start autoplay
  start();
});
