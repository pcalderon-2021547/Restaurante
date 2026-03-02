import { Router } from 'express';
import {createReservation,getReservations,getReservationById,updateReservation,cancelReservation,getReservationsByDate, getMyReservations } from './reservationController.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';



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
    '/:id', getReservationById
);
//actualizar
router.put(
    '/update/:id',validateJWT,
     updateReservation
);
//eliminar
router.delete(
    '/delete/:id',validateJWT,
    cancelReservation
);


export default router;