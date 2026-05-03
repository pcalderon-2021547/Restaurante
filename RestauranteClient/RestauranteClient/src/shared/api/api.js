import axios from "axios";
import { useAuthStore } from "../../features/auth/store/authStore";

const axiosAuth = axios.create({
    baseURL: import.meta.env.VITE_AUTH_URL || "http://localhost:5156/api/v1",
    timeout: 8000,
    headers: {
        "Content-Type": "application/json"
    }
});

const axiosAdmin = axios.create({
    baseURL: import.meta.env.VITE_ADMIN_URL,
    timeout: 8000,
    headers: {
        "Content-Type": "application/json"
    }
});

axiosAuth.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosAdmin.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosAuth.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

axiosAdmin.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export { axiosAuth, axiosAdmin };