import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number
  }],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: [
      'pending',
      'assigned',
      'picked_up',
      'delivered',
      'cancelled',
      'cancel_requested'
    ], 
    default: 'pending' 
  },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Order', schema);
