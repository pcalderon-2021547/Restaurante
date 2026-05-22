'use strict';
import Reservation from './reservation.js';
import User from '../user/user.js';
import Table from '../table/table.js';
import Restaurant from '../restaurant/restaurant.model.js'; // necesario para que Mongoose registre el modelo y el populate funcione
import mongoose from 'mongoose';
import { sendEmail } from '../../../utils/send-email.js';

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

    const foundTable = await Table.findById(table).populate('restaurant');
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

    // Tomamos el restaurante directamente de la mesa para garantizar consistencia
    const restaurantId = foundTable.restaurant?._id ?? foundTable.restaurant;

    const reservation = new Reservation({
        ...data,
        user: userId,
        restaurant: restaurantId,   // ← se guarda automáticamente desde la mesa
    });

    await reservation.save();

    foundTable.status = 'occupied';
    await foundTable.save();

    return reservation;
};


// ADMIN_ROLE: trae TODAS las reservaciones
export const getReservationsService = async () => {
    return await Reservation.find()
        .populate({ path: 'table', populate: { path: 'restaurant' } })
        .populate('restaurant')
        .sort({ date: 1 });
};


// ADMIN_RESTAURANT_ROLE: solo reservaciones de su restaurante
export const getReservationsByRestaurantService = async (restaurantId) => {
    if (!isValidId(restaurantId)) {
        const error = new Error('ID de restaurante inválido');
        error.name = 'ValidationError';
        throw error;
    }

    return await Reservation.find({ restaurant: restaurantId })
        .populate({ path: 'table', populate: { path: 'restaurant' } })
        .populate('restaurant')
        .sort({ date: 1 });
};


export const getReservationByIdService = async (id) => {
    if (!isValidId(id)) return false;
    return await Reservation.findById(id)
        .populate({ path: 'table', populate: { path: 'restaurant' } })
        .populate('restaurant');
};


export const updateReservationService = async (id, data) => {

    if (!isValidId(id)) return false;

    const reservation = await Reservation.findById(id);
    if (!reservation) return null;

    // Si cambian la mesa, actualizamos el restaurante en consecuencia
    if (data.table && data.table !== reservation.table?.toString()) {
        if (!isValidId(data.table)) {
            const error = new Error('ID de mesa inválido');
            error.name = 'ValidationError';
            throw error;
        }
        const newTable = await Table.findById(data.table);
        if (newTable) {
            data.restaurant = newTable.restaurant?._id ?? newTable.restaurant;
        }
    }

    reservation.set(data);
    await reservation.save();

    if (reservation.status === 'confirmed') {
        const user = await User.findByPk(reservation.user);
        if (user) {
            await sendEmail(
                user.email,
                'Reservación Confirmada',
                `<h1>Tu reservación fue confirmada</h1>
                 <p>Fecha: ${reservation.date}</p>`
            );
        }
    }

    return reservation;
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
    })
        .populate({ path: 'table', populate: { path: 'restaurant' } })
        .populate('restaurant');
};


export const getMyReservationsService = async (userId) => {
    return await Reservation.find({ user: userId })
        .populate({ path: 'table', populate: { path: 'restaurant' } })
        .populate('restaurant')
        .sort({ date: -1 });
};
