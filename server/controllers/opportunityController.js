const Opportunity = require('../models/Opportunity');
const { sendSuccess, sendError } = require('../utils/response');

// POST /api/opportunities
exports.create = async (req, res) => {
  try {
    const opp = await Opportunity.create({
      ...req.body,
      creator: req.user._id,
      currentMembers: [req.user._id]
    });
    const populated = await opp.populate('creator', 'name email branch year profileImage');
    return sendSuccess(res, { opportunity: populated }, 'Opportunity created', 201);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// GET /api/opportunities
exports.getAll = async (req, res) => {
  try {
    const { type, skill, status = 'open', page = 1, limit = 20 } = req.query;
    const filter = { status };
    if (type) filter.type = type;
    if (skill) filter.requiredSkills = { $in: Array.isArray(skill) ? skill : [skill] };

    const skip = (Number(page) - 1) * Number(limit);
    const [opportunities, total] = await Promise.all([
      Opportunity.find(filter)
        .populate('creator', 'name email branch year profileImage')
        .populate('currentMembers', 'name email profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Opportunity.countDocuments(filter)
    ]);

    return sendSuccess(res, {
      opportunities,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    }, 'Opportunities retrieved');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// GET /api/opportunities/:id
exports.getById = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id)
      .populate('creator', 'name email branch year skills profileImage')
      .populate('currentMembers', 'name email branch year skills profileImage')
      .populate('interestedUsers', 'name email branch year skills profileImage');
    if (!opp) return sendError(res, 'Opportunity not found', 404);
    return sendSuccess(res, { opportunity: opp }, 'Opportunity retrieved');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// PUT /api/opportunities/:id
exports.update = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return sendError(res, 'Opportunity not found', 404);
    if (opp.creator.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized', 403);
    }
    const updated = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('creator', 'name email branch year profileImage');
    return sendSuccess(res, { opportunity: updated }, 'Opportunity updated');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// DELETE /api/opportunities/:id
exports.remove = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return sendError(res, 'Opportunity not found', 404);
    if (opp.creator.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized', 403);
    }
    await opp.deleteOne();
    return sendSuccess(res, {}, 'Opportunity deleted');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// POST /api/opportunities/:id/interest
exports.expressInterest = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return sendError(res, 'Opportunity not found', 404);
    const uid = req.user._id.toString();
    if (!opp.interestedUsers.map(u => u.toString()).includes(uid)) {
      opp.interestedUsers.push(req.user._id);
      await opp.save();
    }
    return sendSuccess(res, {}, 'Interest expressed');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};
