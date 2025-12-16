/* ===================================
   SKYE AFRICAN SUPERMARKET - ADMIN AUTHENTICATION
   =================================== */

// ============================================
// DEFAULT CREDENTIALS (Change in production!)
// ============================================
const ADMIN_CREDENTIALS = {
    username: 'Admin',
    password: 'Admin123'
};

// Session timeout (in milliseconds)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

// ============================================
// CHECK AUTH ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // If on dashboard page, check authentication
    if (window.location.pathname.includes('admin-dashboard.html')) {
        checkAuthentication();
    }
    
    // If on login page, check if already logged in
    if (window.location.pathname.includes('admin.html')) {
        if (isAuthenticated()) {
            window.location.href = 'admin-dashboard.html';
        }
    }
    
    // Setup mobile sidebar toggle
    setupMobileSidebar();
});

// ============================================
// HANDLE LOGIN
// ============================================
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Clear previous errors
    hideLoginError();
    
    // Validate credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Create session
        const session = {
            username: username,
            loginTime: Date.now(),
            rememberMe: rememberMe
        };
        
        // Store session
        if (rememberMe) {
            localStorage.setItem('adminSession', JSON.stringify(session));
        } else {
            sessionStorage.setItem('adminSession', JSON.stringify(session));
        }
        
        // Show success message
        showLoginSuccess();
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1000);
        
    } else {
        // Show error
        showLoginError('Invalid username or password');
        
        // Shake animation
        const loginCard = document.querySelector('.admin-login-card');
        loginCard.classList.add('shake');
        setTimeout(() => loginCard.classList.remove('shake'), 500);
    }
}

// ============================================
// SHOW LOGIN ERROR
// ============================================
function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    const errorMessage = document.getElementById('loginErrorMessage');
    
    if (errorDiv && errorMessage) {
        errorMessage.textContent = message;
        errorDiv.style.display = 'flex';
    }
}

// ============================================
// HIDE LOGIN ERROR
// ============================================
function hideLoginError() {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// ============================================
// SHOW LOGIN SUCCESS
// ============================================
function showLoginSuccess() {
    const errorDiv = document.getElementById('loginError');
    const errorMessage = document.getElementById('loginErrorMessage');
    
    if (errorDiv && errorMessage) {
        errorDiv.style.display = 'flex';
        errorDiv.style.background = '#d4edda';
        errorDiv.style.border = '1px solid #c3e6cb';
        errorDiv.style.color = '#155724';
        errorMessage.innerHTML = '<i class="fas fa-check-circle"></i> Login successful! Redirecting...';
    }
}

// ============================================
// TOGGLE PASSWORD VISIBILITY
// ============================================
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('togglePasswordIcon');
    
    if (passwordInput && toggleIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    }
}

// ============================================
// CHECK AUTHENTICATION
// ============================================
function checkAuthentication() {
    if (!isAuthenticated()) {
        // Redirect to login
        window.location.href = 'admin.html';
    }
}

// ============================================
// IS AUTHENTICATED
// ============================================
function isAuthenticated() {
    // Check sessionStorage first
    let session = sessionStorage.getItem('adminSession');
    
    // If not in sessionStorage, check localStorage
    if (!session) {
        session = localStorage.getItem('adminSession');
    }
    
    if (!session) {
        return false;
    }
    
    try {
        const sessionData = JSON.parse(session);
        
        // Check if session has expired
        const currentTime = Date.now();
        const sessionAge = currentTime - sessionData.loginTime;
        
        if (sessionAge > SESSION_TIMEOUT) {
            // Session expired
            clearSession();
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error parsing session:', error);
        return false;
    }
}

// ============================================
// GET CURRENT USER
// ============================================
function getCurrentUser() {
    let session = sessionStorage.getItem('adminSession');
    if (!session) {
        session = localStorage.getItem('adminSession');
    }
    
    if (session) {
        try {
            return JSON.parse(session);
        } catch (error) {
            return null;
        }
    }
    return null;
}

// ============================================
// HANDLE LOGOUT
// ============================================
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        clearSession();
        window.location.href = 'admin.html';
    }
}

// ============================================
// CLEAR SESSION
// ============================================
function clearSession() {
    sessionStorage.removeItem('adminSession');
    localStorage.removeItem('adminSession');
}

// ============================================
// SETUP MOBILE SIDEBAR
// ============================================
function setupMobileSidebar() {
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    
    if (mobileSidebarToggle && sidebar) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-mobile-overlay';
        overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
        `;
        document.body.appendChild(overlay);
        
        // Toggle sidebar
        mobileSidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('mobile-active');
            overlay.style.display = sidebar.classList.contains('mobile-active') ? 'block' : 'none';
            document.body.style.overflow = sidebar.classList.contains('mobile-active') ? 'hidden' : '';
        });
        
        // Close on overlay click
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('mobile-active');
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        });
        
        // Close on nav link click (mobile)
        const navLinks = sidebar.querySelectorAll('.admin-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('mobile-active');
                    overlay.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        });
    }
}

// ============================================
// SHOW SECTION (DASHBOARD NAVIGATION)
// ============================================
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active nav link
    const navLinks = document.querySelectorAll('.admin-nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    const activeLink = document.querySelector(`.admin-nav-link[onclick*="${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Update page title
    const pageTitles = {
        'dashboard': 'Dashboard',
        'products': 'Manage Products',
        'add-product': 'Add New Product',
        'categories': 'Product Categories'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle && pageTitles[sectionName]) {
        pageTitle.textContent = pageTitles[sectionName];
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // If showing products section, load products
    if (sectionName === 'products') {
        if (typeof loadAllProducts === 'function') {
            loadAllProducts();
        }
    }
    
    // If showing categories section, load categories
    if (sectionName === 'categories') {
        if (typeof loadCategoriesStats === 'function') {
            loadCategoriesStats();
        }
    }
}

// ============================================
// AUTO LOGOUT ON SESSION TIMEOUT
// ============================================
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    
    // Set new timeout
    inactivityTimer = setTimeout(() => {
        if (isAuthenticated()) {
            alert('Your session has expired due to inactivity. Please login again.');
            handleLogout();
        }
    }, SESSION_TIMEOUT);
}

// Track user activity
if (window.location.pathname.includes('admin-dashboard.html')) {
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
    
    resetInactivityTimer();
}

// ============================================
// MAKE FUNCTIONS GLOBALLY AVAILABLE
// ============================================
window.handleLogin = handleLogin;
window.togglePassword = togglePassword;
window.handleLogout = handleLogout;
window.showSection = showSection;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;