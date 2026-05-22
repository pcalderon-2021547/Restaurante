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
import { attachOwnedRestaurant } from '../../../middlewares/attach_owned_restaurant.js';

/**
 * @swagger
 * /restaurantManagement/v1/product/create:
 *   post:
 *     summary: Crear nuevo producto
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - stock
 *               - cost
 *             properties:
 *               name:
 *                 type: string
 *               stock:
 *                 type: integer
 *               cost:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Producto creado
 */

/**
 * @swagger
 * /restaurantManagement/v1/product:
 *   get:
 *     summary: Listar todos los productos
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Lista de productos
 */

/**
 * @swagger
 * /restaurantManagement/v1/product/update/{id}:
 *   put:
 *     summary: Actualizar producto
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Producto'
 *     responses:
 *       200:
 *         description: Producto actualizado
 */

/**
 * @swagger
 * /restaurantManagement/v1/product/delete/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto eliminado
 */

/**
 * @swagger
 * /restaurantManagement/v1/product/restock/{id}:
 *   put:
 *     summary: Agregar stock a producto
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stock actualizado
 */

const router = Router();

// Rutas agregadas
router.post('/create', validateJWT, requireRole('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'), attachOwnedRestaurant, validateCreateProduct, createProduct);
router.get('/', validateJWT, requireRole('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'), attachOwnedRestaurant, getProducts);
router.get('/search', validateJWT, requireRole('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'), attachOwnedRestaurant, searchProductByName);   
router.get('/category', validateJWT, requireRole('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'), attachOwnedRestaurant, filterByCategory);      
router.get('/:id', validateJWT, requireRole('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'), attachOwnedRestaurant, getProductById); 
router.put('/toggle/:id', validateJWT, requireRole('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'), attachOwnedRestaurant, toggleProductStatus);       
router.put('/update/:id', validateJWT, requireRole('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'), attachOwnedRestaurant, validateUpdateProduct, updateProduct);
router.delete('/delete/:id', validateJWT, requireRole('ADMIN_ROLE'), deleteProduct);
router.put('/restock/:id', validateJWT, requireRole('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'), attachOwnedRestaurant, validateRestockAmount, restockProduct);

export default router;
