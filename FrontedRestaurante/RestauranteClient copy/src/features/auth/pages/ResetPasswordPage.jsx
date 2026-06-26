import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { resetPassword } from "../../../shared/api";
import { showSuccess, showError } from "../../../shared/utils/toast";

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    // Si no hay token en la URL, redirigir al inicio
    useEffect(() => {
        if (!token) {
            navigate("/", { replace: true });
        }
    }, [token, navigate]);

    const onSubmit = async ({ newPassword }) => {
        try {
            setLoading(true);
            const res = await resetPassword({ token, newPassword });
            if (res.data?.success) {
                setDone(true);
                showSuccess("Contraseña actualizada exitosamente.");
            } else {
                showError(res.data?.message || "Error al restablecer la contraseña");
            }
        } catch (err) {
            showError(
                err.response?.data?.message || "El enlace es inválido o ya expiró"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-root">
            {/* Panel izquierdo (mismo estilo que AuthPage) */}
            <div className="auth-left">
                <div className="auth-left-grid" />
                <div className="auth-left-ornament">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <circle cx="11" cy="11" r="10" stroke="#c9a84c" strokeWidth="0.8" opacity="0.5" />
                        <line x1="7.5" y1="5"  x2="7.5" y2="10" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
                        <line x1="6"   y1="5"  x2="6"   y2="8.5" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
                        <line x1="9"   y1="5"  x2="9"   y2="8.5" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
                        <path d="M6 8.5 Q7.5 10 9 8.5" stroke="#c9a84c" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                        <line x1="7.5" y1="10" x2="7.5" y2="17" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
                        <path d="M14.5 5 Q16.5 8.5 16.5 11 L14.5 11 L14.5 17"
                            stroke="#c9a84c" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="auth-brand">Gestión Restaurante</span>
                </div>
                <div>
                    <p className="auth-left-sub">Seguridad de cuenta</p>
                    <h1 className="auth-left-tagline">
                        Nueva<br />
                        <em>contraseña.</em>
                    </h1>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span className="gold-rule" />
                        <span style={{
                            fontSize: "0.72rem", letterSpacing: "0.18em",
                            color: "#3a3328", textTransform: "uppercase"
                        }}>
                            Acceso restringido
                        </span>
                    </div>
                </div>
            </div>

            {/* Panel derecho */}
            <div className="auth-right">
                <div className="auth-card">
                    <p className="auth-card-sub">
                        {done ? "Todo listo" : "Recuperación de acceso"}
                    </p>
                    <h2 className="auth-card-title">
                        {done ? "Contraseña\nactualizada." : "Restablecer\ncontraseña."}
                    </h2>
                    <div style={{
                        width: 32, height: 1,
                        background: "linear-gradient(90deg, #c9a84c, transparent)",
                        marginBottom: "2rem"
                    }} />

                    {done ? (
                        /* Estado de éxito */
                        <div>
                            <p style={{ color: "#7a6e54", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                                Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
                            </p>
                            <button
                                className="auth-btn"
                                onClick={() => navigate("/", { replace: true })}
                            >
                                Ir al inicio de sesión
                            </button>
                        </div>
                    ) : (
                        /* Formulario */
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="auth-input-group">
                                <label className="auth-label">Nueva contraseña</label>
                                <input
                                    type="password"
                                    placeholder="Mínimo 8 caracteres"
                                    className="auth-input"
                                    {...register("newPassword", {
                                        required: "La contraseña es obligatoria",
                                        minLength: {
                                            value: 8,
                                            message: "Mínimo 8 caracteres",
                                        },
                                    })}
                                />
                                {errors.newPassword && (
                                    <p className="auth-error">{errors.newPassword.message}</p>
                                )}
                            </div>

                            <div className="auth-input-group">
                                <label className="auth-label">Confirmar contraseña</label>
                                <input
                                    type="password"
                                    placeholder="Repite la contraseña"
                                    className="auth-input"
                                    {...register("confirmPassword", {
                                        required: "Confirma tu contraseña",
                                        validate: (val) =>
                                            val === watch("newPassword") ||
                                            "Las contraseñas no coinciden",
                                    })}
                                />
                                {errors.confirmPassword && (
                                    <p className="auth-error">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="auth-btn"
                                disabled={loading}
                            >
                                {loading ? "Guardando..." : "Guardar nueva contraseña"}
                            </button>

                            <p className="auth-footer-text">
                                <button
                                    type="button"
                                    className="auth-link-btn"
                                    onClick={() => navigate("/", { replace: true })}
                                >
                                    Volver al inicio de sesión
                                </button>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
