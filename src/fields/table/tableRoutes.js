import { Router } from 'express';
import {createTable,getTables,getTableById,updateTable,deleteTable} from './tableController.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';
import { validateObjectId } from '../../../middlewares/validate-object-id.js';


const router = Router();

router.post('/create',validateJWT,
    requireRole('ADMIN_ROLE'), createTable);
router.get('/', getTables);
router.get('/:id',validateObjectId, getTableById);
router.put('/update/:id', validateObjectId,validateJWT,
    requireRole('ADMIN_ROLE'),updateTable);
router.delete('/delete/:id', validateJWT,
    requireRole('ADMIN_ROLE'),validateObjectId,deleteTable);

export default router;
