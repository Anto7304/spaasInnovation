// assets/js/main.js - Global interactive functions

// Animate numbers when they come into view
function animateNumbers() {
    const numberElements = document.querySelectorAll('.stat-number, .counter');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const targetValue = parseInt(element.getAttribute('data-target') || element.textContent);
                if (!isNaN(targetValue)) {
                    let current = 0;
                    const increment = targetValue / 50;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= targetValue) {
                            element.textContent = targetValue + (element.textContent.includes('K+') ? 'K+' : element.textContent.includes('%') ? '%' : '');
                            clearInterval(timer);
                        } else {
                            element.textContent = Math.floor(current) + (element.textContent.includes('K+') ? 'K+' : element.textContent.includes('%') ? '%' : '');
                        }
                    }, 30);
                }
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.5 });
    
    numberElements.forEach(el => observer.observe(el));
}

// Smooth scroll for navigation
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Header scroll effect
function initHeaderScroll() {
    const header = document.querySelector('.main-header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Mobile menu toggle
function initMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileBtn && mainNav) {
        mobileBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mainNav.contains(e.target) && !mobileBtn.contains(e.target)) {
                mainNav.classList.remove('active');
                const icon = mobileBtn.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            }
        });
    }
}

// Form validation
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('invalid');
                    
                    // Show error message
                    let errorDiv = field.parentElement.querySelector('.field-error');
                    if (!errorDiv) {
                        errorDiv = document.createElement('div');
                        errorDiv.className = 'field-error';
                        field.parentElement.appendChild(errorDiv);
                    }
                    errorDiv.textContent = 'This field is required';
                } else {
                    field.classList.remove('invalid');
                    const errorDiv = field.parentElement.querySelector('.field-error');
                    if (errorDiv) errorDiv.textContent = '';
                }
            });
            
            if (!isValid) {
                e.preventDefault();
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (input.value.trim()) {
                    input.classList.remove('invalid');
                    const errorDiv = input.parentElement.querySelector('.field-error');
                    if (errorDiv) errorDiv.textContent = '';
                }
            });
        });
    });
}

// Newsletter subscription
function initNewsletter() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('newsletter-email')?.value;
            const messageDiv = document.getElementById('newsletter-message');
            
            if (email && validateEmail(email)) {
                // Simulate API call
                messageDiv.innerHTML = '<div class="alert alert-success"><i class="fas fa-check-circle"></i> Thank you for subscribing! Check your email for confirmation.</div>';
                newsletterForm.reset();
                
                setTimeout(() => {
                    messageDiv.innerHTML = '';
                }, 5000);
            } else {
                messageDiv.innerHTML = '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> Please enter a valid email address.</div>';
                setTimeout(() => {
                    messageDiv.innerHTML = '';
                }, 3000);
            }
        });
    }
}

// Email validation helper
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Scroll to top button
function initScrollToTop() {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.className = 'scroll-top-btn';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--gradient-primary);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: var(--shadow-md);
    `;
    
    document.body.appendChild(button);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
        } else {
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
        }
    });
    
    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Lazy load images
function initLazyLoad() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Add hover effects to cards
function initCardEffects() {
    const cards = document.querySelectorAll('.service-card, .resource-card, .testimonial-card, .feature-item');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

// Initialize all on load
document.addEventListener('DOMContentLoaded', () => {
    animateNumbers();
    initSmoothScroll();
    initHeaderScroll();
    initMobileMenu();
    initFormValidation();
    initNewsletter();
    initScrollToTop();
    initCardEffects();
    document.body.classList.add('loaded');
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateEmail,
        animateNumbers,
        initSmoothScroll,
        initMobileMenu
    };
}