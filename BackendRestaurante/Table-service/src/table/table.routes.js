import { Router } from 'express';
import * as tableController from './table.controller.js';

const router = Router();

router.post('/', tableController.createTable);
router.get('/', tableController.getTables);
router.get('/:id', tableController.getTableById);
router.patch('/:id/status', tableController.updateTableStatus);
router.patch('/:id/toggle-active', tableController.toggleTableStatus);
router.put('/:id', tableController.updateTable);
router.delete('/:id', tableController.deleteTable);

export default router;
