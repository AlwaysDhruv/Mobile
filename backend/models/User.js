import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true, lowercase: true },

  passwordHash: { type: String, required: true },

  role: { type: String, enum: ['seller','buyer','rider'], required: true },

  // NEW: Address for buyer delivery
  address: { type: String, default: "" },

  // NEW: OTP for password reset
  resetOtp: { type: String, default: null },
  resetOtpExpires: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', schema);
