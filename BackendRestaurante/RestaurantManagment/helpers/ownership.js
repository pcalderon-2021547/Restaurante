'use strict';

export const isAdminRole = (req) => req?.user?.role === 'ADMIN_ROLE';
export const isRestaurantAdminRole = (req) => req?.user?.role === 'ADMIN_RESTAURANT_ROLE';
export const isUserRole = (req) => req?.user?.role === 'USER_ROLE';

export const getRestaurantFilter = (req, baseFilter = {}, field = 'restaurant') => {
    if (isRestaurantAdminRole(req) && req.user.restaurantId) {
        return { ...baseFilter, [field]: req.user.restaurantId };
    }
    return baseFilter;
};

export const forceOwnedRestaurantInBody = (req, field = 'restaurant') => {
    if (isRestaurantAdminRole(req) && req.user.restaurantId && req.body) {
        req.body[field] = req.user.restaurantId;
    }
};

export const normalizeObjectId = (id) => {
    if (id == null) return null;
    if (id._id) return normalizeObjectId(id._id);
    return id.toString ? id.toString() : String(id);
};

export const ensureOwnedRestaurant = (req, resourceRestaurantId, entityName = 'recurso') => {
    if (!isRestaurantAdminRole(req)) {
        return { allowed: true };
    }

    const ownedRestaurantId = normalizeObjectId(req.user.restaurantId);
    const targetRestaurantId = normalizeObjectId(resourceRestaurantId);

    if (!ownedRestaurantId) {
        return {
            allowed: false,
            status: 403,
            message: 'No tienes un restaurante asignado para realizar esta acción'
        };
    }

    if (ownedRestaurantId !== targetRestaurantId) {
        return {
            allowed: false,
            status: 403,
            message: `No tienes permiso para modificar este ${entityName}`
        };
    }

    return { allowed: true };
};

export const denyRestaurantAdminDelete = (req, entityName = 'recurso') => {
    if (!isRestaurantAdminRole(req)) {
        return { allowed: true };
    }

    return {
        allowed: false,
        status: 403,
        message: `El administrador de restaurante no puede eliminar este ${entityName}`
    };
};
