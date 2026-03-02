'use strict';
import mongoose from "mongoose";

const menuSchema = mongoose.Schema({

    name: { 
        type: String, 
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },

    dishes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }],

    type: {
        type: String,
        enum: ['DAILY', 'EVENT', 'PROMOTION'],
        default: 'DAILY'
    },

    validFrom: Date,
    validUntil: Date,

    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

menuSchema.index({ name: 1, restaurant: 1 }, { unique: true });

export default mongoose.model('Menu', menuSchema);