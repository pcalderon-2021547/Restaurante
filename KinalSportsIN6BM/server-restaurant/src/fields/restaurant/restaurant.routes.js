import { Router } from 'express';
import {
    createRestaurant,
    getRestaurants,
    updateRestaurant,
    deleteRestaurant,
    getRestaurantReviews,
    getRestaurantEvents
} from './restaurant.controller.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';
import { validateObjectId } from '../../../middlewares/validate-object-id.js';
import { attachOwnedRestaurant } from '../../../middlewares/attach_owned_restaurant.js';
import { upload, handleUploadError } from '../../../helpers/file-upload.service.js';

const router = Router();

// Crear restaurante — acepta imagen opcional en el campo "image"
router.post('/create',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    upload.single('image'),
    handleUploadError,
    createRestaurant
);

router.get('/', getRestaurants);
router.get('/:id/reviews', getRestaurantReviews);
router.get('/:id/events',
    validateJWT,
    requireRole('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    attachOwnedRestaurant,
    getRestaurantEvents
);

// Actualizar restaurante — acepta imagen opcional
router.put('/update/:id',
    validateJWT,
    requireRole('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    attachOwnedRestaurant,
    validateObjectId,
    upload.single('image'),
    handleUploadError,
    updateRestaurant
);

router.delete('/delete/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    deleteRestaurant
);

export default router;
