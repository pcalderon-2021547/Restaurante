'use strict';
import Menu from './menu_model.js';
import mongoose from 'mongoose';

const handleMenuError = (res, error, defaultMessage) => {

    if (error?.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'El menú ya existe'
        });
    }

    if (error?.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Datos de menú inválidos',
            error: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: defaultMessage,
        error: error.message
    });
};

export const createMenu = async (req, res) => {
    try {
        const menu = new Menu(req.body);
        await menu.save();

        return res.status(201).json({
            success: true,
            menu
        });

    } catch (error) {
        return handleMenuError(res, error, 'Error al crear el menú');
    }
};

export const getMenus = async (req, res) => {
    try {

        const menus = await Menu.find()
            .populate('restaurant')
            .populate('dishes');

        return res.status(200).json({
            success: true,
            menus
        });

    } catch (error) {
        return handleMenuError(res, error, 'Error al obtener menús');
    }
};

export const updateMenu = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de menú inválido'
            });
        }

        const menu = await Menu.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!menu) {
            return res.status(404).json({
                success: false,
                message: 'Menú no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            menu
        });

    } catch (error) {
        return handleMenuError(res, error, 'Error al actualizar el menú');
    }
};

export const deleteMenu = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de menú inválido'
            });
        }

        const menu = await Menu.findByIdAndDelete(id);

        if (!menu) {
            return res.status(404).json({
                success: false,
                message: 'Menú no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Menú eliminado'
        });

    } catch (error) {
        return handleMenuError(res, error, 'Error al eliminar el menú');
    }
};