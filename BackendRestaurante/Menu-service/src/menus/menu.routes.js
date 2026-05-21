import { Router } from 'express';
import * as menuController from './menu.controller.js';

const router = Router();

router.post('/', menuController.createMenu);
router.get('/', menuController.getMenus);
router.get('/:id', menuController.getMenuById);
router.patch('/:id/toggle-status', menuController.toggleMenuStatus);
router.put('/:id', menuController.updateMenu);
router.delete('/:id', menuController.deleteMenu);

export default router;
