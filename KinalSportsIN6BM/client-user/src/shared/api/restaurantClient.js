import axios from "axios";
import { ENDPOINTS } from "../constants/endpoints";
import { useAuthStore } from "../store/authStore";

const restaurantClient = axios.create({
  baseURL: ENDPOINTS.API,
  headers: { "Content-Type": "application/json" },
});

restaurantClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

restaurantClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default restaurantClient;
