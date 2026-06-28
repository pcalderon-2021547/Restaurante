import { Router } from 'express';
import { createMenu, getMenus, updateMenu, deleteMenu } from './menu_controller.js';
import { validateCreateMenu, validateMenuId } from '../../../middlewares/menuValidator.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';
import { attachOwnedRestaurant } from '../../../middlewares/attach_owned_restaurant.js';
import { upload, handleUploadError } from '../../../helpers/file-upload.service.js';

const router = Router();

router.post('/create',
    validateJWT,
    requireRole('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    attachOwnedRestaurant,
    upload.single('image'),
    handleUploadError,
    validateCreateMenu,
    createMenu
);

router.get('/',
    validateJWT,
    requireRole('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    attachOwnedRestaurant,
    getMenus
);

router.put('/update/:id',
    validateJWT,
    requireRole('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    attachOwnedRestaurant,
    upload.single('image'),
    handleUploadError,
    validateMenuId,
    updateMenu
);

router.delete('/delete/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    validateMenuId,
    deleteMenu
);

export default router;
