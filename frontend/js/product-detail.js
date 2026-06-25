// ─── GET PRODUCT ID FROM URL ──────────────────────────────
function getProductId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// ─── LOAD PRODUCT DETAIL ──────────────────────────────────
async function loadProductDetail() {
    const productId = getProductId();
    const container = document.getElementById('product-detail');

    if (!productId) {
        window.location.href = 'products.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products/${productId}`);

        if (!response.ok) {
            window.location.href = 'products.html';
            return;
        }

        const product = await response.json();

        // Update page title
        document.title = `${product.name} - StyleHub`;
        document.getElementById('breadcrumb-product').textContent = product.name;

        // Render product
        container.innerHTML = `
            <div class="product-images">
                <img src="${product.image_url || '../assets/images/placeholder.jpg'}"
                     alt="${product.name}"
                     class="main-image"
                     id="main-product-image"
                     onerror="this.src='../assets/images/placeholder.jpg'">
            </div>

            <div class="product-info">
                <span class="product-category-badge">${product.category}</span>
                <h1>${product.name}</h1>
                <p class="product-price">$${product.price.toFixed(2)}</p>

                <div class="product-stock">
                    ${product.stock > 0
                        ? `<span class="stock-badge in-stock">In Stock</span>
                           <span>${product.stock} items available</span>`
                        : `<span class="stock-badge out-of-stock">Out of Stock</span>`
                    }
                </div>

                <p class="product-description">${product.description}</p>

                <div class="size-selector">
                    <h4>Select Size</h4>
                    <div class="size-options">
                        <button class="size-btn" onclick="selectSize(this)">XS</button>
                        <button class="size-btn" onclick="selectSize(this)">S</button>
                        <button class="size-btn active" onclick="selectSize(this)">M</button>
                        <button class="size-btn" onclick="selectSize(this)">L</button>
                        <button class="size-btn" onclick="selectSize(this)">XL</button>
                        <button class="size-btn" onclick="selectSize(this)">XXL</button>
                    </div>
                </div>

                <div class="quantity-selector">
                    <h4>Quantity</h4>
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="changeQuantity(-1)">-</button>
                        <span class="quantity-value" id="detail-quantity">1</span>
                        <button class="quantity-btn" onclick="changeQuantity(1)">+</button>
                    </div>
                </div>

                <div class="product-actions">
                    <button class="btn btn-primary" onclick="addProductToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="btn-wishlist" onclick="toggleWishlist(this)">
                        <i class="far fa-heart"></i>
                    </button>
                </div>

                <div class="product-meta">
                    <p><span>Category:</span> ${product.category}</p>
                    <p><span>SKU:</span> STY-${product.id.toString().padStart(4, '0')}</p>
                    <p><span>Availability:</span> ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
                </div>
            </div>
        `;

        // Load related products
        loadRelatedProducts(product.category, product.id);

    } catch (error) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-circle"></i>
                <p>Could not load product. Please try again.</p>
            </div>`;
        console.error('Error:', error);
    }
}

// ─── SELECT SIZE ──────────────────────────────────────────
function selectSize(btn) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// ─── CHANGE QUANTITY ──────────────────────────────────────
function changeQuantity(change) {
    const quantityEl = document.getElementById('detail-quantity');
    let quantity = parseInt(quantityEl.textContent) + change;
    if (quantity < 1) quantity = 1;
    if (quantity > 10) quantity = 10;
    quantityEl.textContent = quantity;
}

// ─── ADD PRODUCT TO CART ──────────────────────────────────
function addProductToCart(product) {
    const quantity = parseInt(document.getElementById('detail-quantity').textContent);
    const productWithQuantity = { ...product, quantity };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push(productWithQuantity);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${product.name} added to cart!`, 'success');
}

// ─── TOGGLE WISHLIST ──────────────────────────────────────
function toggleWishlist(btn) {
    const icon = btn.querySelector('i');
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
    icon.classList.toggle('fa-heart');

    if (icon.classList.contains('fas')) {
        btn.style.borderColor = 'var(--accent)';
        btn.style.color = 'var(--accent)';
        showNotification('Added to wishlist!', 'success');
    } else {
        btn.style.borderColor = '';
        btn.style.color = '';
        showNotification('Removed from wishlist!', 'success');
    }
}

// ─── LOAD RELATED PRODUCTS ────────────────────────────────
async function loadRelatedProducts(category, currentId) {
    const container = document.getElementById('related-products');

    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();

        const related = products
            .filter(p => p.category === category && p.id !== currentId)
            .slice(0, 4);

        if (related.length === 0) {
            document.querySelector('.related-products').style.display = 'none';
            return;
        }

        container.innerHTML = '';
        related.forEach(product => {
            const card = createProductCard(product);
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetail();
});