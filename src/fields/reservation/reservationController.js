'use strict';

import Reservation from './reservation.js';
import Table from '../table/table.js';
import mongoose from 'mongoose';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

//respuesta de errores segun el tipo
const handleReservationError = (res, error, defaultMessage) => {
    if (error?.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Datos de reservación inválidos',
            error: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: defaultMessage,
        error: error.message
    });
};

export const createReservation = async (req, res) => {
    try {
        const { table, numberOfPeople, date, notes, customerPhone } = req.body;

        //validar que todos los campos requeridos esten presentes
        if (!table || !numberOfPeople || !date) {
            return res.status(400).json({
                success: false,
                message: 'table, numberOfPeople y date son obligatorios'
            });
        }

        //asegurar que la cantidad de personas no sea decimal
        if (!Number.isInteger(Number(numberOfPeople))) {
            return res.status(400).json({
                success: false,
                message: 'El número de personas debe ser un entero'
            });
        }

        //evitar reservaciones en dias o horas ya pasadas
        const reservationDate = new Date(date);
        if (reservationDate < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'No se puede reservar en una fecha pasada'
            });
        }

        if (!isValidId(table)) {
            return res.status(400).json({
                success: false,
                message: 'ID de mesa inválido'
            });
        }

        //confirmar existencia de la mesa antes de asignar
        const foundTable = await Table.findById(table);
        if (!foundTable) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            });
        }

        //validar que la mesa tenga capacidad
        if (numberOfPeople > foundTable.capacity) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad de personas supera la capacidad de la mesa'
            });
        }

        //verificar que la mesa no este ocupada en esa fecha
        const existingReservation = await Reservation.findOne({
            table,
            date,
            status: { $ne: 'cancelled' }
        });

        if (existingReservation) {
            return res.status(400).json({
                success: false,
                message: 'La mesa ya está reservada en esa fecha'
            });
        }

        const reservation = new Reservation({
            ...req.body,
            user: req.user.id
        });
        await reservation.save();
        foundTable.status = 'occupied';
        await foundTable.save();

        return res.status(201).json({
            success: true,
            message: 'Reservación creada',
            reservation
        });

    } catch (error) {
        return handleReservationError(res, error, 'Error al crear reservación');
    }
};

export const getReservations = async (req, res) => {
    try {
        //obtener todas las reservas con datos de mesa y orden de fehca mas cercana
        const reservations = await Reservation.find()
            .populate('table')
            .sort({ date: 1 });

        return res.status(200).json({
            success: true,
            reservations
        });
    } catch (error) {
        return handleReservationError(res, error, 'Error al listar reservaciones');
    }
};

export const getReservationById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de reservación inválido'
            });
        }

        const reservation = await Reservation.findById(id).populate('table');

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            reservation
        });
    } catch (error) {
        return handleReservationError(res, error, 'Error al buscar reservación');
    }
};

export const updateReservation = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de reservación inválido'
            });
        }

        //actualizar y revisar que los nuevos datos sigan las reglas
        const reservation = await Reservation.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Reservación actualizada',
            reservation
        });
    } catch (error) {
        return handleReservationError(res, error, 'Error al actualizar reservación');
    }
};

export const cancelReservation = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de reservación inválido'
            });
        }

        const reservation = await Reservation.findById(id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }

        reservation.status = 'cancelled';
        await reservation.save();

        // liberar mesa
        const table = await Table.findById(reservation.table);
        if (table) {
            table.status = 'available';
            await table.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Reservación cancelada'
        });

    } catch (error) {
        return handleReservationError(res, error, 'Error al cancelar reservación');
    }
};
export const getReservationsByDate = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro date es obligatorio (formato: YYYY-MM-DD)'
            });
        }

        //definir el inicio y el fin del dia
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        //ver que el string recibido sea una fecha real
        if (isNaN(startOfDay.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Formato de fecha inválido. Use YYYY-MM-DD'
            });
        }

        //buscar reservas dentro del rango de 24 horas
        const reservations = await Reservation.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        }).populate('table');

        return res.status(200).json({
            success: true,
            date,
            total: reservations.length,
            reservations
        });

    } catch (error) {
        return handleReservationError(res, error, 'Error al buscar reservaciones por fecha');
    }
};

export const getMyReservations = async (req, res) => {
    try {

        const reservations = await Reservation.find({
            user: req.user.id
        })
            .populate('table')
            .sort({ date: -1 });

        return res.status(200).json({
            success: true,
            total: reservations.length,
            reservations
        });



    } catch (error) {
        return handleReservationError(res, error, 'Error al obtener historial');
    }
};