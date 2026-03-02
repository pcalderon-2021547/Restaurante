'use strict';

import mongoose from 'mongoose';


export const validateCreateMenu = (req, res, next) => {
    const { name, restaurant, type, validFrom, validUntil } = req.body;

    if (!name || !restaurant) {
        return res.status(400).json({
            success: false,
            message: 'name y restaurant son obligatorios'
        });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurant)) {
        return res.status(400).json({
            success: false,
            message: 'ID de restaurante inválido'
        });
    }

    const validTypes = ['DAILY', 'EVENT', 'PROMOTION'];
    if (type && !validTypes.includes(type)) {
        return res.status(400).json({
            success: false,
            message: `Tipo de menú inválido. Valores permitidos: ${validTypes.join(', ')}`
        });
    }

    if (type === 'EVENT') {
        if (!validFrom || !validUntil) {
            return res.status(400).json({
                success: false,
                message: 'Un menú tipo EVENT requiere validFrom y validUntil'
            });
        }

        const from = new Date(validFrom);
        const until = new Date(validUntil);

        if (isNaN(from.getTime()) || isNaN(until.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Fechas inválidas en validFrom o validUntil'
            });
        }

        if (from >= until) {
            return res.status(400).json({
                success: false,
                message: 'validFrom debe ser anterior a validUntil'
            });
        }
    }

    next();
};

export const validateMenuId = (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID de menú inválido'
        });
    }

    next();
};
