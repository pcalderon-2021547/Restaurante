import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
    login as loginRequest
} from "../../../shared/api"
import { showError } from "../../../shared/utils/toast";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            expiresAt: null,
            loading: false,
            error: null,
            isLoadingAuth: true,
            isAuthenticated: false,

            checkAuth: () => {
                const token = get().token;
                const role = get().user?.role;
                const isAdmin = role === "ADMIN_ROLE";

                if (token && !isAdmin) {
                    set({
                        user: null,
                        token: null,
                        expiresAt: null,
                        isAuthenticated: false,
                        isLoadingAuth: false,
                        error: "No tienes permisos para acceder como administrador."
                    });
                    return;
                }

                set({
                    isLoadingAuth: false,
                    isAuthenticated: Boolean(token) && isAdmin
                });
            },

            login: async ({ email, password }) => {
                try {
                    set({ loading: true, error: null });
                    const { data } = await loginRequest({ email, password });

                    // El backend del restaurante devuelve { success, token }
                    let role = null;
                    let userId = null;
                    if (data?.token) {
                        try {
                            const payload = JSON.parse(atob(data.token.split(".")[1]));
                            role = payload.role;
                            userId = payload.sub;
                        } catch (_) {}
                    }

                    if (role !== "ADMIN_ROLE") {
                        const message = "No tienes permisos para acceder como administrador";
                        set({
                            user: null,
                            token: null,
                            expiresAt: null,
                            isAuthenticated: false,
                            isLoadingAuth: false,
                            loading: false,
                            error: message
                        });
                        showError(message);
                        return { success: false, error: message };
                    }

                    set({
                        user: { id: userId, email, role },
                        token: data.token,
                        loading: false,
                        isAuthenticated: true,
                        isLoadingAuth: false
                    });

                    return { success: true };

                } catch (err) {
                    console.error("Login error:", err);
                    const message =
                        err.response?.data?.message || "Error de autenticación";
                    set({ error: message, loading: false });
                    showError(message);
                    return { success: false, error: message };
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    expiresAt: null,
                    isAuthenticated: false,
                    isLoadingAuth: false
                });
            }
        }),
        { name: "restaurante-auth-storage" }
    )
);
