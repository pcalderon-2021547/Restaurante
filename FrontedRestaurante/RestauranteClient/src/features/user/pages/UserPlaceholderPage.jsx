export const UserPlaceholderPage = ({ title, description }) => {
    return (
        <div className="rounded-xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
            <p className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                Sección de usuario
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", color: "#c9a84c" }}>
                {title}
            </h2>
            <p className="mt-2 text-sm" style={{ color: "#9a8e74" }}>
                {description || "Estamos preparando esta sección para ti."}
            </p>
        </div>
    );
};
