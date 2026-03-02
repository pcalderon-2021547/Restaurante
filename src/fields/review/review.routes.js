import { Router } from 'express';
import { createReview, getRestaurantReviews , updateReview, deleteReview} from './review.controller.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';

const router = Router();

router.post('/create', validateJWT, createReview);
router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.put('/update/:id', validateJWT, updateReview);
router.delete('/delete/:id', validateJWT, deleteReview);
export default router;