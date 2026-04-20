# API Quick Reference Guide

## Base URL
```
Development: http://localhost:5000
Production: https://api.smashandhealmh.com
```

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

## Quick API Reference

### Public Endpoints (No Auth Required)

#### Health Check
```
GET /api/health
```

#### Get All Resources
```
GET /api/resources
GET /api/resources?category=guide&search=anxiety
GET /api/resources/category/{category}
```

#### Get Single Resource
```
GET /api/resources/{resourceId}
```

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```
GET /api/auth/profile
Header: Authorization: Bearer {token}
```

### Booking Endpoints (Auth Required)

#### Create Booking
```
POST /api/bookings
Header: Authorization: Bearer {token}
Body: {
  "sessionType": "individual",
  "bookingDate": "2024-06-15T14:00:00Z",
  "notes": "Optional notes"
}
```

#### Get Booking History
```
GET /api/bookings/history
Header: Authorization: Bearer {token}
```

#### Get Single Booking
```
GET /api/bookings/{bookingId}
Header: Authorization: Bearer {token}
```

#### Update Payment Status
```
PUT /api/bookings/{bookingId}/payment
Header: Authorization: Bearer {token}
Body: {
  "paymentStatus": "completed",
  "receiptNumber": "MP123456789"
}
```

#### Cancel Booking
```
DELETE /api/bookings/{bookingId}
Header: Authorization: Bearer {token}
```

### Resource Endpoints (Admin Only for Create/Edit)

#### Create Resource
```
POST /api/resources
Header: Authorization: Bearer {admin_token}
Body: {
  "title": "Resource Title",
  "description": "Description",
  "category": "guide",
  "fileLink": "https://example.com/file.pdf",
  "tags": ["tag1", "tag2"]
}
```

#### Update Resource
```
PUT /api/resources/{resourceId}
Header: Authorization: Bearer {admin_token}
Body: { ...resource fields to update... }
```

#### Delete Resource
```
DELETE /api/resources/{resourceId}
Header: Authorization: Bearer {admin_token}
```

### Admin Endpoints (Admin Auth Required)

#### Get All Bookings
```
GET /api/admin/bookings/all
GET /api/admin/bookings/all?status=pending&userId={userId}
Header: Authorization: Bearer {admin_token}
```

#### Update Booking Status
```
PUT /api/admin/bookings/{bookingId}/status
Header: Authorization: Bearer {admin_token}
Body: {
  "paymentStatus": "completed"
}
```

#### Get All Users
```
GET /api/admin/users/all
Header: Authorization: Bearer {admin_token}
```

#### Update User Role
```
PUT /api/admin/users/{userId}/role
Header: Authorization: Bearer {admin_token}
Body: {
  "role": "admin"
}
```

#### Delete User
```
DELETE /api/admin/users/{userId}
Header: Authorization: Bearer {admin_token}
```

#### Get Analytics
```
GET /api/admin/analytics/summary
Header: Authorization: Bearer {admin_token}
```

#### Initiate M-PESA Payment
```
POST /api/admin/payments/mpesa
Header: Authorization: Bearer {admin_token}
Body: {
  "bookingId": "{bookingId}",
  "phoneNumber": "254712345678"
}
```

#### Get Privacy Policy
```
GET /api/admin/privacy/policy
Header: Authorization: Bearer {admin_token}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal error |

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ...response data... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Common Tasks

### Get User Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Create a Booking with Token
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sessionType": "individual",
    "bookingDate": "2024-06-15T14:00:00Z"
  }'
```

### Get All Resources
```bash
curl http://localhost:5000/api/resources
```

### Search Resources
```bash
curl "http://localhost:5000/api/resources?search=anxiety&category=guide"
```

### View Admin Analytics
```bash
curl http://localhost:5000/api/admin/analytics/summary \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Session Types
- `individual` - One-on-one session
- `group` - Group counseling session
- `workshop` - Workshop or training session

## Resource Categories
- `guide` - Written guides
- `pdf` - PDF documents
- `video` - Video content
- `article` - Blog articles

## Payment Status
- `pending` - Awaiting payment
- `completed` - Payment confirmed
- `failed` - Payment failed

## User Roles
- `user` - Regular user (default)
- `admin` - Administrator with full access

## Common Query Parameters

### Resources Listing
- `category`: Filter by category (guide/pdf/video/article)
- `search`: Search in title/description/tags

### Bookings Listing (Admin)
- `status`: Filter by payment status
- `userId`: Filter by specific user

## Error Messages

| Message | Cause | Solution |
|---------|-------|----------|
| No token, authorization denied | Missing auth header | Add `Authorization: Bearer {token}` header |
| Token is not valid | Invalid/expired token | Login again to get new token |
| Invalid credentials | Wrong email/password | Verify credentials |
| User already exists | Email in use | Use different email |
| Validation error | Invalid input | Check input format |
| Access denied | Insufficient permissions | Use admin account for admin operations |
| Resource not found | ID doesn't exist | Verify resource ID |

## Workflow Examples

### User Registration & Booking
1. POST /api/auth/register → Get token
2. POST /api/bookings → Create booking
3. GET /api/bookings/history → View bookings
4. PUT /api/bookings/{id}/payment → Update payment

### Admin Resource Management
1. POST /api/auth/login (admin) → Get admin token
2. POST /api/resources → Create resource
3. GET /api/resources → List resources
4. PUT /api/resources/{id} → Update resource
5. DELETE /api/resources/{id} → Delete resource

### Admin Analytics
1. POST /api/auth/login (admin) → Get admin token
2. GET /api/admin/analytics/summary → View analytics
3. GET /api/admin/bookings/all → View all bookings
4. GET /api/admin/users/all → View all users

## Rate Limiting
Not currently implemented, but recommended for production.

## Pagination
Not currently implemented in list endpoints, but can be added via query parameters.

## Sorting
By default, results are sorted by latest first (createdAt -1).

## Filtering
- Resources: By category, search
- Bookings: By status, user
- Users: None (returns all)

## Tips & Best Practices

1. **Token Storage**: Save JWT in localStorage after login
2. **Token Refresh**: Re-login when token expires (7 days default)
3. **Error Handling**: Always check `success` flag in response
4. **Rate Limiting**: Implement client-side request throttling
5. **CORS**: Frontend domain should match backend CORS config
6. **Data Validation**: Validate on client before sending
7. **Security**: Never expose JWT publicly
8. **Mobile**: Consider API versioning for future mobile app

## Testing Tools

### cURL
```bash
curl -X GET http://localhost:5000/api/resources \
  -H "Content-Type: application/json"
```

### Postman
Import API collection and use pre-configured requests

### Insomnia
REST client alternative to Postman

### Thunder Client
VS Code extension for API testing

## Documentation Files

- `README.md` - Complete API documentation
- `API_TESTING.md` - Detailed testing guide
- `FRONTEND_INTEGRATION.md` - Frontend integration examples
- `DEPLOYMENT.md` - Production deployment guide
- `SETUP_INSTRUCTIONS.md` - Project overview

## Need Help?

1. Check API_TESTING.md for examples
2. Review FRONTEND_INTEGRATION.md for code examples
3. Check error responses for specific errors
4. Verify .env configuration
5. Check server logs: `npm run dev`

## Sample cURL Commands

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@test.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "password123"
  }'
```

### Protected Request (Replace TOKEN)
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

---

**Last Updated:** April 2024
**Version:** 1.0.0
