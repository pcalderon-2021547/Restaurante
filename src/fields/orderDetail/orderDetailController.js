'use strict';

import OrderDetail from './orderDetail.js';
import Dish from '../dish/dish.js';
import Order from '../order/order.js';
import mongoose from 'mongoose';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const handleOrderDetailError = (res, error, defaultMessage) => {
    if (error?.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Datos de detalle de orden inválidos',
            error: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: defaultMessage,
        error: error.message
    });
};

export const createOrderDetail = async (req, res) => {
    try {
        const { order, dish, quantity } = req.body;

        if (!order || !dish || quantity == null) {
            return res.status(400).json({
                success: false,
                message: 'order, dish y quantity son obligatorios'
            });
        }

        if (!isValidId(order) || !isValidId(dish)) {
            return res.status(400).json({
                success: false,
                message: 'ID de orden o platillo inválido'
            });
        }

        if (Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad debe ser mayor a 0'
            });
        }

        const foundOrder = await Order.findById(order);
        if (!foundOrder) {
            return res.status(404).json({
                success: false,
                message: 'Orden no existe'
            });
        }

        const foundDish = await Dish.findById(dish);
        if (!foundDish) {
            return res.status(404).json({
                success: false,
                message: 'Plato no existe'
            });
        }

        const price = foundDish.price;
        const subtotal = price * quantity;

        const detail = new OrderDetail({
            order,
            dish,
            quantity,
            price,
            subtotal
        });

        await detail.save();

        const details = await OrderDetail.find({ order });
        const total = details.reduce((acc, item) => acc + item.subtotal, 0);

        await Order.findByIdAndUpdate(order, { total });

        return res.status(201).json({
            success: true,
            message: 'Detalle creado y orden actualizada',
            detail
        });

    } catch (error) {
        return handleOrderDetailError(res, error, 'Error al crear detalle de orden');
    }
};

export const getOrderDetails = async (req, res) => {
    try {
        const details = await OrderDetail.find()
            .populate('order')
            .populate('dish');

        return res.status(200).json({
            success: true,
            details
        });
    } catch (error) {
        return handleOrderDetailError(res, error, 'Error al listar detalles');
    }
};

export const updateOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de detalle inválido'
            });
        }

        const detail = await OrderDetail.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!detail) {
            return res.status(404).json({
                success: false,
                message: 'Detalle no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Detalle actualizado',
            detail
        });
    } catch (error) {
        return handleOrderDetailError(res, error, 'Error al actualizar detalle');
    }
};

export const deleteOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de detalle inválido'
            });
        }

        const detail = await OrderDetail.findById(id);
        if (!detail) {
            return res.status(404).json({
                success: false,
                message: 'Detalle no encontrado'
            });
        }

        const orderId = detail.order;

        await OrderDetail.findByIdAndDelete(id);

        // 🔥 Recalcular total después de eliminar
        const details = await OrderDetail.find({ order: orderId });
        const total = details.reduce((acc, item) => acc + item.subtotal, 0);

        await Order.findByIdAndUpdate(orderId, { total });

        return res.status(200).json({
            success: true,
            message: 'Detalle eliminado y total actualizado'
        });

    } catch (error) {
        return handleOrderDetailError(res, error, 'Error al eliminar detalle');
    }
};
