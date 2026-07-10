import { Router } from 'express';
import { createReview, getRestaurantReviews , updateReview, deleteReview} from './review.controller.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';

const router = Router();

/**
 * @swagger
 * /restaurantManagement/v1/review/create:
 *   post:
 *     summary: Crear una nueva reseña para un restaurante
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [restaurant, rating]
 *             properties:
 *               restaurant:
 *                 type: string
 *                 example: 69a4e376dacd33b97e04c3cc
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Excelente servicio y comida deliciosa
 *     responses:
 *       201:
 *         description: Reseña creada correctamente
 */

/**
 * @swagger
 * /restaurantManagement/v1/review/restaurant/{restaurantId}:
 *   get:
 *     summary: Obtener todas las reseñas de un restaurante
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de reseñas del restaurante
 */

router.post('/create', validateJWT, createReview);
router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.put('/update/:id', validateJWT, updateReview);
router.delete('/delete/:id', validateJWT, deleteReview);
export default router;