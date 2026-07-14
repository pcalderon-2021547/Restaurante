import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/store/authStore";

export const Sidebar = () => {
    const location = useLocation();
    const role = useAuthStore((state) => state.user?.role);

    const items = [
        { label: "Dashboard", to: "/dashboard", roles: ["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"] },
        { label: "Usuarios", to: "/dashboard/users", roles: ["ADMIN_ROLE"] },
        { label: "Productos", to: "/dashboard/products", roles: ["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"] },
        { label: "Categorias", to: "/dashboard/categories", roles: ["ADMIN_ROLE"] },
        { label: "Menus", to: "/dashboard/menus", roles: ["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"] },
        { label: "Platos", to: "/dashboard/dishes", roles: ["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"] },
        { label: "Pedidos", to: "/dashboard/orders", roles: ["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"] },
        { label: "Detalle pedido", to: "/dashboard/order-details", roles: ["ADMIN_ROLE"] },
        { label: "Reservaciones", to: "/dashboard/reservations", roles: ["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"] },
        { label: "Eventos", to: "/dashboard/events", roles: ["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"] },
        { label: "Resenas", to: "/dashboard/reviews", roles: ["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"] },
        { label: "Reportes", to: "/dashboard/reports", roles: ["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"] },
        { label: "Restaurantes", to: "/dashboard/restaurants", roles: ["ADMIN_ROLE"] },
        { label: "Mesas", to: "/dashboard/tables", roles: ["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"] },
    ];

    const visibleItems = items.filter((item) => item.roles.includes(role));

    return (
        <aside className="dash-sidebar">
            {visibleItems.map((item) => {
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
