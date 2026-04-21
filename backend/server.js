require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

// Disable SSL verification for development (temporary fix for Atlas)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

// ========================================
// CORS CONFIGURATION
// ========================================
const allowedOrigins = [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            console.log('Origin blocked:', origin);
            callback(null, true); // Allow anyway in development
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200
};

// ========================================
// MIDDLEWARE
// ========================================
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ========================================
// CONNECT TO MONGODB
// ========================================
const startServer = async () => {
    try {
        await connectDB();
        
        // ========================================
        // ROUTES
        // ========================================
        app.use('/api/auth', require('./routes/authRoutes'));
        app.use('/api/bookings', require('./routes/bookingRoutes'));
        app.use('/api/resources', require('./routes/resourceRoutes'));
        app.use('/api/admin', require('./routes/adminRoutes'));

        // ========================================
        // HEALTH CHECK ENDPOINTS
        // ========================================
        app.get('/api/health', (req, res) => {
            res.status(200).json({
                success: true,
                message: 'Smash&Heal API is running',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development'
            });
        });

        // Detailed health check
        app.get('/api/health/detailed', async (req, res) => {
            const mongoose = require('mongoose');
            const healthCheck = {
                success: true,
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development',
                services: {
                    server: 'running',
                    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
                }
            };
            
            if (mongoose.connection.readyState !== 1) {
                healthCheck.success = false;
            }
            
            res.status(healthCheck.success ? 200 : 503).json(healthCheck);
        });

        // Root endpoint
        app.get('/', (req, res) => {
            res.status(200).json({
                success: true,
                message: 'Welcome to Smash&Heal Mental Awareness API',
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                endpoints: {
                    auth: {
                        register: 'POST /api/auth/register',
                        login: 'POST /api/auth/login',
                        profile: 'GET /api/auth/profile'
                    },
                    bookings: {
                        create: 'POST /api/bookings',
                        history: 'GET /api/bookings/history',
                        getById: 'GET /api/bookings/:bookingId',
                        updatePayment: 'PUT /api/bookings/:bookingId/payment',
                        cancel: 'DELETE /api/bookings/:bookingId'
                    },
                    resources: {
                        getAll: 'GET /api/resources',
                        getByCategory: 'GET /api/resources/category/:category',
                        getById: 'GET /api/resources/:resourceId'
                    },
                    admin: {
                        bookings: 'GET /api/admin/bookings/all',
                        users: 'GET /api/admin/users/all',
                        analytics: 'GET /api/admin/analytics/summary'
                    },
                    health: {
                        basic: 'GET /api/health',
                        detailed: 'GET /api/health/detailed'
                    }
                }
            });
        });

        // ========================================
        // 404 HANDLER
        // ========================================
        app.use((req, res) => {
            res.status(404).json({
                success: false,
                message: `Route not found: ${req.method} ${req.url}`,
                availableEndpoints: {
                    auth: '/api/auth',
                    bookings: '/api/bookings',
                    resources: '/api/resources',
                    admin: '/api/admin',
                    health: '/api/health'
                }
            });
        });

        // ========================================
        // GLOBAL ERROR HANDLING MIDDLEWARE
        // ========================================
        app.use((error, req, res, next) => {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                url: req.url,
                method: req.method
            });
            
            // Mongoose validation error
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: Object.values(error.errors).map(e => e.message)
                });
            }
            
            // Mongoose duplicate key error
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'Duplicate field value entered',
                    field: Object.keys(error.keyPattern)[0]
                });
            }
            
            // JWT error
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }
            
            // Default error
            res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Internal server error',
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            });
        });

        // ========================================
        // START SERVER
        // ========================================
        const PORT = process.env.PORT || 5000;
        const server = app.listen(PORT, () => {
            console.log('\n=================================');
            console.log('🚀 Smash&Heal API Server');
            console.log('=================================');
            console.log(`📡 Server running on port: ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API URL: http://localhost:${PORT}`);
            console.log(`❤️ Health check: http://localhost:${PORT}/api/health`);
            console.log('=================================\n');
        });

        // Graceful shutdown
        const gracefulShutdown = () => {
            console.log('Received shutdown signal, closing server...');
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();