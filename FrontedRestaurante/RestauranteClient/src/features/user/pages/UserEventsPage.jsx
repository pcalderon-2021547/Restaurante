import { useEffect } from "react";
import { useEventStore } from "../../events/store/useEventStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";

export const UserEventsPage = () => {
    const { events, loading, error, getEvents } = useEventStore();

    useEffect(() => {
        getEvents();
    }, [getEvents]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    const activeEvents = events.filter((event) => event.status === "active");

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                        Eventos disponibles
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5" }}>
                        Eventos <em style={{ color: "#c9a84c", fontStyle: "italic" }}>para ti</em>
                    </h1>
                </div>
            </div>

            {loading && events.length === 0 ? (
                <Spinner />
            ) : activeEvents.length === 0 ? (
                <div className="rounded-xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
                    <p className="text-lg font-semibold" style={{ color: "#f0e8d5" }}>No hay eventos activos</p>
                    <p className="text-sm mt-2" style={{ color: "#9a8e74" }}>Revisa esta sección nuevamente más tarde.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {activeEvents.map((event) => (
                        <div key={event._id} className="rounded-2xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
                            <h2 className="text-xl font-semibold" style={{ color: "#c9a84c" }}>{event.name}</h2>
                            <p className="text-sm mt-3" style={{ color: "#9a8e74" }}>{event.description || "Descripción no disponible"}</p>
                            <div className="mt-4 text-sm space-y-2" style={{ color: "#f0e8d5" }}>
                                <p><strong>Restaurante:</strong> {event.restaurant?.name || event.restaurant || "—"}</p>
                                <p><strong>Fecha:</strong> {event.date ? new Date(event.date).toLocaleDateString("es-GT") : "—"}</p>
                                <p><strong>Precio:</strong> Q{Number(event.price ?? 0).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
