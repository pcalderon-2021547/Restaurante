import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCategoryStore } from "../store/useCategoryStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showSuccess } from "../../../shared/utils/toast.js";

export const CategoryModal = ({ isOpen, onClose, category }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { createCategory, updateCategory, loading } = useCategoryStore();

    useEffect(() => {
        if (isOpen) {
            if (category) {
                reset({ name: category.name, description: category.description });
            } else {
                reset({ name: "", description: "" });
            }
        }
    }, [isOpen, category]);

    const onSubmit = async (data) => {
        if (category) {
            await updateCategory(category._id, data);
            showSuccess("Categoría actualizada");
        } else {
            await createCategory(data);
            showSuccess("Categoría creada");
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)" }}
                className="rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">

                {/* HEADER */}
                <div className="p-5" style={{ background: "linear-gradient(135deg, #1c1408 0%, #0a0906 100%)", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
                    <h2 className="text-xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c", letterSpacing: "0.05em" }}>
                        {category ? "Editar Categoría" : "Nueva Categoría"}
                    </h2>
                    <p className="text-xs mt-1" style={{ color: "#5a5040" }}>
                        {category ? "Modifica los datos de la categoría" : "Completa la información de la nueva categoría"}
                    </p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    {/* Nombre */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium uppercase tracking-widest" style={{ color: "#5a5040" }}>
                            Nombre
                        </label>
                        <input
                            placeholder="Ej. Entradas, Postres..."
                            style={{
                                background: "#1c1a16",
                                border: "1px solid rgba(201,168,76,0.2)",
                                color: "#f0e8d5",
                                borderRadius: "6px",
                                padding: "10px 14px",
                                fontSize: "0.9rem",
                                outline: "none",
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                            onBlur={(e) => e.target.style.borderColor = "rgba(201,168,76,0.2)"}
                            {...register("name", {
                                required: "El nombre es obligatorio",
                                minLength: { value: 2, message: "Mínimo 2 caracteres" },
                            })}
                        />
                        {errors.name && <p className="text-xs" style={{ color: "#e05a5a" }}>{errors.name.message}</p>}
                    </div>

                    {/* Descripción */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium uppercase tracking-widest" style={{ color: "#5a5040" }}>
                            Descripción
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Describe brevemente esta categoría..."
                            style={{
                                background: "#1c1a16",
                                border: "1px solid rgba(201,168,76,0.2)",
                                color: "#f0e8d5",
                                borderRadius: "6px",
                                padding: "10px 14px",
                                fontSize: "0.9rem",
                                outline: "none",
                                resize: "none",
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                            onBlur={(e) => e.target.style.borderColor = "rgba(201,168,76,0.2)"}
                            {...register("description")}
                        />
                    </div>

                    {/* BOTONES */}
                    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 rounded-lg text-sm transition"
                            style={{ background: "#1c1a16", color: "#5a5040", border: "1px solid rgba(201,168,76,0.1)" }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2 rounded-lg text-sm font-medium transition"
                            style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>
                            {loading ? <Spinner small /> : category ? "Guardar cambios" : "Crear categoría"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};