// assets/js/components.js - Component Loader and Navigation Manager

// ========================================
// COMPONENT LOADING FUNCTIONS
// ========================================

/**
 * Load header component into the page
 */
async function loadHeader() {
    try {
        const response = await fetch('/components/header.html');
        if (!response.ok) throw new Error('Header not found');
        const html = await response.text();
        
        // Find all header placeholders
        const headerPlaceholders = document.querySelectorAll('#header-placeholder, #header');
        headerPlaceholders.forEach(placeholder => {
            placeholder.innerHTML = html;
        });
        
        // After header is loaded, update navbar based on auth status
        updateNavbarAuth();
        initMobileMenu();
        initStickyHeader();
        
        return true;
    } catch (error) {
        console.error('Error loading header:', error);
        return false;
    }
}

/**
 * Load footer component into the page
 */
async function loadFooter() {
    try {
        const response = await fetch('/components/footer.html');
        if (!response.ok) throw new Error('Footer not found');
        const html = await response.text();
        
        // Find all footer placeholders
        const footerPlaceholders = document.querySelectorAll('#footer-placeholder, #footer');
        footerPlaceholders.forEach(placeholder => {
            placeholder.innerHTML = html;
        });
        
        return true;
    } catch (error) {
        console.error('Error loading footer:', error);
        return false;
    }
}

/**
 * Load navbar component separately
 */
async function loadNavbar() {
    try {
        const response = await fetch('/components/navbar.html');
        if (!response.ok) throw new Error('Navbar not found');
        const html = await response.text();
        
        // Find all navbar placeholders
        const navbarPlaceholders = document.querySelectorAll('#navbar-placeholder, #navbar');
        navbarPlaceholders.forEach(placeholder => {
            placeholder.innerHTML = html;
        });
        
        // After navbar is loaded, update auth links
        updateNavbarAuth();
        
        return true;
    } catch (error) {
        console.error('Error loading navbar:', error);
        return false;
    }
}

/**
 * Load all components at once
 */
async function loadComponents() {
    await Promise.all([
        loadHeader(),
        loadFooter(),
        loadNavbar()
    ]);
}

// ========================================
// NAVIGATION & AUTH FUNCTIONS
// ========================================

/**
 * Get current user from localStorage
 */
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
}

/**
 * Check if user is admin
 */
function isAdmin() {
    const user = getCurrentUser();
    if (!user) return false;
    return user.role === 'admin' || (user.email && user.email.includes('admin'));
}

/**
 * Update navbar links based on authentication status
 */
function updateNavbarAuth() {
    const navList = document.getElementById('nav-links');
    if (!navList) return;
    
    // Remove existing auth links to avoid duplicates
    const existingAuthLinks = document.querySelectorAll('.auth-link');
    existingAuthLinks.forEach(link => link.remove());
    
    const isLoggedIn = isAuthenticated();
    
    if (isLoggedIn) {
        const user = getCurrentUser();
        const isUserAdmin = isAdmin();
        
        // Dashboard link
        const dashboardLi = document.createElement('li');
        dashboardLi.className = 'auth-link';
        dashboardLi.innerHTML = '<a href="/pages/dashboard-new.html" class="cta-nav cta-nav-dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a>';
        navList.appendChild(dashboardLi);
        
        // Admin link (only for admin users)
        if (isUserAdmin) {
            const adminLi = document.createElement('li');
            adminLi.className = 'auth-link';
            adminLi.innerHTML = '<a href="/pages/admin-dashboard.html" class="cta-nav cta-nav-admin"><i class="fas fa-shield-alt"></i> Admin</a>';
            navList.appendChild(adminLi);
        }
        
        // Logout button
        const logoutLi = document.createElement('li');
        logoutLi.className = 'auth-link';
        logoutLi.innerHTML = '<a href="#" id="logout-nav-btn" class="cta-nav cta-nav-logout"><i class="fas fa-sign-out-alt"></i> Logout</a>';
        navList.appendChild(logoutLi);
        
        // Add logout event listener
        const logoutBtn = document.getElementById('logout-nav-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    } else {
        // Login button
        const loginLi = document.createElement('li');
        loginLi.className = 'auth-link';
        loginLi.innerHTML = '<a href="/pages/login.html" class="cta-nav cta-nav-login"><i class="fas fa-sign-in-alt"></i> Login</a>';
        navList.appendChild(loginLi);
        
        // Signup button
        const signupLi = document.createElement('li');
        signupLi.className = 'auth-link';
        signupLi.innerHTML = '<a href="/pages/register.html" class="cta-nav cta-nav-signup"><i class="fas fa-user-plus"></i> Sign Up</a>';
        navList.appendChild(signupLi);
    }
}

/**
 * Logout function - clears localStorage and redirects
 */
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('registeredUsers');
    window.location.href = '/index.html';
}

