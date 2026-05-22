'use strict';

import mongoose from 'mongoose';
import Order from './order_model.js';
import User from '../user/user.js'; 
import OrderDetail from '../orderDetail/orderDetail.js';
import Dish from '../dish/dish.js';
import { sendEmail } from '../../../utils/send-email.js';
import { EmailPDFService } from '../services/EmailPDFService.js';
import { ensureOwnedRestaurant, forceOwnedRestaurantInBody, getRestaurantFilter } from '../../../helpers/ownership.js';

const ORDER_FIELDS = [
    { label: 'ID', key: '_id' },
    { label: 'Usuario ID', key: 'user' },
    { label: 'Restaurante', key: 'restaurant.name' },
    { label: 'Mesa', key: 'table.number' },
    { label: 'Tipo', key: 'type' },
    { label: 'Estado', key: 'status' },
    { label: 'Direccion', key: 'address' },
    { label: 'Subtotal', key: 'subtotal' },
    { label: 'Impuesto', key: 'tax' },
    { label: 'Total', key: 'total' },
    { label: 'Creado en', key: 'createdAt' },
    { label: 'Actualizado en', key: 'updatedAt' },
];

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
        forceOwnedRestaurantInBody(req);
        req.body.user = req.user.id;
        const { items } = req.body;
        const order = new Order(req.body);
        await order.save();

        let details = [];
        if (Array.isArray(items) && items.length > 0) {
            details = [];
            for (const item of items) {
                const { dish, quantity } = item;

                if (!dish || !quantity || quantity <= 0) {
                    return res.status(400).json({ success: false, message: 'Cada item debe incluir dish y quantity válidos' });
                }

                if (!mongoose.Types.ObjectId.isValid(dish)) {
                    return res.status(400).json({ success: false, message: `ID de platillo inválido: ${dish}` });
                }

                const dishData = await Dish.findById(dish);
                if (!dishData) {
                    return res.status(404).json({ success: false, message: `Platillo no encontrado: ${dish}` });
                }

                const price = dishData.price;
                const subtotal = Number((price * quantity).toFixed(2));
                const detail = new OrderDetail({ order: order._id, dish, quantity, price, subtotal });
                await detail.save();
                details.push(detail);
            }

            const totals = calculateOrderTotals(details);
            order.subtotal = totals.subtotal;
            order.tax = totals.tax;
            order.total = totals.total;
            await order.save();
        }

        return res.status(201).json({
            success: true,
            message: 'Orden creada',
            order,
            details
        });

    } catch (error) {
        return handleOrderError(res, error, 'Error al crear orden');
    }
};


export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find(getRestaurantFilter(req))
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

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('restaurant')
            .populate('table');

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        return handleOrderError(res, error, 'Error al listar tus órdenes');
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id).populate('restaurant').populate('table');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Orden no encontrada' });
        }
        if (req.user && req.user.role === 'USER_ROLE' && ((order.user?.toString && order.user.toString()) !== (req.user.id || req.user._id))) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para ver esta orden' });
        }
        const ownership = ensureOwnedRestaurant(req, order.restaurant, 'orden');
        if (!ownership.allowed) {
            return res.status(ownership.status).json({ success: false, message: ownership.message });
        }

        return res.status(200).json({ success: true, order });
    } catch (error) {
        return handleOrderError(res, error, 'Error al obtener la orden');
    }
};

export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const existingOrder = await Order.findById(id);
        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }

        const ownership = ensureOwnedRestaurant(req, existingOrder.restaurant, 'orden');
        if (!ownership.allowed) {
            return res.status(ownership.status).json({ success: false, message: ownership.message });
        }

        delete req.body.restaurant;
        delete req.body.user;

        const order = await Order.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (req.body.status && req.body.status !== existingOrder.status) {

            const user = await User.findByPk(order.user);

            if (user) {
                await sendEmail(
                    user.email,
                    'Actualización de tu orden',
                    `<h2>El estado de tu orden ahora es: ${order.status}</h2>`
                );
            }
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

const calculateOrderTotals = (details) => {
    const subtotal = details.reduce((acc, item) => acc + item.subtotal, 0);
    const tax = Number((subtotal * 0.12).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));
    return { subtotal, tax, total };
};

export const createOrderWithDetails = async (req, res) => {
    try {
        forceOwnedRestaurantInBody(req);
        req.body.user = req.user.id;
        const { restaurant, type, address, table, items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Debe enviar al menos un platillo' });
        }

        const order = new Order({ user: req.body.user, restaurant, type, address, table });
        await order.save();

        const details = [];

        for (const item of items) {
            const { dish, quantity } = item;
            if (!dish || !quantity || quantity <= 0) {
                return res.status(400).json({ success: false, message: 'Cada item debe incluir dish y quantity válidos' });
            }

            const dishData = await Dish.findById(dish);
            if (!dishData) {
                return res.status(404).json({ success: false, message: `Platillo no encontrado: ${dish}` });
            }

            const price = dishData.price;
            const subtotal = Number((price * quantity).toFixed(2));
            const detail = new OrderDetail({ order: order._id, dish, quantity, price, subtotal });
            await detail.save();
            details.push(detail);
        }

        const totals = calculateOrderTotals(details);
        order.subtotal = totals.subtotal;
        order.tax = totals.tax;
        order.total = totals.total;
        await order.save();

        return res.status(201).json({
            success: true,
            message: 'Orden y detalles creados correctamente',
            order,
            details
        });
    } catch (error) {
        return handleOrderError(res, error, 'Error al crear orden con detalles');
    }
};

