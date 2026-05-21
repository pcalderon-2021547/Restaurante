import { Router } from 'express';
import * as deliveryController from './delivery.controller.js';

const router = Router();

router.post('/', deliveryController.createDelivery);
router.get('/', deliveryController.getDeliveries);
router.get('/:id', deliveryController.getDeliveryById);
router.patch('/:id/status', deliveryController.updateDeliveryStatus);
router.patch('/:id/assign', deliveryController.assignDeliveryPerson);
router.patch('/:id/confirm', deliveryController.confirmDelivery);
router.patch('/:id/cancel', deliveryController.cancelDelivery);
router.put('/:id', deliveryController.updateDelivery);
router.delete('/:id', deliveryController.deleteDelivery);

export default router;
