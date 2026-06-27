'use strict';
import Dish from './dish.js';
import Product from '../product/product.js';
import mongoose from 'mongoose';
import { ensureOwnedRestaurant, forceOwnedRestaurantInBody, getRestaurantFilter } from '../../../helpers/ownership.js';

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

/**
 * Verifica si los productos de un platillo tienen stock suficiente.
 * Retorna null si todo está bien, o un objeto { message, details } si falta stock.
 * Compatible con React Native: solo retorna datos, no toca res.
 */
const checkDishStock = async (products = []) => {
    if (!products.length) return null;

    const shortages = [];

    for (const item of products) {
        const productId = item.product?._id || item.product;
        const required = Number(item.quantity) || 1;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) continue;

        const product = await Product.findById(productId);
        if (!product) {
            shortages.push({ productId, issue: 'Producto no encontrado' });
            continue;
        }

        if (!product.isActive) {
            shortages.push({ name: product.name, issue: 'Producto inactivo' });
            continue;
        }

        if (product.stock < required) {
            shortages.push({
                name: product.name,
                required,
                available: product.stock,
                issue: `Stock insuficiente (disponible: ${product.stock}, requerido: ${required})`
            });
        }
    }

    return shortages.length ? shortages : null;
};

/**
 * Actualiza isAvailable del platillo según el stock actual de sus productos.
 * Se llama después de crear/actualizar el plato para mantener coherencia.
 */
const syncDishAvailability = async (dishId) => {
    const dish = await Dish.findById(dishId).populate('products.product');
    if (!dish) return;

    const hasStock = dish.products.every((item) => {
        const product = item.product;
        if (!product) return true;           // producto sin referencia → no bloquear
        if (!product.isActive) return false;
        return product.stock >= (item.quantity || 1);
    });

    // Solo guardar si realmente cambió para evitar writes innecesarios
    if (dish.isAvailable !== hasStock) {
        dish.isAvailable = hasStock;
        await dish.save();
    }

    return dish;
};

export const createDish = async (req, res) => {
    try {
        forceOwnedRestaurantInBody(req);

        // Validar stock antes de crear si viene con productos
        const products = req.body.products || [];
        const shortages = await checkDishStock(products);
        if (shortages) {
            return res.status(400).json({
                success: false,
                message: 'No se puede crear el platillo: stock insuficiente en uno o más insumos',
                stockIssues: shortages
            });
        }

        const dish = new Dish(req.body);
        await dish.save();

        // Sincronizar isAvailable según stock real
        const updatedDish = await syncDishAvailability(dish._id);

        return res.status(201).json({
            success: true,
            dish: updatedDish || dish
        });
    } catch (error) {
        return handleDishError(res, error, 'Error al crear el platillo');
    }
};

export const getDishes = async (req, res) => {
    try {
        const dishes = await Dish.find(getRestaurantFilter(req))
            .populate('category')
            .populate('products.product');
        return res.status(200).json({
            success: true,
            dishes
        });
    } catch (error) {
        return handleDishError(res, error, 'Error al obtener platillos');
    }
};

export const updateDish = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de platillo inválido'
            });
        }

        const existingDish = await Dish.findById(id);
        if (!existingDish) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado'
            });
        }

        const ownership = ensureOwnedRestaurant(req, existingDish.restaurant, 'platillo');
        if (!ownership.allowed) {
            return res.status(ownership.status).json({
                success: false,
                message: ownership.message
            });
        }

        delete req.body.restaurant;

        // Si el body trae productos nuevos, validar stock antes de actualizar
        const incomingProducts = req.body.products;
        if (Array.isArray(incomingProducts)) {
            const shortages = await checkDishStock(incomingProducts);
            if (shortages) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede actualizar el platillo: stock insuficiente en uno o más insumos',
                    stockIssues: shortages
                });
            }
        }

        const dish = await Dish.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!dish) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado'
            });
        }

        // Sincronizar disponibilidad después de actualizar
        const updatedDish = await syncDishAvailability(dish._id);

        return res.status(200).json({
            success: true,
            dish: updatedDish || dish
        });
    } catch (error) {
        return handleDishError(res, error, 'Error al actualizar el platillo');
    }
};

export const deleteDish = async (req, res) => {
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
            message: 'Platillo eliminado'
        });
    } catch (error) {
        return handleDishError(res, error, 'Error al eliminar el platillo');
    }
};

// Exportar helpers para que orderDetailController los reutilice
export { checkDishStock, syncDishAvailability };
