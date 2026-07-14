import { useEffect, useState } from "react";
import { useOrderStore } from "../store/useOrderStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";
import { OrderModal } from "./OrderModal.jsx";
import { useUIStore } from "../../../shared/components/ui/store/uiStore.js";

// Helper puro — resuelve cómo mostrar el cliente en la tabla
// user puede ser: string UUID ("usr_KCJ..."), objeto { name, email }, o null
export const resolveUserLabel = (user) => {
    if (!user) return "—";
    if (typeof user === "object") {
        return user.name || user.username || user.email || user._id || "—";
    }
    // Es string: puede ser UUID del auth-service o un ID de MongoDB
    // Mostramos los últimos 6 caracteres para que sea identificable sin ser ilegible
    const str = String(user);
    if (str.length > 12) return `...${str.slice(-6)}`;
    return str;
};

// Etiquetas de tipo de pedido en español
export const ORDER_TYPE_LABELS = {
    dine_in: "Mesa",
    delivery: "Delivery",
    takeaway: "Para llevar",
};

export const Orders = () => {
    const { orders, loading, error, getOrders, deleteOrder } = useOrderStore();
    const [openModal, setOpenModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { openConfirm } = useUIStore();

    useEffect(() => {
        getOrders();
    }, [getOrders]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    if (loading && orders.length === 0) return <Spinner />;

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                        Panel de administración
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5", lineHeight: 1.2 }}>
                        Gestión de <em style={{ color: "#c9a84c", fontStyle: "italic" }}>Pedidos</em>
                    </h1>
                </div>
                <button
                    onClick={() => { setSelectedOrder(null); setOpenModal(true); }}
                    className="px-5 py-2 rounded-lg text-sm font-medium"
                    style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                >
                    + Nuevo Pedido
                </button>
            </div>

            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "12px", overflow: "hidden" }}>
                {/* cabecera */}
                <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest"
                    style={{ background: "#1c1a16", color: "#5a5040", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                    <span className="col-span-1">#</span>
                    <span className="col-span-3">Cliente</span>
                    <span className="col-span-2">Tipo</span>
                    <span className="col-span-2">Fecha</span>
                    <span className="col-span-1">Total</span>
                    <span className="col-span-1">Estado</span>
                    <span className="col-span-2 text-right">Acciones</span>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-16" style={{ color: "#3a3328" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem" }}>
                            No hay pedidos registrados aún
                        </p>
                        <p className="text-xs mt-1">Crea el primero para comenzar.</p>
                    </div>
                ) : (
                    orders.map((order, index) => (
                        <div
                            key={order._id || order.id || index}
                            className="grid grid-cols-12 px-6 py-4 items-center transition-all"
                            style={{ borderBottom: "1px solid rgba(201,168,76,0.07)", color: "#f0e8d5" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#1c1a16")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            {/* # correlativo en vez del ID crudo */}
                            <span className="col-span-1 text-xs font-semibold" style={{ color: "#c9a84c" }}>
                                #{index + 1}
                            </span>

                            {/* Cliente: nombre/email si viene poblado, si no → fragmento del UUID */}
                            <div className="col-span-3">
                                <span className="text-sm font-medium" style={{ color: "#f0e8d5" }}>
                                    {resolveUserLabel(order.user)}
                                </span>
                                {order.restaurant?.name && (
                                    <p className="text-xs mt-0.5" style={{ color: "#5a5040" }}>
                                        {order.restaurant.name}
                                    </p>
                                )}
                            </div>

                            {/* Tipo en español */}
                            <span className="col-span-2 text-sm" style={{ color: "#9a8e74" }}>
                                {ORDER_TYPE_LABELS[order.type] || order.type || "—"}
                            </span>

                            <span className="col-span-2 text-sm" style={{ color: "#9a8e74" }}>
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString("es-GT") : "—"}
                            </span>

                            <span className="col-span-1 text-sm">Q{Number(order.total || 0).toFixed(2)}</span>

                            <span className="col-span-1">
                                <span className="px-2 py-1 rounded text-xs"
                                    style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.3)" }}>
                                    {order.status || "pending"}
                                </span>
                            </span>

                            <div className="col-span-2 flex justify-end gap-2">
                                <button
                                    onClick={() => { setSelectedOrder(order); setOpenModal(true); }}
                                    className="px-3 py-1 rounded text-xs"
                                    style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => openConfirm({
                                        title: "Eliminar pedido",
                                        message: `¿Eliminar el pedido #${index + 1}?`,
                                        onConfirm: () => deleteOrder(order._id || order.id),
                                    })}
                                    className="px-3 py-1 rounded text-xs"
                                    style={{ background: "rgba(224,90,90,0.1)", color: "#e05a5a", border: "1px solid rgba(224,90,90,0.2)" }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <OrderModal
                isOpen={openModal}
                onClose={() => { setOpenModal(false); setSelectedOrder(null); }}
                order={selectedOrder}
            />
        </div>
    );
};
