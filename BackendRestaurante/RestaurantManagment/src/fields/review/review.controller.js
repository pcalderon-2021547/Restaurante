'use strict';

import Review from './review.model.js';
import Restaurant from '../restaurant/restaurant.model.js';

import mongoose from 'mongoose';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const handleError = (res, error, message) => {

    if (error.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Ya has calificado este restaurante'
        });
    }

    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Datos inválidos',
            error: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message,
        error: error.message
    });
};

export const createReview = async (req, res) => {
    try {

        const { restaurant, rating, comment } = req.body;

        if (!restaurant || !rating) {
            return res.status(400).json({
                success: false,
                message: 'restaurant y rating son obligatorios'
            });
        }

        if (!isValidId(restaurant)) {
            return res.status(400).json({
                success: false,
                message: 'ID de restaurante inválido'
            });
        }

        const review = new Review({
            user: req.user.id,   // string directo, sin Number()
            restaurant,
            rating,
            comment
        });

        await review.save();
        await updateRestaurantRating(restaurant);   

        return res.status(201).json({
            success: true,
            message: 'Reseña creada',
            review
        });

    } catch (error) {
        return handleError(res, error, 'Error al crear reseña');
    }
};

export const getRestaurantReviews = async (req, res) => {
    try {

        const { restaurantId } = req.params;

        if (!isValidId(restaurantId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de restaurante inválido'
            });
        }

        const reviews = await Review.find({ restaurant: restaurantId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: reviews.length,
            reviews
        });

    } catch (error) {
        return handleError(res, error, 'Error al obtener reseñas');
    }
};

const updateRestaurantRating = async (restaurantId) => {

    const stats = await Review.aggregate([
        { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId) } },
        {
            $group: {
                _id: '$restaurant',
                average: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await Restaurant.findByIdAndUpdate(restaurantId, {
            averageRating: stats[0].average,
            totalReviews: stats[0].count
        });
    } else {
        await Restaurant.findByIdAndUpdate(restaurantId, {
            averageRating: 0,
            totalReviews: 0
        });
    }
};

export const updateReview = async (req, res) => {
    try {

        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            });
        }

        // comparación string vs string — ahora sí funciona
        if (review.user !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso'
            });
        }

        review.rating = req.body.rating ?? review.rating;
        review.comment = req.body.comment ?? review.comment;

        await review.save();

        await updateRestaurantRating(review.restaurant);

        return res.status(200).json({
            success: true,
            message: 'Reseña actualizada',
            review
        });

    } catch (error) {
        return handleError(res, error, 'Error al actualizar reseña');
    }
};

export const deleteReview = async (req, res) => {
    try {

        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            });
        }

        if (review.user !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso'
            });
        }

        const restaurantId = review.restaurant;

        await review.deleteOne();

        await updateRestaurantRating(restaurantId);

        return res.status(200).json({
            success: true,
            message: 'Reseña eliminada'
        });

    } catch (error) {
        return handleError(res, error, 'Error al eliminar reseña');
    }
};
