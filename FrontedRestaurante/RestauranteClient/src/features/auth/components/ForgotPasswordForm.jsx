import { useForm } from "react-hook-form"
import { useAuthStore } from "../store/authStore";
import { showSuccess, showError } from "../../../shared/utils/toast";
import { requestPasswordReset } from "../../../shared/api";

export const ForgotPasswordForm = ({ onSwitch }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const loading = useAuthStore(state => state.loading);

    const onSubmit = async (data) => {
        try {
            const res = await requestPasswordReset(data);
            if (res.data?.success) {
                showSuccess("Correo de recuperación enviado. Revisa tu bandeja.");
                reset();
            } else {
                showError(res.data?.message || "Error al enviar correo");
            }
        } catch (err) {
            showError(err.response?.data?.message || "Error al enviar correo");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="auth-input-group">
                <label className="auth-label">
                    Correo electrónico
                </label>
                <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="auth-input"
                    {...register("email", {
                        required: "El correo es obligatorio",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Ingresa un correo válido"
                        }
                    })}
                />
                {errors.email && (
                    <p className="auth-error">{errors.email.message}</p>
                )}
            </div>

            <button
                type="submit"
                className="auth-btn"
                disabled={loading}
            >
                {loading ? "Enviando..." : "Enviar correo de recuperación"}
            </button>

            <p className="auth-footer-text">
                <button
                    type="button"
                    className="auth-link-btn"
                    onClick={onSwitch}
                >
                    Volver al inicio de sesión
                </button>
            </p>
        </form>
    );
};
