import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/store/authStore";

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const items = [
    { label: "Canchas", to: "/dashboard/fields" },
    { label: "Reservaciones", to: "/dashboard/reservations" },
    { label: "Equipos", to: "/dashboard/teams" },
    { label: "Torneos", to: "/dashboard/tournaments" },
    { label: "Usuarios", to: "/dashboard/users" },
  ];

  return (
    <aside className="w-60 bg-white min-h-[calc(100vh-4rem)] p-4 shadow-sm flex flex-col">
      <ul className="space-y-1 flex-1">
        {items.map((item) => {
          const active = location.pathname === item.to;

          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`block px-4 py-2 rounded-lg font-medium transition-colors sidebar-underline${active ? " active text-main-blue" : " text-gray-700 hover:bg-gray-100"}`}
                style={active ? { fontWeight: 700 } : {}}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <span className="text-lg">🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};
