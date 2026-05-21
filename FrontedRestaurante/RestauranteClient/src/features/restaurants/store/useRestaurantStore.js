import { create } from "zustand";
import {
    getRestaurants as getRestaurantsRequest,
    createRestaurant as createRestaurantRequest,
    updateRestaurant as updateRestaurantRequest,
    deleteRestaurant as deleteRestaurantRequest,
} from "../../../shared/api";

export const useRestaurantStore = create((set, get) => ({
    restaurants: [],
    loading: false,
    error: null,

    getRestaurants: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getRestaurantsRequest();
            const data = response.data;
            set({ restaurants: Array.isArray(data.restaurants) ? data.restaurants : [], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener restaurantes.", loading: false });
        }
    },

    createRestaurant: async (data) => {
        try {
            set({ loading: true, error: null });
            const response = await createRestaurantRequest(data);
            const newRestaurant = response.data.restaurant || response.data;
            set({ restaurants: [newRestaurant, ...get().restaurants], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al crear restaurante.", loading: false });
        }
    },

    updateRestaurant: async (id, data) => {
        try {
            set({ loading: true, error: null });
            const response = await updateRestaurantRequest(id, data);
            set({
                restaurants: get().restaurants.map((r) => (r._id === id ? response.data.restaurant : r)),
                loading: false,
            });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al actualizar restaurante.", loading: false });
        }
    },

    deleteRestaurant: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteRestaurantRequest(id);
            set({ restaurants: get().restaurants.filter((r) => r._id !== id), loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al eliminar restaurante.", loading: false });
        }
    },
}));