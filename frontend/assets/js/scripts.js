// Smash&Heal User Authentication System
class UserDatabase {
    constructor() {
        this.storageKey = 'smashAndHeal_users';
        this.currentUserKey = 'smashAndHeal_currentUser';
    }

    // Get all users from localStorage
    getUsers() {
        const users = localStorage.getItem(this.storageKey);
        return users ? JSON.parse(users) : [];
    }

    // Save users to localStorage
    saveUsers(users) {
        localStorage.setItem(this.storageKey, JSON.stringify(users));
    }

    // Register a new user
    registerUser(userData) {
        const users = this.getUsers();

        // Check if user already exists
        const existingUser = users.find(user => user.email === userData.email);
        if (existingUser) {
            throw new Error('An account with this email already exists');
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            fullName: userData.fullName,
            email: userData.email,
            password: userData.password, // In a real app, this would be hashed
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        users.push(newUser);
        this.saveUsers(users);
        return newUser;
    }

    // Authenticate user login
    authenticateUser(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return null;
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveUsers(users);

        return user;
    }

    // Check if user exists by email
    userExists(email) {
        const users = this.getUsers();
        return users.some(user => user.email === email);
    }

    // Set current logged-in user
    setCurrentUser(user) {
        localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }

    // Get current logged-in user
    getCurrentUser() {
        const user = localStorage.getItem(this.currentUserKey);
        return user ? JSON.parse(user) : null;
    }

    // Logout current user
    logoutUser() {
        localStorage.removeItem(this.currentUserKey);
    }
}

// Initialize user database
const userDB = new UserDatabase();

    // Login form validation (existing functionality)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent form submission
            
            // Clear previous errors
            clearFormErrors();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            let isValid = true;
            
            // Validate name
            if (!name) {
                showFieldError('name', 'Please enter your full name');
                isValid = false;
            } else if (name.length < 2) {
                showFieldError('name', 'Name must be at least 2 characters');
                isValid = false;
            }
            
            // Validate email
            if (!email) {
                showFieldError('email', 'Please enter your email address');
                isValid = false;
            } else if (!validateEmail(email)) {
                showFieldError('email', 'Please enter a valid email address');
                isValid = false;
            }
            
            // Validate password
            if (!password) {
                showFieldError('password', 'Please enter your password');
                isValid = false;
            } else if (password.length < 6) {
                showFieldError('password', 'Password must be at least 6 characters');
                isValid = false;
            }
            
            if (!isValid) {
                return false;
            }
            
            // Check if user exists in database
            if (!userDB.userExists(email)) {
                // User doesn't exist, redirect to registration
                alert('No account found with this email. Please create a new account.');
                window.location.href = 'register.html';
                return false;
            }

            // Attempt login
            const user = userDB.authenticateUser(email, password);
            if (!user) {
                showFieldError('password', 'Incorrect password. Please try again.');
                return false;
            }

            // Show loading state
            const submitBtn = loginForm.querySelector('.login-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');
            
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'block';
            
            // Set current user and redirect
            userDB.setCurrentUser(user);
            
            setTimeout(() => {
                // Success message
                alert(`Welcome back, ${user.fullName}!`);
                
                // Reset form and button state
                loginForm.reset();
                submitBtn.disabled = false;
                btnText.style.display = 'block';
                btnLoader.style.display = 'none';
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            }, 1500);
        });
    }
});

// Registration form validation
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent form submission
            
            // Clear previous errors
            clearFormErrors();
            
            const fullName = document.getElementById('full-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const termsAgreed = document.getElementById('terms-agree').checked;
            
            let isValid = true;
            
            // Validate full name
            if (!fullName) {
                showFieldError('full-name', 'Please enter your full name');
                isValid = false;
            } else if (fullName.length < 2) {
                showFieldError('full-name', 'Name must be at least 2 characters');
                isValid = false;
            }
            
            // Validate email
            if (!email) {
                showFieldError('register-email', 'Please enter your email address');
                isValid = false;
            } else if (!validateEmail(email)) {
                showFieldError('register-email', 'Please enter a valid email address');
                isValid = false;
            }
            
            // Validate password strength
            const passwordValidation = validatePasswordStrength(password);
            if (!passwordValidation.isValid) {
                showFieldError('register-password', passwordValidation.message);
                isValid = false;
            }
            
            // Validate password confirmation
            if (!confirmPassword) {
                showFieldError('confirm-password', 'Please confirm your password');
                isValid = false;
            } else if (password !== confirmPassword) {
                showFieldError('confirm-password', 'Passwords do not match');
                isValid = false;
            }
            
            // Validate terms agreement
            if (!termsAgreed) {
                showFieldError('terms', 'Please agree to the Terms of Service and Privacy Policy');
                isValid = false;
            }
            
            if (!isValid) {
                return false;
            }

            // Show loading state
            const submitBtn = registerForm.querySelector('.register-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');
            
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'block';
            
            try {
                // Register the user
                const newUser = userDB.registerUser({
                    fullName: fullName,
                    email: email,
                    password: password
                });
                
                // Set current user
                userDB.setCurrentUser(newUser);
                
                setTimeout(() => {
                    // Success message
                    alert(`Welcome to Smash&Heal, ${newUser.fullName}! Your account has been created successfully.`);
                    
                    // Reset form and button state
                    registerForm.reset();
                    submitBtn.disabled = false;
                    btnText.style.display = 'block';
                    btnLoader.style.display = 'none';
                    
                    // Reset password requirements display
                    updatePasswordRequirements('');
                    
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                }, 2000);
                
            } catch (error) {
                // Reset button state
                submitBtn.disabled = false;
                btnText.style.display = 'block';
                btnLoader.style.display = 'none';
                
                // Show error
                if (error.message.includes('already exists')) {
                    showFieldError('register-email', 'An account with this email already exists');
                } else {
                    alert('Registration failed. Please try again.');
                }
                return false;
            }
        });
    }
});

