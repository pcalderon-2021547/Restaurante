import { useEffect, useState } from "react";
import { useOrderDetailStore } from "../store/useOrderDetailStore";
import { useOrderStore } from "../../order/store/useOrderStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";
import { OrderDetailModal } from "./OrderDetailModal.jsx";
import { useUIStore } from "../../../shared/components/ui/store/uiStore.js";
import { ORDER_TYPE_LABELS } from "../../order/components/Orders.jsx";

// Helper puro: recibe el campo order de un detalle y el array de orders
// Devuelve "Pedido #N — Mesa" o simplemente "Pedido #N"
export const resolveOrderLabel = (orderField, orders = []) => {
    if (!orderField) return "—";

    const orderId = orderField?._id || orderField?.id || orderField;

    // Buscar en la lista de pedidos cargada
    const idx = orders.findIndex(
        (o) => (o._id || o.id) === orderId
    );

    if (idx !== -1) {
        const order = orders[idx];
        const type = ORDER_TYPE_LABELS[order.type] || order.type || "";
        return `Pedido #${idx + 1}${type ? ` — ${type}` : ""}`;
    }

    // Si el objeto llegó poblado desde el backend
    if (orderField && typeof orderField === "object" && orderField.type) {
        const type = ORDER_TYPE_LABELS[orderField.type] || orderField.type;
        return `Pedido — ${type}`;
    }

    // Último recurso: fragmento del ID
    const str = String(orderId);
    return `Pedido ...${str.slice(-6)}`;
};

export const OrderDetails = () => {
    const { orderDetails, loading, error, getOrderDetails, deleteOrderDetail } = useOrderDetailStore();
    const { orders, getOrders } = useOrderStore();
    const [openModal, setOpenModal] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const { openConfirm } = useUIStore();

    useEffect(() => {
        getOrderDetails();
        getOrders(); // necesario para resolver el número correlativo de cada pedido
    }, []);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    const handleClose = () => {
        setOpenModal(false);
        setSelectedDetail(null);
        getOrderDetails();
    };

    if (loading && orderDetails.length === 0) return <Spinner />;

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                        Panel de administración
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5", lineHeight: 1.2 }}>
                        Gestión de <em style={{ color: "#c9a84c", fontStyle: "italic" }}>Detalle de pedidos</em>
                    </h1>
                </div>
                <button
                    onClick={() => { setSelectedDetail(null); setOpenModal(true); }}
                    className="px-5 py-2 rounded-lg text-sm font-medium"
                    style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                >
                    + Nuevo Detalle
                </button>
            </div>

            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "12px", overflow: "hidden" }}>
                <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest"
                    style={{ background: "#1c1a16", color: "#5a5040", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                    <span className="col-span-1">#</span>
                    <span className="col-span-3">Pedido</span>
                    <span className="col-span-3">Plato</span>
                    <span className="col-span-1">Cant.</span>
                    <span className="col-span-2">Precio u.</span>
                    <span className="col-span-2 text-right">Acciones</span>
                </div>

                {orderDetails.length === 0 ? (
                    <div className="text-center py-16" style={{ color: "#3a3328" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem" }}>
                            No hay detalles de pedido registrados aún
                        </p>
                        <p className="text-xs mt-1">Agrega el primero para comenzar.</p>
                    </div>
                ) : (
                    orderDetails.map((detail, index) => (
                        <div
                            key={detail._id || detail.id || index}
                            className="grid grid-cols-12 px-6 py-4 items-center transition-all"
                            style={{ borderBottom: "1px solid rgba(201,168,76,0.07)", color: "#f0e8d5" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#1c1a16")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            <span className="col-span-1 text-xs" style={{ color: "#5a5040" }}>{index + 1}</span>

                            {/* Pedido legible: "Pedido #N — Mesa" */}
                            <span className="col-span-3 text-sm" style={{ color: "#c9a84c" }}>
                                {resolveOrderLabel(detail.order, orders)}
                            </span>

                            <span className="col-span-3 text-sm" style={{ color: "#9a8e74" }}>
                                {detail.dish?.name || detail.dishName || detail.dish || "—"}
                            </span>

                            <span className="col-span-1 text-sm">{detail.quantity}</span>

                            <span className="col-span-2 text-sm">Q{Number(detail.price || 0).toFixed(2)}</span>

                            <div className="col-span-2 flex justify-end gap-2">
                                <button
                                    onClick={() => { setSelectedDetail(detail); setOpenModal(true); }}
                                    className="px-3 py-1 rounded text-xs"
                                    style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => openConfirm({
                                        title: "Eliminar detalle",
                                        message: `¿Eliminar el detalle de "${detail.dish?.name || "este pedido"}"?`,
                                        onConfirm: async () => {
                                            await deleteOrderDetail(detail._id || detail.id);
                                            getOrderDetails();
                                        },
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

            <OrderDetailModal isOpen={openModal} onClose={handleClose} detail={selectedDetail} />
        </div>
    );
};
