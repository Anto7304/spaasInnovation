# Smash&Heal Backend API Documentation

## Overview
Smash&Heal is a comprehensive mental health awareness platform backend built with Node.js, Express, and MongoDB. It provides secure authentication, booking management, resource sharing, and admin analytics.

## Project Structure
```
backend/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── models/
│   ├── User.js              # User schema (name, email, password, role)
│   ├── Booking.js           # Booking schema (session, payment status)
│   └── Resource.js          # Resource schema (guides, PDFs, videos)
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── bookingController.js # Booking management
│   ├── resourceController.js# Resource CRUD operations
│   └── adminController.js   # Admin operations & analytics
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── bookingRoutes.js     # Booking endpoints
│   ├── resourceRoutes.js    # Resource endpoints
│   └── adminRoutes.js       # Admin endpoints
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── authorize.js         # Role-based authorization
│   └── validation.js        # Input validation
├── .env.example             # Environment variables template
├── package.json             # Project dependencies
└── server.js                # Application entry point
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup Steps

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```bash
cp .env.example .env
```

4. **Configure environment variables in `.env`:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smash_and_heal
PORT=5000
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

5. **Start the server:**
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)

#### Register User
**POST** `/api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login User
**POST** `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Get Profile
**GET** `/api/auth/profile`
- **Header:** `Authorization: Bearer <token>`
- **Response (200):** User object

### Bookings (`/api/bookings`)

#### Create Booking
**POST** `/api/bookings`
- **Header:** `Authorization: Bearer <token>`
```json
{
  "sessionType": "individual",
  "bookingDate": "2024-05-15T10:00:00Z",
  "notes": "First session"
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "_id": "...",
    "user": "...",
    "sessionType": "individual",
    "price": 200,
    "paymentStatus": "pending",
    "bookingDate": "2024-05-15T10:00:00Z"
  }
}
```

#### Get Booking History
**GET** `/api/bookings/history`
- **Header:** `Authorization: Bearer <token>`
- **Response (200):** Array of bookings for the user

#### Get Booking by ID
**GET** `/api/bookings/:bookingId`
- **Header:** `Authorization: Bearer <token>`

#### Update Payment Status
**PUT** `/api/bookings/:bookingId/payment`
- **Header:** `Authorization: Bearer <token>`
```json
{
  "paymentStatus": "completed",
  "receiptNumber": "MP123456789"
}
```

#### Cancel Booking
**DELETE** `/api/bookings/:bookingId`
- **Header:** `Authorization: Bearer <token>`

### Resources (`/api/resources`)

#### Get All Resources
**GET** `/api/resources`
- **Query Parameters:**
  - `category`: filter by category (guide, pdf, video, article)
  - `search`: search by title or description
- **Response (200):** Array of resources

#### Get Resources by Category
**GET** `/api/resources/category/:category`
- **Response (200):** Array of resources in specified category

#### Get Resource by ID
**GET** `/api/resources/:resourceId`
- **Response (200):** Resource object with incremented view count

#### Create Resource (Admin Only)
**POST** `/api/resources`
- **Header:** `Authorization: Bearer <admin_token>`
```json
{
  "title": "Managing Anxiety",
  "description": "A guide to anxiety management techniques",
  "category": "guide",
  "fileLink": "https://example.com/guide.pdf",
  "thumbnail": "https://example.com/thumbnail.jpg",
  "duration": 15,
  "tags": ["anxiety", "mental-health"]
}
```

#### Update Resource (Admin Only)
**PUT** `/api/resources/:resourceId`
- **Header:** `Authorization: Bearer <admin_token>`

#### Delete Resource (Admin Only)
**DELETE** `/api/resources/:resourceId`
- **Header:** `Authorization: Bearer <admin_token>`

### Admin (`/api/admin`)

#### Get All Bookings
**GET** `/api/admin/bookings/all`
- **Header:** `Authorization: Bearer <admin_token>`
- **Query Parameters:**
  - `status`: filter by payment status
  - `userId`: filter by user

#### Update Booking Status
**PUT** `/api/admin/bookings/:bookingId/status`
- **Header:** `Authorization: Bearer <admin_token>`
```json
{
  "paymentStatus": "completed"
}
```

#### Get All Users
**GET** `/api/admin/users/all`
- **Header:** `Authorization: Bearer <admin_token>`

#### Update User Role
**PUT** `/api/admin/users/:userId/role`
- **Header:** `Authorization: Bearer <admin_token>`
```json
{
  "role": "admin"
}
```

#### Delete User
**DELETE** `/api/admin/users/:userId`
- **Header:** `Authorization: Bearer <admin_token>`

#### Get Analytics
**GET** `/api/admin/analytics/summary`
- **Header:** `Authorization: Bearer <admin_token>`
- **Response:** Comprehensive analytics including:
  - Total bookings, users, resources
  - Total revenue from completed payments
  - Bookings by status and type
  - Recent bookings

#### Initiate M-PESA Payment
**POST** `/api/admin/payments/mpesa`
- **Header:** `Authorization: Bearer <admin_token>`
```json
{
  "bookingId": "...",
  "phoneNumber": "254712345678"
}
```

#### M-PESA Callback Handler
**POST** `/api/admin/payments/mpesa/callback`
- Handles payment callbacks from M-PESA

#### Get Privacy Policy
**GET** `/api/admin/privacy/policy`

## Authentication & Security

### JWT Token
- Tokens are issued on successful registration/login
- Include token in Authorization header: `Authorization: Bearer <token>`
- Token expires after 7 days (configurable via JWT_EXPIRE)

### Password Hashing
- Passwords are hashed using bcryptjs with 10 salt rounds
- Passwords are never returned in API responses

### Role-Based Access Control
- **user**: Can create bookings, view own resources
- **admin**: Full access to all operations, analytics, and resource management

## Database Models

### User Model
```
{
  name: String (required, max 50)
  email: String (required, unique)
  password: String (required, hashed, min 6)
  role: String (user/admin, default: user)
  createdAt: Date
  updatedAt: Date
}
```

### Booking Model
```
{
  user: ObjectId (ref: User)
  sessionType: String (individual/group/workshop)
  price: Number (default: 200 KSh)
  paymentStatus: String (pending/completed/failed)
  receiptNumber: String (unique, sparse)
  bookingDate: Date
  notes: String (max 500)
  createdAt: Date
  updatedAt: Date
}
```

### Resource Model
```
{
  title: String (required, max 100)
  description: String (required, max 1000)
  category: String (guide/pdf/video/article)
  fileLink: String (URL)
  thumbnail: String (URL)
  duration: Number (minutes, for videos)
  author: String (default: "Smash&Heal Team")
  tags: [String]
  isPublished: Boolean (default: true)
  views: Number (default: 0)
  createdAt: Date
  updatedAt: Date
}
```

## Payment Integration (M-PESA)

The backend includes placeholder endpoints for M-PESA Daraja API integration. To fully implement:

1. **Get M-PESA Credentials:**
   - Register on M-PESA Developer Portal
   - Get Consumer Key and Secret
   - Configure shortcode and passkey

2. **Update `.env`:**
```
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
```

3. **Implement Full Integration:**
   - Generate OAuth tokens
   - Call M-PESA STK Push API
   - Handle payment callbacks
   - Update booking payment status

## Error Handling

All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP Status Codes:
- `200 OK`: Successful request
- `201 Created`: Resource created
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Input Validation

All inputs are validated using express-validator:
- Email format validation
- Password minimum length (6 characters)
- Name length constraints
- Session type enumeration
- Resource category enumeration

## Privacy & Data Security

- User passwords are hashed and salted
- JWT tokens secure sensitive operations
- Role-based access control protects admin features
- MongoDB connection uses secure credentials
- CORS configured for frontend integration
- Helmet.js adds security headers

## Environment Variables

Required variables in `.env`:
```
MONGODB_URI          # MongoDB connection string
PORT                 # Server port (default: 5000)
JWT_SECRET           # Secret key for JWT signing
JWT_EXPIRE           # Token expiration time (default: 7d)
NODE_ENV             # development/production
MPESA_CONSUMER_KEY   # M-PESA OAuth key (optional)
MPESA_CONSUMER_SECRET# M-PESA OAuth secret (optional)
MPESA_SHORTCODE      # M-PESA business shortcode (optional)
MPESA_PASSKEY        # M-PESA passkey (optional)
```

## Frontend Integration

### Setting Up CORS
The backend is configured with CORS. Update the frontend origin in production:
```javascript
// In server.js
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### API Calls from Frontend
```javascript
// Example: Login
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem('token', data.token);
  // Redirect to dashboard
})
```

## Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure CORS for production domain
- [ ] Set up MongoDB Atlas or secure database
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure proper logging
- [ ] Set up monitoring and alerts

### Deployment Platforms
- **Heroku**: `npm install -g heroku-cli` then `heroku create` and `git push heroku main`
- **Railway**: Connect GitHub repo and deploy
- **Render**: Connect GitHub repo for auto-deployment
- **AWS/DigitalOcean**: Install Node.js and use PM2 for process management

## Troubleshooting

### MongoDB Connection Error
- Verify MONGODB_URI in `.env`
- Check network access in MongoDB Atlas
- Ensure IP is whitelisted

### JWT Token Issues
- Clear localStorage and login again
- Check JWT_SECRET matches between server and config
- Verify token format: `Authorization: Bearer <token>`

### CORS Errors
- Ensure frontend domain is allowed in CORS config
- Check Content-Type header is set to application/json

### Port Already in Use
- Change PORT in `.env`
- Or kill the process: `lsof -i :5000` then `kill -9 <PID>`

## Future Enhancements

- [ ] Email notifications for bookings
- [ ] SMS reminders using Twilio
- [ ] Full M-PESA integration
- [ ] Payment refunds processing
- [ ] Admin dashboard with real-time analytics
- [ ] Therapist/counselor management
- [ ] Session scheduling with calendar
- [ ] User feedback and ratings
- [ ] Video consultation integration
- [ ] Mobile app API versioning

## Support & Contact
For issues or questions, contact the development team at support@smashandhealmh.com

## License
ISC
