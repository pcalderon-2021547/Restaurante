import { Router } from 'express';
// se agregaron las nuevas funciones de controller con un mejor formateo
import {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    searchProductByName,
    filterByCategory,
    restockProduct,
    getProductById,
    toggleProductStatus
} from './productController.js';
import { validateCreateProduct, validateUpdateProduct, validateRestockAmount } from '../../../middlewares/productValidator.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

// Rutas agregadas
router.post('/create', validateJWT, requireRole('ADMIN_ROLE'), validateCreateProduct, createProduct);router.get('/', getProducts);
router.get('/search', searchProductByName);   
router.get('/category', filterByCategory);      
router.get('/:id', getProductById); 
router.put('/toggle/:id', validateJWT, requireRole('ADMIN_ROLE'), toggleProductStatus);       
router.put('/update/:id', validateJWT, requireRole('ADMIN_ROLE'), validateUpdateProduct, updateProduct);
router.delete('/delete/:id', validateJWT, requireRole('ADMIN_ROLE'), deleteProduct);
router.put('/restock/:id', validateJWT, requireRole('ADMIN_ROLE'), validateRestockAmount, restockProduct);

export default router;