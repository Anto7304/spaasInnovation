// Admin Dashboard JavaScript
const API_URL = 'http://localhost:5000/api';
let currentBookingId = null;
let allBookings = [];
let allUsers = [];

// Check if user is admin
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadDashboardData();
    
    // Add event listeners
    document.getElementById('searchInput')?.addEventListener('input', filterBookings);
    document.getElementById('statusFilter')?.addEventListener('change', filterBookings);
    document.getElementById('userSearch')?.addEventListener('input', filterUsers);
});

// Check admin authentication
async function checkAdminAuth() {
    const token = localStorage.getItem('authToken');
    const currentUser = localStorage.getItem('currentUser');

    if (!token) {
        window.location.href = 'http://localhost:8000/pages/login.html';
        return;
    }

    // Check if user is admin
    // For development/testing, allow access if email contains 'admin' or if role is 'admin'
    const user = JSON.parse(currentUser);
    if (!user) {
        window.location.href = 'http://localhost:8000/pages/login.html';
        return;
    }

    // Allow admin access if:
    // 1. User has role: 'admin', OR
    // 2. Email contains 'admin' (for backward compatibility), OR
    // 3. For development: any logged-in user can access (remove this in production)
    const isAdmin = user.role === 'admin' ||
                   (user.email && user.email.includes('admin')) ||
                   true; // TEMPORARY: Allow all users for development

    if (!isAdmin) {
        // Redirect to user dashboard if not admin
        window.location.href = 'http://localhost:8000/pages/dashboard-new.html';
    }
}

// Load all dashboard data
async function loadDashboardData() {
    try {
        const token = localStorage.getItem('authToken');
        
        // Fetch all bookings
        const bookingsRes = await fetch(`${API_URL}/admin/bookings`, {
            headers: { 'Authorization': token }
        });
        if (bookingsRes.ok) {
            allBookings = await bookingsRes.json();
            displayBookings(allBookings);
        }
        
        // Fetch all users
        const usersRes = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': token }
        });
        if (usersRes.ok) {
            allUsers = await usersRes.json();
            displayUsers(allUsers);
        }
        
        // Update dashboard stats
        updateDashboardStats();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Error loading data. Make sure backend is running on port 5000.');
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const totalBookings = allBookings.length;
    const totalUsers = allUsers.length;
    const totalRevenue = allBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const pendingBookings = allBookings.filter(b => b.status === 'booked').length;
    
    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalRevenue').textContent = `KES ${totalRevenue.toLocaleString()}`;
    document.getElementById('pendingBookings').textContent = pendingBookings;
}

// Display bookings in table
function displayBookings(bookings) {
    const tbody = document.getElementById('bookingsBody');
    
    if (bookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No bookings found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = bookings.map(booking => {
        const dateTime = new Date(booking.date);
        const formattedDate = dateTime.toLocaleDateString() + ' ' + booking.time;
        
        return `
            <tr>
                <td>${booking.id || 'N/A'}</td>
                <td>${booking.userEmail || 'N/A'}</td>
                <td>${booking.sessionType || 'N/A'}</td>
                <td>${formattedDate}</td>
                <td>${booking.price || 0}</td>
                <td><span class="status-badge status-${booking.status || 'booked'}">${booking.status || 'Booked'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="editBooking(${booking.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-action btn-cancel" onclick="deleteBooking(${booking.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('usersBody');
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No users found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        const joinDate = new Date(user.createdAt).toLocaleDateString();
        const balance = (user.totalAmount || 0) - (user.amountPaid || 0);
        
        return `
            <tr>
                <td>${user.id || 'N/A'}</td>
                <td>${user.fullName || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${user.sessionsBooked || 0}</td>
                <td>${user.amountPaid || 0}</td>
                <td>${balance}</td>
                <td>${joinDate}</td>
            </tr>
        `;
    }).join('');
}

// Filter bookings
function filterBookings() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filtered = allBookings.filter(booking => {
        const matchesSearch = !searchTerm || 
            (booking.userEmail || '').toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || booking.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    displayBookings(filtered);
}

// Filter users
function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    
    const filtered = allUsers.filter(user => {
        return !searchTerm || 
            (user.email || '').toLowerCase().includes(searchTerm) ||
            (user.fullName || '').toLowerCase().includes(searchTerm);
    });
    
    displayUsers(filtered);
}

// Edit booking
function editBooking(bookingId) {
    currentBookingId = bookingId;
    const booking = allBookings.find(b => b.id === bookingId);
    
    if (!booking) {
        alert('Booking not found');
        return;
    }
    
    // Populate modal with booking data
    document.getElementById('editSessionType').value = booking.sessionType || 'individual';
    document.getElementById('editDate').value = booking.date || '';
    document.getElementById('editTime').value = booking.time || '';
    document.getElementById('editStatus').value = booking.status || 'booked';
    document.getElementById('editPrice').value = booking.price || 0;
    document.getElementById('editNotes').value = booking.notes || '';
    
    // Show modal
    document.getElementById('editModal').classList.add('active');
}

// Save booking changes
async function saveBookingChanges(event) {
    event.preventDefault();
    
    try {
        const token = localStorage.getItem('authToken');
        const updatedData = {
            sessionType: document.getElementById('editSessionType').value,
            date: document.getElementById('editDate').value,
            time: document.getElementById('editTime').value,
            status: document.getElementById('editStatus').value,
            price: parseFloat(document.getElementById('editPrice').value),
            notes: document.getElementById('editNotes').value
        };
        
        const response = await fetch(`${API_URL}/admin/bookings/${currentBookingId}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        if (response.ok) {
            alert('Booking updated successfully');
            closeModal('editModal');
            loadDashboardData();
        } else {
            alert('Error updating booking');
        }
    } catch (error) {
        console.error('Error saving booking:', error);
        alert('Error saving booking. Make sure backend is running.');
    }
}

// Delete booking
async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/admin/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
        
        if (response.ok) {
            alert('Booking deleted successfully');
            loadDashboardData();
        } else {
            alert('Error deleting booking');
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking. Make sure backend is running.');
    }
}

// Switch between tabs
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected tab
    const tabElement = document.getElementById(`${tabName}-tab`);
    if (tabElement) {
        tabElement.style.display = 'block';
    }
    
    // Add active class to clicked nav link
    event.target.closest('a').classList.add('active');
    
    // Reload data for bookings tab
    if (tabName === 'bookings') {
        displayBookings(allBookings);
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        modal.classList.remove('active');
    }
};

// Logout
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = 'http://localhost:8000/pages/login.html';
}
