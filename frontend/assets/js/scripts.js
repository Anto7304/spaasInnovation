// assets/js/scripts.js - Legacy scripts for backward compatibility

// Email validation function
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Clear form errors
function clearFormErrors() {
    const errorDivs = document.querySelectorAll('.field-error');
    errorDivs.forEach(div => {
        div.textContent = '';
    });
    
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.classList.remove('valid', 'invalid');
    });
}

// Show field error
function showFieldError(fieldId, message) {
    const errorDiv = document.getElementById(fieldId + '-error');
    if (errorDiv) {
        errorDiv.textContent = message;
    }
}

// Validate field
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

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

// Initialize form validation
function initFormValidation() {
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

// Initialize scroll animations
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

    const animateElements = document.querySelectorAll('.service-card, .resource-card, .feature-item');
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// Initialize all on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initFormValidation();
    initSmoothScrolling();
    initScrollAnimations();
    
    // Add loaded class to body
    document.body.classList.add('loaded');
});