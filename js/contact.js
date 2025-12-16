document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !message) {
            status.textContent = 'Please fill in the required fields.';
            status.style.color = 'var(--danger-color)';
            return;
        }

        // Simple email pattern check
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            status.textContent = 'Please enter a valid email address.';
            status.style.color = 'var(--danger-color)';
            return;
        }

        // Simulate successful submission (no backend)
        status.textContent = 'Thanks! Your message has been sent.';
        status.style.color = 'var(--success-color)';

        // Clear form after a short delay for UX
        setTimeout(() => {
            form.reset();
            status.textContent = '';
        }, 2200);
    });
});
