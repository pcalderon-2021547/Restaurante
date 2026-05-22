'use strict';
import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    name:     { type: String, required: true },
    stock:    { type: Number, required: true, min: [0, 'El stock no puede ser negativo'] },
    cost:     { type: Number, required: true },
    category: { type: String, required: true },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
