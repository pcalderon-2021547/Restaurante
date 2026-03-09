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
<<<<<<< HEAD
=======
import { validateObjectId } from '../../../middlewares/validate-object-id.js';
import { requireRole } from '../../../middlewares/validate_role.js';
>>>>>>> origin/Development



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
<<<<<<< HEAD
=======
    validateObjectId,
>>>>>>> origin/Development
     updateReservation
);
//eliminar
router.delete(
    '/delete/:id',validateJWT,
<<<<<<< HEAD
=======
    validateObjectId,
>>>>>>> origin/Development
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
