// Este archivo puede usarse para endpoints adicionales del backend del restaurante
// que requieran autenticación de administrador
import { axiosAuth } from "./api";
import { axiosAdmin } from "./api";


export const getProducts = async () => {
    return axiosAuth.get("/product");
};

export const getCategories = async () => axiosAdmin.get("/category");
export const createCategory = async (data) => axiosAdmin.post("/category/create", data);
export const updateCategory = async (id, data) => axiosAdmin.put(`/category/update/${id}`, data);
export const deleteCategory = async (id) => axiosAdmin.delete(`/category/delete/${id}`);

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

export const getReviews   = async ()        => axiosAdmin.get("/review");
export const createReview = async (data)    => axiosAdmin.post("/review/create", data);
export const updateReview = async (id, data)=> axiosAdmin.put(`/review/update/${id}`, data);
export const deleteReview = async (id)      => axiosAdmin.delete(`/review/delete/${id}`);
