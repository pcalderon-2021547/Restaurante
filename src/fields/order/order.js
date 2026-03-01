'use strict';

import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true
        },

        table: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Table',
            required: false
        },

        type: {
            type: String,
            enum: ['dine_in', 'delivery', 'takeaway'],
            required: true
        },

        status: {
            type: String,
            enum: [
                'pending',
                'preparing',
                'ready',
                'delivered',
                'paid',
                'cancelled'
            ],
            default: 'pending'
        },

        address: {
            type: String
        },

        subtotal: {
            type: Number,
            default: 0
        },

        tax: {
            type: Number,
            default: 0
        },

        total: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Order', orderSchema);