'use strict';

import express from 'express';
import {
    createDelivery,
    getAllDeliveries,
    getDeliveryById,
    updateDelivery,
    updateDeliveryStatus,
    assignDeliveryPerson,
    confirmDelivery,
    cancelDelivery,
    getDeliveriesByStatus,
    getDeliveriesByPerson,
    deleteDelivery
} from './delliveryController.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';
import {
    validateRestaurantIsOpen,
    autoFillRestaurantData,
    validateDeliveryData
} from '../../../middlewares/deliveryValidator.js';
import {
    autoCalculateDeliveryData,
    validateOrderStatus,
    validateOrderUser
} from '../../../middlewares/orderDeliveryValidator.js';

const router = express.Router();

/**
 * @route   POST /api/deliveries
 * @desc    Crear una nueva entrega
 * @access  Private - Admin
 * @middleware 
 *   - validateJWT: Valida que tiene token válido
 *   - requireRole: Valida que es admin
 *   - validateRestaurantIsOpen: Valida que el restaurante está abierto
 *   - autoFillRestaurantData: Auto-llena datos del restaurante
 *   - validateDeliveryData: Valida datos de entrega requeridos
 *   - validateOrderStatus: Valida que la orden puede entregarse
 *   - validateOrderUser: Obtiene usuario de la orden
 *   - autoCalculateDeliveryData: Calcula subtotal, tax, total automáticamente
 */
router.post(
    '/',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    validateRestaurantIsOpen,
    autoFillRestaurantData,
    validateDeliveryData,
    validateOrderStatus,
    validateOrderUser,
    autoCalculateDeliveryData,
    createDelivery
);

/**
 * @route   GET /api/deliveries
 * @desc    Obtener todas las entregas
 * @access  Private - Admin, Usuario
 */
router.get('/', validateJWT, getAllDeliveries);

/**
 * @route   GET /api/deliveries/:id
 * @desc    Obtener una entrega por ID
 * @access  Private - Admin, Usuario
 */
router.get('/:id', validateJWT, getDeliveryById);

/**
 * @route   PUT /api/deliveries/:id
 * @desc    Actualizar una entrega
 * @access  Private - Admin
 */
router.put('/:id', validateJWT, requireRole('ADMIN_ROLE'), updateDelivery);

/**
 * @route   PATCH /api/deliveries/:id/status
 * @desc    Cambiar estado de la entrega
 * @access  Private - Admin
 */
router.patch('/:id/status', validateJWT, requireRole('ADMIN_ROLE'), updateDeliveryStatus);

/**
 * @route   PATCH /api/deliveries/:id/assign
 * @desc    Asignar repartidor a la entrega
 * @access  Private - Admin
 */
router.patch('/:id/assign', validateJWT, requireRole('ADMIN_ROLE'), assignDeliveryPerson);

/**
 * @route   PATCH /api/deliveries/:id/confirm
 * @desc    Registrar confirmación de entrega
 * @access  Private - Usuario
 */
router.patch('/:id/confirm', validateJWT, confirmDelivery);

/**
 * @route   PATCH /api/deliveries/:id/cancel
 * @desc    Cancelar entrega
 * @access  Private - Admin
 */
router.patch('/:id/cancel', validateJWT, requireRole('ADMIN_ROLE'), cancelDelivery);

/**
 * @route   GET /api/deliveries/status/:status
 * @desc    Obtener entregas por estado
 * @access  Private - Admin
 */
router.get('/status/:status', validateJWT, requireRole('ADMIN_ROLE'), getDeliveriesByStatus);

/**
 * @route   GET /api/deliveries/person/:deliveryPersonId
 * @desc    Obtener entregas por repartidor
 * @access  Private - Admin
 */
router.get('/person/:deliveryPersonId', validateJWT, requireRole('ADMIN_ROLE'), getDeliveriesByPerson);

/**
 * @route   DELETE /api/deliveries/:id
 * @desc    Eliminar una entrega
 * @access  Private - Admin
 */
router.delete('/:id', validateJWT, requireRole('ADMIN_ROLE'), deleteDelivery);

export default router;
