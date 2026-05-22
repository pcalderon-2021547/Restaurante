import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useReservationStore } from "../store/useReservationStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { useTableStore } from "../../table/store/useTableStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
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

export const ReservationModal = ({ isOpen, onClose, reservation }) => {
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
    const { createReservation, updateReservation, loading } = useReservationStore();
    const { restaurants, getRestaurants } = useRestaurantStore();
    const { tables, getTables } = useTableStore();
    const selectedRestaurant = watch("restaurant");
    const selectedTable = watch("table");
    const tableCapacity = tables.find(t => t._id === selectedTable)?.capacity || 10;

    useEffect(() => {
        if (!isOpen) return;

        getRestaurants();
        getTables();

        reset(
            reservation
                ? {
                      customerName: reservation.customerName,
                      customerPhone: reservation.customerPhone,
                      restaurant: reservation.table?.restaurant?._id || reservation.restaurant?._id || reservation.restaurant || "",
                      table: reservation.table?._id || reservation.table || "",
                      date: reservation.date ? new Date(reservation.date).toISOString().slice(0, 10) : "",
                      numberOfPeople: reservation.numberOfPeople,
                      status: reservation.status || "pending",
                      notes: reservation.notes || "",
                  }
                : { customerName: "", customerPhone: "", restaurant: "", table: "", date: "", numberOfPeople: 1, status: "pending", notes: "" }
        );
    }, [isOpen, reservation]);

    const onSubmit = async (data) => {
        if (!data.table) {
            showError("Selecciona una mesa disponible.");
            return;
        }
        if (!data.restaurant) {
            showError("Selecciona un restaurante.");
            return;
        }

        // El backend infiere el restaurante desde la mesa, pero lo enviamos
        // también para mayor claridad y compatibilidad.
        const payload = {
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            restaurant: data.restaurant,   // ← incluido en el payload
            table: data.table,
            date: data.date,
            numberOfPeople: Number(data.numberOfPeople),
            status: data.status,
            notes: data.notes,
        };

        if (reservation) {
            await updateReservation(reservation._id || reservation.id, payload);
            showSuccess("Reservación actualizada");
        } else {
            await createReservation(payload);
            showSuccess("Reservación creada");
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)" }}>
                <div className="p-5" style={{ background: "linear-gradient(135deg, #1c1408, #0a0906)", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
                    <h2 className="text-xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c" }}>
                        {reservation ? "Editar Reservación" : "Nueva Reservación"}
                    </h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Nombre del cliente</label>
                            <input style={inputStyle} {...register("customerName", { required: "El nombre es obligatorio" })} />
                            {errors.customerName && <p className="text-xs text-red-500">{errors.customerName.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Teléfono</label>
                            <input type="tel" style={inputStyle} {...register("customerPhone", { required: "El teléfono es obligatorio", pattern: { value: /^\d{8}$/, message: "Debe tener 8 dígitos" } })} />
                            {errors.customerPhone && <p className="text-xs text-red-500">{errors.customerPhone.message}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Restaurante</label>
                            <select style={inputStyle} {...register("restaurant", { required: "Selecciona un restaurante" })}>
                                <option value="">Selecciona un restaurante...</option>
                                {restaurants.filter((r) => r.isActive !== false).map((restaurant) => (
                                    <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>
                                ))}
                            </select>
                            {errors.restaurant && <p className="text-xs text-red-500">{errors.restaurant.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Mesa</label>
                            <select style={inputStyle} {...register("table", { required: "Selecciona una mesa" })}>
                                <option value="">Selecciona una mesa...</option>
                                {tables
                                    .filter((table) =>
                                        (table.restaurant?._id ?? table.restaurant) === selectedRestaurant &&
                                        (table.status === "available" || table._id === reservation?.table?._id || table._id === reservation?.table)
                                    )
                                    .map((table) => (
                                        <option key={table._id} value={table._id}>Mesa {table.number} ({table.location})</option>
                                    ))}
                            </select>
                            {errors.table && <p className="text-xs text-red-500">{errors.table.message}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Fecha</label>
                            <input type="date" style={inputStyle} {...register("date", { required: "La fecha es obligatoria" })} />
                            {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>N° Personas</label>
                            <input type="number" min="1" max={tableCapacity} style={inputStyle} {...register("numberOfPeople", { required: "La cantidad de personas es obligatoria" })} />
                            {errors.numberOfPeople && <p className="text-xs text-red-500">{errors.numberOfPeople.message}</p>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Notas</label>
                        <textarea style={{ ...inputStyle, minHeight: "96px" }} {...register("notes")} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Estado</label>
                        <select style={inputStyle} {...register("status")}>
                            <option value="pending">Pendiente</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg" style={{ background: "#1c1a16", color: "#5a5040", border: "1px solid rgba(201,168,76,0.1)" }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>
                            {loading ? <Spinner small /> : reservation ? "Guardar" : "Crear"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
