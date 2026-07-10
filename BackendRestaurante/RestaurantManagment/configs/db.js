'use strict';

import mongoose from 'mongoose';
import { Sequelize } from 'sequelize';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT || 5432);

const getSafeDbName = (name) => name.replace(/"/g, '""');

const ensureDatabaseExists = async () => {
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: 'postgres',
  });

  try {
    await client.connect();
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${getSafeDbName(DB_NAME)}"`);
      console.log(`PostgreSQL | Base de datos creada: ${DB_NAME}`);
    }
  } catch (error) {
    console.error('PostgreSQL | Error al asegurar la base de datos:', error.message);
    throw error;
  } finally {
    await client.end();
  }
};

/* ===========================
   🔹 PostgreSQL - Sequelize
=========================== */

export const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASS,
  {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

export const connectPostgres = async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    console.log('PostgreSQL | Conectado correctamente');
  } catch (error) {
    console.error('PostgreSQL | Error de conexión:', error.message);
    throw error;
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
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));