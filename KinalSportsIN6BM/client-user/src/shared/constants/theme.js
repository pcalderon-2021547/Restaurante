export const COLORS = {
    primary: "#08316D", // Azul principal igual que la web
    primaryDark: "#08316D", // Azul principal igual que la web
    secondary: "#64748b", // Slate 500
    background: "#f8fafc", // Slate 50
    surface: "#ffffff",
    text: "#0f172a", // Slate 900
    textLight: "#64748b", // Slate 500
    error: "#ef4444", // Red 500
    success: "#22c55e", // Green 500
    warning: "#f59e0b", // Amber 500
    border: "#e2e8f0", // Slate 200
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const FONT_SIZE = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    huge: 32,
};

// ─────────────────────────────────────────────────────────
// Identidad visual del modulo de autenticacion (Login/Register)
// Migrada desde BackendRestaurante -> FrontedRestaurante (web)
// Paleta "obsidian & gold" del AuthPage original, adaptada a RN.
// No se usa en el resto de la app para no romper el tema claro
// existente (Fields, Profile, etc.).
// ─────────────────────────────────────────────────────────
export const AUTH_COLORS = {
    obsidian: "#0a0906",
    charcoal: "#14100a",
    panel: "#1c1a16",
    border: "#2e2a22",
    borderFocus: "rgba(201,168,76,0.55)",
    gold: "#c9a84c",
    goldLight: "#e8c96e",
    cream: "#f0e8d5",
    textMuted: "#7a6e54",
    textSubtle: "#5a5040",
    placeholder: "#4a4432",
    error: "#e05a5a",
};

export const AUTH_FONTS = {
    // 'serif' resuelve a Georgia/Times-like en iOS y Android: la
    // aproximacion nativa mas cercana a 'Cormorant Garamond' sin
    // tener que empaquetar fuentes adicionales.
    heading: "serif",
    body: undefined, // fuente de sistema (equivalente a 'DM Sans, sans-serif')
};

export const SHADOWS = {
    sm: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    md: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
};
