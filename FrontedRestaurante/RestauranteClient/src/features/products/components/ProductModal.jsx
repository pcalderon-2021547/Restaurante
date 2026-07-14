import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useProductStore } from "../store/useProductStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showSuccess } from "../../../shared/utils/toast.js";

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

const Field = ({ label, error, children }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-widest" style={{ color: "#5a5040" }}>
            {label}
        </label>
        {children}
        {error && <p className="text-xs" style={{ color: "#e05a5a" }}>{error}</p>}
    </div>
);

export const ProductModal = ({ isOpen, onClose, product }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { createProduct, updateProduct, loading } = useProductStore();

    useEffect(() => {
        if (isOpen) {
            if (product) {
                reset({
                    name: product.name,
                    stock: product.stock,
                    cost: product.cost,
                    category: product.category,
                    isActive: product.isActive,
                });
            } else {
                reset({ name: "", stock: 0, cost: 0, category: "", isActive: true });
            }
        }
    }, [isOpen, product]);

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            stock: Number(data.stock),
            cost: Number(data.cost),
            isActive: data.isActive === true || data.isActive === "true",
        };

        if (product) {
            await updateProduct(product._id, payload);
            showSuccess("Producto actualizado");
        } else {
            await createProduct(payload);
            showSuccess("Producto creado");
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div
                style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)" }}
                className="rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
            >
                {/* HEADER */}
                <div
                    className="p-5"
                    style={{
                        background: "linear-gradient(135deg, #1c1408 0%, #0a0906 100%)",
                        borderBottom: "1px solid rgba(201,168,76,0.2)",
                    }}
                >
                    <h2
                        className="text-xl font-bold"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c", letterSpacing: "0.05em" }}
                    >
                        {product ? "Editar Producto" : "Nuevo Producto"}
                    </h2>
                    <p className="text-xs mt-1" style={{ color: "#5a5040" }}>
                        {product ? "Modifica los datos del producto" : "Completa la información del nuevo producto"}
                    </p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    {/* Nombre */}
                    <Field label="Nombre" error={errors.name?.message}>
                        <input
                            placeholder="Ej. Filete de res, Agua mineral..."
                            style={inputStyle}
                            onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                            {...register("name", {
                                required: "El nombre es obligatorio",
                                minLength: { value: 2, message: "Mínimo 2 caracteres" },
                            })}
                        />
                    </Field>

                    {/* Stock y Costo en fila */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Stock" error={errors.stock?.message}>
                            <input
                                type="number"
                                min="0"
                                placeholder="0"
                                style={inputStyle}
                                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                                onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                                {...register("stock", {
                                    required: "El stock es obligatorio",
                                    min: { value: 0, message: "El stock no puede ser negativo" },
                                })}
                            />
                        </Field>

                        <Field label="Costo (Q)" error={errors.cost?.message}>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                style={inputStyle}
                                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                                onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                                {...register("cost", {
                                    required: "El costo es obligatorio",
                                    min: { value: 0, message: "El costo no puede ser negativo" },
                                })}
                            />
                        </Field>
                    </div>

                    {/* Categoría */}
                    <Field label="Categoría" error={errors.category?.message}>
                        <input
                            placeholder="Ej. Bebidas, Carnes, Postres..."
                            style={inputStyle}
                            onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                            {...register("category", {
                                required: "La categoría es obligatoria",
                            })}
                        />
                    </Field>

                    {/* Estado */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="w-4 h-4 rounded"
                            style={{ accentColor: "#c9a84c", cursor: "pointer" }}
                            {...register("isActive")}
                        />
                        <label
                            htmlFor="isActive"
                            className="text-sm cursor-pointer"
                            style={{ color: "#9a8e74" }}
                        >
                            Producto activo
                        </label>
                    </div>

                    {/* BOTONES */}
                    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg text-sm transition"
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
                            className="flex-1 py-2 rounded-lg text-sm font-medium transition"
                            style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                        >
                            {loading ? <Spinner small /> : product ? "Guardar cambios" : "Crear producto"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
