'use strict'; 
import nodemailer from 'nodemailer'; // Librería para enviar correos
import Product from './product.js'; 
import User from '../user/user.js'; 
import mongoose from 'mongoose'; 

// Enviar alerta cuando el stock llega a 0
const sendLowStockAlert = async (product) => {
    try {
        // Buscar administradores activos
        const admins = await User.findAll({ where: { role: 'ADMIN_ROLE', status: true } });
        if (!admins.length) return; // Si no hay admins, salir

        // Configurar transporte de correo
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Obtener correos de administradores
        const adminEmails = admins.map(a => a.email);

        // Enviar correo de alerta
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

        console.log(`Alerta de stock enviada a: ${adminEmails.join(', ')}`); // Log éxitoso
    } catch (error) {
        console.error('Error enviando alerta de stock:', error.message); // Log error
    }
};

// Manejo general de errores de producto
const handleProductError = (res, error, defaultMessage) => {

    // Error por duplicado
    if (error?.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'El producto ya existe'
        });
    }

    // Error de validación
    if (error?.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Los datos del producto son inválidos',
            error: error.message
        });
    }

    // Error general
    return res.status(500).json({
        success: false,
        message: defaultMessage,
        error: error.message
    });
};

// Crear producto
export const createProduct = async (req, res) => {
    try {
        const product = new Product(req.body); // Crear instancia
        await product.save(); // Guardar en Mongo

        // Si el stock es 0 enviar alerta
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

// Obtener todos los productos
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find(); // Buscar todos
        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        return handleProductError(res, error, 'Error al obtener productos');
    }
};

// Actualizar producto
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params; // Obtener ID

        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de producto inválido'
            });
        }

        // Actualizar producto
        const product = await Product.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        // Esto por si no existe
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Enviar alerta si stock queda en 0
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

// Eliminar producto
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params; // Obtener ID

        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de producto inválido'
            });
        }

        const product = await Product.findByIdAndDelete(id); // Eliminar

        // Si no existe
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

// Buscar producto por nombre
export const searchProductByName = async (req, res) => {
    try {
        const { name } = req.query; // Obtener nombre

        // Validar parámetro
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar un nombre para buscar'
            });
        }

        // Buscar con expresión regular
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

// Filtrar productos por categoría
export const filterByCategory = async (req, res) => {
    try {
        const { category } = req.query; // Obtener categoría

        // Validar categoría
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar una categoría'
            });
        }

        const products = await Product.find({ category }); // Buscar por categoría

        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        return handleProductError(res, error, 'Error al filtrar por categoría');
    }
};

// Reabastecer producto
export const restockProduct = async (req, res) => {
    try {
        const { id } = req.params; // Obtener ID
        const { amount } = req.body; // Cantidad a agregar

        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de producto inválido'
            });
        }

        // Validar cantidad
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad a agregar debe ser mayor a 0'
            });
        }

        const product = await Product.findById(id); // Buscar producto

        // Si no existe
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        const stockAnterior = product.stock; // Guardar stock anterior
        product.stock = product.stock + Number(amount); // Sumar stock
        await product.save(); // Guardar cambios

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

// Obtener producto por ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params; // Obtener ID

        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'El ID del producto es inválido'
            });
        }

        const product = await Product.findById(id); // Buscar producto

        // Si no existe
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'El Producto no fue encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        return handleProductError(res, error, 'Error al obtener el producto');
    }
};

// Activar o desactivar producto
export const toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params; // Obtener ID

        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'El ID del producto es inválido'
            });
        }

        const product = await Product.findById(id); // Buscar producto

        // Si no existe
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'El Producto no fue encontrado'
            });
        }

        product.isActive = !product.isActive; // Cambiar estado
        await product.save(); // Guardar cambio

        return res.status(200).json({
            success: true,
            message: `Producto ${product.isActive ? 'activado' : 'desactivado'} correctamente`,
            product
        });

    } catch (error) {
        return handleProductError(res, error, 'Error al cambiar estado del producto');
    }
};