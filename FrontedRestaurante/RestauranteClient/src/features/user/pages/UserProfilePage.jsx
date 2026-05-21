import { useAuthStore } from "../../auth/store/authStore";

export const UserProfilePage = () => {
    const user = useAuthStore((state) => state.user);

    return (
        <div className="rounded-xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
            <p className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                Perfil
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", color: "#c9a84c" }}>
                Mi información
            </h2>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                    <p className="text-xs uppercase tracking-widest" style={{ color: "#9a8e74" }}>Correo</p>
                    <p className="text-sm" style={{ color: "#f0e8d5" }}>{user?.email || "Sin correo"}</p>
                </div>
                <div className="p-4 rounded-lg" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                    <p className="text-xs uppercase tracking-widest" style={{ color: "#9a8e74" }}>Rol</p>
                    <p className="text-sm" style={{ color: "#f0e8d5" }}>{user?.role || "Usuario"}</p>
                </div>
            </div>
        </div>
    );
};
