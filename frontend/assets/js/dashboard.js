// dashboard.js - User Dashboard with Backend API
const API_URL = 'http://localhost:5001/api';

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (!token || !user) {
        window.location.href = '/pages/login.html';
        return false;
    }
    return true;
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Load dashboard data from backend
async function loadDashboardData() {
    const token = localStorage.getItem('authToken');
    const currentUser = getCurrentUser();
    
    if (!token || !currentUser) {
        window.location.href = '/pages/login.html';
        return;
    }
    
    // Update user name
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = currentUser.fullName || 'User';
    }
    
    try {
        // Fetch user's bookings from backend
        const response = await fetch(`${API_URL}/bookings/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.bookings) {
            const bookings = data.bookings;
            
            // Update stats
            const sessionsCount = bookings.length;
            const totalPaid = bookings.filter(b => b.paymentStatus === 'completed').reduce((sum, b) => sum + (b.price || 0), 0);
            
            const sessionsBookedEl = document.getElementById('sessionsBooked');
            const amountPaidEl = document.getElementById('amountPaid');
            
            if (sessionsBookedEl) sessionsBookedEl.textContent = sessionsCount;
            if (amountPaidEl) amountPaidEl.textContent = `KES ${totalPaid}`;
            
            // Display upcoming sessions
            displayUpcomingSessions(bookings);
        } else {
            // No bookings yet
            const container = document.getElementById('upcomingSessions');
            if (container) {
                container.innerHTML = '<p class="empty-state">No sessions booked yet. <a href="/pages/services.html">Book your first session</a></p>';
            }
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        const container = document.getElementById('upcomingSessions');
        if (container) {
            container.innerHTML = '<p class="empty-state">Error loading sessions. Make sure backend is running.</p>';
        }
    }
}

// Display upcoming sessions
function displayUpcomingSessions(bookings) {
    const container = document.getElementById('upcomingSessions');
    if (!container) return;
    
    const upcoming = bookings.filter(b => new Date(b.bookingDate) > new Date()).slice(0, 5);
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p class="empty-state">No upcoming sessions. <a href="/pages/services.html">Book your first session</a></p>';
        return;
    }
    
    container.innerHTML = upcoming.map(booking => `
        <div class="session-item">
            <div class="session-info">
                <h4>${booking.sessionType || 'Session'}</h4>
                <p><i class="fas fa-calendar"></i> ${new Date(booking.bookingDate).toLocaleDateString()} at ${new Date(booking.bookingDate).toLocaleTimeString()}</p>
                <p><i class="fas fa-credit-card"></i> KES ${booking.price || 200}</p>
            </div>
            <span class="session-status ${booking.paymentStatus || 'pending'}">${booking.paymentStatus || 'pending'}</span>
        </div>
    `).join('');
}

// Create a new booking
async function createBooking(sessionType, date, time) {
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionType: sessionType,
                bookingDate: `${date}T${time}:00.000Z`,
                notes: 'Booked from dashboard',
                price: 200
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            return { success: true, booking: data.booking };
        } else {
            return { success: false, message: data.message || 'Booking failed' };
        }
    } catch (error) {
        console.error('Booking error:', error);
        return { success: false, message: 'Network error. Make sure backend is running.' };
    }
}

// Handle booking form submission
async function handleBooking(event) {
    event.preventDefault();
    
    const sessionType = document.getElementById('session-type')?.value;
    const date = document.getElementById('session-date')?.value;
    const time = document.getElementById('session-time')?.value;
    
    if (!sessionType || !date || !time) {
        alert('Please fill all fields');
        return;
    }
    
    const submitBtn = document.querySelector('.btn-book');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
    
    const result = await createBooking(sessionType, date, time);
    
    if (result.success) {
        alert('Session booked successfully!');
        document.getElementById('booking-form').reset();
        await loadDashboardData(); // Refresh the dashboard
    } else {
        alert(result.message || 'Failed to book session');
    }
    
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
}

// Set minimum date to today
function setMinDate() {
    const dateInput = document.getElementById('session-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/index.html';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');
    if (checkAuth()) {
        loadDashboardData();
        setMinDate();
        
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            bookingForm.addEventListener('submit', handleBooking);
        }
    }
});