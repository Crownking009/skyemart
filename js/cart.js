/* ===================================
   SKYE AFRICAN SUPERMARKET - CART FUNCTIONALITY
   =================================== */

// ============================================
// CART VARIABLES
// ============================================
let cart = [];
const WHATSAPP_NUMBER = '+441908040384'; // Updated to SKYE shop WhatsApp number

// ============================================
// INITIALIZE CART
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
});

function initializeCart() {
    // Load cart from localStorage
    loadCartFromStorage();
    
    // Update cart display
    updateCartCount();
    
    // If on shop page, render cart modal
    if (document.getElementById('cartModal') || window.location.pathname.includes('shop.html')) {
        renderCartModal();
    }
}

// ============================================
// LOAD CART FROM LOCALSTORAGE
// ============================================
function loadCartFromStorage() {
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
function saveCartToStorage() {
    localStorage.setItem('skyeCart', JSON.stringify(cart));
}

// ============================================
// ADD ITEM TO CART
// ============================================
function addToCart(id, name, price, image, unit) {
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        // Increase quantity if already in cart
        existingItem.quantity += 1;
    } else {
        // Add new item to cart
        cart.push({
            id: id,
            name: name,
            price: parseFloat(price),
            image: image || 'images/placeholder-product.jpg',
            unit: unit || '',
            quantity: 1
        });
    }
    
    // Save to localStorage
    saveCartToStorage();
    
    // Update UI
    updateCartCount();
    updateCartModal();
    
    // Show success notification
    showCartNotification(`${name} added to cart!`, 'success');
    
    // Bounce cart icon
    bounceCartIcon();
}

// ============================================
// REMOVE ITEM FROM CART
// ============================================
function removeFromCart(id) {
    const item = cart.find(item => item.id === id);
    const itemName = item ? item.name : 'Item';
    
    cart = cart.filter(item => item.id !== id);
    
    // Save to localStorage
    saveCartToStorage();
    
    // Update UI
    updateCartCount();
    updateCartModal();
    
    // Show notification
    showCartNotification(`${itemName} removed from cart`, 'info');
}

// ============================================
// UPDATE ITEM QUANTITY
// ============================================
function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    
    if (item) {
        item.quantity += change;
        
        // Remove item if quantity is 0 or less
        if (item.quantity <= 0) {
            removeFromCart(id);
            return;
        }
        
        // Save to localStorage
        saveCartToStorage();
        
        // Update UI
        updateCartCount();
        updateCartModal();
    }
}

// ============================================
// CLEAR ENTIRE CART
// ============================================
function clearCart() {
    if (cart.length === 0) {
        showCartNotification('Cart is already empty', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCartToStorage();
        updateCartCount();
        updateCartModal();
        showCartNotification('Cart cleared', 'info');
    }
}

// ============================================
// GET CART TOTAL
// ============================================
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// ============================================
// GET TOTAL ITEMS IN CART
// ============================================
function getTotalItems() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// ============================================
// UPDATE CART COUNT BADGE
// ============================================
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cartCount, .cart-count');
    const totalItems = getTotalItems();
    
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    });
}

// ============================================
// BOUNCE CART ICON ANIMATION
// ============================================
function bounceCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.classList.add('cart-bounce');
        setTimeout(() => {
            cartIcon.classList.remove('cart-bounce');
        }, 500);
    }
}

