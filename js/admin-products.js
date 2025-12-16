/* ===================================
   SKYE AFRICAN SUPERMARKET - ADMIN PRODUCT MANAGEMENT
   =================================== */

// ============================================
// GLOBAL VARIABLES
// ============================================
let allProducts = [];
let currentEditingProductId = null;
let productToDelete = null;
let uploadedImageFile = null;

// Category mapping
const CATEGORY_NAMES = {
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

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('admin-dashboard.html')) {
        initializeAdminProducts();
    }
});

function initializeAdminProducts() {
    // Load dashboard stats
    loadDashboardStats();
    
    // Load all products
    loadAllProducts();
    
    // Setup search functionality
    setupProductSearch();
    
    // Populate category filter
    populateCategoryFilter();
    
    console.log('Admin Products Module Initialized! 📦');
}

// ============================================
// LOAD DASHBOARD STATISTICS
// ============================================
async function loadDashboardStats() {
    try {
        // Check if Firebase is initialized
        if (typeof db !== 'undefined') {
            const snapshot = await firebase.firestore().collection('products').get();
            
            if (!snapshot.empty) {
                allProducts = [];
                snapshot.forEach(doc => {
                    allProducts.push({ id: doc.id, ...doc.data() });
                });
            } else {
                allProducts = [];
            }
        } else {
            // Load from localStorage as fallback
            const savedProducts = localStorage.getItem('adminProducts');
            if (savedProducts) {
                allProducts = JSON.parse(savedProducts);
            } else {
                allProducts = [];
            }
        }
        
        // Update stats
        updateDashboardStats();
        
    } catch (error) {
        console.error('Error loading stats:', error);
        showNotification('Error loading statistics', 'error');
    }
}

// ============================================
// UPDATE DASHBOARD STATISTICS
// ============================================
function updateDashboardStats() {
    const totalProducts = allProducts.length;
    const inStockProducts = allProducts.filter(p => p.stockStatus === 'In Stock').length;
    const outOfStockProducts = allProducts.filter(p => p.stockStatus === 'Out of Stock').length;
    
    // Update stat cards
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('inStockProducts').textContent = inStockProducts;
    document.getElementById('outOfStockProducts').textContent = outOfStockProducts;
}

// ============================================
// LOAD ALL PRODUCTS
// ============================================
async function loadAllProducts() {
    const tbody = document.getElementById('productsTableBody');
    const noProductsMessage = document.getElementById('noProductsMessage');
    
    if (!tbody) return;
    
    try {
        // Show loading
        tbody.innerHTML = '<tr><td colspan="7" class="loading-cell"><i class="fas fa-spinner fa-spin"></i> Loading products...</td></tr>';
        
        // Check if Firebase is initialized
        if (typeof db !== 'undefined') {
            const snapshot = await firebase.firestore().collection('products').orderBy('name').get();
            
            if (!snapshot.empty) {
                allProducts = [];
                snapshot.forEach(doc => {
                    allProducts.push({ id: doc.id, ...doc.data() });
                });
            }
        } else {
            // Load from localStorage
            const savedProducts = localStorage.getItem('adminProducts');
            if (savedProducts) {
                allProducts = JSON.parse(savedProducts);
            }
        }
        
        // Display products
        displayProducts(allProducts);
        
        // Update dashboard stats
        updateDashboardStats();
        
    } catch (error) {
        console.error('Error loading products:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="loading-cell" style="color: #e74c3c;"><i class="fas fa-exclamation-circle"></i> Error loading products</td></tr>';
        showNotification('Error loading products', 'error');
    }
}

// ============================================
// DISPLAY PRODUCTS IN TABLE
// ============================================
function displayProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    const noProductsMessage = document.getElementById('noProductsMessage');
    
    if (!tbody) return;
    
    // Clear table
    tbody.innerHTML = '';
    
    // Check if no products
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">No products found</td></tr>';
        if (noProductsMessage) noProductsMessage.style.display = 'block';
        return;
    }
    
    if (noProductsMessage) noProductsMessage.style.display = 'none';
    
    // Display each product
    products.forEach(product => {
        const row = createProductRow(product);
        tbody.appendChild(row);
    });
}

