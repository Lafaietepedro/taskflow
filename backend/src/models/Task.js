/* eslint-env node */
const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  done: { type: Boolean, default: false },
}, { _id: true });

const proofPhotoSchema = new mongoose.Schema({
  uri: { type: String, default: '' },
  capturedAt: { type: Date, default: null },
  source: {
    type: String,
    enum: ['camera', 'library'],
    default: 'camera',
  },
  mimeType: { type: String, trim: true, default: 'image/jpeg' },
}, { _id: false });

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, trim: true },
  text: { type: String, trim: true },
  notes: { type: String, trim: true, default: '' },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'done'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  completed: { type: Boolean, default: false },
  serviceDate: { type: Date, default: null },
  customerName: { type: String, trim: true, default: '' },
  customerPhone: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  assignedTechnician: { type: String, trim: true, default: '' },
  checklistItems: { type: [checklistItemSchema], default: [] },
  proofPhoto: { type: proofPhotoSchema, default: null },
}, {
  timestamps: true,
});

taskSchema.pre('validate', function syncLegacyFields(next) {
  const normalizedTitle = (this.title || this.text || '').trim();

  if (!normalizedTitle) {
    this.invalidate('title', 'Titulo obrigatorio.');
    return next();
  }

  this.title = normalizedTitle;
  this.text = normalizedTitle;

  if (!this.status) {
    this.status = this.completed ? 'done' : 'pending';
  }

  if (this.completed && this.status !== 'done') {
    this.status = 'done';
  }

  this.completed = this.status === 'done';
  return next();
});

module.exports = mongoose.model('Task', taskSchema);
