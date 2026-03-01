'use strict';

import Reservation from './reservation.js';
import Table from '../table/table.js';
import mongoose from 'mongoose';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

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
        const { table, numberOfPeople, date } = req.body;

        if (!table || !numberOfPeople || !date) {
            return res.status(400).json({
                success: false,
                message: 'table, numberOfPeople y date son obligatorios'
            });
        }

        if (!isValidId(table)) {
            return res.status(400).json({
                success: false,
                message: 'ID de mesa inválido'
            });
        }

        //ver si la mesa existe
        const foundTable = await Table.findById(table);
        if (!foundTable) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            });
        }

        //ver la capacidad
        if (numberOfPeople > foundTable.capacity) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad de personas supera la capacidad de la mesa'
            });
        }

        //ver si ya hay reservacion para esa mesa en esa fecha
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

        const reservation = new Reservation(req.body);
        await reservation.save();

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
        const reservations = await Reservation.find()
            .populate('table');

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

        const reservation = await Reservation.findById(req.params.id)
            .populate('table');

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

export const deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de reservación inválido'
            });
        }

        const reservation = await Reservation.findByIdAndDelete(id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Reservación eliminada'
        });
    } catch (error) {
        return handleReservationError(res, error, 'Error al eliminar reservación');
    }
};
