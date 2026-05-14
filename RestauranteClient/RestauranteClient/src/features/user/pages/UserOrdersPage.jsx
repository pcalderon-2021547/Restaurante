import { useEffect, useState } from "react";
import { useOrderStore } from "../../order/store/useOrderStore";
import { OrderModal } from "../../order/components/OrderModal.jsx";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";

export const UserOrdersPage = () => {
    const { orders, loading, error, getMyOrders } = useOrderStore();
    const [openModal, setOpenModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        getMyOrders();
    }, [getMyOrders]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                        Mis pedidos
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5" }}>
                        Pedidos <em style={{ color: "#c9a84c", fontStyle: "italic" }}>de usuario</em>
                    </h1>
                </div>
                <button
                    onClick={() => {
                        setSelectedOrder(null);
                        setOpenModal(true);
                    }}
                    className="px-5 py-2 rounded-lg text-sm font-medium"
                    style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                >
                    + Nuevo Pedido
                </button>
            </div>

            {loading && orders.length === 0 ? (
                <Spinner />
            ) : orders.length === 0 ? (
                <div className="rounded-xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
                    <p className="text-lg font-semibold" style={{ color: "#f0e8d5" }}>No tienes pedidos aún</p>
                    <p className="text-sm mt-2" style={{ color: "#9a8e74" }}>Crea tu primer pedido y consulta su estado aquí.</p>
                </div>
            ) : (
                <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "12px", overflow: "hidden" }}>
                    <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest" style={{ background: "#1c1a16", color: "#5a5040", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                        <span className="col-span-1">#</span>
                        <span className="col-span-3">Restaurante</span>
                        <span className="col-span-2">Fecha</span>
                        <span className="col-span-2">Total</span>
                        <span className="col-span-2">Estado</span>
                        <span className="col-span-2 text-right">Detalle</span>
                    </div>
                    {orders.map((order, index) => (
                        <div key={order._id || order.id || index} className="grid grid-cols-12 px-6 py-4 items-center" style={{ borderBottom: "1px solid rgba(201,168,76,0.07)", color: "#f0e8d5" }}>
                            <span className="col-span-1 text-xs" style={{ color: "#5a5040" }}>{index + 1}</span>
                            <span className="col-span-3 font-medium text-sm" style={{ color: "#c9a84c" }}>{order.restaurant?.name || order.restaurant || "—"}</span>
                            <span className="col-span-2 text-sm" style={{ color: "#9a8e74" }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</span>
                            <span className="col-span-2 text-sm" style={{ color: "#f0e8d5" }}>Q{Number(order.total || 0).toFixed(2)}</span>
                            <span className="col-span-2">
                                <span className="px-2 py-1 rounded text-xs" style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.3)" }}>
                                    {order.status || "Pendiente"}
                                </span>
                            </span>
                            <span className="col-span-2 text-right">
                                <button
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        setOpenModal(true);
                                    }}
                                    className="px-3 py-1 rounded text-xs"
                                    style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}
                                >
                                    Ver / Editar
                                </button>
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <OrderModal isOpen={openModal} onClose={() => { setOpenModal(false); setSelectedOrder(null); }} order={selectedOrder} />
        </div>
    );
};