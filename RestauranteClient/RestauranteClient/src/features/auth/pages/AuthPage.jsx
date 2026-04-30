import { useState } from "react";
import { LoginForm } from "../components/LoginForm";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";
import { RegisterForm } from "../components/RegisterForm";

const VIEWS = { login: "login", register: "register", forgot: "forgot" };

const copy = {
    login:    { sub: "Panel de administración",  title: "Bienvenido\nde nuevo." },
    register: { sub: "Únete al sistema",          title: "Crea tu\ncuenta." },
    forgot:   { sub: "Recuperación de acceso",   title: "Restablecer\ncontraseña." },
};

const LeftPanel = () => (
    <div className="auth-left">
        <div className="auth-left-grid" />

        <div className="auth-left-ornament">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="10" stroke="#c9a84c" strokeWidth="0.8" opacity="0.5"/>
                <line x1="7.5" y1="5"  x2="7.5" y2="10" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="6"   y1="5"  x2="6"   y2="8.5" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="9"   y1="5"  x2="9"   y2="8.5" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M6 8.5 Q7.5 10 9 8.5" stroke="#c9a84c" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                <line x1="7.5" y1="10" x2="7.5" y2="17" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M14.5 5 Q16.5 8.5 16.5 11 L14.5 11 L14.5 17"
                    stroke="#c9a84c" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="auth-brand">Gestión Restaurante</span>
        </div>

        <div>
            <p className="auth-left-sub">Sistema de administración</p>
            <h1 className="auth-left-tagline">
                El arte de<br/>
                <em>servir</em> con<br/>
                precisión.
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span className="gold-rule" />
                <span style={{
                    fontSize: "0.72rem", letterSpacing: "0.18em",
                    color: "#3a3328", textTransform: "uppercase"
                }}>
                    Acceso restringido
                </span>
            </div>
        </div>
    </div>
);

export const AuthPage = () => {
    const [view, setView] = useState(VIEWS.login);
    const { sub, title } = copy[view];

    return (
        <div className="auth-root">
            <LeftPanel />

            <div className="auth-right">
                <div className="auth-card" key={view}>
                    <p className="auth-card-sub">{sub}</p>

                    <h2 className="auth-card-title" style={{ whiteSpace: "pre-line" }}>
                        {title}
                    </h2>

                    <div style={{
                        width: 32, height: 1,
                        background: "linear-gradient(90deg, #c9a84c, transparent)",
                        marginBottom: "2rem"
                    }} />

                    {view === VIEWS.login && (
                        <LoginForm
                            onForgot={() => setView(VIEWS.forgot)}
                            onRegister={() => setView(VIEWS.register)}
                        />
                    )}
                    {view === VIEWS.register && (
                        <RegisterForm onSwitch={() => setView(VIEWS.login)} />
                    )}
                    {view === VIEWS.forgot && (
                        <ForgotPasswordForm onSwitch={() => setView(VIEWS.login)} />
                    )}
                </div>
            </div>
        </div>
    );
};
