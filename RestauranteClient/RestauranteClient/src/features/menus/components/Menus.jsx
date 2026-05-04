import { useState, useEffect } from "react";
import { useMenuStore } from "../store/useMenuStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";
import { MenuModal } from "./MenuModal.jsx";
import { useUIStore } from "../../../shared/components/ui/store/uiStore.js";

const TYPE_LABELS = {
    DAILY: { label: "Diario", color: "#c9a84c", bg: "rgba(201,168,76,0.1)", border: "rgba(201,168,76,0.3)" },
    EVENT: { label: "Evento", color: "#7eb8f7", bg: "rgba(126,184,247,0.1)", border: "rgba(126,184,247,0.3)" },
    PROMOTION: { label: "Promoción", color: "#82d98c", bg: "rgba(130,217,140,0.1)", border: "rgba(130,217,140,0.3)" },
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" });
};

export const Menus = () => {
    const { menus, loading, error, getMenus, deleteMenu } = useMenuStore();
    const { restaurants, getRestaurants } = useRestaurantStore();
    const [openModal, setOpenModal] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const { openConfirm } = useUIStore();

    useEffect(() => {
        getMenus();
        getRestaurants();
    }, [getMenus, getRestaurants]);

    useEffect(() => { if (error) showError(error); }, [error]);

    if (loading && menus.length === 0) return <Spinner />;

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                        Panel de administración
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5", lineHeight: 1.2 }}>
                        Gestión de <em style={{ color: "#c9a84c", fontStyle: "italic" }}>Menús</em>
                    </h1>
                </div>
                <button
                    onClick={() => { setSelectedMenu(null); setOpenModal(true); }}
                    className="px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                    style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                >
                    + Nuevo Menú
                </button>
            </div>

            {/* TABLA */}
            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "12px", overflow: "hidden" }}>

                {/* Cabecera */}
                <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest"
                    style={{ background: "#1c1a16", color: "#5a5040", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                    <span className="col-span-1">#</span>
                    <span className="col-span-2">Nombre</span>
                    <span className="col-span-2">Restaurante</span>
                    <span className="col-span-1">Tipo</span>
                    <span className="col-span-2">Platillos</span>
                    <span className="col-span-2">Vigencia</span>
                    <span className="col-span-1">Estado</span>
                    <span className="col-span-1 text-right">Acc.</span>
                </div>

                {menus.length === 0 ? (
                    <div className="text-center py-16" style={{ color: "#3a3328" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem" }}>Sin menús registrados</p>
                        <p className="text-xs mt-1">Crea el primero para comenzar</p>
                    </div>
                ) : (
                    menus.map((menu, index) => {
                        const typeInfo = TYPE_LABELS[menu.type] || TYPE_LABELS.DAILY;
                        const restaurantName = typeof menu.restaurant === "object"
                            ? menu.restaurant?.name
                            : restaurants.find((r) => r._id === menu.restaurant)?.name || "—";

                        return (
                            <div key={menu._id}
                                className="grid grid-cols-12 px-6 py-4 items-center transition-all"
                                style={{ borderBottom: "1px solid rgba(201,168,76,0.07)", color: "#f0e8d5" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#1c1a16")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>

                                <span className="col-span-1 text-xs" style={{ color: "#5a5040" }}>{index + 1}</span>

                                <div className="col-span-2 pr-2">
                                    <p className="text-sm font-medium truncate" style={{ color: "#c9a84c" }}>{menu.name}</p>
                                    {menu.description && (
                                        <p className="text-xs truncate" style={{ color: "#5a5040" }}>{menu.description}</p>
                                    )}
                                </div>

                                <span className="col-span-2 text-sm truncate pr-2" style={{ color: "#9a8e74" }}>
                                    {restaurantName}
                                </span>

                                <span className="col-span-1">
                                    <span className="px-2 py-1 rounded text-xs"
                                        style={{ background: typeInfo.bg, color: typeInfo.color, border: `1px solid ${typeInfo.border}` }}>
                                        {typeInfo.label}
                                    </span>
                                </span>

                                <span className="col-span-2 text-xs" style={{ color: "#9a8e74" }}>
                                    {menu.dishes?.length ?? 0} platillo{menu.dishes?.length !== 1 ? "s" : ""}
                                </span>

                                <span className="col-span-2 text-xs" style={{ color: "#9a8e74" }}>
                                    {menu.type === "EVENT" && menu.validFrom && menu.validUntil
                                        ? `${formatDate(menu.validFrom)} → ${formatDate(menu.validUntil)}`
                                        : "—"}
                                </span>

                                <span className="col-span-1">
                                    <span className="px-2 py-1 rounded text-xs"
                                        style={{
                                            background: menu.isActive ? "rgba(201,168,76,0.1)" : "rgba(224,90,90,0.1)",
                                            color: menu.isActive ? "#c9a84c" : "#e05a5a",
                                            border: `1px solid ${menu.isActive ? "rgba(201,168,76,0.3)" : "rgba(224,90,90,0.3)"}`,
                                        }}>
                                        {menu.isActive ? "Activo" : "Inactivo"}
                                    </span>
                                </span>

                                <div className="col-span-1 flex flex-col gap-1 items-end">
                                    <button
                                        onClick={() => { setSelectedMenu(menu); setOpenModal(true); }}
                                        className="px-2 py-1 rounded text-xs w-full text-center"
                                        style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}>
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => openConfirm({
                                            title: "Eliminar menú",
                                            message: `¿Eliminar "${menu.name}"?`,
                                            onConfirm: () => deleteMenu(menu._id),
                                        })}
                                        className="px-2 py-1 rounded text-xs w-full text-center"
                                        style={{ background: "rgba(224,90,90,0.1)", color: "#e05a5a", border: "1px solid rgba(224,90,90,0.2)" }}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <MenuModal
                isOpen={openModal}
                onClose={() => { setOpenModal(false); setSelectedMenu(null); }}
                menu={selectedMenu}
                restaurants={restaurants}
            />
        </div>
    );
};
