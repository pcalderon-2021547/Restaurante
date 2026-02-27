'use strict';

import mongoose from 'mongoose';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

/* ===========================
   🔹 PostgreSQL - Sequelize
=========================== */

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

export const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL | Conectado correctamente');
  } catch (error) {
    console.error('PostgreSQL | Error de conexión:', error.message);
  }
};

/* ===========================
   🔹 MongoDB - Mongoose
=========================== */

export const dbConnection = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB | Conectado correctamente');
    });

    mongoose.connection.on('error', () => {
      console.log('MongoDB | Error de conexión');
      mongoose.disconnect();
    });

    await mongoose.connect(process.env.URI_MONGO, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });

  } catch (error) {
    console.log(`Error al conectar MongoDB: ${error}`);
  }
};

/* ===========================
   🔹 Cierre limpio
=========================== */

const gracefulShutdown = async (signal) => {
  console.log(`Recibido ${signal}. Cerrando conexiones...`);
  await mongoose.connection.close();
  await sequelize.close();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));