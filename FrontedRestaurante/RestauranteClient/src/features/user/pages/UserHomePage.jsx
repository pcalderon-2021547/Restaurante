import { Link } from "react-router-dom";
import { useAuthStore } from "../../auth/store/authStore";

export const UserHomePage = () => {
    const user = useAuthStore((state) => state.user);

    return (
        <div className="space-y-6">
            <div className="rounded-xl p-6" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <p className="text-xs uppercase tracking-widest" style={{ color: "#9a8e74" }}>
                    Bienvenido a tu espacio
                </p>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", color: "#f0e8d5" }}>
                    Hola, <em style={{ color: "#c9a84c" }}>{user?.email || "Usuario"}</em>
                </h1>
                <p className="mt-2 text-sm" style={{ color: "#9a8e74" }}>
                    Explora restaurantes, revisa menús y guarda tus experiencias favoritas.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    {
                        title: "Restaurantes",
                        text: "Descubre nuevas opciones y guarda tus favoritos.",
                        to: "/user/restaurants"
                    },
                    {
                        title: "Menús",
                        text: "Consulta menús disponibles y promociones especiales.",
                        to: "/user/menus"
                    },
                    {
                        title: "Eventos",
                        text: "Revisa eventos y actividades destacadas.",
                        to: "/user/events"
                    }
                ].map((card) => (
                    <div
                        key={card.title}
                        className="rounded-xl p-5"
                        style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}
                    >
                        <h3 className="text-lg font-semibold" style={{ color: "#c9a84c" }}>{card.title}</h3>
                        <p className="text-sm mt-2" style={{ color: "#9a8e74" }}>{card.text}</p>
                        <Link
                            to={card.to}
                            className="inline-block mt-4 text-xs uppercase tracking-widest"
                            style={{ color: "#f0e8d5" }}
                        >
                            Ver más
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};
