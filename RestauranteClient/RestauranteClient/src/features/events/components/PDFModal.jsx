import { useState } from "react";
import { useEventStore } from "../store/useEventStore";
import { showSuccess, showError } from "../../../shared/utils/toast.js";

export const PDFModal = ({ isOpen, onClose, event }) => {
    const [email, setEmail] = useState("");
    const { sendAllPDF, sendEventPDF, pdfLoading } = useEventStore();

    const handleSend = async () => {
        if (!email || !email.includes("@")) {
            showError("Ingresa un correo válido");
            return;
        }
        const result = event ? await sendEventPDF(event._id, email) : await sendAllPDF(email);
        if (result.success) {
            showSuccess(`PDF enviado a ${email}`);
            setEmail("");
            onClose();
        } else {
            showError("No se pudo enviar el PDF");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "16px", width: "100%", maxWidth: "400px" }}>

                <div className="p-5" style={{ background: "linear-gradient(135deg, #1c1408 0%, #0a0906 100%)", borderBottom: "1px solid rgba(201,168,76,0.2)", borderRadius: "16px 16px 0 0" }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c", fontSize: "1.3rem" }}>
                        Enviar Reporte PDF
                    </h2>
                    <p className="text-xs mt-1" style={{ color: "#5a5040" }}>
                        {event ? `Evento: ${event.name}` : "Todos los eventos"}
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Correo destino</label>
                        <input
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                background: "#1c1a16",
                                border: "1px solid rgba(201,168,76,0.2)",
                                color: "#f0e8d5",
                                borderRadius: "6px",
                                padding: "10px 14px",
                                fontSize: "0.9rem",
                                outline: "none",
                                width: "100%",
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                            onBlur={(e) => e.target.style.borderColor = "rgba(201,168,76,0.2)"}
                        />
                    </div>

                    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <button onClick={onClose}
                            className="flex-1 py-2 rounded-lg text-sm"
                            style={{ background: "#1c1a16", color: "#5a5040", border: "1px solid rgba(201,168,76,0.1)" }}>
                            Cancelar
                        </button>
                        <button onClick={handleSend} disabled={pdfLoading}
                            className="flex-1 py-2 rounded-lg text-sm font-medium"
                            style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>
                            {pdfLoading ? "Enviando..." : "Enviar PDF"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};