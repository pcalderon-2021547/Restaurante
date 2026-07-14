import { create } from "zustand";
import {
    getProducts as getProductsRequest,
    createProduct as createProductRequest,
    updateProduct as updateProductRequest,
    deleteProduct as deleteProductRequest,
} from "../../../shared/api";

export const useProductStore = create((set, get) => ({
    products: [],
    loading: false,
    error: null,

    getProducts: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getProductsRequest();
            set({ products: response.data.products, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener productos.", loading: false });
        }
    },

    createProduct: async (data) => {
        try {
            set({ loading: true, error: null });
            const response = await createProductRequest(data);
            set({ products: [response.data.product, ...get().products], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al crear producto.", loading: false });
        }
    },

    updateProduct: async (id, data) => {
        try {
            set({ loading: true, error: null });
            const response = await updateProductRequest(id, data);
            const updated = response.data.product;
            set({
                products: get().products.map((p) => (p._id === id ? updated : p)),
                loading: false,
            });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al actualizar producto.", loading: false });
        }
    },

    deleteProduct: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteProductRequest(id);
            set({ products: get().products.filter((p) => p._id !== id), loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al eliminar producto.", loading: false });
        }
    },
}));
