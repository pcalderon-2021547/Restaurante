import { Router } from 'express';
import * as productController from './product.controller.js';

const router = Router();

router.post('/', productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.patch('/:id/restock', productController.restockProduct);
router.patch('/:id/consume', productController.consumeStock);
router.patch('/:id/toggle-status', productController.toggleProductStatus);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
