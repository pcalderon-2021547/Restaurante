'use strict';
import Reservation from './reservation.js';
import Table from '../table/table.js';
import mongoose from 'mongoose';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createReservationService = async (data, userId) => {

    const { table, numberOfPeople, date } = data;

    if (!table || !numberOfPeople || !date) {
        const error = new Error('table, numberOfPeople y date son obligatorios');
        error.name = 'ValidationError';
        throw error;
    }

    if (!Number.isInteger(Number(numberOfPeople))) {
        const error = new Error('El número de personas debe ser un entero');
        error.name = 'ValidationError';
        throw error;
    }

    const reservationDate = new Date(date);
    if (reservationDate < new Date()) {
        const error = new Error('No se puede reservar en fecha pasada');
        error.name = 'ValidationError';
        throw error;
    }

    if (!isValidId(table)) {
        const error = new Error('ID de mesa inválido');
        error.name = 'ValidationError';
        throw error;
    }

    const foundTable = await Table.findById(table);
    if (!foundTable) {
        return null; 
    }

    if (numberOfPeople > foundTable.capacity) {
        const error = new Error('La cantidad de personas supera la capacidad de la mesa');
        error.name = 'ValidationError';
        throw error;
    }

    const existingReservation = await Reservation.findOne({
        table,
        date,
        status: { $ne: 'cancelled' }
    });

    if (existingReservation) {
        const error = new Error('La mesa ya está reservada en esa fecha');
        error.name = 'ValidationError';
        throw error;
    }

    const reservation = new Reservation({
        ...data,
        user: userId
    });

    await reservation.save();

    foundTable.status = 'occupied';
    await foundTable.save();

    return reservation;
};


export const getReservationsService = async () => {
    return await Reservation.find()
        .populate('table')
        .sort({ date: 1 });
};


export const getReservationByIdService = async (id) => {
    if (!isValidId(id)) return false;
    return await Reservation.findById(id).populate('table');
};


export const updateReservationService = async (id, data) => {
    if (!isValidId(id)) return false;

    return await Reservation.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    );
};


export const cancelReservationService = async (id) => {
    if (!isValidId(id)) return false;

    const reservation = await Reservation.findById(id);
    if (!reservation) return null;

    reservation.status = 'cancelled';
    await reservation.save();

    const table = await Table.findById(reservation.table);
    if (table) {
        table.status = 'available';
        await table.save();
    }

    return reservation;
};


export const getReservationsByDateService = async (date) => {

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    if (isNaN(startOfDay.getTime())) {
        const error = new Error('Formato de fecha inválido. Use YYYY-MM-DD');
        error.name = 'ValidationError';
        throw error;
    }

    return await Reservation.find({
        date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('table');
};


export const getMyReservationsService = async (userId) => {
    return await Reservation.find({ user: userId })
        .populate('table')
        .sort({ date: -1 });
};