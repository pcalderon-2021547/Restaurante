import mongoose from 'mongoose';

const dishSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    restaurant: { type: mongoose.Schema.Types.ObjectId },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId },
        quantity: { type: Number, min: 0 },
      },
    ],
    image: { type: String, trim: true },
    isAvailable: { type: Boolean, default: true },
    ingredients: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export default mongoose.model('Dish', dishSchema);
