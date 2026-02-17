import { Router } from 'express';
import {createTable,getTables,getTableById,updateTable,deleteTable} from './tableController.js';

const router = Router();

router.post('/create', createTable);
router.get('/', getTables);
router.get('/:id', getTableById);
router.put('/update/:id', updateTable);
router.delete('/delete/:id', deleteTable);

export default router;
