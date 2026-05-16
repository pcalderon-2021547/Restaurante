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
                <Route path="users" element={<Users />} />
                <Route path="products" element={<Products />} />
                <Route path="categories" element={<Categories />} />
                <Route path="menus" element={<Menus />} />
                <Route path="dishes" element={<Dish />} />
                <Route path="orders" element={<Orders />} />
                <Route path="order-details" element={<OrderDetails />} />
                <Route path="reservations" element={<Reservations />} />
                <Route path="events" element={<Events />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="reports" element={<Reports />} />
                <Route path="restaurants" element={<Restaurants />} />
                <Route path="tables" element={<Tables />} />
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
                <Route path="reservations" element={<UserReservationsPage />} />
                <Route path="restaurants" element={<UserRestaurantsPage />} />
                <Route
                    path="profile"
                    element={<UserProfilePage />}
                />
            </Route>
        </Routes>
    );
};
