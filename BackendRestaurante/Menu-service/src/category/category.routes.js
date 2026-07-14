import { Router } from 'express';
import * as categoryController from './category.controller.js';

const router = Router();

router.post('/', categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.patch('/:id/toggle-status', categoryController.toggleCategoryStatus);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
