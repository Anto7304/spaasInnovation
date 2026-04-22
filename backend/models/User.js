const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    consentGiven: {
      type: Boolean,
      default: false,
    },
    consentDate: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Override statics for mock mode
if (global.MOCK_MODE) {
  userSchema.statics.findOne = function(filter) {
    return {
      select: function(fields) {
        const user = global.MOCK_USERS.find(u => u.email === filter.email);
        return Promise.resolve(user);
      },
      then: function(callback) {
        const user = global.MOCK_USERS.find(u => u.email === filter.email);
        return callback(user);
      }
    };
  };

  userSchema.statics.findById = function(id) {
    return Promise.resolve(global.MOCK_USERS.find(u => u._id.toString() === id.toString()));
  };

  userSchema.statics.findByIdAndUpdate = function(id, update, options) {
    return Promise.resolve().then(() => {
      const user = global.MOCK_USERS.find(u => u._id.toString() === id.toString());
      if (!user) return null;
      
      // Update user properties
      Object.assign(user, update);
      return options && options.new ? user : null;
    });
  };
}

module.exports = mongoose.model('User', userSchema);
