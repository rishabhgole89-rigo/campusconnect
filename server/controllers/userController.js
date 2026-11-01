const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/users
// Supports: ?q=text&skill=React&interest=AI&branch=CSE&year=2&page=1&limit=20
exports.getUsers = async (req, res) => {
  try {
    const { q, skill, interest, branch, year, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (q) filter.$text = { $search: q };
    if (skill) filter.skills = { $in: Array.isArray(skill) ? skill : [skill] };
    if (interest) filter.interests = { $in: Array.isArray(interest) ? interest : [interest] };
    if (branch) filter.branch = new RegExp(branch, 'i');
    if (year) filter.year = Number(year);
    if (req.user) filter._id = { $ne: req.user._id }; // exclude self

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-__v').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter)
    ]);

    return sendSuccess(res, {
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    }, 'Users retrieved');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    return sendSuccess(res, { user }, 'User retrieved');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    if (req.params.id !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to update this profile', 403, 'FORBIDDEN');
    }

    const allowed = [
      'name', 'bio', 'branch', 'year', 'skills', 'interests',
      'projects', 'achievements', 'clubs', 'portfolioLinks', 'lookingFor', 'profileImage'
    ];
    const updateData = {};
    allowed.forEach(f => {
      if (req.body[f] !== undefined) updateData[f] = req.body[f];
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!user) return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    return sendSuccess(res, { user }, 'Profile updated');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};
