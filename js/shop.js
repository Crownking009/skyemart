/* ===================================
   SKYE AFRICAN SUPERMARKET - SHOP PAGE FUNCTIONALITY
   =================================== */

// ============================================
// GLOBAL VARIABLES
// ============================================
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;
let currentCategory = 'all';
let currentSort = 'default';
let currentView = 'grid';

// ============================================
// INITIALIZE SHOP PAGE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeShop();
});

function initializeShop() {
    // Load products
    loadProducts();
    
    // Setup filter listeners
    setupFilters();
    
    // Check for category in URL
    const urlCategory = getUrlParameter('category');
    if (urlCategory) {
        selectCategory(urlCategory);
    }
    
    // Setup search on Enter key
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
        
        // Real-time search (debounced)
        searchInput.addEventListener('input', debounce(searchProducts, 500));
    }

    // Wire sidebar close button (mobile)
    const sidebarCloseBtn = document.querySelector('.sidebar-close');
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', function (e) {
            e.preventDefault();
            toggleMobileFilters();
        });
    }
    
    console.log('Shop page initialized! 🛒');
}

// ============================================
// LOAD PRODUCTS
// ============================================
async function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    try {
        // Check if Firebase is initialized
        if (typeof db !== 'undefined') {
            const productsRef = firebase.firestore().collection('products');
            const snapshot = await productsRef.get();
            
            if (!snapshot.empty) {
                allProducts = [];
                snapshot.forEach(doc => {
                    allProducts.push({ id: doc.id, ...doc.data() });
                });
            } else {
                loadSampleProducts();
            }
        } else {
            loadSampleProducts();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        loadSampleProducts();
    }
    
    // Display products
    filteredProducts = [...allProducts];
    updateProductCounts();
    displayProducts();
}

// ============================================
// LOAD SAMPLE PRODUCTS (FALLBACK)
// ============================================
function loadSampleProducts() {
    allProducts = generateSampleProducts();
    filteredProducts = [...allProducts];
}

function generateSampleProducts() {
    const categories = [
        'fresh-produce', 'meat-poultry', 'seafood', 'dairy-eggs', 
        'bakery', 'frozen-foods', 'beverages', 'snacks', 
        'pantry', 'health-beauty', 'household', 'baby-products'
    ];
    
    const categoryNames = {
        'fresh-produce': 'Fresh Produce',
        'meat-poultry': 'Meat & Poultry',
        'seafood': 'Seafood',
        'dairy-eggs': 'Dairy & Eggs',
        'bakery': 'Bakery',
        'frozen-foods': 'Frozen Foods',
        'beverages': 'Beverages',
        'snacks': 'Snacks & Confectionery',
        'pantry': 'Pantry Staples',
        'health-beauty': 'Health & Beauty',
        'household': 'Household & Cleaning',
        'baby-products': 'Baby Products'
    };
    
    const productNames = {
        'fresh-produce': ['Plantain', 'Yam', 'Cassava', 'African Spinach', 'Okra', 'Garden Eggs'],
        'meat-poultry': ['Goat Meat', 'Chicken Thighs', 'Turkey Wings', 'Cow Foot', 'Beef Tripe'],
        'seafood': ['Tilapia Fish', 'Mackerel', 'Dried Fish', 'Crayfish', 'Prawns'],
        'dairy-eggs': ['Peak Milk', 'Butter', 'Yogurt', 'Cheese', 'Fresh Eggs'],
        'bakery': ['African Bread', 'Meat Pie', 'Chin Chin', 'Puff Puff Mix', 'Doughnuts'],
        'frozen-foods': ['Frozen Yam', 'Ice Cream', 'Frozen Vegetables', 'Frozen Fish', 'Samosas'],
        'beverages': ['Malt Drink', 'Palm Wine', 'Zobo Drink', 'Ginger Beer', 'African Tea'],
        'snacks': ['Plantain Chips', 'Groundnuts', 'Cashew Nuts', 'Coconut Candy', 'Biscuits'],
        'pantry': ['Jollof Rice Mix', 'Palm Oil', 'Egusi Seeds', 'Locust Beans', 'Crayfish Powder'],
        'health-beauty': ['Shea Butter', 'Black Soap', 'African Body Lotion', 'Hair Cream', 'Face Cream'],
        'household': ['Detergent', 'Floor Cleaner', 'Dishwashing Liquid', 'Air Freshener', 'Sponges'],
        'baby-products': ['Baby Formula', 'Diapers', 'Baby Wipes', 'Baby Food', 'Baby Lotion']
    };
    
    const sampleProducts = [];
    let id = 1;
    
    categories.forEach(category => {
        const names = productNames[category];
        names.forEach(name => {
            sampleProducts.push({
                id: `product-${id}`,
                name: name,
                category: category,
                categoryName: categoryNames[category],
                price: parseFloat((Math.random() * 20 + 1).toFixed(2)),
                image: 'images/placeholder-product.jpg',
                stockStatus: Math.random() > 0.1 ? 'In Stock' : 'Out of Stock',
                unit: ['1kg', '500g', '250g', '1L', '500ml', '100g', '2kg'][Math.floor(Math.random() * 7)],
                description: `Authentic ${name} from Africa`
            });
            id++;
        });
    });
    
    return sampleProducts;
}

