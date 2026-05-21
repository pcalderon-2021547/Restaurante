import { create } from "zustand";
import {
    getDishes as getDishesRequest,
    createDish as createDishRequest,
    updateDish as updateDishRequest,
    deleteDish as deleteDishRequest,
} from "../../../shared/api";

export const useDishStore = create((set, get) => ({
    dishes: [],
    loading: false,
    error: null,

    getDishes: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getDishesRequest();
            set({ dishes: response.data.dishes || [], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener platos.", loading: false });
        }
    },

    createDish: async (data) => {
        try {
            set({ loading: true, error: null });
            const response = await createDishRequest(data);
            set({ dishes: [response.data.dish, ...get().dishes], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al crear plato.", loading: false });
        }
    },

    updateDish: async (id, data) => {
        try {
            set({ loading: true, error: null });
            const response = await updateDishRequest(id, data);
            set({
                dishes: get().dishes.map((dish) => (dish._id === id ? response.data.dish : dish)),
                loading: false,
            });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al actualizar plato.", loading: false });
        }
    },

    deleteDish: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteDishRequest(id);
            set({ dishes: get().dishes.filter((dish) => dish._id !== id), loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al eliminar plato.", loading: false });
        }
    },
}));
