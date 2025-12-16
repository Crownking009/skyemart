document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('whatsappBtn');
  if (!btn) return;

  // Read phone number from data-number attribute (E.164 without +, e.g. 447700900000)
  const raw = (btn.getAttribute('data-number') || '').trim();
  const text = btn.getAttribute('data-text') || 'Hi, I would like to place an order.';

  if (raw) {
    const digits = raw.replace(/\D/g, '');
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
    btn.setAttribute('href', url);
    btn.setAttribute('target', '_blank');
    btn.setAttribute('rel', 'noopener noreferrer');
    // mark body so we can adjust other UI (e.g., scroll-to-top) to avoid overlap
    try { document.body.classList.add('has-whatsapp'); } catch (e) { /* ignore */ }
  } else {
    // If no number set, prevent navigation and hint in console
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      console.warn('WhatsApp button clicked but no phone number configured. Add your number to the element with id "whatsappBtn" as data-number="447700900000" (no +).');
    });
  }
});
