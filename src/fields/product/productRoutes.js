import {Router} from 'express';
import {createProduct,getProducts,updateProduct,deleteProduct} from './productController.js';

const router=Router();
router.post('/create',createProduct);
router.get('/',getProducts);
router.put('/update/:id',updateProduct);
router.delete('/delete/:id',deleteProduct);

export default router;
