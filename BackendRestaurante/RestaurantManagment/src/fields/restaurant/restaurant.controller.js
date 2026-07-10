'use strict';
import mongoose from 'mongoose';
import {
    createRestaurantService,
    getRestaurantsService,
    updateRestaurantService,
    deleteRestaurantService
} from './restaurant.service.js';
import Review from '../review/review.model.js';
import Event from '../evento/event.model.js';
import { handleError } from '../../../utils/handle-error.js';
import { ensureOwnedRestaurant } from '../../../helpers/ownership.js';
import { uploadImage, deleteImage, getFullImageUrl } from '../../../helpers/cloudinary.service.js';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createRestaurant = async (req, res) => {
    try {
        let imagePublicId = '';

        if (req.file) {
            imagePublicId = await uploadImage(req.file.path, `restaurant_${Date.now()}`);
        }

        const restaurant = await createRestaurantService({
            ...req.body,
            image: imagePublicId,
        });

        return res.status(201).json({
            success: true,
            restaurant: {
                ...restaurant.toObject(),
                imageUrl: getFullImageUrl(restaurant.image),
            }
        });
    } catch (error) {
        return handleError(res, error, {
            duplicateMessage: 'El restaurante ya existe',
            validationMessage: 'Datos inválidos del restaurante',
            defaultMessage: 'Error al crear restaurante'
        });
    }
};

export const getRestaurants = async (req, res) => {
    try {
        const restaurants = await getRestaurantsService();

        // Añadir imageUrl resuelta a cada restaurante
        const data = restaurants.map((r) => ({
            ...r.toObject(),
            imageUrl: getFullImageUrl(r.image),
        }));

        return res.status(200).json({ success: true, restaurants: data });
    } catch (error) {
        return handleError(res, error, 'Error al obtener restaurantes');
    }
};

export const updateRestaurant = async (req, res) => {
    try {
        const ownership = ensureOwnedRestaurant(req, req.params.id, 'restaurante');
        if (!ownership.allowed) {
            return res.status(ownership.status).json({ success: false, message: ownership.message });
        }

        // Si llega nueva imagen, borrar la anterior y subir la nueva
        if (req.file) {
            const existing = await (await import('./restaurant.model.js')).default.findById(req.params.id);
            if (existing?.image) await deleteImage(existing.image);
            req.body.image = await uploadImage(req.file.path, `restaurant_${req.params.id}_${Date.now()}`);
        }

        const restaurant = await updateRestaurantService(req.params.id, req.body);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
        }

        return res.status(200).json({
            success: true,
            restaurant: {
                ...restaurant.toObject(),
                imageUrl: getFullImageUrl(restaurant.image),
            }
        });
    } catch (error) {
        return handleError(res, error, 'Error al actualizar restaurante');
    }
};

export const getRestaurantReviews = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID de restaurante inválido' });
        const reviews = await Review.find({ restaurant: id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, total: reviews.length, reviews });
    } catch (error) {
        return handleError(res, error, 'Error al obtener reseñas del restaurante');
    }
};

export const getRestaurantEvents = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID de restaurante inválido' });
        const ownership = ensureOwnedRestaurant(req, id, 'restaurante');
        if (!ownership.allowed) return res.status(ownership.status).json({ success: false, message: ownership.message });
        const events = await Event.find({ restaurant: id }).populate('restaurant', 'name').sort({ date: 1 });
        return res.status(200).json({ success: true, total: events.length, events });
    } catch (error) {
        return handleError(res, error, 'Error al obtener eventos del restaurante');
    }
};

export const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await deleteRestaurantService(req.params.id);
        if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
        return res.status(200).json({ success: true, message: 'Restaurante desactivado' });
    } catch (error) {
        return handleError(res, error, 'Error al eliminar restaurante');
    }
};
