'use strict';

import OrderDetail from './orderDetail.js';
import Order from '../order/order_model.js';
import Dish from '../dish/dish.js';
import Product from '../product/product.js';
import mongoose from 'mongoose';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const recalculateOrderTotal = async (orderId) => {
    const details = await OrderDetail.find({ order: orderId });
    const subtotal = details.reduce((acc, item) => acc + item.subtotal, 0);
    const tax = Number((subtotal * 0.12).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));
    await Order.findByIdAndUpdate(orderId, { subtotal, tax, total });
};

/**
 * Descuenta stock de los productos de un platillo al agregarlo a la orden.
 * quantity = cantidad de veces que se pide el plato.
 * Compatible con React Native: pura lógica de datos, sin tocar res.
 */
const deductStockForDish = async (dishId, orderQuantity) => {
    const dish = await Dish.findById(dishId).populate('products.product');
    if (!dish || !dish.products.length) return;

    for (const item of dish.products) {
        const product = item.product;
        if (!product) continue;
        const totalConsumed = (item.quantity || 1) * orderQuantity;
        product.stock = Math.max(0, product.stock - totalConsumed);
        await product.save();
    }

    // Re-evaluar disponibilidad del plato tras el descuento
    const stillAvailable = dish.products.every((item) => {
        const p = item.product;
        return p && p.isActive && p.stock >= (item.quantity || 1);
    });
    if (dish.isAvailable !== stillAvailable) {
        dish.isAvailable = stillAvailable;
        await dish.save();
    }
};

/**
 * Restaura stock de los productos cuando se elimina un detalle de orden.
 * Compatible con React Native: pura lógica de datos.
 */
const restoreStockForDish = async (dishId, orderQuantity) => {
    const dish = await Dish.findById(dishId).populate('products.product');
    if (!dish || !dish.products.length) return;

    for (const item of dish.products) {
        const product = item.product;
        if (!product) continue;
        const totalRestored = (item.quantity || 1) * orderQuantity;
        product.stock = product.stock + totalRestored;
        await product.save();
    }

    // Re-evaluar disponibilidad tras restaurar
    const nowAvailable = dish.products.every((item) => {
        const p = item.product;
        return p && p.isActive && p.stock >= (item.quantity || 1);
    });
    if (dish.isAvailable !== nowAvailable) {
        dish.isAvailable = nowAvailable;
        await dish.save();
    }
};

/**
 * Verifica si hay stock suficiente para pedir un platillo N veces.
 * Retorna null si todo OK, o arreglo de problemas si hay escasez.
 */
const checkStockForOrder = async (dishId, orderQuantity) => {
    const dish = await Dish.findById(dishId).populate('products.product');
    if (!dish) return [{ issue: 'Platillo no encontrado' }];

    if (!dish.isAvailable) {
        return [{ dish: dish.name, issue: 'El platillo no está disponible actualmente' }];
    }

    if (!dish.products.length) return null;

    const shortages = [];
    for (const item of dish.products) {
        const product = item.product;
        if (!product) continue;
        if (!product.isActive) {
            shortages.push({ name: product.name, issue: 'Insumo inactivo' });
            continue;
        }
        const required = (item.quantity || 1) * orderQuantity;
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

export const createOrderDetail = async (req, res) => {
    try {
        const { order, dish, quantity } = req.body;

        if (!order || !dish || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos'
            });
        }

        if (!isValidId(order) || !isValidId(dish)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const qty = Number(quantity);
        if (isNaN(qty) || qty < 1) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad debe ser un número entero mayor a 0'
            });
        }

        const dishData = await Dish.findById(dish);
        if (!dishData) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado'
            });
        }

        // Validar stock antes de agregar el detalle
        const stockIssues = await checkStockForOrder(dish, qty);
        if (stockIssues) {
            return res.status(400).json({
                success: false,
                message: 'No se puede agregar el platillo: stock insuficiente',
                stockIssues
            });
        }

        // Validar permisos del usuario
        if (req.user && req.user.role === 'USER_ROLE') {
            const existingOrder = await Order.findById(order);
            if (!existingOrder) {
                return res.status(404).json({ success: false, message: 'Orden no encontrada' });
            }
            if ((existingOrder.user?.toString && existingOrder.user.toString()) !== (req.user.id || req.user._id)) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para modificar esta orden' });
            }
            if (existingOrder.status && existingOrder.status !== 'pending') {
                return res.status(400).json({ success: false, message: 'No se pueden agregar detalles a una orden que ya no está pendiente' });
            }
        }

        const price = dishData.price;
        const subtotal = Number((price * qty).toFixed(2));

        const detail = new OrderDetail({ order, dish, quantity: qty, price, subtotal });
        await detail.save();

        // Descontar stock de los productos del platillo
        await deductStockForDish(dish, qty);

        await recalculateOrderTotal(order);

        return res.status(201).json({
            success: true,
            message: 'Detalle creado correctamente',
            detail
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear detalle',
            error: error.message
        });
    }
};

export const getOrderDetails = async (req, res) => {
    try {
        const details = await OrderDetail.find()
            .populate('order')
            .populate('dish');

        return res.status(200).json({
            success: true,
            details
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al listar detalles',
            error: error.message
        });
    }
};

export const getOrderDetailsByOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!isValidId(orderId)) {
            return res.status(400).json({ success: false, message: 'ID de orden inválido' });
        }

        if (req.user && req.user.role === 'USER_ROLE') {
            const existingOrder = await Order.findById(orderId);
            if (!existingOrder) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
            if ((existingOrder.user?.toString && existingOrder.user.toString()) !== (req.user.id || req.user._id)) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para ver los detalles de esta orden' });
            }
        }

        const details = await OrderDetail.find({ order: orderId }).populate('dish');

        return res.status(200).json({ success: true, details });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener detalles', error: error.message });
    }
};

export const updateOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const detail = await OrderDetail.findById(id);
        if (!detail) {
            return res.status(404).json({
                success: false,
                message: 'Detalle no encontrado'
            });
        }

        if (quantity && quantity > 0) {
            const newQty = Number(quantity);
            const oldQty = detail.quantity;
            const delta = newQty - oldQty;

            // Si se aumenta la cantidad, verificar stock para la diferencia
            if (delta > 0) {
                const stockIssues = await checkStockForOrder(detail.dish, delta);
                if (stockIssues) {
                    return res.status(400).json({
                        success: false,
                        message: 'No se puede aumentar la cantidad: stock insuficiente',
                        stockIssues
                    });
                }
                await deductStockForDish(detail.dish, delta);
            } else if (delta < 0) {
                // Se reduce la cantidad → restaurar stock
                await restoreStockForDish(detail.dish, Math.abs(delta));
            }

            detail.quantity = newQty;
            detail.subtotal = Number((detail.price * newQty).toFixed(2));
        }

        await detail.save();
        await recalculateOrderTotal(detail.order);

        return res.status(200).json({
            success: true,
            message: 'Detalle actualizado correctamente',
            detail
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar detalle',
            error: error.message
        });
    }
};

export const deleteOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const detail = await OrderDetail.findById(id);
        if (!detail) {
            return res.status(404).json({
                success: false,
                message: 'Detalle no encontrado'
            });
        }

        const { order: orderId, dish: dishId, quantity } = detail;

        await OrderDetail.findByIdAndDelete(id);

        // Restaurar stock al eliminar el detalle
        await restoreStockForDish(dishId, quantity);

        await recalculateOrderTotal(orderId);

        return res.status(200).json({
            success: true,
            message: 'Detalle eliminado correctamente'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar detalle',
            error: error.message
        });
    }
};
