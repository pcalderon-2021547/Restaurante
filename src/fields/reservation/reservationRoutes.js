import { Router } from 'express';
import {createReservation,getReservations,getReservationById,updateReservation,cancelReservation,getReservationsByDate, getMyReservations } from './reservationController.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { validateCreateReview, normalizeReviewOwnership } from '../../../middlewares/reservationAndReviewValidator.js';
import { validateObjectId } from '../../../middlewares/validate-object-id.js';



const router = Router();

//crear
router.post(
    '/create', validateJWT,
    validateCreateReview,
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
    normalizeReviewOwnership,validateObjectId,
     updateReservation
);
//eliminar
router.delete(
    '/delete/:id',validateJWT,
    normalizeReviewOwnership,validateObjectId,
    cancelReservation
);


export default router;