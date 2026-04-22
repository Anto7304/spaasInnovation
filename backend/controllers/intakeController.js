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
// @desc    Get all intake forms (Admin only)
// @route   GET /api/intake/admin/all
// @access  Private (Admin)
exports.getAllIntakes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const priority = req.query.priority;
    const search = req.query.search;

    let query = {};

    // Filter by status
    if (status && status !== "all") {
      query.evaluationStatus = status;
    }

    // Filter by priority
    if (priority && priority !== "all") {
      query.priorityLevel = priority;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { program: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;

    const intakes = await Intake.find(query)
      .populate("user", "name email role")
      .populate("evaluatedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Intake.countDocuments(query);

    res.status(200).json({
      success: true,
      data: intakes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      summary: {
        totalIntakes: total,
        pending: await Intake.countDocuments({ evaluationStatus: "pending" }),
        underReview: await Intake.countDocuments({ evaluationStatus: "under_review" }),
        approved: await Intake.countDocuments({ evaluationStatus: "approved" }),
        needsFollowup: await Intake.countDocuments({ evaluationStatus: "needs_followup" }),
        rejected: await Intake.countDocuments({ evaluationStatus: "rejected" })
      }
    });
  } catch (error) {
    console.error("Get all intakes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Evaluate intake form (Admin only)
// @route   PUT /api/intake/admin/:intakeId/evaluate
// @access  Private (Admin)
exports.evaluateIntake = async (req, res) => {
  try {
    const { intakeId } = req.params;
    const { evaluationStatus, priorityLevel, evaluationNotes, recommendations } = req.body;
    const adminId = req.user.userId;

    // Validate required fields
    if (!evaluationStatus) {
      return res.status(400).json({
        success: false,
        message: "Evaluation status is required",
      });
    }

    const intake = await Intake.findByIdAndUpdate(
      intakeId,
      {
        evaluationStatus,
        priorityLevel: priorityLevel || "medium",
        evaluationNotes: evaluationNotes || "",
        recommendations: recommendations || "",
        evaluatedBy: adminId,
        evaluatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate("user", "name email role")
     .populate("evaluatedBy", "name email");

    if (!intake) {
      return res.status(404).json({
        success: false,
        message: "Intake form not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Intake form evaluated successfully",
      intake,
    });
  } catch (error) {
    console.error("Evaluate intake error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get intake statistics (Admin only)
// @route   GET /api/intake/admin/stats
// @access  Private (Admin)
exports.getIntakeStats = async (req, res) => {
  try {
    const stats = await Intake.aggregate([
      {
        $group: {
          _id: "$evaluationStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Intake.aggregate([
      {
        $group: {
          _id: "$priorityLevel",
          count: { $sum: 1 }
        }
      }
    ]);

    const ageStats = await Intake.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ["$age", 20] }, then: "18-20" },
                { case: { $lte: ["$age", 25] }, then: "21-25" },
                { case: { $lte: ["$age", 30] }, then: "26-30" },
                { case: { $gt: ["$age", 30] }, then: "31+" }
              ],
              default: "Unknown"
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const programStats = await Intake.aggregate([
      {
        $group: {
          _id: "$program",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        statusBreakdown: stats,
        priorityBreakdown: priorityStats,
        ageDemographics: ageStats,
        topPrograms: programStats,
        totalIntakes: await Intake.countDocuments(),
        recentEvaluations: await Intake.countDocuments({
          evaluatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
      }
    });
  } catch (error) {
    console.error("Get intake stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
