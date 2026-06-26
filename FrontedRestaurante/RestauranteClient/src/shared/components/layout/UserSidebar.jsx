import { Link, useLocation } from "react-router-dom";

export const UserSidebar = () => {
    const location = useLocation();

    const items = [
        { label: "Inicio", hint: "Resumen", to: "/user" },
        { label: "Restaurantes", hint: "Pedir", to: "/user/restaurants" },
        { label: "Menús", hint: "Cartas", to: "/user/menus" },
        { label: "Eventos", hint: "Agenda", to: "/user/events" },
        { label: "Reseñas", hint: "Opiniones", to: "/user/reviews" },
        { label: "Mis pedidos", hint: "Órdenes", to: "/user/orders" },
        { label: "Mis reservaciones", hint: "Mesas", to: "/user/reservations" },
        { label: "Perfil", hint: "Cuenta", to: "/user/profile" },
    ];

    return (
        <aside className="dash-sidebar">
            <div className="user-sidebar-head">
                <span>Cliente</span>
                <strong>Tu experiencia</strong>
            </div>
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
                        <span>
                            <strong>{item.label}</strong>
                            <small>{item.hint}</small>
                        </span>
                    </Link>
                );
            })}
        </aside>
    );
};
