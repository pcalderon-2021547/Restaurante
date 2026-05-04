
import { axiosAuth } from "./api";
import { axiosAdmin } from "./api";


export const getProducts    = async ()         => axiosAdmin.get("/product");
export const createProduct  = async (data)     => axiosAdmin.post("/product/create", data);
export const updateProduct  = async (id, data) => axiosAdmin.put(`/product/update/${id}`, data);
export const deleteProduct  = async (id)       => axiosAdmin.delete(`/product/delete/${id}`);


export const getCategories = async () => axiosAdmin.get("/category");
export const createCategory = async (data) => axiosAdmin.post("/category/create", data);
export const updateCategory = async (id, data) => axiosAdmin.put(`/category/update/${id}`, data);
export const deleteCategory = async (id) => axiosAdmin.delete(`/category/delete/${id}`);

export const getMenus       = async ()         => axiosAdmin.get("/menu");
export const createMenu     = async (data)     => axiosAdmin.post("/menu/create", data);
export const updateMenu     = async (id, data) => axiosAdmin.put(`/menu/update/${id}`, data);
export const deleteMenu     = async (id)       => axiosAdmin.delete(`/menu/delete/${id}`);


export const getOrders = async () => {
    return axiosAuth.get("/order");
};

export const getReservations = async () => {
    return axiosAuth.get("/reservation");
};


export const getEvents = async () => axiosAdmin.get("/event");
export const createEvent = async (data) => axiosAdmin.post("/event/create", data);
export const updateEvent = async (id, data) => axiosAdmin.put(`/event/${id}`, data);
export const deleteEvent = async (id) => axiosAdmin.delete(`/event/${id}`);
export const sendAllEventsPDF = async (email) => axiosAdmin.get(`/event/send-pdf/all/${email}`);
export const sendEventByIdPDF = async (id, email) => axiosAdmin.get(`/event/send-pdf/${id}/${email}`);


export const getReviewsByRestaurant = async (restaurantId) => axiosAdmin.get(`/review/restaurant/${restaurantId}`);
export const createReview           = async (data)         => axiosAdmin.post("/review/create", data);
export const updateReview           = async (id, data)     => axiosAdmin.put(`/review/update/${id}`, data);
export const deleteReview           = async (id)           => axiosAdmin.delete(`/review/delete/${id}`);

export const getRestaurants = async () => axiosAdmin.get("/restaurant");
export const createRestaurant = async (data) => axiosAdmin.post("/restaurant/create", data);
export const updateRestaurant = async (id, data) => axiosAdmin.put(`/restaurant/update/${id}`, data);
export const deleteRestaurant = async (id) => axiosAdmin.delete(`/restaurant/delete/${id}`);



