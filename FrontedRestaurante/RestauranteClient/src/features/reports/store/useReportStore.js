import { create } from "zustand";
import {
    getDemandReport as getDemandReportRequest,
    getGeneralStats as getGeneralStatsRequest,
    getPeakHours as getPeakHoursRequest,
    getTopDishes as getTopDishesRequest,
    sendGeneralReportPDF as sendGeneralReportPDFRequest,
    sendOwnRestaurantReportPDF as sendOwnRestaurantReportPDFRequest,
    sendRestaurantReportPDF as sendRestaurantReportPDFRequest,
} from "../../../shared/api";

export const useReportStore = create((set) => ({
    stats: null,
    loading: false,
    sendingPdf: false,
    error: null,

    getGeneralStats: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getGeneralStatsRequest();
            set({ stats: response.data.stats || null, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener estadisticas.", loading: false });
        }
    },

    getRestaurantAdminStats: async () => {
        try {
            set({ loading: true, error: null });
            const [topDishesResponse, peakHoursResponse, demandResponse] = await Promise.all([
                getTopDishesRequest({ limit: 5 }),
                getPeakHoursRequest(),
                getDemandReportRequest({}),
            ]);

            set({
                stats: {
                    topDishes: topDishesResponse.data.topDishes || [],
                    horasPico: peakHoursResponse.data.horasPico || [],
                    horaMasConcurrida: peakHoursResponse.data.horaMasConcurrida ?? null,
                    demanda: demandResponse.data.demanda || null,
                },
                loading: false,
            });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener estadisticas del restaurante.", loading: false });
        }
    },

    sendGeneralPdf: async (email) => {
        try {
            set({ sendingPdf: true, error: null });
            const response = await sendGeneralReportPDFRequest(email);
            set({ sendingPdf: false });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Error al enviar PDF general.";
            set({ error: message, sendingPdf: false });
            throw new Error(message);
        }
    },

    sendRestaurantPdf: async (restaurantId, email) => {
        try {
            set({ sendingPdf: true, error: null });
            const response = await sendRestaurantReportPDFRequest(restaurantId, email);
            set({ sendingPdf: false });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Error al enviar PDF del restaurante.";
            set({ error: message, sendingPdf: false });
            throw new Error(message);
        }
    },

    sendOwnRestaurantPdf: async (email) => {
        try {
            set({ sendingPdf: true, error: null });
            const response = await sendOwnRestaurantReportPDFRequest(email);
            set({ sendingPdf: false });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Error al enviar PDF de tu restaurante.";
            set({ error: message, sendingPdf: false });
            throw new Error(message);
        }
    },
}));
