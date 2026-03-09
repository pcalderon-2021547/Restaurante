'use strict';

import Order from './order_model.js';
import User from '../user/user.js'; 
import { sendEmail } from '../../../utils/send-email.js';
import { EmailPDFService } from '../services/EmailPDFService.js';

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

        const existingOrder = await Order.findById(id);
        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }

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

