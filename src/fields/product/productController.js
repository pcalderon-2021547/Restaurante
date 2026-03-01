'use strict';
import nodemailer from 'nodemailer';
import Product from './product.js';
import User from '../user/user.js';
import mongoose from 'mongoose';

const sendLowStockAlert = async (product) => {
    try {
        const admins = await User.findAll({ where: { role: 'ADMIN_ROLE', status: true } });

        if (!admins.length) return;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const adminEmails = admins.map(a => a.email);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: adminEmails,
            subject: `Sin stock: ${product.name}`,
            html: `
                <h2>Alerta de inventario</h2>
                <p>El producto <strong>${product.name}</strong> ha llegado a <strong>0 unidades</strong> en stock.</p>
                <ul>
                    <li><strong>ID:</strong> ${product._id}</li>
                    <li><strong>Categoría:</strong> ${product.category}</li>
                    <li><strong>Costo unitario:</strong> Q${product.cost}</li>
                    <li><strong>Stock actual:</strong> ${product.stock}</li>
                </ul>
                <p>Por favor, realiza un pedido a tu proveedor para reabastecer este producto.</p>
            `
        });

        console.log(`Alerta de stock enviada a: ${adminEmails.join(', ')}`);
    } catch (error) {
        console.error('Error enviando alerta de stock:', error.message);
    }
};

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
            message: 'Los datos del producto son inválidos',
            error: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: defaultMessage,
        error: error.message
    });
};

export const createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();

        
        if (product.stock === 0) {
            await sendLowStockAlert(product);
        }

        return res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        return handleProductError(res, error, 'Error al crear el producto');
    }
};

export const getProducts = async (req, res) => {
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

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de producto inválido'
            });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        if (product.stock === 0) {
            await sendLowStockAlert(product);
        }

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        return handleProductError(res, error, 'Error al actualizar el producto');
    }
};

export const deleteProduct = async (req, res) => {
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
            message: 'Producto eliminado'
        });
    } catch (error) {
        return handleProductError(res, error, 'Error al eliminar el producto');
    }
};

export const searchProductByName = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar un nombre para buscar'
            });
        }

        const products = await Product.find({
            name: { $regex: name, $options: 'i' }
        });

        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        return handleProductError(res, error, 'Error al buscar productos');
    }
};

export const filterByCategory = async (req, res) => {
    try {
        const { category } = req.query;

        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar una categoría'
            });
        }

        const products = await Product.find({ category });

        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        return handleProductError(res, error, 'Error al filtrar por categoría');
    }
};

export const restockProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de producto inválido'
            });
        }

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad a agregar debe ser mayor a 0'
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        const stockAnterior = product.stock;
        product.stock = product.stock + Number(amount);
        await product.save();

        return res.status(200).json({
            success: true,
            message: 'Stock actualizado correctamente',
            producto: product.name,
            stockAnterior,
            stockAgregado: Number(amount),
            stockActual: product.stock
        });

    } catch (error) {
        return handleProductError(res, error, 'Error al reabastecer producto');
    }
};
