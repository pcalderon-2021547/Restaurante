import { useState, useEffect } from "react";
import { useCategoryStore } from "../store/useCategoryStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";
import { CategoryModal } from "./CategoryModal.jsx";
import { useUIStore } from "../../../shared/components/ui/store/uiStore.js";

export const Categories = () => {
    const { categories, loading, error, getCategories, deleteCategory } = useCategoryStore();
    const [openModal, setOpenModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const { openConfirm } = useUIStore();

    useEffect(() => {
        getCategories();
    }, [getCategories]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    if (loading) return <Spinner />;

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                        Panel de administración
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5", lineHeight: 1.2 }}>
                        Gestión de <em style={{ color: "#c9a84c", fontStyle: "italic" }}>Categorías</em>
                    </h1>
                </div>

                <button
                    onClick={() => { setSelectedCategory(null); setOpenModal(true); }}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>
                    + Nueva Categoría
                </button>
            </div>

            {/* TABLA */}
            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "12px", overflow: "hidden" }}>
                {/* Cabecera tabla */}
                <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-widest"
                    style={{ background: "#1c1a16", color: "#5a5040", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                    <span className="col-span-1">#</span>
                    <span className="col-span-3">Nombre</span>
                    <span className="col-span-5">Descripción</span>
                    <span className="col-span-2">Estado</span>
                    <span className="col-span-1 text-right">Acciones</span>
                </div>

                {/* Filas */}
                {categories.length === 0 ? (
                    <div className="text-center py-16" style={{ color: "#3a3328" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem" }}>Sin categorías registradas</p>
                        <p className="text-xs mt-1">Crea la primera para comenzar</p>
                    </div>
                ) : (
                    categories.map((cat, index) => (
                        <div key={cat._id}
                            className="grid grid-cols-12 px-6 py-4 items-center transition-all"
                            style={{
                                borderBottom: "1px solid rgba(201,168,76,0.07)",
                                color: "#f0e8d5",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#1c1a16"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>

                            <span className="col-span-1 text-xs" style={{ color: "#5a5040" }}>{index + 1}</span>

                            <span className="col-span-3 font-medium text-sm" style={{ color: "#c9a84c" }}>
                                {cat.name}
                            </span>

                            <span className="col-span-5 text-sm truncate pr-4" style={{ color: "#9a8e74" }}>
                                {cat.description || "—"}
                            </span>

                            <span className="col-span-2">
                                <span className="px-2 py-1 rounded text-xs"
                                    style={{
                                        background: cat.isActive ? "rgba(201,168,76,0.1)" : "rgba(224,90,90,0.1)",
                                        color: cat.isActive ? "#c9a84c" : "#e05a5a",
                                        border: `1px solid ${cat.isActive ? "rgba(201,168,76,0.3)" : "rgba(224,90,90,0.3)"}`,
                                    }}>
                                    {cat.isActive ? "Activa" : "Inactiva"}
                                </span>
                            </span>

                            <div className="col-span-1 flex justify-end gap-2">
                                <button
                                    onClick={() => { setSelectedCategory(cat); setOpenModal(true); }}
                                    className="px-3 py-1 rounded text-xs transition"
                                    style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}>
                                    Editar
                                </button>
                                <button
                                    onClick={() => openConfirm({
                                        title: "Eliminar categoría",
                                        message: `¿Eliminar "${cat.name}"?`,
                                        onConfirm: () => deleteCategory(cat._id),
                                    })}
                                    className="px-3 py-1 rounded text-xs transition"
                                    style={{ background: "rgba(224,90,90,0.1)", color: "#e05a5a", border: "1px solid rgba(224,90,90,0.2)" }}>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <CategoryModal
                isOpen={openModal}
                onClose={() => { setOpenModal(false); setSelectedCategory(null); }}
                category={selectedCategory}
            />
        </div>
    );
};