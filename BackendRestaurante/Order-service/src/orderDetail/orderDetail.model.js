import mongoose from 'mongoose';

const orderDetailSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    dish: { type: mongoose.Schema.Types.ObjectId, required: true },
    dishName: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

orderDetailSchema.pre('validate', function calculateSubtotal(next) {
  if (this.quantity && this.price !== undefined) {
    this.subtotal = Number((this.quantity * this.price).toFixed(2));
  }
  next();
});

export default mongoose.model('OrderDetail', orderDetailSchema);
