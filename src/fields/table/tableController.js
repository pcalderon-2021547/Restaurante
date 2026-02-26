'use strict';

import Table from './table.js';
import mongoose from 'mongoose';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const handleTableError = (res, error, defaultMessage) => {
    if (error?.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'La mesa ya existe'
        });
    }

    if (error?.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Datos de mesa inválidos',
            error: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: defaultMessage,
        error: error.message
    });
};

export const createTable = async (req, res) => {
    try {
        const table = new Table(req.body);
        await table.save();
        return res.status(201).json({
            success: true,
            message: 'Mesa creada',
            table
        });
    } catch (error) {
        return handleTableError(res, error, 'Error al crear mesa');
    }
};

export const getTables = async (req, res) => {
    try {
        const tables = await Table.find();
        return res.status(200).json({
            success: true,
            tables
        });
    } catch (error) {
        return handleTableError(res, error, 'Error al listar mesas');
    }
};

export const getTableById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de mesa inválido'
            });
        }

        const table = await Table.findById(id);

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            table
        });
    } catch (error) {
        return handleTableError(res, error, 'Error al buscar mesa');
    }
};

export const updateTable = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de mesa inválido'
            });
        }

        const table = await Table.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Mesa actualizada',
            table
        });
    } catch (error) {
        return handleTableError(res, error, 'Error al actualizar mesa');
    }
};

export const deleteTable = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de mesa inválido'
            });
        }

        const table = await Table.findByIdAndDelete(id);

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Mesa eliminada'
        });
    } catch (error) {
        return handleTableError(res, error, 'Error al eliminar mesa');
    }
};
