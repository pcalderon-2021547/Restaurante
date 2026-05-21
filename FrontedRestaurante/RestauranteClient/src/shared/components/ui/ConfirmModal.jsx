import { useUIStore } from "./store/uiStore";

export const ConfirmModal = () => {
    const { confirmModal, closeConfirm } = useUIStore();

    if (!confirmModal.isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200
        }}>
            <div style={{
                background: '#1c1a16',
                border: '1px solid #2e2a22',
                borderRadius: 3,
                padding: '2rem',
                width: 380,
                textAlign: 'center',
                fontFamily: "'DM Sans', sans-serif"
            }}>
                <h2 style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '1.5rem',
                    fontWeight: 400,
                    color: '#f0e8d5',
                    marginBottom: '0.75rem'
                }}>
                    {confirmModal.title}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#5a5040', marginBottom: '2rem' }}>
                    {confirmModal.message}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button
                        onClick={closeConfirm}
                        style={{
                            padding: '0.65rem 1.5rem',
                            background: 'none',
                            border: '1px solid #2e2a22',
                            borderRadius: 2,
                            color: '#5a5040',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fontFamily: "'DM Sans', sans-serif"
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => { confirmModal.onConfirm?.(); closeConfirm(); }}
                        style={{
                            padding: '0.65rem 1.5rem',
                            background: 'linear-gradient(135deg, #c9a84c, #e8c96e)',
                            border: 'none',
                            borderRadius: 2,
                            color: '#0a0906',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            fontFamily: "'DM Sans', sans-serif"
                        }}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};
