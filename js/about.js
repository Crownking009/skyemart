document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('.counter-number');
  if (!counters.length) return;

  const animate = (el, target) => {
    const duration = 1600; // ms
    const start = performance.now();
    const from = 0;
    const to = parseInt(target, 10);

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * (to - from) + from);
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = to.toLocaleString();
    };

    requestAnimationFrame(step);
  };

  // Use IntersectionObserver to animate when visible
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = el.getAttribute('data-target') || el.textContent;
        animate(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(c => io.observe(c));
});
