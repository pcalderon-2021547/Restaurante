import { useForm } from "react-hook-form";
import { register as registerRequest } from "../../../shared/api";
import { showSuccess, showError } from "../../../shared/utils/toast";

export const RegisterForm = ({ onSwitch }) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset
    } = useForm();

    const password = watch("password");

    const onSubmit = async (data) => {
        try {
            const { confirmPassword, ...payload } = data;
            const res = await registerRequest(payload);
            if (res.data?.success) {
                showSuccess("Cuenta creada. Revisa tu correo para verificarla.");
                reset();
                setTimeout(() => onSwitch(), 1800);
            } else {
                showError(res.data?.message || "Error al registrarse");
            }
        } catch (err) {
            showError(err.response?.data?.message || "Error al registrarse");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* Fila: Nombre + Apellido */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="auth-input-group">
                    <label className="auth-label">Nombre</label>
                    <input
                        type="text"
                        placeholder="Pablo"
                        className="auth-input"
                        {...register("name", { required: "Requerido" })}
                    />
                    {errors.name && <p className="auth-error">{errors.name.message}</p>}
                </div>

                <div className="auth-input-group">
                    <label className="auth-label">Apellido</label>
                    <input
                        type="text"
                        placeholder="Andres"
                        className="auth-input"
                        {...register("surname", { required: "Requerido" })}
                    />
                    {errors.surname && <p className="auth-error">{errors.surname.message}</p>}
                </div>
            </div>

            <div className="auth-input-group">
                <label className="auth-label">Usuario</label>
                <input
                    type="text"
                    placeholder="pabloandres"
                    className="auth-input"
                    {...register("username", {
                        required: "El usuario es requerido",
                        minLength: { value: 3, message: "Mínimo 3 caracteres" }
                    })}
                />
                {errors.username && <p className="auth-error">{errors.username.message}</p>}
            </div>

            <div className="auth-input-group">
                <label className="auth-label">Correo electrónico</label>
                <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="auth-input"
                    {...register("email", {
                        required: "El correo es requerido",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Correo inválido"
                        }
                    })}
                />
                {errors.email && <p className="auth-error">{errors.email.message}</p>}
            </div>

            {/* Fila: Contraseña + Confirmar */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="auth-input-group">
                    <label className="auth-label">Contraseña</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="auth-input"
                        {...register("password", {
                            required: "La contraseña es requerida",
                            minLength: { value: 6, message: "Mínimo 6 caracteres" }
                        })}
                    />
                    {errors.password && <p className="auth-error">{errors.password.message}</p>}
                </div>

                <div className="auth-input-group">
                    <label className="auth-label">Confirmar</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="auth-input"
                        {...register("confirmPassword", {
                            required: "Confirma tu contraseña",
                            validate: (v) => v === password || "Las contraseñas no coinciden"
                        })}
                    />
                    {errors.confirmPassword && (
                        <p className="auth-error">{errors.confirmPassword.message}</p>
                    )}
                </div>
            </div>

            <button type="submit" className="auth-btn" style={{ marginTop: "0.25rem" }}>
                Crear cuenta
            </button>

            <p className="auth-footer-text">
                ¿Ya tienes cuenta?{" "}
                <button type="button" onClick={onSwitch} className="auth-link-btn">
                    Iniciar sesión
                </button>
            </p>
        </form>
    );
};
