import { useEffect, useState } from "react";
import { useReservationStore } from "../store/useReservationStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";
import { ReservationModal } from "./ReservationModal.jsx";
import { useUIStore } from "../../../shared/components/ui/store/uiStore.js";
import { useAuthStore } from "../../auth/store/authStore.js";

// Helper: extrae el nombre del restaurante de la reservación,
// manejando todos los escenarios de populate del backend.
const getRestaurantName = (reservation) => {
    // Caso 1: table fue populado y tiene restaurant populado con name
    if (reservation.table?.restaurant?.name) return reservation.table.restaurant.name;
    // Caso 2: el campo raíz restaurant fue populado con name
    if (reservation.restaurant?.name) return reservation.restaurant.name;
    // Caso 3: restaurant es un string con el nombre directo
    if (typeof reservation.restaurant === "string" && reservation.restaurant) return reservation.restaurant;
    // No encontrado
    return "—";
};

export const Reservations = () => {
    const { reservations, loading, error, getReservations, deleteReservation } = useReservationStore();
    const [openModal, setOpenModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const { openConfirm } = useUIStore();
    const { user } = useAuthStore();

    useEffect(() => {
        getReservations();
    }, [getReservations]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    if (loading && reservations.length === 0) return <Spinner />;

    const isRestaurantAdmin = user?.role === "ADMIN_RESTAURANT_ROLE";

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                        Panel de administración
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5", lineHeight: 1.2 }}>
                        Gestión de <em style={{ color: "#c9a84c", fontStyle: "italic" }}>Reservaciones</em>
                    </h1>
                    {isRestaurantAdmin && (
                        <p className="text-xs mt-1" style={{ color: "#9a8e74" }}>
                            Mostrando solo las reservaciones de tu restaurante
                        </p>
                    )}
                </div>
                <button
                    onClick={() => {
                        setSelectedReservation(null);
                        setOpenModal(true);
                    }}
                    className="px-5 py-2 rounded-lg text-sm font-medium"
                    style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                >
                    + Nueva Reservación
                </button>
            </div>

            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "12px", overflow: "hidden" }}>
                <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest" style={{ background: "#1c1a16", color: "#5a5040", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                    <span className="col-span-1">#</span>
                    <span className="col-span-2">Cliente</span>
                    <span className="col-span-2">Restaurante</span>
                    <span className="col-span-2">Fecha</span>
                    <span className="col-span-1">Mesa</span>
                    <span className="col-span-2">Estado</span>
                    <span className="col-span-2 text-right">Acciones</span>
                </div>

                {reservations.length === 0 ? (
                    <div className="text-center py-16" style={{ color: "#3a3328" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem" }}>
                            No hay reservaciones registradas aún
                        </p>
                        <p className="text-xs mt-1">Crea la primera para comenzar.</p>
                    </div>
                ) : (
                    reservations.map((reservation, index) => (
                        <div
                            key={reservation._id || reservation.id || index}
                            className="grid grid-cols-12 px-6 py-4 items-center transition-all"
                            style={{ borderBottom: "1px solid rgba(201,168,76,0.07)", color: "#f0e8d5" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#1c1a16")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            <span className="col-span-1 text-xs" style={{ color: "#5a5040" }}>{index + 1}</span>
                            <span className="col-span-2 text-sm" style={{ color: "#c9a84c" }}>{reservation.customerName || "—"}</span>
                            <span className="col-span-2 text-sm" style={{ color: "#9a8e74" }}>{getRestaurantName(reservation)}</span>
                            <span className="col-span-2 text-sm" style={{ color: "#f0e8d5" }}>{reservation.date ? new Date(reservation.date).toLocaleDateString() : "—"}</span>
                            <span className="col-span-1 text-sm" style={{ color: "#f0e8d5" }}>{reservation.table?.number ?? "—"}</span>
                            <span className="col-span-2">
                                <span className="px-2 py-1 rounded text-xs" style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.3)" }}>
                                    {reservation.status || "pending"}
                                </span>
                            </span>
                            <div className="col-span-2 flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedReservation(reservation);
                                        setOpenModal(true);
                                    }}
                                    className="px-3 py-1 rounded text-xs"
                                    style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() =>
                                        openConfirm({
                                            title: "Eliminar reservación",
                                            message: `¿Eliminar la reservación de ${reservation.customerName || "este cliente"}?`,
                                            onConfirm: () => deleteReservation(reservation._id || reservation.id),
                                        })
                                    }
                                    className="px-3 py-1 rounded text-xs"
                                    style={{ background: "rgba(224,90,90,0.1)", color: "#e05a5a", border: "1px solid rgba(224,90,90,0.2)" }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ReservationModal isOpen={openModal} onClose={() => { setOpenModal(false); setSelectedReservation(null); }} reservation={selectedReservation} />
        </div>
    );
};
