import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDishStore } from "../../dish/store/useDishStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { useTableStore } from "../../table/store/useTableStore";
import { useOrderStore } from "../../order/store/useOrderStore";
import { useAuthStore } from "../../auth/store/authStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showSuccess, showError } from "../../../shared/utils/toast.js";

export const UserOrderDetailPage = () => {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const { dishes, getDishes, loading: dishesLoading } = useDishStore();
    const { restaurants, getRestaurants } = useRestaurantStore();
    const { tables, getTables } = useTableStore();
    const { createOrder } = useOrderStore();
    const currentUser = useAuthStore((s) => s.user);

    const [cart, setCart] = useState([]);
    const [type, setType] = useState("takeaway");
    const [table, setTable] = useState("");
    const [address, setAddress] = useState("");
    const [placing, setPlacing] = useState(false);

    useEffect(() => {
        getDishes();
        getRestaurants();
        getTables();
    }, [getDishes, getRestaurants, getTables]);

    const restaurant = restaurants.find((r) => r._id === restaurantId);

    const availableDishes = dishes.filter((d) => (d.restaurant?._id || d.restaurant) === restaurantId);

    const addToCart = (dish) => {
        setCart((prev) => {
            const found = prev.find((p) => p.dish._id === dish._id);
            if (found) return prev.map((p) => p.dish._id === dish._id ? { ...p, qty: p.qty + 1 } : p);
            return [{ dish, qty: 1 }, ...prev];
        });
    };

    const changeQty = (dishId, delta) => {
        setCart((prev) => prev
            .map((p) => p.dish._id === dishId ? { ...p, qty: Math.max(1, p.qty + delta) } : p)
            .filter((p) => p.qty > 0)
        );
    };

    const removeFromCart = (dishId) => setCart((prev) => prev.filter((p) => p.dish._id !== dishId));

    const total = cart.reduce((s, p) => s + (Number(p.dish.price || 0) * p.qty), 0);

    const placeOrder = async () => {
        if (!currentUser) {
            showError("Debes iniciar sesión para realizar un pedido.");
            return;
        }
        if (!cart.length) {
            showError("Agrega al menos un plato al carrito.");
            return;
        }

        if (type === "delivery" && !address.trim()) {
            showError("La dirección es obligatoria para delivery.");
            return;
        }

        if (type === "dine_in" && !table) {
            showError("Selecciona una mesa para dine-in.");
            return;
        }

        try {
            setPlacing(true);
            const payload = {
                user: currentUser.id || currentUser._id || currentUser,
                restaurant: restaurantId,
                type,
                ...(type === "delivery" ? { address: address.trim() } : {}),
                ...(type === "dine_in" ? { table } : {}),
            };

            const payloadWithDetails = {
                ...payload,
                items: cart.map((item) => ({ dish: item.dish._id, quantity: item.qty }))
            };

            await createOrder(payloadWithDetails);

            showSuccess("Pedido realizado correctamente");
            navigate('/user/orders');
        } catch (err) {
            console.error(err);
            showError(err.response?.data?.message || "Error al realizar pedido.");
        } finally {
            setPlacing(false);
        }
    };

    if (dishesLoading) return <Spinner />;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#5a5040" }}>Detalle de pedido</p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#f0e8d5" }}>
                        {restaurant?.name || "Restaurante"} <em style={{ color: "#c9a84c", fontStyle: "italic" }}></em>
                    </h1>
                </div>
                <div className="text-sm" style={{ color: "#9a8e74" }}>
                    <button onClick={() => navigate('/user/restaurants')} className="px-4 py-2 rounded" style={{ background: "#1c1a16", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}>Volver</button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <div className="grid md:grid-cols-2 gap-4">
                        {availableDishes.length === 0 ? (
                            <div className="rounded-xl p-6" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
                                <p className="text-sm" style={{ color: "#9a8e74" }}>No hay platillos disponibles en este restaurante.</p>
                            </div>
                        ) : (
                            availableDishes.map((dish) => (
                                <div key={dish._id} className="rounded-lg p-4 hover:scale-[1.02] transition-transform" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.06)" }}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold" style={{ color: "#c9a84c" }}>{dish.name}</h3>
                                            <p className="text-sm mt-2" style={{ color: "#9a8e74" }}>{dish.description || '—'}</p>
                                            <p className="mt-3 text-sm" style={{ color: "#f0e8d5" }}>Q{Number(dish.price || 0).toFixed(2)}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <button onClick={() => addToCart(dish)} className="px-3 py-1 rounded text-sm" style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>Añadir</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <aside className="rounded-xl p-4" style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.12)" }}>
                    <h3 className="text-lg font-semibold mb-3" style={{ color: "#c9a84c" }}>Tu carrito</h3>
                    {cart.length === 0 ? (
                        <p className="text-sm" style={{ color: "#9a8e74" }}>Tu carrito está vacío. Agrega platillos.</p>
                    ) : (
                        <div className="space-y-3">
                            {cart.map((item) => (
                                <div key={item.dish._id} className="flex items-center justify-between">
                                    <div>
                                        <p style={{ color: "#f0e8d5" }} className="font-medium">{item.dish.name}</p>
                                        <p style={{ color: "#9a8e74" }} className="text-sm">Q{Number(item.dish.price || 0).toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => changeQty(item.dish._id, -1)} className="px-2 py-1 rounded" style={{ background: "#1c1a16", color: "#c9a84c" }}>-</button>
                                        <span style={{ color: "#f0e8d5" }}>{item.qty}</span>
                                        <button onClick={() => changeQty(item.dish._id, 1)} className="px-2 py-1 rounded" style={{ background: "#1c1a16", color: "#c9a84c" }}>+</button>
                                        <button onClick={() => removeFromCart(item.dish._id)} title="Eliminar" className="ml-2 text-xs" style={{ color: "#e05a5a" }}>x</button>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-3 border-t" style={{ borderColor: "rgba(201,168,76,0.06)" }}>
                                <p className="text-sm" style={{ color: "#9a8e74" }}>Tipo de pedido</p>
                                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 mt-2" style={{ background: "#1c1a16", color: "#f0e8d5", border: "1px solid rgba(201,168,76,0.08)" }}>
                                    <option value="takeaway">Para llevar</option>
                                    <option value="delivery">Delivery</option>
                                    <option value="dine_in">Dine-in</option>
                                </select>

                                {type === "delivery" && (
                                    <div className="flex flex-col gap-2 mt-4">
                                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Dirección de delivery</label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full p-2 rounded"
                                            style={{ background: "#1c1a16", color: "#f0e8d5", border: "1px solid rgba(201,168,76,0.08)" }}
                                            placeholder="Ingresa la dirección de entrega"
                                        />
                                    </div>
                                )}

                                {type === "dine_in" && (
                                    <div className="flex flex-col gap-2 mt-4">
                                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>Mesa</label>
                                        <select
                                            value={table}
                                            onChange={(e) => setTable(e.target.value)}
                                            className="w-full p-2 rounded"
                                            style={{ background: "#1c1a16", color: "#f0e8d5", border: "1px solid rgba(201,168,76,0.08)" }}
                                        >
                                            <option value="">Selecciona una mesa</option>
                                            {tables
                                                .filter((t) => (t.restaurant?._id || t.restaurant) === restaurantId)
                                                .map((t) => (
                                                    <option key={t._id} value={t._id}>
                                                        Mesa {t.number} — {t.location}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                )}

                                <div className="mt-4 flex items-center justify-between">
                                    <strong style={{ color: "#f0e8d5" }}>Total</strong>
                                    <span style={{ color: "#c9a84c" }}>Q{Number(total).toFixed(2)}</span>
                                </div>

                                <button onClick={placeOrder} disabled={placing} className="w-full mt-4 py-2 rounded" style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>
                                    {placing ? 'Procesando...' : 'Realizar pedido'}
                                </button>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};
