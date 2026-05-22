import { Link, useLocation } from "react-router-dom";

export const UserSidebar = () => {
    const location = useLocation();

    const items = [
        { label: "Inicio", to: "/user" },
        { label: "Restaurantes", to: "/user/restaurants" },
        { label: "Menus", to: "/user/menus" },
        { label: "Eventos", to: "/user/events" },
        { label: "Resenas", to: "/user/reviews" },
        { label: "Mis pedidos", to: "/user/orders" },
        { label: "Mis reservaciones", to: "/user/reservations" },
        { label: "Perfil", to: "/user/profile" },
    ];

    return (
        <aside className="dash-sidebar">
            {items.map((item) => {
                const active = item.to === "/user"
                    ? location.pathname === item.to
                    : location.pathname.startsWith(item.to);

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
