'use strict';

export const validateRegister = (req, res, next) => {
    const { name, surname, username, email, password, phone } = req.body;

    if (!name || !surname || !username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'name, surname, username, email y password son obligatorios'
        });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Formato de email inválido'
        });
    }

    // Validar que la contraseña tenga al menos 8 caracteres
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'La contraseña debe tener al menos 8 caracteres'
        });
    }

    // Validar phone si viene (solo dígitos, máx 15)
    if (phone && !/^\d{7,15}$/.test(phone)) {
        return res.status(400).json({
            success: false,
            message: 'El teléfono debe contener entre 7 y 15 dígitos numéricos'
        });
    }

    next();
};

export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'email y password son obligatorios'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Formato de email inválido'
        });
    }

    next();
};

export const validateResetPassword = (req, res, next) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'token y newPassword son obligatorios'
        });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'La nueva contraseña debe tener al menos 8 caracteres'
        });
    }

    next();
};
