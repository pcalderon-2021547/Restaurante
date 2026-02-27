'use strict';

import mongoose from "mongoose";

const reservationSchema = mongoose.Schema({
    customerName: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    customerPhone: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
        trim: true
    },
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: [true, 'La mesa es obligatoria']
    },
    date: {
        type: Date,
        required: [true, 'La fecha es obligatoria']
    },
    numberOfPeople: {
        type: Number,
        required: [true, 'Cantidad de personas obligatoria'],
        min: 1
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    notes: String
}, { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);
