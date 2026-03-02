import { Router } from 'express';
import {
    createRestaurant,
    getRestaurants,
    updateRestaurant,
    deleteRestaurant
} from './restaurant.controller.js';

import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

router.post('/create',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    createRestaurant
);

router.get('/', getRestaurants);

router.put('/update/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    updateRestaurant
);

router.delete('/delete/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    deleteRestaurant
);

export default router;