'use strict';
import Menu from './menu_model.js';
import Restaurant from '../restaurant/restaurant.model.js';
import mongoose from 'mongoose';

const handleMenuError = (res, error, defaultMessage) => {

    if (error?.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Ya existe un menú con ese nombre en este restaurante'
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

        const { restaurant, type, validFrom, validUntil } = req.body;

        // Validar ID restaurante
        if (!mongoose.Types.ObjectId.isValid(restaurant)) {
            return res.status(400).json({
                success: false,
                message: 'ID de restaurante inválido'
            });
        }

        // Verificar que restaurante exista
        const existingRestaurant = await Restaurant.findById(restaurant);

        if (!existingRestaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        // Validación especial para EVENT
        if (type === 'EVENT') {
            if (!validFrom || !validUntil) {
                return res.status(400).json({
                    success: false,
                    message: 'Un menú tipo EVENT debe tener fechas válidas'
                });
            }

            if (new Date(validFrom) >= new Date(validUntil)) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de inicio debe ser menor que la de finalización'
                });
            }
        }

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

        const menus = await Menu.find({ isActive: true })
            .populate('restaurant')
            .populate({
                path: 'dishes',
                match: { isAvailable: true }
            });

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

        delete req.body.restaurant; // No permitir cambiar restaurante

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