// config/db.js
const mongoose = require('mongoose');

// In-memory storage for mock mode
const mockUsers = [];

const connectDB = async () => {
    // If using mock database
    if (process.env.USE_MOCK_DB === 'true') {
        console.log('⚠️ Using MOCK database mode');
        console.log('📝 Data will NOT be persisted between restarts');
        
        // Initialize mock users
        if (mockUsers.length === 0) {
            const bcrypt = require('bcryptjs');
            const admin = await bcrypt.hash('admin123', 10);
            const user = await bcrypt.hash('password123', 10);
            
            mockUsers.push({
                _id: new mongoose.Types.ObjectId(),
                name: 'Admin User',
                email: 'admin@example.com',
                password: admin,
                role: 'admin',
                consentGiven: false,
                consentDate: null,
                createdAt: new Date(),
                __v: 0
            });
            mockUsers.push({
                _id: new mongoose.Types.ObjectId(),
                name: 'Demo User',
                email: 'user@example.com',
                password: user,
                role: 'user',
                consentGiven: false,
                consentDate: null,
                createdAt: new Date(),
                __v: 0
            });
            console.log('✅ Mock users created: admin@example.com / admin123, user@example.com / password123');
        }
        
        // Set up global mock methods
        global.MOCK_MODE = true;
        global.MOCK_USERS = mockUsers;
        
        // Don't try to connect to MongoDB
        return { mock: true, mockUsers };
    }
    
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 5000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        console.log('\n💡 Tips:');
        console.log('   1. Make sure MongoDB is installed and running');
        console.log('   2. Or set USE_MOCK_DB=true to run without MongoDB');
        console.log('   3. Or use MongoDB Atlas (cloud database)\n');
        
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
        
        console.log('⚠️ Continuing with limited functionality...');
        return null;
    }
};

module.exports = connectDB;