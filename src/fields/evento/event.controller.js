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