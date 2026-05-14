import { create } from "zustand";
import {
    getOrderDetails as getOrderDetailsRequest,
    createOrderDetail as createOrderDetailRequest,
    updateOrderDetail as updateOrderDetailRequest,
    deleteOrderDetail as deleteOrderDetailRequest,
} from "../../../shared/api";

export const useOrderDetailStore = create((set, get) => ({
    orderDetails: [],
    loading: false,
    error: null,

    getOrderDetails: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getOrderDetailsRequest();
            set({ orderDetails: response.data.details || [], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener detalle de pedidos.", loading: false });
        }
    },

    createOrderDetail: async (data) => {
        try {
            set({ loading: true, error: null });
            const response = await createOrderDetailRequest(data);
            set({ orderDetails: [response.data.detail, ...get().orderDetails], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al crear detalle de pedido.", loading: false });
        }
    },

    updateOrderDetail: async (id, data) => {
        try {
            set({ loading: true, error: null });
            const response = await updateOrderDetailRequest(id, data);
            set({
                orderDetails: get().orderDetails.map((detail) => (detail._id === id ? response.data.detail : detail)),
                loading: false,
            });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al actualizar detalle.", loading: false });
        }
    },

    deleteOrderDetail: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteOrderDetailRequest(id);
            set({ orderDetails: get().orderDetails.filter((detail) => detail._id !== id), loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al eliminar detalle.", loading: false });
        }
    },
}));
