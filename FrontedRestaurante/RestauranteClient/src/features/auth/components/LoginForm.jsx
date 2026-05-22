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
            navigate(res.redirectTo || "/user");
            toast.success("Bienvenido de nuevo", { duration: 4000 });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="auth-input-group">
                <label htmlFor="emailOrUsername" className="auth-label">
                    Correo o usuario
                </label>
                <input
                    id="emailOrUsername"
                    type="text"
                    placeholder="correo@ejemplo.com o pabloandres"
                    className="auth-input"
                    autoComplete="username"
                    {...register("emailOrUsername", {
                        required: "El correo o usuario es requerido",
                        validate: (value) =>
                            value.trim().length > 0 || "Ingresa tu correo o usuario"
                    })}
                />
                {errors.emailOrUsername && (
                    <p className="auth-error">{errors.emailOrUsername.message}</p>
                )}
            </div>

            <div className="auth-input-group">
                <label htmlFor="password" className="auth-label">
                    Contrasena
                </label>
                <input
                    id="password"
                    type="password"
                    placeholder="********"
                    className="auth-input"
                    autoComplete="current-password"
                    {...register("password", {
                        required: "La contrasena es obligatoria"
                    })}
                />
                {errors.password && <p className="auth-error">{errors.password.message}</p>}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Verificando..." : "Iniciar sesion"}
            </button>

            <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1.25rem"
            }}>
                <button type="button" onClick={onForgot} className="auth-link-btn">
                    Olvidaste tu contrasena?
                </button>
                <button type="button" onClick={onRegister} className="auth-link-btn">
                    Crear cuenta
                </button>
            </div>
        </form>
    );
};
