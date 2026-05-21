import { Navbar } from "./Navbar";
import { UserSidebar } from "./UserSidebar";

export const UserDashboardContainer = ({ children }) => {
    return (
        <div className="dash-root">
            <Navbar />
            <div className="dash-body">
                <UserSidebar />
                <main className="dash-main">
                    {children}
                </main>
            </div>
        </div>
    );
};
