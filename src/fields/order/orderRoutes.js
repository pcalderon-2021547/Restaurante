import { Router } from 'express';
import {
    createOrder,
    getOrders,
    updateOrder,
    deleteOrder,
    sendAllOrdersPDF,
    sendOrdersByRestaurantPDF,
    sendOrdersByStatusPDF,
    sendOrderByIdPDF
} from './orderController.js';

import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

import {
    validateOrderId,
    validateCreateOrder,
    validateOrderStatus
} from '../../../middlewares/orderValidator.js';

const router = Router();

/* ===============================
   Crear Orden
=================================*/
router.post(
    '/create',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    validateCreateOrder,
    createOrder
);


router.get('/', getOrders);


router.put(
    '/update/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    validateOrderId,
    validateOrderStatus,
    updateOrder
);

router.delete(
    '/delete/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    validateOrderId,
    deleteOrder
);

// ── REPORTES PDF (solo ADMIN) ─────────────────────────────────────────────────
/**
 * GET /order/send-pdf/all/:email
 * Envía PDF con TODAS las órdenes
 */
router.get('/send-pdf/all/:email', validateJWT, requireRole('ADMIN_ROLE'), sendAllOrdersPDF);

/**
 * GET /order/send-pdf/restaurant/:restaurantId/:email
 * Envía PDF con las órdenes de UN restaurante específico
 */
router.get('/send-pdf/restaurant/:restaurantId/:email', validateJWT, requireRole('ADMIN_ROLE'), sendOrdersByRestaurantPDF);

/**
 * GET /order/send-pdf/status/:status/:email
 * Envía PDF filtrando por estado: pending | preparing | ready | delivered | paid | cancelled
 */
router.get('/send-pdf/status/:status/:email', validateJWT, requireRole('ADMIN_ROLE'), sendOrdersByStatusPDF);

/**
 * GET /order/send-pdf/:id/:email
 * Envía PDF con el detalle de UNA orden específica
 */
router.get('/send-pdf/:id/:email', validateJWT, requireRole('ADMIN_ROLE'), sendOrderByIdPDF);

export default router;
