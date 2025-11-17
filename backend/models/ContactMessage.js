import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: 'Contact from site' },
  message: { type: String, required: true },
  recipients: [{ type: String }], // seller emails saved for reference
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ContactMessage', schema);
