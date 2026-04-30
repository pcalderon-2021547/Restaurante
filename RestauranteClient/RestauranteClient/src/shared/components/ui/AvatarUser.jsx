import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/store/authStore";

export const AvatarUser = () => {
    const { user, logout } = useAuthStore();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const toggle = () => setOpen(p => !p);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const initials = user?.email
        ? user.email.slice(0, 2).toUpperCase()
        : "AD";

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button className="avatar-btn" onClick={toggle}>
                {initials}
            </button>

            {open && (
                <div className="avatar-dropdown">
                    <div className="avatar-dropdown-header">
                        <p className="avatar-dropdown-email">{user?.email}</p>
                        <p className="avatar-dropdown-role">
                            {user?.role === "ADMIN_ROLE" ? "Administrador" : "Usuario"}
                        </p>
                    </div>
                    <div style={{ padding: '0.4rem 0' }}>
                        <Link
                            to="/dashboard"
                            className="avatar-dropdown-item"
                            onClick={() => setOpen(false)}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/dashboard/users"
                            className="avatar-dropdown-item"
                            onClick={() => setOpen(false)}
                        >
                            Usuarios
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="avatar-dropdown-item danger"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
