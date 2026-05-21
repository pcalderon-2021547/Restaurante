'use strict';
import Dish from './dish.js';
import mongoose from 'mongoose';

const handleDishError = (res, error, defaultMessage) => {
    if (error?.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'El platillo ya existe'
        });
    }

    if (error?.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Datos de platillo inválidos',
            error: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: defaultMessage,
        error: error.message
    });
};

export const createDish=async(req,res)=>{
    try {
        const dish=new Dish(req.body);
        await dish.save();
        return res.status(201).json({
            success: true,
            dish
        });
    } catch (error) {
        return handleDishError(res, error, 'Error al crear el platillo');
    }
};

export const getDishes=async(req,res)=>{
    try {
        const dishes = await Dish.find().populate('category').populate('products.product');
        return res.status(200).json({
            success: true,
            dishes
        });
    } catch (error) {
        return handleDishError(res, error, 'Error al obtener platillos');
    }
};

export const updateDish=async(req,res)=>{
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de platillo inválido'
            });
        }

        const dish=await Dish.findByIdAndUpdate(id,req.body,{new:true,runValidators:true});

        if (!dish) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            dish
        });
    } catch (error) {
        return handleDishError(res, error, 'Error al actualizar el platillo');
    }
};

export const deleteDish=async(req,res)=>{
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de platillo inválido'
            });
        }

        const dish = await Dish.findByIdAndDelete(id);

        if (!dish) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message:'Platillo eliminado'
        });
    } catch (error) {
        return handleDishError(res, error, 'Error al eliminar el platillo');
    }
};
