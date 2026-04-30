    import {Router} from 'express';
    import {createDish,getDishes,updateDish,deleteDish} from './dishController.js';
    import { validateJWT } from '../../../middlewares/validate_jwt.js';
    import { requireRole } from '../../../middlewares/validate_role.js';

    const router=Router();
    /**
 * @swagger
 * /restaurantManagement/v1/dish/create:
 *   post:
 *     summary: Crear un nuevo plato
 *     tags: [Dish]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, category]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pizza Margherita
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 example: 65
 *               category:
 *                 type: string
 *                 example: 65f1c2a4b1234567890abcd1
 *               restaurant:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Plato creado correctamente
 */
    router.post('/create',validateJWT,
        requireRole('ADMIN_ROLE'),createDish);
    router.get('/',getDishes);
    router.put('/update/:id',validateJWT,
        requireRole('ADMIN_ROLE'),updateDish);
    router.delete('/delete/:id',validateJWT,
        requireRole('ADMIN_ROLE'),deleteDish);

    export default router;
