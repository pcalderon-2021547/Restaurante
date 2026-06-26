import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";

export const UserRestaurantsPage = () => {
    const { restaurants, loading, error, getRestaurants } = useRestaurantStore();
    const [query, setQuery] = useState("");
    const [onlyOpen, setOnlyOpen] = useState(false);

    useEffect(() => {
        getRestaurants();
    }, [getRestaurants]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    const activeRestaurants = useMemo(() => {
        const now = new Date();
        const current = now.getHours() * 60 + now.getMinutes();

        return restaurants
            .filter((restaurant) => restaurant.isActive !== false)
            .filter((restaurant) => {
                const text = `${restaurant.name || ""} ${restaurant.description || ""} ${restaurant.address || ""}`.toLowerCase();
                return text.includes(query.toLowerCase().trim());
            })
            .filter((restaurant) => {
                if (!onlyOpen) return true;
                const open = parseHour(restaurant.openingHour);
                const close = parseHour(restaurant.closingHour);
                if (open === null || close === null) return false;
                return open <= close ? current >= open && current <= close : current >= open || current <= close;
            });
    }, [restaurants, query, onlyOpen]);

    return (
        <div className="user-page">
            <header className="user-page-hero compact">
                <div>
                    <p className="user-kicker">Restaurantes disponibles</p>
                    <h1>Restaurantes <em>para ti</em></h1>
                    <p>Explora opciones activas, revisa horarios y empieza un pedido sin salir de esta vista.</p>
                </div>
                <div className="user-hero-stat">
                    <strong>{activeRestaurants.length}</strong>
                    <span>opciones</span>
                </div>
            </header>

            <section className="user-toolbar">
                <label className="user-search">
                    <span>Buscar</span>
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Nombre, direccion o descripcion"
                    />
                </label>
                <label className="user-toggle">
                    <input
                        type="checkbox"
                        checked={onlyOpen}
                        onChange={(event) => setOnlyOpen(event.target.checked)}
                    />
                    <span>Abiertos ahora</span>
                </label>
            </section>

            {loading && restaurants.length === 0 ? (
                <Spinner />
            ) : activeRestaurants.length === 0 ? (
                <EmptyState title="No hay restaurantes para este filtro" text="Prueba cambiando la busqueda o mostrando todos los horarios." />
            ) : (
                <div className="user-card-grid">
                    {activeRestaurants.map((restaurant) => (
                        <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                    ))}
                </div>
            )}
        </div>
    );
};

const RestaurantCard = ({ restaurant }) => {
    const navigate = useNavigate();
    const schedule = `${restaurant.openingHour || "--"} - ${restaurant.closingHour || "--"}`;

    return (
        <article className="user-restaurant-card">
            <div className="user-card-topline">
                <span>Restaurante</span>
                <b>{schedule}</b>
            </div>
            <h2>{restaurant.name}</h2>
            <p>{restaurant.description || "Sin descripcion disponible."}</p>
            <div className="user-info-list">
                <span><strong>Telefono</strong>{restaurant.phone || "N/A"}</span>
                <span><strong>Direccion</strong>{restaurant.address || "No registrada"}</span>
            </div>
            <button className="user-primary-btn" onClick={() => navigate(`/user/order/create/${restaurant._id}`)}>
                Pedir ahora
            </button>
        </article>
    );
};

const EmptyState = ({ title, text }) => (
    <div className="user-empty">
        <strong>{title}</strong>
        <p>{text}</p>
    </div>
);

const parseHour = (value) => {
    if (!value || typeof value !== "string") return null;
    const [hours, minutes = "0"] = value.split(":");
    const parsedHours = Number(hours);
    const parsedMinutes = Number(minutes);
    if (Number.isNaN(parsedHours) || Number.isNaN(parsedMinutes)) return null;
    return parsedHours * 60 + parsedMinutes;
};
