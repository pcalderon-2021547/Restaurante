import { useEffect, useMemo, useState } from "react";
import { useReviewStore } from "../../reviews/store/useReviewStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { ReviewModal } from "../../reviews/components/ReviewModal.jsx";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";

export const UserReviewsPage = () => {
    const { reviews, loading, error, getReviews } = useReviewStore();
    const { restaurants, getRestaurants } = useRestaurantStore();
    const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [minRating, setMinRating] = useState("");

    useEffect(() => {
        getRestaurants();
    }, [getRestaurants]);

    useEffect(() => {
        if (selectedRestaurantId) getReviews(selectedRestaurantId);
    }, [selectedRestaurantId, getReviews]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    const visibleReviews = useMemo(() => {
        return reviews.filter((review) => !minRating || Number(review.rating || 0) >= Number(minRating));
    }, [reviews, minRating]);

    const average = visibleReviews.length
        ? visibleReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / visibleReviews.length
        : 0;

    return (
        <div className="user-page">
            <header className="user-page-hero compact">
                <div>
                    <p className="user-kicker">Resenas de usuario</p>
                    <h1>Resenas <em>para restaurantes</em></h1>
                    <p>Lee opiniones por restaurante y comparte tu experiencia con una calificacion clara.</p>
                </div>
                <button className="user-primary-btn" onClick={() => setOpenModal(true)}>
                    Nueva resena
                </button>
            </header>

            <section className="user-toolbar">
                <label className="user-select wide">
                    <span>Restaurante</span>
                    <select value={selectedRestaurantId} onChange={(event) => setSelectedRestaurantId(event.target.value)}>
                        <option value="">Elige un restaurante</option>
                        {restaurants.filter((item) => item.isActive !== false).map((restaurant) => (
                            <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>
                        ))}
                    </select>
                </label>
                <label className="user-select">
                    <span>Rating minimo</span>
                    <select value={minRating} onChange={(event) => setMinRating(event.target.value)}>
                        <option value="">Todos</option>
                        <option value="5">5 estrellas</option>
                        <option value="4">4+</option>
                        <option value="3">3+</option>
                    </select>
                </label>
                <div className="user-mini-metric">
                    <strong>{average ? average.toFixed(1) : "-"}</strong>
                    <span>promedio</span>
                </div>
            </section>

            {loading && reviews.length === 0 ? (
                <Spinner />
            ) : !selectedRestaurantId ? (
                <div className="user-empty">
                    <strong>Selecciona un restaurante para ver sus resenas</strong>
                    <p>Tambien puedes crear una resena para compartir tu experiencia.</p>
                </div>
            ) : visibleReviews.length === 0 ? (
                <div className="user-empty">
                    <strong>No hay resenas para este filtro</strong>
                    <p>Se el primero en opinar sobre este restaurante.</p>
                </div>
            ) : (
                <div className="user-review-list">
                    {visibleReviews.map((review) => (
                        <article key={review._id} className="user-review-card">
                            <div className="user-card-topline">
                                <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString("es-GT") : "Sin fecha"}</span>
                                <b>{renderStars(review.rating)}</b>
                            </div>
                            <p>{review.comment || "Sin comentario."}</p>
                        </article>
                    ))}
                </div>
            )}

            <ReviewModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                review={null}
                restaurants={restaurants.filter((item) => item.isActive !== false)}
                defaultRestaurantId={selectedRestaurantId}
            />
        </div>
    );
};

const renderStars = (rating) => {
    const value = Math.max(0, Math.min(5, Number(rating || 0)));
    return `${"★".repeat(value)}${"☆".repeat(5 - value)}`;
};
