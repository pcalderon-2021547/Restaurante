import { Router } from 'express';
import {createReservation,getReservations,getReservationById,updateReservation,deleteReservation} from './reservationController.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

router.post(
    '/create', validateJWT,
    requireRole('ADMIN_ROLE'), createReservation
);
router.get(
    '/', getReservations
);
router.get(
    '/:id', getReservationById
);
router.put(
    '/update/:id',validateJWT,
    requireRole('ADMIN_ROLE'), updateReservation
);
router.delete(
    '/delete/:id',validateJWT,
    requireRole('ADMIN_ROLE'), deleteReservation
);

export default router;
