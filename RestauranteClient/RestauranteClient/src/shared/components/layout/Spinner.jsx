export const Spinner = () => {
    return (
        <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0906'
        }}>
            <div style={{
                width: 36,
                height: 36,
                border: '2px solid #2a2218',
                borderTop: '2px solid #c9a84c',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};
