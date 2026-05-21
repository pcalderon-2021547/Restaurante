import { create } from "zustand";
import {
    getMenus as getMenusRequest,
    createMenu as createMenuRequest,
    updateMenu as updateMenuRequest,
    deleteMenu as deleteMenuRequest,
} from "../../../shared/api";

export const useMenuStore = create((set, get) => ({
    menus: [],
    loading: false,
    error: null,

    getMenus: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getMenusRequest();
            const data = response.data;
            set({ menus: Array.isArray(data.menus) ? data.menus : [], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener menús.", loading: false });
        }
    },

    createMenu: async (data) => {
        try {
            set({ loading: true, error: null });
            const response = await createMenuRequest(data);
            const newMenu = response.data.menu || response.data;
            set({ menus: [newMenu, ...get().menus], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al crear menú.", loading: false });
        }
    },

    updateMenu: async (id, data) => {
        try {
            set({ loading: true, error: null });
            const response = await updateMenuRequest(id, data);
            const updated = response.data.menu || response.data;
            set({
                menus: get().menus.map((m) => (m._id === id ? updated : m)),
                loading: false,
            });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al actualizar menú.", loading: false });
        }
    },

    deleteMenu: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteMenuRequest(id);
            set({ menus: get().menus.filter((m) => m._id !== id), loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al eliminar menú.", loading: false });
        }
    },
}));
