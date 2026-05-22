import { useEffect } from "react";
import { useReportStore } from "../store/useReportStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";
import { useAuthStore } from "../../auth/store/authStore.js";

export const Reports = () => {
    const { stats, loading, error, getGeneralStats, getRestaurantAdminStats } = useReportStore();
    const role = useAuthStore((state) => state.user?.role);
    const isRestaurantAdmin = role === "ADMIN_RESTAURANT_ROLE";
    const refreshStats = isRestaurantAdmin ? getRestaurantAdminStats : getGeneralStats;

    useEffect(() => {
        refreshStats();
    }, [refreshStats]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    if (loading && !stats) return <Spinner />;

    const globalItems = stats && !isRestaurantAdmin ? [
        { label: "Restaurantes activos", value: stats.restaurantes },
        { label: "Pedidos totales", value: stats.ordenes },
        { label: "Reservaciones", value: stats.reservaciones },
        { label: "Eventos registrados", value: stats.eventos },
        { label: "Platos disponibles", value: stats.platillos },
        { label: "Ingresos totales", value: `Q${Number(stats.ingresosTotales || 0).toFixed(2)}` },
        { label: "Ticket promedio", value: `Q${Number(stats.ticketPromedio || 0).toFixed(2)}` },
        { label: "Calificacion promedio", value: stats.calificacionPromedio },
    ] : [];

    const restaurantItems = stats && isRestaurantAdmin ? [
        { label: "Platillos en ranking", value: stats.topDishes?.length || 0 },
        { label: "Hora mas concurrida", value: stats.horaMasConcurrida ?? "N/A" },
        { label: "Dias con demanda", value: stats.demanda?.ordenesPorDia?.length || 0 },
        { label: "Dias con ingresos", value: stats.demanda?.ingresosPorDia?.length || 0 },
        { label: "Registros por hora", value: stats.horasPico?.length || 0 },
    ] : [];

    const items = isRestaurantAdmin ? restaurantItems : globalItems;

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                        Panel de administracion
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5", lineHeight: 1.2 }}>
                        Reportes <em style={{ color: "#c9a84c", fontStyle: "italic" }}>{isRestaurantAdmin ? "del Restaurante" : "Generales"}</em>
                    </h1>
                </div>
                <button
                    onClick={refreshStats}
                    className="px-5 py-2 rounded-lg text-sm font-medium"
                    style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                >
                    Actualizar
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {items.length > 0 ? (
                    items.map((item) => (
                        <div key={item.label} className="rounded-3xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.15)" }}>
                            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#5a5040" }}>{item.label}</p>
                            <p className="text-3xl font-semibold" style={{ color: "#f0e8d5" }}>{item.value ?? "N/A"}</p>
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 text-center py-16" style={{ color: "#3a3328" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem" }}>
                            No se encontraron estadisticas.
                        </p>
                    </div>
                )}
            </div>

            {stats?.reservacionesPorEstado && !isRestaurantAdmin && (
                <div className="mt-8 rounded-3xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.15)" }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: "#f0e8d5" }}>Reservaciones por estado</h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.reservacionesPorEstado.map((statusItem) => (
                            <div key={statusItem._id} className="rounded-2xl p-4" style={{ background: "rgba(201,168,76,0.07)", color: "#f0e8d5" }}>
                                <p className="text-xs uppercase tracking-widest" style={{ color: "#9a8e74" }}>{statusItem._id}</p>
                                <p className="text-2xl font-semibold">{statusItem.count}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
