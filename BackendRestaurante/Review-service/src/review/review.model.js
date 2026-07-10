import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, trim: true },
    userName: { type: String, trim: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, required: true },
    restaurantName: { type: String, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 300 },
    status: {
      type: String,
      enum: ['published', 'hidden', 'flagged'],
      default: 'published',
    },
    response: {
      message: { type: String, trim: true, maxlength: 500 },
      respondedBy: { type: String, trim: true },
      respondedAt: { type: Date },
    },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, restaurant: 1 }, { unique: true });
reviewSchema.index({ restaurant: 1, status: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
