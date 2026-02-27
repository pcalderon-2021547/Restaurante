import {Router} from 'express';
import {createCategory,getCategories,updateCategory,deleteCategory} from './categoryController.js';

const router=Router();
router.post('/create',createCategory);
router.get('/',getCategories);
router.put('/update/:id',updateCategory);
router.delete('/delete/:id',deleteCategory);

export default router;
