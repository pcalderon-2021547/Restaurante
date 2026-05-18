import { useEffect } from "react";
import { useMenuStore } from "../../menus/store/useMenuStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError } from "../../../shared/utils/toast.js";

export const UserMenusPage = () => {
    const { menus, loading, error, getMenus } = useMenuStore();
    const { restaurants, getRestaurants } = useRestaurantStore();

    useEffect(() => {
        getMenus();
        getRestaurants();
    }, [getMenus, getRestaurants]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

   const findRestaurantName = (restaurantField) => {
    if (restaurantField && typeof restaurantField === "object") {
        return restaurantField.name || "Desconocido";
    }

    const restaurant = restaurants.find((r) => r._id === restaurantField || r.id === restaurantField);
    return restaurant?.name || "Desconocido";
};

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>
                        Menús disponibles
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5" }}>
                        Menús <em style={{ color: "#c9a84c", fontStyle: "italic" }}>del restaurante</em>
                    </h1>
                </div>
            </div>

            {loading && menus.length === 0 ? (
                <Spinner />
            ) : menus.length === 0 ? (
                <div className="rounded-xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
                    <p className="text-lg font-semibold" style={{ color: "#f0e8d5" }}>No hay menús disponibles</p>
                    <p className="text-sm mt-2" style={{ color: "#9a8e74" }}>Vuelve pronto para ver nuevas opciones.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {menus.map((menu) => (
                        <div key={menu._id} className="rounded-2xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
                            <h2 className="text-xl font-semibold" style={{ color: "#c9a84c" }}>{menu.name}</h2>
                            <p className="text-sm mt-2" style={{ color: "#9a8e74" }}>{menu.description || "Sin descripción"}</p>
                            <div className="mt-4 text-sm space-y-2" style={{ color: "#f0e8d5" }}>
                                <p><strong>Restaurante:</strong> {findRestaurantName(menu.restaurant)}</p>
                                <p><strong>Tipo:</strong> {menu.type || "General"}</p>
                                <p><strong>Platos:</strong> {menu.dishes?.length ?? 0}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};