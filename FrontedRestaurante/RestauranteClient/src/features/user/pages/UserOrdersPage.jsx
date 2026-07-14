import { useEffect, useMemo, useState } from "react";
import { useOrderStore } from "../../order/store/useOrderStore";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";

export const UserOrdersPage = () => {
    const { orders, loading, error, getMyOrders } = useOrderStore();
    const navigate = useNavigate();
    const [status, setStatus] = useState("");

    useEffect(() => {
        getMyOrders();
    }, [getMyOrders]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => !status || (order.status || "Pendiente") === status);
    }, [orders, status]);

    const totalSpent = filteredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const statuses = [...new Set(orders.map((order) => order.status || "Pendiente"))];

    return (
        <div className="user-page">
            <header className="user-page-hero compact">
                <div>
                    <p className="user-kicker">Mis pedidos</p>
                    <h1>Pedidos <em>de usuario</em></h1>
                    <p>Consulta estados, fechas y detalles de tus ordenes recientes.</p>
                </div>
                <div className="user-hero-stat">
                    <strong>Q{totalSpent.toFixed(2)}</strong>
                    <span>total filtrado</span>
                </div>
            </header>

            <section className="user-toolbar">
                <label className="user-select">
                    <span>Estado</span>
                    <select value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="">Todos</option>
                        {statuses.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </label>
            </section>

            {loading && orders.length === 0 ? (
                <Spinner />
            ) : filteredOrders.length === 0 ? (
                <div className="user-empty">
                    <strong>No tienes pedidos para este filtro</strong>
                    <p>Crea tu primer pedido y consulta su estado aqui.</p>
                </div>
            ) : (
                <div className="user-table">
                    <div className="user-table-head">
                        <span>#</span>
                        <span>Restaurante</span>
                        <span>Fecha</span>
                        <span>Total</span>
                        <span>Estado</span>
                        <span>Detalle</span>
                    </div>
                    {filteredOrders.map((order, index) => (
                        <div key={order._id || order.id || index} className="user-table-row">
                            <span data-label="#">{index + 1}</span>
                            <strong data-label="Restaurante">{order.restaurant?.name || order.restaurant || "-"}</strong>
                            <span data-label="Fecha">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("es-GT") : "-"}</span>
                            <span data-label="Total">Q{Number(order.total || 0).toFixed(2)}</span>
                            <span data-label="Estado"><b className="user-status">{order.status || "Pendiente"}</b></span>
                            <span data-label="Detalle">
                                <button className="user-secondary-btn" onClick={() => navigate(`/user/orders/${order._id || order.id}`)}>
                                    Ver
                                </button>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
