import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gestión Restaurante API',
      version: '1.0.0',
      description: 'API completa para el sistema de gestión de restaurante con Node.js, Express, MongoDB y PostgreSQL.',
      contact: {
        name: 'Pablo Andres De León',
        email: 'pdeleon-2021364@kinal.edu.gt'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3006}`,
        description: 'Servidor de desarrollo local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese su token JWT en el formato: Bearer <token>'
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Autenticación y verificación de usuarios' },
      { name: 'Usuarios', description: 'Gestión de usuarios' },
      { name: 'Category', description: 'Categorías de platos' },
      { name: 'Product', description: 'Gestión de productos e inventario' },
      { name: 'Dish', description: 'Platos del menú' },
      { name: 'Table', description: 'Administración de mesas' },
      { name: 'Order', description: 'Órdenes y pedidos' },
      { name: 'OrderDetail', description: 'Detalles de las órdenes' },
      { name: 'Reservation', description: 'Reservaciones de mesas' },
      { name: 'Restaurant', description: 'Gestión de restaurantes' },
      { name: 'Review', description: 'Reseñas y calificaciones' },
      { name: 'Menu', description: 'Menús del día' },
      { name: 'Event', description: 'Eventos especiales' },
      { name: 'Reports', description: 'Reportes y estadísticas' }
    ]
  },
  apis: [
    './src/fields/auth/*.js',
    './src/fields/user/*.js',
    './src/fields/category/*.js',
    './src/fields/product/*.js',
    './src/fields/dish/*.js',
    './src/fields/table/*.js',
    './src/fields/order/*.js',
    './src/fields/orderDetail/*.js',
    './src/fields/reservation/*.js',
    './src/fields/restaurant/*.js',
    './src/fields/review/*.js',
    './src/fields/menus/*.js',
    './src/fields/evento/*.js',
    './src/fields/reports/*.js'
  ]
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { font-size: 28px; font-weight: 700; color: #1a3c34; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 15px; border-radius: 8px; }
    `,
    customSiteTitle: 'Gestión Restaurante API - Documentación',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true
    }
  }));

  // Endpoint para obtener el JSON de Swagger
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📘 Swagger UI disponible en → http://localhost:${process.env.PORT || 3006}/api-docs`);
};

export { swaggerSpec };