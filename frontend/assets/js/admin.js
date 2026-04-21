// Admin Dashboard JavaScript
const API_URL = 'http://localhost:5000/api';
let currentBookingId = null;
let allBookings = [];
let allUsers = [];

// Check if user is admin
document.addEventListener('DOMContentLoaded', function () {
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
        window.location.href = '/pages/login.html';
        return;
    }

    // Check if user is admin
    const user = JSON.parse(currentUser);
    if (!user) {
        window.location.href = '/pages/login.html';
        return;
    }

    // FIXED: Removed the || true security bypass
    const isAdmin = user.role === 'admin' ||
        (user.email && user.email.includes('admin'));

    if (!isAdmin) {
        // Redirect to user dashboard if not admin
        window.location.href = '/pages/dashboard-new.html';
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
        } else if (bookingsRes.status === 403 || bookingsRes.status === 401) {
            // Unauthorized - redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = '/pages/login.html';
            return;
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

    const totalBookingsEl = document.getElementById('totalBookings');
    const totalUsersEl = document.getElementById('totalUsers');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const pendingBookingsEl = document.getElementById('pendingBookings');

    if (totalBookingsEl) totalBookingsEl.textContent = totalBookings;
    if (totalUsersEl) totalUsersEl.textContent = totalUsers;
    if (totalRevenueEl) totalRevenueEl.textContent = `KES ${totalRevenue.toLocaleString()}`;
    if (pendingBookingsEl) pendingBookingsEl.textContent = pendingBookings;
}

// Display bookings in table
function displayBookings(bookings) {
    const tbody = document.getElementById('bookingsBody');

    if (!tbody) return;

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
                <td>${escapeHtml(booking.userEmail || 'N/A')}</td>
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

    if (!tbody) return;

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
        const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
        const balance = (user.totalAmount || 0) - (user.amountPaid || 0);

        return `
            <tr>
                <td>${user.id || 'N/A'}</td>
                <td>${escapeHtml(user.fullName || 'N/A')}</td>
                <td>${escapeHtml(user.email || 'N/A')}</td>
                <td>${user.sessionsBooked || 0}</td>
                <td>${user.amountPaid || 0}</td>
                <td>${balance}</td>
                <td>${joinDate}</td>
            </tr>
        `;
    }).join('');
}

// Helper function to escape HTML and prevent XSS attacks
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Filter bookings
function filterBookings() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const statusFilterValue = statusFilter ? statusFilter.value : '';

    const filtered = allBookings.filter(booking => {
        const matchesSearch = !searchTerm ||
            (booking.userEmail || '').toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilterValue || booking.status === statusFilterValue;

        return matchesSearch && matchesStatus;
    });

    displayBookings(filtered);
}

// Filter users
function filterUsers() {
    const userSearch = document.getElementById('userSearch');
    const searchTerm = userSearch ? userSearch.value.toLowerCase() : '';

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

    // Check if modal elements exist before populating
    const sessionTypeEl = document.getElementById('editSessionType');
    const dateEl = document.getElementById('editDate');
    const timeEl = document.getElementById('editTime');
    const statusEl = document.getElementById('editStatus');
    const priceEl = document.getElementById('editPrice');
    const notesEl = document.getElementById('editNotes');

    if (sessionTypeEl && dateEl && timeEl && statusEl && priceEl && notesEl) {
        // Populate modal with booking data
        sessionTypeEl.value = booking.sessionType || 'individual';
        dateEl.value = booking.date || '';
        timeEl.value = booking.time || '';
        statusEl.value = booking.status || 'booked';
        priceEl.value = booking.price || 0;
        notesEl.value = booking.notes || '';

        // Show modal
        const modal = document.getElementById('editModal');
        if (modal) {
            modal.classList.add('active');
        }
    } else {
        console.error('Modal elements not found');
        alert('Error: Could not open edit form');
    }
}

// Save booking changes
async function saveBookingChanges(event) {
    if (event) event.preventDefault();

    // Validate required fields
    const sessionType = document.getElementById('editSessionType')?.value;
    const date = document.getElementById('editDate')?.value;
    const time = document.getElementById('editTime')?.value;
    const price = parseFloat(document.getElementById('editPrice')?.value || 0);

    if (!sessionType || !date || !time) {
        alert('Please fill in all required fields (Session Type, Date, Time)');
        return;
    }

    if (isNaN(price) || price < 0) {
        alert('Please enter a valid price');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const updatedData = {
            sessionType: sessionType,
            date: date,
            time: time,
            status: document.getElementById('editStatus')?.value || 'booked',
            price: price,
            notes: document.getElementById('editNotes')?.value || ''
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
            const error = await response.json();
            alert(`Error updating booking: ${error.message || 'Unknown error'}`);
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
            const error = await response.json();
            alert(`Error deleting booking: ${error.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking. Make sure backend is running.');
    }
}

// Switch between tabs - FIXED: added event parameter
function switchTab(tabName, event) {
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

    // Add active class to clicked nav link (if event exists)
    if (event && event.target) {
        const clickedLink = event.target.closest('a');
        if (clickedLink) {
            clickedLink.classList.add('active');
        }
    }

    // Reload data for bookings tab
    if (tabName === 'bookings') {
        displayBookings(allBookings);
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal && modal) {
        modal.classList.remove('active');
    }
};

// Logout
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/pages/login.html';
}