import { useNavigate } from "react-router-dom";

export const UnauthorizedPage = () => {
    const navigate = useNavigate();
    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0906',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            fontFamily: "'DM Sans', sans-serif"
        }}>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4a4030' }}>
                Acceso denegado
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.5rem', fontWeight: 300, color: '#f0e8d5' }}>
                Sin autorización
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#4a4030', maxWidth: 320, textAlign: 'center' }}>
                Solo los administradores pueden acceder a esta sección.
            </p>
            <button
                onClick={() => navigate("/")}
                style={{
                    marginTop: '1rem',
                    background: 'linear-gradient(135deg, #c9a84c, #e8c96e)',
                    color: '#0a0906',
                    border: 'none',
                    borderRadius: '2px',
                    padding: '0.75rem 2rem',
                    fontSize: '0.75rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500
                }}
            >
                Volver al inicio
            </button>
        </div>
    );
};
