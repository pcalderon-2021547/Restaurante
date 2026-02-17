'use strict';

import Table from './table.js';

export const createTable = async (req, res) => {
    try {
        const table = new Table(req.body);
        await table.save();
        res.status(201).send({ message: 'Mesa creada', table });
    } catch (err) {
        res.status(500).send({ message: 'Error al crear mesa', err });
    }
};

export const getTables = async (req, res) => {
    try {
        const tables = await Table.find();
        res.send(tables);
    } catch (err) {
        res.status(500).send({ message: 'Error al listar mesas', err });
    }
};

export const getTableById = async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);
        res.send(table);
    } catch (err) {
        res.status(500).send({ message: 'Error al buscar mesa', err });
    }
};

export const updateTable = async (req, res) => {
    try {
        const table = await Table.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.send({ message: 'Mesa actualizada', table });
    } catch (err) {
        res.status(500).send({ message: 'Error al actualizar', err });
    }
};

export const deleteTable = async (req, res) => {
    try {
        await Table.findByIdAndDelete(req.params.id);
        res.send({ message: 'Mesa eliminada' });
    } catch (err) {
        res.status(500).send({ message: 'Error al eliminar', err });
    }
};
