'use strict';
import Product from './product.js';
import mongoose from 'mongoose';

const handleProductError = (res, error, defaultMessage) => {
    if (error?.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'El producto ya existe'
        });
    }

    if (error?.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Datos de producto inválidos',
            error: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: defaultMessage,
        error: error.message
    });
};

export const createProduct=async(req,res)=>{
    try {
        const product=new Product(req.body);
        await product.save();
        return res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        return handleProductError(res, error, 'Error al crear el producto');
    }
};

export const getProducts=async(req,res)=>{
    try {
        const products = await Product.find();
        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        return handleProductError(res, error, 'Error al obtener productos');
    }
};

export const updateProduct=async(req,res)=>{
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de producto inválido'
            });
        }

        const product=await Product.findByIdAndUpdate(id,req.body,{new:true,runValidators:true});

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        return handleProductError(res, error, 'Error al actualizar el producto');
    }
};

export const deleteProduct=async(req,res)=>{
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de producto inválido'
            });
        }

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message:'Producto eliminado'
        });
    } catch (error) {
        return handleProductError(res, error, 'Error al eliminar el producto');
    }
};
