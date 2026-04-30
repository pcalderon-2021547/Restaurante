'use strict';

import mongoose from 'mongoose';

const eventSchema = mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El restaurante es obligatorio']
    },
    name: {
        type: String,
        required: [true, 'El nombre del evento es obligatorio'],
        trim: true,
        maxlength: [100, 'El nombre no puede superar los 100 caracteres']
    },
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true,
        maxlength: [500, 'La descripción no puede superar los 500 caracteres']
    },
    date: {
        type: Date,
        required: [true, 'La fecha es obligatoria']
    },
    status: {
        type: String,
        enum: ['active', 'finished', 'cancelled'],
        default: 'active'
    }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);