import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useReservationStore } from "../store/useReservationStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { useTableStore } from "../../table/store/useTableStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showSuccess, showError } from "../../../shared/utils/toast.js";


export const validateReservationPayload = ({ date, numberOfPeople, tableCapacity }) => {
    // Fecha no puede ser pasada
    const reservationDate = new Date(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);                       // comparar solo días
    if (isNaN(reservationDate.getTime())) return "La fecha ingresada no es válida.";
    if (reservationDate < now) return "No se puede reservar en una fecha pasada.";

    // Número de personas debe ser entero positivo
    const people = Number(numberOfPeople);
    if (!Number.isInteger(people) || people < 1) return "El número de personas debe ser al menos 1.";

    // No exceder capacidad de la mesa
    if (tableCapacity && people > tableCapacity) {
        return `Esta mesa tiene capacidad máxima de ${tableCapacity} personas.`;
    }

    return null;
};

// ── estilos compartidos (objeto, no CSS class → igual en RN con StyleSheet) ──
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
    const tableCapacity = tables.find((t) => t._id === selectedTable)?.capacity ?? null;

    // Fecha mínima = hoy (para el input date del browser)
    const todayISO = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        if (!isOpen) return;
        getRestaurants();
        getTables();

        reset(
            reservation
                ? {
                      customerName: reservation.customerName,
                      customerPhone: reservation.customerPhone,
                      restaurant:
                          reservation.table?.restaurant?._id ||
                          reservation.restaurant?._id ||
                          reservation.restaurant ||
                          "",
                      table: reservation.table?._id || reservation.table || "",
                      date: reservation.date
                          ? new Date(reservation.date).toISOString().slice(0, 10)
                          : "",
                      numberOfPeople: reservation.numberOfPeople,
                      // Los usuarios NO pueden cambiar el status manualmente
                      notes: reservation.notes || "",
                  }
                : {
                      customerName: "",
                      customerPhone: "",
                      restaurant: "",
                      table: "",
                      date: "",
                      numberOfPeople: 1,
                      notes: "",
                  }
        );
    }, [isOpen, reservation]);

    const onSubmit = async (data) => {
        if (!data.restaurant) {
            showError("Selecciona un restaurante.");
            return;
        }
        if (!data.table) {
            showError("Selecciona una mesa disponible.");
            return;
        }

        // Validar con helper puro (reutilizable en React Native)
        const validationError = validateReservationPayload({
            date: data.date,
            numberOfPeople: data.numberOfPeople,
            tableCapacity,
        });
        if (validationError) {
            showError(validationError);
            return;
        }

        const payload = {
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            restaurant: data.restaurant,
            table: data.table,
            date: data.date,
            numberOfPeople: Number(data.numberOfPeople),
            notes: data.notes,
            // status lo gestiona el backend/admin, el cliente solo crea "pending"
        };

        try {
            if (reservation) {
                await updateReservation(reservation._id || reservation.id, payload);
                showSuccess("Reservación actualizada");
            } else {
                await createReservation(payload);
                showSuccess("Reservación creada");
            }
            onClose();
        } catch (err) {
            showError(err?.response?.data?.message || "Error al guardar la reservación");
        }
    };

    if (!isOpen) return null;

    const filteredTables = tables.filter((t) => {
        const sameRestaurant = (t.restaurant?._id ?? t.restaurant) === selectedRestaurant;
        const isAvailableOrCurrent =
            t.status === "available" ||
            t._id === reservation?.table?._id ||
            t._id === reservation?.table;
        return sameRestaurant && isAvailableOrCurrent;
    });

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div
                className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)" }}
            >
                <div
                    className="p-5"
                    style={{
                        background: "linear-gradient(135deg, #1c1408, #0a0906)",
                        borderBottom: "1px solid rgba(201,168,76,0.2)",
                    }}
                >
                    <h2
                        className="text-xl font-bold"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c" }}
                    >
                        {reservation ? "Editar Reservación" : "Nueva Reservación"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    {/* Nombre y teléfono */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                                Nombre del cliente
                            </label>
                            <input
                                style={inputStyle}
                                {...register("customerName", {
                                    required: "El nombre es obligatorio",
                                    minLength: { value: 2, message: "Mínimo 2 caracteres" },
                                })}
                            />
                            {errors.customerName && (
                                <p className="text-xs text-red-500">{errors.customerName.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                                Teléfono (8 dígitos)
                            </label>
                            <input
                                type="tel"
                                style={inputStyle}
                                maxLength={8}
                                {...register("customerPhone", {
                                    required: "El teléfono es obligatorio",
                                    pattern: { value: /^\d{8}$/, message: "Debe tener exactamente 8 dígitos" },
                                })}
                            />
                            {errors.customerPhone && (
                                <p className="text-xs text-red-500">{errors.customerPhone.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Restaurante y mesa */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                                Restaurante
                            </label>
                            <select
                                style={inputStyle}
                                {...register("restaurant", { required: "Selecciona un restaurante" })}
                            >
                                <option value="">Selecciona un restaurante...</option>
                                {restaurants
                                    .filter((r) => r.isActive !== false)
                                    .map((r) => (
                                        <option key={r._id} value={r._id}>
                                            {r.name}
                                        </option>
                                    ))}
                            </select>
                            {errors.restaurant && (
                                <p className="text-xs text-red-500">{errors.restaurant.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                                Mesa disponible
                            </label>
                            <select
                                style={inputStyle}
                                disabled={!selectedRestaurant}
                                {...register("table", { required: "Selecciona una mesa" })}
                            >
                                <option value="">
                                    {selectedRestaurant ? "Selecciona una mesa..." : "Primero selecciona restaurante"}
                                </option>
                                {filteredTables.map((t) => (
                                    <option key={t._id} value={t._id}>
                                        Mesa {t.number} ({t.location}) — cap. {t.capacity}
                                    </option>
                                ))}
                            </select>
                            {errors.table && (
                                <p className="text-xs text-red-500">{errors.table.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Fecha y personas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                                Fecha
                            </label>
                            <input
                                type="date"
                                min={todayISO}
                                style={inputStyle}
                                {...register("date", { required: "La fecha es obligatoria" })}
                            />
                            {errors.date && (
                                <p className="text-xs text-red-500">{errors.date.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                                N° Personas{tableCapacity ? ` (máx. ${tableCapacity})` : ""}
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={tableCapacity || undefined}
                                style={inputStyle}
                                {...register("numberOfPeople", {
                                    required: "La cantidad de personas es obligatoria",
                                    min: { value: 1, message: "Mínimo 1 persona" },
                                    ...(tableCapacity
                                        ? { max: { value: tableCapacity, message: `Máximo ${tableCapacity} personas` } }
                                        : {}),
                                })}
                            />
                            {errors.numberOfPeople && (
                                <p className="text-xs text-red-500">{errors.numberOfPeople.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                            Notas (opcional)
                        </label>
                        <textarea
                            style={{ ...inputStyle, minHeight: "80px" }}
                            placeholder="Alergias, preferencias de asiento, etc."
                            {...register("notes", {
                                maxLength: { value: 300, message: "Máximo 300 caracteres" },
                            })}
                        />
                        {errors.notes && (
                            <p className="text-xs text-red-500">{errors.notes.message}</p>
                        )}
                    </div>

                    {/* ⚠️ El campo "status" se eliminó intencionalmente de la vista del cliente.
                         El estado lo maneja solo el admin/restaurante. */}

                    <div
                        className="flex gap-3 pt-2"
                        style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg"
                            style={{
                                background: "#1c1a16",
                                color: "#5a5040",
                                border: "1px solid rgba(201,168,76,0.1)",
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 rounded-lg text-sm font-medium"
                            style={{
                                background: "linear-gradient(90deg, #c9a84c, #e8c96e)",
                                color: "#0a0906",
                            }}
                        >
                            {loading ? <Spinner small /> : reservation ? "Guardar" : "Crear"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
