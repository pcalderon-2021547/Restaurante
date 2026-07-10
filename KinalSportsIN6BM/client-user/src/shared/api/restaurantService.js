import restaurantClient from "./restaurantClient";

// Restaurants
export const getRestaurants = () => restaurantClient.get("/restaurant/");
export const getRestaurantReviews = (id) => restaurantClient.get(`/restaurant/${id}/reviews`);
export const getRestaurantEvents = (id) => restaurantClient.get(`/restaurant/${id}/events`);
export const createRestaurant = (data) => restaurantClient.post("/restaurant/create", data);
export const updateRestaurant = (id, data) => restaurantClient.put(`/restaurant/update/${id}`, data);
export const deleteRestaurant = (id) => restaurantClient.delete(`/restaurant/delete/${id}`);

// Categories
export const getCategories = () => restaurantClient.get("/category/");
export const createCategory = (data) => restaurantClient.post("/category/create", data);
export const updateCategory = (id, data) => restaurantClient.put(`/category/update/${id}`, data);
export const deleteCategory = (id) => restaurantClient.delete(`/category/delete/${id}`);

// Products
export const getProducts = () => restaurantClient.get("/product/");
export const getProductById = (id) => restaurantClient.get(`/product/${id}`);
export const searchProducts = (name) => restaurantClient.get(`/product/search?name=${name}`);
export const createProduct = (data) => restaurantClient.post("/product/create", data);
export const updateProduct = (id, data) => restaurantClient.put(`/product/update/${id}`, data);
export const toggleProduct = (id) => restaurantClient.put(`/product/toggle/${id}`);
export const deleteProduct = (id) => restaurantClient.delete(`/product/delete/${id}`);
export const restockProduct = (id, amount) => restaurantClient.put(`/product/restock/${id}`, { amount });

// Dishes
export const getDishes = () => restaurantClient.get("/dish/");
export const createDish = (data) => restaurantClient.post("/dish/create", data);
export const updateDish = (id, data) => restaurantClient.put(`/dish/update/${id}`, data);
export const deleteDish = (id) => restaurantClient.delete(`/dish/delete/${id}`);

// Menus
export const getMenus = () => restaurantClient.get("/menu/");
export const createMenu = (data) => restaurantClient.post("/menu/create", data);
export const updateMenu = (id, data) => restaurantClient.put(`/menu/update/${id}`, data);
export const deleteMenu = (id) => restaurantClient.delete(`/menu/delete/${id}`);

// Tables
export const getTables = (restaurantId) =>
  restaurantClient.get(`/table/${restaurantId ? `?restaurant=${restaurantId}` : ""}`);
export const createTable = (data) => restaurantClient.post("/table/create", data);
export const updateTable = (id, data) => restaurantClient.put(`/table/update/${id}`, data);
export const deleteTable = (id) => restaurantClient.delete(`/table/delete/${id}`);

// Orders
export const createOrder = (data) => restaurantClient.post("/order/create", data);
export const getOrders = () => restaurantClient.get("/order/");
export const getMyOrders = () => restaurantClient.get("/order/my-orders");
export const getOrderById = (id) => restaurantClient.get(`/order/${id}`);
export const updateOrder = (id, data) => restaurantClient.put(`/order/update/${id}`, data);
export const deleteOrder = (id) => restaurantClient.delete(`/order/delete/${id}`);

// Reservations
export const createReservation = (data) => restaurantClient.post("/reservation/create", data);
export const getReservations = () => restaurantClient.get("/reservation/");
export const getMyReservations = () => restaurantClient.get("/reservation/my-reservations");
export const getReservationById = (id) => restaurantClient.get(`/reservation/${id}`);
export const updateReservation = (id, data) => restaurantClient.put(`/reservation/update/${id}`, data);
export const cancelReservation = (id) => restaurantClient.delete(`/reservation/delete/${id}`);

// Events
export const getEvents = () => restaurantClient.get("/event/");
export const getEventsByRestaurant = (id) => restaurantClient.get(`/event/restaurant/${id}`);
export const createEvent = (data) => restaurantClient.post("/event/create", data);
export const updateEvent = (id, data) => restaurantClient.put(`/event/${id}`, data);
export const deleteEvent = (id) => restaurantClient.delete(`/event/${id}`);

// Reviews
export const createReview = (data) => restaurantClient.post("/review/create", data);
export const getReviewsByRestaurant = (restaurantId) =>
  restaurantClient.get(`/review/restaurant/${restaurantId}`);
export const updateReview = (id, data) => restaurantClient.put(`/review/update/${id}`, data);
export const deleteReview = (id) => restaurantClient.delete(`/review/delete/${id}`);

// Reports
export const getGeneralStats = () => restaurantClient.get("/reports/stats/general");
export const getTopDishes = (limit = 10) =>
  restaurantClient.get(`/reports/stats/top-dishes?limit=${limit}`);
export const getPeakHours = (restaurantId) =>
  restaurantClient.get(`/reports/stats/peak-hours${restaurantId ? `?restaurantId=${restaurantId}` : ""}`);
export const getRestaurantStats = (id) => restaurantClient.get(`/reports/stats/restaurant/${id}`);
export const getDemandReport = (from, to, restaurantId) => {
  let q = `?from=${from}&to=${to}`;
  if (restaurantId) q += `&restaurantId=${restaurantId}`;
  return restaurantClient.get(`/reports/stats/demand${q}`);
};

// Upload helpers
export const createRestaurantWithImage = (data, imageUri) => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)));
  if (imageUri) {
    fd.append("image", { uri: imageUri, type: "image/jpeg", name: "upload.jpg" });
  }
  return restaurantClient.post("/restaurant/create", fd, { headers: { "Content-Type": "multipart/form-data" } });
};

export const updateRestaurantWithImage = (id, data, imageUri) => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)));
  if (imageUri) {
    fd.append("image", { uri: imageUri, type: "image/jpeg", name: "upload.jpg" });
  }
  return restaurantClient.put(`/restaurant/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
};

export const updateProfileWithImage = (data, imageUri) => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)));
  if (imageUri) {
    fd.append("profilePicture", { uri: imageUri, type: "image/jpeg", name: "upload.jpg" });
  }
  return restaurantClient.put("/auth/profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
};

// Order Details
export const getOrderDetailsByOrder = (orderId) =>
  restaurantClient.get(`/orderDetail/order/${orderId}`);

// Deliveries
export const createDelivery = (data) => restaurantClient.post("/delivery/", data);
export const getDeliveries = () => restaurantClient.get("/delivery/");
export const getDeliveryById = (id) => restaurantClient.get(`/delivery/${id}`);
export const getDeliveriesByStatus = (status) => restaurantClient.get(`/delivery/status/${status}`);
export const getDeliveriesByPerson = (personId) => restaurantClient.get(`/delivery/person/${personId}`);
export const updateDeliveryStatus = (id, status) => restaurantClient.patch(`/delivery/${id}/status`, { status });
export const assignDeliveryPerson = (id, deliveryPersonId) => restaurantClient.patch(`/delivery/${id}/assign`, { deliveryPersonId });
export const confirmDelivery = (id) => restaurantClient.patch(`/delivery/${id}/confirm`);
export const cancelDelivery = (id) => restaurantClient.patch(`/delivery/${id}/cancel`);
export const deleteDelivery = (id) => restaurantClient.delete(`/delivery/${id}`);