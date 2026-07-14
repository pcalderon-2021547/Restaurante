import { Router } from 'express';
import * as dishController from './dish.controller.js';

const router = Router();

router.post('/', dishController.createDish);
router.get('/', dishController.getDishes);
router.get('/:id', dishController.getDishById);
router.patch('/:id/toggle-availability', dishController.toggleDishAvailability);
router.put('/:id', dishController.updateDish);
router.delete('/:id', dishController.deleteDish);

export default router;
