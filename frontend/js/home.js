// ─── FETCH FEATURED PRODUCTS ──────────────────────────────
async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();

        if (!products || products.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;">No products found.</p>';
            return;
        }

        // Show only first 4 products on home page
        const featured = products.slice(0, 4);
        container.innerHTML = '';

        featured.forEach(product => {
            const card = createProductCard(product);
            container.appendChild(card);
        });

    } catch (error) {
        container.innerHTML = '<p style="text-align:center;color:#999;">Could not load products.</p>';
        console.error('Error loading products:', error);
    }
}

// ─── NAVBAR SCROLL EFFECT ─────────────────────────────────
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
        } else {
            navbar.style.boxShadow = '0 2px 15px rgba(0,0,0,0.1)';
        }
    });
}

// ─── SMOOTH SCROLL ────────────────────────────────────────
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ─── NEWSLETTER ───────────────────────────────────────────
function initNewsletter() {
    const newsletterBtn = document.querySelector('.newsletter .btn');
    const newsletterInput = document.querySelector('.newsletter input');

    if (newsletterBtn && newsletterInput) {
        newsletterBtn.addEventListener('click', () => {
            const email = newsletterInput.value.trim();
            if (!email || !email.includes('@')) {
                showNotification('Please enter a valid email!', 'error');
                return;
            }
            showNotification('Thank you for subscribing!', 'success');
            newsletterInput.value = '';
        });
    }
}

// ─── ANIMATE ON SCROLL ────────────────────────────────────
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card, .category-card, .product-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
    initNavbarScroll();
    initSmoothScroll();
    initNewsletter();
    setTimeout(initAnimations, 100);
});