import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    capacity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance'],
      default: 'available',
    },
    restaurant: { type: mongoose.Schema.Types.ObjectId },
    location: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

tableSchema.index({ number: 1, restaurant: 1 }, { unique: true });

export default mongoose.model('Table', tableSchema);
