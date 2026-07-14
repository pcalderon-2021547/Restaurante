'use strict';

import asyncHandler from '../../../helpers/async-handler.js';
import handleError from '../../../utils/handle-error.js';
import Delivery from './delivery.js';
import Order from '../order/order_model.js';
import OrderDetail from '../orderDetail/orderDetail.js';

/**
 * Crear una nueva entrega
 * Los middlewares ya han auto-llenado y calculado los datos
 */
export const createDelivery = asyncHandler(async (req, res) => {
    try {
        const {
            order,
            deliveryAddress,
            deliveryZone,
            distance,
            deliveryFee,
            estimatedDeliveryTime,
            paymentMethod,
            specialInstructions,
            calculatedData
        } = req.body;

        // Los datos ya fueron validados y calculados por los middlewares
        const subtotal = calculatedData?.subtotal || 0;
        const tax = calculatedData?.tax || 0;
        const total = calculatedData?.total || 0;
        const orderDetailIds = calculatedData?.orderDetailIds || [];

        const newDelivery = new Delivery({
            order,
            orderDetails: orderDetailIds,
            deliveryAddress,
            deliveryZone,
            distance,
            deliveryFee,
            estimatedDeliveryTime: estimatedDeliveryTime || 40,
            paymentMethod,
            specialInstructions,
            subtotal,
            tax,
            total,
            status: 'pending_acceptance'
        });

        const savedDelivery = await newDelivery.save();

        // Actualizar la orden con la dirección de entrega
        const addressString = deliveryAddress.number 
            ? `${deliveryAddress.street} ${deliveryAddress.number}, ${deliveryAddress.neighborhood}`
            : `${deliveryAddress.street}, ${deliveryAddress.neighborhood}`;

        await Order.findByIdAndUpdate(order, {
            address: addressString,
            type: 'delivery',
            status: 'preparing'
        });

        return res.status(201).json({
            message: 'Entrega creada exitosamente',
            data: {
                delivery: savedDelivery,
                calculated: {
                    subtotal,
                    tax,
                    total,
                    itemCount: calculatedData?.itemCount || 0
                }
            }
        });
    } catch (error) {
        handleError(error, res);
    }
});

/**
 * Obtener todas las entregas
 */
export const getAllDeliveries = asyncHandler(async (req, res) => {
    try {
        const deliveries = await Delivery.find()
            .populate('order')
            .populate('orderDetails')
            .populate('deliveryPerson', 'name email phone');

        return res.status(200).json({
            message: 'Entregas obtenidas exitosamente',
            deliveries
        });
    } catch (error) {
        handleError(error, res);
    }
});

/**
 * Obtener una entrega por ID
 */
export const getDeliveryById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const delivery = await Delivery.findById(id)
            .populate('order')
            .populate('orderDetails')
            .populate('deliveryPerson', 'name email phone');

        if (!delivery) {
            return res.status(404).json({ message: 'Entrega no encontrada' });
        }

        return res.status(200).json({
            message: 'Entrega obtenida exitosamente',
            delivery
        });
    } catch (error) {
        handleError(error, res);
    }
});

/**
 * Actualizar una entrega
 */
export const updateDelivery = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const delivery = await Delivery.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        )
            .populate('order')
            .populate('orderDetails')
            .populate('deliveryPerson', 'name email phone');

        if (!delivery) {
            return res.status(404).json({ message: 'Entrega no encontrada' });
        }

        return res.status(200).json({
            message: 'Entrega actualizada exitosamente',
            delivery
        });
    } catch (error) {
        handleError(error, res);
    }
});

/**
 * Cambiar estado de la entrega
 */
export const updateDeliveryStatus = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const validStatuses = [
            'pending_acceptance',
            'accepted',
            'preparing',
            'ready_for_delivery',
            'in_transit',
            'delivered',
            'cancelled',
            'failed_delivery'
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Estado inválido',
                validStatuses 
            });
        }

        const updates = { status };
        
        // Cuando cambia a 'in_transit', registra la hora de inicio
        if (status === 'in_transit') {
            updates.deliveryStartTime = new Date();
            // El middleware pre-save calculará automáticamente el scheduledDeliveryTime
        } 
        // Cuando cambia a 'delivered', registra la hora de finalización
        else if (status === 'delivered') {
            updates.deliveryEndTime = new Date();
            updates.paymentStatus = 'completed';
        }

        if (notes) {
            updates.deliveryNotes = notes;
        }

        const delivery = await Delivery.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        )
            .populate('order')
            .populate('orderDetails')
            .populate('deliveryPerson', 'name email phone');

        if (!delivery) {
            return res.status(404).json({ message: 'Entrega no encontrada' });
        }

        return res.status(200).json({
            message: 'Estado de entrega actualizado exitosamente',
            delivery
        });
    } catch (error) {
        handleError(error, res);
    }
});

