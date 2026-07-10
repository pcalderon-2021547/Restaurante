import mongoose from 'mongoose';
import Review from './review.model.js';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getReviewStats = async (restaurantId) => {
  const match = { status: 'published' };
  if (restaurantId) match.restaurant = new mongoose.Types.ObjectId(restaurantId);

  const stats = await Review.aggregate([
    { $match: match },
    {
      $group: {
        _id: restaurantId ? '$restaurant' : null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
      },
    },
  ]);

  return stats[0] || {
    averageRating: 0,
    totalReviews: 0,
    rating1: 0,
    rating2: 0,
    rating3: 0,
    rating4: 0,
    rating5: 0,
  };
};

export const createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);
    const stats = await getReviewStats(review.restaurant);
    res.status(201).json({ success: true, message: 'Resena creada', review, stats });
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.code === 11000 ? 400 : 500).json({
      success: false,
      message: error.code === 11000 ? 'Ya has calificado este restaurante' : error.message,
    });
  }
};

export const getReviews = async (req, res) => {
  try {
    const filters = {};
    if (req.query.restaurant) filters.restaurant = req.query.restaurant;
    if (req.query.user) filters.user = req.query.user;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.rating) filters.rating = Number(req.query.rating);

    const reviews = await Review.find(filters).sort({ createdAt: -1 });
    res.status(200).json({ success: true, total: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Resena no encontrada' });
    res.status(200).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    if (!isValidId(restaurantId)) {
      return res.status(400).json({ success: false, message: 'ID de restaurante invalido' });
    }

    const status = req.query.status || 'published';
    const reviews = await Review.find({ restaurant: restaurantId, status }).sort({ createdAt: -1 });
    const stats = await getReviewStats(restaurantId);
    res.status(200).json({ success: true, total: reviews.length, stats, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!review) return res.status(404).json({ success: false, message: 'Resena no encontrada' });
    const stats = await getReviewStats(review.restaurant);
    res.status(200).json({ success: true, message: 'Resena actualizada', review, stats });
  } catch (error) {
    res.status(error.name === 'ValidationError' || error.code === 11000 ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const updateReviewStatus = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Resena no encontrada' });
    const stats = await getReviewStats(review.restaurant);
    res.status(200).json({ success: true, message: 'Estado de resena actualizado', review, stats });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const respondToReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        response: {
          message: req.body.message,
          respondedBy: req.body.respondedBy,
          respondedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Resena no encontrada' });
    res.status(200).json({ success: true, message: 'Respuesta registrada', review });
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Resena no encontrada' });
    const stats = await getReviewStats(review.restaurant);
    res.status(200).json({ success: true, message: 'Resena eliminada', stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    if (req.query.restaurant && !isValidId(req.query.restaurant)) {
      return res.status(400).json({ success: false, message: 'ID de restaurante invalido' });
    }
    const stats = await getReviewStats(req.query.restaurant);
    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
