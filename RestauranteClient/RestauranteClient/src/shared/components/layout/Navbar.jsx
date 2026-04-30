import { useAuthStore } from "../../../features/auth/store/authStore";
import { AvatarUser } from "../ui/AvatarUser";

export const Navbar = () => {
    return (
        <nav className="dash-navbar">
            <div className="dash-brand">
                <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="10" stroke="#c9a84c" strokeWidth="0.8" opacity="0.6"/>
                    <line x1="7.5" y1="4.5" x2="7.5" y2="9.5" stroke="#c9a84c" strokeWidth="1.3" strokeLinecap="round"/>
                    <line x1="5.5" y1="4.5" x2="5.5" y2="8" stroke="#c9a84c" strokeWidth="1.3" strokeLinecap="round"/>
                    <line x1="9.5" y1="4.5" x2="9.5" y2="8" stroke="#c9a84c" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M5.5 8 Q7.5 10 9.5 8" stroke="#c9a84c" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
                    <line x1="7.5" y1="9.5" x2="7.5" y2="17.5" stroke="#c9a84c" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M14 4.5 Q16.5 8 16.5 11 L14 11 L14 17.5" stroke="#c9a84c" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Gestión Restaurante
            </div>
            <AvatarUser />
        </nav>
    );
};
