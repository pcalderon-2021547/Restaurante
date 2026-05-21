'use strict';

import Order from '../src/fields/order/order_model.js';
import OrderDetail from '../src/fields/orderDetail/orderDetail.js';
import Restaurant from '../src/fields/restaurant/restaurant.model.js';

/**
 * Auto-calcular datos de la entrega basándose en la orden
 * Llena automáticamente: subtotal, tax, total, numero de items, etc.
 */
export const autoCalculateDeliveryData = async (req, res, next) => {
    try {
        const { order, restaurantId } = req.body;

        if (!order) {
            return res.status(400).json({
                success: false,
                message: 'ID de la orden es requerido'
            });
        }

        // Obtener la orden
        const orderData = await Order.findById(order);
        if (!orderData) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }

        // Validar que es una orden de delivery
        if (orderData.type !== 'delivery') {
            return res.status(400).json({
                success: false,
                message: 'Esta orden no es de tipo delivery'
            });
        }

        // Obtener detalles de la orden
        const orderDetails = await OrderDetail.find({ order });
        if (!orderDetails || orderDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay detalles en la orden'
            });
        }

        // Calcular subtotal y contar items
        let subtotal = 0;
        let itemCount = 0;

        orderDetails.forEach(detail => {
            subtotal += detail.subtotal || 0;
            itemCount += detail.quantity || 0;
        });

        // Obtener tax de la orden
        const tax = orderData.tax || 0;

        // Calcular total (sin la tarifa de entrega que la agrega el usuario)
        const deliveryFee = req.body.deliveryFee || 0;
        const total = subtotal + tax + deliveryFee;

        // Agregar datos calculados al request
        req.body.calculatedData = {
            subtotal,
            tax,
            total,
            itemCount,
            orderDetailIds: orderDetails.map(od => od._id)
        };

        // Si se proporciona restaurantId, obtener su información
        if (restaurantId) {
            const restaurant = await Restaurant.findById(restaurantId);
            if (restaurant) {
                req.body.calculatedData.restaurant = {
                    id: restaurant._id,
                    name: restaurant.name,
                    address: restaurant.address
                };
            }
        }

        next();

    } catch (error) {
        console.error('Error en autoCalculateDeliveryData:', error);
        return res.status(500).json({
            success: false,
            message: 'Error calculando datos de la entrega',
            error: error.message
        });
    }
};

/**
 * Validar que el estado de la orden permite crear una entrega
 */
export const validateOrderStatus = async (req, res, next) => {
    try {
        const { order } = req.body;

        if (!order) {
            return next(); // Si no hay orden, dejar pasar
        }

        const orderData = await Order.findById(order);
        if (!orderData) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }

        // Estados permitidos para crear una entrega
        const allowedStatuses = ['pending', 'preparing', 'ready'];

        if (!allowedStatuses.includes(orderData.status)) {
            return res.status(400).json({
                success: false,
                message: `No puedes crear una entrega para una orden en estado ${orderData.status}`,
                currentStatus: orderData.status,
                allowedStatuses
            });
        }

        next();

    } catch (error) {
        console.error('Error en validateOrderStatus:', error);
        return res.status(500).json({
            success: false,
            message: 'Error validando estado de la orden',
            error: error.message
        });
    }
};

/**
 * Validar el usuario de la orden
 */
export const validateOrderUser = async (req, res, next) => {
    try {
        const { order } = req.body;

        if (!order) {
            return next();
        }

        const orderData = await Order.findById(order);
        if (!orderData) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }

        // Pasar información del usuario de la orden
        req.body.userId = orderData.user;
        req.body.restaurantFromOrder = orderData.restaurant;

        next();

    } catch (error) {
        console.error('Error en validateOrderUser:', error);
        return res.status(500).json({
            success: false,
            message: 'Error validando usuario de la orden',
            error: error.message
        });
    }
};
