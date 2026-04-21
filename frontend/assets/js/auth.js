// assets/js/auth.js - Authentication Module for Smash&Heal
const API_URL = 'https://smashheal.onrender.com/api';

// Password validation utilities
const PasswordValidator = {
    requirements: {
        length: (pwd) => pwd.length >= 8,
        uppercase: (pwd) => /[A-Z]/.test(pwd),
        lowercase: (pwd) => /[a-z]/.test(pwd),
        number: (pwd) => /\d/.test(pwd),
        symbol: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    },

    validate(password) {
        return {
            length: this.requirements.length(password),
            uppercase: this.requirements.uppercase(password),
            lowercase: this.requirements.lowercase(password),
            number: this.requirements.number(password),
            symbol: this.requirements.symbol(password)
        };
    },

    allMet(password) {
        const result = this.validate(password);
        return Object.values(result).every(req => req === true);
    }
};

// Check authentication status
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const currentUser = localStorage.getItem('currentUser');
    return !!(token && currentUser);
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    if (!user) return false;
    return user.role === 'admin';
}

// Login function - CONNECTED TO BACKEND
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Transform backend data to frontend format
            const user = {
                id: data.user.id,
                fullName: data.user.name,
                email: data.user.email,
                role: data.user.role,
                sessionsBooked: 0,
                amountPaid: 0,
                totalAmount: 0
            };
            
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            return { success: true, user: user };
        } else {
            return { success: false, message: data.message || 'Login failed' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

// Register function - CONNECTED TO BACKEND
async function register(fullName, email, password, isAdmin = false) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                name: fullName,
                email, 
                password 
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            const user = {
                id: data.user.id,
                fullName: data.user.name,
                email: data.user.email,
                role: isAdmin ? 'admin' : data.user.role,
                sessionsBooked: 0,
                amountPaid: 0,
                totalAmount: 0
            };
            
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            return { success: true, user: user };
        } else {
            return { success: false, message: data.message || 'Registration failed' };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/index.html';
}

// Update password requirements display
function updatePasswordRequirements(password) {
    const validation = PasswordValidator.validate(password);
    
    const requirementMap = {
        length: 'req-length',
        uppercase: 'req-uppercase',
        lowercase: 'req-lowercase',
        number: 'req-number',
        symbol: 'req-symbol'
    };
    
    for (const [key, elementId] of Object.entries(requirementMap)) {
        const element = document.getElementById(elementId);
        if (element) {
            const icon = element.querySelector('i');
            if (validation[key]) {
                element.classList.add('met');
                if (icon) icon.className = 'fas fa-check-circle';
            } else {
                element.classList.remove('met');
                if (icon) icon.className = 'fas fa-circle-notch';
            }
        }
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    
    if (emailError) emailError.textContent = '';
    if (passwordError) passwordError.textContent = '';
    
    let isValid = true;
    
    if (!email) {
        if (emailError) emailError.textContent = 'Email is required';
        isValid = false;
    } else if (!email.includes('@')) {
        if (emailError) emailError.textContent = 'Please enter a valid email';
        isValid = false;
    }
    
    if (!password) {
        if (passwordError) passwordError.textContent = 'Password is required';
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Show loading state
    const btn = document.querySelector('.auth-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    }
    
    const result = await login(email, password);
    
    if (result.success) {
        const user = result.user;
        if (user.role === 'admin') {
            window.location.href = '/pages/admin-dashboard.html';
        } else {
            window.location.href = '/pages/dashboard.html';
        }
    } else {
        if (passwordError) passwordError.textContent = result.message;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        }
    }
}

// Handle register form submission
async function handleRegister(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('full-name')?.value.trim();
    const email = document.getElementById('register-email')?.value.trim();
    const password = document.getElementById('register-password')?.value;
    const confirmPassword = document.getElementById('confirm-password')?.value;
    const termsAgree = document.getElementById('terms-agree')?.checked;
    
    // Clear errors
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    
    let isValid = true;
    
    if (!fullName) {
        const errorEl = document.getElementById('full-name-error');
        if (errorEl) errorEl.textContent = 'Full name is required';
        isValid = false;
    } else if (fullName.length < 2) {
        const errorEl = document.getElementById('full-name-error');
        if (errorEl) errorEl.textContent = 'Name must be at least 2 characters';
        isValid = false;
    }
    
    if (!email) {
        const errorEl = document.getElementById('register-email-error');
        if (errorEl) errorEl.textContent = 'Email is required';
        isValid = false;
    } else if (!email.includes('@')) {
        const errorEl = document.getElementById('register-email-error');
        if (errorEl) errorEl.textContent = 'Please enter a valid email';
        isValid = false;
    }
    
    if (!password) {
        const errorEl = document.getElementById('register-password-error');
        if (errorEl) errorEl.textContent = 'Password is required';
        isValid = false;
    } else if (!PasswordValidator.allMet(password)) {
        const errorEl = document.getElementById('register-password-error');
        if (errorEl) errorEl.textContent = 'Please meet all password requirements';
        isValid = false;
    }
    
    if (!confirmPassword) {
        const errorEl = document.getElementById('confirm-password-error');
        if (errorEl) errorEl.textContent = 'Please confirm your password';
        isValid = false;
    } else if (password !== confirmPassword) {
        const errorEl = document.getElementById('confirm-password-error');
        if (errorEl) errorEl.textContent = 'Passwords do not match';
        isValid = false;
    }
    
    if (!termsAgree) {
        const errorEl = document.getElementById('terms-error');
        if (errorEl) errorEl.textContent = 'You must agree to the terms';
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Show loading state
    const btn = document.querySelector('.auth-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    }
    
    const result = await register(fullName, email, password, false);
    
    if (result.success) {
        window.location.href = '/pages/dashboard.html';
    } else {
        const errorEl = document.getElementById('register-email-error');
        if (errorEl) errorEl.textContent = result.message;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        }
    }
}

// Redirect based on authentication
function redirectBasedOnAuth() {
    const token = localStorage.getItem('authToken');
    const currentUser = localStorage.getItem('currentUser');
    const currentPath = window.location.pathname;
    
    // If not authenticated and trying to access protected pages
    if (!token || !currentUser) {
        const protectedPages = [
            'admin-dashboard.html',
            'dashboard.html',
            'dashboard-new.html',
            'admin-register.html'
        ];
        
        const isProtectedPage = protectedPages.some(page => 
            currentPath.includes(page)
        );
        
        if (isProtectedPage) {
            localStorage.setItem('redirectAfterLogin', currentPath);
            window.location.href = '/pages/login.html';
            return false;
        }
        return false;
    }
    
    // If authenticated, check role-based access
    try {
        const user = JSON.parse(currentUser);
        if (currentPath.includes('admin-dashboard.html') && user.role !== 'admin') {
            window.location.href = '/pages/dashboard.html';
            return false;
        }
    } catch(e) {
        console.error('Error parsing user:', e);
    }
    
    return true;
}

// Initialize auth forms
document.addEventListener('DOMContentLoaded', function() {
    // Setup login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        // Add real-time password validation
        const passwordInput = document.getElementById('register-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                updatePasswordRequirements(this.value);
            });
        }
    }
    
    // Password toggle functionality for all password fields
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            if (input && input.type === 'password') {
                input.type = 'text';
                if (icon) icon.className = 'fas fa-eye-slash';
            } else if (input) {
                input.type = 'password';
                if (icon) icon.className = 'fas fa-eye';
            }
        });
    });
    
    // Check if user is already logged in and redirect from auth pages
    const token = localStorage.getItem('authToken');
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.includes('login.html') || 
                       currentPath.includes('register.html') || 
                       currentPath.includes('register-new.html');
    
    if (token && isAuthPage) {
        const user = getCurrentUser();
        if (user) {
            if (user.role === 'admin') {
                window.location.href = '/pages/admin-dashboard.html';
            } else {
                window.location.href = '/pages/dashboard.html';
            }
        }
    }
});

// Export functions for use in other files (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isAuthenticated,
        getCurrentUser,
        isAdmin,
        login,
        register,
        logout,
        redirectBasedOnAuth,
        PasswordValidator,
        updatePasswordRequirements
    };
}