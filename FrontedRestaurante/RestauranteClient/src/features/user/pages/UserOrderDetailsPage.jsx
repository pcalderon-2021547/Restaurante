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
        <div className="user-page">
            <header className="user-page-hero compact">
                <div>
                    <p className="user-kicker">Detalle de pedido</p>
                    <h1>Pedido #{order._id?.slice(-6) || orderId}</h1>
                    <p>Resumen completo de restaurante, estado, tipo de entrega y platillos solicitados.</p>
                </div>
                <button className="user-secondary-btn" onClick={() => navigate("/user/orders")}>
                    Volver a pedidos
                </button>
            </header>

            <section className="user-summary-grid">
                <article>
                    <span>Restaurante</span>
                    <strong>{order.restaurant?.name || "-"}</strong>
                    <p>{order.restaurant?.address || "Direccion no disponible"}</p>
                </article>
                <article>
                    <span>Estado</span>
                    <strong>{order.status || "-"}</strong>
                    <p>{order.type || "-"}</p>
                </article>
                <article>
                    <span>Total</span>
                    <strong>Q{Number(order.total || 0).toFixed(2)}</strong>
                    <p>Subtotal: Q{Number(order.subtotal || 0).toFixed(2)}</p>
                </article>
            </section>

            {order.type === "delivery" && (
                <section className="user-callout">
                    <span>Direccion de entrega</span>
                    <strong>{order.address || "-"}</strong>
                </section>
            )}

            {order.type === "dine_in" && order.table && (
                <section className="user-callout">
                    <span>Mesa</span>
                    <strong>Mesa {order.table?.number || order.table || "-"}</strong>
                </section>
            )}

            <div className="user-table">
                <div className="user-table-head">
                    <span>#</span>
                    <span>Platillo</span>
                    <span>Cantidad</span>
                    <span>Precio</span>
                    <span>Subtotal</span>
                </div>
                {details.length === 0 ? (
                    <div className="user-table-empty">No hay detalles registrados para esta orden.</div>
                ) : (
                    details.map((detail, index) => (
                        <div key={detail._id || detail.id || index} className="user-table-row">
                            <span data-label="#">{index + 1}</span>
                            <strong data-label="Platillo">{detail.dish?.name || detail.dish || "-"}</strong>
                            <span data-label="Cantidad">{detail.quantity}</span>
                            <span data-label="Precio">Q{Number(detail.price || 0).toFixed(2)}</span>
                            <span data-label="Subtotal">Q{Number((detail.price || 0) * (detail.quantity || 0)).toFixed(2)}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
