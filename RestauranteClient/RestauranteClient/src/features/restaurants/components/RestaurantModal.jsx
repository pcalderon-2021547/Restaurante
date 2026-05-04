import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRestaurantStore } from "../store/useRestaurantStore";
import { showSuccess } from "../../../shared/utils/toast.js";

export const RestaurantModal = ({ isOpen, onClose, restaurant }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { createRestaurant, updateRestaurant, loading } = useRestaurantStore();

    useEffect(() => {
        if (isOpen) {
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
                });
            } else {
                reset({ name: "", description: "", address: "", phone: "", email: "", category: "", averagePrice: "", openingHour: "", closingHour: "" });
            }
        }
    }, [isOpen, restaurant]);

    const onSubmit = async (data) => {
        if (restaurant) {
            await updateRestaurant(restaurant._id, data);
            showSuccess("Restaurante actualizado");
        } else {
            await createRestaurant(data);
            showSuccess("Restaurante creado");
        }
        onClose();
    };

    if (!isOpen) return null;

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

    const Field = ({ label, name, type = "text", placeholder, required, min }) => (
        <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                min={min}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "rgba(201,168,76,0.2)"}
                {...register(name, required ? { required: `${label} es obligatorio` } : {})}
            />
            {errors[name] && <p className="text-xs" style={{ color: "#e05a5a" }}>{errors[name].message}</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "16px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}>

                {/* HEADER */}
                <div className="p-5" style={{ background: "linear-gradient(135deg, #1c1408 0%, #0a0906 100%)", borderBottom: "1px solid rgba(201,168,76,0.2)", borderRadius: "16px 16px 0 0" }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c", fontSize: "1.3rem" }}>
                        {restaurant ? "Editar Restaurante" : "Nuevo Restaurante"}
                    </h2>
                    <p className="text-xs mt-1" style={{ color: "#5a5040" }}>
                        {restaurant ? "Modifica los datos del restaurante" : "Completa la información del nuevo restaurante"}
                    </p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2"><Field label="Nombre" name="name" placeholder="Ej. Restaurante El Gran Sabor" required /></div>
                        <div className="col-span-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Descripción</label>
                                <textarea rows={2} placeholder="Describe el restaurante..."
                                    style={{ ...inputStyle, resize: "none" }}
                                    onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                                    onBlur={(e) => e.target.style.borderColor = "rgba(201,168,76,0.2)"}
                                    {...register("description", { required: "Descripción es obligatoria" })}
                                />
                                {errors.description && <p className="text-xs" style={{ color: "#e05a5a" }}>{errors.description.message}</p>}
                            </div>
                        </div>
                        <div className="col-span-2"><Field label="Dirección" name="address" placeholder="Ej. Zona 10, Guatemala" required /></div>
                        <Field label="Teléfono" name="phone" placeholder="Ej. 5555-5555" required />
                        <Field label="Email" name="email" type="email" placeholder="correo@restaurante.com" required />
                        <Field label="Categoría" name="category" placeholder="Ej. Italiana, Fusión..." required />
                        <Field label="Precio promedio (Q)" name="averagePrice" type="number" min="0" placeholder="Ej. 150" required />
                        <Field label="Hora apertura" name="openingHour" type="time" required />
                        <Field label="Hora cierre" name="closingHour" type="time" required />
                    </div>

                    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 rounded-lg text-sm"
                            style={{ background: "#1c1a16", color: "#5a5040", border: "1px solid rgba(201,168,76,0.1)" }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2 rounded-lg text-sm font-medium"
                            style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>
                            {loading ? "Guardando..." : restaurant ? "Guardar cambios" : "Crear restaurante"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};