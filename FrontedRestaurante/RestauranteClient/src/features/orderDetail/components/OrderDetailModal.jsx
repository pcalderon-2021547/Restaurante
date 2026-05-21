import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useOrderStore } from "../../order/store/useOrderStore";
import { useDishStore } from "../../dish/store/useDishStore";
import { useOrderDetailStore } from "../store/useOrderDetailStore";
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

export const OrderDetailModal = ({ isOpen, onClose, detail }) => {
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
    const { createOrderDetail, updateOrderDetail, loading } = useOrderDetailStore();
    const { orders, getOrders } = useOrderStore();
    const { dishes, getDishes } = useDishStore();

    const selectedOrder = watch("order");

    useEffect(() => {
        if (!isOpen) return;

        getOrders();
        getDishes();

        reset(
            detail
                ? {
                      order: detail.order?._id || detail.order || "",
                      dish: detail.dish?._id || detail.dish || "",
                      quantity: detail.quantity,
                  }
                : { order: "", dish: "", quantity: 1 }
        );
    }, [isOpen, detail]);

    const onSubmit = async (data) => {
        const payload = {
            quantity: Number(data.quantity),
        };

        if (detail) {
            await updateOrderDetail(detail._id || detail.id, payload);
            showSuccess("Detalle actualizado");
        } else {
            if (!data.order || !data.dish) {
                showError("Selecciona un pedido y un platillo.");
                return;
            }
            await createOrderDetail({ order: data.order, dish: data.dish, quantity: Number(data.quantity) });
            showSuccess("Detalle creado");
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)" }}>
                <div className="p-5" style={{ background: "linear-gradient(135deg, #1c1408, #0a0906)", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
                    <h2 className="text-xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c" }}>
                        {detail ? "Editar Detalle" : "Nuevo Detalle"}
                    </h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Pedido</label>
                        <select style={inputStyle} disabled={Boolean(detail)} {...register("order", { required: !detail ? "El pedido es obligatorio" : false })}>
                            <option value="">Selecciona un pedido...</option>
                            {orders.map((orderItem) => (
                                <option key={orderItem._id} value={orderItem._id}>
                                    {orderItem._id} — {orderItem.type}
                                </option>
                            ))}
                        </select>
                        {errors.order && <p className="text-xs text-red-500">{errors.order.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Plato</label>
                        <select style={inputStyle} disabled={Boolean(detail)} {...register("dish", { required: !detail ? "El plato es obligatorio" : false })}>
                            <option value="">Selecciona un platillo...</option>
                            {dishes.map((dish) => (
                                <option key={dish._id} value={dish._id}>{dish.name}</option>
                            ))}
                        </select>
                        {errors.dish && <p className="text-xs text-red-500">{errors.dish.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Cantidad</label>
                        <input type="number" min="1" style={inputStyle} {...register("quantity", { required: "La cantidad es obligatoria" })} />
                    </div>
                    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg" style={{ background: "#1c1a16", color: "#5a5040", border: "1px solid rgba(201,168,76,0.1)" }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>
                            {loading ? <Spinner small /> : detail ? "Guardar" : "Crear"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
