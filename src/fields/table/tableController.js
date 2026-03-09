'use strict';

import Table from './table.js';
import mongoose from 'mongoose';
import {
    createTableService,
    getTablesService,
    getTableByIdService,
    updateTableService,
    deleteTableService
} from './table.service.js';

import { handleError } from '../../../utils/handle-error.js';




export const createTable = async (req, res) => {
    try {
        const table = await createTableService(req.body);
        return res.status(201).json({
            success: true,
            message: 'Mesa creada',
            table
        });
    } catch (error) {
        return handleError(res, error, {
            duplicateMessage: 'La mesa ya existe',
            validationMessage: 'Datos inválidos de mesa',
            defaultMessage: 'Error al crear mesa'
        });
    }
};

export const getTables = async (req, res) => {
    try {
        const filters = {};

        if (req.query.restaurant) {
            filters.restaurant = req.query.restaurant;
        }

        const tables = await getTablesService(filters);

        return res.status(200).json({
            success: true,
            tables
        });
    } catch (error) {
        return handleError(res, error, 'Error al listar mesas');
    }
};

export const getTableById = async (req, res) => {
    try {
        const table = await getTableByIdService(req.params.id);

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
        return handleError(res, error, 'Error al buscar mesa');
    }
};

export const updateTable = async (req, res) => {
    try {
        const table = await updateTableService(req.params.id, req.body);

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
        return handleError(res, error, 'Error al actualizar mesa');
    }
};

export const deleteTable = async (req, res) => {
    try {
        const table = await deleteTableService(req.params.id);

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
        return handleError(res, error, 'Error al eliminar mesa');
    }
};