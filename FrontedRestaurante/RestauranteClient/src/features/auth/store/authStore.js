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
                const hasRole = Boolean(user?.role);

                if (!token || !hasRole) {
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

            login: async ({ email, emailOrUsername, username, password }) => {
                try {
                    set({ loading: true, error: null });
                    const identifier = (emailOrUsername || email || username || "").trim();

                    const { data } = await loginRequest({
                        emailOrUsername: identifier,
                        password
                    });

                    const token = data.accessToken;
                    const role = data.userDetails?.role || data.userDetails?.rol || data.userDetails?.Role;
                    const userId = data.userDetails?.id ?? data.userDetails?._id ?? data.userDetails?.Id ?? data.userDetails?.userId;
                    const userEmail = data.userDetails?.email || data.userDetails?.Email || (identifier.includes("@") ? identifier : "");
                    const userUsername = data.userDetails?.username || data.userDetails?.Username || (!identifier.includes("@") ? identifier : "");
                    const restaurantId = data.userDetails?.restaurantId ?? data.userDetails?.RestaurantId ?? null;

                    if (!token || !role) {
                        const message = "No se pudo obtener el rol del usuario";

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
                    } catch {
                        // noop: payload inválido
                    }

                    set({
                        user: { id: userId, email: userEmail, username: userUsername, role, restaurantId },
                        token,
                        expiresAt,
                        loading: false,
                        isAuthenticated: true,
                        isLoadingAuth: false
                    });

                    const redirectTo = role === "ADMIN_ROLE" || role === "ADMIN_RESTAURANT_ROLE" ? "/dashboard" : "/user";

                    return { success: true, role, redirectTo };

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
