import { useEffect, useState } from "react";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { useOrderDetailStore } from "../../orderDetail/store/useOrderDetailStore";

export const OrderViewModal = ({ isOpen, onClose, order }) => {
    const { getOrderDetailsByOrder, loading } = useOrderDetailStore();
    const [details, setDetails] = useState([]);

    useEffect(() => {
        if (!isOpen || !order) return;
        (async () => {
            const res = await getOrderDetailsByOrder(order._id || order.id || order);
            setDetails(res || []);
        })();
    }, [isOpen, order, getOrderDetailsByOrder]);

    if (!isOpen) return null;
    if (loading) return <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"><Spinner /></div>;

    const computedTotal = details.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div className="rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)" }}>
                <div className="p-5" style={{ background: "linear-gradient(135deg, #1c1408, #0a0906)", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
                    <h2 className="text-xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c" }}>
                        Detalle de Pedido
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs" style={{ color: "#5a5040" }}>Restaurante</p>
                            <p style={{ color: "#f0e8d5" }}>{order.restaurant?.name || order.restaurant || "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: "#5a5040" }}>Estado</p>
                            <p style={{ color: "#f0e8d5" }}>{order.status || "—"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs" style={{ color: "#5a5040" }}>Fecha</p>
                            <p style={{ color: "#f0e8d5" }}>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: "#5a5040" }}>Tipo</p>
                            <p style={{ color: "#f0e8d5" }}>{order.type || "—"}</p>
                        </div>
                    </div>

                    {order.type === "delivery" && (
                        <div>
                            <p className="text-xs" style={{ color: "#5a5040" }}>Dirección</p>
                            <p style={{ color: "#f0e8d5" }}>{order.address || "—"}</p>
                        </div>
                    )}

                    <div style={{ background: "#1c1a16", border: "1px solid rgba(201,168,76,0.08)", borderRadius: "10px" }}>
                        <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest" style={{ color: "#5a5040", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                            <span className="col-span-1">#</span>
                            <span className="col-span-5">Platillo</span>
                            <span className="col-span-2">Cantidad</span>
                            <span className="col-span-2">Precio</span>
                            <span className="col-span-2 text-right">Subtotal</span>
                        </div>
                        {details.length === 0 ? (
                            <div className="px-6 py-8 text-center" style={{ color: "#9a8e74" }}>
                                No hay detalles registrados para esta orden.
                            </div>
                        ) : (
                            details.map((detail, index) => (
                                <div key={detail._id || detail.id || index} className="grid grid-cols-12 px-6 py-4 items-center" style={{ borderBottom: "1px solid rgba(201,168,76,0.06)", color: "#f0e8d5" }}>
                                    <span className="col-span-1 text-xs" style={{ color: "#5a5040" }}>{index + 1}</span>
                                    <span className="col-span-5 text-sm" style={{ color: "#c9a84c" }}>{detail.dish?.name || detail.dish || '—'}</span>
                                    <span className="col-span-2 text-sm" style={{ color: "#f0e8d5" }}>{detail.quantity}</span>
                                    <span className="col-span-2 text-sm" style={{ color: "#f0e8d5" }}>Q{Number(detail.price || 0).toFixed(2)}</span>
                                    <span className="col-span-2 text-right text-sm" style={{ color: "#f0e8d5" }}>Q{Number((detail.price || 0) * (detail.quantity || 0)).toFixed(2)}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "rgba(201,168,76,0.06)" }}>
                        <strong style={{ color: "#f0e8d5" }}>Total pedido</strong>
                        <span style={{ color: "#c9a84c" }}>Q{Number(order.total || computedTotal).toFixed(2)}</span>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button onClick={onClose} className="px-4 py-2 rounded" style={{ background: "#1c1a16", color: "#c9a84c" }}>Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
