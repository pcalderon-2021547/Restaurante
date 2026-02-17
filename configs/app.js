'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configurations.js';

import userRoutes from '../src/fields/user/userRoutes.js'; 
import categoryRoutes from '../src/fields/category/categoryRoutes.js';
import productRoutes from '../src/fields/product/productRoutes.js';
import dishRoutes from '../src/fields/dish/dishRoutes.js';
import tableRoutes from '../src/fields/table/tableRoutes.js';
import orderRoutes from '../src/fields/order/orderRoutes.js';
import orderDetailRoutes from '../src/fields/orderDetail/orderDetailRoutes.js';
import reservationRoutes from '../src/fields/reservation/reservationRoutes.js';

const BASE_PATH = '/restaurantManagement/v1';

const middlewares = (app) => {
    app.use(express.urlencoded({extended: false, limit: '10mb'}));
    app.use(express.json({ limit: '10mb'}));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(morgan('dev'));

    // Configuración para ver las fotos que están sueltas en la raíz
    app.use('/uploads', express.static('./')); 
}

const routes = (app) => {
    app.use(`${BASE_PATH}/users`, userRoutes);
    app.use(`${BASE_PATH}/category`, categoryRoutes);
    app.use(`${BASE_PATH}/product`, productRoutes);
    app.use(`${BASE_PATH}/dish`, dishRoutes);
    app.use(`${BASE_PATH}/table`, tableRoutes);
    app.use(`${BASE_PATH}/order`, orderRoutes);
    app.use(`${BASE_PATH}/orderDetail`, orderDetailRoutes);
    app.use(`${BASE_PATH}/reservation`, reservationRoutes);

    app.get(`${BASE_PATH}/Health`, (request, response) => {
        response.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'Restaurant Management Server'
        })
    })

    // Manejo de errores 404
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado en Restaurant API'
        })
    })
}

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3000;
    app.set('trust proxy', 1);

    try {
        await dbConnection();
        middlewares(app);
        routes(app);
        
        app.listen(PORT, () => {
            console.log(`Restaurant Server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/Health`);
        });

    } catch (error) {
        console.error(`Error starting Server: ${error.message}`);
        process.exit(1);
    }
}