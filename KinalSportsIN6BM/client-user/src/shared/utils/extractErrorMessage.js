/**
 * server-user / auth-node suelen devolver { message: "..." }.
 * El auth-service en .NET, cuando falla la validacion de un DTO
 * ([Required], [MinLength], etc.), devuelve un ProblemDetails sin
 * "message":
 *   { title: "One or more validation errors occurred.",
 *     errors: { Password: ["...debe tener minimo 8 caracteres..."] } }
 *
 * Este helper intenta ambos formatos para mostrar siempre algo util
 * en el Alert, en vez de un generico "Error al registrarse".
 */
export const extractErrorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (!data) return fallback;

    if (data.message) return data.message;

    if (data.errors) {
        const firstField = Object.values(data.errors)[0];
        const firstMessage = Array.isArray(firstField) ? firstField[0] : firstField;
        if (firstMessage) return firstMessage;
    }

    if (data.title) return data.title;

    return fallback;
};
