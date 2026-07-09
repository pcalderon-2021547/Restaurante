'use strict';

import bcrypt from 'bcryptjs';

import Category from '../src/fields/category/category.js';
import Product from '../src/fields/product/product.js';
import Restaurant from '../src/fields/restaurant/restaurant.model.js';
import Dish from '../src/fields/dish/dish.js';
import Menu from '../src/fields/menus/menu_model.js';
import Table from '../src/fields/table/table.js';
import Reservation from '../src/fields/reservation/reservation.js';
import Event from '../src/fields/evento/event.model.js';
import Review from '../src/fields/review/review.model.js';
import Order from '../src/fields/order/order_model.js';
import OrderDetail from '../src/fields/orderDetail/orderDetail.js';
import User from '../src/fields/user/user.js';

const REQUIRED_RECORDS = 10;
const fixedDate = (day, hour = 19) => new Date(Date.UTC(2026, 5, day, hour, 0, 0));

const createAdminUsers = async () => {
  const passwordHash = bcrypt.hashSync('Admin123!', 10);
  const baseUsers = [
    ['Admin', 'Restaurante', 'admin', 'admin@restaurante.local', 'ADMIN_ROLE'],
    ['Carlos', 'Perez', 'cperez', 'carlos@restaurante.local', 'USER_ROLE'],
    ['Ana', 'Lopez', 'alopez', 'ana@restaurante.local', 'USER_ROLE'],
    ['Luis', 'Gomez', 'lgomez', 'luis@restaurante.local', 'USER_ROLE'],
    ['Maria', 'Lopez', 'mlopez', 'maria@restaurante.local', 'USER_ROLE'],
    ['Sofia', 'Morales', 'smorales', 'sofia@restaurante.local', 'USER_ROLE'],
    ['Diego', 'Castillo', 'dcastillo', 'diego@restaurante.local', 'USER_ROLE'],
    ['Valeria', 'Ramos', 'vramos', 'valeria@restaurante.local', 'USER_ROLE'],
    ['Andres', 'Herrera', 'aherrera', 'andres@restaurante.local', 'USER_ROLE'],
    ['Lucia', 'Mendez', 'lmendez', 'lucia@restaurante.local', 'USER_ROLE']
  ].map(([name, surname, username, email, role]) => ({
    name, surname, username, email,
    password: passwordHash,
    role, status: true, emailVerified: true
  }));

  const existingUsers = await User.findAll({
    where: { email: baseUsers.map((u) => u.email) }
  });

  const existingEmails = new Set(existingUsers.map((u) => u.email));
  const toInsert = baseUsers.filter((u) => !existingEmails.has(u.email));

  if (toInsert.length > 0) {
    await User.bulkCreate(toInsert);
    console.log(`Seeded ${toInsert.length} User records.`);
  } else {
    console.log('Users already have the fixed seed records.');
  }
};

const seedMongoCollection = async (Model, items, collectionName, key = 'name') => {
  const canMatchByKey = key && items.every((item) => Object.prototype.hasOwnProperty.call(item, key));

  if (canMatchByKey) {
    const keys = items.map((item) => item[key]);
    const existing = await Model.find({ [key]: { $in: keys } });
    const existingKeys = new Set(existing.map((doc) => doc[key]));
    const toInsert = items.filter((item) => !existingKeys.has(item[key]));
    const toUpdate = items.filter((item) => existingKeys.has(item[key]));

    if (toInsert.length > 0) {
      await Model.insertMany(toInsert, { ordered: false });
      console.log(`Added ${toInsert.length} fixed documents to ${collectionName}.`);
    }

    if (toUpdate.length > 0) {
      await Promise.all(
        toUpdate.map((item) => Model.updateOne({ [key]: item[key] }, { $set: item }))
      );
      console.log(`Refreshed ${toUpdate.length} fixed documents in ${collectionName}.`);
    }

    if (toInsert.length === 0 && toUpdate.length === 0) {
      console.log(`${collectionName} already has the fixed seed records.`);
    } else {
      console.log(`${collectionName} fixed seed is ready.`);
    }

    const docs = await Model.find({ [key]: { $in: keys } });
    return keys.map((value) => docs.find((doc) => String(doc[key]) === String(value))).filter(Boolean);
  }

  const count = await Model.countDocuments();
  if (count < items.length) {
    const toInsert = items.slice(count);
    const inserted = await Model.insertMany(toInsert, { ordered: false });
    console.log(`Added ${inserted.length} fixed documents to ${collectionName}.`);
  } else {
    console.log(`${collectionName} already has at least ${items.length} records.`);
  }

  return await Model.find().sort({ createdAt: 1, _id: 1 }).limit(items.length);
};

