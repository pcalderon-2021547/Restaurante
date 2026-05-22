import { Router } from 'express';
import {
    createRestaurant,
    getRestaurants,
    updateRestaurant,
    deleteRestaurant,
    getRestaurantReviews,
    getRestaurantEvents
} from './restaurant.controller.js';

import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';
import { validateObjectId } from '../../../middlewares/validate-object-id.js';
import { attachOwnedRestaurant } from '../../../middlewares/attach_owned_restaurant.js';

const router = Router();

/**
 * @swagger
 * /restaurantManagement/v1/restaurant/create:
 *   post:
 *     summary: Crear un nuevo restaurante
 *     tags: [Restaurant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address, phone, email]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pinulito GT
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *                 example: Zona 2, Guatemala
 *               phone:
 *                 type: string
 *                 example: 5482-5696
 *               email:
 *                 type: string
 *                 format: email
 *               category:
 *                 type: string
 *                 example: Asado
 *               averagePrice:
 *                 type: number
 *                 example: 95
 *               openingHour:
 *                 type: string
 *                 example: 08:00
 *               closingHour:
 *                 type: string
 *                 example: 22:00
 *     responses:
 *       201:
 *         description: Restaurante creado
 */

router.post('/create',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    createRestaurant
);

router.get('/', getRestaurants);
router.get('/:id/reviews', getRestaurantReviews);
router.get('/:id/events', validateJWT, requireRole('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'), attachOwnedRestaurant, getRestaurantEvents);

router.put('/update/:id',
    validateJWT,
    requireRole('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    attachOwnedRestaurant,
    validateObjectId,
    updateRestaurant
);

router.delete('/delete/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    deleteRestaurant
);

export default router;
