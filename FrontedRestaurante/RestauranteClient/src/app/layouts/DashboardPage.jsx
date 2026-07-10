import { useEffect, useMemo, useState } from "react";
import { DashboardContainer } from "../../shared/components/layout/DashboardContainer";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
    getCategories,
    getDishes,
    getEvents,
    getMenus,
    getOrderDetails,
    getOrders,
    getProducts,
    getReservations,
    getRestaurants,
    getTables
} from "../../shared/api";
import { getAllUsers } from "../../shared/api/auth";
import "../../styles/dashboard.css";

const emptyStats = {
    users: 0,
    restaurants: 0,
    products: 0,
    categories: 0,
    menus: 0,
    dishes: 0,
    orders: 0,
    orderDetails: 0,
    reservations: 0,
    events: 0,
    tables: 0
};

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

const settledValue = (result) => result.status === "fulfilled" ? result.value : null;

const DashboardHomeContent = () => {
    const [stats, setStats] = useState(emptyStats);
    const [recentOrders, setRecentOrders] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let alive = true;

        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const results = await Promise.allSettled([
                    getAllUsers(),
                    getRestaurants(),
                    getProducts(),
                    getCategories(),
                    getMenus(),
                    getDishes(),
                    getOrders(),
                    getOrderDetails(),
                    getReservations(),
                    getEvents(),
                    getTables()
                ]);

                if (!alive) return;

                const [
                    usersRes,
                    restaurantsRes,
                    productsRes,
                    categoriesRes,
                    menusRes,
                    dishesRes,
                    ordersRes,
                    orderDetailsRes,
                    reservationsRes,
                    eventsRes,
                    tablesRes
                ] = results.map(settledValue);

                const users = readList(usersRes, ["data", "users"]);
                const restaurants = readList(restaurantsRes, ["restaurants"]);
                const products = readList(productsRes, ["products"]);
                const categories = readList(categoriesRes, ["categories"]);
                const menus = readList(menusRes, ["menus"]);
                const dishes = readList(dishesRes, ["dishes"]);
                const orders = readList(ordersRes, ["orders"]);
                const details = readList(orderDetailsRes, ["details", "orderDetails"]);
                const reservations = readList(reservationsRes, ["reservations"]);
                const loadedEvents = readList(eventsRes, ["events"]);
                const tables = readList(tablesRes, ["tables"]);

                setStats({
                    users: users.length,
                    restaurants: restaurants.length,
                    products: products.length,
                    categories: categories.length,
                    menus: menus.length,
                    dishes: dishes.length,
                    orders: orders.length,
                    orderDetails: details.length,
                    reservations: reservations.length,
                    events: loadedEvents.length,
                    tables: tables.length
                });
                setRecentOrders(orders.slice(0, 5));
                setEvents(loadedEvents.slice(0, 4));
                if (results.some((result) => result.status === "rejected")) {
                    setError("Algunas metricas no respondieron, se muestran los datos disponibles.");
                }
            } catch (err) {
                if (alive) {
                    setError(err.response?.data?.message || "No se pudieron cargar las metricas del dashboard.");
                }
            } finally {
                if (alive) setLoading(false);
            }
        };

        loadDashboard();
        return () => {
            alive = false;
        };
    }, []);

    const revenue = useMemo(
        () => recentOrders.reduce((total, order) => total + Number(order.total || 0), 0),
        [recentOrders]
    );

    const mainStats = [
        { label: "Restaurantes", value: stats.restaurants, to: "/dashboard/restaurants" },
        { label: "Pedidos", value: stats.orders, to: "/dashboard/orders" },
        { label: "Productos", value: stats.products, to: "/dashboard/products" },
        { label: "Usuarios", value: stats.users, to: "/dashboard/users" }
    ];

    const entityStats = [
        ["Categorias", stats.categories],
        ["Menus", stats.menus],
        ["Platos", stats.dishes],
        ["Reservaciones", stats.reservations],
        ["Eventos", stats.events],
        ["Mesas", stats.tables],
        ["Detalles", stats.orderDetails],
        ["Ingreso reciente", `Q${revenue.toFixed(2)}`]
    ];

    return (
        <section className="dashboard-home-shell">
            <div className="dashboard-pattern-bg" aria-hidden="true" />

            <div className="dashboard-hero">
                <div>
                    <span className="dashboard-kicker">Panel principal</span>
                    <h1>Operacion del restaurante, viva y en movimiento</h1>
                    <p>
                        Supervisa inventario, menus, pedidos, reservaciones y eventos desde una vista mas completa,
                        con datos reales cargados desde tus servicios.
                    </p>
                </div>
                <div className="dashboard-hero-actions">
                    <Link to="/dashboard/reports">Ver reportes</Link>
                    <Link to="/dashboard/orders">Revisar pedidos</Link>
                </div>
            </div>

            {error && <div className="dashboard-alert">{error}</div>}

            <div className="dashboard-metric-grid">
                {mainStats.map((item) => (
                    <Link key={item.label} to={item.to} className="dashboard-metric-card">
                        <span>{item.label}</span>
                        <strong>{loading ? "..." : item.value}</strong>
                        <small>Ir a modulo</small>
                    </Link>
                ))}
            </div>

            <div className="dashboard-content-grid">
                <section className="dashboard-panel">
                    <div className="dashboard-panel-head">
                        <span>Resumen por entidad</span>
                        <strong>Datos fijos</strong>
                    </div>
                    <div className="dashboard-mini-grid">
                        {entityStats.map(([label, value]) => (
                            <div key={label} className="dashboard-mini-stat">
                                <span>{label}</span>
                                <strong>{loading ? "..." : value}</strong>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="dashboard-panel">
                    <div className="dashboard-panel-head">
                        <span>Pedidos recientes</span>
                        <strong>{recentOrders.length}</strong>
                    </div>
                    <div className="dashboard-list">
                        {recentOrders.length === 0 ? (
                            <p>No hay pedidos recientes.</p>
                        ) : recentOrders.map((order, index) => (
                            <div key={order._id || index} className="dashboard-list-row">
                                <div>
                                    <strong>{order.restaurant?.name || "Restaurante"}</strong>
                                    <span>{order.status || "pending"}</span>
                                </div>
                                <b>Q{Number(order.total || 0).toFixed(2)}</b>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="dashboard-panel dashboard-panel-wide">
                    <div className="dashboard-panel-head">
                        <span>Eventos activos</span>
                        <strong>{events.length}</strong>
                    </div>
                    <div className="dashboard-event-strip">
                        {events.length === 0 ? (
                            <p>No hay eventos disponibles.</p>
                        ) : events.map((event) => (
                            <article key={event._id} className="dashboard-event-card">
                                <span>{event.date ? new Date(event.date).toLocaleDateString("es-GT") : "Sin fecha"}</span>
                                <strong>{event.name}</strong>
                                <p>{event.restaurant?.name || "Restaurante"}</p>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </section>
    );
};

export const DashboardPage = () => {
    const location = useLocation();
    const isDashboardHome = location.pathname === "/dashboard";

    return (
        <DashboardContainer>
            {isDashboardHome ? <DashboardHomeContent /> : <Outlet />}
        </DashboardContainer>
    );
};
