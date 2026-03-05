'use strict';

import Event from './event.model.js';
import Restaurant from '../restaurant/restaurant.model.js';
import mongoose from 'mongoose';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const handleEventError = (res, error, defaultMessage) => {
    if (error?.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Datos de evento inválidos',
            error: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: defaultMessage,
        error: error.message
    });
};



//CREAR EVENTO
export const createEvent = async (req, res) => {
    try {
        const { restaurant, name, description, date } = req.body;

        if (!restaurant || !name || !description || !date) {
            return res.status(400).json({
                success: false,
                message: 'restaurant, name, description y date son obligatorios'
            });
        }

        if (!isValidId(restaurant)) {
            return res.status(400).json({
                success: false,
                message: 'ID de restaurante inválido'
            });
        }

        const foundRestaurant = await Restaurant.findById(restaurant);
        if (!foundRestaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        const eventDate = new Date(date);
        if (eventDate < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'No se puede crear un evento en una fecha pasada'
            });
        }

        const event = new Event(req.body);
        await event.save();

        return res.status(201).json({
            success: true,
            message: 'Evento creado correctamente',
            event
        });

    } catch (error) {
        return handleEventError(res, error, 'Error al crear evento');
    }
};



// OBTENER TODOS LOS EVENTOS
export const getEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('restaurant')
            .sort({ date: 1 });

        return res.status(200).json({
            success: true,
            total: events.length,
            events
        });

    } catch (error) {
        return handleEventError(res, error, 'Error al listar eventos');
    }
};



// OBTENER EVENTOS POR RESTAURANTE
export const getEventsByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        if (!isValidId(restaurantId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de restaurante inválido'
            });
        }

        const events = await Event.find({
            restaurant: restaurantId
        })
            .populate('restaurant')
            .sort({ date: 1 });

        return res.status(200).json({
            success: true,
            total: events.length,
            events
        });

    } catch (error) {
        return handleEventError(res, error, 'Error al listar eventos del restaurante');
    }
};



// ACTUALIZAR EVENTO
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de evento inválido'
            });
        }

        const event = await Event.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Evento actualizado correctamente',
            event
        });

    } catch (error) {
        return handleEventError(res, error, 'Error al actualizar evento');
    }
};



// ELIMINAR EVENTO
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de evento inválido'
            });
        }

        const event = await Event.findByIdAndDelete(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Evento eliminado correctamente'
        });

    } catch (error) {
        return handleEventError(res, error, 'Error al eliminar evento');
    }
};

// ── PDF: TODOS LOS EVENTOS ────────────────────────────────────────────────────
// GET /event/send-pdf/all/:email
export const sendAllEventsPDF = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'El correo proporcionado no es válido' });
        }
        const events = await Event.find().populate('restaurant').sort({ date: 1 });
        if (!events.length) {
            return res.status(404).json({ success: false, message: 'No hay eventos registrados' });
        }
        const service = new EmailPDFService();
        const result = await service.sendEntityPDF({
            toEmail: email,
            subject: 'Reporte Completo – Eventos Gastronómicos',
            title: 'Listado Completo de Eventos Gastronómicos',
            entityName: 'Evento',
            data: events,
            fields: EVENT_FIELDS,
            filename: 'eventos_reporte.pdf'
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

// ── PDF: EVENTOS POR RESTAURANTE ──────────────────────────────────────────────
// GET /event/send-pdf/restaurant/:restaurantId/:email
export const sendEventsByRestaurantPDF = async (req, res) => {
    try {
        const { restaurantId, email } = req.params;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'El correo proporcionado no es válido' });
        }
        if (!isValidId(restaurantId)) {
            return res.status(400).json({ success: false, message: 'ID de restaurante inválido' });
        }
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
        }
        const events = await Event.find({ restaurant: restaurantId }).sort({ date: 1 });
        if (!events.length) {
            return res.status(404).json({ success: false, message: 'No hay eventos para este restaurante' });
        }
        const service = new EmailPDFService();
        const result = await service.sendEntityPDF({
            toEmail: email,
            subject: `Eventos del Restaurante – ${restaurant.name}`,
            title: `Eventos del Restaurante: ${restaurant.name}`,
            entityName: 'Evento',
            data: events,
            fields: EVENT_FIELDS,
            filename: `eventos_${restaurant.name.replace(/\s+/g, '_')}.pdf`
        });
        return res.status(200).json({
            success: true,
            message: `PDF enviado correctamente a ${result.toEmail}`,
            data: { correoDestino: result.toEmail, archivoEnviado: result.filename, restaurante: restaurant.name, totalRegistros: result.records }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al enviar el PDF', error: error.message });
    }
};

// ── PDF: UN EVENTO ESPECÍFICO ─────────────────────────────────────────────────
// GET /event/send-pdf/:id/:email
export const sendEventByIdPDF = async (req, res) => {
    try {
        const { id, email } = req.params;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'El correo proporcionado no es válido' });
        }
        if (!isValidId(id)) {
            return res.status(400).json({ success: false, message: 'ID de evento inválido' });
        }
        const event = await Event.findById(id).populate('restaurant');
        if (!event) {
            return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        }
        const service = new EmailPDFService();
        const result = await service.sendEntityPDF({
            toEmail: email,
            subject: `Detalle de Evento – ${event.name}`,
            title: `Detalle del Evento: ${event.name}`,
            entityName: 'Evento',
            data: event,
            fields: EVENT_FIELDS,
            filename: `evento_${event._id}.pdf`
        });
        return res.status(200).json({
            success: true,
            message: `PDF enviado correctamente a ${result.toEmail}`,
            data: { correoDestino: result.toEmail, archivoEnviado: result.filename, eventoEnviado: event.name }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al enviar el PDF', error: error.message });
    }
};

