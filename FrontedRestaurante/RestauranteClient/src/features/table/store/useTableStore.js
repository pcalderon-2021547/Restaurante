import { create } from "zustand";
import {
    getTables as getTablesRequest,
    createTable as createTableRequest,
    updateTable as updateTableRequest,
    deleteTable as deleteTableRequest,
} from "../../../shared/api";

export const useTableStore = create((set, get) => ({
    tables: [],
    loading: false,
    error: null,

    getTables: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getTablesRequest();
            set({ tables: response.data.tables ?? [], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener mesas.", loading: false });
        }
    },

    createTable: async (data) => {
        try {
            set({ loading: true, error: null });
            const response = await createTableRequest(data);
            set({ tables: [response.data.table, ...get().tables], loading: false });
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.message || "Error al crear mesa.";
            set({ error: msg, loading: false });
            return { success: false, message: msg };
        }
    },

    updateTable: async (id, data) => {
        try {
            set({ loading: true, error: null });
            const response = await updateTableRequest(id, data);
            set({
                tables: get().tables.map((t) => (t._id === id ? response.data.table : t)),
                loading: false,
            });
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.message || "Error al actualizar mesa.";
            set({ error: msg, loading: false });
            return { success: false, message: msg };
        }
    },

    deleteTable: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteTableRequest(id);
            set({ tables: get().tables.filter((t) => t._id !== id), loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al eliminar mesa.", loading: false });
        }
    },
}));