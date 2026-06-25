// ─── LOAD CART ────────────────────────────────────────────
function loadCart() {
    const cartItems = document.getElementById('cart-items');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added anything yet</p>
                <a href="products.html" class="btn btn-primary">Start Shopping</a>
            </div>`;
        updateSummary(0);
        return;
    }

    cartItems.innerHTML = '';
    cart.forEach(item => {
        const cartItem = createCartItem(item);
        cartItems.appendChild(cartItem);
    });

    calculateTotal();
}

// ─── CREATE CART ITEM ─────────────────────────────────────
function createCartItem(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.id = `cart-item-${item.id}`;
    div.innerHTML = `
        <img src="${item.image_url || '../assets/images/placeholder.jpg'}" 
             alt="${item.name}"
             onerror="this.src='../assets/images/placeholder.jpg'">
        <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p class="category">${item.category}</p>
            <p class="price">$${(item.price * item.quantity).toFixed(2)}</p>
        </div>
        <div class="cart-item-actions">
            <div class="quantity-control">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="quantity-value" id="qty-${item.id}">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
    `;
    return div;
}

// ─── UPDATE QUANTITY ──────────────────────────────────────
function updateQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(i => i.id === productId);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    document.getElementById(`qty-${productId}`).textContent = item.quantity;
    document.querySelector(`#cart-item-${productId} .price`).textContent =
        `$${(item.price * item.quantity).toFixed(2)}`;
    calculateTotal();
    updateCartCount();
}

// ─── REMOVE FROM CART ─────────────────────────────────────
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(i => i.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));

    const itemEl = document.getElementById(`cart-item-${productId}`);
    if (itemEl) itemEl.remove();

    updateCartCount();
    calculateTotal();

    if (cart.length === 0) {
        loadCart();
    }

    showNotification('Item removed from cart!', 'success');
}

// ─── CALCULATE TOTAL ──────────────────────────────────────
function calculateTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    updateSummary(subtotal);
}

// ─── UPDATE SUMMARY ───────────────────────────────────────
function updateSummary(subtotal) {
    const shipping = subtotal > 50 ? 0 : subtotal > 0 ? 9.99 : 0;
    const tax = subtotal * 0.10;
    const total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping === 0 && subtotal > 0
        ? 'FREE' : `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// ─── CHECKOUT ─────────────────────────────────────────────
function initCheckout() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'error');
                return;
            }
            if (!isLoggedIn()) {
                showNotification('Please login to checkout!', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
                return;
            }
            window.location.href = 'checkout.html';
        });
    }
}

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    initCheckout();
});