import { useEffect, useMemo, useState } from "react";
import { useEventStore } from "../../events/store/useEventStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";

export const UserEventsPage = () => {
    const { events, loading, error, getEvents } = useEventStore();
    const [query, setQuery] = useState("");
    const [freeOnly, setFreeOnly] = useState(false);

    useEffect(() => {
        getEvents();
    }, [getEvents]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    const activeEvents = useMemo(() => {
        return events
            .filter((event) => event.status === "active")
            .filter((event) => !freeOnly || Number(event.price ?? 0) === 0)
            .filter((event) => {
                const text = `${event.name || ""} ${event.description || ""} ${event.restaurant?.name || event.restaurant || ""}`.toLowerCase();
                return text.includes(query.toLowerCase().trim());
            })
            .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    }, [events, query, freeOnly]);

    return (
        <div className="user-page">
            <header className="user-page-hero compact">
                <div>
                    <p className="user-kicker">Eventos disponibles</p>
                    <h1>Eventos <em>para ti</em></h1>
                    <p>Encuentra experiencias activas por restaurante, fecha y precio.</p>
                </div>
                <div className="user-hero-stat">
                    <strong>{activeEvents.length}</strong>
                    <span>activos</span>
                </div>
            </header>

            <section className="user-toolbar">
                <label className="user-search">
                    <span>Buscar</span>
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Evento o restaurante" />
                </label>
                <label className="user-toggle">
                    <input type="checkbox" checked={freeOnly} onChange={(event) => setFreeOnly(event.target.checked)} />
                    <span>Solo gratis</span>
                </label>
            </section>

            {loading && events.length === 0 ? (
                <Spinner />
            ) : activeEvents.length === 0 ? (
                <div className="user-empty">
                    <strong>No hay eventos activos</strong>
                    <p>Revisa esta seccion nuevamente mas tarde.</p>
                </div>
            ) : (
                <div className="user-card-grid">
                    {activeEvents.map((event) => (
                        <article key={event._id} className="user-event-card">
                            <div className="user-card-topline">
                                <span>{event.date ? new Date(event.date).toLocaleDateString("es-GT") : "Sin fecha"}</span>
                                <b>Q{Number(event.price ?? 0).toFixed(2)}</b>
                            </div>
                            <h2>{event.name}</h2>
                            <p>{event.description || "Descripcion no disponible."}</p>
                            <div className="user-info-list">
                                <span><strong>Restaurante</strong>{event.restaurant?.name || event.restaurant || "No asignado"}</span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};
