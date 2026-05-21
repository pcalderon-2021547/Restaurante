import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDishStore } from "../store/useDishStore";
import { useCategoryStore } from "../../categories/store/useCategoryStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showSuccess } from "../../../shared/utils/toast.js";

const inputStyle = {
    background: "#1c1a16",
    border: "1px solid rgba(201,168,76,0.2)",
    color: "#f0e8d5",
    borderRadius: "6px",
    padding: "10px 14px",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
};

export const DishModal = ({ isOpen, onClose, dish }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { createDish, updateDish, loading } = useDishStore();
    const { categories, getCategories } = useCategoryStore();
    const { restaurants, getRestaurants } = useRestaurantStore();

    useEffect(() => {
        if (!isOpen) return;

        getCategories();
        getRestaurants();

        reset(
            dish
                ? {
                      name: dish.name,
                      category: dish.category?._id || dish.category || "",
                      restaurant: dish.restaurant?._id || dish.restaurant || "",
                      price: dish.price,
                      isAvailable: dish.isAvailable ?? true,
                  }
                : { name: "", category: "", restaurant: "", price: 0, isAvailable: true }
        );
    }, [isOpen, dish]);

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            price: Number(data.price),
            isAvailable: data.isAvailable === true || data.isAvailable === "true",
        };

        if (dish) {
            await updateDish(dish._id, payload);
            showSuccess("Plato actualizado");
        } else {
            await createDish(payload);
            showSuccess("Plato creado");
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div
                style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)" }}
                className="rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
            >
                <div
                    className="p-5"
                    style={{
                        background: "linear-gradient(135deg, #1c1408 0%, #0a0906 100%)",
                        borderBottom: "1px solid rgba(201,168,76,0.2)",
                    }}
                >
                    <h2 className="text-xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c" }}>
                        {dish ? "Editar Plato" : "Nuevo Plato"}
                    </h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                            Nombre
                        </label>
                        <input
                            style={inputStyle}
                            {...register("name", { required: "El nombre es obligatorio" })}
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                                Restaurante
                            </label>
                            <select style={inputStyle} {...register("restaurant", { required: "Selecciona un restaurante" })}>
                                <option value="">Selecciona un restaurante...</option>
                                {restaurants.filter((r) => r.isActive !== false).map((restaurant) => (
                                    <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>
                                ))}
                            </select>
                            {errors.restaurant && <p className="text-xs text-red-500">{errors.restaurant.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                                Categoría
                            </label>
                            <select style={inputStyle} {...register("category", { required: "Selecciona una categoría" })}>
                                <option value="">Selecciona una categoría...</option>
                                {categories.map((category) => (
                                    <option key={category._id} value={category._id}>{category.name}</option>
                                ))}
                            </select>
                            {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest" style={{ color: "#5a5040" }}>
                                Precio
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                style={inputStyle}
                                {...register("price", { required: "El precio es obligatorio" })}
                            />
                            {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                            <input type="checkbox" id="isAvailable" {...register("isAvailable")} className="w-4 h-4 rounded" />
                            <label htmlFor="isAvailable" className="text-sm" style={{ color: "#9a8e74" }}>
                                Disponible
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg" style={{ background: "#1c1a16", color: "#5a5040", border: "1px solid rgba(201,168,76,0.1)" }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>
                            {loading ? <Spinner small /> : dish ? "Guardar" : "Crear"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
