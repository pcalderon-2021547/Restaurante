import { create } from "zustand"
import * as authApi from "../../../shared/api/auth.js"

const getAllUsers = authApi.getAllUsers;
const updateUserRoleRequest = authApi.updateUserRole;

export const useUserManagementStore = create((set, get) => ({
    users: [],
    loading: false,
    error: null,
    filters: {},

    setFilters: (filters) => set({ filters }),

    setUsers: (users) => set({ users }),

    updateUserRole: async (userId, newRole) => {
        set({ loading: true, error: null });
        try {
            if (typeof updateUserRoleRequest !== "function") {
                throw new Error("La función updateUserRole no está disponible");
            }

            const { data: updatedUser } = await updateUserRoleRequest(userId, newRole);

            const users = get().users.map((u) =>
                u.id === updatedUser.id ? { ...u, role: updatedUser.role } : u
            );

            set({ users, loading: false });
            return { success: true, user: updatedUser };
        } catch (err) {
            set({
                error: err.response?.data?.message || err.message || "Error al cambiar rol",
                loading: false,
            });
            return {
                success: false,
                error: err.response?.data?.message || err.message,
            };
        }
    },

    fetchUsers: async (apiFn = getAllUsers, options = {}) => {
        const { force = false } = options;
        const state = get();

        // Si ya hay una petición en curso, ignorar
        if (state.loading) return;

        // Si ya hay usuarios y no se fuerza recarga, ignorar
        if (!force && state.users.length > 0) return;

        set({ loading: true, error: null });

        try {
            const fetcher = typeof apiFn === "function" ? apiFn : getAllUsers;
            const result = await fetcher();

            // Soporta tanto { users: [...] } como un array directo
            const users = Array.isArray(result)
                ? result
                : Array.isArray(result?.users)
                ? result.users
                : Array.isArray(result?.data)
                ? result.data
                : [];

            set({ users, loading: false });
        } catch (err) {
            set({
                error: err.response?.data?.message || err.message || "Error al cargar usuarios",
                loading: false,
            });
        }
    },
}));