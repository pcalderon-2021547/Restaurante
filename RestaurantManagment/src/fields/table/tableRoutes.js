import { Router } from 'express';
import {createTable,getTables,getTableById,updateTable,deleteTable} from './tableController.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';
import { validateObjectId } from '../../../middlewares/validate-object-id.js';


const router = Router();

/**
 * @swagger
 * /restaurantManagement/v1/table/create:
 *   post:
 *     summary: Crear una nueva mesa
 *     tags: [Table]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [number, capacity]
 *             properties:
 *               number:
 *                 type: integer
 *                 example: 5
 *               capacity:
 *                 type: integer
 *                 example: 4
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved]
 *                 default: available
 *               location:
 *                 type: string
 *                 example: Terraza
 *     responses:
 *       201:
 *         description: Mesa creada exitosamente
 */

/**
 * @swagger
 * /restaurantManagement/v1/table:
 *   get:
 *     summary: Listar todas las mesas
 *     tags: [Table]
 *     responses:
 *       200:
 *         description: Lista de mesas
 */

router.post('/create',validateJWT,
    requireRole('ADMIN_ROLE'), createTable);
router.get('/', getTables);
router.get('/:id',validateObjectId, getTableById);
router.put('/update/:id', validateObjectId,validateJWT,
    requireRole('ADMIN_ROLE'),updateTable);
router.delete('/delete/:id', validateJWT,
    requireRole('ADMIN_ROLE'),validateObjectId,deleteTable);

export default router;
