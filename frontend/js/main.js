// ─── API BASE URL ─────────────────────────────────────────
const API_URL = 'http://localhost:8080/api';

// ─── GET TOKEN FROM LOCAL STORAGE ────────────────────────
function getToken() {
    return localStorage.getItem('token');
}

// ─── GET USER FROM LOCAL STORAGE ─────────────────────────
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// ─── CHECK IF USER IS LOGGED IN ──────────────────────────
function isLoggedIn() {
    return getToken() !== null;
}

// ─── UPDATE NAVBAR BASED ON LOGIN STATUS ─────────────────
function updateNavbar() {
    const authLink = document.getElementById('nav-auth-link');
    const user = getUser();

    if (authLink) {
        if (isLoggedIn() && user) {
            authLink.href = 'http://127.0.0.1:5500/frontend/pages/profile.html';
            authLink.innerHTML = `<i class="fas fa-user-circle"></i>`;
        } else {
            authLink.href = 'http://127.0.0.1:5500/frontend/pages/login.html';
            authLink.innerHTML = `<i class="fas fa-user"></i>`;
        }
    }

    // Show admin link if user is admin
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && isLoggedIn() && user && user.role === 'admin') {
        if (!document.getElementById('admin-nav-link')) {
            const adminLink = document.createElement('li');
            adminLink.innerHTML = `
                <a href="http://127.0.0.1:5500/frontend/pages/admin.html" 
                id="admin-nav-link">
                <i class="fas fa-cog"></i> Admin
                </a>`;
            navLinks.appendChild(adminLink);
        }
    }
}

// ─── UPDATE CART COUNT ────────────────────────────────────
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// ─── ADD TO CART ──────────────────────────────────────────
async function addToCart(product) {
    // 1. Keep your existing localStorage logic for fallback UI rendering
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // 2. NEW: Send the item to your backend database if the user is logged in
    if (isLoggedIn()) {
        try {
            const user = getUser();
            await fetchWithAuth(`${API_URL}/cart`, {
                method: 'POST',
                body: JSON.stringify({
                    user_id: user.id,
                    product_id: product.id,
                    quantity: 1
                })
            });
        } catch (error) {
            console.error("Failed to sync cart item to server database:", error);
        }
    }

    showNotification('Item added to cart!', 'success');
}

// ─── SHOW NOTIFICATION ────────────────────────────────────
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        background-color: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ─── CREATE PRODUCT CARD ──────────────────────────────────
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image_url || '/frontend/assets/images/placeholder.jpg'}" 
             alt="${product.name}"
             onerror="this.src='/frontend/assets/images/placeholder.jpg'">
        <div class="product-card-info">
            <h3>${product.name}</h3>
            <p class="category">${product.category}</p>
            <p class="price">$${product.price.toFixed(2)}</p>
        </div>
        <div class="product-card-actions">
            <button class="btn btn-primary" 
                onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                Add to Cart
            </button>
            <button class="btn btn-secondary" style="background:var(--primary);color:white;"
                onclick="location.href='/frontend/pages/product-detail.html?id=${product.id}'">
                View
            </button>
        </div>
    `;
    return card;
}

// ─── FETCH WITH AUTH ──────────────────────────────────────
async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });
    return response;
}

// ─── LOGOUT ───────────────────────────────────────────────
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    window.location.href = 'http://127.0.0.1:5500/frontend/pages/login.html';
}

// ─── HAMBURGER MENU ───────────────────────────────────────
function initHamburger() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

// ─── INIT ─────────────────────────────────────────────────
// ─── SET ACTIVE NAV LINK ──────────────────────────────────
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (!href) return;
        const linkPage = href.split('/').pop().split('?')[0];
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    updateCartCount();
    initHamburger();
    setActiveNavLink();
});