'use strict'; 
import nodemailer from 'nodemailer'; // Librería para enviar correos
import Product from './product.js'; 
import User from '../user/user.js'; 
import mongoose from 'mongoose'; 
import { ensureOwnedRestaurant, forceOwnedRestaurantInBody, getRestaurantFilter } from '../../../helpers/ownership.js';
import { renderEmailTemplate } from '../../utils/reactEmailTemplate.js';

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
            },
             tls: { rejectUnauthorized: false }
        });

        // Obtener correos de administradores
        const adminEmails = admins.map(a => a.email);

        // Enviar correo de alerta
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: adminEmails,
            subject: `Sin stock: ${product.name}`,
            html: renderEmailTemplate({
                title: `Sin stock: ${product.name}`,
                preheader: 'Un producto llego a cero unidades en inventario.',
                heading: 'Alerta de inventario',
                intro: 'Un insumo o producto clave necesita reabastecimiento para mantener la operacion del restaurante.',
                paragraphs: [
                    `El producto ${product.name} ha llegado a 0 unidades en stock.`,
                    'Revisa el inventario y coordina el pedido con tu proveedor para evitar interrupciones en cocina o servicio.'
                ],
                details: [
                    { label: 'Producto', value: product.name },
                    { label: 'Categoria', value: product.category || 'Sin categoria' },
                    { label: 'Costo unitario', value: `Q${product.cost}` },
                    { label: 'Stock actual', value: String(product.stock) }
                ],
                notice: `ID del producto: ${product._id}`
            })
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
        forceOwnedRestaurantInBody(req);
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
        const products = await Product.find(getRestaurantFilter(req)); // Buscar todos
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

        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        const ownership = ensureOwnedRestaurant(req, existingProduct.restaurant, 'producto');
        if (!ownership.allowed) {
            return res.status(ownership.status).json({
                success: false,
                message: ownership.message
            });
        }

        delete req.body.restaurant;

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
        const products = await Product.find(getRestaurantFilter(req, {
            name: { $regex: name, $options: 'i' }
        }));

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

        const products = await Product.find(getRestaurantFilter(req, { category })); // Buscar por categoría

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

        const ownership = ensureOwnedRestaurant(req, product.restaurant, 'producto');
        if (!ownership.allowed) {
            return res.status(ownership.status).json({
                success: false,
                message: ownership.message
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

        const ownership = ensureOwnedRestaurant(req, product.restaurant, 'producto');
        if (!ownership.allowed) {
            return res.status(ownership.status).json({
                success: false,
                message: ownership.message
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

        const ownership = ensureOwnedRestaurant(req, product.restaurant, 'producto');
        if (!ownership.allowed) {
            return res.status(ownership.status).json({
                success: false,
                message: ownership.message
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
