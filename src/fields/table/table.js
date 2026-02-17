'use strict';

import mongoose from "mongoose";

const tableSchema = mongoose.Schema({
    number: {
        type: Number,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'occupied'],
        default: 'available'
    }
}, { timestamps: true });

export default mongoose.model('Table', tableSchema);
