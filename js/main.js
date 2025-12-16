/* ===================================
   SKYE AFRICAN SUPERMARKET - MAIN JAVASCRIPT
   =================================== */

// ============================================
// GLOBAL VARIABLES
// ============================================
let cart = [];
const WHATSAPP_NUMBER = '+441908040384'; // Updated to SKYE shop WhatsApp number

// ============================================
// DOM CONTENT LOADED
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// ============================================
// INITIALIZE APPLICATION
// ============================================
function initializeApp() {
    // Load cart from localStorage
    loadCart();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize scroll effects
    initScrollEffects();
    
    // Initialize scroll to top button
    initScrollToTop();
    
    // Initialize animations on scroll
    initScrollAnimations();
    
    // Load featured products (if on homepage)
    if (document.getElementById('featuredProducts')) {
        loadFeaturedProducts();
    }
    
    // Update cart count
    updateCartCount();
    
    console.log('SKYE African Supermarket initialized successfully! 🛒');
}

// ============================================
// NAVIGATION FUNCTIONALITY
// ============================================
function initNavigation() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    const body = document.body;
    
    if (mobileMenuToggle && navMenu) {
        // Create mobile overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        body.appendChild(overlay);
        
        // Toggle mobile menu
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking overlay
        overlay.addEventListener('click', function() {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
            body.style.overflow = '';
        });
        
        // Close menu when clicking nav links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 767) {
                    mobileMenuToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    overlay.classList.remove('active');
                    body.style.overflow = '';
                }
            });
        });
    }
    
    // Sticky header on scroll
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Active navigation link
    setActiveNavLink();
}

// ============================================
// SET ACTIVE NAVIGATION LINK
// ============================================
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ============================================
// SCROLL EFFECTS
// ============================================
function initScrollEffects() {
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ============================================
// SCROLL TO TOP BUTTON
// ============================================
function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (scrollToTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });
        
        // Scroll to top when clicked
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-up');
    
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        }
    );
    
    animatedElements.forEach(element => {
        element.style.animationPlayState = 'paused';
        observer.observe(element);
    });
}

// ============================================
// LOAD FEATURED PRODUCTS (HOMEPAGE)
// ============================================
async function loadFeaturedProducts() {
    const productsContainer = document.getElementById('featuredProducts');
    if (!productsContainer) return;
    
    try {
        // Check if Firebase is initialized
        if (typeof db === 'undefined') {
            console.log('Firebase not initialized yet. Showing sample products...');
            displaySampleProducts(productsContainer);
            return;
        }
        
        // Fetch products from Firebase
        const productsRef = firebase.firestore().collection('products');
        const snapshot = await productsRef.limit(8).get();
        
        if (snapshot.empty) {
            displaySampleProducts(productsContainer);
            return;
        }
        
        // Clear loading spinner
        productsContainer.innerHTML = '';
        
        // Display products
        snapshot.forEach(doc => {
            const product = { id: doc.id, ...doc.data() };
            const productCard = createProductCard(product);
            productsContainer.appendChild(productCard);
        });
        
    } catch (error) {
        console.error('Error loading products:', error);
        displaySampleProducts(productsContainer);
    }
}

// ============================================
// DISPLAY SAMPLE PRODUCTS (FALLBACK)
// ============================================
function displaySampleProducts(container) {
    const sampleProducts = [
        {
            id: 'sample1',
            name: 'Fresh Plantain',
            price: 2.99,
            category: 'Fresh Produce',
            image: 'images/placeholder-product.jpg',
            stockStatus: 'In Stock',
            unit: '1kg'
        },
        {
            id: 'sample2',
            name: 'Jollof Rice Mix',
            price: 5.49,
            category: 'Pantry Staples',
            image: 'images/placeholder-product.jpg',
            stockStatus: 'In Stock',
            unit: '500g'
        },
        {
            id: 'sample3',
            name: 'Palm Oil',
            price: 8.99,
            category: 'Pantry Staples',
            image: 'images/placeholder-product.jpg',
            stockStatus: 'In Stock',
            unit: '1L'
        },
        {
            id: 'sample4',
            name: 'Suya Spice',
            price: 3.99,
            category: 'Snacks',
            image: 'images/placeholder-product.jpg',
            stockStatus: 'In Stock',
            unit: '100g'
        },
        {
            id: 'sample5',
            name: 'African Yam',
            price: 4.99,
            category: 'Fresh Produce',
            image: 'images/placeholder-product.jpg',
            stockStatus: 'In Stock',
            unit: '1kg'
        },
        {
            id: 'sample6',
            name: 'Maggi Seasoning',
            price: 2.49,
            category: 'Pantry Staples',
            image: 'images/placeholder-product.jpg',
            stockStatus: 'In Stock',
            unit: '200g'
        },
        {
            id: 'sample7',
            name: 'Cassava Flour',
            price: 3.99,
            category: 'Pantry Staples',
            image: 'images/placeholder-product.jpg',
            stockStatus: 'Out of Stock',
            unit: '1kg'
        },
        {
            id: 'sample8',
            name: 'African Malt Drink',
            price: 1.99,
            category: 'Beverages',
            image: 'images/placeholder-product.jpg',
            stockStatus: 'In Stock',
            unit: '330ml'
        }
    ];
    
    container.innerHTML = '';
    
    sampleProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
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
                <span><i class="fas fa-tag"></i> ${product.category || 'General'}</span>
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
// LOAD CART FROM LOCALSTORAGE
// ============================================
function loadCart() {
    const savedCart = localStorage.getItem('skyeCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (error) {
            console.error('Error loading cart:', error);
            cart = [];
        }
    }
}

// ============================================
// SAVE CART TO LOCALSTORAGE
// ============================================
function saveCart() {
    localStorage.setItem('skyeCart', JSON.stringify(cart));
}

// ============================================
// UPDATE CART COUNT
// ============================================
function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        
        // Add bounce animation
        if (totalItems > 0) {
            cartCountElement.parentElement.classList.add('cart-bounce');
            setTimeout(() => {
                cartCountElement.parentElement.classList.remove('cart-bounce');
            }, 500);
        }
    }
}

// ============================================
// ADD TO CART
// ============================================
function addToCart(id, name, price, image, unit) {
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: parseFloat(price),
            image: image,
            unit: unit,
            quantity: 1
        });
    }
    
    // Save and update
    saveCart();
    updateCartCount();
    
    // Show notification
    showNotification(`${name} added to cart!`, 'success');
}

// ============================================
// SHOW NOTIFICATION
// ============================================
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} notification-slide-in`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#2ECC71' : '#E74C3C'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease forwards';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format currency
function formatCurrency(amount) {
    return `£${parseFloat(amount).toFixed(2)}`;
}

// Debounce function for search/filter
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

// Get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// ============================================
// WINDOW RESIZE HANDLER
// ============================================
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 767) {
            const mobileMenuToggle = document.getElementById('mobileMenuToggle');
            const navMenu = document.getElementById('navMenu');
            const overlay = document.querySelector('.mobile-overlay');
            
            if (mobileMenuToggle && navMenu) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }, 250);
});

// ============================================
// EXPORT FUNCTIONS (for use in other files)
// ============================================
window.addToCart = addToCart;
window.formatCurrency = formatCurrency;
window.showNotification = showNotification;
window.getUrlParameter = getUrlParameter;