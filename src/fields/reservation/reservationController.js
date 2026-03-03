'use strict';
import {
    createReservationService,
    getReservationsService,
    getReservationByIdService,
    updateReservationService,
    cancelReservationService,
    getReservationsByDateService,
    getMyReservationsService
} from './reservation.service.js';

import { handleError } from '../../../utils/handle-error.js';


export const createReservation = async (req, res) => {
    try {
        const reservation = await createReservationService(req.body, req.user.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            });
        }

        return res.status(201).json({
            success: true,
            reservation
        });

    } catch (error) {
        return handleError(res, error, {
            validationMessage: 'Datos inválidos de la reservación',
            defaultMessage: 'Error al crear reservación'
        });
    }
};


export const getReservations = async (req, res) => {
    try {
        const reservations = await getReservationsService();
        return res.status(200).json({
            success: true,
            reservations
        });
    } catch (error) {
        return handleError(res, error, 'Error al obtener reservaciones');
    }
};


export const getReservationById = async (req, res) => {
    try {
        const reservation = await getReservationByIdService(req.params.id);

        if (reservation === false) {
            return res.status(400).json({
                success: false,
                message: 'ID de reservación inválido'
            });
        }

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
        return handleError(res, error, 'Error al buscar reservación');
    }
};


export const updateReservation = async (req, res) => {
    try {
        const reservation = await updateReservationService(req.params.id, req.body);

        if (reservation === false) {
            return res.status(400).json({
                success: false,
                message: 'ID de reservación inválido'
            });
        }

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
        return handleError(res, error, 'Error al actualizar reservación');
    }
};


export const cancelReservation = async (req, res) => {
    try {
        const reservation = await cancelReservationService(req.params.id);

        if (reservation === false) {
            return res.status(400).json({
                success: false,
                message: 'ID de reservación inválido'
            });
        }

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Reservación cancelada'
        });

    } catch (error) {
        return handleError(res, error, 'Error al cancelar reservación');
    }
};


export const getReservationsByDate = async (req, res) => {
    try {
        const reservations = await getReservationsByDateService(req.query.date);

        return res.status(200).json({
            success: true,
            total: reservations.length,
            reservations
        });

    } catch (error) {
        return handleError(res, error, {
            validationMessage: error.message,
            defaultMessage: 'Error al buscar reservaciones por fecha'
        });
    }
};


export const getMyReservations = async (req, res) => {
    try {
        const reservations = await getMyReservationsService(req.user.id);

        return res.status(200).json({
            success: true,
            total: reservations.length,
            reservations
        });

    } catch (error) {
        return handleError(res, error, 'Error al obtener historial');
    }
};