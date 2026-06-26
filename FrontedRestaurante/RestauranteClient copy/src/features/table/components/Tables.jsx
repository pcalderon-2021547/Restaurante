import { useState, useEffect, useMemo } from "react";
import { useTableStore } from "../store/useTableStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";
import { TableModal } from "./TableModal.jsx";
import { useUIStore } from "../../../shared/components/ui/store/uiStore.js";

const statusLabel = {
    available: { label: "Disponible", color: "#c9a84c", bg: "rgba(201,168,76,0.1)",  border: "rgba(201,168,76,0.3)"  },
    occupied:  { label: "Ocupada",    color: "#e05a5a", bg: "rgba(224,90,90,0.1)",   border: "rgba(224,90,90,0.3)"   },
    reserved:  { label: "Reservada",  color: "#6a9fd8", bg: "rgba(106,159,216,0.1)", border: "rgba(106,159,216,0.3)" },
};

export const Tables = () => {
    const { tables, loading, error, getTables, deleteTable } = useTableStore();
    const { restaurants, getRestaurants } = useRestaurantStore();
    const [openModal, setOpenModal]           = useState(false);
    const [selectedTable, setSelectedTable]   = useState(null);
    const [filterRestaurant, setFilterRestaurant] = useState(""); // "" = todos
    const [searchNumber, setSearchNumber]     = useState("");
    const { openConfirm } = useUIStore();

    useEffect(() => { getTables(); getRestaurants(); }, [getTables, getRestaurants]);
    useEffect(() => { if (error) showError(error); }, [error]);

    // Filtrado: primero por restaurante, luego por número
    const filtered = useMemo(() => {
        let result = [...tables];
        if (filterRestaurant) {
            result = result.filter((t) =>
                (t.restaurant?._id ?? t.restaurant) === filterRestaurant
            );
        }
        if (searchNumber.trim()) {
            result = result.filter((t) =>
                String(t.number).includes(searchNumber.trim())
            );
        }
        // Ordenar por número
        return result.sort((a, b) => a.number - b.number);
    }, [tables, filterRestaurant, searchNumber]);

    if (loading && tables.length === 0) return <Spinner />;

    const inputBase = {
        background:   "#1c1a16",
        border:       "1px solid rgba(201,168,76,0.2)",
        color:        "#f0e8d5",
        borderRadius: "8px",
        padding:      "8px 14px",
        fontSize:     "0.85rem",
        outline:      "none",
    };

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>Panel de administración</p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5" }}>
                        Gestión de <em style={{ color: "#c9a84c" }}>Mesas</em>
                    </h1>
                </div>
                <button
                    onClick={() => { setSelectedTable(null); setOpenModal(true); }}
                    className="px-5 py-2 rounded-lg text-sm font-medium"
                    style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>
                    + Nueva Mesa
                </button>
            </div>

            {/* FILTROS */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                {/* Selector de restaurante */}
                <select
                    value={filterRestaurant}
                    onChange={(e) => { setFilterRestaurant(e.target.value); setSearchNumber(""); }}
                    style={{ ...inputBase, flex: 1 }}
                    onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                    onBlur={(e)  => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}>
                    <option value="">Todos los restaurantes</option>
                    {restaurants.map((r) => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                </select>

                {/* Búsqueda por número */}
                <input
                    type="number"
                    min="1"
                    placeholder="🔍 Buscar por número de mesa…"
                    value={searchNumber}
                    onChange={(e) => setSearchNumber(e.target.value)}
                    style={{ ...inputBase, flex: 1 }}
                    onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                    onBlur={(e)  => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                />
            </div>

            {/* Contador */}
            {(filterRestaurant || searchNumber) && (
                <p className="text-xs mb-4" style={{ color: "#5a5040" }}>
                    {filtered.length} mesa{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
                    {filterRestaurant && ` en "${restaurants.find(r => r._id === filterRestaurant)?.name}"`}
                    {searchNumber && ` con número "${searchNumber}"`}
                </p>
            )}

            {/* TABLA */}
            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "12px", overflow: "hidden" }}>

                {/* Cabecera */}
                <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest"
                    style={{ background: "#1c1a16", color: "#5a5040", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                    <span className="col-span-1">#</span>
                    <span className="col-span-1">Mesa</span>
                    <span className="col-span-3">Restaurante</span>
                    <span className="col-span-2">Ubicación</span>
                    <span className="col-span-2">Capacidad</span>
                    <span className="col-span-1">Estado</span>
                    <span className="col-span-2 text-right">Acciones</span>
                </div>

                {/* Filas */}
                {filtered.length === 0 ? (
                    <div className="text-center py-16" style={{ color: "#3a3328" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem" }}>
                            {tables.length === 0 ? "Sin mesas registradas" : "Sin resultados"}
                        </p>
                        <p className="text-xs mt-1">
                            {tables.length === 0 ? "Crea la primera para comenzar" : "Intenta con otro filtro o número"}
                        </p>
                    </div>
                ) : (
                    filtered.map((t, index) => {
                        const status = statusLabel[t.status] ?? statusLabel.available;
                        return (
                            <div key={t._id}
                                className="grid grid-cols-12 px-6 py-4 items-center"
                                style={{ borderBottom: "1px solid rgba(201,168,76,0.07)", color: "#f0e8d5" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "#1c1a16"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>

                                <span className="col-span-1 text-xs" style={{ color: "#5a5040" }}>{index + 1}</span>
                                <span className="col-span-1 font-medium text-sm" style={{ color: "#c9a84c" }}>#{t.number}</span>
                                <span className="col-span-3 text-sm truncate pr-2" style={{ color: "#9a8e74" }}>
                                    {t.restaurant?.name ?? "—"}
                                </span>
                                <span className="col-span-2 text-sm truncate pr-2" style={{ color: "#9a8e74" }}>
                                    {t.location ?? "—"}
                                </span>
                                <span className="col-span-2 text-sm" style={{ color: "#9a8e74" }}>
                                    {t.capacity} {t.capacity === 1 ? "persona" : "personas"}
                                </span>
                                <span className="col-span-1">
                                    <span className="px-2 py-1 rounded text-xs"
                                        style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
                                        {status.label}
                                    </span>
                                </span>

                                <div className="col-span-2 flex justify-end gap-2">
                                    <button
                                        onClick={() => { setSelectedTable(t); setOpenModal(true); }}
                                        className="px-2 py-1 rounded text-xs"
                                        style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}>
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => openConfirm({
                                            title:     "Eliminar mesa",
                                            message:   `¿Eliminar la mesa #${t.number}?`,
                                            onConfirm: () => deleteTable(t._id),
                                        })}
                                        className="px-2 py-1 rounded text-xs"
                                        style={{ background: "rgba(224,90,90,0.1)", color: "#e05a5a", border: "1px solid rgba(224,90,90,0.2)" }}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <TableModal
                isOpen={openModal}
                onClose={() => { setOpenModal(false); setSelectedTable(null); }}
                table={selectedTable}
            />
        </div>
    );
};