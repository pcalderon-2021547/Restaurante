'use strict';

import mongoose from 'mongoose';

export const dbConnection = async () => {
    try {
        // Mensajes para saber qué está pasando con la base de datos
        mongoose.connection.on('error', () => {
            console.log('MongoDB | No se pudo conectar a la base de datos del restaurante');
            mongoose.disconnect();
        });

        mongoose.connection.on('connecting', () => {
            console.log('MongoDB | Intentando conectar al servidor...');
        });

        mongoose.connection.on('connected', () => {
            console.log('MongoDB | Conectado con éxito');
        });

        mongoose.connection.on('open', () => {
            console.log('MongoDB | Base de datos "gestionrestaurante" lista para usar');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB | La conexión se ha restablecido');
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB | Se perdió la conexión a la base de datos');
        });

        // Conexión principal usando tu variable URI_MONGO
        await mongoose.connect(process.env.URI_MONGO, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });

    } catch (error) {
        console.log(`Error al conectar la db: ${error}`);
    }
}

// Función para cerrar la conexión si el servidor se apaga
const gracefulShutdown = async(signal) => {
    console.log(`MongoDB | Recibido ${signal}. Cerrando conexión...`);
    try {
        await mongoose.connection.close();
        console.log('MongoDB | Conexión cerrada correctamente');
        process.exit(0);
    } catch (error) {
        console.error('MongoDB | Error al cerrar la conexión:', error.message);
        process.exit(1);
    }
}

// Escuchas para cuando detienes el servidor (Ctrl+C o Nodemon)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));