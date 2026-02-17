import { Router } from 'express';
import {createOrder,getOrders,updateOrder,deleteOrder} from './orderController.js';

const router = Router();

router.post('/create', createOrder);
router.get('/', getOrders);
router.put('/update/:id', updateOrder);
router.delete('/delete/:id', deleteOrder);

export default router;
