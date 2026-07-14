
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

export const getDishes      = async ()         => axiosAdmin.get("/dish");
export const createDish     = async (data)     => axiosAdmin.post("/dish/create", data);
export const updateDish     = async (id, data) => axiosAdmin.put(`/dish/update/${id}`, data);
export const deleteDish     = async (id)       => axiosAdmin.delete(`/dish/delete/${id}`);

export const getOrderDetails      = async ()         => axiosAdmin.get("/orderDetail");
export const getOrderDetailsByOrder = async (orderId) => axiosAdmin.get(`/orderDetail/order/${orderId}`);
export const createOrderDetail    = async (data)     => axiosAdmin.post("/orderDetail/create", data);
export const updateOrderDetail    = async (id, data) => axiosAdmin.put(`/orderDetail/update/${id}`, data);
export const deleteOrderDetail    = async (id)       => axiosAdmin.delete(`/orderDetail/delete/${id}`);

export const getGeneralStats      = async ()         => axiosAdmin.get("/reports/stats/general");
export const getTopDishes         = async (params)   => axiosAdmin.get("/reports/stats/top-dishes", { params });
export const getPeakHours         = async (params)   => axiosAdmin.get("/reports/stats/peak-hours", { params });
export const getRestaurantStats   = async (restaurantId) => axiosAdmin.get(`/reports/stats/restaurant/${restaurantId}`);
export const getDemandReport      = async (params)   => axiosAdmin.get("/reports/stats/demand", { params });
export const sendGeneralReportPDF = async (email) => axiosAdmin.get(`/reports/send-pdf/general/${encodeURIComponent(email)}`);
export const sendRestaurantReportPDF = async (restaurantId, email) => axiosAdmin.get(`/reports/send-pdf/restaurant/${restaurantId}/${encodeURIComponent(email)}`);
export const sendOwnRestaurantReportPDF = async (email) => axiosAdmin.get(`/reports/send-pdf/my-restaurant/${encodeURIComponent(email)}`);

export const getOrders = async () => {
    return axiosAdmin.get("/order");
};
export const getMyOrders = async () => {
    return axiosAdmin.get("/order/my-orders");
};
export const getOrderById = async (id) => axiosAdmin.get(`/order/${id}`);
export const createOrder = async (data) => axiosAdmin.post("/order/create", data);
export const createOrderWithDetails = async (data) => axiosAdmin.post("/order/create", data);
export const updateOrder = async (id, data) => axiosAdmin.put(`/order/update/${id}`, data);
export const deleteOrder = async (id) => axiosAdmin.delete(`/order/delete/${id}`);

export const getReservations = async () => {
    return axiosAdmin.get("/reservation");
};
export const getMyReservations = async () => axiosAdmin.get("/reservation/my-reservations");
export const createReservation = async (data) => axiosAdmin.post("/reservation/create", data);
export const updateReservation = async (id, data) => axiosAdmin.put(`/reservation/update/${id}`, data);
export const deleteReservation = async (id) => axiosAdmin.delete(`/reservation/delete/${id}`);


export const getEvents = async () => axiosAdmin.get("/event");
export const createEvent = async (data) => axiosAdmin.post("/event/create", data);
export const updateEvent = async (id, data) => axiosAdmin.put(`/event/${id}`, data);
export const deleteEvent = async (id) => axiosAdmin.delete(`/event/${id}`);
export const sendAllEventsPDF = async (email) => axiosAdmin.get(`/event/send-pdf/all/${email}`);
export const sendEventByIdPDF = async (id, email) => axiosAdmin.get(`/event/send-pdf/${id}/${email}`);
export const sendEventsByRestaurantPDF = async (restaurantId, email) => axiosAdmin.get(`/event/send-pdf/restaurant/${restaurantId}/${email}`);


export const getReviewsByRestaurant = async (restaurantId) => axiosAdmin.get(`/review/restaurant/${restaurantId}`);
export const createReview           = async (data)         => axiosAdmin.post("/review/create", data);
export const updateReview           = async (id, data)     => axiosAdmin.put(`/review/update/${id}`, data);
export const deleteReview           = async (id)           => axiosAdmin.delete(`/review/delete/${id}`);

export const getRestaurants = async () => axiosAdmin.get("/restaurant");
export const createRestaurant = async (data) => axiosAdmin.post("/restaurant/create", data);
export const updateRestaurant = async (id, data) => axiosAdmin.put(`/restaurant/update/${id}`, data);
export const deleteRestaurant = async (id) => axiosAdmin.delete(`/restaurant/delete/${id}`);

export const getTables        = async ()         => axiosAdmin.get("/table");
export const createTable      = async (data)     => axiosAdmin.post("/table/create", data);
export const updateTable      = async (id, data) => axiosAdmin.put(`/table/update/${id}`, data);
export const deleteTable      = async (id)       => axiosAdmin.delete(`/table/delete/${id}`);
 

