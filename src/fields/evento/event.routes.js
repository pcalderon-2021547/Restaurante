import { Router } from 'express';
import {
    createEvent,
    getEvents,
    getEventsByRestaurant,
    updateEvent,
    deleteEvent
} from './event.controller.js';

import { validateJWT } from '../../../middlewares/validate_jwt.js';

const router = Router();

router.post('/create',validateJWT, createEvent);
router.get('/', validateJWT,getEvents);
router.get('/restaurant/:restaurantId', validateJWT,getEventsByRestaurant);
router.put('/:id', validateJWT,updateEvent);
router.delete('/:id',validateJWT, deleteEvent);

export default router;