import { Link } from "react-router-dom";
import { useAuthStore } from "../../auth/store/authStore";

export const UserProfilePage = () => {
    const user = useAuthStore((state) => state.user);

    const fields = [
        ["Correo", user?.email || "Sin correo"],
        ["Usuario", user?.username || "Sin usuario"],
        ["Rol", user?.role || "USER_ROLE"],
        ["ID", user?.id || "No disponible"]
    ];

    return (
        <section className="user-profile">
            <div className="user-profile-head">
                <div>
                    <p className="user-home-kicker">Perfil</p>
                    <h1>Mi informacion</h1>
                    <p>Estos son los datos guardados en tu sesion actual.</p>
                </div>
                <Link to="/user/orders">Mis pedidos</Link>
            </div>

            <div className="user-profile-grid">
                {fields.map(([label, value]) => (
                    <article key={label} className="user-profile-field">
                        <span>{label}</span>
                        <strong>{value}</strong>
                    </article>
                ))}
            </div>
        </section>
    );
};
