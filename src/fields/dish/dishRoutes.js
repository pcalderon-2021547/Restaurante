    import {Router} from 'express';
    import {createDish,getDishes,updateDish,deleteDish} from './dishController.js';
    import { validateJWT } from '../../../middlewares/validate_jwt.js';
    import { requireRole } from '../../../middlewares/validate_role.js';

    const router=Router();
    router.post('/create',validateJWT,
        requireRole('ADMIN_ROLE'),createDish);
    router.get('/',getDishes);
    router.put('/update/:id',validateJWT,
        requireRole('ADMIN_ROLE'),updateDish);
    router.delete('/delete/:id',validateJWT,
        requireRole('ADMIN_ROLE'),deleteDish);

    export default router;
