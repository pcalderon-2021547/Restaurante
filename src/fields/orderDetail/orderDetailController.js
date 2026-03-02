'use strict';

import OrderDetail from './orderDetail.js';
import Order from '../order/order_model.js';
import Dish from '../dish/dish.js';
import mongoose from 'mongoose';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const recalculateOrderTotal = async (orderId) => {
    const details = await OrderDetail.find({ order: orderId });
    const subtotal = details.reduce((acc, item) => acc + item.subtotal, 0);

    const tax = subtotal * 0.12;
    const total = subtotal + tax;

    await Order.findByIdAndUpdate(orderId, {
        subtotal,
        tax,
        total
    });
};
export const createOrderDetail = async (req, res) => {
    try {
        const { order, dish, quantity } = req.body;

        if (!order || !dish || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos'
            });
        }

        if (!isValidId(order) || !isValidId(dish)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const dishData = await Dish.findById(dish);
        if (!dishData) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado'
            });
        }

        const price = dishData.price;
        const subtotal = price * quantity;

        const detail = new OrderDetail({
            order,
            dish,
            quantity,
            price,
            subtotal
        });

        await detail.save();

        await recalculateOrderTotal(order);

        return res.status(201).json({
            success: true,
            message: 'Detalle creado correctamente',
            detail
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear detalle',
            error: error.message
        });
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
        return res.status(500).json({
            success: false,
            message: 'Error al listar detalles',
            error: error.message
        });
    }
};

export const updateOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const detail = await OrderDetail.findById(id);
        if (!detail) {
            return res.status(404).json({
                success: false,
                message: 'Detalle no encontrado'
            });
        }

        if (quantity && quantity > 0) {
            detail.quantity = quantity;
            detail.subtotal = detail.price * quantity;
        }

        await detail.save();

        await recalculateOrderTotal(detail.order);

        return res.status(200).json({
            success: true,
            message: 'Detalle actualizado correctamente',
            detail
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar detalle',
            error: error.message
        });
    }
};

export const deleteOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
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

        await recalculateOrderTotal(orderId);

        return res.status(200).json({
            success: true,
            message: 'Detalle eliminado correctamente'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar detalle',
            error: error.message
        });
    }
};