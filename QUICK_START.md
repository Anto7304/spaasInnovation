# Quick Start Guide - Smash&Heal

Get the Smash&Heal application up and running in 5 minutes!

## ⚡ Quick Setup

### 1. Prerequisites Check
```bash
# Check Node.js
node --version  # Should be v14+
npm --version

# Check MongoDB
mongod --version  # Should be v4.4+
```

### 2. Clone & Install
```bash
git clone <repository-url> && cd smash-and-heal

# Install dependencies for both backend and frontend
npm run install:all
```

### 3. Start MongoDB
```bash
# Quick local MongoDB
mkdir -p /tmp/mongodb
mongod --dbpath /tmp/mongodb --logpath /tmp/mongodb.log --fork

# Verify it's running
lsof -i :27017
```

### 4. Configure Backend
```bash
cd backend

# Copy example env file
cp .env.example .env

# Edit .env (optional, defaults are provided)
# MONGODB_URI=mongodb://localhost:27017/smash_and_heal
# JWT_SECRET=your-secret-key
# PORT=5000

cd ..
```

### 5. Start Backend
```bash
npm run start:backend

# You should see:
# ✓ MongoDB Connected: localhost
# ✓ Smash&Heal API server running on port 5000
```

### 6. Start Frontend (New Terminal)
```bash
npm run start:frontend

# You should see:
# ✓ Frontend running at http://localhost:8000
```

### 7. Test the Application
```bash
# Open in browser
http://localhost:8000

# Or test API
curl http://localhost:5000/api/health
```

---

## 🧪 Testing the Application

### Register New User
1. Go to http://localhost:8000
2. Click "Sign Up"
3. Fill in form and submit
4. Should redirect to dashboard

### Login
1. Click "Login"
2. Use credentials from registration
3. Should show booking dashboard

### Book a Session
1. From dashboard, select session type
2. Pick date and time
3. Click "Book Session"
4. Session appears in history

### Admin Features
1. Register with email containing "admin"
2. Go to http://localhost:8000/pages/admin-dashboard.html
3. View all bookings and users

---

## 📁 Project Structure

```
smash-and-heal/
├── backend/                    # API Server
│   ├── models/                 # MongoDB schemas
│   ├── controllers/            # Business logic
│   ├── routes/                 # API endpoints
│   ├── middleware/             # Auth, validation
│   ├── .env                    # Configuration
│   └── server.js              # Express app
├── frontend/                   # Web App
│   ├── assets/                # CSS & JS
│   ├── pages/                 # HTML pages
│   ├── components/            # Reusable HTML
│   └── index.html            # Home page
└── package.json              # Root config
```

---

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user info

### Bookings
- `POST /api/bookings` - Book session
- `GET /api/bookings/history` - Get user bookings
- `GET /api/bookings/:id` - Get booking details

### Resources
- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get resource

### Admin
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/users` - All users
- `GET /api/admin/analytics/summary` - Stats

---

## 🐛 Troubleshooting

### "Port already in use"
```bash
# Find what's using the port
lsof -i :5000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### "MongoDB connection failed"
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB if not running
mongod --dbpath /tmp/mongodb --fork
```

### "Cannot find module"
```bash
# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install
```

### API returns 401 (Unauthorized)
- Logout and login again
- Check browser console for token
- Verify JWT_SECRET in .env

---

## 🚀 Development Mode

Run backend and frontend together:
```bash
npm run dev
```

Or individually:
```bash
npm run dev:backend    # Runs with nodemon
npm run dev:frontend   # Runs with hot reload
```

---

## 📦 Building for Production

### Build Frontend
```bash
cd frontend
npm run build
# Output ready for static hosting
```

### Build Backend
```bash
cd backend
npm run build  # If applicable
```

---

## 🔐 Security Best Practices

1. **Change JWT_SECRET**
   ```bash
   # Generate strong secret
   openssl rand -base64 32
   # Add to backend/.env
   ```

2. **Use Environment Variables**
   - Never commit .env file
   - Use different values for production

3. **MongoDB Security**
   - Use MongoDB Atlas for production
   - Enable authentication
   - Restrict IP access

4. **HTTPS**
   - Use SSL certificates in production
   - Update API_URL to use https://

---

## 📊 Monitoring

### Check Service Status
```bash
# Backend health
curl http://localhost:5000/api/health

# Check MongoDB
mongosh --eval "db.adminCommand('ping')"

# View processes
lsof -i :5000 -i :8000 -i :27017
```

### View Logs
```bash
# Check MongoDB log
tail -f /tmp/mongodb.log

# Backend console output shows live logs
```

---

## 🛑 Stop Services

```bash
# Kill backend (Ctrl+C in terminal)

# Kill frontend (Ctrl+C in terminal)

# Stop MongoDB
kill $(ps aux | grep 'mongod' | grep -v grep | awk '{print $2}')
```

---

## 📝 Next Steps

1. **Customize branding**
   - Edit `frontend/index.html`
   - Update colors in `frontend/assets/css/styles.css`

2. **Add more resources**
   - Use admin panel to create resources

3. **Configure M-PESA**
   - Get credentials from M-PESA Daraja
   - Add to backend/.env

4. **Deploy to production**
   - See DEPLOYMENT.md for detailed steps

---

## 💡 Tips

- Frontend runs on port 8000
- Backend API on port 5000
- MongoDB on port 27017
- All services can run locally
- No internet required for local development
- Use Chrome DevTools for debugging

---

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Backend README](./backend/README.md)
- [Frontend Guide](./frontend)
- [API Reference](./backend/API_QUICK_REFERENCE.md)

---

## 🤝 Support

Having issues? Check:
1. Terminal output for error messages
2. Browser console (F12) for frontend errors
3. MongoDB connection string in .env
4. Port availability (lsof -i)
5. Node/npm versions
