import { useState } from "react";
import authClient from "../../../shared/api/authClient.js";
import { useAuthStore } from "../../../shared/store/authStore.js";

const decodeJwtPayload = (token) => {
    try {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload));
    } catch {
        return {};
    }
};

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);

    const handleLogin = async (data) => {
        try {
            setLoading(true);
            setError(null);

            const rawIdentifier = data.emailOrUsername || data.email || data.username || "";
            const normalizedEmail = rawIdentifier.includes("@") ? rawIdentifier : "";

            const response = await authClient.post("/login", {
                email: normalizedEmail || rawIdentifier,
                password: data.password,
            });

            const { token, accessToken, refreshToken, userDetails, user } = response.data;
            const mappedAccessToken = token || accessToken;

            if (!mappedAccessToken) {
                throw new Error(response.data.message || "No se recibió un token válido");
            }

            const decodedPayload = decodeJwtPayload(mappedAccessToken);
            const mappedUser = userDetails || user || {
                id: decodedPayload.sub || null,
                email: (data.emailOrUsername || "").includes("@") ? data.emailOrUsername : null,
                username: (data.emailOrUsername || "").includes("@") ? null : data.emailOrUsername,
                role: decodedPayload.role || "USER_ROLE",
            };

            await login(mappedAccessToken, mappedUser, refreshToken || null);
            return response.data;
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Error al iniciar sesión";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (data) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authClient.post("/register", {
                name: data.name,
                surname: data.surname,
                username: data.username,
                email: data.email,
                password: data.password,
                phone: data.phone,
            });

            return response.data;
        } catch (err) {
            const message = err.response?.data?.message || "Error al registrarse";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (email) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authClient.post("/request-reset", { email });
            return response.data;
        } catch (err) {
            const message = err.response?.data?.message || "Error al enviar el correo";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { handleLogin, handleRegister, handleForgotPassword, loading, error, logout };
};
