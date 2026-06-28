import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";

export const UserRestaurantsPage = () => {
    const { restaurants, loading, error, getRestaurants } = useRestaurantStore();
    const [query, setQuery] = useState("");
    const [onlyOpen, setOnlyOpen] = useState(false);

    useEffect(() => { getRestaurants(); }, [getRestaurants]);
    useEffect(() => { if (error) showError(error); }, [error]);

    const activeRestaurants = useMemo(() => {
        const now = new Date();
        const current = now.getHours() * 60 + now.getMinutes();

        return restaurants
            .filter((r) => r.isActive !== false)
            .filter((r) => {
                const text = `${r.name || ""} ${r.description || ""} ${r.address || ""}`.toLowerCase();
                return text.includes(query.toLowerCase().trim());
            })
            .filter((r) => {
                if (!onlyOpen) return true;
                const open = parseHour(r.openingHour);
                const close = parseHour(r.closingHour);
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
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nombre, dirección o descripción" />
                </label>
                <label className="user-toggle">
                    <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} />
                    <span>Abiertos ahora</span>
                </label>
            </section>

            {loading && restaurants.length === 0 ? (
                <Spinner />
            ) : activeRestaurants.length === 0 ? (
                <div className="user-empty">
                    <strong>No hay restaurantes para este filtro</strong>
                    <p>Prueba cambiando la búsqueda o mostrando todos los horarios.</p>
                </div>
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
    const imgSrc = restaurant.imageUrl || restaurant.image || null;

    return (
        <article className="user-restaurant-card" style={{ overflow: "hidden" }}>
            {/* Imagen del restaurante */}
            {imgSrc ? (
                <div style={{ width: "100%", height: "140px", borderRadius: "8px", overflow: "hidden", marginBottom: "12px" }}>
                    <img
                        src={imgSrc}
                        alt={restaurant.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.target.style.display = "none"; }}
                    />
                </div>
            ) : (
                <div style={{
                    width: "100%", height: "80px", borderRadius: "8px", marginBottom: "12px",
                    background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "2rem", opacity: 0.3
                }}>🍽</div>
            )}

            <div className="user-card-topline">
                <span>Restaurante</span>
                <b>{schedule}</b>
            </div>
            <h2>{restaurant.name}</h2>
            <p>{restaurant.description || "Sin descripción disponible."}</p>
            <div className="user-info-list">
                <span><strong>Teléfono</strong>{restaurant.phone || "N/A"}</span>
                <span><strong>Dirección</strong>{restaurant.address || "No registrada"}</span>
            </div>
            <button className="user-primary-btn" onClick={() => navigate(`/user/order/create/${restaurant._id}`)}>
                Pedir ahora
            </button>
        </article>
    );
};

const parseHour = (value) => {
    if (!value || typeof value !== "string") return null;
    const [hours, minutes = "0"] = value.split(":");
    const h = Number(hours), m = Number(minutes);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
};
