'use strict';
import {
    createRestaurantService,
    getRestaurantsService,
    updateRestaurantService,
    deleteRestaurantService
} from './restaurant.service.js';
import { handleError } from '../../../utils/handle-error.js';

export const createRestaurant = async (req, res) => {
    try {
        const restaurant = await createRestaurantService(req.body);
        return res.status(201).json({
            success: true,
            restaurant
        });
    } catch (error) {
        return handleError(res, error, {
            duplicateMessage: 'El restaurante ya existe',
            validationMessage: 'Datos inválidos del restaurante',
            defaultMessage: 'Error al crear restaurante'
        });
    }
};


export const getRestaurants = async (req, res) => {
    try {
        const restaurants = await getRestaurantsService();
        return res.status(200).json({
            success: true,
            restaurants
        });
    } catch (error) {
        return handleError(res, error, 'Error al obtener restaurantes');
    }
};

export const updateRestaurant = async (req, res) => {
    try {
        const restaurant = await updateRestaurantService(req.params.id, req.body);

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
        return handleError(res, error, 'Error al actualizar restaurante');
    }
};

export const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await deleteRestaurantService(req.params.id);

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
        return handleError(res, error, 'Error al eliminar restaurante');
    }
};