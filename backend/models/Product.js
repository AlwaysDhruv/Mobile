import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },

  // Basic product fields
  name: { type: String, required: true },
  brand: String,
  description: String,
  price: { type: Number, required: true },
  qty: { type: Number, default: 1 },

  // Image array
  images: [{ type: String }],

  // Mobile specifications
  ram: { type: String, default: "" },
  storage: { type: String, default: "" },
  battery: { type: String, default: "" },
  display: { type: String, default: "" },
  processor: { type: String, default: "" },
  camera: { type: String, default: "" },
  os: { type: String, default: "" },
  color: { type: String, default: "" },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', schema);
