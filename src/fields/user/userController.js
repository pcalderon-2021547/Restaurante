'use strict'

import User from './user.js';
import { hash } from 'bcryptjs';
import mongoose from 'mongoose';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const handleUserError = (res, error, defaultMessage) => {
    if (error?.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'El usuario ya existe (username o email duplicado)'
        });
    }

    if (error?.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Datos de usuario inválidos',
            error: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: defaultMessage,
        error: error.message
    });
};

export const createUser = async (req, res) => {
    try {
        const data = req.body;

        if (req.file) {
            data.profilePicture = req.file.filename;
        }

        if (data.password) {
            data.password = await hash(data.password, 10);
        }

        const user = new User(data);
        await user.save();

        return res.status(200).json({ 
            success: true, 
            message: 'Usuario agregado exitosamente', 
            user 
        });
    } catch (error) {
        return handleUserError(res, error, 'Error al agregar el usuario');
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({ success: true, users });
    } catch (error) {
        return handleUserError(res, error, 'Error al obtener usuarios');
    }
}


export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }

        if (data.password) {
            data.password = await hash(data.password, 10);
        }
        
        const updatedUser = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        return res.status(200).json({ success: true, message: 'Usuario actualizado', updatedUser });
    } catch (error) {
        return handleUserError(res, error, 'Error al actualizar');
    }
}


export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({ success: true, message: 'Usuario eliminado' });
    } catch (error) {
        return handleUserError(res, error, 'Error al eliminar');
    }
}