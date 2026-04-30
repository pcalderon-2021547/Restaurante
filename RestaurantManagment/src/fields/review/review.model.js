'use strict';
import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({
    user: {
        type: Number, // viene de PostgreSQL
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 300
    }
}, { timestamps: true });

// evitar que un usuario califique 2 veces el mismo restaurante
reviewSchema.index({ user: 1, restaurant: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);