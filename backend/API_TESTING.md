# Smash&Heal Backend API Testing Guide

## Quick Start Testing

### 1. Health Check
```
GET http://localhost:5000/api/health
```

### 2. Register a New User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### 3. Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```
**Save the token from response for subsequent requests**

### 4. Get Profile
```
GET http://localhost:5000/api/auth/profile
Authorization: Bearer <your_token_here>
```

### 5. Create a Booking
```
POST http://localhost:5000/api/bookings
Authorization: Bearer <your_token_here>
Content-Type: application/json

{
  "sessionType": "individual",
  "bookingDate": "2024-06-15T14:00:00Z",
  "notes": "First counseling session"
}
```

### 6. Get Booking History
```
GET http://localhost:5000/api/bookings/history
Authorization: Bearer <your_token_here>
```

### 7. Update Payment Status
```
PUT http://localhost:5000/api/bookings/<booking_id>/payment
Authorization: Bearer <your_token_here>
Content-Type: application/json

{
  "paymentStatus": "completed",
  "receiptNumber": "MP123456789"
}
```

### 8. Get All Resources
```
GET http://localhost:5000/api/resources
```

### 9. Get Resources by Category
```
GET http://localhost:5000/api/resources/category/guide
```

### 10. Get Single Resource
```
GET http://localhost:5000/api/resources/<resource_id>
```

## Admin Testing

### 1. Create Admin User (Manual DB Update)
Update user role to "admin" in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### 2. Get All Bookings (Admin Only)
```
GET http://localhost:5000/api/admin/bookings/all
Authorization: Bearer <admin_token_here>
```

### 3. Get Analytics
```
GET http://localhost:5000/api/admin/analytics/summary
Authorization: Bearer <admin_token_here>
```

### 4. Get All Users (Admin Only)
```
GET http://localhost:5000/api/admin/users/all
Authorization: Bearer <admin_token_here>
```

### 5. Create Resource (Admin Only)
```
POST http://localhost:5000/api/resources
Authorization: Bearer <admin_token_here>
Content-Type: application/json

{
  "title": "Stress Management Guide",
  "description": "Learn effective stress management techniques",
  "category": "guide",
  "fileLink": "https://example.com/stress-guide.pdf",
  "thumbnail": "https://example.com/thumb.jpg",
  "duration": 20,
  "tags": ["stress", "management", "wellness"]
}
```

### 6. Get Privacy Policy
```
GET http://localhost:5000/api/admin/privacy/policy
Authorization: Bearer <admin_token_here>
```

## Using Postman

1. **Import Collection:**
   - Download the Postman collection JSON
   - Open Postman → Import → Select file

2. **Set Environment Variables:**
   - Create new environment
   - Add variable `token` and set after login
   - Add variable `base_url` = `http://localhost:5000`

3. **Pre-request Script for Token:**
   ```javascript
   // Add to login request to auto-save token
   var jsonData = pm.response.json();
   pm.environment.set("token", jsonData.token);
   ```

## Common Test Scenarios

### User Registration & Login Flow
1. Register new user (GET token)
2. Login with credentials (VERIFY token)
3. Get profile (VERIFY token works)

### Booking Workflow
1. Login
2. Create booking
3. View booking history
4. Update payment status
5. Cancel booking

### Resource Management (Admin)
1. Login with admin credentials
2. Create resource
3. Get all resources
4. Update resource
5. Delete resource

### Analytics Monitoring (Admin)
1. Login with admin credentials
2. Get analytics summary
3. View all users
4. View all bookings

## Error Testing

### 401 Unauthorized
```
GET http://localhost:5000/api/auth/profile
# Without token - should return 401
```

### 403 Forbidden
```
POST http://localhost:5000/api/resources
Authorization: Bearer <user_token>
# Regular user trying admin operation - should return 403
```

### 400 Bad Request
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test",
  "email": "invalid-email",
  "password": "123" # Too short
}
```

### 404 Not Found
```
GET http://localhost:5000/api/bookings/invalid-id
Authorization: Bearer <token>
```

## Database Inspection

### View Users
```javascript
db.users.find({}).pretty()
```

### View Bookings
```javascript
db.bookings.find({}).pretty()
```

### View Resources
```javascript
db.resources.find({}).pretty()
```

### Clear Test Data
```javascript
db.users.deleteMany({})
db.bookings.deleteMany({})
db.resources.deleteMany({})
```

## Performance Testing

### Load Testing with Apache Bench
```bash
ab -n 100 -c 10 http://localhost:5000/api/health
```

### Load Testing with Wrk
```bash
wrk -t12 -c400 -d30s http://localhost:5000/api/health
```

## Notes
- Replace `<your_token_here>` with actual JWT token from login
- Replace `<booking_id>` and `<resource_id>` with actual IDs
- All endpoints return JSON responses
- Timestamps are in ISO 8601 format
- Prices are in KSh (Kenya Shilling)
