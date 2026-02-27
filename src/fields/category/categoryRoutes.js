import {Router} from 'express';
import {createCategory,getCategories,updateCategory,deleteCategory} from './categoryController.js';

import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router=Router();
router.post('/create', validateJWT,
    requireRole('ADMIN_ROLE'),createCategory);
router.get('/',getCategories);
router.put('/update/:id',validateJWT,
    requireRole('ADMIN_ROLE'),updateCategory);
router.delete('/delete/:id',validateJWT,
    requireRole('ADMIN_ROLE'),deleteCategory);

export default router;
