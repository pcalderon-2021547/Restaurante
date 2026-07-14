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
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
    const { createOrderDetail, updateOrderDetail, loading } = useOrderDetailStore();
    const { orders, getOrders } = useOrderStore();
    const { dishes, getDishes } = useDishStore();

    // Observar el plato seleccionado para autocompletar el precio
    const selectedDishId = watch("dish");
    const selectedDish = dishes.find((d) => d._id === selectedDishId);

    // Cuando cambia el plato, actualizar el precio automáticamente
    useEffect(() => {
        if (selectedDish && !detail) {
            setValue("price", selectedDish.price, { shouldValidate: true });
        }
    }, [selectedDishId]);

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
                      price: detail.price,
                  }
                : { order: "", dish: "", quantity: 1, price: "" }
        );
    }, [isOpen, detail]);

    const onSubmit = async (data) => {
        const quantity = Number(data.quantity);
        const price = Number(data.price);

        // Validaciones explícitas antes de enviar
        if (quantity < 1 || !Number.isInteger(quantity)) {
            showError("La cantidad debe ser un número entero mayor a 0.");
            return;
        }
        if (isNaN(price) || price < 0) {
            showError("El precio debe ser un número mayor o igual a 0.");
            return;
        }

        if (detail) {
            // Al editar solo se puede cambiar cantidad y precio
            await updateOrderDetail(detail._id || detail.id, { quantity, price });
            showSuccess("Detalle actualizado");
        } else {
            if (!data.order || !data.dish) {
                showError("Selecciona un pedido y un platillo.");
                return;
            }
            await createOrderDetail({
                order: data.order,
                dish: data.dish,
                dishName: selectedDish?.name,
                quantity,
                price,
            });
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

                    {/* Pedido */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Pedido</label>
                        <select
                            style={inputStyle}
                            disabled={Boolean(detail)}
                            {...register("order", { required: !detail ? "El pedido es obligatorio" : false })}
                        >
                            <option value="">Selecciona un pedido...</option>
                            {orders.map((orderItem) => (
                                <option key={orderItem._id} value={orderItem._id}>
                                    {orderItem.user ? `${orderItem.user.slice(-6)}` : "?"} · {orderItem.type} · Q{Number(orderItem.total ?? 0).toFixed(2)} · {orderItem.status}
                                </option>
                            ))}
                        </select>
                        {errors.order && <p className="text-xs text-red-500">{errors.order.message}</p>}
                    </div>

                    {/* Plato */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Plato</label>
                        <select
                            style={inputStyle}
                            disabled={Boolean(detail)}
                            {...register("dish", { required: !detail ? "El plato es obligatorio" : false })}
                        >
                            <option value="">Selecciona un platillo...</option>
                            {dishes.map((dish) => (
                                <option key={dish._id} value={dish._id}>
                                    {dish.name} — Q{dish.price?.toFixed(2)}
                                </option>
                            ))}
                        </select>
                        {errors.dish && <p className="text-xs text-red-500">{errors.dish.message}</p>}
                    </div>

                    {/* Cantidad y Precio en fila */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Cantidad</label>
                            <input
                                type="number"
                                min="1"
                                style={inputStyle}
                                {...register("quantity", {
                                    required: "La cantidad es obligatoria",
                                    min: { value: 1, message: "Mínimo 1" },
                                    valueAsNumber: true,
                                })}
                            />
                            {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                                Precio unitario (Q)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                style={inputStyle}
                                placeholder={selectedDish ? `${selectedDish.price?.toFixed(2)}` : "0.00"}
                                {...register("price", {
                                    required: "El precio es obligatorio",
                                    min: { value: 0, message: "El precio no puede ser negativo" },
                                    valueAsNumber: true,
                                })}
                            />
                            {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                            {selectedDish && (
                                <p className="text-xs" style={{ color: "#5a5040" }}>
                                    Precio base del plato: Q{selectedDish.price?.toFixed(2)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Botones */}
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