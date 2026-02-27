'use strict';

import dotenv from 'dotenv';
import { initServer } from './configs/app.js';

// Cargar las variables de entorno del .env
dotenv.config();

// Manejador para errores de código no capturados (ej. una variable que no existe)
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception in Restaurant Server:', err);
    process.exit(1);
});

// Manejador para promesas que fallaron y no tienen .catch()
process.on('unhandledRejection', (err, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', err);
    process.exit(1);
});

console.log('Iniciando el servidor del Restaurante...');

// Arrancar toda la configuración de configs/app.js
initServer();