'use strict';

import Order from './order_model.js';

// manejo centralizado de errores para las operaciones de orden
const handleOrderError = (res, error, defaultMessage) => {
    if (error?.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Datos de orden inválidos',
            error: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: defaultMessage,
        error: error.message
    });
};


export const createOrder = async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();

        return res.status(201).json({
            success: true,
            message: 'Orden creada',
            order
        });

    } catch (error) {
        return handleOrderError(res, error, 'Error al crear orden');
    }
};


export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user')
            .populate('restaurant')
            .populate('table');

        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        return handleOrderError(res, error, 'Error al listar órdenes');
    }
};


export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Orden actualizada',
            order
        });

    } catch (error) {
        return handleOrderError(res, error, 'Error al actualizar orden');
    }
};


export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByIdAndDelete(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Orden eliminada'
        });

    } catch (error) {
        return handleOrderError(res, error, 'Error al eliminar orden');
    }
};
