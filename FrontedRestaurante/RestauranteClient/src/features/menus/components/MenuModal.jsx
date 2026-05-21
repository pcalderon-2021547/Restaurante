import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMenuStore } from "../store/useMenuStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showSuccess, showError } from "../../../shared/utils/toast.js";

export const MenuModal = ({ isOpen, onClose, menu, restaurants = [] }) => {
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
            description: "",
            restaurant: "",
            type: "DAILY",
            validFrom: "",
            validUntil: "",
            isActive: true,
        }
    });

    const { createMenu, updateMenu, loading } = useMenuStore();
    const selectedType = watch("type");

    useEffect(() => {
        if (isOpen) {
            if (menu) {
                reset({
                    name: menu.name || "",
                    description: menu.description || "",
                    restaurant: menu.restaurant?._id || menu.restaurant || "",
                    type: menu.type || "DAILY",
                    validFrom: menu.validFrom ? menu.validFrom.slice(0, 10) : "",
                    validUntil: menu.validUntil ? menu.validUntil.slice(0, 10) : "",
                    isActive: menu.isActive ?? true,
                });
            } else {
                reset({
                    name: "",
                    description: "",
                    restaurant: "",
                    type: "DAILY",
                    validFrom: "",
                    validUntil: "",
                    isActive: true,
                });
            }
        }
    }, [isOpen, menu]);

    const onSubmit = async (data) => {
        // Limpiar fechas si no es tipo EVENT
        if (data.type !== "EVENT") {
            delete data.validFrom;
            delete data.validUntil;
        }

        // Convertir isActive de string a boolean (viene como string desde el select)
        data.isActive = data.isActive === true || data.isActive === "true";

        if (menu) {
            await updateMenu(menu._id, data);
        } else {
            await createMenu(data);
        }

        const storeState = useMenuStore.getState();
        if (!storeState.error) {
            showSuccess(menu ? "Menú actualizado" : "Menú creado");
            onClose();
        } else {
            showError(storeState.error);
        }
    };

    if (!isOpen) return null;

    const inputStyle = {
        background: "#1c1a16",
        border: "1px solid rgba(201,168,76,0.2)",
        color: "#f0e8d5",
        borderRadius: "6px",
        padding: "10px 14px",
        fontSize: "0.9rem",
        outline: "none",
        width: "100%",
    };

    const labelStyle = {
        color: "#5a5040",
        fontSize: "0.7rem",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
    };

    const Field = ({ label, name, type = "text", placeholder, rules = {} }) => (
        <div className="flex flex-col gap-1">
            <label style={labelStyle}>{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                {...register(name, rules)}
            />
            {errors[name] && <p className="text-xs" style={{ color: "#e05a5a" }}>{errors[name].message}</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div
                style={{
                    background: "#141210",
                    border: "1px solid rgba(201,168,76,0.2)",
                    borderRadius: "16px",
                    width: "100%",
                    maxWidth: "540px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                }}
            >
                {/* HEADER */}
                <div className="p-5" style={{ background: "linear-gradient(135deg, #1c1408 0%, #0a0906 100%)", borderBottom: "1px solid rgba(201,168,76,0.2)", borderRadius: "16px 16px 0 0" }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c", fontSize: "1.3rem", letterSpacing: "0.05em" }}>
                        {menu ? "Editar Menú" : "Nuevo Menú"}
                    </h2>
                    <p className="text-xs mt-1" style={{ color: "#5a5040" }}>
                        {menu ? "Modifica los datos del menú" : "Completa la información del nuevo menú"}
                    </p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

                    {/* Nombre */}
                    <Field
                        label="Nombre del menú"
                        name="name"
                        placeholder="Ej. Menú del Día"
                        rules={{ required: "El nombre es obligatorio" }}
                    />

                    {/* Descripción */}
                    <div className="flex flex-col gap-1">
                        <label style={labelStyle}>Descripción</label>
                        <textarea
                            rows={2}
                            placeholder="Describe brevemente el menú..."
                            style={{ ...inputStyle, resize: "none" }}
                            onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                            {...register("description")}
                        />
                    </div>

                    {/* Restaurante — solo al crear, deshabilitado al editar */}
                    <div className="flex flex-col gap-1">
                        <label style={labelStyle}>Restaurante</label>
                        {menu ? (
                            <div style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }}>
                                {restaurants.find((r) => r._id === (menu.restaurant?._id || menu.restaurant))?.name || "Restaurante"}
                            </div>
                        ) : (
                            <select
                                style={{ ...inputStyle, cursor: "pointer" }}
                                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                                onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                                {...register("restaurant", { required: "Selecciona un restaurante" })}
                            >
                                <option value="">— Selecciona un restaurante —</option>
                                {restaurants.map((r) => (
                                    <option key={r._id} value={r._id}>{r.name}</option>
                                ))}
                            </select>
                        )}
                        {errors.restaurant && <p className="text-xs" style={{ color: "#e05a5a" }}>{errors.restaurant.message}</p>}
                    </div>

                    {/* Tipo de menú */}
                    <div className="flex flex-col gap-1">
                        <label style={labelStyle}>Tipo de menú</label>
                        <select
                            style={{ ...inputStyle, cursor: "pointer" }}
                            onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                            {...register("type", { required: "El tipo es obligatorio" })}
                        >
                            <option value="DAILY">Diario</option>
                            <option value="EVENT">Evento</option>
                            <option value="PROMOTION">Promoción</option>
                        </select>
                        {errors.type && <p className="text-xs" style={{ color: "#e05a5a" }}>{errors.type.message}</p>}
                    </div>

                    {/* Fechas — solo si tipo EVENT */}
                    {selectedType === "EVENT" && (
                        <div className="grid grid-cols-2 gap-4 p-3 rounded-lg" style={{ background: "rgba(126,184,247,0.05)", border: "1px solid rgba(126,184,247,0.15)" }}>
                            <p className="col-span-2 text-xs" style={{ color: "#7eb8f7" }}>
                                Los menús de tipo Evento requieren fechas de vigencia
                            </p>
                            <Field
                                label="Fecha inicio"
                                name="validFrom"
                                type="date"
                                rules={{ required: "La fecha de inicio es obligatoria para menús de Evento" }}
                            />
                            <Field
                                label="Fecha fin"
                                name="validUntil"
                                type="date"
                                rules={{ required: "La fecha de fin es obligatoria para menús de Evento" }}
                            />
                        </div>
                    )}

                    {/* Estado */}
                    <div className="flex flex-col gap-1">
                        <label style={labelStyle}>Estado</label>
                        <select
                            style={{ ...inputStyle, cursor: "pointer" }}
                            onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                            {...register("isActive")}
                        >
                            <option value="true">Activo</option>
                            <option value="false">Inactivo</option>
                        </select>
                    </div>

                    {/* BOTONES */}
                    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg text-sm"
                            style={{ background: "#1c1a16", color: "#5a5040", border: "1px solid rgba(201,168,76,0.1)" }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 rounded-lg text-sm font-medium"
                            style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                        >
                            {loading ? <Spinner small /> : menu ? "Guardar cambios" : "Crear menú"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
