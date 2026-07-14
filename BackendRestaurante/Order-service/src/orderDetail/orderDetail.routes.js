import { Router } from 'express';
import * as orderDetailController from './orderDetail.controller.js';

const router = Router();

router.post('/', orderDetailController.createOrderDetail);
router.get('/', orderDetailController.getOrderDetails);
router.get('/:id', orderDetailController.getOrderDetailById);
router.put('/:id', orderDetailController.updateOrderDetail);
router.delete('/:id', orderDetailController.deleteOrderDetail);

export default router;