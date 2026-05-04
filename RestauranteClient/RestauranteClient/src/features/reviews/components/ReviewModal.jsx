import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useReviewStore } from "../store/useReviewStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showSuccess, showError } from "../../../shared/utils/toast.js";
 
const StarRating = ({ value, onChange, error }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-widest" style={{ color: "#5a5040" }}>
            Calificación
        </label>
        <div className="flex gap-2 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => onChange(star)}
                    className="text-2xl transition-transform hover:scale-110"
                    style={{ color: star <= value ? "#c9a84c" : "#3a3328", background: "none", border: "none", cursor: "pointer" }}>
                    ★
                </button>
            ))}
        </div>
        {error && <p className="text-xs" style={{ color: "#e05a5a" }}>{error}</p>}
    </div>
);
 
export const ReviewModal = ({ isOpen, onClose, review, restaurants = [], defaultRestaurantId = "" }) => {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: { restaurant: "", rating: 0, comment: "" }
    });
    const { createReview, updateReview, loading } = useReviewStore();
 
    // watch para reflejar las estrellas seleccionadas en tiempo real
    const ratingValue = watch("rating");
 
    useEffect(() => {
        if (isOpen) {
            if (review) {
                reset({
                    restaurant: review.restaurant?._id || review.restaurant || defaultRestaurantId,
                    rating: review.rating,
                    comment: review.comment || "",
                });
            } else {
                reset({ restaurant: defaultRestaurantId, rating: 0, comment: "" });
            }
        }
    }, [isOpen, review, defaultRestaurantId]);
 
    const onSubmit = async (data) => {
        const rating = Number(data.rating);

        // Validación de rating en el cliente antes de enviar
        if (!rating || rating < 1 || rating > 5) {
            showError("Selecciona entre 1 y 5 estrellas");
            return;
        }

        if (review) {
            await updateReview(review._id, {
                rating,
                comment: data.comment,
            });
        } else {
            await createReview({
                restaurant: data.restaurant,
                rating,
                comment: data.comment,
            });
        }

        // Leer estado del store DESPUÉS del await para saber si hubo error
        const storeState = useReviewStore.getState();
        if (!storeState.error) {
            showSuccess(review ? "Reseña actualizada" : "Reseña creada");
            onClose();
        } else {
            showError(storeState.error);
        }
    };
 
    if (!isOpen) return null;
 
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
 
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)" }}
                className="rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
 
                {/* HEADER */}
                <div className="p-5" style={{ background: "linear-gradient(135deg, #1c1408 0%, #0a0906 100%)", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c", fontSize: "1.3rem", letterSpacing: "0.05em" }}>
                        {review ? "Editar Reseña" : "Nueva Reseña"}
                    </h2>
                    <p className="text-xs mt-1" style={{ color: "#5a5040" }}>
                        {review ? "Modifica los datos de la reseña" : "Completa la información de la nueva reseña"}
                    </p>
                </div>
 
                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
 
                    {/* Restaurante */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium uppercase tracking-widest" style={{ color: "#5a5040" }}>
                            Restaurante
                        </label>
 
                        {review ? (
                            <div style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }}>
                                {restaurants.find((r) => r._id === (review.restaurant?._id || review.restaurant))?.name || "Restaurante"}
                            </div>
                        ) : (
                            <select
                                style={{ ...inputStyle, cursor: "pointer" }}
                                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                                onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                                {...register("restaurant", { required: "Selecciona un restaurante" })}
                            >
                                <option value="">— Selecciona un restaurante —</option>
                                {restaurants.map((r) => (
                                    <option key={r._id} value={r._id}>{r.name}</option>
                                ))}
                            </select>
                        )}
                        {errors.restaurant && (
                            <p className="text-xs" style={{ color: "#e05a5a" }}>{errors.restaurant.message}</p>
                        )}
                    </div>
 
                    {/* Calificación — solo StarRating + register con valueAsNumber, sin input hidden */}
                    <StarRating
                        value={ratingValue}
                        onChange={(val) => setValue("rating", val, { shouldValidate: true })}
                        error={errors.rating?.message}
                    />
                    {/* register oculto para que react-hook-form valide el valor */}
                    <input
                        type="hidden"
                        value={ratingValue}
                        {...register("rating", {
                            required: "La calificación es obligatoria",
                            min: { value: 1, message: "Selecciona al menos 1 estrella" },
                            valueAsNumber: true,
                        })}
                    />
 
                    {/* Comentario */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium uppercase tracking-widest" style={{ color: "#5a5040" }}>
                            Comentario
                        </label>
                        <textarea rows={4} placeholder="Describe tu experiencia..."
                            style={{ ...inputStyle, resize: "none" }}
                            onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                            {...register("comment", { maxLength: { value: 300, message: "Máximo 300 caracteres" } })}
                        />
                        {errors.comment && (
                            <p className="text-xs" style={{ color: "#e05a5a" }}>{errors.comment.message}</p>
                        )}
                    </div>
 
                    {/* BOTONES */}
                    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 rounded-lg text-sm"
                            style={{ background: "#1c1a16", color: "#5a5040", border: "1px solid rgba(201,168,76,0.1)" }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2 rounded-lg text-sm font-medium"
                            style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}>
                            {loading ? <Spinner small /> : review ? "Guardar cambios" : "Crear reseña"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
