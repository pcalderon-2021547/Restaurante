import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderStore } from "../../order/store/useOrderStore";
import { useOrderDetailStore } from "../../orderDetail/store/useOrderDetailStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";

export const UserOrderDetailsPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { getOrderById, loading: orderLoading } = useOrderStore();
    const { getOrderDetailsByOrder, loading: detailsLoading } = useOrderDetailStore();
    const [order, setOrder] = useState(null);
    const [details, setDetails] = useState([]);

    useEffect(() => {
        const load = async () => {
            const fetchedOrder = await getOrderById(orderId);
            if (!fetchedOrder) return;
            setOrder(fetchedOrder);
            const fetchedDetails = await getOrderDetailsByOrder(orderId);
            setDetails(fetchedDetails || []);
        };
        if (orderId) load();
    }, [orderId, getOrderById, getOrderDetailsByOrder]);

    if (orderLoading || detailsLoading || !order) return <Spinner />;

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                        Detalle de pedido
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5" }}>
                        Pedido #{order._id?.slice(-6) || orderId}
                    </h1>
                </div>
                <button
                    onClick={() => navigate('/user/orders')}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ background: "#1c1a16", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}
                >
                    Volver a pedidos
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="rounded-2xl p-5" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#5a5040" }}>Restaurante</p>
                    <p style={{ color: "#f0e8d5" }}>{order.restaurant?.name || '—'}</p>
                    <p className="text-sm mt-3" style={{ color: "#9a8e74" }}>{order.restaurant?.address || 'Dirección no disponible'}</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#5a5040" }}>Estado</p>
                    <p style={{ color: "#f0e8d5" }}>{order.status || '—'}</p>
                    <p className="mt-3 text-sm" style={{ color: "#9a8e74" }}>{order.type || '—'}</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#5a5040" }}>Total</p>
                    <p style={{ color: "#c9a84c", fontSize: "1.5rem" }}>Q{Number(order.total || 0).toFixed(2)}</p>
                    <p className="mt-3 text-sm" style={{ color: "#9a8e74" }}>Subtotal: Q{Number(order.subtotal || 0).toFixed(2)}</p>
                </div>
            </div>

            {order.type === 'delivery' && (
                <div className="rounded-2xl p-5 mb-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#5a5040" }}>Dirección de entrega</p>
                    <p style={{ color: "#f0e8d5" }}>{order.address || '—'}</p>
                </div>
            )}

            {order.type === 'dine_in' && order.table && (
                <div className="rounded-2xl p-5 mb-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#5a5040" }}>Mesa</p>
                    <p style={{ color: "#f0e8d5" }}>Mesa {order.table?.number || order.table || '—'}</p>
                </div>
            )}

            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)", borderRadius: "16px", overflow: 'hidden' }}>
                <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest" style={{ background: "#1c1a16", color: "#5a5040", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
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
        </div>
    );
};
