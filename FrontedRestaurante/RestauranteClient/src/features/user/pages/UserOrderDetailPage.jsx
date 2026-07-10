import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDishStore } from "../../dish/store/useDishStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { useTableStore } from "../../table/store/useTableStore";
import { useOrderStore } from "../../order/store/useOrderStore";
import { useAuthStore } from "../../auth/store/authStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showSuccess, showError } from "../../../shared/utils/toast.js";


export const isDishOrderable = (dish) => {
    if (!dish) return false;
    if (dish.isAvailable === false) return false;

    const products = dish.products || [];
    if (!products.length) return dish.isAvailable !== false;

    return products.every((item) => {
        const product = item.product;
        if (!product) return true;                              // sin referencia → no bloquear
        if (product.isActive === false) return false;           // insumo inactivo
        const needed = item.quantity || 1;
        return typeof product.stock === "number" && product.stock >= needed;
    });
};

/**
 * Construye el tooltip de "por qué no está disponible".
 * Retorna string vacío si el plato sí está disponible.
 */
export const getDishUnavailableReason = (dish) => {
    if (!dish) return "";
    if (dish.isAvailable === false && (!dish.products || !dish.products.length)) {
        return "Platillo no disponible";
    }

    const products = dish.products || [];
    const issues = [];

    for (const item of products) {
        const product = item.product;
        if (!product) continue;
        if (product.isActive === false) {
            issues.push(`${product.name || "Insumo"}: inactivo`);
            continue;
        }
        const needed = item.quantity || 1;
        if (typeof product.stock === "number" && product.stock < needed) {
            issues.push(`${product.name || "Insumo"}: sin stock suficiente (${product.stock} disponible)`);
        }
    }

    if (!issues.length && dish.isAvailable === false) return "Platillo no disponible";
    return issues.join(" · ");
};

// ─── componente ──────────────────────────────────────────────────────────────

