import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRestaurantStore } from "../store/useRestaurantStore";
import { showSuccess, showError } from "../../../shared/utils/toast.js";

const inputStyle = {
    background: "#1c1a16",
    border: "1px solid rgba(201,168,76,0.2)",
    color: "#f0e8d5",
    borderRadius: "6px",
    padding: "10px 14px",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
};

const Field = ({ label, name, type = "text", placeholder, required, min, register, errors }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            min={min}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
            {...register(name, required ? { required: `${label} es obligatorio` } : {})}
        />
        {errors[name] && <p className="text-xs" style={{ color: "#e05a5a" }}>{errors[name].message}</p>}
    </div>
);

export const RestaurantModal = ({ isOpen, onClose, restaurant }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { createRestaurant, updateRestaurant, loading } = useRestaurantStore();

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const fileRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        setImageFile(null);
        setImagePreview("");

        if (restaurant) {
            reset({
                name: restaurant.name,
                description: restaurant.description,
                address: restaurant.address,
                phone: restaurant.phone,
                email: restaurant.email,
                category: restaurant.category,
                averagePrice: restaurant.averagePrice,
                openingHour: restaurant.openingHour,
                closingHour: restaurant.closingHour,
                ownerId: restaurant.ownerId || "",
            });
            // Mostrar imagen actual si existe
            if (restaurant.imageUrl || restaurant.image) {
                setImagePreview(restaurant.imageUrl || restaurant.image);
            }
        } else {
            reset({ name: "", description: "", address: "", phone: "", email: "", category: "", averagePrice: "", openingHour: "", closingHour: "", ownerId: "" });
        }
    }, [isOpen, restaurant]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const onSubmit = async (data) => {
        try {
            // Si hay imagen nueva, usar FormData (multipart); si no, JSON normal
            let payload;
            if (imageFile) {
                payload = new FormData();
                Object.entries(data).forEach(([k, v]) => v !== undefined && v !== "" && payload.append(k, v));
                payload.append("image", imageFile);
            } else {
                payload = data;
            }

            if (restaurant) {
                await updateRestaurant(restaurant._id, payload);
                showSuccess("Restaurante actualizado");
            } else {
                await createRestaurant(payload);
                showSuccess("Restaurante creado");
            }
            onClose();
        } catch (err) {
            showError(err?.response?.data?.message || "Error al guardar el restaurante");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "16px", width: "100%", maxWidth: "580px", maxHeight: "90vh", overflowY: "auto" }}>

                <div className="p-5" style={{ background: "linear-gradient(135deg, #1c1408 0%, #0a0906 100%)", borderBottom: "1px solid rgba(201,168,76,0.2)", borderRadius: "16px 16px 0 0" }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c", fontSize: "1.3rem" }}>
                        {restaurant ? "Editar Restaurante" : "Nuevo Restaurante"}
                    </h2>
                    <p className="text-xs mt-1" style={{ color: "#5a5040" }}>
                        {restaurant ? "Modifica los datos del restaurante" : "Completa la información del nuevo restaurante"}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

                    {/* ── Imagen del restaurante ── */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                            Imagen del restaurante (opcional)
                        </label>

                        {imagePreview ? (
                            <div className="relative" style={{ width: "100%", height: "160px", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(201,168,76,0.2)" }}>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => { setImageFile(null); setImagePreview(""); if (fileRef.current) fileRef.current.value = ""; }}
                                    style={{
                                        position: "absolute", top: "8px", right: "8px",
                                        background: "rgba(0,0,0,0.7)", color: "#e05a5a",
                                        border: "none", borderRadius: "50%", width: "28px", height: "28px",
                                        cursor: "pointer", fontSize: "1rem", lineHeight: "28px", textAlign: "center"
                                    }}
                                >×</button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileRef.current?.click()}
                                style={{
                                    height: "100px", borderRadius: "8px", cursor: "pointer",
                                    border: "2px dashed rgba(201,168,76,0.2)", display: "flex",
                                    flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px"
                                }}
                            >
                                <span style={{ fontSize: "1.8rem", opacity: 0.4 }}>🖼</span>
                                <span className="text-xs" style={{ color: "#5a5040" }}>Haz clic para subir una imagen</span>
                                <span className="text-xs" style={{ color: "#3a3328" }}>JPG, PNG, WEBP · máx. 5 MB</span>
                            </div>
                        )}

                        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Field label="Nombre" name="name" placeholder="Ej. Restaurante El Gran Sabor" required register={register} errors={errors} />
                        </div>
                        <div className="col-span-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Descripción</label>
                                <textarea rows={2} placeholder="Describe el restaurante..."
                                    style={{ ...inputStyle, resize: "none" }}
                                    onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                                    onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                                    {...register("description", { required: "Descripción es obligatoria" })}
                                />
                                {errors.description && <p className="text-xs" style={{ color: "#e05a5a" }}>{errors.description.message}</p>}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <Field label="Dirección" name="address" placeholder="Ej. Zona 10, Guatemala" required register={register} errors={errors} />
                        </div>
                        <Field label="Teléfono" name="phone" placeholder="Ej. 5555-5555" required register={register} errors={errors} />
                        <Field label="Email" name="email" type="email" placeholder="correo@restaurante.com" required register={register} errors={errors} />
                        <Field label="Categoría" name="category" placeholder="Ej. Italiana, Fusión..." required register={register} errors={errors} />
                        <Field label="Precio promedio (Q)" name="averagePrice" type="number" min="0" placeholder="Ej. 150" required register={register} errors={errors} />
                        <Field label="Hora apertura" name="openingHour" type="time" required register={register} errors={errors} />
                        <Field label="Hora cierre" name="closingHour" type="time" required register={register} errors={errors} />
                        <div className="col-span-2">
                            <Field label="ID administrador restaurante" name="ownerId" placeholder="ID del usuario ADMIN_RESTAURANT_ROLE" register={register} errors={errors} />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm"
                            style={{ background: "#1c1a16", color: "#5a5040", border: "1px solid rgba(201,168,76,0.1)" }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-medium"
                            style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>
                            {loading ? "Guardando..." : restaurant ? "Guardar cambios" : "Crear restaurante"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
