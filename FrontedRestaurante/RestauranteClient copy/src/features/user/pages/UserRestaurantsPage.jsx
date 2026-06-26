import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";

export const UserRestaurantsPage = () => {
    const { restaurants, loading, error, getRestaurants } = useRestaurantStore();

    useEffect(() => {
        getRestaurants();
    }, [getRestaurants]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                        Restaurantes disponibles
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5" }}>
                        Restaurantes <em style={{ color: "#c9a84c", fontStyle: "italic" }}>para ti</em>
                    </h1>
                </div>
            </div>

            {loading && restaurants.length === 0 ? (
                <Spinner />
            ) : restaurants.filter((r) => r.isActive !== false).length === 0 ? (
                <div className="rounded-xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
                    <p className="text-lg font-semibold" style={{ color: "#f0e8d5" }}>No hay restaurantes activos</p>
                    <p className="text-sm mt-2" style={{ color: "#9a8e74" }}>Pronto volverán las mejores opciones.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {restaurants.filter((r) => r.isActive !== false).map((restaurant) => (
                        <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                    ))}
                </div>
            )}
        </div>
    );
};

const RestaurantCard = ({ restaurant }) => {
    const navigate = useNavigate();
    return (
        <div className="rounded-2xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
            <h2 className="text-xl font-semibold" style={{ color: "#c9a84c" }}>{restaurant.name}</h2>
            <p className="text-sm mt-2" style={{ color: "#9a8e74" }}>{restaurant.description || "Sin descripción"}</p>
            <div className="mt-4 text-sm space-y-2" style={{ color: "#f0e8d5" }}>
                <p><strong>Teléfono:</strong> {restaurant.phone || "N/A"}</p>
                <p><strong>Horario:</strong> {restaurant.openingHour || "--"} - {restaurant.closingHour || "--"}</p>
                <p><strong>Dirección:</strong> {restaurant.address || "No registrada"}</p>
            </div>
            <div className="mt-4 flex gap-2">
                <button onClick={() => navigate(`/user/order/create/${restaurant._id}`)} className="px-4 py-2 rounded" style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>Pedir</button>
            </div>
        </div>
    );
};