// ── PDF: TODAS LAS ÓRDENES ────────────────────────────────────────────────────
// GET /order/send-pdf/all/:email
export const sendAllOrdersPDF = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'El correo proporcionado no es válido' });
        }
        const orders = await Order.find().populate('restaurant').populate('table').sort({ createdAt: -1 });
        if (!orders.length) {
            return res.status(404).json({ success: false, message: 'No hay órdenes registradas' });
        }
        const service = new EmailPDFService();
        const result = await service.sendEntityPDF({
            toEmail: email,
            subject: 'Reporte Completo – Órdenes del Restaurante',
            title: 'Listado Completo de Órdenes',
            entityName: 'Orden',
            data: orders,
            fields: ORDER_FIELDS,
            filename: 'ordenes_reporte.pdf'
        });
        return res.status(200).json({
            success: true,
            message: `PDF enviado correctamente a ${result.toEmail}`,
            data: { correoDestino: result.toEmail, archivoEnviado: result.filename, totalRegistros: result.records }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al enviar el PDF', error: error.message });
    }
};

// ── PDF: ÓRDENES POR RESTAURANTE ──────────────────────────────────────────────
// GET /order/send-pdf/restaurant/:restaurantId/:email
export const sendOrdersByRestaurantPDF = async (req, res) => {
    try {
        const { restaurantId, email } = req.params;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'El correo proporcionado no es válido' });
        }
        const orders = await Order.find({ restaurant: restaurantId })
            .populate('restaurant').populate('table').sort({ createdAt: -1 });
        if (!orders.length) {
            return res.status(404).json({ success: false, message: 'No hay órdenes para este restaurante' });
        }
        const service = new EmailPDFService();
        const result = await service.sendEntityPDF({
            toEmail: email,
            subject: 'Reporte de Órdenes por Restaurante',
            title: `Órdenes del Restaurante ID: ${restaurantId}`,
            entityName: 'Orden',
            data: orders,
            fields: ORDER_FIELDS,
            filename: `ordenes_restaurante_${restaurantId}.pdf`
        });
        return res.status(200).json({
            success: true,
            message: `PDF enviado correctamente a ${result.toEmail}`,
            data: { correoDestino: result.toEmail, archivoEnviado: result.filename, restauranteId: restaurantId, totalRegistros: result.records }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al enviar el PDF', error: error.message });
    }
};

// ── PDF: ÓRDENES POR ESTADO ───────────────────────────────────────────────────
// GET /order/send-pdf/status/:status/:email
export const sendOrdersByStatusPDF = async (req, res) => {
    try {
        const { status, email } = req.params;
        const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'paid', 'cancelled'];

        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'El correo proporcionado no es válido' });
        }
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Estado inválido. Valores permitidos: ${validStatuses.join(', ')}` });
        }

        const orders = await Order.find({ status })
            .populate('restaurant').populate('table').sort({ createdAt: -1 });

        if (!orders.length) {
            return res.status(404).json({ success: false, message: `No hay órdenes con estado: ${status}` });
        }

        const service = new EmailPDFService();
        const result = await service.sendEntityPDF({
            toEmail: email,
            subject: `Reporte de Órdenes – Estado: ${status}`,
            title: `Órdenes con Estado: ${status.toUpperCase()}`,
            entityName: 'Orden',
            data: orders,
            fields: ORDER_FIELDS,
            filename: `ordenes_${status}.pdf`
        });
        return res.status(200).json({
            success: true,
            message: `PDF enviado correctamente a ${result.toEmail}`,
            data: { correoDestino: result.toEmail, archivoEnviado: result.filename, estado: status, totalRegistros: result.records }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al enviar el PDF', error: error.message });
    }
};

// ── PDF: UNA ORDEN ESPECÍFICA ─────────────────────────────────────────────────
// GET /order/send-pdf/:id/:email
export const sendOrderByIdPDF = async (req, res) => {
    try {
        const { id, email } = req.params;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'El correo proporcionado no es válido' });
        }
        const order = await Order.findById(id).populate('restaurant').populate('table');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Orden no encontrada' });
        }
        const service = new EmailPDFService();
        const result = await service.sendEntityPDF({
            toEmail: email,
            subject: `Detalle de Orden – ${order._id}`,
            title: `Detalle de la Orden: ${order._id}`,
            entityName: 'Orden',
            data: order,
            fields: ORDER_FIELDS,
            filename: `orden_${order._id}.pdf`
        });
        return res.status(200).json({
            success: true,
            message: `PDF enviado correctamente a ${result.toEmail}`,
            data: { correoDestino: result.toEmail, archivoEnviado: result.filename, ordenId: order._id }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al enviar el PDF', error: error.message });
    }
};