const byIndex = (items, index) => items[index % items.length]._id;

export const seedDatabase = async () => {
  console.log('Starting fixed data seed for RestaurantManagment.');

  await createAdminUsers();

  const categories = await seedMongoCollection(Category, [
    { name: 'Entradas', description: 'Para abrir el apetito', isActive: true },
    { name: 'Cortes Premium', description: 'Los mejores cortes de la casa', isActive: true },
    { name: 'Parrilla Especial', description: 'Especialidades a la leña', isActive: true },
    { name: 'Acompañamientos', description: 'Guarniciones artesanales', isActive: true },
    { name: 'Ensaladas', description: 'Frescas y saludables', isActive: true },
    { name: 'Postres Caseros', description: 'Dulces tradicionales', isActive: true },
    { name: 'Cocktails y Bebidas', description: 'Mixología de autor', isActive: true },
    { name: 'Vinos', description: 'Selección de la casa', isActive: true },
    { name: 'Cervezas', description: 'Artesanales e importadas', isActive: true },
    { name: 'Café y Digestivos', description: 'Para cerrar con broche de oro', isActive: true }
  ], 'Category');

  const restaurants = await seedMongoCollection(Restaurant, [
    {
      name: 'Leña y Fuego',
      description: 'Parrilla guatemalteca de corazón. Cortes premium, leña de encino y sabores que encienden los sentidos. Ambiente rústico-elegante con terraza al aire libre.',
      address: '6a Avenida 1-27, Zona 10, Ciudad de Guatemala',
      phone: '2365-7890',
      email: 'info@lenayfuego.com',
      category: 'Parrilla',
      averagePrice: 150,
      openingHour: '12:00',
      closingHour: '23:00',
      image: '',
      isActive: true,
      averageRating: 4.7,
      totalReviews: 128
    },
    {
      name: 'El Buen Sabor',
      description: 'Comida tradicional con ambiente familiar',
      address: 'Zona 1, Ciudad', phone: '12345678',
      email: 'buen.sabor@example.com', category: 'Tradicional',
      averagePrice: 65, openingHour: '08:00', closingHour: '22:00',
      image: '', isActive: true, averageRating: 4.5, totalReviews: 10
    },
    {
      name: 'La Cuchara Dorada',
      description: 'Cocina internacional con platos exclusivos',
      address: 'Zona 3, Ciudad', phone: '23456789',
      email: 'cuchara.dorada@example.com', category: 'Internacional',
      averagePrice: 90, openingHour: '09:00', closingHour: '23:00',
      image: '', isActive: true, averageRating: 4.3, totalReviews: 10
    },
    {
      name: 'Sabores del Mar',
      description: 'Mariscos frescos y platos costeros',
      address: 'Zona 5, Ciudad', phone: '34567890',
      email: 'sabores.mar@example.com', category: 'Mariscos',
      averagePrice: 120, openingHour: '10:00', closingHour: '23:00',
      image: '', isActive: true, averageRating: 4.6, totalReviews: 10
    },
    {
      name: 'Parrilla de la Casa',
      description: 'Parrilladas y cortes premium',
      address: 'Zona 2, Ciudad', phone: '45678901',
      email: 'parrilla.casa@example.com', category: 'Parrilla',
      averagePrice: 85, openingHour: '11:00', closingHour: '23:30',
      image: '', isActive: true, averageRating: 4.4, totalReviews: 10
    },
    {
      name: 'Dulce Tentacion',
      description: 'Postres y cafes especiales',
      address: 'Zona 4, Ciudad', phone: '56789012',
      email: 'dulce.tentacion@example.com', category: 'Postres',
      averagePrice: 40, openingHour: '07:00', closingHour: '21:00',
      image: '', isActive: true, averageRating: 4.8, totalReviews: 10
    },
    {
      name: 'Casa Nativa',
      description: 'Cocina guatemalteca de temporada',
      address: 'Zona 10, Ciudad', phone: '67890123',
      email: 'casa.nativa@example.com', category: 'Tradicional',
      averagePrice: 75, openingHour: '08:30', closingHour: '22:30',
      image: '', isActive: true, averageRating: 4.5, totalReviews: 10
    },
    {
      name: 'Bistro Central',
      description: 'Bistro urbano con platos modernos',
      address: 'Zona 14, Ciudad', phone: '78901234',
      email: 'bistro.central@example.com', category: 'Bistro',
      averagePrice: 110, openingHour: '09:00', closingHour: '22:00',
      image: '', isActive: true, averageRating: 4.2, totalReviews: 10
    },
    {
      name: 'Terra Verde',
      description: 'Propuesta vegetariana y saludable',
      address: 'Zona 15, Ciudad', phone: '89012345',
      email: 'terra.verde@example.com', category: 'Vegetariano',
      averagePrice: 70, openingHour: '07:30', closingHour: '21:30',
      image: '', isActive: true, averageRating: 4.6, totalReviews: 10
    },
    {
      name: 'Cafe Aurora',
      description: 'Desayunos, cafe de especialidad y brunch',
      address: 'Zona 13, Ciudad', phone: '11223344',
      email: 'cafe.aurora@example.com', category: 'Cafe',
      averagePrice: 55, openingHour: '06:30', closingHour: '20:00',
      image: '', isActive: true, averageRating: 4.4, totalReviews: 10
    }
  ], 'Restaurant');

  const products = await seedMongoCollection(Product, [
    { name: 'Aguacate Hass', stock: 80, cost: 4.5, restaurant: byIndex(restaurants, 0), category: 'Entradas', isActive: true },
    { name: 'Queso Panela', stock: 60, cost: 3.5, restaurant: byIndex(restaurants, 0), category: 'Entradas', isActive: true },
    { name: 'Carne Prime Angus', stock: 40, cost: 28.0, restaurant: byIndex(restaurants, 0), category: 'Cortes Premium', isActive: true },
    { name: 'Rib Eye', stock: 30, cost: 32.0, restaurant: byIndex(restaurants, 0), category: 'Cortes Premium', isActive: true },
    { name: 'Filete Mignon', stock: 25, cost: 35.0, restaurant: byIndex(restaurants, 0), category: 'Cortes Premium', isActive: true },
    { name: 'Costillas de Cerdo', stock: 45, cost: 14.0, restaurant: byIndex(restaurants, 0), category: 'Parrilla Especial', isActive: true },
    { name: 'Pollo Entero', stock: 30, cost: 10.0, restaurant: byIndex(restaurants, 0), category: 'Parrilla Especial', isActive: true },
    { name: 'Chorizo Artesanal', stock: 60, cost: 6.0, restaurant: byIndex(restaurants, 0), category: 'Parrilla Especial', isActive: true },
    { name: 'Papa', stock: 200, cost: 1.0, restaurant: byIndex(restaurants, 0), category: 'Acompañamientos', isActive: true },
    { name: 'Elote Fresco', stock: 100, cost: 2.5, restaurant: byIndex(restaurants, 0), category: 'Acompañamientos', isActive: true },
    { name: 'Frijol Volteado', stock: 80, cost: 1.5, restaurant: byIndex(restaurants, 0), category: 'Acompañamientos', isActive: true },
    { name: 'Lechuga Romana', stock: 50, cost: 2.0, restaurant: byIndex(restaurants, 0), category: 'Ensaladas', isActive: true },
    { name: 'Chocolate Belga', stock: 40, cost: 8.0, restaurant: byIndex(restaurants, 0), category: 'Postres Caseros', isActive: true },
    { name: 'Crema de Leche', stock: 70, cost: 1.5, restaurant: byIndex(restaurants, 0), category: 'Postres Caseros', isActive: true },
    { name: 'Ron Zacapa', stock: 20, cost: 45.0, restaurant: byIndex(restaurants, 0), category: 'Cocktails y Bebidas', isActive: true },
    { name: 'Whisky Johnnie Walker', stock: 15, cost: 55.0, restaurant: byIndex(restaurants, 0), category: 'Vinos', isActive: true },
    { name: 'Vino Tinto Malbec', stock: 30, cost: 32.0, restaurant: byIndex(restaurants, 0), category: 'Vinos', isActive: true },
    { name: 'Cerveza Gallo', stock: 100, cost: 2.0, restaurant: byIndex(restaurants, 0), category: 'Cervezas', isActive: true },
    { name: 'Café de Altura', stock: 40, cost: 8.0, restaurant: byIndex(restaurants, 0), category: 'Café y Digestivos', isActive: true },
    { name: 'Pan de Baguette', stock: 60, cost: 1.5, restaurant: byIndex(restaurants, 0), category: 'Entradas', isActive: true }
  ], 'Product', 'name');

  const dishes = await seedMongoCollection(Dish, [
    { name: 'Guacamole con Totopos', description: 'Aguacate fresco, cebolla morada, tomate, cilantro y limón. Servido con totopos crujientes.', price: 45, category: byIndex(categories, 0), restaurant: byIndex(restaurants, 0), products: [{ product: byIndex(products, 0), quantity: 2 }, { product: byIndex(products, 19), quantity: 1 }], isAvailable: true },
    { name: 'Queso Fundido con Chorizo', description: 'Queso panela derretido con chorizo artesanal, acompañado de tortillas de maíz.', price: 55, category: byIndex(categories, 0), restaurant: byIndex(restaurants, 0), products: [{ product: byIndex(products, 1), quantity: 2 }, { product: byIndex(products, 7), quantity: 1 }], isAvailable: true },
    { name: 'New York Strip 300g', description: 'Corte de res prime a la parrilla con leña de encino. Punto exacto, jugoso y lleno de sabor.', price: 165, category: byIndex(categories, 1), restaurant: byIndex(restaurants, 0), products: [{ product: byIndex(products, 2), quantity: 1 }], isAvailable: true },
    { name: 'Rib Eye 400g', description: 'Corte angus con marmoleo perfecto, sellado a la parrilla. Acompañado de chimichurri de la casa.', price: 195, category: byIndex(categories, 1), restaurant: byIndex(restaurants, 0), products: [{ product: byIndex(products, 3), quantity: 1 }], isAvailable: true },
    { name: 'Filete Mignon 250g', description: 'El corte más tierno, envuelto en tocino y bañado en salsa de vino tinto.', price: 185, category: byIndex(categories, 1), restaurant: byIndex(restaurants, 0), products: [{ product: byIndex(products, 4), quantity: 1 }], isAvailable: true },
    { name: 'Costillas BBQ', description: 'Costillas de cerdo bañadas en salsa BBQ ahumada, horneadas lentamente hasta que se desprenden del hueso.', price: 95, category: byIndex(categories, 2), restaurant: byIndex(restaurants, 0), products: [{ product: byIndex(products, 5), quantity: 1 }], isAvailable: true },
    { name: 'Pollo a la Leña', description: 'Pollo entero marinado en especias, cocido lentamente en horno de leña. Piel crujiente, carne jugosa.', price: 85, category: byIndex(categories, 2), restaurant: byIndex(restaurants, 0), products: [{ product: byIndex(products, 6), quantity: 1 }], isAvailable: true },
    { name: 'Papas con Trufa', description: 'Papas fritas bañadas en aceite de trufa negra, queso parmesano y perejil fresco.', price: 35, category: byIndex(categories, 3), restaurant: byIndex(restaurants, 0), products: [{ product: byIndex(products, 8), quantity: 3 }], isAvailable: true },
    { name: 'Elote Asado con Queso', description: 'Elote fresco asado a la parrilla, bañado en crema, queso rallado y chile en polvo.', price: 30, category: byIndex(categories, 3), restaurant: byIndex(restaurants, 0), products: [{ product: byIndex(products, 9), quantity: 1 }, { product: byIndex(products, 13), quantity: 1 }], isAvailable: true },
    { name: 'Frijoles Volteados', description: 'Frijoles volteados artesanales con crema, queso fresco y salsa verde.', price: 25, category: byIndex(categories, 3), restaurant: byIndex(restaurants, 0), products: [{ product: byIndex(products, 10), quantity: 2 }], isAvailable: true },
    { name: 'Ensalada Caesar', description: 'Lechuga romana fresca, aderezo Caesar de la casa, crutones, queso parmesano y pollo a la plancha.', price: 45, category: byIndex(categories, 4), restaurant: byIndex(restaurants, 0), products: [{ product: byIndex(products, 11), quantity: 1 }], isAvailable: true },
    { name: 'Tarta de Chocolate', description: 'Chocolate belga fundido con base de galleta, servido con helado de vainilla y fresas.', price: 45, category: byIndex(categories, 5), restaurant: byIndex(restaurants, 0), products: [{ product: byIndex(products, 12), quantity: 1 }, { product: byIndex(products, 13), quantity: 1 }], isAvailable: true },
    { name: 'Flan de Caramelo', description: 'Flan casero de vainilla con caramelo líquido, crema batida y cereza.', price: 35, category: byIndex(categories, 5), restaurant: byIndex(restaurants, 0), products: [{ product: byIndex(products, 13), quantity: 2 }], isAvailable: true },
    { name: 'Margarita Clásica', description: 'Tequila reposado, limón fresco, triple sec y sal en el borde.', price: 50, category: byIndex(categories, 6), restaurant: byIndex(restaurants, 0), products: [{ product: byIndex(products, 14), quantity: 1 }], isAvailable: true },
    { name: 'Old Fashioned', description: 'Whisky bourbon, amargo de angostura, azúcar y naranja.', price: 65, category: byIndex(categories, 6), restaurant: byIndex(restaurants, 0), products: [{ product: byIndex(products, 15), quantity: 1 }], isAvailable: true },
    { name: 'Café de Olla', description: 'Café de altura guatemalteco con canela, piloncillo y naranja. Servido en jarro de barro.', price: 25, category: byIndex(categories, 9), restaurant: byIndex(restaurants, 0), products: [{ product: byIndex(products, 18), quantity: 1 }], isAvailable: true }
  ], 'Dish', 'name');

  const menus = await seedMongoCollection(Menu, [
    { name: 'Menú Ejecutivo', description: 'Plato fuerte a elegir + bebida + postre de la casa', type: 'DAILY', restaurant: byIndex(restaurants, 0), dishes: [byIndex(dishes, 0), byIndex(dishes, 3)], validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31'), isActive: true },
    { name: 'Menú Parrillero', description: 'Degustación de 3 cortes: New York Strip, Rib Eye y Filete Mignon con acompañamientos', type: 'DAILY', restaurant: byIndex(restaurants, 0), dishes: [byIndex(dishes, 2), byIndex(dishes, 3), byIndex(dishes, 4)], validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31'), isActive: true },
    { name: 'Menú Maridaje', description: 'Corte premium + copa de vino tinto Malbec + postre', type: 'PROMOTION', restaurant: byIndex(restaurants, 0), dishes: [byIndex(dishes, 3), byIndex(dishes, 11)], validFrom: new Date('2026-06-01'), validUntil: new Date('2026-09-30'), isActive: true },
    { name: 'Menú Familiar', description: 'Parrillada para 4 personas: costillas, pollo, chorizo, acompañamientos y bebidas', type: 'EVENT', restaurant: byIndex(restaurants, 0), dishes: [byIndex(dishes, 5), byIndex(dishes, 6), byIndex(dishes, 7), byIndex(dishes, 8)], validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31'), isActive: true },
    { name: 'Noche de Parrilla', description: 'Cena especial con cortes premium y cocktail de bienvenida', type: 'EVENT', restaurant: byIndex(restaurants, 0), dishes: [byIndex(dishes, 2), byIndex(dishes, 4), byIndex(dishes, 13)], validFrom: new Date('2026-07-01'), validUntil: new Date('2026-12-31'), isActive: true },
    { name: 'Menú Infantil', description: 'Mini hamburguesa de res con papas + refresco + helado', type: 'DAILY', restaurant: byIndex(restaurants, 0), dishes: [byIndex(dishes, 7), byIndex(dishes, 11)], validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31'), isActive: true },
    { name: 'Brunch de Fuego', description: 'Desayuno tardío: café de olla, guacamole, elote asado y opción de corte', type: 'PROMOTION', restaurant: byIndex(restaurants, 0), dishes: [byIndex(dishes, 0), byIndex(dishes, 8), byIndex(dishes, 15)], validFrom: new Date('2026-06-01'), validUntil: new Date('2026-08-31'), isActive: true },
    { name: 'Menú de Temporada', description: 'Especial del chef con ingredientes de temporada', type: 'PROMOTION', restaurant: byIndex(restaurants, 0), dishes: [byIndex(dishes, 1), byIndex(dishes, 5), byIndex(dishes, 14)], validFrom: new Date('2026-07-01'), validUntil: new Date('2026-09-30'), isActive: true },
    { name: 'Cena Romántica', description: 'Entrada + Filete Mignon + Tarta de chocolate + copa de vino', type: 'EVENT', restaurant: byIndex(restaurants, 0), dishes: [byIndex(dishes, 0), byIndex(dishes, 4), byIndex(dishes, 11)], validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31'), isActive: true },
    { name: 'Happy Hour Parrilla', description: 'Cocktails 2x1 y media orden de costillas BBQ', type: 'PROMOTION', restaurant: byIndex(restaurants, 0), dishes: [byIndex(dishes, 5), byIndex(dishes, 13), byIndex(dishes, 14)], validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31'), isActive: true }
  ], 'Menu', 'name');

  const tables = await seedMongoCollection(Table, Array.from({ length: REQUIRED_RECORDS }, (_, index) => ({
    number: index + 1,
    capacity: [2, 4, 4, 6, 8, 2, 4, 6, 4, 8][index],
    status: ['available', 'available', 'reserved', 'occupied', 'available', 'available', 'reserved', 'available', 'occupied', 'available'][index],
    restaurant: byIndex(restaurants, index),
    location: ['Terraza', 'Salón Principal', 'VIP', 'Terraza', 'Jardín', 'Salón Principal', 'VIP', 'Terraza', 'Salón Principal', 'Jardín'][index]
  })), 'Table', null);

  const reservations = await seedMongoCollection(Reservation, Array.from({ length: REQUIRED_RECORDS }, (_, index) => ({
    user: String(index + 2),
    customerName: ['Ana García', 'Luis Molina', 'María Pérez', 'José Ruiz', 'Paola Méndez', 'Sofía León', 'Diego Cano', 'Valeria Soto', 'Andrés Lima', 'Lucía Reyes'][index],
    customerPhone: `77${String(710000 + index).slice(0, 6)}`,
    table: byIndex(tables, index),
    date: fixedDate(index + 3, 19 + (index % 3)),
    numberOfPeople: [2, 3, 4, 5, 6, 2, 4, 6, 3, 5][index],
    status: ['pending', 'confirmed', 'confirmed', 'pending', 'cancelled', 'confirmed', 'pending', 'confirmed', 'confirmed', 'pending'][index],
    notes: ['Mesa tranquila para aniversario', 'Cumpleaños', 'Reunión de trabajo', 'Cena familiar', '', 'Primera cita', 'Clientes frecuentes', 'Alergia al gluten', 'Todo bien', ''][index]
  })), 'Reservation', null);

  const events = await seedMongoCollection(Event, [
    { name: 'Noche de Asado', description: 'Asado especial con cortes premium, fuego en vivo y música acústica.', date: fixedDate(7, 20), restaurant: byIndex(restaurants, 0), status: 'active' },
    { name: 'Maridaje de Vinos', description: 'Degustación de 5 vinos con cortes seleccionados por el chef.', date: fixedDate(14, 19), restaurant: byIndex(restaurants, 0), status: 'active' },
    { name: 'Festival del Chile', description: 'Platos especiales con chiles guatemaltecos, nivel de picante progresivo.', date: fixedDate(21, 20), restaurant: byIndex(restaurants, 0), status: 'active' },
    { name: 'Tarde de Fuego', description: 'Parrillada libre con cortes ilimitados y acompañamientos.', date: fixedDate(28, 13), restaurant: byIndex(restaurants, 0), status: 'active' },
    { name: 'Noche de Salsa', description: 'Música en vivo de salsa y bachata con cocteles especiales.', date: fixedDate(10, 21), restaurant: byIndex(restaurants, 0), status: 'active' },
    { name: 'Clase de Parrilla', description: 'Aprende técnicas de parrilla con nuestro chef ejecutivo.', date: fixedDate(17, 10), restaurant: byIndex(restaurants, 0), status: 'active' },
    { name: 'Domingo de Fuego', description: 'Brunch parrillero para toda la familia con actividades para niños.', date: fixedDate(25, 11), restaurant: byIndex(restaurants, 0), status: 'active' },
    { name: 'Cena de Maridaje', description: 'Maridaje de 4 tiempos: cortes, vinos y licores de la casa.', date: fixedDate(5, 20), restaurant: byIndex(restaurants, 0), status: 'active' },
    { name: 'Noche de Jazz', description: 'Jazz en vivo con cocteles de autor y tapas de la casa.', date: fixedDate(12, 20), restaurant: byIndex(restaurants, 0), status: 'active' },
    { name: 'Cata de Ron', description: 'Cata guiada de rones guatemaltecos con maridaje de chocolate.', date: fixedDate(19, 19), restaurant: byIndex(restaurants, 0), status: 'active' }
  ], 'Event', 'name');

  const orders = await seedMongoCollection(Order, Array.from({ length: REQUIRED_RECORDS }, (_, index) => {
    const subtotal = Number((18 + index * 4.75).toFixed(2));
    const tax = Number((subtotal * 0.12).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));
    const type = ['dine_in', 'delivery', 'takeaway'][index % 3];

    return {
      user: String(index + 2),
      restaurant: byIndex(restaurants, 0),
      table: type === 'dine_in' ? byIndex(tables, index) : undefined,
      type,
      status: ['pending', 'preparing', 'ready', 'delivered', 'paid', 'preparing', 'ready', 'delivered', 'paid', 'pending'][index],
      address: type === 'delivery' ? `Zona ${index + 1}, Calle ${index + 10}` : '',
      subtotal, tax, total
    };
  }), 'Order', null);

  const orderDetails = await seedMongoCollection(OrderDetail, Array.from({ length: REQUIRED_RECORDS }, (_, index) => {
    const quantity = (index % 3) + 1;
    const price = dishes[index % dishes.length].price ?? 8;

    return {
      order: byIndex(orders, index),
      dish: byIndex(dishes, index),
      quantity, price,
      subtotal: Number((price * quantity).toFixed(2))
    };
  }), 'OrderDetail', null);

  await seedMongoCollection(Review, Array.from({ length: REQUIRED_RECORDS }, (_, index) => ({
    user: String(index + 2),
    restaurant: byIndex(restaurants, index),
    rating: [5, 4, 5, 4, 5, 4, 5, 3, 5, 4][index],
    comment: [
      'Espectacular. El rib eye estaba perfecto y el ambiente es increíble.',
      'Buena atención, la comida llegó rápido. Volveré.',
      'Los cortes son de primera calidad. El mejor lugar para carne en Guate.',
      'Las costillas BBQ son las mejores que he probado.',
      'El filete mignon se derrite en la boca. Postre excelente.',
      'Ambiente agradable, perfecto para una cita romántica.',
      'El guacamole es fresco y delicioso. Precios justos.',
      'Buena opción para grupos grandes. La terraza es ideal.',
      'El café de olla es espectacular. Postres caseros deliciosos.',
      'La atención al cliente es excepcional. Súper recomendado.'
    ][index]
  })), 'Review', null);

  console.log(`RestaurantManagment fixed seed completed with at least ${REQUIRED_RECORDS} records per main entity.`);
};
