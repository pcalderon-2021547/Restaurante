import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as loginRequest } from "../../../shared/api";
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
                const { token, user } = get();
                const isAdmin = user?.role === "ADMIN_ROLE";

                if (!token || !isAdmin) {
                    set({
                        user: null,
                        token: null,
                        expiresAt: null,
                        isAuthenticated: false,
                        isLoadingAuth: false
                    });
                    return;
                }

                set({
                    isAuthenticated: true,
                    isLoadingAuth: false
                });
            },

            login: async ({ email, password }) => {
                try {
                    set({ loading: true, error: null });

                    const { data } = await loginRequest({
                        emailOrUsername: email, // 🔥 IMPORTANTE
                        password
                    });

                    const token = data.accessToken;
                    const role = data.userDetails?.role;
                    const userId = data.userDetails?.id;

                    if (!token || role !== "ADMIN_ROLE") {
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

                    // opcional: calcular expiración
                    let expiresAt = null;
                    try {
                        const payload = JSON.parse(atob(token.split(".")[1]));
                        expiresAt = payload.exp * 1000;
                    } catch (_) {}

                    set({
                        user: { id: userId, email, role },
                        token,
                        expiresAt,
                        loading: false,
                        isAuthenticated: true,
                        isLoadingAuth: false
                    });

                    return { success: true };

                } catch (err) {
                    console.error("Login error:", err);

                    const message =
                        err.response?.data?.message || "Error de autenticación";

                    set({
                        error: message,
                        loading: false
                    });

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
        {
            name: "restaurante-auth-storage"
        }
    )
);