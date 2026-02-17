'use strict';

import Order from './order.js';

export const createOrder = async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).send({ message: 'Orden creada', order });
    } catch (err) {
        res.status(500).send({ message: 'Error al crear orden', err });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('table')
            .populate('products');
        res.send(orders);
    } catch (err) {
        res.status(500).send({ message: 'Error al listar órdenes', err });
    }
};

export const updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.send({ message: 'Orden actualizada', order });
    } catch (err) {
        res.status(500).send({ message: 'Error al actualizar orden', err });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.send({ message: 'Orden eliminada' });
    } catch (err) {
        res.status(500).send({ message: 'Error al eliminar orden', err });
    }
};
