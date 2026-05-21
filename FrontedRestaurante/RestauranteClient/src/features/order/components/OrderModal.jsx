import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useOrderStore } from "../store/useOrderStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { useTableStore } from "../../table/store/useTableStore";
import { useAuthStore } from "../../auth/store/authStore";
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

export const OrderModal = ({ isOpen, onClose, order }) => {
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
    const { createOrder, updateOrder, loading } = useOrderStore();
    const { restaurants, getRestaurants } = useRestaurantStore();
    const { tables, getTables } = useTableStore();
    const currentUser = useAuthStore((state) => state.user);
    const selectedRestaurant = watch("restaurant");
    const orderType = watch("type");

    useEffect(() => {
        if (!isOpen) return;

        getRestaurants();
        getTables();

        reset(
            order
                ? {
                      restaurant: order.restaurant?._id || order.restaurant || "",
                      table: order.table?._id || order.table || "",
                      type: order.type || "dine_in",
                      status: order.status || "pending",
                      address: order.address || "",
                      total: order.total ?? 0,
                  }
                : { restaurant: "", table: "", type: "dine_in", status: "pending", address: "" }
        );
    }, [isOpen, order]);

    const onSubmit = async (data) => {
        const userId = currentUser?.id || currentUser?._id || currentUser;

        console.log("OrderModal submit currentUser:", currentUser);
        console.log("OrderModal submit form data:", data);

        if (!userId) {
            showError("No hay usuario autenticado para crear la orden.");
            return;
        }

        const payload = {
            user: userId,
            restaurant: data.restaurant,
            type: data.type,
            status: data.status,
        };

        console.log("OrderModal submit payload:", payload);

        if (!data.restaurant) {
            showError("Selecciona un restaurante.");
            return;
        }

        if (!data.type) {
            showError("Selecciona el tipo de orden.");
            return;
        }

        if (data.type === "dine_in") {
            if (!data.table) {
                showError("Selecciona una mesa para órdenes dine-in.");
                return;
            }
            payload.table = data.table;
        }

        if (data.type === "delivery") {
            if (!data.address) {
                showError("La dirección es obligatoria para delivery.");
                return;
            }
            payload.address = data.address;
        }

        try {
            if (order) {
                await updateOrder(order._id || order.id, payload);
                showSuccess("Pedido actualizado");
            } else {
                await createOrder(payload);
                showSuccess("Pedido creado");
            }
            onClose();
        } catch (error) {
            console.error("OrderModal submit error:", error.response?.data || error.message || error);
            showError(error.response?.data?.message || "Error al crear pedido.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)" }}>
                <div className="p-5" style={{ background: "linear-gradient(135deg, #1c1408, #0a0906)", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
                    <h2 className="text-xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c" }}>
                        {order ? "Editar Pedido" : "Nuevo Pedido"}
                    </h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
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
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Tipo</label>
                            <select style={inputStyle} {...register("type", { required: "Selecciona un tipo" })}>
                                <option value="dine_in">Dine-in</option>
                                <option value="delivery">Delivery</option>
                                <option value="takeaway">Takeaway</option>
                            </select>
                            {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
                        </div>
                    </div>

                    {orderType === "dine_in" && (
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Mesa</label>
                            <select style={inputStyle} {...register("table")}> 
                                <option value="">Selecciona una mesa disponible...</option>
                                {tables
                                    .filter((t) => (t.restaurant?._id ?? t.restaurant) === selectedRestaurant && t.status === "available")
                                    .map((table) => (
                                        <option key={table._id} value={table._id}>Mesa {table.number} — {table.location}</option>
                                    ))}
                            </select>
                        </div>
                    )}

                    {orderType === "delivery" && (
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Dirección</label>
                            <input type="text" style={inputStyle} {...register("address", { required: orderType === "delivery" ? "La dirección es obligatoria" : false })} />
                            {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Estado</label>
                        <select style={inputStyle} {...register("status")}>
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg" style={{ background: "#1c1a16", color: "#5a5040", border: "1px solid rgba(201,168,76,0.1)" }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>
                            {loading ? <Spinner small /> : order ? "Guardar" : "Crear"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
