import { create } from "zustand";
import {
    getOrders as getOrdersRequest,
    getMyOrders as getMyOrdersRequest,
    getOrderById as getOrderByIdRequest,
    createOrder as createOrderRequest,
    createOrderWithDetails as createOrderWithDetailsRequest,
    updateOrder as updateOrderRequest,
    deleteOrder as deleteOrderRequest,
} from "../../../shared/api";

export const useOrderStore = create((set, get) => ({
    orders: [],
    loading: false,
    error: null,

    getOrders: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getOrdersRequest();
            set({ orders: response.data.orders || [], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener pedidos.", loading: false });
        }
    },

    getMyOrders: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getMyOrdersRequest();
            set({ orders: response.data.orders || [], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener tus pedidos.", loading: false });
        }
    },

    createOrder: async (data) => {
        try {
            set({ loading: true, error: null });
            const response = await createOrderRequest(data);
            set({ orders: [response.data.order, ...get().orders], loading: false });
            return response.data.order;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al crear pedido.", loading: false });
            throw error;
        }
    },

    createOrderWithDetails: async (data) => {
        try {
            set({ loading: true, error: null });
            const response = await createOrderWithDetailsRequest(data);
            set({ orders: [response.data.order, ...get().orders], loading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al crear pedido.", loading: false });
            throw error;
        }
    },

    getOrderById: async (id) => {
        try {
            set({ loading: true, error: null });
            const response = await getOrderByIdRequest(id);
            set({ loading: false });
            return response.data.order;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener pedido.", loading: false });
            return null;
        }
    },

    updateOrder: async (id, data) => {
        try {
            set({ loading: true, error: null });
            const response = await updateOrderRequest(id, data);
            set({
                orders: get().orders.map((order) => (order._id === id ? response.data.order : order)),
                loading: false,
            });
            return response.data.order;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al actualizar pedido.", loading: false });
            throw error;
        }
    },

    deleteOrder: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteOrderRequest(id);
            set({ orders: get().orders.filter((order) => order._id !== id), loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al eliminar pedido.", loading: false });
        }
    },
}));
