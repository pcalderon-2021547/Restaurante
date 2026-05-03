import { useState, useEffect } from "react";
import { useReviewStore } from "../store/useReviewStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";
import { ReviewModal } from "./ReviewModal.jsx";
import { useUIStore } from "../../../shared/components/ui/store/uiStore.js";

const StarDisplay = ({ rating }) => (
    <span className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <span
                key={star}
                className="text-sm"
                style={{ color: star <= rating ? "#c9a84c" : "#3a3328" }}
            >
                ★
            </span>
        ))}
    </span>
);

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export const Reviews = () => {
    const { reviews, loading, error, getReviews, deleteReview } = useReviewStore();
    const [openModal, setOpenModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const { openConfirm } = useUIStore();

    useEffect(() => {
        getReviews();
    }, [getReviews]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    if (loading) return <Spinner />;

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                        Panel de administración
                    </p>
                    <h1
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: "2rem",
                            fontWeight: 300,
                            color: "#f0e8d5",
                            lineHeight: 1.2,
                        }}
                    >
                        Gestión de <em style={{ color: "#c9a84c", fontStyle: "italic" }}>Reseñas</em>
                    </h1>
                </div>

                <button
                    onClick={() => {
                        setSelectedReview(null);
                        setOpenModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                >
                    + Nueva Reseña
                </button>
            </div>

            {/* TABLA */}
            <div
                style={{
                    background: "#141210",
                    border: "1px solid rgba(201,168,76,0.15)",
                    borderRadius: "12px",
                    overflow: "hidden",
                }}
            >
                {/* Cabecera tabla */}
                <div
                    className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest"
                    style={{
                        background: "#1c1a16",
                        color: "#5a5040",
                        borderBottom: "1px solid rgba(201,168,76,0.1)",
                    }}
                >
                    <span className="col-span-1">#</span>
                    <span className="col-span-2">Usuario</span>
                    <span className="col-span-2">Calificación</span>
                    <span className="col-span-4">Comentario</span>
                    <span className="col-span-2">Fecha</span>
                    <span className="col-span-1 text-right">Acciones</span>
                </div>

                {/* Filas */}
                {reviews.length === 0 ? (
                    <div className="text-center py-16" style={{ color: "#3a3328" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem" }}>
                            Sin reseñas registradas
                        </p>
                        <p className="text-xs mt-1">Crea la primera para comenzar</p>
                    </div>
                ) : (
                    reviews.map((review, index) => (
                        <div
                            key={review._id}
                            className="grid grid-cols-12 px-6 py-4 items-center transition-all"
                            style={{
                                borderBottom: "1px solid rgba(201,168,76,0.07)",
                                color: "#f0e8d5",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#1c1a16")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            <span className="col-span-1 text-xs" style={{ color: "#5a5040" }}>
                                {index + 1}
                            </span>

                            <span className="col-span-2 text-sm font-medium" style={{ color: "#c9a84c" }}>
                                #{review.user}
                            </span>

                            <span className="col-span-2">
                                <StarDisplay rating={review.rating} />
                            </span>

                            <span
                                className="col-span-4 text-sm truncate pr-4"
                                style={{ color: "#9a8e74" }}
                                title={review.comment}
                            >
                                {review.comment || <em style={{ color: "#3a3328" }}>Sin comentario</em>}
                            </span>

                            <span className="col-span-2 text-xs" style={{ color: "#5a5040" }}>
                                {formatDate(review.createdAt)}
                            </span>

                            <div className="col-span-1 flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedReview(review);
                                        setOpenModal(true);
                                    }}
                                    className="px-3 py-1 rounded text-xs transition"
                                    style={{
                                        background: "rgba(201,168,76,0.1)",
                                        color: "#c9a84c",
                                        border: "1px solid rgba(201,168,76,0.2)",
                                    }}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() =>
                                        openConfirm({
                                            title: "Eliminar reseña",
                                            message: `¿Eliminar la reseña del usuario #${review.user}?`,
                                            onConfirm: () => deleteReview(review._id),
                                        })
                                    }
                                    className="px-3 py-1 rounded text-xs transition"
                                    style={{
                                        background: "rgba(224,90,90,0.1)",
                                        color: "#e05a5a",
                                        border: "1px solid rgba(224,90,90,0.2)",
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ReviewModal
                isOpen={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setSelectedReview(null);
                }}
                review={selectedReview}
            />
        </div>
    );
};
