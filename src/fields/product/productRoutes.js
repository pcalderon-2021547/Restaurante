import {Router} from 'express';
import {createProduct,getProducts,updateProduct,deleteProduct} from './productController.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router=Router();
router.post('/create',validateJWT,
    requireRole('ADMIN_ROLE'),createProduct);
router.get('/',getProducts);
router.put('/update/:id',validateJWT,
    requireRole('ADMIN_ROLE'),updateProduct);
router.delete('/delete/:id',validateJWT,
    requireRole('ADMIN_ROLE'),deleteProduct);

export default router;
