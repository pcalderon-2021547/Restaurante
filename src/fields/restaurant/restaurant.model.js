'use strict';
import mongoose from "mongoose";

const restaurantSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    category: {
        type: String,
        required: true
    },
    averagePrice: {
        type: Number,
        required: true,
        min: 0
    },
    openingHour: {
        type: String,
        required: true
    },
    closingHour: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model('Restaurant', restaurantSchema);