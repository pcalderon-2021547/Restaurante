import Restaurant from './restaurant.model.js';

export const createRestaurantService = async (data) => {
    const restaurant = new Restaurant(data);
    return await restaurant.save();
};

export const getRestaurantsService = async () => {
    return await Restaurant.find({ isActive: true });
};

export const updateRestaurantService = async (id, data) => {
    return await Restaurant.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    );
};

export const deleteRestaurantService = async (id) => {
    return await Restaurant.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );
};