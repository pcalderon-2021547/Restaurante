'use strict';
import Table from './table.js';

export const createTableService = async (data) => {
    const table = new Table(data);
    return await table.save();
};

export const getTablesService = async (filters = {}) => {
    return await Table.find(filters).populate('restaurant');
};

export const getTableByIdService = async (id) => {
    return await Table.findById(id).populate('restaurant');
};

export const updateTableService = async (id, data) => {
    return await Table.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    );
};

export const deleteTableService = async (id) => {
    return await Table.findByIdAndDelete(id);
};