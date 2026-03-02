'use strict';
import mongoose from "mongoose";

const menuSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: {
        type: String
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
        enum: ['NORMAL', 'EVENT', 'PROMOTION'],
        default: 'NORMAL'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model('Menu', menuSchema);