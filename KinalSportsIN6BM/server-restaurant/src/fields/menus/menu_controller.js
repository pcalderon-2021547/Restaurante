'use strict';
import Menu from './menu_model.js';
import Restaurant from '../restaurant/restaurant.model.js';
import mongoose from 'mongoose';
import { ensureOwnedRestaurant, forceOwnedRestaurantInBody, getRestaurantFilter } from '../../../helpers/ownership.js';
import { uploadImage, deleteImage, getFullImageUrl } from '../../../helpers/cloudinary.service.js';



const handleMenuError = (res, error, defaultMessage) => {
    if (error?.code === 11000) {
        return res.status(400).json({ success: false, message: 'Ya existe un menú con ese nombre en este restaurante' });
    }
    if (error?.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: 'Datos de menú inválidos', error: error.message });
    }
    return res.status(500).json({ success: false, message: defaultMessage, error: error.message });
};

// Resuelve imageUrl en un objeto menú
const withImageUrl = (menu) => ({
    ...menu.toObject(),
    imageUrl: getFullImageUrl(menu.image),
});

export const createMenu = async (req, res) => {
    try {
        forceOwnedRestaurantInBody(req);

        const { restaurant, type, validFrom, validUntil } = req.body;

        if (!mongoose.Types.ObjectId.isValid(restaurant)) {
            return res.status(400).json({ success: false, message: 'ID de restaurante inválido' });
        }

        const existingRestaurant = await Restaurant.findById(restaurant);
        if (!existingRestaurant) {
            return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
        }

        if (type === 'EVENT') {
            if (!validFrom || !validUntil) {
                return res.status(400).json({ success: false, message: 'Un menú tipo EVENT debe tener fechas válidas' });
            }
            if (new Date(validFrom) >= new Date(validUntil)) {
                return res.status(400).json({ success: false, message: 'La fecha de inicio debe ser menor que la de finalización' });
            }
        }

        // Subir imagen si viene en el request
        if (req.file) {
            req.body.image = await uploadImage(req.file.buffer, `menu_${Date.now()}`);
        }

        const menu = new Menu(req.body);
        await menu.save();

        return res.status(201).json({ success: true, menu: withImageUrl(menu) });
    } catch (error) {
        return handleMenuError(res, error, 'Error al crear el menú');
    }
};

export const getMenus = async (req, res) => {
    try {
        const menus = await Menu.find(getRestaurantFilter(req, { isActive: true }))
            .populate('restaurant')
            .populate({ path: 'dishes', match: { isAvailable: true } });

        return res.status(200).json({
            success: true,
            menus: menus.map(withImageUrl),
        });
    } catch (error) {
        return handleMenuError(res, error, 'Error al obtener menús');
    }
};

export const updateMenu = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID de menú inválido' });
        }

        const existingMenu = await Menu.findById(id);
        if (!existingMenu) {
            return res.status(404).json({ success: false, message: 'Menú no encontrado' });
        }

        const ownership = ensureOwnedRestaurant(req, existingMenu.restaurant, 'menú');
        if (!ownership.allowed) {
            return res.status(ownership.status).json({ success: false, message: ownership.message });
        }

        delete req.body.restaurant;

        // Actualizar imagen si viene nueva
        if (req.file) {
            if (existingMenu.image) await deleteImage(existingMenu.image);
            req.body.image = await uploadImage(req.file.buffer, `menu_${id}_${Date.now()}`);
        }

        const menu = await Menu.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!menu) {
            return res.status(404).json({ success: false, message: 'Menú no encontrado' });
        }

        return res.status(200).json({ success: true, menu: withImageUrl(menu) });
    } catch (error) {
        return handleMenuError(res, error, 'Error al actualizar el menú');
    }
};

export const deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID de menú inválido' });
        }
        const menu = await Menu.findByIdAndDelete(id);
        if (!menu) {
            return res.status(404).json({ success: false, message: 'Menú no encontrado' });
        }

        // Borrar imagen de Cloudinary al eliminar el menú
        if (menu.image) await deleteImage(menu.image);

        return res.status(200).json({ success: true, message: 'Menú eliminado' });
    } catch (error) {
        return handleMenuError(res, error, 'Error al eliminar el menú');
    }
};
