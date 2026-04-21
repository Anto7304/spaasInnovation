// config/db.js
const mongoose = require('mongoose');

// In-memory storage for mock mode
const mockData = {
    users: [],
    bookings: [],
    resources: []
};

// Mock database functions
class MockDB {
    constructor() {
        this.users = [];
        this.bookings = [];
        this.resources = [];
        this.nextId = 1;
    }

    async saveUser(userData) {
        const user = {
            _id: this.nextId++,
            ...userData,
            createdAt: new Date(),
            __v: 0
        };
        this.users.push(user);
        return user;
    }

    async findUser(email) {
        return this.users.find(u => u.email === email);
    }

    async findUserById(id) {
        return this.users.find(u => u._id == id);
    }

    getAllUsers() {
        return this.users;
    }
}

const mockDBInstance = new MockDB();

const connectDB = async () => {
    // If using mock database
    if (process.env.USE_MOCK_DB === 'true') {
        console.log('⚠️ Using MOCK database mode');
        console.log('📝 Data will NOT be persisted between restarts');
        
        // Add a default admin user for testing
        if (mockDBInstance.users.length === 0) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            mockDBInstance.users.push({
                _id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin',
                createdAt: new Date(),
                __v: 0
            });
            mockDBInstance.users.push({
                _id: 2,
                name: 'Demo User',
                email: 'user@example.com',
                password: await bcrypt.hash('password123', 10),
                role: 'user',
                createdAt: new Date(),
                __v: 0
            });
            console.log('✅ Mock users created: admin@example.com / admin123, user@example.com / password123');
        }
        
        // Override mongoose model methods to use mock data
        return { mock: true, db: mockDBInstance };
    }
    
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
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