export const UserOrderDetailPage = () => {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const { dishes, getDishes, loading: dishesLoading } = useDishStore();
    const { restaurants, getRestaurants } = useRestaurantStore();
    const { tables, getTables } = useTableStore();
    const { createOrder } = useOrderStore();
    const currentUser = useAuthStore((state) => state.user);

    const [cart, setCart] = useState([]);
    const [type, setType] = useState("takeaway");
    const [table, setTable] = useState("");
    const [address, setAddress] = useState("");
    const [placing, setPlacing] = useState(false);
    const [query, setQuery] = useState("");

    useEffect(() => {
        getDishes();
        getRestaurants();
        getTables();
    }, [getDishes, getRestaurants, getTables]);

    const restaurant = restaurants.find((item) => item._id === restaurantId);

    const availableDishes = useMemo(() => {
        return dishes
            .filter((dish) => (dish.restaurant?._id || dish.restaurant) === restaurantId)
            .filter((dish) => {
                const text = `${dish.name || ""} ${dish.description || ""}`.toLowerCase();
                return text.includes(query.toLowerCase().trim());
            });
    }, [dishes, restaurantId, query]);

    const restaurantTables = tables.filter(
        (item) => (item.restaurant?._id || item.restaurant) === restaurantId
    );

    // ── cart helpers ──────────────────────────────────────────────────────────

    const addToCart = (dish) => {
        if (!isDishOrderable(dish)) return;   // guard adicional en cliente

        setCart((prev) => {
            const found = prev.find((item) => item.dish._id === dish._id);
            if (found) {
                return prev.map((item) =>
                    item.dish._id === dish._id ? { ...item, qty: item.qty + 1 } : item
                );
            }
            return [{ dish, qty: 1 }, ...prev];
        });
    };

    const changeQty = (dishId, delta) => {
        setCart((prev) =>
            prev
                .map((item) => (item.dish._id === dishId ? { ...item, qty: item.qty + delta } : item))
                .filter((item) => item.qty > 0)
        );
    };

    const removeFromCart = (dishId) =>
        setCart((prev) => prev.filter((item) => item.dish._id !== dishId));

    const total = cart.reduce((sum, item) => sum + Number(item.dish.price || 0) * item.qty, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

    // ── place order ───────────────────────────────────────────────────────────

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
            await createOrder({
                user: currentUser.id || currentUser._id || currentUser,
                restaurant: restaurantId,
                type,
                ...(type === "delivery" ? { address: address.trim() } : {}),
                ...(type === "dine_in" ? { table } : {}),
                items: cart.map((item) => ({ dish: item.dish._id, quantity: item.qty })),
            });

            showSuccess("Pedido realizado correctamente");
            navigate("/user/orders");
        } catch (err) {
            console.error(err);
            // El backend devuelve stockIssues en el body del error
            const data = err.response?.data;
            if (data?.stockIssues) {
                const names = data.stockIssues.map((s) => s.name || s.dish || "insumo").join(", ");
                showError(`Sin stock suficiente: ${names}`);
            } else {
                showError(data?.message || "Error al realizar pedido.");
            }
        } finally {
            setPlacing(false);
        }
    };

    // ── render ────────────────────────────────────────────────────────────────

    if (dishesLoading) return <Spinner />;

    return (
        <div className="user-page">
            <header className="user-page-hero compact">
                <div>
                    <p className="user-kicker">Crear pedido</p>
                    <h1>{restaurant?.name || "Restaurante"}</h1>
                    <p>Elige platillos, define entrega y confirma tu pedido desde un carrito rápido.</p>
                </div>
                <button className="user-secondary-btn" onClick={() => navigate("/user/restaurants")}>
                    Volver
                </button>
            </header>

            <section className="user-order-layout">
                {/* ── menú de platillos ─────────────────────────────────── */}
                <div className="user-order-menu">
                    <div className="user-toolbar flush">
                        <label className="user-search">
                            <span>Buscar platillo</span>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Nombre o descripción"
                            />
                        </label>
                    </div>

                    {availableDishes.length === 0 ? (
                        <div className="user-empty">
                            <strong>No hay platillos disponibles</strong>
                            <p>Prueba otra búsqueda o vuelve más tarde.</p>
                        </div>
                    ) : (
                        <div className="user-dish-grid">
                            {availableDishes.map((dish) => {
                                const orderable = isDishOrderable(dish);
                                const reason = orderable ? "" : getDishUnavailableReason(dish);

                                return (
                                    <article
                                        key={dish._id}
                                        className={`user-dish-card${orderable ? "" : " user-dish-card--unavailable"}`}
                                        style={orderable ? {} : { opacity: 0.55, filter: "grayscale(40%)" }}
                                    >
                                        <div>
                                            <div className="user-card-topline">
                                                <span>Platillo</span>
                                                <b>Q{Number(dish.price || 0).toFixed(2)}</b>
                                            </div>
                                            <h2>{dish.name}</h2>
                                            <p>{dish.description || "Sin descripción."}</p>

                                            {/* badge de stock agotado */}
                                            {!orderable && (
                                                <span
                                                    className="user-badge-unavailable"
                                                    title={reason}
                                                    style={{
                                                        display: "inline-block",
                                                        marginTop: "6px",
                                                        padding: "2px 8px",
                                                        borderRadius: "999px",
                                                        fontSize: "0.7rem",
                                                        background: "rgba(220,50,50,0.15)",
                                                        color: "#e05a5a",
                                                        border: "1px solid rgba(220,50,50,0.3)",
                                                    }}
                                                >
                                                    Sin stock
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            className="user-primary-btn"
                                            onClick={() => addToCart(dish)}
                                            disabled={!orderable}
                                            title={reason || "Añadir al carrito"}
                                            style={
                                                !orderable
                                                    ? { cursor: "not-allowed", opacity: 0.45 }
                                                    : {}
                                            }
                                        >
                                            {orderable ? "Añadir" : "No disponible"}
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── carrito ──────────────────────────────────────────────── */}
                <aside className="user-cart">
                    <div className="user-cart-head">
                        <div>
                            <span>Tu carrito</span>
                            <strong>{itemCount} productos</strong>
                        </div>
                        <b>Q{Number(total).toFixed(2)}</b>
                    </div>

                    {cart.length === 0 ? (
                        <p className="user-muted">Tu carrito está vacío. Agrega platillos para continuar.</p>
                    ) : (
                        <div className="user-cart-items">
                            {cart.map((item) => (
                                <div key={item.dish._id} className="user-cart-item">
                                    <div>
                                        <strong>{item.dish.name}</strong>
                                        <span>Q{Number(item.dish.price || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="user-qty">
                                        <button onClick={() => changeQty(item.dish._id, -1)}>-</button>
                                        <span>{item.qty}</span>
                                        <button onClick={() => changeQty(item.dish._id, 1)}>+</button>
                                        <button className="danger" onClick={() => removeFromCart(item.dish._id)}>
                                            x
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="user-cart-form">
                        <label className="user-select full">
                            <span>Tipo de pedido</span>
                            <select value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="takeaway">Para llevar</option>
                                <option value="delivery">Delivery</option>
                                <option value="dine_in">Dine-in</option>
                            </select>
                        </label>

                        {type === "delivery" && (
                            <label className="user-search full">
                                <span>Dirección de delivery</span>
                                <input
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Ingresa la dirección de entrega"
                                />
                            </label>
                        )}

                        {type === "dine_in" && (
                            <label className="user-select full">
                                <span>Mesa</span>
                                <select value={table} onChange={(e) => setTable(e.target.value)}>
                                    <option value="">Selecciona una mesa</option>
                                    {restaurantTables.map((item) => (
                                        <option key={item._id} value={item._id}>
                                            Mesa {item.number} - {item.location}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}

                        <button
                            className="user-primary-btn full"
                            onClick={placeOrder}
                            disabled={placing || cart.length === 0}
                        >
                            {placing ? "Procesando..." : "Realizar pedido"}
                        </button>
                    </div>
                </aside>
            </section>
        </div>
    );
};
