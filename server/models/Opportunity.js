const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['hackathon', 'project', 'research', 'internship', 'other'],
    default: 'project'
  },
  requiredSkills: [{ type: String, trim: true }],
  requiredInterests: [{ type: String, trim: true }],
  teamSize: { type: Number, min: 1, max: 20, default: 4 },
  currentMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deadline: { type: Date },
  status: {
    type: String,
    enum: ['open', 'closed', 'filled'],
    default: 'open'
  }
}, {
  timestamps: true,
  toJSON: { versionKey: false }
});

opportunitySchema.index({ requiredSkills: 1 });
opportunitySchema.index({ type: 1 });
opportunitySchema.index({ status: 1 });
opportunitySchema.index({ creator: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
