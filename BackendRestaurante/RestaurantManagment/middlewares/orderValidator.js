'use strict';

import mongoose from 'mongoose';

// validar el id de la orden
export const validateOrderId = (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID de orden inválido'
        });
    }

    next();
};

// validar la creacion de la orden
export const validateCreateOrder = (req, res, next) => {
    const { user, restaurant, type, address } = req.body;

    if (!user || !restaurant || !type) {
        return res.status(400).json({
            success: false,
            message: 'User, restaurant y type son obligatorios'
        });
    }

    if (!['dine_in', 'delivery', 'takeaway'].includes(type)) {
        return res.status(400).json({
            success: false,
            message: 'Tipo de orden inválido'
        });
    }

    if (type === 'delivery' && !address) {
        return res.status(400).json({
            success: false,
            message: 'La dirección es obligatoria para delivery'
        });
    }

    next();
};


// validar la actualizacion del estado de la orden
export const validateOrderStatus = (req, res, next) => {
    const { status } = req.body;

    const validStatuses = [
        'pending',
        'preparing',
        'ready',
        'delivered',
        'paid',
        'cancelled'
    ];

    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Estado de orden inválido'
        });
    }

    next();
};