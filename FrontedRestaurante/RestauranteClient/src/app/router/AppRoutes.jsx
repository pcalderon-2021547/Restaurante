import { Routes, Route } from "react-router-dom";
import { AuthPage } from "../../features/auth/pages/AuthPage.jsx";
import { DashboardPage } from "../layouts/DashboardPage.jsx";
import { RoleGuard } from "./RoleGuard.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { VerifyEmailPage } from "../../features/auth/pages/VerifyEmailPage.jsx";
import { UnauthorizedPage } from "../../features/auth/pages/UnauthorizedPage.jsx";
import { ResetPasswordPage } from "../../features/auth/pages/ResetPasswordPage.jsx";
import { Categories } from "../../features/categories/components/Categories.jsx";
import { Reviews } from "../../features/reviews/components/Reviews.jsx";
import { Products } from "../../features/products/components/Products.jsx";
import { Restaurants } from "../../features/restaurants/components/Restaurants.jsx";
import { Events } from "../../features/events/components/Events.jsx";
import { Menus } from "../../features/menus/components/Menus.jsx";
import { Dish } from "../../features/dish/components/Dish.jsx";
import { Orders } from "../../features/order/components/Orders.jsx";
import { OrderDetails } from "../../features/orderDetail/components/OrderDetails.jsx";
import { Reports } from "../../features/reports/components/Reports.jsx";
import { Reservations } from "../../features/reservation/components/Reservations.jsx";
import { UserDashboardPage } from "../layouts/UserDashboardPage.jsx";
import { UserHomePage } from "../../features/user/pages/UserHomePage.jsx";
import { UserPlaceholderPage } from "../../features/user/pages/UserPlaceholderPage.jsx";
import { UserProfilePage } from "../../features/user/pages/UserProfilePage.jsx";
import { UserEventsPage } from "../../features/user/pages/UserEventsPage.jsx";
import { UserReviewsPage } from "../../features/user/pages/UserReviewsPage.jsx";
import { UserOrderDetailPage } from "../../features/user/pages/UserOrderDetailPage.jsx";
import { UserOrderDetailsPage } from "../../features/user/pages/UserOrderDetailsPage.jsx";
import { Tables } from "../../features/table/components/Tables.jsx";
import { UserOrdersPage } from "../../features/user/pages/UserOrdersPage.jsx";
import { UserReservationsPage } from "../../features/user/pages/UserReservationsPage.jsx";
import { UserRestaurantsPage } from "../../features/user/pages/UserRestaurantsPage.jsx";
import { UserMenusPage } from "../../features/user/pages/UserMenusPage.jsx";
import { Users } from "../../features/users/components/Users.jsx";

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
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* RUTAS PROTEGIDAS */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowedRoles={["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"]}>
                            <DashboardPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            >
                <Route index element={<ComingSoon section="Dashboard" />} />
                <Route path="users" element={<RoleGuard allowedRoles={["ADMIN_ROLE"]}><Users /></RoleGuard>} />
                <Route path="products" element={<RoleGuard allowedRoles={["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"]}><Products /></RoleGuard>} />
                <Route path="categories" element={<RoleGuard allowedRoles={["ADMIN_ROLE"]}><Categories /></RoleGuard>} />
                <Route path="menus" element={<RoleGuard allowedRoles={["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"]}><Menus /></RoleGuard>} />
                <Route path="dishes" element={<RoleGuard allowedRoles={["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"]}><Dish /></RoleGuard>} />
                <Route path="orders" element={<RoleGuard allowedRoles={["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"]}><Orders /></RoleGuard>} />
                <Route path="order-details" element={<RoleGuard allowedRoles={["ADMIN_ROLE"]}><OrderDetails /></RoleGuard>} />
                <Route path="reservations" element={<RoleGuard allowedRoles={["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"]}><Reservations /></RoleGuard>} />
                <Route path="events" element={<RoleGuard allowedRoles={["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"]}><Events /></RoleGuard>} />
                <Route path="reviews" element={<RoleGuard allowedRoles={["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"]}><Reviews /></RoleGuard>} />
                <Route path="reports" element={<RoleGuard allowedRoles={["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"]}><Reports /></RoleGuard>} />
                <Route path="restaurants" element={<RoleGuard allowedRoles={["ADMIN_ROLE"]}><Restaurants /></RoleGuard>} />
                <Route path="tables" element={<RoleGuard allowedRoles={["ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"]}><Tables /></RoleGuard>} />
            </Route>

            <Route
                path="/user"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowedRoles={["USER_ROLE"]}>
                            <UserDashboardPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            >
                <Route index element={<UserHomePage />} />
                <Route path="placeholder" element={<UserPlaceholderPage />} />
                <Route path="menus" element={<UserMenusPage />} />
                <Route path="orders" element={<UserOrdersPage />} />
                <Route path="orders/:orderId" element={<UserOrderDetailsPage />} />
                <Route path="reservations" element={<UserReservationsPage />} />
                <Route path="restaurants" element={<UserRestaurantsPage />} />
                <Route path="order/create/:restaurantId" element={<UserOrderDetailPage />} />
                <Route path="events" element={<UserEventsPage />} />
                <Route path="reviews" element={<UserReviewsPage />} />
                <Route
                    path="profile"
                    element={<UserProfilePage />}
                />
            </Route>
        </Routes>
    );
};
