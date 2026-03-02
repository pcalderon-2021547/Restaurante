'use strict';

import mongoose from 'mongoose';

/**
 * FALLO #5 — menu_controller.js usa `Restaurant` (mayúscula) y `Menu` (mayúscula)
 * pero el import dice `import menus from './menu_model.js'` y
 * `import restaurant from '../restaurant/restaurant.model.js'` (minúsculas).
 * Eso hace que `Restaurant.findById` y `new Menu(req.body)` fallen en runtime
 * con ReferenceError.
 *
 * Este middleware valida los datos del menú ANTES de que el controller
 * intente acceder a esas variables, cortocircuitando el crash.
 */

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
