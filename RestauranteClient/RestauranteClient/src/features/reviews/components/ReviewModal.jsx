import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useReviewStore } from "../store/useReviewStore";
import { Spinner } from "../../../shared/components/layout/Spinner.jsx";
import { showSuccess } from "../../../shared/utils/toast.js";

const StarRating = ({ value, onChange, error }) => {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-widest" style={{ color: "#5a5040" }}>
                Calificación
            </label>
            <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className="text-2xl transition-transform hover:scale-110"
                        style={{ color: star <= value ? "#c9a84c" : "#3a3328", background: "none", border: "none", cursor: "pointer" }}
                    >
                        ★
                    </button>
                ))}
            </div>
            {error && <p className="text-xs" style={{ color: "#e05a5a" }}>{error}</p>}
        </div>
    );
};

export const ReviewModal = ({ isOpen, onClose, review }) => {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
    const { createReview, updateReview, loading } = useReviewStore();

    const ratingValue = watch("rating", review?.rating || 0);

    useEffect(() => {
        if (isOpen) {
            if (review) {
                reset({
                    rating: review.rating,
                    comment: review.comment || "",
                });
            } else {
                reset({ rating: 0, comment: "" });
            }
        }
    }, [isOpen, review]);

    const onSubmit = async (data) => {
        if (review) {
            await updateReview(review._id, data);
            showSuccess("Reseña actualizada");
        } else {
            await createReview(data);
            showSuccess("Reseña creada");
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div
                style={{ background: "#141210", border: "1px solid rgba(201,168,76,0.2)" }}
                className="rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
            >
                {/* HEADER */}
                <div
                    className="p-5"
                    style={{
                        background: "linear-gradient(135deg, #1c1408 0%, #0a0906 100%)",
                        borderBottom: "1px solid rgba(201,168,76,0.2)",
                    }}
                >
                    <h2
                        className="text-xl font-bold"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a84c", letterSpacing: "0.05em" }}
                    >
                        {review ? "Editar Reseña" : "Nueva Reseña"}
                    </h2>
                    <p className="text-xs mt-1" style={{ color: "#5a5040" }}>
                        {review ? "Modifica los datos de la reseña" : "Completa la información de la nueva reseña"}
                    </p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    {/* Calificación */}
                    <StarRating
                        value={ratingValue}
                        onChange={(val) => setValue("rating", val, { shouldValidate: true })}
                        error={errors.rating?.message}
                    />
                    <input
                        type="hidden"
                        {...register("rating", {
                            required: "La calificación es obligatoria",
                            min: { value: 1, message: "Selecciona al menos 1 estrella" },
                            max: { value: 5, message: "Máximo 5 estrellas" },
                        })}
                    />

                    {/* Comentario */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium uppercase tracking-widest" style={{ color: "#5a5040" }}>
                            Comentario
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Describe tu experiencia en el restaurante..."
                            style={{
                                background: "#1c1a16",
                                border: "1px solid rgba(201,168,76,0.2)",
                                color: "#f0e8d5",
                                borderRadius: "6px",
                                padding: "10px 14px",
                                fontSize: "0.9rem",
                                outline: "none",
                                resize: "none",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                            {...register("comment", {
                                maxLength: { value: 300, message: "Máximo 300 caracteres" },
                            })}
                        />
                        {errors.comment && (
                            <p className="text-xs" style={{ color: "#e05a5a" }}>
                                {errors.comment.message}
                            </p>
                        )}
                    </div>

                    {/* BOTONES */}
                    <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg text-sm transition"
                            style={{
                                background: "#1c1a16",
                                color: "#5a5040",
                                border: "1px solid rgba(201,168,76,0.1)",
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 rounded-lg text-sm font-medium transition"
                            style={{ background: "linear-gradient(90deg, #c9a84c, #e8c96e)", color: "#0a0906" }}
                        >
                            {loading ? <Spinner small /> : review ? "Guardar cambios" : "Crear reseña"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
