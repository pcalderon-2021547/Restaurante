import { create } from "zustand";
import { getGeneralStats as getGeneralStatsRequest } from "../../../shared/api";

export const useReportStore = create((set) => ({
    stats: null,
    loading: false,
    error: null,

    getGeneralStats: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getGeneralStatsRequest();
            set({ stats: response.data.stats || null, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener estadísticas.", loading: false });
        }
    },
}));
