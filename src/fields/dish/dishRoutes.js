import {Router} from 'express';
import {createDish,getDishes,updateDish,deleteDish} from './dishController.js';

const router=Router();
router.post('/create',createDish);
router.get('/',getDishes);
router.put('/update/:id',updateDish);
router.delete('/delete/:id',deleteDish);

export default router;
