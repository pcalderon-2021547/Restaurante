'use strict'

import User from './user.js';
import { hash } from 'bcryptjs';

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
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            success: false, 
            message: 'Error al agregar el usuario', 
            error: err.message 
        });
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({ success: true, users });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
    }
}


export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
        
        return res.status(200).json({ success: true, message: 'Usuario actualizado', updatedUser });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error al actualizar' });
    }
}


export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: 'Usuario eliminado' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error al eliminar' });
    }
}