'use strict';
import Category from './category.js';
import mongoose from 'mongoose';

const handleCategoryError = (res, error, defaultMessage) => {
    if (error?.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'La categoría ya existe'
        });
    }

    if (error?.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Datos de categoría inválidos',
            error: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: defaultMessage,
        error: error.message
    });
};

export const createCategory=async(req,res)=>{
    try {
        const category=new Category(req.body);
        await category.save();
        return res.status(201).json({
            success: true,
            category
        });
    } catch (error) {
        return handleCategoryError(res, error, 'Error al crear la categoría');
    }
};

export const getCategories=async(req,res)=>{
    try {
        const categories = await Category.find();
        return res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        return handleCategoryError(res, error, 'Error al obtener categorías');
    }
};

export const updateCategory=async(req,res)=>{
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }

        const category=await Category.findByIdAndUpdate(id,req.body,{new:true,runValidators:true});

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        return handleCategoryError(res, error, 'Error al actualizar la categoría');
    }
};

export const deleteCategory=async(req,res)=>{
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message:'Categoría eliminada'
        });
    } catch (error) {
        return handleCategoryError(res, error, 'Error al eliminar la categoría');
    }
};
