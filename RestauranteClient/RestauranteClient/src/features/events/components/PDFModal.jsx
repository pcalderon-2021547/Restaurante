import { useState, useMemo } from "react";
import { useEventStore } from "../store/useEventStore";
import { showSuccess, showError } from "../../../shared/utils/toast.js";

// Si llega `event` por prop  → modo evento específico (sin toggles, directo al envío).
// Sin event                  → el usuario elige entre todos los eventos o por restaurante.
export const PDFModal = ({ isOpen, onClose, events = [], event = null }) => {
    const [email, setEmail]                               = useState("");
    const [mode, setMode]                                 = useState("all"); // "all" | "restaurant"
    const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
    const { sendAllPDF, sendRestaurantPDF, sendEventPDF, pdfLoading } = useEventStore();

    // Deriva lista única de restaurantes a partir de los eventos
    const restaurants = useMemo(() => {
        const map = new Map();
        events.forEach((ev) => {
            if (ev.restaurant && ev.restaurant._id) {
                map.set(ev.restaurant._id, ev.restaurant);
            }
        });
        return Array.from(map.values());
    }, [events]);

    const handleSend = async () => {
        if (!email || !email.includes("@")) {
            showError("Ingresa un correo válido");
            return;
        }
        if (!event && mode === "restaurant" && !selectedRestaurantId) {
            showError("Selecciona un restaurante");
            return;
        }

        let result;
        if (event) {
            result = await sendEventPDF(event._id, email);
        } else if (mode === "restaurant") {
            result = await sendRestaurantPDF(selectedRestaurantId, email);
        } else {
            result = await sendAllPDF(email);
        }

        if (result.success) {
            showSuccess(`PDF enviado a ${email}`);
            handleClose();
        } else {
            showError("No se pudo enviar el PDF");
        }
    };

    const handleClose = () => {
        setEmail("");
        setMode("all");
        setSelectedRestaurantId("");
        onClose();
    };

    if (!isOpen) return null;

    const selectedRestaurant = restaurants.find((r) => r._id === selectedRestaurantId);
    const subtitle = event
        ? `Evento: ${event.name}`
        : mode === "all"
        ? "Todos los eventos registrados"
        : selectedRestaurant
        ? `Restaurante: ${selectedRestaurant.name}`
        : "Elige un restaurante";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "16px", width: "100%", maxWidth: "420px" }}>

                {/* HEADER */}
                <div className="p-5" style={{ background: "linear-gradient(135deg, #1c1408 0%, #0a0906 100%)", borderBottom: "1px solid rgba(201,168,76,0.2)", borderRadius: "16px 16px 0 0" }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c", fontSize: "1.3rem" }}>
                        Enviar Reporte PDF
                    </h2>
                    <p className="text-xs mt-1" style={{ color: "#5a5040" }}>{subtitle}</p>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-5">

                    {/* Toggles solo cuando NO es un evento específico */}
                    {!event && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setMode("all"); setSelectedRestaurantId(""); }}
                                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                                style={{
                                    background: mode === "all" ? "linear-gradient(90deg,#c9a84c,#e8c96e)" : "#1c1a16",
                                    color:      mode === "all" ? "#0a0906" : "#5a5040",
                                    border:     mode === "all" ? "none" : "1px solid rgba(201,168,76,0.15)",
                                }}>
                                Todos los eventos
                            </button>
                            <button
                                onClick={() => setMode("restaurant")}
                                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                                style={{
                                    background: mode === "restaurant" ? "linear-gradient(90deg,#c9a84c,#e8c96e)" : "#1c1a16",
                                    color:      mode === "restaurant" ? "#0a0906" : "#5a5040",
                                    border:     mode === "restaurant" ? "none" : "1px solid rgba(201,168,76,0.15)",
                                }}>
                                Por restaurante
                            </button>
                        </div>
                    )}

                    {/* Selector de restaurante */}
                    {!event && mode === "restaurant" && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                                Restaurante
                            </label>
                            {restaurants.length === 0 ? (
                                <p className="text-xs" style={{ color: "#5a5040" }}>
                                    Ningún evento tiene restaurante asignado.
                                </p>
                            ) : (
                                <select
                                    value={selectedRestaurantId}
                                    onChange={(e) => setSelectedRestaurantId(e.target.value)}
                                    style={{
                                        background:   "#1c1a16",
                                        border:       "1px solid rgba(201,168,76,0.2)",
                                        color:        selectedRestaurantId ? "#f0e8d5" : "#5a5040",
                                        borderRadius: "6px",
                                        padding:      "10px 14px",
                                        fontSize:     "0.9rem",
                                        outline:      "none",
                                        width:        "100%",
                                        cursor:       "pointer",
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                                    onBlur={(e)  => e.target.style.borderColor = "rgba(201,168,76,0.2)"}>
                                    <option value="" disabled>Selecciona un restaurante…</option>
                                    {restaurants.map((r) => (
                                        <option key={r._id} value={r._id}>{r.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {/* Correo destino */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Correo destino</label>
                        <input
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            style={{
                                background:   "#1c1a16",
                                border:       "1px solid rgba(201,168,76,0.2)",
                                color:        "#f0e8d5",
                                borderRadius: "6px",
                                padding:      "10px 14px",
                                fontSize:     "0.9rem",
                                outline:      "none",
                                width:        "100%",
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                            onBlur={(e)  => e.target.style.borderColor = "rgba(201,168,76,0.2)"}
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <button onClick={handleClose}
                            className="flex-1 py-2 rounded-lg text-sm"
                            style={{ background: "#1c1a16", color: "#5a5040", border: "1px solid rgba(201,168,76,0.1)" }}>
                            Cancelar
                        </button>
                        <button onClick={handleSend} disabled={pdfLoading}
                            className="flex-1 py-2 rounded-lg text-sm font-medium"
                            style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906", opacity: pdfLoading ? 0.6 : 1 }}>
                            {pdfLoading ? "Enviando..." : "Enviar PDF"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};