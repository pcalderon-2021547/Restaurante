'use strict';

import User from '../src/fields/user/user.js';
import Restaurant from '../src/fields/restaurant/restaurant.model.js';

const normalizeId = (value) => {
    if (value == null) return null;
    return value.toString ? value.toString() : String(value);
};

const isNumericId = (value) => /^\d+$/.test(normalizeId(value) || '');

export const attachOwnedRestaurant = async (req, res, next) => {
    try {
        if (!req.user) {
            return next();
        }

        if (req.user.role !== 'ADMIN_RESTAURANT_ROLE') {
            return next();
        }

        const user = isNumericId(req.user.id) ? await User.findByPk(req.user.id) : null;
        const assignedRestaurantId = user?.restaurantId
            ? normalizeId(user.restaurantId)
            : normalizeId((await Restaurant.findOne({ ownerId: req.user.id, isActive: true }))?._id);

        if (!user && !assignedRestaurantId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes un restaurante asignado para administrar'
            });
        }

        if (!assignedRestaurantId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes un restaurante asignado para administrar'
            });
        }

        req.user.restaurantId = assignedRestaurantId;

        if (req.body) {
            if (req.body.restaurant && normalizeId(req.body.restaurant) !== req.user.restaurantId) {
                req.body.restaurant = req.user.restaurantId;
            }
            if (req.body.restaurantId && normalizeId(req.body.restaurantId) !== req.user.restaurantId) {
                req.body.restaurantId = req.user.restaurantId;
            }
        }

        if (req.query) {
            if (req.query.restaurant && normalizeId(req.query.restaurant) !== req.user.restaurantId) {
                req.query.restaurant = req.user.restaurantId;
            }
            if (req.query.restaurantId && normalizeId(req.query.restaurantId) !== req.user.restaurantId) {
                req.query.restaurantId = req.user.restaurantId;
            }
        }

        return next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al resolver restaurante asignado',
            error: error.message
        });
    }
};
