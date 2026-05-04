import { useState, useEffect } from "react";
import { useEventStore } from "../store/useEventStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";
import { EventModal } from "./EventModal.jsx";
import { PDFModal } from "./PDFModal.jsx";
import { useUIStore } from "../../../shared/components/ui/store/uiStore.js";

const statusLabel = {
    active:    { label: "Activo",      color: "#c9a84c", bg: "rgba(201,168,76,0.1)",  border: "rgba(201,168,76,0.3)"  },
    finished:  { label: "Finalizado",  color: "#9a8e74", bg: "rgba(154,142,116,0.1)", border: "rgba(154,142,116,0.3)" },
    cancelled: { label: "Cancelado",   color: "#e05a5a", bg: "rgba(224,90,90,0.1)",   border: "rgba(224,90,90,0.3)"   },
};

export const Events = () => {
    const { events, loading, error, getEvents, deleteEvent } = useEventStore();
    const [openModal, setOpenModal]       = useState(false);
    const [openPDFModal, setOpenPDFModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [pdfEvent, setPdfEvent]           = useState(null);
    const { openConfirm } = useUIStore();

    useEffect(() => { getEvents(); }, [getEvents]);
    useEffect(() => { if (error) showError(error); }, [error]);

    if (loading && events.length === 0) return <Spinner />;

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>Panel de administración</p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5" }}>
                        Gestión de <em style={{ color: "#c9a84c" }}>Eventos</em>
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => { setPdfEvent(null); setOpenPDFModal(true); }}
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{ background: "#1c1a16", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.3)" }}>
                        📄 Reporte PDF
                    </button>
                    <button
                        onClick={() => { setSelectedEvent(null); setOpenModal(true); }}
                        className="px-5 py-2 rounded-lg text-sm font-medium"
                        style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>
                        + Nuevo Evento
                    </button>
                </div>
            </div>

            {/* TABLA */}
            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "12px", overflow: "hidden" }}>

                {/* Cabecera */}
                <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest"
                    style={{ background: "#1c1a16", color: "#5a5040", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                    <span className="col-span-1">#</span>
                    <span className="col-span-2">Nombre</span>
                    <span className="col-span-3">Descripción</span>
                    <span className="col-span-2">Fecha</span>
                    <span className="col-span-2">Estado</span>
                    <span className="col-span-2 text-right">Acciones</span>
                </div>

                {/* Filas */}
                {events.length === 0 ? (
                    <div className="text-center py-16" style={{ color: "#3a3328" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem" }}>Sin eventos registrados</p>
                        <p className="text-xs mt-1">Crea el primero para comenzar</p>
                    </div>
                ) : (
                    events.map((ev, index) => {
                        const status = statusLabel[ev.status] || statusLabel.active;
                        return (
                            <div key={ev._id}
                                className="grid grid-cols-12 px-6 py-4 items-center"
                                style={{ borderBottom: "1px solid rgba(201,168,76,0.07)", color: "#f0e8d5" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "#1c1a16"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>

                                <span className="col-span-1 text-xs" style={{ color: "#5a5040" }}>{index + 1}</span>
                                <span className="col-span-2 font-medium text-sm" style={{ color: "#c9a84c" }}>{ev.name}</span>
                                <span className="col-span-3 text-sm truncate pr-4" style={{ color: "#9a8e74" }}>{ev.description || "—"}</span>
                                <span className="col-span-2 text-sm" style={{ color: "#9a8e74" }}>
                                    {ev.date ? new Date(ev.date).toLocaleDateString("es-GT") : "—"}
                                </span>
                                <span className="col-span-2">
                                    <span className="px-2 py-1 rounded text-xs"
                                        style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
                                        {status.label}
                                    </span>
                                </span>
                                <div className="col-span-2 flex justify-end gap-1">
                                    <button
                                        onClick={() => { setPdfEvent(ev); setOpenPDFModal(true); }}
                                        className="px-2 py-1 rounded text-xs"
                                        style={{ background: "rgba(201,168,76,0.05)", color: "#5a5040", border: "1px solid rgba(201,168,76,0.1)" }}>
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => { setSelectedEvent(ev); setOpenModal(true); }}
                                        className="px-2 py-1 rounded text-xs"
                                        style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}>
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => openConfirm({
                                            title: "Eliminar evento",
                                            message: `¿Eliminar "${ev.name}"?`,
                                            onConfirm: () => deleteEvent(ev._id),
                                        })}
                                        className="px-2 py-1 rounded text-xs"
                                        style={{ background: "rgba(224,90,90,0.1)", color: "#e05a5a", border: "1px solid rgba(224,90,90,0.2)" }}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <EventModal
                isOpen={openModal}
                onClose={() => { setOpenModal(false); setSelectedEvent(null); }}
                event={selectedEvent}
            />
            <PDFModal
                isOpen={openPDFModal}
                onClose={() => { setOpenPDFModal(false); setPdfEvent(null); }}
                event={pdfEvent}
            />
        </div>
    );
};