import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showSuccess, showError } from "../../../shared/utils/toast.js";
import { updateUserRole } from "../../../shared/api/auth.js";
import defaultAvatarImg from "../../../assets/img/avatarDefault.png";

export const UserDetailModal = ({ isOpen, onClose, user, currentUserId, onSaveRole, onSaveProfile }) => {
    if (!isOpen || !user) return null;

    const [loading, setLoading] = useState(false);
    const isCurrentUser = currentUserId === user.id;

    const { register, handleSubmit, watch } = useForm({
        defaultValues: { role: user.role || "USER_ROLE", removePhoto: false },
    });

    const avatarSrc = useMemo(() => {
        const value = user?.profilePicture?.trim();
        if (!value) return defaultAvatarImg;
        if (value.startsWith("http://") || value.startsWith("https://")) return value;
        const base = import.meta.env.VITE_CLOUDINARY_BASE_URL || "https://res.cloudinary.com/dqx1m6nxh/image/upload/";
        return `${base}${value.replace(/^\+/, "")}`;
    }, [user]);

    const selectedFile = watch("profilePicture")?.[0];
    const removePhoto = watch("removePhoto");
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!selectedFile) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(selectedFile);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [selectedFile]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // 1) Foto de perfil
            if ((selectedFile || removePhoto) && typeof onSaveProfile === "function") {
                if (selectedFile) {
                    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                    const maxSize = 5 * 1024 * 1024;
                    if (!allowed.includes(selectedFile.type)) {
                        showError("Tipo de imagen no permitido. Usa JPG, JPEG, PNG o WEBP");
                        setLoading(false);
                        return;
                    }
                    if (selectedFile.size > maxSize) {
                        showError("La imagen supera los 5MB");
                        setLoading(false);
                        return;
                    }
                }
                const formData = new FormData();
                if (selectedFile) formData.append("profilePicture", selectedFile);
                if (removePhoto) formData.append("removePhoto", "true");

                const ok = await onSaveProfile(user, formData);
                if (ok) showSuccess("Foto de perfil actualizada");
            }

            // 2) Rol (solo si no es el usuario actual)
            if (!isCurrentUser && data.role !== user.role) {
                await updateUserRole(user.id, data.role);
                showSuccess("Rol actualizado correctamente");
                if (onSaveRole) onSaveRole(user, data.role);
            }

            onClose();
        } catch (err) {
            showError(err.response?.data?.message || "No se pudo actualizar el usuario");
        } finally {
            setLoading(false);
        }
    };

    const InfoCard = ({ label, value }) => (
        <div className="rounded-lg p-3" style={{ background: "#0f0d0b", border: "1px solid rgba(201,168,76,0.1)" }}>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>{label}</p>
            <p className="text-sm break-all" style={{ color: "#f0e8d5" }}>{value || "—"}</p>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate
                className="w-full max-w-lg flex flex-col max-h-[90vh] rounded-xl overflow-hidden"
                style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)" }}>

                {/* HEADER */}
                <div className="px-6 py-5 flex justify-between items-start"
                    style={{ borderBottom: "1px solid rgba(201,168,76,0.1)", background: "#1c1a16" }}>
                    <div>
                        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                            Panel de administración
                        </p>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 300, color: "#f0e8d5", margin: 0 }}>
                            Detalle de <em style={{ color: "#c9a84c", fontStyle: "italic" }}>Usuario</em>
                        </h2>
                    </div>
                    <button type="button" onClick={onClose} className="text-sm mt-1" style={{ color: "#5a5040" }}>✕</button>
                </div>

                {/* BODY */}
                <div className="p-6 overflow-y-auto flex flex-col gap-5">

                    {/* Avatar + nombre */}
                    <div className="flex items-center gap-4">
                        <img
                            src={preview || avatarSrc}
                            alt={user.username}
                            className="rounded-full object-cover"
                            style={{ width: 60, height: 60, border: "2px solid rgba(201,168,76,0.25)" }}
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultAvatarImg; }}
                        />
                        <div>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "#c9a84c", margin: "0 0 2px" }}>
                                {[user.name, user.surname].filter(Boolean).join(" ") || "—"}
                            </p>
                            <p className="text-xs" style={{ color: "#5a5040" }}>@{user.username}</p>
                        </div>
                    </div>

                    {/* Foto de perfil */}
                    <div>
                        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#5a5040" }}>Foto de perfil</p>
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
                        <label className="flex items-center gap-2 mt-2 text-xs" style={{ color: "#5a5040" }}>
                            <input type="checkbox" {...register("removePhoto")} />
                            Quitar foto actual
                        </label>
                        {selectedFile && (
                            <p className="text-xs mt-1" style={{ color: "#5a5040" }}>
                                {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                            </p>
                        )}
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <InfoCard label="ID"       value={user.id} />
                        <InfoCard label="Email"    value={user.email} />
                        <InfoCard label="Nombre"   value={user.name} />
                        <InfoCard label="Apellido" value={user.surname} />
                    </div>

                    {/* Rol */}
                    <div>
                        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#5a5040" }}>Rol</p>
                        <select
                            {...register("role")}
                            disabled={isCurrentUser}
                            className="w-full px-4 py-2 rounded-lg text-sm"
                            style={{
                                background: "#1c1a16",
                                border: "1px solid rgba(201,168,76,0.2)",
                                color: "#f0e8d5",
                                outline: "none",
                                opacity: isCurrentUser ? 0.4 : 1,
                            }}
                        >
                            <option value="USER_ROLE">USER_ROLE</option>
                            <option value="ADMIN_RESTAURANT_ROLE">ADMIN_RESTAURANT_ROLE</option>
                            <option value="ADMIN_ROLE">ADMIN_ROLE</option>
                        </select>
                        {isCurrentUser && (
                            <p className="text-xs mt-1" style={{ color: "#5a5040" }}>
                                No puedes cambiar tu propio rol.
                            </p>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 flex justify-end gap-3"
                    style={{ borderTop: "1px solid rgba(201,168,76,0.1)", background: "#1c1a16" }}>
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm"
                        style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.15)", color: "#9a8e74" }}>
                        Cerrar
                    </button>
                    <button type="submit"
                        disabled={loading || isCurrentUser}
                        className="px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
                        style={{
                            background: "linear-gradient(90deg, #c9a84c, #e8c96e)",
                            color: "#0a0906",
                            minWidth: 160,
                            height: 36,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            outline: "none",
                            boxShadow: "none",
                            border: "none",
                            WebkitTapHighlightColor: "transparent",
                            appearance: "none"
                        }}>
                        {loading ? <Spinner small /> : "Guardar cambios"}
                    </button>
                </div>
            </form>
        </div>
    );
};
