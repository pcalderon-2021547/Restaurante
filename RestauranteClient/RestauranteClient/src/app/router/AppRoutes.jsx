import { Routes, Route } from "react-router-dom";
import { AuthPage } from "../../features/auth/pages/AuthPage.jsx";
import { DashboardPage } from "../layouts/DashboardPage.jsx";
import { RoleGuard } from "./RoleGuard.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { VerifyEmailPage } from "../../features/auth/pages/VerifyEmailPage.jsx";
import { UnauthorizedPage } from "../../features/auth/pages/UnauthorizedPage.jsx";
import { Categories } from "../../features/categories/components/Categories.jsx";
import { Reviews } from "../../features/reviews/components/Reviews.jsx";
import { Products } from "../../features/products/components/Products.jsx";
import { Restaurants } from "../../features/restaurants/components/Restaurants.jsx";
import { Events } from "../../features/events/components/Events.jsx";

const ComingSoon = ({ section }) => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p className="text-2xl font-bold mb-2">{section}</p>
        <p className="text-sm">Sección en construcción</p>
    </div>
);

export const AppRoutes = () => {
    return (
        <Routes>
            {/* RUTAS PÚBLICAS */}
            <Route path="/" element={<AuthPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* RUTAS PROTEGIDAS */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowedRoles={["ADMIN_ROLE"]}>
                            <DashboardPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            >
                <Route index element={<ComingSoon section="Dashboard" />} />
                <Route path="users" element={<ComingSoon section="Usuarios" />} />
               <Route path="products" element={<Products />} />
                <Route path="categories" element={<Categories />} />
                <Route path="menus" element={<ComingSoon section="Menús" />} />
                <Route path="orders" element={<ComingSoon section="Pedidos" />} />
                <Route path="reservations" element={<ComingSoon section="Reservaciones" />} />
                <Route path="events" element={<Events />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="reports" element={<ComingSoon section="Reportes" />} />
                <Route path="restaurants" element={<Restaurants />} />
            </Route>
        </Routes>
    );
};
