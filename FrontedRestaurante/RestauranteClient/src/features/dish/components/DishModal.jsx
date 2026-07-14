import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDishStore } from "../store/useDishStore";
import { useCategoryStore } from "../../categories/store/useCategoryStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { useProductStore } from "../../products/store/useProductStore.jsx";
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

const labelStyle = { color: "#5a5040" };

// ── sub-componente: una fila de producto en la tabla de insumos ───────────────
const ProductRow = ({ item, index, products, onChangeProduct, onChangeQty, onRemove }) => (
    <div
        className="grid gap-2 items-center"
        style={{ gridTemplateColumns: "1fr 90px 32px", marginBottom: "8px" }}
    >
        {/* selector de producto */}
        <select
            style={{ ...inputStyle, padding: "8px 10px", fontSize: "0.82rem" }}
            value={item.product}
            onChange={(e) => onChangeProduct(index, e.target.value)}
        >
            <option value="">— Elige insumo —</option>
            {products
                .filter((p) => p.isActive !== false)
                .map((p) => (
                    <option key={p._id} value={p._id}>
                        {p.name}
                        {typeof p.stock === "number" ? ` (stock: ${p.stock})` : ""}
                    </option>
                ))}
        </select>

        {/* cantidad requerida por porción */}
        <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => onChangeQty(index, e.target.value)}
            placeholder="Cant."
            style={{ ...inputStyle, padding: "8px 10px", fontSize: "0.82rem" }}
        />

        {/* quitar fila */}
        <button
            type="button"
            onClick={() => onRemove(index)}
            style={{
                background: "rgba(220,50,50,0.12)",
                border: "1px solid rgba(220,50,50,0.25)",
                color: "#e05a5a",
                borderRadius: "6px",
                width: "32px",
                height: "36px",
                cursor: "pointer",
                fontSize: "1rem",
                lineHeight: 1,
            }}
            title="Quitar insumo"
        >
            ×
        </button>
    </div>
);

