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
        trim: true,
        maxlength: [8, 'El teléfono no puede superar los 8 caracteres'],
        match: [/^\d{8}$/, 'El teléfono solo debe contener 8 dígitos numéricos']
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
    notes: {
        type: String,
        trim: true,
        maxlength: [300, 'Las notas no pueden superar los 300 caracteres']
    }
}, { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);
