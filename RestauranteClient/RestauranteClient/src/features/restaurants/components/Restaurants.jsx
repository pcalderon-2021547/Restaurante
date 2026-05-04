import { useState, useEffect } from "react";
import { useRestaurantStore } from "../store/useRestaurantStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";
import { RestaurantModal } from "./RestaurantModal.jsx";
import { useUIStore } from "../../../shared/components/ui/store/uiStore.js";

export const Restaurants = () => {
    const { restaurants, loading, error, getRestaurants, deleteRestaurant } = useRestaurantStore();
    const [openModal, setOpenModal] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const { openConfirm } = useUIStore();

    useEffect(() => { getRestaurants(); }, [getRestaurants]);
    useEffect(() => { if (error) showError(error); }, [error]);

    if (loading && restaurants.length === 0) return <Spinner />;

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>Panel de administración</p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5" }}>
                        Gestión de <em style={{ color: "#c9a84c" }}>Restaurantes</em>
                    </h1>
                </div>
                <button
                    onClick={() => { setSelectedRestaurant(null); setOpenModal(true); }}
                    className="px-5 py-2 rounded-lg text-sm font-medium"
                    style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>
                    + Nuevo Restaurante
                </button>
            </div>

            {/* TABLA */}
            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "12px", overflow: "hidden" }}>

                {/* Cabecera */}
                <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest"
                    style={{ background: "#1c1a16", color: "#5a5040", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                    <span className="col-span-1">#</span>
                    <span className="col-span-3">Nombre</span>
                    <span className="col-span-2">Categoría</span>
                    <span className="col-span-2">Teléfono</span>
                    <span className="col-span-2">Horario</span>
                    <span className="col-span-1">Estado</span>
                    <span className="col-span-1 text-right">Acc.</span>
                </div>

                {restaurants.length === 0 ? (
                    <div className="text-center py-16" style={{ color: "#3a3328" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem" }}>Sin restaurantes registrados</p>
                        <p className="text-xs mt-1">Crea el primero para comenzar</p>
                    </div>
                ) : (
                    restaurants.map((r, index) => (
                        <div key={r._id}
                            className="grid grid-cols-12 px-6 py-4 items-center"
                            style={{ borderBottom: "1px solid rgba(201,168,76,0.07)", color: "#f0e8d5" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#1c1a16"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>

                            <span className="col-span-1 text-xs" style={{ color: "#5a5040" }}>{index + 1}</span>
                            <span className="col-span-3 font-medium text-sm truncate pr-2" style={{ color: "#c9a84c" }}>{r.name}</span>
                            <span className="col-span-2 text-sm truncate pr-2" style={{ color: "#9a8e74" }}>{r.category}</span>
                            <span className="col-span-2 text-sm pr-2" style={{ color: "#9a8e74" }}>{r.phone}</span>
                            <span className="col-span-2 text-xs pr-2" style={{ color: "#9a8e74" }}>{r.openingHour} - {r.closingHour}</span>
                            <span className="col-span-1">
                                <span className="px-2 py-1 rounded text-xs"
                                    style={{
                                        background: r.isActive ? "rgba(201,168,76,0.1)" : "rgba(224,90,90,0.1)",
                                        color: r.isActive ? "#c9a84c" : "#e05a5a",
                                        border: `1px solid ${r.isActive ? "rgba(201,168,76,0.3)" : "rgba(224,90,90,0.3)"}`,
                                    }}>
                                    {r.isActive ? "Activo" : "Inactivo"}
                                </span>
                            </span>
                            <div className="col-span-1 flex flex-col gap-1 items-end">
                                <button
                                    onClick={() => { setSelectedRestaurant(r); setOpenModal(true); }}
                                    className="px-2 py-1 rounded text-xs w-full text-center"
                                    style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}>
                                    Editar
                                </button>
                                <button
                                    onClick={() => openConfirm({
                                        title: "Eliminar restaurante",
                                        message: `¿Eliminar "${r.name}"?`,
                                        onConfirm: () => deleteRestaurant(r._id),
                                    })}
                                    className="px-2 py-1 rounded text-xs w-full text-center"
                                    style={{ background: "rgba(224,90,90,0.1)", color: "#e05a5a", border: "1px solid rgba(224,90,90,0.2)" }}>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <RestaurantModal
                isOpen={openModal}
                onClose={() => { setOpenModal(false); setSelectedRestaurant(null); }}
                restaurant={selectedRestaurant}
            />
        </div>
    );
};