import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { errorHandler, notFound } from '../middlewares/error-handler.js';
import menuRoutes from '../src/menus/menu.routes.js';
import dishRoutes from '../src/dish/dish.routes.js';
import categoryRoutes from '../src/category/category.routes.js';

const BASE_PATH = '/api/v1';

const middlewares = (app) => {
  app.use(cors(corsOptions));
  app.use(helmet(helmetConfiguration));
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false }));
};

const routes = (app) => {
  app.use(`${BASE_PATH}/menus`, menuRoutes);
  app.use(`${BASE_PATH}/dishes`, dishRoutes);
  app.use(`${BASE_PATH}/categories`, categoryRoutes);

  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({ status: 'healthy', service: 'menu-service', timestamp: new Date().toISOString() });
  });

  app.use(notFound);
  app.use(errorHandler);
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 3002;

  await connectDB();
  middlewares(app);
  routes(app);

  app.listen(PORT, () => {
    console.log(`Menu Service running on port ${PORT}`);
  });
};
