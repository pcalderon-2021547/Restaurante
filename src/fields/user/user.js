'use strict';

import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre es requerido'],
            trim: true
        },
        surname: {
            type: String,
            required: [true, 'El apellido es requerido'],
            trim: true
        },
        username: {
            type: String,
            required: [true, 'El nombre de usuario es requerido'],
            unique: true,
            lowercase: true,
            trim: true
        },
        email: {
            type: String,
            required: [true, 'El correo electrónico es requerido'],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'La contraseña es requerida'],
            minLength: [8, 'La contraseña debe tener al menos 8 caracteres']
        },
       
        profilePicture: {
            type: String
        },
        phone: {
            type: String,
            required: [true, 'El número de teléfono es requerido'],
            minLength: [8, 'El teléfono debe tener 8 dígitos'],
            maxLength: [8, 'El teléfono debe tener 8 dígitos']
        },
        role: {
            type: String,
            required: [true, 'El rol es requerido'],
            uppercase: true,
            enum: {
                values: ['ADMIN_ROLE', 'WAITER_ROLE', 'CLIENT_ROLE'],
                message: 'El rol {VALUE} no es un rol válido'
            },
            default: 'CLIENT_ROLE'
        },
        status: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

userSchema.index({ status: 1 });

export default mongoose.model('User', userSchema);