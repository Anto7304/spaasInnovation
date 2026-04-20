# Smash&Heal - Backend Setup Guide

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```
   This will install all required packages:
   - express
   - cors
   - bcryptjs
   - jsonwebtoken
   - sqlite3

2. **Start the Server**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`

   For development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Database**
   - SQLite database file (`smash_heal.db`) will be created automatically on first run
   - Tables for users and sessions are automatically initialized

### API Endpoints

#### Authentication
- **POST** `/api/auth/register` - Register new user
  - Body: `{ email, fullName, password }`
  
- **POST** `/api/auth/login` - Login user
  - Body: `{ email, password }`

#### User Dashboard
- **GET** `/api/user/dashboard` - Get user dashboard data (requires token)

- **GET** `/api/user/sessions` - Get user sessions (requires token)

- **POST** `/api/user/book-session` - Book a new session (requires token)
  - Body: `{ sessionType, date, time }`

### Security Features
✓ Password hashing with bcryptjs (10 rounds)
✓ JWT token authentication
✓ Server-side password validation
✓ SQLite database for data persistence
✓ CORS enabled for frontend communication

### Frontend Integration
The frontend uses these environment-friendly features:
- Real-time password requirement validation with visual indicators
- Automatic redirect to dashboard after registration/login
- Session booking and management
- Payment tracking system

### Environment Variables
Optional (.env file):
```
PORT=5000
JWT_SECRET=smash-and-heal-secret-key-2026
```

### Default Configuration
- JWT Token Expiration: 7 days
- Password Hashing Rounds: 10
- Session Price: 200 KES

### Troubleshooting
If the backend doesn't start:
1. Ensure port 5000 is not in use
2. Check that Node.js is properly installed
3. Verify all dependencies are installed (`npm install`)
4. Check console for error messages

### Testing the API
Use Postman or curl to test endpoints:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","fullName":"Test User","password":"TestPass123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

---

**Note:** For production deployment, ensure to:
- Use a more secure JWT secret
- Enable HTTPS
- Use environment variables for sensitive data
- Consider using a more robust database (PostgreSQL, MySQL)
- Implement rate limiting
- Add request validation
