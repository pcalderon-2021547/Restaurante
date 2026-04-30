import { axiosAuth } from "./api";

export const login = async (data) => {
    return await axiosAuth.post("/auth/login", data);
};

export const register = async (data) => {
    return await axiosAuth.post("/auth/register", data);
};

export const verifyEmail = async (token) => {
    return await axiosAuth.post("/auth/verify-email", { token });
};

export const requestPasswordReset = async (data) => {
    return await axiosAuth.post("/auth/request-reset", data);
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
