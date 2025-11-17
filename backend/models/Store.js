import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  storeName: { type: String, required: true },
  description: { type: String, default: "" },

  phone: { type: String, default: "" },

  address: { type: String, default: "" },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  pincode: { type: String, default: "" },

  facebook: { type: String, default: "" },
  instagram: { type: String, default: "" },
  twitter: { type: String, default: "" },

  isOpen: { type: Boolean, default: true },

  banner: { type: String, default: "" },
  logo: { type: String, default: "" },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Store', schema);
