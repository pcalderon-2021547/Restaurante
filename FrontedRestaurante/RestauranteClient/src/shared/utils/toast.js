import { toast } from "react-hot-toast";

const baseStyle = {
    borderRadius: "2px",
    fontWeight: 400,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.85rem",
    padding: "14px 20px",
    letterSpacing: "0.03em",
};

export const showSuccess = (message) =>
    toast.success(message, {
        style: {
            ...baseStyle,
            background: "#1c1a16",
            color: "#c9a84c",
            border: "1px solid rgba(201,168,76,0.3)",
        },
        iconTheme: { primary: "#c9a84c", secondary: "#0a0906" },
    });

export const showError = (message) =>
    toast.error(message, {
        style: {
            ...baseStyle,
            background: "#1c1a16",
            color: "#e05a5a",
            border: "1px solid rgba(224,90,90,0.3)",
        },
        iconTheme: { primary: "#e05a5a", secondary: "#0a0906" },
    });

export const showInfo = (message) =>
    toast(message, {
        style: {
            ...baseStyle,
            background: "#1c1a16",
            color: "#9a8e74",
            border: "1px solid #2a2218",
        },
    });
