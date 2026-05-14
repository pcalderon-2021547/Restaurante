import { DashboardContainer } from "../../shared/components/layout/DashboardContainer";
import { Outlet, useLocation} from "react-router-dom";
import '../../styles/dashboard.css';

const DashboardHomeContent = () => {
    return (
        <section className="dashboard-welcome">
            <div className="dashboard-welcome-card">
                <div className="dashboard-welcome-header">
                    <span className="dashboard-welcome-badge">Dashboard principal</span>
                    <h1>Bienvenido al <span>Panel de Control</span></h1>
                    <p>
                        Administra productos, revisa estadísticas, controla ventas y supervisa toda la actividad
                        de tu negocio desde un solo lugar con una experiencia moderna y elegante.
                    </p>
                </div>

                <div className="dashboard-welcome-stats">
                    <article className="dashboard-welcome-stat">
                        <p className="stat-label">Productos</p>
                        <strong>248</strong>
                    </article>
                    <article className="dashboard-welcome-stat">
                        <p className="stat-label">Ventas</p>
                        <strong>Q.18K</strong>
                    </article>
                    <article className="dashboard-welcome-stat">
                        <p className="stat-label">Usuarios</p>
                        <strong>1.2K</strong>
                    </article>
                    <article className="dashboard-welcome-stat">
                        <p className="stat-label">Pedidos</p>
                        <strong>320</strong>
                    </article>
                </div>
            </div>
        </section>
    );
};

export const DashboardPage = () => {
    const location = useLocation();
    const isDashboardHome = location.pathname === '/dashboard';

    return (
        <DashboardContainer>
            {isDashboardHome ? <DashboardHomeContent /> : <Outlet />}
        </DashboardContainer>
    );
};