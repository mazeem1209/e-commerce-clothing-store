// ─── STATE ────────────────────────────────────────────────
let allProducts = [];

// ─── LOAD ALL PRODUCTS ────────────────────────────────────
async function loadAllProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        allProducts = await response.json();
        if (!allProducts) allProducts = [];

        // Check for search query in URL
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        if (query) {
            document.getElementById('search-input').value = query;
            performSearch(query);
        }

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// ─── PERFORM SEARCH ───────────────────────────────────────
function performSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    const statusEl = document.getElementById('search-status');

    if (!query || query.trim() === '') {
        statusEl.innerHTML = '<p>Start typing to search products...</p>';
        statusEl.style.display = 'block';
        resultsContainer.innerHTML = '';
        return;
    }

    query = query.toLowerCase().trim();

    const results = allProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );

    if (results.length === 0) {
        statusEl.innerHTML = `
            <i class="fas fa-search"></i>
            <p>No results found for "<strong>${query}</strong>"</p>
            <p style="font-size:14px;margin-top:10px;">
                Try different keywords or browse our 
                <a href="products.html" style="color:var(--accent)">all products</a>
            </p>`;
        statusEl.style.display = 'block';
        resultsContainer.innerHTML = '';
        return;
    }

    statusEl.innerHTML = `<p>Found <strong>${results.length}</strong> results for "<strong>${query}</strong>"</p>`;
    statusEl.style.display = 'block';

    resultsContainer.innerHTML = '';
    results.forEach(product => {
        const card = createProductCard(product);
        resultsContainer.appendChild(card);
    });
}

// ─── SEARCH FOR SUGGESTION ────────────────────────────────
function searchFor(query) {
    document.getElementById('search-input').value = query;
    performSearch(query);
}

// ─── INIT SEARCH ──────────────────────────────────────────
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    // Search on button click
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value;
            performSearch(query);
        });
    }

    // Search on Enter key
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }

            // Live search after 3 characters
            if (searchInput.value.length >= 3) {
                performSearch(searchInput.value);
            }

            // Clear results if input is empty
            if (searchInput.value.length === 0) {
                performSearch('');
            }
        });
    }
}

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadAllProducts();
    initSearch();
});