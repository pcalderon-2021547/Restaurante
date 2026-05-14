import { Link, useLocation } from "react-router-dom";

export const UserSidebar = () => {
    const location = useLocation();

    const items = [
        { label: "Inicio", to: "/user" },
        { label: "Restaurantes", to: "/user/restaurants" },
        { label: "Menús", to: "/user/menus" },
        { label: "Eventos", to: "/user/events" },
        { label: "Reseñas", to: "/user/reviews" },
        { label: "Perfil", to: "/user/profile" },
        {label: "Mis pedidos", to: "/user/orders" },
        {label: "Mis reservaciones", to: "/user/reservations" },
    ];

    return (
        <aside className="dash-sidebar">
            {items.map((item) => {
                const active = location.pathname === item.to;
                return (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`dash-sidebar-item${active ? " active" : ""}`}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </aside>
    );
};
