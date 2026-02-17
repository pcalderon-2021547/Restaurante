'use strict';

import OrderDetail from './orderDetail.js';
import Dish from '../dish/dish.js';
import Order from '../order/order.js';

export const createOrderDetail = async (req, res) => {
    try {
        const { order, dish, quantity } = req.body;

        const foundDish = await Dish.findById(dish);
        if (!foundDish) {
            return res.status(404).send({ message: 'Plato no existe' });
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

        res.status(201).send({
            message: 'Detalle creado y orden actualizada',
            detail
        });

    } catch (err) {
        res.status(500).send({ message: 'Error', err });
    }
};

export const getOrderDetails = async (req, res) => {
    try {
        const details = await OrderDetail.find()
            .populate('order')
            .populate('dish');

        res.send(details);
    } catch (err) {
        res.status(500).send({ message: 'Error al listar detalles', err });
    }
};

export const updateOrderDetail = async (req, res) => {
    try {
        const detail = await OrderDetail.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.send({
            message: 'Detalle actualizado',
            detail
        });
    } catch (err) {
        res.status(500).send({ message: 'Error al actualizar', err });
    }
};

export const deleteOrderDetail = async (req, res) => {
    try {
        const detail = await OrderDetail.findById(req.params.id);
        if (!detail) {
            return res.status(404).send({ message: 'Detalle no encontrado' });
        }

        const orderId = detail.order;

        await OrderDetail.findByIdAndDelete(req.params.id);

        // 🔥 Recalcular total después de eliminar
        const details = await OrderDetail.find({ order: orderId });
        const total = details.reduce((acc, item) => acc + item.subtotal, 0);

        await Order.findByIdAndUpdate(orderId, { total });

        res.send({ message: 'Detalle eliminado y total actualizado' });

    } catch (err) {
        res.status(500).send({ message: 'Error al eliminar', err });
    }
};
