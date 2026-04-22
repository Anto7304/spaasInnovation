const Intake = require('../models/Intake');
const User = require('../models/User');

// @desc    Submit intake form
// @route   POST /api/intake
// @access  Private
exports.submitIntake = async (req, res) => {
  try {
    const { name, email, age, yearOfStudy, program } = req.body;
    const userId = req.user.userId;

    // Check if intake already exists for this user
    const existingIntake = await Intake.findOne({ user: userId });
    if (existingIntake) {
      return res.status(400).json({
        success: false,
        message: 'Intake form has already been submitted',
      });
    }

    // Validate required fields
    if (!name || !email || !age || !yearOfStudy || !program) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Create intake record
    const intake = new Intake({
      user: userId,
      name,
      email,
      age: parseInt(age),
      yearOfStudy,
      program,
    });

    await intake.save();

    res.status(201).json({
      success: true,
      message: 'Intake form submitted successfully',
      intake,
    });
  } catch (error) {
    console.error('Submit intake error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get user's intake status
// @route   GET /api/intake/status
// @access  Private
exports.getIntakeStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    const intake = await Intake.findOne({ user: userId });

    res.status(200).json({
      success: true,
      completed: !!intake,
      intake: intake || null,
    });
  } catch (error) {
    console.error('Get intake status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get user's intake data
// @route   GET /api/intake
// @access  Private
exports.getIntake = async (req, res) => {
  try {
    const userId = req.user.userId;

    const intake = await Intake.findOne({ user: userId });

    if (!intake) {
      return res.status(404).json({
        success: false,
        message: 'Intake form not found',
      });
    }

    res.status(200).json({
      success: true,
      intake,
    });
  } catch (error) {
    console.error('Get intake error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update intake form
// @route   PUT /api/intake
// @access  Private
exports.updateIntake = async (req, res) => {
  try {
    const { name, email, age, yearOfStudy, program } = req.body;
    const userId = req.user.userId;

    const intake = await Intake.findOneAndUpdate(
      { user: userId },
      {
        name,
        email,
        age: parseInt(age),
        yearOfStudy,
        program,
      },
      { new: true, runValidators: true }
    );

    if (!intake) {
      return res.status(404).json({
        success: false,
        message: 'Intake form not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Intake form updated successfully',
      intake,
    });
  } catch (error) {
    console.error('Update intake error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
