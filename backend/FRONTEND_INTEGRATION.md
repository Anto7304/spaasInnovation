# Frontend-Backend Integration Guide

## Overview
This guide explains how to integrate the Smash&Heal backend API with your HTML5 frontend.

## Backend Base URL
```
Development: http://localhost:5000
Production: https://your-api-domain.com
```

## 1. Authentication Integration

### Store Token
After successful login/registration, store the JWT token:
```javascript
// After login response
const token = response.data.token;
localStorage.setItem('token', token);
localStorage.setItem('userId', response.data.user.id);
localStorage.setItem('userRole', response.data.user.role);
```

### Add Authorization Header
For all protected endpoints, include the token:
```javascript
const token = localStorage.getItem('token');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

### Helper Function
Create a reusable API function:
```javascript
const API_BASE = 'http://localhost:5000';

async function apiCall(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API Error');
  }
  
  return data;
}
```

## 2. Registration Page Integration

### HTML Form
```html
<form id="registerForm">
  <input type="text" id="name" placeholder="Full Name" required>
  <input type="email" id="email" placeholder="Email" required>
  <input type="password" id="password" placeholder="Password" required>
  <button type="submit">Register</button>
</form>
```

### JavaScript Handler
```javascript
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    const response = await apiCall('/api/auth/register', 'POST', {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    });
    
    // Store token and user info
    localStorage.setItem('token', response.token);
    localStorage.setItem('userId', response.user.id);
    localStorage.setItem('userRole', response.user.role);
    
    // Redirect to dashboard
    window.location.href = '/pages/dashboard.html';
  } catch (error) {
    alert('Registration failed: ' + error.message);
  }
});
```

## 3. Login Page Integration

### JavaScript Handler
```javascript
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    const response = await apiCall('/api/auth/login', 'POST', {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    });
    
    // Store token and user info
    localStorage.setItem('token', response.token);
    localStorage.setItem('userId', response.user.id);
    localStorage.setItem('userRole', response.user.role);
    
    // Redirect to dashboard
    window.location.href = '/pages/dashboard.html';
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
});
```

## 4. Booking System Integration

### Create Booking
```javascript
async function createBooking(sessionType, bookingDate, notes) {
  try {
    const response = await apiCall('/api/bookings', 'POST', {
      sessionType,
      bookingDate,
      notes
    });
    
    console.log('Booking created:', response.booking);
    // Show success message and refresh bookings list
    showBookings();
  } catch (error) {
    alert('Error creating booking: ' + error.message);
  }
}
```

### Display Booking History
```javascript
async function showBookings() {
  try {
    const response = await apiCall('/api/bookings/history');
    
    const bookingsList = document.getElementById('bookingsList');
    bookingsList.innerHTML = '';
    
    response.bookings.forEach(booking => {
      const bookingDiv = document.createElement('div');
      bookingDiv.innerHTML = `
        <h3>${booking.sessionType} Session</h3>
        <p>Date: ${new Date(booking.bookingDate).toLocaleDateString()}</p>
        <p>Price: KSh ${booking.price}</p>
        <p>Status: ${booking.paymentStatus}</p>
        <button onclick="payForBooking('${booking._id}')">Pay Now</button>
        <button onclick="cancelBooking('${booking._id}')">Cancel</button>
      `;
      bookingsList.appendChild(bookingDiv);
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
  }
}
```

### Payment Integration
```javascript
async function payForBooking(bookingId) {
  try {
    // Get phone number from user
    const phoneNumber = prompt('Enter M-PESA phone number (254712345678)');
    
    if (!phoneNumber) return;
    
    const token = localStorage.getItem('token');
    const response = await apiCall('/api/admin/payments/mpesa', 'POST', {
      bookingId,
      phoneNumber
    });
    
    alert('M-PESA prompt sent to your phone. Complete payment to confirm.');
    
    // Poll for payment status after 30 seconds
    setTimeout(() => showBookings(), 30000);
  } catch (error) {
    alert('Payment error: ' + error.message);
  }
}
```

### Cancel Booking
```javascript
async function cancelBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  
  try {
    await apiCall(`/api/bookings/${bookingId}`, 'DELETE');
    alert('Booking cancelled successfully');
    showBookings();
  } catch (error) {
    alert('Error cancelling booking: ' + error.message);
  }
}
```

## 5. Resources Page Integration

### Display All Resources
```javascript
async function loadResources(category = null) {
  try {
    let endpoint = '/api/resources';
    if (category) {
      endpoint = `/api/resources/category/${category}`;
    }
    
    const response = await apiCall(endpoint);
    
    const resourcesList = document.getElementById('resourcesList');
    resourcesList.innerHTML = '';
    
    response.resources.forEach(resource => {
      const resourceDiv = document.createElement('div');
      resourceDiv.className = 'resource-card';
      resourceDiv.innerHTML = `
        <h3>${resource.title}</h3>
        <p>${resource.description}</p>
        <p>Category: ${resource.category}</p>
        <p>Views: ${resource.views}</p>
        ${resource.thumbnail ? `<img src="${resource.thumbnail}" alt="thumbnail">` : ''}
        <a href="${resource.fileLink}" target="_blank" class="btn">View Resource</a>
      `;
      resourcesList.appendChild(resourceDiv);
    });
  } catch (error) {
    console.error('Error loading resources:', error);
  }
}

// Load on page init
loadResources();

// Category filter
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const category = e.target.dataset.category;
    loadResources(category);
  });
});
```

## 6. Admin Dashboard Integration

### Load Analytics
```javascript
async function loadAnalytics() {
  try {
    const response = await apiCall('/api/admin/analytics/summary');
    
    document.getElementById('totalBookings').innerText = response.analytics.totalBookings;
    document.getElementById('totalUsers').innerText = response.analytics.totalUsers;
    document.getElementById('totalResources').innerText = response.analytics.totalResources;
    document.getElementById('totalRevenue').innerText = `KSh ${response.analytics.totalRevenue}`;
    
    // Display recent bookings
    displayRecentBookings(response.analytics.recentBookings);
  } catch (error) {
    console.error('Error loading analytics:', error);
  }
}
```

### Manage Bookings (Admin)
```javascript
async function loadAllBookings() {
  try {
    const response = await apiCall('/api/admin/bookings/all');
    
    const bookingsList = document.getElementById('adminBookingsList');
    bookingsList.innerHTML = '';
    
    response.bookings.forEach(booking => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${booking.user.name}</td>
        <td>${booking.sessionType}</td>
        <td>KSh ${booking.price}</td>
        <td>
          <select onchange="updateBookingStatus('${booking._id}', this.value)">
            <option value="pending" ${booking.paymentStatus === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="completed" ${booking.paymentStatus === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="failed" ${booking.paymentStatus === 'failed' ? 'selected' : ''}>Failed</option>
          </select>
        </td>
      `;
      bookingsList.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading bookings:', error);
  }
}

async function updateBookingStatus(bookingId, status) {
  try {
    await apiCall(`/api/admin/bookings/${bookingId}/status`, 'PUT', {
      paymentStatus: status
    });
    alert('Booking status updated');
    loadAllBookings();
  } catch (error) {
    alert('Error updating booking: ' + error.message);
  }
}
```

### Add Resource (Admin)
```javascript
document.getElementById('addResourceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    await apiCall('/api/resources', 'POST', {
      title: document.getElementById('resourceTitle').value,
      description: document.getElementById('resourceDescription').value,
      category: document.getElementById('resourceCategory').value,
      fileLink: document.getElementById('resourceFileLink').value,
      thumbnail: document.getElementById('resourceThumbnail').value,
      tags: document.getElementById('resourceTags').value.split(',').map(t => t.trim())
    });
    
    alert('Resource added successfully');
    document.getElementById('addResourceForm').reset();
    loadResources(); // Refresh list
  } catch (error) {
    alert('Error adding resource: ' + error.message);
  }
});
```

## 7. Logout Integration

```javascript
function logout() {
  // Clear stored data
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  
  // Redirect to login
  window.location.href = '/pages/login.html';
}

// Add logout button to navigation
document.getElementById('logoutBtn').addEventListener('click', logout);
```

## 8. Route Protection

Add this to protect pages that require authentication:

```javascript
// Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/pages/login.html';
  }
}

// Check if user is admin
function checkAdmin() {
  const role = localStorage.getItem('userRole');
  if (role !== 'admin') {
    alert('Admin access required');
    window.location.href = '/pages/dashboard.html';
  }
}

// Call on protected pages
window.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('dashboard')) {
    checkAuth();
  }
  if (window.location.pathname.includes('admin')) {
    checkAuth();
    checkAdmin();
  }
});
```

## 9. Environment Configuration

Create a config file for different environments:

```javascript
// config.js
const ENV = 'development'; // or 'production'

const CONFIG = {
  development: {
    API_BASE: 'http://localhost:5000'
  },
  production: {
    API_BASE: 'https://api.smashandhealmh.com'
  }
};

const API_BASE = CONFIG[ENV].API_BASE;
```

Use in pages:
```html
<script src="/config.js"></script>
<script src="/js/api.js"></script>
```

## 10. Error Handling Best Practices

```javascript
async function apiCall(endpoint, method = 'GET', body = null) {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/pages/login.html';
      throw new Error('Session expired. Please login again.');
    }
    
    if (response.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

## Testing Integration

1. **Start backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Open frontend in browser:**
   ```
   http://localhost:8000 (or your frontend port)
   ```

3. **Test flow:**
   - Register new user
   - Verify token stored in localStorage
   - Create booking
   - Update payment status
   - View resources
   - Test logout

## Deployment

When deploying to production:

1. Update API_BASE URL in config
2. Set CORS origin on backend to production domain
3. Use HTTPS for all API calls
4. Secure sensitive data in environment variables
5. Test all endpoints thoroughly

## Troubleshooting

### CORS Errors
- Check backend CORS configuration
- Verify frontend domain is whitelisted

### 401 Unauthorized
- Check if token is being sent
- Verify token hasn't expired
- Re-login to get new token

### API Calls Return 404
- Verify endpoint paths are correct
- Check server is running
- Verify API_BASE URL is correct

### Token Not Persisting
- Check localStorage is enabled
- Verify token is being set after login
- Check for private/incognito mode restrictions
