'use strict';

/**
 * FALLO #2 — Sin rate limiting en login y register
 * El sistema permite ataques de fuerza bruta sin restricción.
 * Este middleware implementa rate limiting en memoria sin dependencias externas.
 * NOTA: Para producción se recomienda usar express-rate-limit + Redis.
 */

// Mapa: ip -> { count, firstAttempt }
const attempts = new Map();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 10;           // máximo intentos por ventana

const cleanExpired = () => {
    const now = Date.now();
    for (const [key, data] of attempts.entries()) {
        if (now - data.firstAttempt > WINDOW_MS) {
            attempts.delete(key);
        }
    }
};

// Limpiar cada 10 minutos para no acumular memoria
setInterval(cleanExpired, 10 * 60 * 1000);

export const rateLimitAuth = (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const key = `auth:${ip}`;

    const record = attempts.get(key);

    if (!record) {
        attempts.set(key, { count: 1, firstAttempt: now });
        return next();
    }

    // Si la ventana ya expiró, resetear
    if (now - record.firstAttempt > WINDOW_MS) {
        attempts.set(key, { count: 1, firstAttempt: now });
        return next();
    }

    if (record.count >= MAX_ATTEMPTS) {
        const retryAfter = Math.ceil((WINDOW_MS - (now - record.firstAttempt)) / 1000);
        return res.status(429).json({
            success: false,
            message: `Demasiados intentos. Intenta de nuevo en ${retryAfter} segundos`
        });
    }

    record.count++;
    next();
};
