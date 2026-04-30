import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const LoginForm = ({ onForgot, onRegister }) => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const login = useAuthStore(state => state.login);
    const loading = useAuthStore(state => state.loading);

    const onSubmit = async (data) => {
        const res = await login(data);
        if (res.success) {
            navigate("/dashboard");
            toast.success("¡Bienvenido de nuevo!", { duration: 4000 });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="auth-input-group">
                <label htmlFor="email" className="auth-label">
                    Correo electrónico
                </label>
                <input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="auth-input"
                    {...register("email", {
                        required: "El correo es requerido",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Ingresa un correo válido"
                        }
                    })}
                />
                {errors.email && <p className="auth-error">{errors.email.message}</p>}
            </div>

            <div className="auth-input-group">
                <label htmlFor="password" className="auth-label">
                    Contraseña
                </label>
                <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="auth-input"
                    {...register("password", {
                        required: "La contraseña es obligatoria"
                    })}
                />
                {errors.password && <p className="auth-error">{errors.password.message}</p>}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Verificando..." : "Iniciar sesión"}
            </button>

            {/* Links secundarios */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1.25rem"
            }}>
                <button type="button" onClick={onForgot} className="auth-link-btn">
                    ¿Olvidaste tu contraseña?
                </button>
                <button type="button" onClick={onRegister} className="auth-link-btn">
                    Crear cuenta
                </button>
            </div>
        </form>
    );
};
