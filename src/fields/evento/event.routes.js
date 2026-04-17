import { Router } from 'express';
import {
    createEvent,
    getEvents,
    getEventsByRestaurant,
    updateEvent,
    deleteEvent,
    sendAllEventsPDF,
    sendEventsByRestaurantPDF,
    sendEventByIdPDF
} from './event.controller.js';

import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

/**
 * @swagger
 * /restaurantManagement/v1/event/create:
 *   post:
 *     summary: Crear un nuevo evento especial en el restaurante
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [restaurant, name, date]
 *             properties:
 *               restaurant:
 *                 type: string
 *               name:
 *                 type: string
 *                 example: Noche Italiana
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-10
 *               startTime:
 *                 type: string
 *                 example: 16:00
 *               endTime:
 *                 type: string
 *                 example: 18:00
 *               maxCapacity:
 *                 type: integer
 *                 example: 30
 *               price:
 *                 type: number
 *                 example: 100
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 */

// ── CRUD ──────────────────────────────────────────────────────────────────────
router.post('/create', validateJWT, createEvent);
router.get('/', validateJWT, getEvents);
router.get('/restaurant/:restaurantId', validateJWT, getEventsByRestaurant);
router.put('/:id', validateJWT, updateEvent);
router.delete('/:id', validateJWT, deleteEvent);

// ── REPORTES PDF (solo ADMIN) ─────────────────────────────────────────────────
/**
 * GET /event/send-pdf/all/:email
 * Envía PDF con TODOS los eventos al correo indicado
 */
router.get('/send-pdf/all/:email', validateJWT, requireRole('ADMIN_ROLE'), sendAllEventsPDF);

/**
 * GET /event/send-pdf/restaurant/:restaurantId/:email
 * Envía PDF con los eventos de UN restaurante específico
 */
router.get('/send-pdf/restaurant/:restaurantId/:email', validateJWT, requireRole('ADMIN_ROLE'), sendEventsByRestaurantPDF);

/**
 * GET /event/send-pdf/:id/:email
 * Envía PDF con el detalle de UN evento específico
 */
router.get('/send-pdf/:id/:email', validateJWT, requireRole('ADMIN_ROLE'), sendEventByIdPDF);

export default router;