export const generateJWTMilton = async (payload) => {
    try {
        // Usamos los mismos nombres que tienes en tu .env
        const secret = process.env.JWT_SECRET;
        const options = {
            expiresIn: '3h',
            algorithm: 'HS256',
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        };

        // El payload que espera el validador de tu profe
        const tokenPayload = {
            sub: payload.uid, // El ID del usuario
            role: payload.role,
            username: payload.username
        };

        return jwt.sign(tokenPayload, secret, options);
    } catch (err) {
        console.error('Error al generar el token:', err);
        return null;
    }
};