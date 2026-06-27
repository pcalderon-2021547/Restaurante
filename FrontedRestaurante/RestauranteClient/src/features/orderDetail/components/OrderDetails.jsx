import { useEffect, useState } from "react";
import { useOrderDetailStore } from "../store/useOrderDetailStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";
import { OrderDetailModal } from "./OrderDetailModal.jsx";
import { useUIStore } from "../../../shared/components/ui/store/uiStore.js";

export const OrderDetails = () => {
    const { orderDetails, loading, error, getOrderDetails, deleteOrderDetail } = useOrderDetailStore();
    const [openModal, setOpenModal] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const { openConfirm } = useUIStore();

    useEffect(() => {
        getOrderDetails();
    }, []);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    // Cierra el modal y refresca la lista desde el servidor
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
                    onClick={() => {
                        setSelectedDetail(null);
                        setOpenModal(true);
                    }}
                    className="px-5 py-2 rounded-lg text-sm font-medium"
                    style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                >
                    + Nuevo Detalle
                </button>
            </div>

            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "12px", overflow: "hidden" }}>
                <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest" style={{ background: "#1c1a16", color: "#5a5040", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                    <span className="col-span-1">#</span>
                    <span className="col-span-2">Pedido</span>
                    <span className="col-span-3">Plato</span>
                    <span className="col-span-2">Cantidad</span>
                    <span className="col-span-2">Precio</span>
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
                            <span className="col-span-2 text-sm" style={{ color: "#c9a84c" }}>
                                {detail.order?.type
                                    ? `${detail.order.type} (${detail.order._id ?? detail.order})`
                                    : detail.order?._id || detail.order || "—"}
                            </span>
                            <span className="col-span-3 text-sm" style={{ color: "#9a8e74" }}>
                                {detail.dish?.name || detail.dishName || detail.dish || "—"}
                            </span>
                            <span className="col-span-2 text-sm">{detail.quantity}</span>
                            <span className="col-span-2 text-sm">Q{Number(detail.price || 0).toFixed(2)}</span>
                            <div className="col-span-2 flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedDetail(detail);
                                        setOpenModal(true);
                                    }}
                                    className="px-3 py-1 rounded text-xs"
                                    style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() =>
                                        openConfirm({
                                            title: "Eliminar detalle",
                                            message: `¿Eliminar el detalle de ${detail.dish?.name || detail.dishName || "este pedido"}?`,
                                            onConfirm: async () => {
                                                await deleteOrderDetail(detail._id || detail.id);
                                                getOrderDetails();
                                            },
                                        })
                                    }
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

            <OrderDetailModal
                isOpen={openModal}
                onClose={handleClose}
                detail={selectedDetail}
            />
        </div>
    );
};