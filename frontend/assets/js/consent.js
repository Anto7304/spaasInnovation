// consent.js - Consent Form Handler
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = '../pages/login.html';
        return;
    }

    // Initialize consent form
    initializeConsentForm();
});

function initializeConsentForm() {
    const consentCheckbox = document.getElementById('consent-checkbox');
    const agreeBtn = document.getElementById('agree-btn');
    const declineBtn = document.getElementById('decline-btn');
    const viewConsentBtn = document.getElementById('view-consent-btn');
    const warning = document.getElementById('consent-warning');

    // Handle checkbox change
    consentCheckbox.addEventListener('change', function() {
        agreeBtn.disabled = !this.checked;
        warning.style.display = this.checked ? 'none' : 'block';
        if (this.checked) {
            agreeBtn.classList.add('enabled');
        } else {
            agreeBtn.classList.remove('enabled');
        }
    });

    // Handle agree button
    agreeBtn.addEventListener('click', function() {
        if (consentCheckbox.checked) {
            handleConsentAgreement();
        }
    });

    // Handle decline button
    declineBtn.addEventListener('click', function() {
        handleConsentDecline();
    });

    // Handle view consent button (optional tracking)
    viewConsentBtn.addEventListener('click', function() {
        // Optional: Track that user opened the consent form
        console.log('User opened consent form for review');
    });
}

async function handleConsentAgreement() {
    try {
        // Update user's consent status in the backend
        const response = await fetch('http://localhost:5000/api/auth/consent', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                consented: true,
                consentDate: new Date().toISOString()
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Store consent status locally
            localStorage.setItem('consentAgreed', 'true');
            localStorage.setItem('consentDate', new Date().toISOString());

            // Redirect to dashboard
            window.location.href = '../pages/dashboard.html';
        } else {
            showError('Failed to record consent. Please try again.');
        }
    } catch (error) {
        console.error('Error recording consent:', error);
        showError('Network error. Please check your connection and try again.');
    }
}

function handleConsentDecline() {
    // Clear any stored consent data
    localStorage.removeItem('consentAgreed');
    localStorage.removeItem('consentDate');

    // Show confirmation dialog
    const confirmed = confirm('Are you sure you do not agree to the consent form? You will be redirected to the home page.');

    if (confirmed) {
        // Redirect to home page
        window.location.href = '../index.html';
    }
}

function showError(message) {
    // Simple alert for now - could be enhanced with toast notifications
    alert('Error: ' + message);
}

// Utility functions
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    return token && user;
}
