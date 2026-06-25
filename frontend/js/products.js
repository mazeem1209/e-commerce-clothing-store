// ─── STATE ────────────────────────────────────────────────
let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let currentMaxPrice = 500;
let currentSort = 'default';

// ─── LOAD PRODUCTS ────────────────────────────────────────
async function loadProducts() {
    const container = document.getElementById('products-container');
    const countEl = document.getElementById('products-count');

    try {
        const response = await fetch(`${API_URL}/products`);
        allProducts = await response.json();

        if (!allProducts) allProducts = [];

        // Check for category in URL
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        if (category) {
            currentCategory = category;
            document.querySelectorAll('.filter-link').forEach(link => {
                link.classList.remove('active');
                if (link.dataset.category === category) {
                    link.classList.add('active');
                }
            });
        }

        applyFilters();

    } catch (error) {
        container.innerHTML = `
            <div class="no-products">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Could not load products</h3>
                <p>Please make sure the server is running</p>
            </div>`;
        console.error('Error:', error);
    }
}

// ─── APPLY FILTERS ────────────────────────────────────────
function applyFilters() {
    const container = document.getElementById('products-container');
    const countEl = document.getElementById('products-count');

    filteredProducts = allProducts.filter(product => {
        const categoryMatch = currentCategory === 'all' || product.category === currentCategory;
        const priceMatch = product.price <= currentMaxPrice;
        return categoryMatch && priceMatch;
    });

    // Apply sorting
    switch (currentSort) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    // Update count
    if (countEl) {
        countEl.textContent = `Showing ${filteredProducts.length} products`;
    }

    // Render products
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try changing your filters</p>
            </div>`;
        return;
    }

    container.innerHTML = '';
    filteredProducts.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

// ─── CATEGORY FILTER ──────────────────────────────────────
function initCategoryFilter() {
    document.querySelectorAll('.filter-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.filter-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            currentCategory = link.dataset.category;
            applyFilters();
        });
    });
}

// ─── PRICE FILTER ─────────────────────────────────────────
function initPriceFilter() {
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');

    if (priceRange) {
        priceRange.addEventListener('input', () => {
            currentMaxPrice = parseInt(priceRange.value);
            priceValue.textContent = `$${currentMaxPrice}`;
            applyFilters();
        });
    }
}

// ─── SORT FILTER ──────────────────────────────────────────
function initSortFilter() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            applyFilters();
        });
    }
}

// ─── CLEAR FILTERS ────────────────────────────────────────
function initClearFilters() {
    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            currentCategory = 'all';
            currentMaxPrice = 500;
            currentSort = 'default';

            document.querySelectorAll('.filter-link').forEach(l => l.classList.remove('active'));
            document.querySelector('[data-category="all"]').classList.add('active');
            document.getElementById('price-range').value = 500;
            document.getElementById('price-value').textContent = '$500';
            document.getElementById('sort-select').value = 'default';

            applyFilters();
        });
    }
}

// ─── VIEW TOGGLE ──────────────────────────────────────────
function initViewToggle() {
    const gridBtn = document.getElementById('grid-view');
    const listBtn = document.getElementById('list-view');
    const container = document.getElementById('products-container');

    if (gridBtn && listBtn) {
        gridBtn.addEventListener('click', () => {
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
            container.classList.remove('list-view');
        });

        listBtn.addEventListener('click', () => {
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
            container.classList.add('list-view');
        });
    }
}

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    initCategoryFilter();
    initPriceFilter();
    initSortFilter();
    initClearFilters();
    initViewToggle();
});