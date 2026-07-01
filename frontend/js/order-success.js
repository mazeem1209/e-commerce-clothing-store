// ─── LOAD ORDER ID ────────────────────────────────────────
function loadOrderId() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    const orderIdEl = document.getElementById('order-id');

    if (orderId) {
        orderIdEl.textContent = `#${orderId.padStart(6, '0')}`;
    } else {
        orderIdEl.textContent = '#000000';
    }
}

// ─── RENDER ACTION BUTTONS BASED ON LOGIN STATE ──────────
function renderActionButtons() {
    const container = document.getElementById('success-actions');
    if (!container) return;

    if (isLoggedIn()) {
        container.innerHTML = `
            <a href="/pages/profile.html" class="btn btn-primary">View My Orders</a>
            <a href="/pages/products.html" class="btn btn-secondary" 
               style="background:var(--primary);color:white;">
                Continue Shopping
            </a>
        `;
    } else {
        container.innerHTML = `
            <p style="margin-bottom:15px;color:var(--gray);font-size:14px;">
                Want to track this order? Create an account or log in to view your order history.
            </p>
            <a href="/pages/register.html" class="btn btn-primary">Register</a>
            <a href="/pages/login.html" class="btn btn-secondary" 
               style="background:var(--primary);color:white;">
                Log In
            </a>
            <a href="/pages/products.html" class="btn btn-secondary" 
               style="background:var(--gray);color:white;margin-top:10px;">
                Continue Shopping
            </a>
        `;
    }
}

// ─── ANIMATE STEPS ────────────────────────────────────────
function animateSteps() {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        setTimeout(() => {
            step.style.opacity = '1';
            step.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// ─── CONFETTI EFFECT ──────────────────────────────────────
function createConfetti() {
    const colors = ['#e74c3c', '#2ecc71', '#3498db', '#f1c40f', '#9b59b6'];

    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background-color: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -20px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            animation: fall ${Math.random() * 3 + 2}s linear forwards;
            z-index: 9999;
        `;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 5000);
    }
}

// ─── ADD CONFETTI CSS ─────────────────────────────────────
function addConfettiCSS() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            0% {
                transform: translateY(-20px) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ─── REDIRECT IF NO ORDER ─────────────────────────────────
function checkOrderId() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');

    if (!orderId) {
        // Still show page but with default order id
        console.log('No order ID found in URL');
    }
}

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    checkOrderId();
    loadOrderId();
    renderActionButtons();
    addConfettiCSS();

    // Small delay before confetti for better effect
    setTimeout(() => {
        createConfetti();
        animateSteps();
    }, 300);
});