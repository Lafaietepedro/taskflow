/* eslint-env node */
const mongoose = require('mongoose');

const TRIAL_DAYS = 7;

function getTrialEndDate() {
  return new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, trim: true, default: '' },
  plan: { type: String, enum: ['solo', 'team', 'pro'], default: 'team' },
  subscriptionStatus: {
    type: String,
    enum: ['trialing', 'checkout_requested', 'active', 'past_due', 'canceled'],
    default: 'trialing',
  },
  trialStartedAt: { type: Date, default: Date.now },
  trialEndsAt: { type: Date, default: getTrialEndDate },
  checkoutIntent: {
    requestedPlan: { type: String, enum: ['solo', 'team', 'pro'], default: 'team' },
    contactMethod: { type: String, trim: true, default: 'whatsapp' },
    contactValue: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    requestedAt: { type: Date },
  },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = mongoose.model('User', userSchema);
