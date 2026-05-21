import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: String },
    customer: { type: String },
    restaurant: { type: mongoose.Schema.Types.ObjectId },
    table: { type: mongoose.Schema.Types.ObjectId },
    type: {
      type: String,
      enum: ['dine_in', 'delivery', 'takeaway'],
      default: 'dine_in',
    },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'delivered', 'paid', 'cancelled'],
      default: 'pending',
    },
    address: { type: String, trim: true },
    notes: { type: String, trim: true },
    subtotal: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
