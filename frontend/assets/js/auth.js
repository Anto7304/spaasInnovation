// Authentication module for Smash&Heal
const API_URL = 'http://localhost:5000/api';

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

// Update password requirement indicators in real-time
function updatePasswordRequirements(password) {
    const validation = PasswordValidator.validate(password);

    // Map validation keys to element IDs
    const requirementMap = {
        length: 'req-length',
        uppercase: 'req-uppercase',
        lowercase: 'req-lowercase',
        number: 'req-number',
        symbol: 'req-symbol'
    };

    // Update each requirement
    for (const [key, elementId] of Object.entries(requirementMap)) {
        const element = document.getElementById(elementId);
        const uncheckedIcon = element.querySelector('.unchecked');
        const checkedIcon = element.querySelector('.checked');

        if (validation[key]) {
            // Requirement met - show check icon
            element.classList.add('met');
            if (uncheckedIcon) uncheckedIcon.style.display = 'none';
            if (checkedIcon) checkedIcon.style.display = 'inline';
        } else {
            // Requirement not met - show circle icon
            element.classList.remove('met');
            if (uncheckedIcon) uncheckedIcon.style.display = 'inline';
            if (checkedIcon) checkedIcon.style.display = 'none';
        }
    }
}

// Registration handler
function handleRegistration(event) {
    event.preventDefault();

    const fullName = document.getElementById('full-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const termsAgree = document.getElementById('terms-agree').checked;

    // Clear previous errors
    clearFormErrors();

    // Validate inputs
    if (!fullName || !email || !password || !confirmPassword) {
        showError('All fields are required');
        return;
    }

    if (!termsAgree) {
        document.getElementById('terms-error').textContent = 'You must agree to the terms';
        return;
    }

    if (password !== confirmPassword) {
        document.getElementById('confirm-password-error').textContent = 'Passwords do not match';
        return;
    }

    if (!PasswordValidator.allMet(password)) {
        document.getElementById('register-password-error').textContent = 'Password does not meet all requirements';
        return;
    }

    // Show loading state
    const btn = document.querySelector('.register-btn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';

    // Send registration request to backend
    fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            fullName,
            password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store token
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            // Show success message
            alert('Account created successfully! Redirecting to dashboard...');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = './dashboard.html';
            }, 1500);
        } else {
            document.getElementById('register-password-error').textContent = data.error || 'Registration failed';
        }
    })
    .catch(error => {
        console.error('Registration error:', error);
        document.getElementById('register-password-error').textContent = 'Network error. Please try again.';
    })
    .finally(() => {
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    });
}

// Login handler
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showError('Email and password are required');
        return;
    }

    // Show loading state
    const btn = document.querySelector('.login-btn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';

    // Send login request to backend
    fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store token
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            // Show success message
            alert('Login successful! Redirecting to dashboard...');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = './dashboard.html';
            }, 1500);
        } else {
            document.getElementById('password-error').textContent = data.error || 'Login failed';
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        document.getElementById('password-error').textContent = 'Network error. Please try again.';
    })
    .finally(() => {
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    });
}

// Clear form errors
function clearFormErrors() {
    const errorElements = document.querySelectorAll('.field-error');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

// Show error message
function showError(message) {
    alert(message);
}

// Initialize registration form
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);

        // Add real-time password validation
        const passwordInput = document.getElementById('register-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                updatePasswordRequirements(this.value);
            });
        }
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token && window.location.pathname.includes('login') || window.location.pathname.includes('register')) {
        // Redirect logged-in users away from auth pages
        // window.location.href = './dashboard.html';
    }
});

// Logout handler
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = './login.html';
}