// ========================================
// UI INTERACTION FUNCTIONS
// ========================================

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    
    if (!mobileBtn || !mainNav) return;
    
    // Remove existing event listener to avoid duplicates
    const newBtn = mobileBtn.cloneNode(true);
    mobileBtn.parentNode.replaceChild(newBtn, mobileBtn);
    const freshBtn = document.getElementById('mobileMenuBtn');
    
    freshBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        mainNav.classList.toggle('active');
        
        const icon = this.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
        
        // Add/remove overlay
        let overlay = document.querySelector('.menu-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'menu-overlay';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', function() {
                mainNav.classList.remove('active');
                this.classList.remove('active');
                const btnIcon = freshBtn.querySelector('i');
                if (btnIcon) {
                    btnIcon.classList.add('fa-bars');
                    btnIcon.classList.remove('fa-times');
                }
            });
        }
        overlay.classList.toggle('active');
    });
}

/**
 * Initialize sticky header on scroll
 */
function initStickyHeader() {
    const header = document.querySelector('.main-header');
    if (!header) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = target.offsetTop;
                const offsetPosition = elementPosition - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize scroll animations
 */
function initScrollAnimations() {
    const animateElements = document.querySelectorAll('.service-card, .resource-card, .feature-item, .testimonial-card, .stat-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    animateElements.forEach(el => observer.observe(el));
}

/**
 * Initialize form validation
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.remove('invalid');
                    const errorDiv = this.parentElement.querySelector('.field-error');
                    if (errorDiv) errorDiv.textContent = '';
                }
            });
            
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    });
}

/**
 * Validate individual form field
 */
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    field.classList.remove('valid', 'invalid');
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'This field is required';
    } else if (field.type === 'email' && value && !value.includes('@')) {
        isValid = false;
        message = 'Please enter a valid email address';
    } else if (field.type === 'password' && value && value.length < 6) {
        isValid = false;
        message = 'Password must be at least 6 characters';
    }
    
    if (isValid && value) {
        field.classList.add('valid');
    } else if (!isValid) {
        field.classList.add('invalid');
        showFieldError(field.id, message);
    }
}

/**
 * Show field error message
 */
function showFieldError(fieldId, message) {
    const errorDiv = document.getElementById(`${fieldId}-error`);
    if (errorDiv) {
        errorDiv.textContent = message;
    }
}

/**
 * Clear all form errors
 */
function clearFormErrors() {
    document.querySelectorAll('.field-error').forEach(el => {
        el.textContent = '';
    });
    document.querySelectorAll('input').forEach(el => {
        el.classList.remove('valid', 'invalid');
    });
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Show notification message
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize all components and features
 */
function initComponents() {
    // First load components
    loadComponents().then(() => {
        // Then initialize all features
        initMobileMenu();
        initStickyHeader();
        initSmoothScrolling();
        initScrollAnimations();
        initFormValidation();
    });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents);
} else {
    initComponents();
}

// ========================================
// EXPORTS (for module usage)
// ========================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadHeader,
        loadFooter,
        loadNavbar,
        loadComponents,
        getCurrentUser,
        isAuthenticated,
        isAdmin,
        updateNavbarAuth,
        logout,
        initMobileMenu,
        initStickyHeader,
        initSmoothScrolling,
        initScrollAnimations,
        initFormValidation,
        validateField,
        showFieldError,
        clearFormErrors,
        escapeHtml,
        capitalizeFirst,
        showNotification
    };
}