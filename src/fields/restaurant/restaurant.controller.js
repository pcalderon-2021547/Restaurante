'use strict';
import Restaurant from './restaurant.model.js';
import mongoose from 'mongoose';

const handleRestaurantError = (res, error, defaultMessage) => {
    if (error?.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'El restaurante ya existe'
        });
    }

    if (error?.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Datos inválidos',
            error: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: defaultMessage,
        error: error.message
    });
};

export const createRestaurant = async (req, res) => {
    try {
        const restaurant = new Restaurant(req.body);
        await restaurant.save();

        return res.status(201).json({
            success: true,
            restaurant
        });
    } catch (error) {
        return handleRestaurantError(res, error, 'Error al crear restaurante');
    }
};

export const getRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ isActive: true });

        return res.status(200).json({
            success: true,
            restaurants
        });
    } catch (error) {
        return handleRestaurantError(res, error, 'Error al obtener restaurantes');
    }
};

export const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const restaurant = await Restaurant.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            restaurant
        });

    } catch (error) {
        return handleRestaurantError(res, error, 'Error al actualizar restaurante');
    }
};

export const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const restaurant = await Restaurant.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Restaurante desactivado'
        });

    } catch (error) {
        return handleRestaurantError(res, error, 'Error al eliminar restaurante');
    }
};