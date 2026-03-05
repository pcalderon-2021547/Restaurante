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