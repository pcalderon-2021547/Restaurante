import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    getEvents,
    getMenus,
    getMyOrders,
    getMyReservations,
    getRestaurants
} from "../../../shared/api";
import { useAuthStore } from "../../auth/store/authStore";

const readList = (response, keys) => {
    const data = response?.data ?? response;
    for (const key of keys) {
        if (Array.isArray(data?.[key])) return data[key];
        if (Array.isArray(data?.data?.[key])) return data.data[key];
    }
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
};

export const UserHomePage = () => {
    const user = useAuthStore((state) => state.user);
    const [summary, setSummary] = useState({
        restaurants: [],
        menus: [],
        events: [],
        orders: [],
        reservations: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;

        const loadHome = async () => {
            setLoading(true);
            const [restaurantsRes, menusRes, eventsRes, ordersRes, reservationsRes] = await Promise.allSettled([
                getRestaurants(),
                getMenus(),
                getEvents(),
                getMyOrders(),
                getMyReservations()
            ]);

            if (!alive) return;

            setSummary({
                restaurants: readList(restaurantsRes.value, ["restaurants"]).filter((item) => item.isActive !== false),
                menus: readList(menusRes.value, ["menus"]).filter((item) => item.isActive !== false),
                events: readList(eventsRes.value, ["events"]).filter((item) => item.status !== "cancelled"),
                orders: readList(ordersRes.value, ["orders"]),
                reservations: readList(reservationsRes.value, ["reservations"])
            });
            setLoading(false);
        };

        loadHome();
        return () => {
            alive = false;
        };
    }, []);

    const nextEvent = useMemo(() => {
        return [...summary.events]
            .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
            .find((event) => !event.date || new Date(event.date) >= new Date());
    }, [summary.events]);

    const displayName = user?.username || user?.email || "Usuario";

    const cards = [
        {
            title: "Restaurantes",
            value: summary.restaurants.length,
            text: "Opciones activas listas para explorar.",
            to: "/user/restaurants"
        },
        {
            title: "Menus",
            value: summary.menus.length,
            text: "Cartas disponibles para revisar antes de pedir.",
            to: "/user/menus"
        },
        {
            title: "Mis pedidos",
            value: summary.orders.length,
            text: "Historial y seguimiento de tus ordenes.",
            to: "/user/orders"
        },
        {
            title: "Reservaciones",
            value: summary.reservations.length,
            text: "Mesas apartadas con tu cuenta.",
            to: "/user/reservations"
        }
    ];

    return (
        <div className="user-home">
            <section className="user-home-hero">
                <div>
                    <p className="user-home-kicker">Tu espacio</p>
                    <h1>Hola, <span>{displayName}</span></h1>
                    <p>
                        Encuentra restaurantes, revisa menus, crea pedidos y mantente al dia con eventos desde una
                        vista pensada para tus proximos planes.
                    </p>
                </div>
                <Link to="/user/restaurants">Pedir ahora</Link>
            </section>

            <section className="user-home-grid">
                {cards.map((card) => (
                    <Link key={card.title} to={card.to} className="user-home-card">
                        <span>{card.title}</span>
                        <strong>{loading ? "..." : card.value}</strong>
                        <p>{card.text}</p>
                    </Link>
                ))}
            </section>

            <section className="user-home-panels">
                <article className="user-home-panel">
                    <div className="user-home-panel-head">
                        <span>Evento destacado</span>
                        <Link to="/user/events">Ver eventos</Link>
                    </div>
                    {nextEvent ? (
                        <div className="user-home-feature">
                            <strong>{nextEvent.name}</strong>
                            <p>{nextEvent.description || "Evento activo del restaurante."}</p>
                            <small>{nextEvent.date ? new Date(nextEvent.date).toLocaleDateString("es-GT") : "Fecha por confirmar"}</small>
                        </div>
                    ) : (
                        <p className="user-home-empty">No hay eventos activos por ahora.</p>
                    )}
                </article>

                <article className="user-home-panel">
                    <div className="user-home-panel-head">
                        <span>Accesos rapidos</span>
                    </div>
                    <div className="user-home-actions">
                        <Link to="/user/reviews">Escribir resena</Link>
                        <Link to="/user/profile">Ver perfil</Link>
                        <Link to="/user/menus">Explorar menus</Link>
                    </div>
                </article>
            </section>
        </div>
    );
};
