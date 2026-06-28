import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMenuStore } from "../../menus/store/useMenuStore";
import { useDishStore } from "../../dish/store/useDishStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showError, showSuccess } from "../../../shared/utils/toast.js";

const quickFilters = ["Todos", "Desayunos", "Almuerzos", "Postres", "Bebidas", "Veganas"];

export const UserMenusPage = () => {
    const navigate = useNavigate();
    const { menus, loading, error, getMenus } = useMenuStore();
    const { dishes, getDishes } = useDishStore();
    const { restaurants, getRestaurants } = useRestaurantStore();
    const [query, setQuery] = useState("");
    const [restaurantId, setRestaurantId] = useState("");
    const [quickFilter, setQuickFilter] = useState("Todos");
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        getMenus();
        getDishes();
        getRestaurants();
    }, [getMenus, getDishes, getRestaurants]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    const findRestaurantName = (restaurantField) => {
        if (restaurantField && typeof restaurantField === "object") return restaurantField.name || "Desconocido";
        const restaurant = restaurants.find((item) => item._id === restaurantField || item.id === restaurantField);
        return restaurant?.name || "Desconocido";
    };

    const resolveMenuDishes = (menu) => {
        const menuDishes = Array.isArray(menu?.dishes) ? menu.dishes : [];
        const ids = menuDishes.map((dish) => dish?._id || dish).filter(Boolean);
        const embedded = menuDishes.filter((dish) => dish && typeof dish === "object");
        const resolved = dishes.filter((dish) => ids.includes(dish._id || dish.id));
        const merged = [...embedded, ...resolved];

        return merged.filter((dish, index, list) => {
            const id = dish?._id || dish?.id || `${dish?.name}-${index}`;
            return list.findIndex((item) => (item?._id || item?.id || item?.name) === id) === index;
        });
    };

    const visibleMenus = useMemo(() => {
        return menus
            .filter((menu) => menu.isActive !== false)
            .filter((menu) => {
                if (!restaurantId) return true;
                const currentRestaurant = menu.restaurant?._id || menu.restaurant;
                return currentRestaurant === restaurantId;
            })
            .filter((menu) => {
                const menuDishes = resolveMenuDishes(menu);
                const dishText = menuDishes.map((dish) => `${dish.name || ""} ${dish.category?.name || dish.category || ""}`).join(" ");
                const text = `${menu.name || ""} ${menu.description || ""} ${menu.type || ""} ${findRestaurantName(menu.restaurant)} ${dishText}`.toLowerCase();
                return text.includes(query.toLowerCase().trim());
            })
            .filter((menu) => {
                if (quickFilter === "Todos") return true;
                const normalizedFilter = normalizeText(quickFilter);
                const menuDishes = resolveMenuDishes(menu);
                const text = `${menu.name || ""} ${menu.description || ""} ${menu.type || ""} ${menuDishes.map((dish) => `${dish.name || ""} ${dish.category?.name || dish.category || ""}`).join(" ")}`;
                return normalizeText(text).includes(normalizedFilter.slice(0, -1)) || normalizeText(text).includes(normalizedFilter);
            });
    }, [menus, dishes, restaurants, query, restaurantId, quickFilter]);

    const addToCart = (dish, menu) => {
        const restaurant = menu?.restaurant?._id || menu?.restaurant || dish?.restaurant?._id || dish?.restaurant;
        setCart((prev) => {
            const id = dish._id || dish.id || dish.name;
            const found = prev.find((item) => (item.dish._id || item.dish.id || item.dish.name) === id);
            if (found) {
                return prev.map((item) => (item.dish._id || item.dish.id || item.dish.name) === id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { dish, menuName: menu?.name, restaurant, qty: 1 }];
        });
        showSuccess("Platillo agregado a tu seleccion");
    };

    const changeQty = (dishId, delta) => {
        setCart((prev) => prev
            .map((item) => (item.dish._id || item.dish.id || item.dish.name) === dishId ? { ...item, qty: item.qty + delta } : item)
            .filter((item) => item.qty > 0)
        );
    };

    const cartTotal = cart.reduce((sum, item) => sum + Number(item.dish.price || 0) * item.qty, 0);
    const cartRestaurant = cart[0]?.restaurant;

    return (
        <div className="user-page">
            <header className="user-page-hero compact">
                <div>
                    <p className="user-kicker">Menús disponibles</p>
                    <h1>Menús <em>del restaurante</em></h1>
                    <p>Explora platillos por menú, revisa precios y arma una selección antes de crear tu pedido.</p>
                </div>
                <div className="user-hero-stat">
                    <strong>{visibleMenus.length}</strong>
                    <span>menús</span>
                </div>
            </header>

            <section className="user-toolbar menu-toolbar">
                <label className="user-search wide">
                    <span>Buscar</span>
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Menú, platillo, tipo o restaurante" />
                </label>
                <label className="user-select">
                    <span>Restaurante</span>
                    <select value={restaurantId} onChange={(event) => setRestaurantId(event.target.value)}>
                        <option value="">Todos</option>
                        {restaurants.filter((item) => item.isActive !== false).map((restaurant) => (
                            <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>
                        ))}
                    </select>
                </label>
                <div className="user-filter-tags">
                    {quickFilters.map((filter) => (
                        <button
                            key={filter}
                            type="button"
                            className={quickFilter === filter ? "active" : ""}
                            onClick={() => setQuickFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </section>

            <section className="menu-page-layout">
                <div>
                    {loading && menus.length === 0 ? (
                        <Spinner />
                    ) : visibleMenus.length === 0 ? (
                        <div className="user-empty">
                            <strong>No hay menús para mostrar</strong>
                            <p>Cambia los filtros o vuelve pronto para ver nuevas opciones.</p>
                        </div>
                    ) : (
                        <div className="user-card-grid">
                            {visibleMenus.map((menu) => {
                                const menuDishes = resolveMenuDishes(menu);
                                return (
                                    <article key={menu._id} className="user-menu-card interactive" onClick={() => setSelectedMenu(menu)}>
                                        {/* Imagen del menú */}
                                        {(menu.imageUrl || menu.image) && (
                                            <div style={{ width: "100%", height: "120px", borderRadius: "8px", overflow: "hidden", marginBottom: "10px" }}>
                                                <img
                                                    src={menu.imageUrl || menu.image}
                                                    alt={menu.name}
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    onError={(e) => { e.target.parentElement.style.display = "none"; }}
                                                />
                                            </div>
                                        )}
                                        <div className="user-card-topline">
                                            <span>{menu.type || "General"}</span>
                                            <b>{menuDishes.length || menu.dishes?.length || 0} platos</b>
                                        </div>
                                        <h2>{menu.name}</h2>
                                        <p>{menu.description || "Sin descripción disponible."}</p>
                                        <div className="user-info-list">
                                            <span><strong>Restaurante</strong>{findRestaurantName(menu.restaurant)}</span>
                                        </div>
                                        <div className="menu-card-actions">
                                            <button type="button" className="user-secondary-btn" onClick={(event) => { event.stopPropagation(); setSelectedMenu(menu); }}>
                                                Ver platillos
                                            </button>
                                            <button
                                                type="button"
                                                className="user-primary-btn"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    const firstDish = menuDishes[0];
                                                    if (firstDish) addToCart(firstDish, menu);
                                                    else setSelectedMenu(menu);
                                                }}
                                            >
                                                Agregar sugerido
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>

                <aside className="menu-selection-panel">
                    <div className="user-cart-head">
                        <div>
                            <span>Selección</span>
                            <strong>{cart.reduce((sum, item) => sum + item.qty, 0)} platillos</strong>
                        </div>
                        <b>Q{cartTotal.toFixed(2)}</b>
                    </div>
                    {cart.length === 0 ? (
                        <p className="user-muted">Agrega platillos desde un menú para simular tu pedido.</p>
                    ) : (
                        <div className="user-cart-items">
                            {cart.map((item) => {
                                const id = item.dish._id || item.dish.id || item.dish.name;
                                return (
                                    <div key={id} className="user-cart-item">
                                        <div>
                                            <strong>{item.dish.name}</strong>
                                            <span>{item.menuName} · Q{Number(item.dish.price || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="user-qty">
                                            <button type="button" onClick={() => changeQty(id, -1)}>-</button>
                                            <span>{item.qty}</span>
                                            <button type="button" onClick={() => changeQty(id, 1)}>+</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <button
                        className="user-primary-btn full"
                        disabled={!cartRestaurant}
                        onClick={() => cartRestaurant && navigate(`/user/order/create/${cartRestaurant}`)}
                    >
                        Pedir ahora
                    </button>
                </aside>
            </section>

            {selectedMenu && (
                <MenuDetailModal
                    menu={selectedMenu}
                    restaurantName={findRestaurantName(selectedMenu.restaurant)}
                    dishes={resolveMenuDishes(selectedMenu)}
                    onClose={() => setSelectedMenu(null)}
                    onAddDish={(dish) => addToCart(dish, selectedMenu)}
                    onOrder={() => {
                        const id = selectedMenu.restaurant?._id || selectedMenu.restaurant;
                        if (id) navigate(`/user/order/create/${id}`);
                    }}
                />
            )}
        </div>
    );
};

const MenuDetailModal = ({ menu, restaurantName, dishes, onClose, onAddDish, onOrder }) => {
    return (
        <div className="user-modal-backdrop" onClick={onClose}>
            <section className="menu-detail-modal" onClick={(event) => event.stopPropagation()}>
                <header>
                    {(menu.imageUrl || menu.image) && (
                        <div style={{ width: "100%", height: "160px", borderRadius: "10px", overflow: "hidden", marginBottom: "16px" }}>
                            <img
                                src={menu.imageUrl || menu.image}
                                alt={menu.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>
                    )}
                    <div>
                        <p className="user-kicker">{restaurantName}</p>
                        <h2>{menu.name}</h2>
                        <span>{menu.type || "General"} · {dishes.length || menu.dishes?.length || 0} platillos</span>
                    </div>
                    <button type="button" className="user-secondary-btn" onClick={onClose}>Cerrar</button>
                </header>
                <p className="menu-detail-description">{menu.description || "Sin descripción disponible."}</p>

                {dishes.length === 0 ? (
                    <div className="user-empty">
                        <strong>Este menú aún no tiene platillos visibles</strong>
                        <p>Puede que el restaurante todavía esté actualizando su carta.</p>
                    </div>
                ) : (
                    <div className="menu-dish-list">
                        {dishes.map((dish, index) => (
                            <article key={dish._id || dish.id || `${dish.name}-${index}`} className="menu-dish-row">
                                <div className="menu-dish-photo">
                                    {dish.image || dish.photo || dish.imageUrl ? (
                                        <img src={dish.image || dish.photo || dish.imageUrl} alt={dish.name} />
                                    ) : (
                                        <span>{dish.name?.slice(0, 2)?.toUpperCase() || "PL"}</span>
                                    )}
                                </div>
                                <div>
                                    <div className="user-card-topline">
                                        <span>{dish.category?.name || dish.category || "Platillo"}</span>
                                        <b>Q{Number(dish.price || 0).toFixed(2)}</b>
                                    </div>
                                    <h3>{dish.name || "Platillo sin nombre"}</h3>
                                    <p>{dish.description || dish.ingredients || "Ingredientes no registrados."}</p>
                                </div>
                                <button type="button" className="user-primary-btn" onClick={() => onAddDish(dish)}>
                                    Agregar
                                </button>
                            </article>
                        ))}
                    </div>
                )}

                <footer>
                    <button type="button" className="user-primary-btn" onClick={onOrder}>Pedir en este restaurante</button>
                </footer>
            </section>
        </div>
    );
};

const normalizeText = (value) => {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
};
