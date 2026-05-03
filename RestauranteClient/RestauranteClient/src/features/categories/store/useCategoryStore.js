import { create } from "zustand";
import {
    getCategories as getCategoriesRequest,
    createCategory as createCategoryRequest,
    updateCategory as updateCategoryRequest,
    deleteCategory as deleteCategoryRequest,
} from "../../../shared/api";

export const useCategoryStore = create((set, get) => ({
    categories: [],
    loading: false,
    error: null,

    getCategories: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getCategoriesRequest();
            set({ categories: response.data.categories, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener categorías.", loading: false });
        }
    },

    createCategory: async (data) => {
        try {
            set({ loading: true, error: null });
            const response = await createCategoryRequest(data);
            set({ categories: [response.data.category, ...get().categories], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al crear categoría.", loading: false });
        }
    },

    updateCategory: async (id, data) => {
        try {
            set({ loading: true, error: null });
            const response = await updateCategoryRequest(id, data);
            const updated = response.data.category;
            set({
                categories: get().categories.map((c) => (c._id === id ? updated : c)),
                loading: false,
            });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al actualizar categoría.", loading: false });
        }
    },

    deleteCategory: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteCategoryRequest(id);
            set({ categories: get().categories.filter((c) => c._id !== id), loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al eliminar categoría.", loading: false });
        }
    },
}));