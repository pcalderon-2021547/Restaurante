import { useEffect, useMemo, useState } from "react";
import { useReportStore } from "../store/useReportStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError, showSuccess } from "../../../shared/utils/toast.js";
import { useAuthStore } from "../../auth/store/authStore.js";
import { getRestaurants } from "../../../shared/api";

const readList = (response, keys) => {
    const data = response?.data ?? response;
    for (const key of keys) {
        if (Array.isArray(data?.[key])) return data[key];
    }
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
};

export const Reports = () => {
    const {
        stats,
        loading,
        sendingPdf,
        error,
        getGeneralStats,
        getRestaurantAdminStats,
        sendGeneralPdf,
        sendRestaurantPdf,
        sendOwnRestaurantPdf
    } = useReportStore();
    const user = useAuthStore((state) => state.user);
    const role = user?.role;
    const isRestaurantAdmin = role === "ADMIN_RESTAURANT_ROLE";
    const refreshStats = isRestaurantAdmin ? getRestaurantAdminStats : getGeneralStats;

    const [restaurants, setRestaurants] = useState([]);
    const [reportType, setReportType] = useState("general");
    const [selectedRestaurant, setSelectedRestaurant] = useState("");
    const [email, setEmail] = useState(user?.email || "");

    useEffect(() => {
        refreshStats();
    }, [refreshStats]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    useEffect(() => {
        if (isRestaurantAdmin) {
            setReportType("own");
            return;
        }

        const loadRestaurants = async () => {
            try {
                const response = await getRestaurants();
                const list = readList(response, ["restaurants"]).filter((restaurant) => restaurant.isActive !== false);
                setRestaurants(list);
                setSelectedRestaurant((current) => current || list[0]?._id || "");
            } catch (err) {
                showError(err.response?.data?.message || "No se pudieron cargar restaurantes.");
            }
        };

        loadRestaurants();
    }, [isRestaurantAdmin]);

    const items = useMemo(() => {
        if (!stats) return [];

        if (isRestaurantAdmin) {
            return [
                { label: "Platillos en ranking", value: stats.topDishes?.length || 0 },
                { label: "Hora mas concurrida", value: stats.horaMasConcurrida ?? "N/A" },
                { label: "Dias con demanda", value: stats.demanda?.ordenesPorDia?.length || 0 },
                { label: "Dias con ingresos", value: stats.demanda?.ingresosPorDia?.length || 0 },
                { label: "Registros por hora", value: stats.horasPico?.length || 0 },
            ];
        }

        return [
            { label: "Restaurantes activos", value: stats.restaurantes },
            { label: "Pedidos totales", value: stats.ordenes },
            { label: "Reservaciones", value: stats.reservaciones },
            { label: "Eventos registrados", value: stats.eventos },
            { label: "Platos disponibles", value: stats.platillos },
            { label: "Ingresos totales", value: `Q${Number(stats.ingresosTotales || 0).toFixed(2)}` },
            { label: "Ticket promedio", value: `Q${Number(stats.ticketPromedio || 0).toFixed(2)}` },
            { label: "Calificacion promedio", value: stats.calificacionPromedio },
        ];
    }, [isRestaurantAdmin, stats]);

    const handleSendPdf = async () => {
        const cleanEmail = email.trim();
        if (!cleanEmail || !cleanEmail.includes("@")) {
            showError("Ingresa un correo valido para recibir el PDF.");
            return;
        }

        if (!isRestaurantAdmin && reportType === "restaurant" && !selectedRestaurant) {
            showError("Selecciona un restaurante para el reporte especifico.");
            return;
        }

        try {
            const result = isRestaurantAdmin
                ? await sendOwnRestaurantPdf(cleanEmail)
                : reportType === "general"
                    ? await sendGeneralPdf(cleanEmail)
                    : await sendRestaurantPdf(selectedRestaurant, cleanEmail);

            showSuccess(result?.message || "Reporte PDF enviado correctamente.");
        } catch (err) {
            showError(err.message || "No se pudo enviar el PDF.");
        }
    };

    if (loading && !stats) return <Spinner />;

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                        Panel de administracion
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5", lineHeight: 1.2 }}>
                        Reportes <em style={{ color: "#c9a84c", fontStyle: "italic" }}>{isRestaurantAdmin ? "de mi restaurante" : "PDF y generales"}</em>
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

            <section className="rounded-xl p-5 mb-8" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.15)" }}>
                <div className="grid gap-4 lg:grid-cols-4">
                    {!isRestaurantAdmin && (
                        <div>
                            <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: "#9a8e74" }}>
                                Tipo de reporte
                            </label>
                            <select
                                value={reportType}
                                onChange={(event) => setReportType(event.target.value)}
                                className="w-full px-3 py-2 rounded"
                                style={{ background: "#0f0d0a", color: "#f0e8d5", border: "1px solid rgba(201,168,76,0.2)" }}
                            >
                                <option value="general">General de todos</option>
                                <option value="restaurant">Restaurante especifico</option>
                            </select>
                        </div>
                    )}

                    {!isRestaurantAdmin && reportType === "restaurant" && (
                        <div>
                            <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: "#9a8e74" }}>
                                Restaurante
                            </label>
                            <select
                                value={selectedRestaurant}
                                onChange={(event) => setSelectedRestaurant(event.target.value)}
                                className="w-full px-3 py-2 rounded"
                                style={{ background: "#0f0d0a", color: "#f0e8d5", border: "1px solid rgba(201,168,76,0.2)" }}
                            >
                                {restaurants.map((restaurant) => (
                                    <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: "#9a8e74" }}>
                            Correo destino
                        </label>
                        <input
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full px-3 py-2 rounded"
                            placeholder="correo@dominio.com"
                            style={{ background: "#0f0d0a", color: "#f0e8d5", border: "1px solid rgba(201,168,76,0.2)" }}
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleSendPdf}
                            disabled={sendingPdf}
                            className="w-full px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                            style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                        >
                            {sendingPdf ? "Enviando..." : "Enviar PDF"}
                        </button>
                    </div>
                </div>
                <p className="mt-3 text-sm" style={{ color: "#7a6e54" }}>
                    {isRestaurantAdmin
                        ? "Tu rol solo puede enviar el reporte del restaurante asignado a tu cuenta."
                        : "El admin puede enviar un reporte general completo o uno especifico por restaurante."}
                </p>
            </section>

            <div className="grid gap-4 md:grid-cols-3">
                {items.length > 0 ? (
                    items.map((item) => (
                        <div key={item.label} className="rounded-xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.15)" }}>
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
                <div className="mt-8 rounded-xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.15)" }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: "#f0e8d5" }}>Reservaciones por estado</h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.reservacionesPorEstado.map((statusItem) => (
                            <div key={statusItem._id} className="rounded-lg p-4" style={{ background: "rgba(201,168,76,0.07)", color: "#f0e8d5" }}>
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
