import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useEventStore } from "../store/useEventStore";
import { showSuccess } from "../../../shared/utils/toast.js";
import { getRestaurants } from "../../../shared/api";

export const EventModal = ({ isOpen, onClose, event }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { createEvent, updateEvent, loading } = useEventStore();
    const [restaurants, setRestaurants] = useState([]);

    useEffect(() => {
        if (isOpen) {
            getRestaurants()
                .then((res) => setRestaurants(res.data.restaurants || []))
                .catch(() => setRestaurants([]));

            if (event) {
                reset({
                    name: event.name,
                    description: event.description,
                    date: event.date?.split("T")[0],
                    status: event.status,
                    restaurant: event.restaurant?._id || event.restaurant,
                });
            } else {
                reset({ name: "", description: "", date: "", status: "active", restaurant: "" });
            }
        }
    }, [isOpen, event]);

    const onSubmit = async (data) => {
        if (event) {
            await updateEvent(event._id, data);
            showSuccess("Evento actualizado");
        } else {
            await createEvent(data);
            showSuccess("Evento creado");
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

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "16px", width: "100%", maxWidth: "460px" }}>

                {/* HEADER */}
                <div className="p-5" style={{ background: "linear-gradient(135deg, #1c1408 0%, #0a0906 100%)", borderBottom: "1px solid rgba(201,168,76,0.2)", borderRadius: "16px 16px 0 0" }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c", fontSize: "1.3rem" }}>
                        {event ? "Editar Evento" : "Nuevo Evento"}
                    </h2>
                    <p className="text-xs mt-1" style={{ color: "#5a5040" }}>
                        {event ? "Modifica los datos del evento" : "Completa la información del nuevo evento"}
                    </p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

                    {/* Restaurante */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Restaurante</label>
                        <select
                            style={{ ...inputStyle, cursor: "pointer" }}
                            onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                            onBlur={(e) => e.target.style.borderColor = "rgba(201,168,76,0.2)"}
                            {...register("restaurant", { required: "El restaurante es obligatorio" })}>
                            <option value="">— Selecciona un restaurante —</option>
                            {restaurants.length === 0 ? (
                                <option disabled>No hay restaurantes disponibles</option>
                            ) : (
                                restaurants.map((r) => (
                                    <option key={r._id} value={r._id}>{r.name}</option>
                                ))
                            )}
                        </select>
                        {errors.restaurant && <p className="text-xs" style={{ color: "#e05a5a" }}>{errors.restaurant.message}</p>}
                    </div>

                    {/* Nombre */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Nombre</label>
                        <input
                            placeholder="Ej. Noche Italiana"
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                            onBlur={(e) => e.target.style.borderColor = "rgba(201,168,76,0.2)"}
                            {...register("name", { required: "El nombre es obligatorio" })}
                        />
                        {errors.name && <p className="text-xs" style={{ color: "#e05a5a" }}>{errors.name.message}</p>}
                    </div>

                    {/* Descripción */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Descripción</label>
                        <textarea rows={3} placeholder="Describe el evento..."
                            style={{ ...inputStyle, resize: "none" }}
                            onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                            onBlur={(e) => e.target.style.borderColor = "rgba(201,168,76,0.2)"}
                            {...register("description", { required: "La descripción es obligatoria" })}
                        />
                        {errors.description && <p className="text-xs" style={{ color: "#e05a5a" }}>{errors.description.message}</p>}
                    </div>

                    {/* Fecha */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Fecha</label>
                        <input type="date"
                            style={{ ...inputStyle, colorScheme: "dark" }}
                            onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                            onBlur={(e) => e.target.style.borderColor = "rgba(201,168,76,0.2)"}
                            {...register("date", { required: "La fecha es obligatoria" })}
                        />
                        {errors.date && <p className="text-xs" style={{ color: "#e05a5a" }}>{errors.date.message}</p>}
                    </div>

                    {/* Estado — solo al editar */}
                    {event && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Estado</label>
                            <select style={{ ...inputStyle, cursor: "pointer" }} {...register("status")}>
                                <option value="active">Activo</option>
                                <option value="finished">Finalizado</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                        </div>
                    )}

                    {/* BOTONES */}
                    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 rounded-lg text-sm"
                            style={{ background: "#1c1a16", color: "#5a5040", border: "1px solid rgba(201,168,76,0.1)" }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2 rounded-lg text-sm font-medium"
                            style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>
                            {loading ? "Guardando..." : event ? "Guardar cambios" : "Crear evento"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};