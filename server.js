// Backend server for Smash&Heal
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'smash-and-heal-secret-key-2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize SQLite Database
const db = new sqlite3.Database(path.join(__dirname, 'smash_heal.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            fullName TEXT NOT NULL,
            password TEXT NOT NULL,
            sessionsBooked INTEGER DEFAULT 0,
            amountPaid REAL DEFAULT 0,
            totalAmount REAL DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            lastLogin DATETIME
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            sessionType TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT DEFAULT 'booked',
            price REAL DEFAULT 200,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(userId) REFERENCES users(id)
        )
    `);

    console.log('Database tables initialized');
}

// Helper function to validate password strength
function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const allMet = Object.values(requirements).every(req => req === true);
    return { requirements, allMet };
}

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
    const { email, fullName, password, isAdmin } = req.body;

    // Validate input
    if (!email || !fullName || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate password strength
    const { requirements, allMet } = validatePassword(password);
    if (!allMet) {
        return res.status(400).json({
            error: 'Password does not meet requirements',
            requirements
        });
    }

    try {
        // Check if user already exists
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (user) {
                return res.status(409).json({ error: 'User with this email already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user (add role for admin users)
            const role = isAdmin ? 'admin' : 'user';
            db.run(
                `INSERT INTO users (email, fullName, password) VALUES (?, ?, ?)`,
                [email, fullName, hashedPassword],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Registration failed' });
                    }

                    const userId = this.lastID;
                    const token = jwt.sign(
                        { userId, email, role },
                        JWT_SECRET,
                        { expiresIn: '7d' }
                    );

                    res.status(201).json({
                        success: true,
                        message: 'User registered successfully',
                        token,
                        user: {
                            id: userId,
                            email,
                            fullName,
                            role,
                            sessionsBooked: 0,
                            amountPaid: 0,
                            totalAmount: 0
                        }
                    });
                }
            );
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get(
        'SELECT id, email, fullName, password, sessionsBooked, amountPaid, totalAmount FROM users WHERE email = ?',
        [email],
        async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }

            // Compare passwords
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid password' });
            }

            // Update last login
            db.run('UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

            // Determine role (for now, admin if email contains 'admin' - you can change this logic)
            const role = email.includes('admin') ? 'admin' : 'user';

            const token = jwt.sign(
                { userId: user.id, email: user.email, role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role,
                    sessionsBooked: user.sessionsBooked,
                    amountPaid: user.amountPaid,
                    totalAmount: user.totalAmount
                }
            });
        }
    );
});

// Get user dashboard data (protected route)
app.get('/api/user/dashboard', verifyToken, (req, res) => {
    db.get(
        'SELECT id, email, fullName, sessionsBooked, amountPaid, totalAmount FROM users WHERE id = ?',
        [req.userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                success: true,
                user: {
                    ...user,
                    amountBalance: Math.max(0, user.totalAmount - user.amountPaid)
                }
            });
        }
    );
});

// Get user sessions (protected route)
app.get('/api/user/sessions', verifyToken, (req, res) => {
    db.all(
        'SELECT id, sessionType, date, time, status, price FROM sessions WHERE userId = ? ORDER BY date DESC',
        [req.userId],
        (err, sessions) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json({
                success: true,
                sessions: sessions || []
            });
        }
    );
});

// Book a session (protected route)
app.post('/api/user/book-session', verifyToken, (req, res) => {
    const { sessionType, date, time } = req.body;

    if (!sessionType || !date || !time) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.run(
        `INSERT INTO sessions (userId, sessionType, date, time) VALUES (?, ?, ?, ?)`,
        [req.userId, sessionType, date, time],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to book session' });
            }

            // Update user statistics
            db.run(
                `UPDATE users SET sessionsBooked = sessionsBooked + 1, totalAmount = totalAmount + 200 WHERE id = ?`,
                [req.userId],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to update user stats' });
                    }

                    res.status(201).json({
                        success: true,
                        message: 'Session booked successfully',
                        sessionId: this.lastID
                    });
                }
            );
        }
    );
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.userId = decoded.userId;
        next();
    });
}

// ====== ADMIN ENDPOINTS ======

// Get all bookings (admin only)
app.get('/api/admin/bookings', verifyToken, (req, res) => {
    db.all(
        `SELECT s.id, s.userId, s.sessionType, s.date, s.time, s.status, s.price, s.createdAt, u.email as userEmail, u.fullName 
         FROM sessions s 
         LEFT JOIN users u ON s.userId = u.id 
         ORDER BY s.date DESC`,
        (err, bookings) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json(bookings || []);
        }
    );
});

// Get all users (admin only)
app.get('/api/admin/users', verifyToken, (req, res) => {
    db.all(
        'SELECT id, email, fullName, sessionsBooked, amountPaid, totalAmount, createdAt FROM users ORDER BY createdAt DESC',
        (err, users) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json(users || []);
        }
    );
});

// Update booking (admin only)
app.put('/api/admin/bookings/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { sessionType, date, time, status, price, notes } = req.body;

    db.run(
        `UPDATE sessions SET sessionType = ?, date = ?, time = ?, status = ?, price = ? 
         WHERE id = ?`,
        [sessionType, date, time, status, price || 200, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update booking' });
            }

            res.json({
                success: true,
                message: 'Booking updated successfully'
            });
        }
    );
});

// Delete booking (admin only)
app.delete('/api/admin/bookings/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    db.run(
        'DELETE FROM sessions WHERE id = ?',
        [id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete booking' });
            }

            res.json({
                success: true,
                message: 'Booking deleted successfully'
            });
        }
    );
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Smash&Heal server running on http://localhost:${PORT}`);
});
