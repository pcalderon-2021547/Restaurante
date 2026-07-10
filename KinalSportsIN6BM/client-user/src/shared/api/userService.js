import restaurantClient from "./restaurantClient";

export const getProfile = () => restaurantClient.get("/auth/profile");

export const updateProfile = (data) => restaurantClient.put("/auth/profile", data);

export const createUser = (data) => restaurantClient.post("/users/create", data);

export const getUsers = (page = 1, limit = 10) =>
  restaurantClient.get(`/users/?page=${page}&limit=${limit}`);

export const updateUser = (id, data) => restaurantClient.put(`/users/${id}`, data);

export const deleteUser = (id) => restaurantClient.delete(`/users/${id}`);