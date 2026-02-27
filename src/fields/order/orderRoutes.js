import { Router } from 'express';
import {createOrder,getOrders,updateOrder,deleteOrder} from './orderController.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

router.post('/create',validateJWT,
    requireRole('ADMIN_ROLE'), createOrder);
router.get('/', getOrders);
router.put('/update/:id',validateJWT,
    requireRole('ADMIN_ROLE'), updateOrder);
router.delete('/delete/:id',validateJWT,
    requireRole('ADMIN_ROLE'), deleteOrder);

export default router;
