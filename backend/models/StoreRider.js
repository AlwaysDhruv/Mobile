import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  type: {
    type: String,
    enum: ["pending", "approved", "rejected", "removal_pending"],
    default: "pending"
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('StoreRider', schema);
