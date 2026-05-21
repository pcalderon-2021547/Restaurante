import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useReportStore } from "../store/useReportStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showSuccess } from "../../../shared/utils/toast.js";

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

export const ReportsModal = ({ isOpen, onClose, report }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { createReport, updateReport, loading } = useReportStore();

    useEffect(() => {
        if (!isOpen) return;

        reset(
            report
                ? {
                      title: report.title,
                      type: report.type,
                      date: report.date,
                  }
                : { title: "", type: "ventas", date: "" }
        );
    }, [isOpen, report]);

    const onSubmit = async (data) => {
        const payload = { title: data.title, type: data.type, date: data.date };

        if (report) {
            await updateReport(report.id, payload);
            showSuccess("Reporte actualizado");
        } else {
            await createReport(payload);
            showSuccess("Reporte creado");
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)" }}>
                <div className="p-5" style={{ background: "linear-gradient(135deg, #1c1408, #0a0906)", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
                    <h2 className="text-xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c" }}>
                        {report ? "Editar Reporte" : "Nuevo Reporte"}
                    </h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Nombre</label>
                        <input style={inputStyle} {...register("title", { required: "El nombre es obligatorio" })} />
                        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Tipo</label>
                        <select style={inputStyle} {...register("type")}> 
                            <option value="ventas">Ventas</option>
                            <option value="inventario">Inventario</option>
                            <option value="clientes">Clientes</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Fecha</label>
                        <input type="date" style={inputStyle} {...register("date", { required: "La fecha es obligatoria" })} />
                        {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
                    </div>
                    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg" style={{ background: "#1c1a16", color: "#5a5040", border: "1px solid rgba(201,168,76,0.1)" }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>
                            {loading ? <Spinner small /> : report ? "Guardar" : "Crear"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
