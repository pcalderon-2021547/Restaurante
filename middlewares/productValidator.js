'use strict';

/**
 * FALLO #6 — productController.js llama `User.findAll(...)` (método de Sequelize)
 * pero User es un modelo de Sequelize correcto; sin embargo, la función
 * `sendLowStockAlert` mezcla la búsqueda de admins con un modelo de PostgreSQL
 * desde un controller de MongoDB, lo cual funcionará solo si la conexión está activa.
 * El problema más grave: si `User.findAll` falla silenciosamente, el producto
 * igual se crea sin notificación y sin feedback al usuario.
 *
 * FALLO #7 — No hay validación de campos al crear/actualizar producto.
 * name, stock, cost y category son required en el modelo pero no se validan
 * antes de llegar al controller, causando errores 500 en vez de 400.
 */

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
