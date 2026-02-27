'use strict'

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Op } from 'sequelize';
import User from './user.js';

export const createUser = async (req, res) => {
    try {
        const { password, ...data } = req.body;

        const encryptedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            ...data,
            password: encryptedPassword
        });

        return res.status(201).json({
            success: true,
            message: 'Usuario creado correctamente',
            user
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getUsers = async (req, res) => {
    try {

        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { rows, count } = await User.findAndCountAll({
            attributes: { exclude: ['password', 'emailToken', 'resetToken', 'resetTokenExpiration', 'deleteToken', 'deleteTokenExpiration'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalRecords: count,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateUser = async (req, res) => {
    try {

        const { id } = req.params;
        const data = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        await user.update(data);

        return res.json({
            success: true,
            message: 'Usuario actualizado correctamente'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteUser = async (req, res) => {
    try {

        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (user.role !== 'ADMIN_ROLE') {
            await user.destroy();
            return res.json({
                success: true,
                message: 'Usuario eliminado correctamente'
            });
        }

        const deleteToken = crypto.randomBytes(32).toString('hex');

        user.deleteToken = deleteToken;
        user.deleteTokenExpiration = Date.now() + 3600000;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const deleteLink =
            `http://localhost:${process.env.PORT}/restaurantManagement/v1/users/confirm-delete?token=${deleteToken}`;

        await transporter.sendMail({
            to: user.email,
            subject: 'Confirmación eliminación de ADMIN',
            html: `
                <h2>Confirmar eliminación</h2>
                <p>Haz click para confirmar:</p>
                <a href="${deleteLink}">${deleteLink}</a>
            `
        });

        return res.json({
            success: true,
            message: 'Correo enviado para confirmar eliminación de ADMIN'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const confirmDeleteAdmin = async (req, res) => {
    try {

        const { token } = req.query;

        const user = await User.findOne({
            where: {
                deleteToken: token,
                deleteTokenExpiration: {
                    [Op.gt]: Date.now()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }

        await user.destroy();

        return res.json({
            success: true,
            message: 'Administrador eliminado correctamente'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};