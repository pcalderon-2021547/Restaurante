// Este archivo puede usarse para endpoints adicionales del backend del restaurante
// que requieran autenticación de administrador
import { axiosAuth } from "./api";

export const getProducts = async () => {
    return axiosAuth.get("/product");
};

export const getCategories = async () => {
    return axiosAuth.get("/category");
};

export const getMenus = async () => {
    return axiosAuth.get("/menus");
};

export const getOrders = async () => {
    return axiosAuth.get("/order");
};

export const getReservations = async () => {
    return axiosAuth.get("/reservation");
};

export const getEvents = async () => {
    return axiosAuth.get("/evento");
};

export const getReviews = async () => {
    return axiosAuth.get("/review");
};