// ── componente principal ──────────────────────────────────────────────────────
export const DishModal = ({ isOpen, onClose, dish }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { createDish, updateDish, loading } = useDishStore();
    const { categories, getCategories } = useCategoryStore();
    const { restaurants, getRestaurants } = useRestaurantStore();
    const { products, getProducts } = useProductStore();

    // Array local de insumos: [{ product: id, quantity: number }]
    const [productRows, setProductRows] = useState([]);
    const [productError, setProductError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        getCategories();
        getRestaurants();
        getProducts();

        // Pre-cargar insumos si es edición
        if (dish) {
            const existing = (dish.products || []).map((item) => ({
                product: item.product?._id || item.product || "",
                quantity: item.quantity ?? 1,
            }));
            setProductRows(existing);
            reset({
                name: dish.name,
                description: dish.description || "",
                category: dish.category?._id || dish.category || "",
                restaurant: dish.restaurant?._id || dish.restaurant || "",
                price: dish.price,
                isAvailable: dish.isAvailable ?? true,
            });
        } else {
            setProductRows([]);
            reset({ name: "", description: "", category: "", restaurant: "", price: 0, isAvailable: true });
        }

        setProductError("");
    }, [isOpen, dish]);

    // ── handlers de la tabla de insumos ──────────────────────────────────────

    const addProductRow = () =>
        setProductRows((prev) => [...prev, { product: "", quantity: 1 }]);

    const removeProductRow = (index) =>
        setProductRows((prev) => prev.filter((_, i) => i !== index));

    const changeProduct = (index, value) =>
        setProductRows((prev) =>
            prev.map((row, i) => (i === index ? { ...row, product: value } : row))
        );

    const changeQuantity = (index, value) =>
        setProductRows((prev) =>
            prev.map((row, i) =>
                i === index ? { ...row, quantity: Math.max(1, Number(value) || 1) } : row
            )
        );

    // ── submit ────────────────────────────────────────────────────────────────

    const onSubmit = async (data) => {
        setProductError("");

        // Validar que ninguna fila tenga el producto vacío
        const incompleteRow = productRows.find((r) => !r.product);
        if (incompleteRow) {
            setProductError("Selecciona un insumo en cada fila o quita las filas incompletas.");
            return;
        }

        // Verificar stock al momento de guardar (solo aviso visual; el backend también lo valida)
        const stockWarnings = productRows
            .map((row) => {
                const found = products.find((p) => p._id === row.product);
                if (!found) return null;
                if (typeof found.stock === "number" && found.stock < row.quantity) {
                    return `"${found.name}" tiene stock ${found.stock} pero el plato requiere ${row.quantity}`;
                }
                return null;
            })
            .filter(Boolean);

        if (stockWarnings.length) {
            setProductError(`Stock insuficiente: ${stockWarnings.join(" · ")}`);
            return;
        }

        const payload = {
            ...data,
            price: Number(data.price),
            isAvailable: data.isAvailable === true || data.isAvailable === "true",
            products: productRows.map((r) => ({
                product: r.product,
                quantity: Number(r.quantity),
            })),
        };

        try {
            if (dish) {
                await updateDish(dish._id, payload);
                showSuccess("Plato actualizado");
            } else {
                await createDish(payload);
                showSuccess("Plato creado");
            }
            onClose();
        } catch (err) {
            // El backend devuelve stockIssues cuando hay problema de inventario
            const data = err?.response?.data;
            if (data?.stockIssues) {
                const names = data.stockIssues
                    .map((s) => `${s.name || "insumo"}: ${s.issue}`)
                    .join(" · ");
                showError(`Stock insuficiente — ${names}`);
            } else {
                showError(data?.message || "Error al guardar el plato");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div
                style={{
                    background: "#141210",
                    border: "1px solid rgba(201,168,76,0.2)",
                    maxHeight: "90vh",
                    overflowY: "auto",
                }}
                className="rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden"
            >
                {/* header */}
                <div
                    className="p-5 sticky top-0 z-10"
                    style={{
                        background: "linear-gradient(135deg, #1c1408 0%, #0a0906 100%)",
                        borderBottom: "1px solid rgba(201,168,76,0.2)",
                    }}
                >
                    <h2
                        className="text-xl font-bold"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c" }}
                    >
                        {dish ? "Editar Plato" : "Nuevo Plato"}
                    </h2>
                    <p className="text-xs mt-1" style={{ color: "#5a5040" }}>
                        Los insumos definen qué productos se descuentan del stock al ordenar este plato
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    {/* nombre */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest" style={labelStyle}>
                            Nombre del plato
                        </label>
                        <input
                            style={inputStyle}
                            placeholder="Ej. Pizza Margherita"
                            {...register("name", { required: "El nombre es obligatorio" })}
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    {/* descripción */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest" style={labelStyle}>
                            Descripción (opcional)
                        </label>
                        <textarea
                            rows={2}
                            style={{ ...inputStyle, resize: "none" }}
                            placeholder="Breve descripción del plato..."
                            {...register("description")}
                        />
                    </div>

                    {/* restaurante y categoría */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={labelStyle}>
                                Restaurante
                            </label>
                            <select
                                style={inputStyle}
                                {...register("restaurant", { required: "Selecciona un restaurante" })}
                            >
                                <option value="">Selecciona...</option>
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
                            <label className="text-xs uppercase tracking-widest" style={labelStyle}>
                                Categoría
                            </label>
                            <select
                                style={inputStyle}
                                {...register("category", { required: "Selecciona una categoría" })}
                            >
                                <option value="">Selecciona...</option>
                                {categories.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="text-xs text-red-500">{errors.category.message}</p>
                            )}
                        </div>
                    </div>

                    {/* precio y disponible */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={labelStyle}>
                                Precio (Q)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                style={inputStyle}
                                {...register("price", { required: "El precio es obligatorio", min: 0 })}
                            />
                            {errors.price && (
                                <p className="text-xs text-red-500">{errors.price.message}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                            <input
                                type="checkbox"
                                id="isAvailable"
                                {...register("isAvailable")}
                                className="w-4 h-4 rounded"
                            />
                            <label htmlFor="isAvailable" className="text-sm" style={{ color: "#9a8e74" }}>
                                Disponible
                            </label>
                        </div>
                    </div>

                    {/* ── sección de insumos ─────────────────────────────── */}
                    <div
                        className="flex flex-col gap-3 p-4 rounded-xl"
                        style={{ background: "#0f0d0b", border: "1px solid rgba(201,168,76,0.1)" }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p
                                    className="text-xs uppercase tracking-widest font-semibold"
                                    style={{ color: "#c9a84c" }}
                                >
                                    Insumos del plato
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: "#5a5040" }}>
                                    Productos que se consumen del stock cada vez que se ordena este plato
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={addProductRow}
                                style={{
                                    background: "rgba(201,168,76,0.12)",
                                    border: "1px solid rgba(201,168,76,0.25)",
                                    color: "#c9a84c",
                                    borderRadius: "6px",
                                    padding: "6px 14px",
                                    fontSize: "0.8rem",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                + Agregar
                            </button>
                        </div>

                        {productRows.length === 0 ? (
                            <p className="text-xs text-center py-3" style={{ color: "#3a3328" }}>
                                Sin insumos asignados — el plato no descontará stock al ordenarse
                            </p>
                        ) : (
                            <>
                                {/* header de columnas */}
                                <div
                                    className="grid text-xs uppercase tracking-widest"
                                    style={{
                                        gridTemplateColumns: "1fr 90px 32px",
                                        color: "#5a5040",
                                        paddingBottom: "4px",
                                        borderBottom: "1px solid rgba(201,168,76,0.08)",
                                        marginBottom: "4px",
                                    }}
                                >
                                    <span>Producto</span>
                                    <span>Cant./porción</span>
                                    <span />
                                </div>

                                {productRows.map((item, index) => (
                                    <ProductRow
                                        key={index}
                                        item={item}
                                        index={index}
                                        products={products}
                                        onChangeProduct={changeProduct}
                                        onChangeQty={changeQuantity}
                                        onRemove={removeProductRow}
                                    />
                                ))}
                            </>
                        )}

                        {/* error de insumos */}
                        {productError && (
                            <p
                                className="text-xs rounded-lg px-3 py-2"
                                style={{
                                    background: "rgba(220,50,50,0.1)",
                                    border: "1px solid rgba(220,50,50,0.25)",
                                    color: "#e05a5a",
                                }}
                            >
                                {productError}
                            </p>
                        )}
                    </div>

                    {/* botones */}
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
                            style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                        >
                            {loading ? <Spinner small /> : dish ? "Guardar" : "Crear"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
