import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTableStore } from "../store/useTableStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { showSuccess, showError } from "../../../shared/utils/toast.js";

export const TableModal = ({ isOpen, onClose, table }) => {
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
    const { createTable, updateTable, tables, loading } = useTableStore();
    const { restaurants, getRestaurants } = useRestaurantStore();

    const selectedRestaurantId = watch("restaurant");

    useEffect(() => {
        if (isOpen) {
            getRestaurants();
            if (table) {
                reset({
                    number:     table.number,
                    capacity:   table.capacity,
                    status:     table.status,
                    location:   table.location,
                    restaurant: table.restaurant?._id ?? table.restaurant,
                });
            } else {
                reset({ number: "", capacity: "", status: "available", location: "", restaurant: "" });
            }
        }
    }, [isOpen, table]);

    const onSubmit = async (data) => {
        data.number   = Number(data.number);
        data.capacity = Number(data.capacity);

        // Validar número único dentro del mismo restaurante (en frontend)
        const duplicate = tables.find((t) =>
            t.restaurant?._id === data.restaurant &&
            Number(t.number) === data.number &&
            t._id !== table?._id   // excluir la mesa actual al editar
        );
        if (duplicate) {
            showError(`Ya existe la mesa #${data.number} en ese restaurante`);
            return;
        }

        const result = table
            ? await updateTable(table._id, data)
            : await createTable(data);

        if (result?.success) {
            showSuccess(table ? "Mesa actualizada" : "Mesa creada");
            onClose();
        } else {
            showError(result?.message ?? "No se pudo guardar la mesa");
        }
    };

    if (!isOpen) return null;

    const inputStyle = {
        background:   "#1c1a16",
        border:       "1px solid rgba(201,168,76,0.2)",
        color:        "#f0e8d5",
        borderRadius: "6px",
        padding:      "10px 14px",
        fontSize:     "0.9rem",
        outline:      "none",
        width:        "100%",
    };
    const focusGold = (e) => (e.target.style.borderColor = "#c9a84c");
    const blurGold  = (e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)");

    // Números ya usados en el restaurante seleccionado (para hint visual)
    const usedNumbers = tables
        .filter((t) => (t.restaurant?._id ?? t.restaurant) === selectedRestaurantId && t._id !== table?._id)
        .map((t) => t.number)
        .sort((a, b) => a - b);

    const Field = ({ label, name, type = "text", placeholder, required, min }) => (
        <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                min={min}
                style={inputStyle}
                onFocus={focusGold}
                onBlur={blurGold}
                {...register(name, required ? { required: `${label} es obligatorio` } : {})}
            />
            {errors[name] && <p className="text-xs" style={{ color: "#e05a5a" }}>{errors[name].message}</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "16px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto" }}>

                {/* HEADER */}
                <div className="p-5" style={{ background: "linear-gradient(135deg, #1c1408 0%, #0a0906 100%)", borderBottom: "1px solid rgba(201,168,76,0.2)", borderRadius: "16px 16px 0 0" }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c", fontSize: "1.3rem" }}>
                        {table ? "Editar Mesa" : "Nueva Mesa"}
                    </h2>
                    <p className="text-xs mt-1" style={{ color: "#5a5040" }}>
                        {table ? "Modifica los datos de la mesa" : "Completa la información de la nueva mesa"}
                    </p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

                    {/* 1. Restaurante — primero */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Restaurante</label>
                        <select
                            style={inputStyle}
                            onFocus={focusGold}
                            onBlur={blurGold}
                            {...register("restaurant", { required: "Restaurante es obligatorio" })}>
                            <option value="">Selecciona un restaurante…</option>
                            {restaurants.map((r) => (
                                <option key={r._id} value={r._id}>{r.name}</option>
                            ))}
                        </select>
                        {errors.restaurant && <p className="text-xs" style={{ color: "#e05a5a" }}>{errors.restaurant.message}</p>}
                    </div>

                    {/* Hint de números ya ocupados */}
                    {selectedRestaurantId && usedNumbers.length > 0 && (
                        <p className="text-xs" style={{ color: "#5a5040" }}>
                            Números ya ocupados en este restaurante:&nbsp;
                            <span style={{ color: "#e05a5a" }}>{usedNumbers.join(", ")}</span>
                        </p>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {/* Número de mesa */}
                        <Field label="Número de mesa" name="number" type="number" min="1" placeholder="Ej. 5" required />

                        {/* Capacidad */}
                        <Field label="Capacidad (personas)" name="capacity" type="number" min="1" placeholder="Ej. 4" required />

                        {/* Ubicación */}
                        <div className="col-span-2">
                            <Field label="Ubicación" name="location" placeholder="Ej. Terraza, Salón principal..." required />
                        </div>

                        {/* Estado */}
                        <div className="col-span-2 flex flex-col gap-1">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Estado</label>
                            <select
                                style={inputStyle}
                                onFocus={focusGold}
                                onBlur={blurGold}
                                {...register("status", { required: "Estado es obligatorio" })}>
                                <option value="available">Disponible</option>
                                <option value="occupied">Ocupada</option>
                                <option value="reserved">Reservada</option>
                            </select>
                            {errors.status && <p className="text-xs" style={{ color: "#e05a5a" }}>{errors.status.message}</p>}
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 rounded-lg text-sm"
                            style={{ background: "#1c1a16", color: "#5a5040", border: "1px solid rgba(201,168,76,0.1)" }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2 rounded-lg text-sm font-medium"
                            style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906", opacity: loading ? 0.6 : 1 }}>
                            {loading ? "Guardando..." : table ? "Guardar cambios" : "Crear mesa"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};