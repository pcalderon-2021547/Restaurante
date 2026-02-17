'use strict';

import Reservation from './reservation.js';
import Table from '../table/table.js';

export const createReservation = async (req, res) => {
    try {
        const { table, numberOfPeople, date } = req.body;

        // 🔎 Verificar que la mesa exista
        const foundTable = await Table.findById(table);
        if (!foundTable) {
            return res.status(404).send({ message: 'Mesa no encontrada' });
        }

        // 🔥 Validar capacidad
        if (numberOfPeople > foundTable.capacity) {
            return res.status(400).send({
                message: 'La cantidad de personas supera la capacidad de la mesa'
            });
        }

        // ❌ Verificar si ya existe reserva en esa fecha para la misma mesa
        const existingReservation = await Reservation.findOne({
            table,
            date,
            status: { $ne: 'cancelled' }
        });

        if (existingReservation) {
            return res.status(400).send({
                message: 'La mesa ya está reservada en esa fecha'
            });
        }

        const reservation = new Reservation(req.body);
        await reservation.save();

        res.status(201).send({
            message: 'Reservación creada',
            reservation
        });

    } catch (err) {
        res.status(500).send({ message: 'Error al crear reservación', err });
    }
};

export const getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate('table');

        res.send(reservations);
    } catch (err) {
        res.status(500).send({ message: 'Error al listar reservaciones', err });
    }
};

export const getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate('table');

        res.send(reservation);
    } catch (err) {
        res.status(500).send({ message: 'Error al buscar reservación', err });
    }
};

export const updateReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.send({
            message: 'Reservación actualizada',
            reservation
        });
    } catch (err) {
        res.status(500).send({ message: 'Error al actualizar', err });
    }
};

export const deleteReservation = async (req, res) => {
    try {
        await Reservation.findByIdAndDelete(req.params.id);

        res.send({ message: 'Reservación eliminada' });
    } catch (err) {
        res.status(500).send({ message: 'Error al eliminar', err });
    }
};
