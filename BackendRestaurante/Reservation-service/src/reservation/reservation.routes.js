import { Router } from 'express';
import * as reservationController from './reservation.controller.js';

const router = Router();

router.post('/', reservationController.createReservation);
router.get('/', reservationController.getReservations);
router.get('/:id', reservationController.getReservationById);
router.patch('/:id/cancel', reservationController.cancelReservation);
router.put('/:id', reservationController.updateReservation);
router.delete('/:id', reservationController.deleteReservation);

export default router;
