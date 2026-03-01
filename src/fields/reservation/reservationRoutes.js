import { Router } from 'express';
import {createReservation,getReservations,getReservationById,updateReservation,deleteReservation,getReservationsByDate } from './reservationController.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';


const router = Router();

//crear
router.post(
    '/create', validateJWT,
    requireRole('ADMIN_ROLE'),createReservation
);
//listar
router.get(
    '/', getReservations
);
//listar por fecha
router.get(
    '/by-date', getReservationsByDate
);
//listar por Id
router.get(
    '/:id', getReservationById
);
//actualizar
router.put(
    '/update/:id',validateJWT,
    requireRole('ADMIN_ROLE'), updateReservation
);
//eliminar
router.delete(
    '/delete/:id',validateJWT,
    requireRole('ADMIN_ROLE'), deleteReservation
);

export default router;