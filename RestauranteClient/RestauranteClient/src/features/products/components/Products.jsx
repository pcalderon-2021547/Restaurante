import { useState, useEffect } from "react";
import { useProductStore } from "../store/useProductStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";
import { ProductModal } from "./ProductModal.jsx";
import { useUIStore } from "../../../shared/components/ui/store/uiStore.js";

const StockBadge = ({ stock }) => {
    const isLow = stock === 0;
    const isWarning = stock > 0 && stock <= 5;
    const color = isLow ? "#e05a5a" : isWarning ? "#e0a85a" : "#c9a84c";
    const bg = isLow
        ? "rgba(224,90,90,0.1)"
        : isWarning
        ? "rgba(224,168,90,0.1)"
        : "rgba(201,168,76,0.1)";
    const border = isLow
        ? "rgba(224,90,90,0.3)"
        : isWarning
        ? "rgba(224,168,90,0.3)"
        : "rgba(201,168,76,0.3)";

    return (
        <span
            className="px-2 py-1 rounded text-xs font-medium"
            style={{ background: bg, color, border: `1px solid ${border}` }}
        >
            {stock} uds
        </span>
    );
};

export const Products = () => {
    const { products, loading, error, getProducts, deleteProduct } = useProductStore();
    const [openModal, setOpenModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [search, setSearch] = useState("");
    const { openConfirm } = useUIStore();

    useEffect(() => {
        getProducts();
    }, [getProducts]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    const filtered = products.filter(
        (p) =>
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.category?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Spinner />;

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                        Panel de administración
                    </p>
                    <h1
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: "2rem",
                            fontWeight: 300,
                            color: "#f0e8d5",
                            lineHeight: 1.2,
                        }}
                    >
                        Gestión de <em style={{ color: "#c9a84c", fontStyle: "italic" }}>Productos</em>
                    </h1>
                </div>

                <div className="flex gap-3 items-center">
                    {/* Buscador */}
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o categoría..."
                        className="text-sm px-4 py-2 rounded-lg"
                        style={{
                            background: "#1c1a16",
                            border: "1px solid rgba(201,168,76,0.2)",
                            color: "#f0e8d5",
                            outline: "none",
                            minWidth: "220px",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                    />

                    <button
                        onClick={() => {
                            setSelectedProduct(null);
                            setOpenModal(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                        style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                    >
                        + Nuevo Producto
                    </button>
                </div>
            </div>

            {/* TABLA */}
            <div
                style={{
                    background: "#141210",
                    border: "1px solid rgba(201,168,76,0.15)",
                    borderRadius: "12px",
                    overflow: "hidden",
                }}
            >
                {/* Cabecera tabla */}
                <div
                    className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest"
                    style={{
                        background: "#1c1a16",
                        color: "#5a5040",
                        borderBottom: "1px solid rgba(201,168,76,0.1)",
                    }}
                >
                    <span className="col-span-1">#</span>
                    <span className="col-span-3">Nombre</span>
                    <span className="col-span-2">Categoría</span>
                    <span className="col-span-2">Stock</span>
                    <span className="col-span-1">Costo</span>
                    <span className="col-span-1">Estado</span>
                    <span className="col-span-2 text-right">Acciones</span>
                </div>

                {/* Filas */}
                {filtered.length === 0 ? (
                    <div className="text-center py-16" style={{ color: "#3a3328" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem" }}>
                            {search ? "Sin resultados para tu búsqueda" : "Sin productos registrados"}
                        </p>
                        <p className="text-xs mt-1">
                            {search ? "Intenta con otro término" : "Crea el primero para comenzar"}
                        </p>
                    </div>
                ) : (
                    filtered.map((product, index) => (
                        <div
                            key={product._id}
                            className="grid grid-cols-12 px-6 py-4 items-center transition-all"
                            style={{
                                borderBottom: "1px solid rgba(201,168,76,0.07)",
                                color: "#f0e8d5",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#1c1a16")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            <span className="col-span-1 text-xs" style={{ color: "#5a5040" }}>
                                {index + 1}
                            </span>

                            <span className="col-span-3 font-medium text-sm" style={{ color: "#c9a84c" }}>
                                {product.name}
                            </span>

                            <span className="col-span-2 text-sm" style={{ color: "#9a8e74" }}>
                                {product.category || "—"}
                            </span>

                            <span className="col-span-2">
                                <StockBadge stock={product.stock} />
                            </span>

                            <span className="col-span-1 text-sm" style={{ color: "#f0e8d5" }}>
                                Q{Number(product.cost).toFixed(2)}
                            </span>

                            <span className="col-span-1">
                                <span
                                    className="px-2 py-1 rounded text-xs"
                                    style={{
                                        background: product.isActive
                                            ? "rgba(201,168,76,0.1)"
                                            : "rgba(224,90,90,0.1)",
                                        color: product.isActive ? "#c9a84c" : "#e05a5a",
                                        border: `1px solid ${
                                            product.isActive
                                                ? "rgba(201,168,76,0.3)"
                                                : "rgba(224,90,90,0.3)"
                                        }`,
                                    }}
                                >
                                    {product.isActive ? "Activo" : "Inactivo"}
                                </span>
                            </span>

                            <div className="col-span-2 flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setOpenModal(true);
                                    }}
                                    className="px-3 py-1 rounded text-xs transition"
                                    style={{
                                        background: "rgba(201,168,76,0.1)",
                                        color: "#c9a84c",
                                        border: "1px solid rgba(201,168,76,0.2)",
                                    }}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() =>
                                        openConfirm({
                                            title: "Eliminar producto",
                                            message: `¿Eliminar "${product.name}"?`,
                                            onConfirm: () => deleteProduct(product._id),
                                        })
                                    }
                                    className="px-3 py-1 rounded text-xs transition"
                                    style={{
                                        background: "rgba(224,90,90,0.1)",
                                        color: "#e05a5a",
                                        border: "1px solid rgba(224,90,90,0.2)",
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ProductModal
                isOpen={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setSelectedProduct(null);
                }}
                product={selectedProduct}
            />
        </div>
    );
};
