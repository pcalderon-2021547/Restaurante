import { Link, useLocation } from "react-router-dom"

export const Sidebar = () => {
    const location = useLocation();

    const items = [
        { label: "Dashboard",     to: "/dashboard" },
        { label: "Usuarios",      to: "/dashboard/users" },
        { label: "Productos",     to: "/dashboard/products" },
        { label: "Categorías",    to: "/dashboard/categories" },
        { label: "Menús",         to: "/dashboard/menus" },
        { label: "Pedidos",       to: "/dashboard/orders" },
        { label: "Reservaciones", to: "/dashboard/reservations" },
        { label: "Eventos",       to: "/dashboard/events" },
        { label: "Reseñas",       to: "/dashboard/reviews" },
        { label: "Reportes",      to: "/dashboard/reports" },
    ];

    return (
        <aside className="dash-sidebar">
            {items.map((item) => {
                const active = location.pathname === item.to;
                return (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`dash-sidebar-item${active ? ' active' : ''}`}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </aside>
    );
};
