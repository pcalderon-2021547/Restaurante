import { useEffect, useMemo, useState } from "react";
import { useReservationStore } from "../../reservation/store/useReservationStore";
import { ReservationModal } from "../../reservation/components/ReservationModal.jsx";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";

export const UserReservationsPage = () => {
    const { reservations, loading, error, getMyReservations } = useReservationStore();
    const [openModal, setOpenModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [status, setStatus] = useState("");

    useEffect(() => {
        getMyReservations();
    }, [getMyReservations]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    const filteredReservations = useMemo(() => {
        return reservations.filter((reservation) => !status || (reservation.status || "Pendiente") === status);
    }, [reservations, status]);

    const statuses = [...new Set(reservations.map((reservation) => reservation.status || "Pendiente"))];

    return (
        <div className="user-page">
            <header className="user-page-hero compact">
                <div>
                    <p className="user-kicker">Mis reservaciones</p>
                    <h1>Reservaciones <em>del usuario</em></h1>
                    <p>Reserva mesas, revisa fechas y mantente al dia con el estado de tus visitas.</p>
                </div>
                <button
                    className="user-primary-btn"
                    onClick={() => {
                        setSelectedReservation(null);
                        setOpenModal(true);
                    }}
                >
                    Nueva reservacion
                </button>
            </header>

            <section className="user-toolbar">
                <label className="user-select">
                    <span>Estado</span>
                    <select value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="">Todos</option>
                        {statuses.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </label>
            </section>

            {loading && reservations.length === 0 ? (
                <Spinner />
            ) : filteredReservations.length === 0 ? (
                <div className="user-empty">
                    <strong>Aun no tienes reservaciones para este filtro</strong>
                    <p>Planifica tu proxima visita y reserva tu mesa.</p>
                </div>
            ) : (
                <div className="user-table">
                    <div className="user-table-head">
                        <span>#</span>
                        <span>Restaurante</span>
                        <span>Mesa</span>
                        <span>Fecha</span>
                        <span>Estado</span>
                        <span>Accion</span>
                    </div>
                    {filteredReservations.map((reservation, index) => (
                        <div key={reservation._id || reservation.id || index} className="user-table-row">
                            <span data-label="#">{index + 1}</span>
                            <strong data-label="Restaurante">{reservation.table?.restaurant?.name || reservation.restaurant || "-"}</strong>
                            <span data-label="Mesa">Mesa {reservation.table?.number || "-"}</span>
                            <span data-label="Fecha">{reservation.date ? new Date(reservation.date).toLocaleDateString("es-GT") : "-"}</span>
                            <span data-label="Estado"><b className="user-status">{reservation.status || "Pendiente"}</b></span>
                            <span data-label="Accion">
                                <button
                                    className="user-secondary-btn"
                                    onClick={() => {
                                        setSelectedReservation(reservation);
                                        setOpenModal(true);
                                    }}
                                >
                                    Ver / editar
                                </button>
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <ReservationModal isOpen={openModal} onClose={() => { setOpenModal(false); setSelectedReservation(null); }} reservation={selectedReservation} />
        </div>
    );
};