// Password strength validation function
function validatePasswordStrength(password) {
    if (!password) {
        return { isValid: false, message: 'Please enter a password' };
    }
    
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/\d/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one special character' };
    }
    
    return { isValid: true };
}

// Update password requirements display
function updatePasswordRequirements(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    // Update requirement indicators
    Object.keys(requirements).forEach(req => {
        const element = document.getElementById(`req-${req}`);
        if (element) {
            const icon = element.querySelector('i');
            
            if (requirements[req]) {
                element.classList.add('met');
                icon.className = 'fas fa-check';
            } else {
                element.classList.remove('met');
                icon.className = 'fas fa-times';
            }
        }
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const headerOffset = 80;
                const elementPosition = targetSection.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Header animation on scroll
function initHeaderAnimation() {
    const header = document.querySelector('.main-header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }

        // Add background blur on scroll
        if (scrollTop > 50) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
}

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .resource-card, .feature-item, .about-content, .services-grid, .resources-grid');
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// Animated counters for statistics
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;

    const animateCounter = (counter) => {
        const target = parseInt(counter.innerText.replace(/[^\d]/g, ''));
        const count = +counter.innerText.replace(/[^\d]/g, '');
        const increment = target / speed;

        if (count < target) {
            counter.innerText = Math.ceil(count + increment) + (counter.innerText.includes('K+') ? 'K+' : counter.innerText.includes('%') ? '%' : '+');
            setTimeout(() => animateCounter(counter), 1);
        } else {
            counter.innerText = target + (counter.innerText.includes('K+') ? 'K+' : counter.innerText.includes('%') ? '%' : '+');
        }
    };

    // Trigger animation when stats come into view
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.stat-number');
                counters.forEach(counter => animateCounter(counter));
                statsObserver.unobserve(entry.target);
            }
        });
    });

    const statsSection = document.querySelector('.image-overlay');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
}

// Enhanced form validation
function initFormValidation() {
    // Add real-time validation for any forms
    const inputs = document.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('invalid')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    // Remove previous validation classes
    field.classList.remove('valid', 'invalid');

    switch (field.type) {
        case 'email':
            if (!validateEmail(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
            break;
        case 'password':
            if (value.length < 6) {
                isValid = false;
                message = 'Password must be at least 6 characters';
            }
            break;
        default:
            if (field.hasAttribute('required') && !value) {
                isValid = false;
                message = 'This field is required';
            }
    }

    if (isValid && value) {
        field.classList.add('valid');
    } else if (!isValid) {
        field.classList.add('invalid');
        showFieldError(field.id, message);
    }
}

function showFieldError(fieldId, message) {
    const errorDiv = document.getElementById(fieldId + '-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function clearFormErrors() {
    const errorDivs = document.querySelectorAll('.field-error');
    errorDivs.forEach(div => {
        div.textContent = '';
        div.style.display = 'none';
    });
    
    // Remove validation classes
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.classList.remove('valid', 'invalid');
    });
}

// Email validation function
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Parallax effect for background elements
function initParallax() {
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;

        const bgElements = document.querySelectorAll('.bg-circle');
        bgElements.forEach(element => {
            element.style.transform = `translateY(${rate * 0.1}px)`;
        });
    });
}

// Initialize parallax if supported
if (typeof window !== 'undefined' && window.addEventListener) {
    initParallax();
}

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .field-error {
        animation: slideDown 0.3s ease;
    }

    .valid {
        border-color: #4CAF50 !important;
        box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2) !important;
    }

    .invalid {
        border-color: #e74c3c !important;
        box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2) !important;
    }

    body.loaded {
        opacity: 1;
        transition: opacity 0.3s ease;
    }

    body {
        opacity: 0;
    }
`;
document.head.appendChild(style);

// Service worker registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Register service worker for offline functionality
        // navigator.serviceWorker.register('/sw.js');
    });
}

// Accessibility improvements
document.addEventListener('keydown', function(e) {
    // Skip to main content with Tab
    if (e.key === 'Tab') {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.setAttribute('tabindex', '-1');
        }
    }
});

// Performance monitoring
if ('performance' in window && 'mark' in window.performance) {
    window.performance.mark('page-load-start');
    window.addEventListener('load', function() {
        window.performance.mark('page-load-end');
        window.performance.measure('page-load-time', 'page-load-start', 'page-load-end');
        const measure = window.performance.getEntriesByName('page-load-time')[0];
        console.log('Page load time:', measure.duration + 'ms');
    });
}