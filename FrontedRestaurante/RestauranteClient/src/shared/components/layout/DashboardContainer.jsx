import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"

export const DashboardContainer = ({ children }) => {
    return (
        <div className="dash-root">
            <Navbar />
            <div className="dash-body">
                <Sidebar />
                <main className="dash-main">
                    {children}
                </main>
            </div>
        </div>
    );
};
