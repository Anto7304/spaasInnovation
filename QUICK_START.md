# Quick Start Guide - Smash&Heal System

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Backend Dependencies
```bash
cd "c:\Users\USER\new trial of the site\New folder\smash-and-heal"
npm install
```

### Step 2: Start the Backend Server
```bash
npm start
```
You should see: `Smash&Heal server running on http://localhost:5000`

### Step 3: Open Frontend in Browser
Start a local server or open:
- **Old Files:** `index.html` (landing page)
- **New Files:** 
  - `pages/register-new.html` (Register)
  - `pages/login.html` (Login)
  - `pages/dashboard-new.html` (User Dashboard)

### Step 4: Test the System
1. Go to `pages/register-new.html`
2. **Watch** the password requirements update in real-time:
   - Type 8+ characters → Length requirement checkmark
   - Add uppercase letter → Uppercase requirement checkmark
   - Add lowercase letter → Lowercase requirement checkmark
   - Add number → Number requirement checkmark
   - Add special character → Special character requirement checkmark
3. Fill all fields and click **"Create Account"**
4. You'll be redirected to the dashboard
5. Dashboard shows your stats:
   - Sessions Booked: 0
   - Amount Paid: KES 0
   - Balance Due: KES 0
6. Book a session by selecting type, date, and time

---

## 🔐 Security Features

✅ **Password Hashing:** All passwords are securely hashed using bcryptjs (server-side)
✅ **JWT Authentication:** Secure token-based sessions
✅ **Server-Side Validation:** All inputs verified before storage
✅ **Protected Routes:** Unauthorized users redirected to login

---

## 📊 User Journey

```
1. User lands on Landing Page (index.html)
   ↓
2. Clicks "Login" or "Sign In"
   ↓
3. Either:
   a) Has account → Login (login.html)
   b) No account → Register (register-new.html)
   ↓
4. Registration shows real-time password validation ✓
   ↓
5. After successful registration → Dashboard (dashboard-new.html)
   ↓
6. Dashboard shows:
   - Welcome message
   - Session statistics
   - Booking form
   - Session history
   ↓
7. User can book sessions and track payments
```

---

## 🎨 Key Features

### Real-Time Password Validation
As users type their password, they see live feedback:
```
○ At least 8 characters
○ One uppercase letter (A-Z)
○ One lowercase letter (a-z)
○ One number (0-9)
○ One special character (!@#$%^&*)
```
Turns to:
```
✓ At least 8 characters       (Green checkmark)
✓ One uppercase letter (A-Z)
✓ One lowercase letter (a-z)
✓ One number (0-9)
✓ One special character (!@#$%^&*)
```

### Dashboard Statistics
```
┌─────────────────────────────────────┐
│ Welcome, John Doe!                  │
│ Your mental wellness journey        │
└─────────────────────────────────────┘

┌──────────┐  ┌──────────┐  ┌──────────┐
│ Sessions │  │ Paid     │  │ Balance  │
│ Booked   │  │ Amount   │  │ Due      │
│   0      │  │ KES 0    │  │ KES 0    │
└──────────┘  └──────────┘  └──────────┘
```

### Session Booking
- Select session type (Individual, Group, Intensive)
- Pick date (prevents past dates)
- Pick time
- Click "Book Session"
- Session appears in history immediately
- Stats update automatically

---

## 🔧 Database

The system uses **SQLite** which automatically:
- Creates `smash_heal.db` on first run
- Creates `users` and `sessions` tables
- Manages all data storage

**No additional database setup required!**

---

## 📝 Example Test Case

### Register New User
```
Full Name: John Doe
Email: john@example.com
Password: MyStrongPass123!
```

Watch as you type the password:
- After typing "MyStrongPass123!" all requirements show ✓
- Click "Create Account"
- Redirects to dashboard

### Dashboard
- Shows "Welcome, John Doe!"
- Sessions Booked: 0
- Amount Paid: KES 0
- Balance Due: KES 0

### Book a Session
- Session Type: Individual Session
- Date: Tomorrow (or any future date)
- Time: 2:00 PM
- Click "Book Session"

### Session Created
- Session appears in "Session History"
- Stats update:
  - Sessions Booked: 1
  - Balance Due: KES 200
- Status: "Booked" (green badge)

---

## 🛠️ Troubleshooting

### Backend not starting?
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# If in use, kill the process or change port:
# Edit server.js and change: const PORT = 5000;
```

### Password validation not working?
- Check browser console for errors (F12)
- Ensure `auth.js` is loaded
- Verify password requirements list has all 5 items

### Can't login after registration?
- Verify server is running (`npm start`)
- Check database file exists: `smash_heal.db`
- Verify credentials are correct
- Check browser console for errors

### Dashboard not loading?
- Ensure you're logged in
- Check token in localStorage (F12 → Application → LocalStorage)
- Verify API URL is correct (`http://localhost:5000/api`)

---

## 📱 Environment-Friendly Design

The application uses:
- 🌿 Green color scheme (#4CAF50, #66BB6A)
- 🍃 Light gradient backgrounds
- 📊 Clean, modern interface
- ♻️ Sustainable mental wellness focus

---

## 🎯 Next Steps

After testing:
1. Replace old files with new ones in production
2. Set up HTTPS for production
3. Configure proper environment variables
4. Add email verification
5. Implement payment processing
6. Add admin dashboard
7. Deploy to production server

---

## 📞 Support Files

- `BACKEND_SETUP.md` - Detailed backend configuration
- `IMPLEMENTATION_SUMMARY.md` - Complete feature documentation
- `server.js` - Backend application code
- `assets/js/auth.js` - Frontend authentication logic

---

**Version:** 1.0.0
**Last Updated:** April 19, 2026
**Status:** ✅ Ready for Testing
