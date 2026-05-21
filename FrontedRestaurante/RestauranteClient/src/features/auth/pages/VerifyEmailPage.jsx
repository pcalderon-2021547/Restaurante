import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import { useVerifyEmail } from "../hooks/useVerifyEmail";

export const VerifyEmailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = new URLSearchParams(location.search).get("token");

    const handleFinish = useCallback(() => {
        setTimeout(() => navigate("/"), 2000);
    }, [navigate]);

    const { status, message } = useVerifyEmail(token, handleFinish);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0906',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            {/* Ornament */}
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ marginBottom: '2rem' }}>
                <circle cx="28" cy="28" r="26" stroke="#c9a84c" strokeWidth="0.8" opacity="0.4"/>
                <circle cx="28" cy="28" r="21" stroke="#c9a84c" strokeWidth="0.4" opacity="0.2"/>
                <line x1="20" y1="14" x2="20" y2="24" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="17" y1="14" x2="17" y2="21" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="23" y1="14" x2="23" y2="21" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M17 21 Q20 24 23 21" stroke="#c9a84c" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <line x1="20" y1="24" x2="20" y2="42" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M36 14 Q40 21 40 28 L36 28 L36 42" stroke="#c9a84c" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#4a4030',
                marginBottom: '0.75rem'
            }}>
                Gestión Restaurante
            </p>

            <p style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1.5rem',
                fontWeight: 300,
                color: status === 'error' ? '#e05a5a' : '#c9a84c',
                textAlign: 'center',
                maxWidth: 440,
                lineHeight: 1.5
            }} aria-live="polite">
                {status === 'loading'
                    ? 'Verificando correo...'
                    : message}
            </p>
        </div>
    );
};