// ============================================
// CREATE PRODUCT TABLE ROW
// ============================================
function createProductRow(product) {
    const row = document.createElement('tr');
    row.className = 'fade-in-up';
    
    const stockClass = product.stockStatus === 'In Stock' ? 'in-stock' : 'out-of-stock';
    const categoryName = CATEGORY_NAMES[product.category] || product.category;
    
    row.innerHTML = `
        <td>
            <img src="${product.image || 'images/placeholder-product.jpg'}" 
                 alt="${product.name}" 
                 class="product-img-cell"
                 onerror="this.src='images/placeholder-product.jpg'">
        </td>
        <td><strong>${product.name}</strong></td>
        <td>${categoryName}</td>
        <td>£${parseFloat(product.price).toFixed(2)}</td>
        <td>${product.unit || '-'}</td>
        <td><span class="stock-badge ${stockClass}">${product.stockStatus}</span></td>
        <td>
            <div class="action-btns">
                <button class="btn-icon btn-edit" onclick="editProduct('${product.id}')" title="Edit product">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteProduct('${product.id}')" title="Delete product">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// ============================================
// SETUP PRODUCT SEARCH
// ============================================
function setupProductSearch() {
    const searchInput = document.getElementById('searchProducts');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            filterAndDisplayProducts(searchTerm);
        });
    }
}

// ============================================
// FILTER AND DISPLAY PRODUCTS
// ============================================
function filterAndDisplayProducts(searchTerm = '', category = 'all') {
    let filteredProducts = [...allProducts];
    
    // Filter by search term
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
            CATEGORY_NAMES[product.category].toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by category
    if (category !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === category);
    }
    
    displayProducts(filteredProducts);
}

// ============================================
// POPULATE CATEGORY FILTER
// ============================================
function populateCategoryFilter() {
    const filterSelect = document.getElementById('filterCategory');
    
    if (filterSelect) {
        // Clear existing options (except "All Categories")
        filterSelect.innerHTML = '<option value="all">All Categories</option>';
        
        // Add category options
        Object.keys(CATEGORY_NAMES).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = CATEGORY_NAMES[key];
            filterSelect.appendChild(option);
        });
    }
}

// ============================================
// FILTER PRODUCTS BY CATEGORY
// ============================================
function filterProductsByCategory() {
    const filterSelect = document.getElementById('filterCategory');
    const searchInput = document.getElementById('searchProducts');
    
    if (filterSelect) {
        const category = filterSelect.value;
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        filterAndDisplayProducts(searchTerm, category);
    }
}

// ============================================
// HANDLE PRODUCT FORM SUBMIT
// ============================================
async function handleProductSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const productData = {
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        unit: document.getElementById('productUnit').value.trim(),
        stockStatus: document.getElementById('productStock').value,
        description: document.getElementById('productDescription').value.trim(),
        image: 'images/placeholder-product.jpg'
    };
    
    // Validate required fields
    if (!productData.name || !productData.category || !productData.price) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        // Show loading
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;
        
        // Handle image upload
        if (uploadedImageFile) {
            // If image upload functionality is available
            if (typeof uploadProductImage === 'function') {
                const imageUrl = await uploadProductImage(uploadedImageFile);
                if (imageUrl) {
                    productData.image = imageUrl;
                }
            }
        } else if (currentEditingProductId) {
            // Keep existing image if editing and no new image
            const existingProduct = allProducts.find(p => p.id === currentEditingProductId);
            if (existingProduct) {
                productData.image = existingProduct.image;
            }
        }
        
        // Add category name for display
        productData.categoryName = CATEGORY_NAMES[productData.category];
        
        // Save to Firebase or localStorage
        if (typeof db !== 'undefined') {
            if (currentEditingProductId) {
                // Update existing product
                await firebase.firestore().collection('products').doc(currentEditingProductId).update(productData);
                showNotification('Product updated successfully!', 'success');
            } else {
                // Add new product
                productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await firebase.firestore().collection('products').add(productData);
                showNotification('Product added successfully!', 'success');
            }
        } else {
            // Save to localStorage
            if (currentEditingProductId) {
                // Update existing
                const index = allProducts.findIndex(p => p.id === currentEditingProductId);
                if (index !== -1) {
                    allProducts[index] = { ...allProducts[index], ...productData };
                }
                showNotification('Product updated successfully!', 'success');
            } else {
                // Add new
                productData.id = 'product-' + Date.now();
                allProducts.push(productData);
                showNotification('Product added successfully!', 'success');
            }
            
            // Save to localStorage
            localStorage.setItem('adminProducts', JSON.stringify(allProducts));
        }
        
        // Reset form and reload products
        resetForm();
        await loadAllProducts();
        showSection('products');
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Error saving product: ' + error.message, 'error');
        
        // Reset button
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Product';
        submitBtn.disabled = false;
    }
}

// ============================================
// EDIT PRODUCT
// ============================================
function editProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    // Set current editing ID
    currentEditingProductId = productId;
    
    // Populate form
    document.getElementById('productId').value = productId;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productUnit').value = product.unit || '';
    document.getElementById('productStock').value = product.stockStatus;
    document.getElementById('productDescription').value = product.description || '';
    
    // Show image preview if exists
    if (product.image && product.image !== 'images/placeholder-product.jpg') {
        const previewContainer = document.getElementById('imagePreviewContainer');
        const previewImage = document.getElementById('imagePreview');
        if (previewContainer && previewImage) {
            previewImage.src = product.image;
            previewContainer.style.display = 'block';
        }
    }
    
    // Update form title and button
    document.getElementById('formTitle').textContent = 'Edit Product';
    document.getElementById('submitBtnText').textContent = 'Update Product';
    
    // Show add product section
    showSection('add-product');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// DELETE PRODUCT
// ============================================
function deleteProduct(productId) {
    productToDelete = productId;
    openDeleteModal();
}

// ============================================
// CONFIRM DELETE
// ============================================
async function confirmDelete() {
    if (!productToDelete) return;
    
    try {
        // Delete from Firebase or localStorage
        if (typeof db !== 'undefined') {
            await firebase.firestore().collection('products').doc(productToDelete).delete();
        } else {
            // Delete from localStorage
            allProducts = allProducts.filter(p => p.id !== productToDelete);
            localStorage.setItem('adminProducts', JSON.stringify(allProducts));
        }
        
        showNotification('Product deleted successfully!', 'success');
        
        // Reload products
        await loadAllProducts();
        
        // Close modal
        closeDeleteModal();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product: ' + error.message, 'error');
    }
}

// ============================================
// RESET FORM
// ============================================
function resetForm() {
    // Clear form
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    
    // Reset editing state
    currentEditingProductId = null;
    uploadedImageFile = null;
    
    // Hide image preview
    const previewContainer = document.getElementById('imagePreviewContainer');
    if (previewContainer) {
        previewContainer.style.display = 'none';
    }
    
    // Reset form title and button
    document.getElementById('formTitle').textContent = 'Add New Product';
    document.getElementById('submitBtnText').textContent = 'Save Product';
}

// ============================================
// PREVIEW IMAGE
// ============================================
function previewImage(event) {
    const file = event.target.files[0];
    
    if (file) {
        // Store file for upload
        uploadedImageFile = file;
        
        // Preview image
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewContainer = document.getElementById('imagePreviewContainer');
            const previewImage = document.getElementById('imagePreview');
            
            if (previewContainer && previewImage) {
                previewImage.src = e.target.result;
                previewContainer.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
}

// ============================================
// REMOVE IMAGE PREVIEW
// ============================================
function removeImagePreview() {
    uploadedImageFile = null;
    
    const previewContainer = document.getElementById('imagePreviewContainer');
    const imageInput = document.getElementById('productImage');
    
    if (previewContainer) {
        previewContainer.style.display = 'none';
    }
    
    if (imageInput) {
        imageInput.value = '';
    }
}

// ============================================
// OPEN DELETE MODAL
// ============================================
function openDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// ============================================
// CLOSE DELETE MODAL
// ============================================
function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    productToDelete = null;
}

// ============================================
// LOAD CATEGORIES STATISTICS
// ============================================
function loadCategoriesStats() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    
    if (!categoriesGrid) return;
    
    // Clear grid
    categoriesGrid.innerHTML = '';
    
    // Calculate product count per category
    Object.keys(CATEGORY_NAMES).forEach(categoryKey => {
        const count = allProducts.filter(p => p.category === categoryKey).length;
        
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-item fade-in-up';
        categoryCard.innerHTML = `
            <h3>${CATEGORY_NAMES[categoryKey]}</h3>
            <div class="category-count">${count}</div>
            <p>Products</p>
        `;
        
        categoriesGrid.appendChild(categoryCard);
    });
}

// ============================================
// EXPORT PRODUCTS
// ============================================
function exportProducts() {
    if (allProducts.length === 0) {
        showNotification('No products to export', 'error');
        return;
    }
    
    try {
        // Convert to JSON
        const dataStr = JSON.stringify(allProducts, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Create download link
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `skye-products-${new Date().toISOString().split('T')[0]}.json`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Products exported successfully!', 'success');
        
    } catch (error) {
        console.error('Error exporting products:', error);
        showNotification('Error exporting products', 'error');
    }
}

// ============================================
// SHOW NOTIFICATION
// ============================================
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.admin-notification');
    existing.forEach(n => n.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `admin-notification notification-${type} notification-slide-in`;
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle'
    };
    
    const colors = {
        success: '#2ECC71',
        error: '#E74C3C',
        info: '#3498DB',
        warning: '#F39C12'
    };
    
    notification.innerHTML = `
        <i class="fas fa-${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type]};
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
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease forwards';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ============================================
// MAKE FUNCTIONS GLOBALLY AVAILABLE
// ============================================
window.loadAllProducts = loadAllProducts;
window.filterProductsByCategory = filterProductsByCategory;
window.handleProductSubmit = handleProductSubmit;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.confirmDelete = confirmDelete;
window.resetForm = resetForm;
window.previewImage = previewImage;
window.removeImagePreview = removeImagePreview;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.loadCategoriesStats = loadCategoriesStats;
window.exportProducts = exportProducts;