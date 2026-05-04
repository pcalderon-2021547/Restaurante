import { create } from "zustand";
import {
    getEvents as getEventsRequest,
    createEvent as createEventRequest,
    updateEvent as updateEventRequest,
    deleteEvent as deleteEventRequest,
    sendAllEventsPDF as sendAllPDFRequest,
    sendEventByIdPDF as sendEventPDFRequest,
} from "../../../shared/api";

export const useEventStore = create((set, get) => ({
    events: [],
    loading: false,
    pdfLoading: false,
    error: null,

    getEvents: async () => {
        try {
            set({ loading: true, error: null });
            const response = await getEventsRequest();
            set({ events: response.data.events, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al obtener eventos.", loading: false });
        }
    },

    createEvent: async (data) => {
        try {
            set({ loading: true, error: null });
            const response = await createEventRequest(data);
            set({ events: [response.data.event, ...get().events], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al crear evento.", loading: false });
        }
    },

    updateEvent: async (id, data) => {
        try {
            set({ loading: true, error: null });
            const response = await updateEventRequest(id, data);
            set({
                events: get().events.map((e) => (e._id === id ? response.data.event : e)),
                loading: false,
            });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al actualizar evento.", loading: false });
        }
    },

    deleteEvent: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteEventRequest(id);
            set({ events: get().events.filter((e) => e._id !== id), loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al eliminar evento.", loading: false });
        }
    },

    sendAllPDF: async (email) => {
        try {
            set({ pdfLoading: true, error: null });
            await sendAllPDFRequest(email);
            set({ pdfLoading: false });
            return { success: true };
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al enviar PDF.", pdfLoading: false });
            return { success: false };
        }
    },

    sendEventPDF: async (id, email) => {
        try {
            set({ pdfLoading: true, error: null });
            await sendEventPDFRequest(id, email);
            set({ pdfLoading: false });
            return { success: true };
        } catch (error) {
            set({ error: error.response?.data?.message || "Error al enviar PDF.", pdfLoading: false });
            return { success: false };
        }
    },
}));