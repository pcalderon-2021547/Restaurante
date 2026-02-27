import { Router } from 'express';
import {createOrderDetail,getOrderDetails,updateOrderDetail,deleteOrderDetail} from './orderDetailController.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

router.post('/create',validateJWT,
    requireRole('ADMIN_ROLE'), createOrderDetail);
router.get('/', getOrderDetails);
router.put('/update/:id', validateJWT,
    requireRole('ADMIN_ROLE'),updateOrderDetail);
router.delete('/delete/:id',validateJWT,
    requireRole('ADMIN_ROLE'), deleteOrderDetail);

export default router;
