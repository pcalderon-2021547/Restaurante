import { axiosAuth } from "./api";

export const login = async (data) => {
    return await axiosAuth.post("/auth/login", data);
};

export const register = async (data) => {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    return await axiosAuth.post("/auth/register", data, isFormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined
    );
};

export const verifyEmail = async (token) => {
    return await axiosAuth.post("/auth/verify-email", { token });
};

export const requestPasswordReset = async (data) => {
    return await axiosAuth.post("/auth/forgot-password", data);
};

export const resetPassword = async (data) => {
    return await axiosAuth.post("/auth/reset-password", data);
};

export const resendVerification = async (data) => {
    return await axiosAuth.post("/auth/resend-verification", data);
};

export const getAllUsers = async (page = 1, limit = 10) => {
    return await axiosAuth.get(`/auth/users?page=${page}&limit=${limit}`);
};

// Cambiar solo el rol de un usuario
export const updateUserRole = async (userId, roleName) => {
    return await axiosAuth.put(`/users/${userId}/role`, { roleName });
};

// Editar datos del usuario (nombre, apellido, username, teléfono, foto)
export const updateUserProfile = async (userId, data) => {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    return await axiosAuth.put(`/users/${userId}`, data, isFormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined
    );
};
