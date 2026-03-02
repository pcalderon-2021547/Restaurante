'use strict';

export const validateCreateProduct = (req, res, next) => {
    const { name, stock, cost, category } = req.body;

    const missing = [];
    if (!name)                    missing.push('name');
    if (stock === undefined || stock === null) missing.push('stock');
    if (!cost)                    missing.push('cost');
    if (!category)                missing.push('category');

    if (missing.length) {
        return res.status(400).json({
            success: false,
            message: `Campos obligatorios faltantes: ${missing.join(', ')}`
        });
    }

    const parsedStock = Number(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({
            success: false,
            message: 'El stock debe ser un número mayor o igual a 0'
        });
    }

    const parsedCost = Number(cost);
    if (isNaN(parsedCost) || parsedCost < 0) {
        return res.status(400).json({
            success: false,
            message: 'El costo debe ser un número positivo'
        });
    }

    next();
};

export const validateUpdateProduct = (req, res, next) => {
    const { stock, cost } = req.body;

    if (stock !== undefined) {
        const parsedStock = Number(stock);
        if (isNaN(parsedStock) || parsedStock < 0) {
            return res.status(400).json({
                success: false,
                message: 'El stock debe ser un número mayor o igual a 0'
            });
        }
    }

    if (cost !== undefined) {
        const parsedCost = Number(cost);
        if (isNaN(parsedCost) || parsedCost < 0) {
            return res.status(400).json({
                success: false,
                message: 'El costo debe ser un número positivo'
            });
        }
    }

    next();
};

export const validateRestockAmount = (req, res, next) => {
    const { amount } = req.body;

    if (amount === undefined || amount === null) {
        return res.status(400).json({
            success: false,
            message: 'El campo amount es obligatorio'
        });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'La cantidad a agregar debe ser un número mayor a 0'
        });
    }

    next();
};
