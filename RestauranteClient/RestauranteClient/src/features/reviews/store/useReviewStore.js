import { create } from "zustand";
import {
    getReviews as getReviewsRequest,
    createReview as createReviewRequest,
    updateReview as updateReviewRequest,
    deleteReview as deleteReviewRequest,
} from "../../../shared/api";

export const useReviewStore = create((set, get) => ({
    reviews: [],
    loading: false,
    error: null,

    getReviews: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getReviewsRequest();
            set({ reviews: response.data.reviews, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener reseñas.", loading: false });
        }
    },

    createReview: async (data) => {
        try {
            set({ loading: true, error: null });
            const response = await createReviewRequest(data);
            set({ reviews: [response.data.review, ...get().reviews], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al crear reseña.", loading: false });
        }
    },

    updateReview: async (id, data) => {
        try {
            set({ loading: true, error: null });
            const response = await updateReviewRequest(id, data);
            const updated = response.data.review;
            set({
                reviews: get().reviews.map((r) => (r._id === id ? updated : r)),
                loading: false,
            });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al actualizar reseña.", loading: false });
        }
    },

    deleteReview: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteReviewRequest(id);
            set({ reviews: get().reviews.filter((r) => r._id !== id), loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al eliminar reseña.", loading: false });
        }
    },
}));