// ============================================
// DISPLAY PRODUCTS
// ============================================
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    const resultCount = document.getElementById('resultCount');
    
    // Clear grid
    productsGrid.innerHTML = '';
    
    // Apply sorting
    sortProductsArray();
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    // Update result count
    if (resultCount) {
        resultCount.textContent = filteredProducts.length;
    }
    
    // Show/hide no results
    if (filteredProducts.length === 0) {
        noResults.style.display = 'block';
        return;
    } else {
        noResults.style.display = 'none';
    }
    
    // Display products
    productsToShow.forEach((product, index) => {
        const productCard = createProductCard(product);
        productCard.style.animationDelay = `${index * 0.05}s`;
        productsGrid.appendChild(productCard);
    });
    
    // Update pagination
    updatePagination();
}

// ============================================
// CREATE PRODUCT CARD
// ============================================
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card fade-in-up';
    
    const stockClass = product.stockStatus === 'In Stock' ? 'in-stock' : 'out-of-stock';
    const isOutOfStock = product.stockStatus !== 'In Stock';
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image || 'images/placeholder-product.jpg'}" 
                 alt="${product.name}" 
                 loading="lazy"
                 onerror="this.src='images/placeholder-product.jpg'">
            <span class="stock-badge ${stockClass}">${product.stockStatus}</span>
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <div class="product-meta">
                <span><i class="fas fa-tag"></i> ${product.categoryName || 'General'}</span>
                ${product.unit ? `<span><i class="fas fa-weight"></i> ${product.unit}</span>` : ''}
            </div>
            <div class="product-price">£${parseFloat(product.price).toFixed(2)}</div>
            <button class="btn-add-cart" 
                    onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image || 'images/placeholder-product.jpg'}', '${product.unit || ''}')"
                    ${isOutOfStock ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                <i class="fas fa-shopping-cart"></i> 
                ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
        </div>
    `;
    
    return card;
}

// ============================================
// SETUP FILTERS
// ============================================
function setupFilters() {
    // Category filters
    const categoryInputs = document.querySelectorAll('input[name="category"]');
    categoryInputs.forEach(input => {
        input.addEventListener('change', function() {
            currentCategory = this.value;
            currentPage = 1;
            filterProducts();
        });
    });
    
    // In stock filter
    const inStockCheckbox = document.getElementById('inStockOnly');
    if (inStockCheckbox) {
        inStockCheckbox.addEventListener('change', function() {
            currentPage = 1;
            filterProducts();
        });
    }
}

// ============================================
// FILTER PRODUCTS
// ============================================
function filterProducts() {
    filteredProducts = [...allProducts];
    
    // Filter by category
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
    }
    
    // Filter by search
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim();
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            (p.description && p.description.toLowerCase().includes(searchTerm)) ||
            (p.categoryName && p.categoryName.toLowerCase().includes(searchTerm))
        );
    }
    
    // Filter by price range
    const minPrice = parseFloat(document.getElementById('minPrice')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice')?.value) || Infinity;
    filteredProducts = filteredProducts.filter(p => p.price >= minPrice && p.price <= maxPrice);
    
    // Filter by stock
    const inStockOnly = document.getElementById('inStockOnly')?.checked;
    if (inStockOnly) {
        filteredProducts = filteredProducts.filter(p => p.stockStatus === 'In Stock');
    }
    
    displayProducts();
}

// ============================================
// SEARCH PRODUCTS
// ============================================
function searchProducts() {
    currentPage = 1;
    filterProducts();
}

// ============================================
// APPLY PRICE FILTER
// ============================================
function applyPriceFilter() {
    currentPage = 1;
    filterProducts();
}

// ============================================
// CLEAR FILTERS
// ============================================
function clearFilters() {
    // Reset category
    document.querySelector('input[name="category"][value="all"]').checked = true;
    currentCategory = 'all';
    
    // Reset search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    // Reset price
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';
    
    // Reset stock filter
    const inStockCheckbox = document.getElementById('inStockOnly');
    if (inStockCheckbox) inStockCheckbox.checked = false;
    
    // Reset page and display
    currentPage = 1;
    filterProducts();
}

// ============================================
// SELECT CATEGORY
// ============================================
function selectCategory(category) {
    const categoryInput = document.querySelector(`input[name="category"][value="${category}"]`);
    if (categoryInput) {
        categoryInput.checked = true;
        currentCategory = category;
        filterProducts();
    }
}

// ============================================
// SORT PRODUCTS
// ============================================
function sortProducts(sortValue) {
    currentSort = sortValue;
    displayProducts();
}

function sortProductsArray() {
    switch (currentSort) {
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        default:
            // Default sorting (as loaded)
            break;
    }
}

// ============================================
// CHANGE VIEW (GRID/LIST)
// ============================================
function changeView(view) {
    currentView = view;
    const productsGrid = document.getElementById('productsGrid');
    const viewButtons = document.querySelectorAll('.view-btn');
    
    viewButtons.forEach(btn => btn.classList.remove('active'));
    
    if (view === 'list') {
        productsGrid.classList.add('list-view');
        document.querySelector('.view-btn[onclick*="list"]').classList.add('active');
    } else {
        productsGrid.classList.remove('list-view');
        document.querySelector('.view-btn[onclick*="grid"]').classList.add('active');
    }
}

// ============================================
// UPDATE PRODUCT COUNTS
// ============================================
function updateProductCounts() {
    const categories = {
        'all': allProducts.length,
        'produce': allProducts.filter(p => p.category === 'fresh-produce').length,
        'meat': allProducts.filter(p => p.category === 'meat-poultry').length,
        'seafood': allProducts.filter(p => p.category === 'seafood').length,
        'dairy': allProducts.filter(p => p.category === 'dairy-eggs').length,
        'bakery': allProducts.filter(p => p.category === 'bakery').length,
        'frozen': allProducts.filter(p => p.category === 'frozen-foods').length,
        'beverages': allProducts.filter(p => p.category === 'beverages').length,
        'snacks': allProducts.filter(p => p.category === 'snacks').length,
        'pantry': allProducts.filter(p => p.category === 'pantry').length,
        'health': allProducts.filter(p => p.category === 'health-beauty').length,
        'household': allProducts.filter(p => p.category === 'household').length,
        'baby': allProducts.filter(p => p.category === 'baby-products').length
    };
    
    Object.keys(categories).forEach(key => {
        const countElement = document.getElementById(`count-${key}`);
        if (countElement) {
            countElement.textContent = categories[key];
        }
    });
}

// ============================================
// PAGINATION
// ============================================
function updatePagination() {
    const pagination = document.getElementById('pagination');
    const paginationPages = document.getElementById('paginationPages');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    
    // Update prev/next buttons
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    // Create page numbers
    paginationPages.innerHTML = '';
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-number';
        pageBtn.textContent = i;
        pageBtn.onclick = () => goToPage(i);
        
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        
        paginationPages.appendChild(pageBtn);
    }
}

function goToPage(page) {
    currentPage = page;
    displayProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ============================================
// MOBILE FILTERS
// ============================================
function toggleMobileFilters() {
    const sidebar = document.querySelector('.shop-sidebar');
    const body = document.body;
    
    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = toggleMobileFilters;
        body.appendChild(overlay);
    }
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Get URL parameter
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// ============================================
// EXPORT FUNCTIONS
// ============================================
window.searchProducts = searchProducts;
window.applyPriceFilter = applyPriceFilter;
window.clearFilters = clearFilters;
window.sortProducts = sortProducts;
window.changeView = changeView;
window.toggleMobileFilters = toggleMobileFilters;
window.goToPage = goToPage;
window.previousPage = previousPage;
window.nextPage = nextPage;