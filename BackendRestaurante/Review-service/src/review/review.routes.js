import { Router } from 'express';
import * as reviewController from './review.controller.js';

const router = Router();

router.post('/', reviewController.createReview);
router.get('/', reviewController.getReviews);
router.get('/stats', reviewController.getStats);
router.get('/restaurant/:restaurantId', reviewController.getRestaurantReviews);
router.get('/:id', reviewController.getReviewById);
router.patch('/:id/status', reviewController.updateReviewStatus);
router.patch('/:id/respond', reviewController.respondToReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

export default router;