// ============================================
// UPDATE CART MODAL
// ============================================
function updateCartModal() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    
    if (!cartItemsContainer) return;
    
    // Clear current items
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        // Show empty cart message
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'block';
        }
        if (cartTotalElement) {
            cartTotalElement.textContent = '£0.00';
        }
        return;
    }
    
    // Hide empty cart message
    if (emptyCartMessage) {
        emptyCartMessage.style.display = 'none';
    }
    
    // Display cart items
    cart.forEach(item => {
        const cartItem = createCartItemElement(item);
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Update total
    if (cartTotalElement) {
        cartTotalElement.textContent = `£${getCartTotal().toFixed(2)}`;
    }
}

// ============================================
// CREATE CART ITEM ELEMENT
// ============================================
function createCartItemElement(item) {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item fade-in-up';
    
    itemElement.innerHTML = `
        <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='images/placeholder-product.jpg'">
        </div>
        <div class="cart-item-details">
            <h4>${item.name}</h4>
            ${item.unit ? `<p class="cart-item-unit">${item.unit}</p>` : ''}
            <p class="cart-item-price">£${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-quantity">
            <button onclick="updateQuantity('${item.id}', -1)" class="qty-btn" aria-label="Decrease quantity">
                <i class="fas fa-minus"></i>
            </button>
            <span class="qty-value">${item.quantity}</span>
            <button onclick="updateQuantity('${item.id}', 1)" class="qty-btn" aria-label="Increase quantity">
                <i class="fas fa-plus"></i>
            </button>
        </div>
        <div class="cart-item-subtotal">
            £${(item.price * item.quantity).toFixed(2)}
        </div>
        <button onclick="removeFromCart('${item.id}')" class="cart-item-remove" aria-label="Remove item">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    return itemElement;
}

// ============================================
// RENDER CART MODAL
// ============================================
function renderCartModal() {
    // Check if modal already exists
    if (document.getElementById('cartModal')) return;
    
    const modalHTML = `
        <div id="cartModal" class="cart-modal">
            <div class="cart-modal-overlay" onclick="closeCartModal()"></div>
            <div class="cart-modal-content">
                <div class="cart-modal-header">
                    <h2><i class="fas fa-shopping-cart"></i> Your Cart</h2>
                    <button onclick="closeCartModal()" class="cart-close-btn" aria-label="Close cart">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="cart-modal-body">
                    <div id="emptyCartMessage" class="empty-cart-message" style="display: none;">
                        <i class="fas fa-shopping-basket"></i>
                        <p>Your cart is empty</p>
                        <a href="shop.html" class="btn btn-primary">Start Shopping</a>
                    </div>
                    <div id="cartItems" class="cart-items"></div>
                </div>
                
                <div class="cart-modal-footer">
                    <div class="cart-total-section">
                        <span class="cart-total-label">Total:</span>
                        <span class="cart-total-amount" id="cartTotal">£0.00</span>
                    </div>
                    <div class="cart-actions">
                        <button onclick="clearCart()" class="btn btn-outline-danger">
                            <i class="fas fa-trash"></i> Clear Cart
                        </button>
                        <button onclick="checkoutViaWhatsApp()" class="btn btn-primary">
                            <i class="fab fa-whatsapp"></i> Checkout via WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ============================================
// OPEN CART MODAL
// ============================================
function openCartModal() {
    const modal = document.getElementById('cartModal');
    if (!modal) {
        renderCartModal();
    }
    
    const modalElement = document.getElementById('cartModal');
    if (modalElement) {
        modalElement.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateCartModal();
    }
}

// ============================================
// CLOSE CART MODAL
// ============================================
function closeCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================
// CHECKOUT VIA WHATSAPP
// ============================================
function checkoutViaWhatsApp() {
    if (cart.length === 0) {
        showCartNotification('Your cart is empty!', 'error');
        return;
    }
    
    // Build WhatsApp message
    let message = `Hello SKYE African Supermarket,%0A%0AI would like to order the following items:%0A%0A`;
    
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name}`;
        if (item.unit) message += ` (${item.unit})`;
        message += `%0A   Quantity: ${item.quantity}%0A   Price: £${(item.price * item.quantity).toFixed(2)}%0A%0A`;
    });
    
    message += `*Total: £${getCartTotal().toFixed(2)}*%0A%0A`;
    message += `Please confirm availability and delivery details.%0AThank you!`;
    
    // Open WhatsApp with pre-filled message
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappURL, '_blank');
    
    // Show confirmation
    showCartNotification('Redirecting to WhatsApp...', 'success');
}

// ============================================
// SHOW CART NOTIFICATION
// ============================================
function showCartNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.cart-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `cart-notification cart-notification-${type} notification-slide-in`;
    
    const iconMap = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle'
    };
    
    const colorMap = {
        success: '#2ECC71',
        error: '#E74C3C',
        info: '#3498DB',
        warning: '#F39C12'
    };
    
    notification.innerHTML = `
        <i class="fas fa-${iconMap[type]}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colorMap[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 600;
        font-size: 0.95rem;
        max-width: 350px;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease forwards';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ============================================
// ADD CART MODAL STYLES
// ============================================
function addCartModalStyles() {
    if (document.getElementById('cartModalStyles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'cartModalStyles';
    styles.textContent = `
        .cart-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            display: none;
        }
        
        .cart-modal.active {
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }
        
        .cart-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            animation: fadeIn 0.3s ease;
        }
        
        .cart-modal-content {
            position: relative;
            width: 100%;
            max-width: 500px;
            height: 100%;
            background: white;
            display: flex;
            flex-direction: column;
            animation: slideInRight 0.3s ease;
            box-shadow: -5px 0 30px rgba(0, 0, 0, 0.2);
        }
        
        .cart-modal-header {
            padding: 1.5rem;
            border-bottom: 2px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .cart-modal-header h2 {
            margin: 0;
            font-size: 1.5rem;
            color: #333;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .cart-close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #666;
            cursor: pointer;
            padding: 0.5rem;
            transition: color 0.3s ease;
        }
        
        .cart-close-btn:hover {
            color: #E74C3C;
        }
        
        .cart-modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
        }
        
        .empty-cart-message {
            text-align: center;
            padding: 3rem 1rem;
        }
        
        .empty-cart-message i {
            font-size: 4rem;
            color: #ddd;
            margin-bottom: 1rem;
        }
        
        .empty-cart-message p {
            font-size: 1.125rem;
            color: #999;
            margin-bottom: 1.5rem;
        }
        
        .cart-items {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .cart-item {
            display: grid;
            grid-template-columns: 80px 1fr auto auto auto;
            gap: 1rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 12px;
            align-items: center;
        }
        
        .cart-item-image img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
        }
        
        .cart-item-details h4 {
            margin: 0 0 0.25rem 0;
            font-size: 1rem;
            color: #333;
        }
        
        .cart-item-unit {
            font-size: 0.85rem;
            color: #999;
            margin: 0.25rem 0;
        }
        
        .cart-item-price {
            font-size: 0.9rem;
            color: #FF6B35;
            font-weight: 600;
            margin: 0;
        }
        
        .cart-item-quantity {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .qty-btn {
            width: 32px;
            height: 32px;
            border: none;
            background: #FF6B35;
            color: white;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s ease;
        }
        
        .qty-btn:hover {
            background: #e55a29;
        }
        
        .qty-value {
            min-width: 30px;
            text-align: center;
            font-weight: 600;
        }
        
        .cart-item-subtotal {
            font-weight: 700;
            font-size: 1.125rem;
            color: #333;
        }
        
        .cart-item-remove {
            background: none;
            border: none;
            color: #E74C3C;
            font-size: 1.25rem;
            cursor: pointer;
            padding: 0.5rem;
            transition: color 0.3s ease;
        }
        
        .cart-item-remove:hover {
            color: #c0392b;
        }
        
        .cart-modal-footer {
            padding: 1.5rem;
            border-top: 2px solid #f0f0f0;
            background: white;
        }
        
        .cart-total-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 12px;
        }
        
        .cart-total-label {
            font-size: 1.25rem;
            font-weight: 600;
            color: #333;
        }
        
        .cart-total-amount {
            font-size: 1.75rem;
            font-weight: 700;
            color: #FF6B35;
        }
        
        .cart-actions {
            display: flex;
            gap: 1rem;
        }
        
        .cart-actions .btn {
            flex: 1;
        }
        
        .btn-outline-danger {
            background: transparent;
            border: 2px solid #E74C3C;
            color: #E74C3C;
        }
        
        .btn-outline-danger:hover {
            background: #E74C3C;
            color: white;
        }
        
        @media (max-width: 767px) {
            .cart-modal-content {
                max-width: 100%;
            }
            
            .cart-item {
                grid-template-columns: 60px 1fr;
                grid-template-rows: auto auto auto;
                gap: 0.75rem;
            }
            
            .cart-item-image {
                grid-row: 1 / 4;
            }
            
            .cart-item-details {
                grid-column: 2;
            }
            
            .cart-item-quantity {
                grid-column: 2;
            }
            
            .cart-item-subtotal {
                grid-column: 2;
            }
            
            .cart-item-remove {
                position: absolute;
                top: 1rem;
                right: 1rem;
            }
            
            .cart-actions {
                flex-direction: column;
            }
        }
    `;
    
    document.head.appendChild(styles);
}

// ============================================
// INITIALIZE CART MODAL STYLES
// ============================================
addCartModalStyles();

// ============================================
// MAKE FUNCTIONS GLOBALLY AVAILABLE
// ============================================
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;
window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;
window.checkoutViaWhatsApp = checkoutViaWhatsApp;

// ============================================
// CART ICON CLICK HANDLER
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            openCartModal();
        });
    }
});