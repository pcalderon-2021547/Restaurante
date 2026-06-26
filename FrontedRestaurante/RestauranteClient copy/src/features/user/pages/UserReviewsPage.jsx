import { useEffect, useState } from "react";
import { useReviewStore } from "../../reviews/store/useReviewStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { ReviewModal } from "../../reviews/components/ReviewModal.jsx";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";

export const UserReviewsPage = () => {
    const { reviews, loading, error, getReviews, createReview } = useReviewStore();
    const { restaurants, getRestaurants } = useRestaurantStore();
    const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        getRestaurants();
    }, [getRestaurants]);

    useEffect(() => {
        if (selectedRestaurantId) {
            getReviews(selectedRestaurantId);
        }
    }, [selectedRestaurantId, getReviews]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    const handleRestaurantChange = (event) => {
        setSelectedRestaurantId(event.target.value);
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                        Reseñas de usuario
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5" }}>
                        Reseñas <em style={{ color: "#c9a84c", fontStyle: "italic" }}>para restaurantes</em>
                    </h1>
                </div>
                <button
                    onClick={() => setOpenModal(true)}
                    className="px-5 py-2 rounded-lg text-sm font-medium"
                    style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                >
                    + Nueva reseña
                </button>
            </div>

            <div className="mb-6" style={{ maxWidth: "360px" }}>
                <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: "#5a5040" }}>
                    Selecciona un restaurante
                </label>
                <select
                    value={selectedRestaurantId}
                    onChange={handleRestaurantChange}
                    className="w-full rounded-lg p-3"
                    style={{ background: "#1c1a16", border: "1px solid rgba(201,168,76,0.2)", color: "#f0e8d5" }}
                >
                    <option value="">— Elige un restaurante —</option>
                    {restaurants.filter((r) => r.isActive !== false).map((restaurant) => (
                        <option key={restaurant._id} value={restaurant._id}>
                            {restaurant.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading && reviews.length === 0 ? (
                <Spinner />
            ) : !selectedRestaurantId ? (
                <div className="rounded-xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
                    <p className="text-lg font-semibold" style={{ color: "#f0e8d5" }}>Selecciona un restaurante para ver sus reseñas</p>
                    <p className="text-sm mt-2" style={{ color: "#9a8e74" }}>También puedes crear una reseña para compartir tu experiencia.</p>
                </div>
            ) : reviews.length === 0 ? (
                <div className="rounded-xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
                    <p className="text-lg font-semibold" style={{ color: "#f0e8d5" }}>No hay reseñas aún</p>
                    <p className="text-sm mt-2" style={{ color: "#9a8e74" }}>Sé el primero en opinar sobre este restaurante.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review._id} className="rounded-2xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-semibold" style={{ color: "#c9a84c" }}>
                                    {review.rating} ⭐
                                </span>
                                <span className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                                    {new Date(review.createdAt).toLocaleDateString("es-GT")}
                                </span>
                            </div>
                            <p className="mt-4 text-sm" style={{ color: "#f0e8d5" }}>{review.comment || "Sin comentario"}</p>
                        </div>
                    ))}
                </div>
            )}

            <ReviewModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                review={null}
                restaurants={restaurants.filter((r) => r.isActive !== false)}
                defaultRestaurantId={selectedRestaurantId}
            />
        </div>
    );
};
