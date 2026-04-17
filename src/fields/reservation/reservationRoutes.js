import { Router } from 'express';
import {
    createReservation,
    getReservations,
    getReservationById,
    updateReservation,
    cancelReservation,
    getReservationsByDate,
    getMyReservations,
    sendAllReservationsPDF,
    sendReservationsByDatePDF,
    sendReservationByIdPDF
} from './reservationController.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { validateObjectId } from '../../../middlewares/validate-object-id.js';
import { requireRole } from '../../../middlewares/validate_role.js';

/**
 * @swagger
 * /restaurantManagement/v1/reservation/create:
 *   post:
 *     summary: Crear nueva reservación
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reserva'
 *     responses:
 *       201:
 *         description: Reservación creada
 *       400:
 *         description: Mesa no disponible o datos inválidos
 */

/**
 * @swagger
 * /restaurantManagement/v1/reservation:
 *   get:
 *     summary: Listar todas las reservaciones
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservaciones
 */

/**
 * @swagger
 * /restaurantManagement/v1/reservation/{id}:
 *   get:
 *     summary: Obtener reservación por ID
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservación encontrada
 */

/**
 * @swagger
 * /restaurantManagement/v1/reservation/update/{id}:
 *   put:
 *     summary: Actualizar reservación
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reserva'
 *     responses:
 *       200:
 *         description: Reservación actualizada
 */

/**
 * @swagger
 * /restaurantManagement/v1/reservation/delete/{id}:
 *   delete:
 *     summary: Cancelar reservación
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservación cancelada
 */

/**
 * @swagger
 * /restaurantManagement/v1/reservation/by-date:
 *   get:
 *     summary: Obtener reservaciones por fecha
 *     tags: [Reservation]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Reservaciones del día
 */

const router = Router();

//crear
router.post(
    '/create', validateJWT,
    createReservation
);
//listar
router.get(
    '/', getReservations
);
router.get('/my-reservations', validateJWT, getMyReservations);

//listar por fecha
router.get(
    '/by-date', getReservationsByDate
);
//listar por Id
router.get(
    '/:id', validateObjectId,getReservationById
);
//actualizar
router.put(
    '/update/:id',validateJWT,
    validateObjectId,
     updateReservation
);
//eliminar
router.delete(
    '/delete/:id',validateJWT,
    validateObjectId,
    cancelReservation
);


// ── REPORTES PDF (solo ADMIN) ─────────────────────────────────────────────────
/**
 * GET /reservation/send-pdf/all/:email
 * Envía PDF con TODAS las reservaciones
 */
router.get('/send-pdf/all/:email', validateJWT, requireRole('ADMIN_ROLE'), sendAllReservationsPDF);

/**
 * GET /reservation/send-pdf/by-date/:date/:email
 * Envía PDF con reservaciones de un día específico (formato: YYYY-MM-DD)
 */
router.get('/send-pdf/by-date/:date/:email', validateJWT, requireRole('ADMIN_ROLE'), sendReservationsByDatePDF);

/**
 * GET /reservation/send-pdf/:id/:email
 * Envía PDF con el detalle de UNA reservación específica
 */
router.get('/send-pdf/:id/:email', validateJWT, requireRole('ADMIN_ROLE'), sendReservationByIdPDF);

export default router;