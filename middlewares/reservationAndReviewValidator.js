'use strict';

import mongoose from 'mongoose';

/**
 * FALLO #3 — reservation.js usa `user: { type: Number }` pero en el controller
 * se asigna req.user.id que viene de PostgreSQL como integer. Sin embargo,
 * no hay validación de que numberOfPeople, customerName, customerPhone y table
 * lleguen completos en el create. Se valida aquí.
 *
 * FALLO #4 — review.controller.js: la comparación `review.user !== req.user.id`
 * siempre falla porque review.user es Number y req.user.id puede ser string.
 * Se agrega un middleware de ownership que normaliza los tipos.
 */

// ─── RESERVACIÓN ───────────────────────────────────────────────────

export const validateCreateReservation = (req, res, next) => {
    const { customerName, customerPhone, table, date, numberOfPeople } = req.body;

    const missing = [];
    if (!customerName)   missing.push('customerName');
    if (!customerPhone)  missing.push('customerPhone');
    if (!table)          missing.push('table');
    if (!date)           missing.push('date');
    if (!numberOfPeople) missing.push('numberOfPeople');

    if (missing.length) {
        return res.status(400).json({
            success: false,
            message: `Campos obligatorios faltantes: ${missing.join(', ')}`
        });
    }

    if (!mongoose.Types.ObjectId.isValid(table)) {
        return res.status(400).json({
            success: false,
            message: 'ID de mesa inválido'
        });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Formato de fecha inválido'
        });
    }

    const parsedPeople = Number(numberOfPeople);
    if (!Number.isInteger(parsedPeople) || parsedPeople < 1) {
        return res.status(400).json({
            success: false,
            message: 'numberOfPeople debe ser un entero mayor a 0'
        });
    }

    next();
};

export const validateUpdateReservationStatus = (req, res, next) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled'];

    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Estado inválido. Valores permitidos: ${validStatuses.join(', ')}`
        });
    }

    next();
};

// ─── REVIEW ────────────────────────────────────────────────────────

export const validateCreateReview = (req, res, next) => {
    const { restaurant, rating } = req.body;

    if (!restaurant || rating === undefined || rating === null) {
        return res.status(400).json({
            success: false,
            message: 'restaurant y rating son obligatorios'
        });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurant)) {
        return res.status(400).json({
            success: false,
            message: 'ID de restaurante inválido'
        });
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
            success: false,
            message: 'El rating debe ser un número entre 1 y 5'
        });
    }

    next();
};

/**
 * FALLO #4 — review.controller.js compara `review.user !== req.user.id`
 * donde review.user es Number (PostgreSQL) y req.user.id puede ser string.
 * Este middleware normaliza el ownership check de forma correcta.
 * Úsalo ANTES de updateReview y deleteReview para agregar req.isOwner.
 * El controller debe ser actualizado para usar Number(review.user) === Number(req.user.id).
 */
export const normalizeReviewOwnership = (req, res, next) => {
    // Adjuntar función de comparación segura al request
    req.isReviewOwner = (reviewUserId) => {
        return Number(reviewUserId) === Number(req.user?.id);
    };
    next();
};
