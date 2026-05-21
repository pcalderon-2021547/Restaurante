import { useForm } from "react-hook-form";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";

const inputStyle = {
    background: "#1c1a16",
    border: "1px solid rgba(201,168,76,0.2)",
    color: "#f0e8d5",
    outline: "none",
    width: "100%",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 14,
    boxSizing: "border-box",
};

const labelStyle = {
    display: "block",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    color: "#5a5040",
    marginBottom: 6,
};

const errStyle = { fontSize: 11, color: "#e05a5a", marginTop: 4 };

export const CreateUserModal = ({ isOpen, onClose, onCreate, loading, error }) => {
    const {
        register,
        handleSubmit,
        getValues,
        reset,
        formState: { errors },
    } = useForm();

    if (!isOpen) return null;

    const submit = async (values) => {
        const formData = new FormData();
        formData.append("name",     values.name);
        formData.append("surname",  values.surname);
        formData.append("username", values.username);
        formData.append("email",    values.email);
        formData.append("password", values.password);
        formData.append("phone",    values.phone);
        if (values.profilePicture?.[0]) formData.append("profilePicture", values.profilePicture[0]);
        const ok = await onCreate(formData);
        if (ok) { reset(); onClose(); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
            <div className="w-full max-w-2xl flex flex-col max-h-[90vh] rounded-xl overflow-hidden"
                style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)" }}>

                {/* HEADER */}
                <div className="px-6 py-5 flex justify-between items-start"
                    style={{ borderBottom: "1px solid rgba(201,168,76,0.1)", background: "#1c1a16" }}>
                    <div>
                        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                            Panel de administración
                        </p>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 300, color: "#f0e8d5", margin: 0 }}>
                            Nuevo <em style={{ color: "#c9a84c", fontStyle: "italic" }}>Usuario</em>
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-sm mt-1" style={{ color: "#5a5040" }}>✕</button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit(submit)} className="p-6 overflow-y-auto flex flex-col gap-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label style={labelStyle}>Nombre</label>
                            <input style={inputStyle} {...register("name", { required: "El nombre es obligatorio" })} />
                            {errors.name && <p style={errStyle}>{errors.name.message}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Apellido</label>
                            <input style={inputStyle} {...register("surname", { required: "El apellido es obligatorio" })} />
                            {errors.surname && <p style={errStyle}>{errors.surname.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label style={labelStyle}>Nombre de usuario</label>
                            <input style={inputStyle} {...register("username", {
                                required: "El nombre de usuario es obligatorio",
                                minLength: { value: 3, message: "Mínimo 3 caracteres" },
                            })} />
                            {errors.username && <p style={errStyle}>{errors.username.message}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Teléfono</label>
                            <input style={inputStyle} type="tel" {...register("phone", {
                                required: "El teléfono es obligatorio",
                                pattern: { value: /^[0-9]{8}$/, message: "Debe ser un número de 8 dígitos" },
                            })} />
                            {errors.phone && <p style={errStyle}>{errors.phone.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Email</label>
                        <input style={inputStyle} type="email" {...register("email", {
                            required: "El email es obligatorio",
                            pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Formato de email inválido" },
                        })} />
                        {errors.email && <p style={errStyle}>{errors.email.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label style={labelStyle}>Contraseña</label>
                            <input style={inputStyle} type="password" {...register("password", {
                                required: "La contraseña es obligatoria",
                                minLength: { value: 8, message: "Mínimo 8 caracteres" },
                            })} />
                            {errors.password && <p style={errStyle}>{errors.password.message}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Confirmar contraseña</label>
                            <input style={inputStyle} type="password" {...register("confirmPassword", {
                                required: "Confirma tu contraseña",
                                validate: { match: (v) => v === getValues("password") || "Las contraseñas no coinciden" },
                            })} />
                            {errors.confirmPassword && <p style={errStyle}>{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Foto de perfil</label>
                        <input
                            type="file"
                            accept="image/*"
                            {...register("profilePicture")}
                            className="w-full text-sm rounded-lg px-3 py-2"
                            style={{
                                background: "#1c1a16",
                                border: "1px dashed rgba(201,168,76,0.25)",
                                color: "#9a8e74",
                            }}
                        />
                    </div>

                    {error && <p className="text-center text-sm" style={{ color: "#e05a5a" }}>{error}</p>}

                    {/* FOOTER */}
                    <div className="flex justify-end gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)", paddingTop: 16 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm"
                            style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.15)", color: "#9a8e74" }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
                            style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                        >
                            {loading ? <Spinner small /> : "Crear usuario"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};