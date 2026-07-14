import { Outlet } from "react-router-dom";
import { UserDashboardContainer } from "../../shared/components/layout/UserDashboardContainer";

export const UserDashboardPage = () => {
    return (
        <UserDashboardContainer>
            <Outlet />
        </UserDashboardContainer>
    );
};