/**
 * Asignar repartidor a la entrega
 */
export const assignDeliveryPerson = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { deliveryPersonId, contact } = req.body;

        const delivery = await Delivery.findByIdAndUpdate(
            id,
            {
                deliveryPerson: deliveryPersonId,
                deliveryPersonContact: contact,
                status: 'accepted'
            },
            { new: true, runValidators: true }
        )
            .populate('order')
            .populate('orderDetails')
            .populate('deliveryPerson', 'name email phone');

        if (!delivery) {
            return res.status(404).json({ message: 'Entrega no encontrada' });
        }

        return res.status(200).json({
            message: 'Repartidor asignado exitosamente',
            delivery
        });
    } catch (error) {
        handleError(error, res);
    }
});

/**
 * Registrar confirmación de entrega
 */
export const confirmDelivery = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { signature, rating, feedback, deliveryNotes } = req.body;

        const updates = {
            status: 'delivered',
            deliveryEndTime: new Date(),
            customerSignature: signature,
            paymentStatus: 'completed'
        };

        if (rating) updates.rating = rating;
        if (feedback) updates.feedback = feedback;
        if (deliveryNotes) updates.deliveryNotes = deliveryNotes;

        const delivery = await Delivery.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        )
            .populate('order')
            .populate('orderDetails')
            .populate('deliveryPerson', 'name email phone');

        if (!delivery) {
            return res.status(404).json({ message: 'Entrega no encontrada' });
        }

        // Actualizar estado de la orden
        await Order.findByIdAndUpdate(delivery.order, { status: 'delivered' });

        return res.status(200).json({
            message: 'Entrega confirmada exitosamente',
            delivery
        });
    } catch (error) {
        handleError(error, res);
    }
});

/**
 * Cancelar entrega
 */
export const cancelDelivery = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const delivery = await Delivery.findByIdAndUpdate(
            id,
            {
                status: 'cancelled',
                cancelledReason: reason
            },
            { new: true, runValidators: true }
        )
            .populate('order')
            .populate('orderDetails')
            .populate('deliveryPerson', 'name email phone');

        if (!delivery) {
            return res.status(404).json({ message: 'Entrega no encontrada' });
        }

        // Actualizar estado de la orden
        await Order.findByIdAndUpdate(delivery.order, { status: 'cancelled' });

        return res.status(200).json({
            message: 'Entrega cancelada exitosamente',
            delivery
        });
    } catch (error) {
        handleError(error, res);
    }
});

/**
 * Obtener entregas por estado
 */
export const getDeliveriesByStatus = asyncHandler(async (req, res) => {
    try {
        const { status } = req.params;

        const validStatuses = [
            'pending_acceptance',
            'accepted',
            'preparing',
            'ready_for_delivery',
            'in_transit',
            'delivered',
            'cancelled',
            'failed_delivery'
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Estado inválido',
                validStatuses 
            });
        }

        const deliveries = await Delivery.find({ status })
            .populate('order')
            .populate('orderDetails')
            .populate('deliveryPerson', 'name email phone');

        return res.status(200).json({
            message: 'Entregas obtenidas exitosamente',
            deliveries
        });
    } catch (error) {
        handleError(error, res);
    }
});

/**
 * Obtener entregas por repartidor
 */
export const getDeliveriesByPerson = asyncHandler(async (req, res) => {
    try {
        const { deliveryPersonId } = req.params;

        const deliveries = await Delivery.find({ deliveryPerson: deliveryPersonId })
            .populate('order')
            .populate('orderDetails')
            .populate('deliveryPerson', 'name email phone');

        return res.status(200).json({
            message: 'Entregas obtenidas exitosamente',
            deliveries
        });
    } catch (error) {
        handleError(error, res);
    }
});

/**
 * Eliminar una entrega
 */
export const deleteDelivery = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const delivery = await Delivery.findByIdAndDelete(id);

        if (!delivery) {
            return res.status(404).json({ message: 'Entrega no encontrada' });
        }

        return res.status(200).json({
            message: 'Entrega eliminada exitosamente',
            delivery
        });
    } catch (error) {
        handleError(error, res);
    }
});
