import { Router } from 'express';
import {createTable,getTables,getTableById,updateTable,deleteTable} from './tableController.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

router.post('/create',validateJWT,
    requireRole('ADMIN_ROLE'), createTable);
router.get('/', getTables);
router.get('/:id', getTableById);
router.put('/update/:id', validateJWT,
    requireRole('ADMIN_ROLE'),updateTable);
router.delete('/delete/:id', validateJWT,
    requireRole('ADMIN_ROLE'),deleteTable);

export default router;
