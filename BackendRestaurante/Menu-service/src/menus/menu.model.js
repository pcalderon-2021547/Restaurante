import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId },
    dishes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dish' }],
    type: {
      type: String,
      enum: ['DAILY', 'EVENT', 'PROMOTION'],
      default: 'DAILY',
    },
    validFrom: { type: Date },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

menuSchema.index({ name: 1, restaurant: 1 }, { unique: true });

export default mongoose.model('Menu', menuSchema);
