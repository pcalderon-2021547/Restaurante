import { Router } from 'express';
import {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    searchProductByName,
    filterByCategory,
    restockProduct,
    getProductById
} from './productController.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

router.post('/create',        validateJWT, requireRole('ADMIN_ROLE'), createProduct);
router.get('/',               getProducts);
router.get('/search',         searchProductByName);   // estática primero
router.get('/category',       filterByCategory);      // estática primero
router.get('/:id',            getProductById);        // dinámica al final
router.put('/update/:id',     validateJWT, requireRole('ADMIN_ROLE'), updateProduct);
router.delete('/delete/:id',  validateJWT, requireRole('ADMIN_ROLE'), deleteProduct);
router.patch('/restock/:id',  validateJWT, requireRole('ADMIN_ROLE'), restockProduct);

export default router;