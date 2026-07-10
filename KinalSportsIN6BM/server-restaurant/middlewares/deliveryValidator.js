'use strict';

import Restaurant from '../src/fields/restaurant/restaurant.model.js';

/**
 * Validar que el restaurante está abierto
 * Compara hora actual con openingHour y closingHour del restaurante
 */
export const validateRestaurantIsOpen = async (req, res, next) => {
    try {
        const { restaurantId } = req.body;

        if (!restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'ID del restaurante es requerido'
            });
        }

        // Buscar el restaurante
        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        // Validar que el restaurante está activo
        if (!restaurant.isActive) {
            return res.status(400).json({
                success: false,
                message: 'El restaurante no está disponible en este momento'
            });
        }

        // Obtener hora actual
        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');

        // Convertir horas a formato comparable
        const opening = restaurant.openingHour;
        const closing = restaurant.closingHour;

        // Comparar horas (formato HH:mm)
        const isOpen = currentHour >= opening && currentHour <= closing;

        if (!isOpen) {
            return res.status(400).json({
                success: false,
                message: `El restaurante está cerrado. Horario: ${opening} - ${closing}`,
                openingHour: opening,
                closingHour: closing
            });
        }

        // Pasar el restaurante al siguiente middleware/controlador
        req.restaurant = restaurant;
        next();

    } catch (error) {
        console.error('Error en validateRestaurantIsOpen:', error);
        return res.status(500).json({
            success: false,
            message: 'Error validando estado del restaurante',
            error: error.message
        });
    }
};

/**
 * Auto-llenar datos del restaurante para la entrega
 * Obtiene la dirección y datos del restaurante automáticamente
 */
export const autoFillRestaurantData = async (req, res, next) => {
    try {
        const { restaurantId } = req.body;

        if (!restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'ID del restaurante es requerido'
            });
        }

        // Buscar el restaurante
        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        // Auto-llenar datos del restaurante
        // La dirección del restaurante será la ubicación de entrega
        req.body.restaurantData = {
            id: restaurant._id,
            name: restaurant.name,
            address: restaurant.address,
            phone: restaurant.phone,
            email: restaurant.email
        };

        // Si no se proporciona dirección de entrega, usar la del restaurante
        if (!req.body.deliveryAddress) {
            // Parseamos la dirección del restaurante
            const addressParts = restaurant.address.split(',');
            req.body.deliveryAddress = {
                street: addressParts[0] || restaurant.address,
                number: '',
                neighborhood: addressParts[1] || '',
                city: addressParts[2] || '',
                reference: 'Dirección del restaurante'
            };
        }

        // Pasar datos al siguiente middleware/controlador
        req.restaurant = restaurant;
        next();

    } catch (error) {
        console.error('Error en autoFillRestaurantData:', error);
        return res.status(500).json({
            success: false,
            message: 'Error obteniendo datos del restaurante',
            error: error.message
        });
    }
};

/**
 * Validar que se tienen todos los datos necesarios para la entrega
 */
export const validateDeliveryData = async (req, res, next) => {
    try {
        const {
            restaurantId,
            deliveryAddress,
            paymentMethod,
            deliveryFee
        } = req.body;

        // Validaciones requeridas
        if (!restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'ID del restaurante es requerido'
            });
        }

        if (!deliveryAddress) {
            return res.status(400).json({
                success: false,
                message: 'Dirección de entrega es requerida'
            });
        }

        if (!deliveryAddress.street || !deliveryAddress.neighborhood) {
            return res.status(400).json({
                success: false,
                message: 'Calle y barrio son requeridos en la dirección'
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Método de pago es requerido'
            });
        }

        const validPaymentMethods = ['cash', 'card', 'transfer', 'digital_wallet'];
        if (!validPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: `Método de pago inválido. Válidos: ${validPaymentMethods.join(', ')}`
            });
        }

        if (deliveryFee === undefined || deliveryFee === null) {
            return res.status(400).json({
                success: false,
                message: 'Tarifa de entrega es requerida'
            });
        }

        if (deliveryFee < 0) {
            return res.status(400).json({
                success: false,
                message: 'Tarifa de entrega no puede ser negativa'
            });
        }

        next();

    } catch (error) {
        console.error('Error en validateDeliveryData:', error);
        return res.status(500).json({
            success: false,
            message: 'Error validando datos de entrega',
            error: error.message
        });
    }
};
