import { create } from "zustand";
import {
    getReservations as getReservationsRequest,
    getMyReservations as getMyReservationsRequest,
    createReservation as createReservationRequest,
    updateReservation as updateReservationRequest,
    deleteReservation as deleteReservationRequest,
} from "../../../shared/api";

export const useReservationStore = create((set, get) => ({
    reservations: [],
    loading: false,
    error: null,

    getReservations: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getReservationsRequest();
            set({ reservations: response.data.reservations || [], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener reservaciones.", loading: false });
        }
    },

    getMyReservations: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getMyReservationsRequest();
            set({ reservations: response.data.reservations || [], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener tus reservaciones.", loading: false });
        }
    },

    createReservation: async (data) => {
        try {
            set({ loading: true, error: null });
            const response = await createReservationRequest(data);
            set({ reservations: [response.data.reservation, ...get().reservations], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al crear reservación.", loading: false });
        }
    },

    updateReservation: async (id, data) => {
        try {
            set({ loading: true, error: null });
            const response = await updateReservationRequest(id, data);
            set({ reservations: get().reservations.map((reservation) => (reservation._id === id ? response.data.reservation : reservation)), loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al actualizar reservación.", loading: false });
        }
    },

    deleteReservation: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteReservationRequest(id);
            set({ reservations: get().reservations.filter((reservation) => reservation._id !== id), loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al eliminar reservación.", loading: false });
        }
    },
}));
