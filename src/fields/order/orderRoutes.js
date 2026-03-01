import { Router } from 'express';
import {
    createOrder,
    getOrders,
    updateOrder,
    deleteOrder
} from './orderController.js';

import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

import {
    validateOrderId,
    validateCreateOrder,
    validateOrderStatus
} from '../../../middlewares/orderValidator.js';

const router = Router();

router.post(
    '/create',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    validateCreateOrder,
    createOrder
);


router.get('/', getOrders);


router.put(
    '/update/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    validateOrderId,
    validateOrderStatus,
    updateOrder
);

router.delete(
    '/delete/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    validateOrderId,
    deleteOrder
);

export default router;