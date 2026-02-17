import { Router } from 'express';
import {createOrderDetail,getOrderDetails,updateOrderDetail,deleteOrderDetail} from './orderDetailController.js';

const router = Router();

router.post('/create', createOrderDetail);
router.get('/', getOrderDetails);
router.put('/update/:id', updateOrderDetail);
router.delete('/delete/:id', deleteOrderDetail);

export default router;
