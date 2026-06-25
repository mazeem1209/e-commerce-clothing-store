// ─── HANDLE CONTACT FORM ──────────────────────────────────
function handleContactForm(e) {
    e.preventDefault();

    const firstName = document.getElementById('contact-first-name').value.trim();
    const lastName = document.getElementById('contact-last-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value.trim();

    // Validate
    if (!firstName || !lastName || !email || !subject || !message) {
        showNotification('Please fill in all fields!', 'error');
        return;
    }

    if (!email.includes('@')) {
        showNotification('Please enter a valid email!', 'error');
        return;
    }

    if (message.length < 10) {
        showNotification('Message must be at least 10 characters!', 'error');
        return;
    }

    // Simulate sending message
    const btn = document.querySelector('#contact-form .btn');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
        showNotification('Message sent successfully! We will get back to you soon.', 'success');
        document.getElementById('contact-form').reset();
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        btn.disabled = false;
    }, 1500);
}

// ─── ANIMATE INFO CARDS ───────────────────────────────────
function animateInfoCards() {
    const cards = document.querySelectorAll('.info-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }, index * 150);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateX(-20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    animateInfoCards();
});