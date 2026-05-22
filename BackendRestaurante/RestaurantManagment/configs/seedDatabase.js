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
    name,
    surname,
    username,
    email,
    password: passwordHash,
    role,
    status: true,
    emailVerified: true
  }));

  const existingUsers = await User.findAll({
    where: {
      email: baseUsers.map((user) => user.email)
    }
  });

  const existingEmails = new Set(existingUsers.map((user) => user.email));
  const toInsert = baseUsers.filter((user) => !existingEmails.has(user.email));

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
    { name: 'Entradas', description: 'Platos para abrir el apetito', isActive: true },
    { name: 'Platos Fuertes', description: 'Recetas principales de la casa', isActive: true },
    { name: 'Postres', description: 'Dulces y especialidades para cerrar', isActive: true },
    { name: 'Bebidas', description: 'Bebidas frias, calientes y naturales', isActive: true },
    { name: 'Especiales', description: 'Recomendaciones del chef', isActive: true },
    { name: 'Parrilla', description: 'Cortes, brasas y acompanamientos', isActive: true },
    { name: 'Mariscos', description: 'Sabores frescos del mar', isActive: true },
    { name: 'Pastas', description: 'Pastas artesanales y salsas', isActive: true },
    { name: 'Desayunos', description: 'Opciones para iniciar el dia', isActive: true },
    { name: 'Vegetariano', description: 'Platos sin carne con buen sabor', isActive: true }
  ], 'Category');

  const restaurants = await seedMongoCollection(Restaurant, [
    ['El Buen Sabor', 'Comida tradicional con ambiente familiar', 'Zona 1, Ciudad', '12345678', 'buen.sabor@example.com', 'Tradicional', 65, '08:00', '22:00'],
    ['La Cuchara Dorada', 'Cocina internacional con platos exclusivos', 'Zona 3, Ciudad', '23456789', 'cuchara.dorada@example.com', 'Internacional', 90, '09:00', '23:00'],
    ['Sabores del Mar', 'Mariscos frescos y platos costeros', 'Zona 5, Ciudad', '34567890', 'sabores.mar@example.com', 'Mariscos', 120, '10:00', '23:00'],
    ['Parrilla de la Casa', 'Parrilladas y cortes premium', 'Zona 2, Ciudad', '45678901', 'parrilla.casa@example.com', 'Parrilla', 85, '11:00', '23:30'],
    ['Dulce Tentacion', 'Postres y cafes especiales', 'Zona 4, Ciudad', '56789012', 'dulce.tentacion@example.com', 'Postres', 40, '07:00', '21:00'],
    ['Casa Nativa', 'Cocina guatemalteca de temporada', 'Zona 10, Ciudad', '67890123', 'casa.nativa@example.com', 'Tradicional', 75, '08:30', '22:30'],
    ['Bistro Central', 'Bistro urbano con platos modernos', 'Zona 14, Ciudad', '78901234', 'bistro.central@example.com', 'Bistro', 110, '09:00', '22:00'],
    ['Terra Verde', 'Propuesta vegetariana y saludable', 'Zona 15, Ciudad', '89012345', 'terra.verde@example.com', 'Vegetariano', 70, '07:30', '21:30'],
    ['Pasta y Vino', 'Pastas frescas con seleccion de vinos', 'Zona 9, Ciudad', '90123456', 'pasta.vino@example.com', 'Pastas', 95, '11:00', '23:00'],
    ['Cafe Aurora', 'Desayunos, cafe de especialidad y brunch', 'Zona 13, Ciudad', '11223344', 'cafe.aurora@example.com', 'Cafe', 55, '06:30', '20:00']
  ].map(([name, description, address, phone, email, category, averagePrice, openingHour, closingHour]) => ({
    name,
    description,
    address,
    phone,
    email,
    category,
    averagePrice,
    openingHour,
    closingHour,
    image: '',
    isActive: true,
    averageRating: 4.5,
    totalReviews: 10
  })), 'Restaurant');

  const products = await seedMongoCollection(Product, [
    ['Pan de Ajo', 50, 1.5, 'Entradas'],
    ['Carne Asada', 35, 12.5, 'Platos Fuertes'],
    ['Tiramisu', 25, 5.0, 'Postres'],
    ['Limonada', 80, 2.0, 'Bebidas'],
    ['Masa de Pizza', 45, 4.0, 'Especiales'],
    ['Camarones', 30, 18.0, 'Mariscos'],
    ['Pasta Fresca', 60, 3.5, 'Pastas'],
    ['Cafe Molido', 40, 6.0, 'Bebidas'],
    ['Vegetales Mixtos', 70, 3.0, 'Vegetariano'],
    ['Huevos de Granja', 90, 1.2, 'Desayunos']
  ].map(([name, stock, cost, category], index) => ({
    name,
    stock,
    cost,
    category,
    restaurant: byIndex(restaurants, index),
    isActive: true
  })), 'Product');

  const dishes = await seedMongoCollection(Dish, [
    ['Ensalada Cesar', 'Lechuga, pollo, queso parmesano y aderezo de la casa', 8.5, 0, 0],
    ['Filete de Res', 'Filete jugoso con papas y vegetales', 14.9, 1, 1],
    ['Tiramisu Clasico', 'Postre italiano con cafe y mascarpone', 6.5, 2, 2],
    ['Limonada Natural', 'Bebida refrescante con limon y hierbabuena', 3.5, 3, 3],
    ['Pizza Especial', 'Pizza con ingredientes premium y salsa especial', 12.0, 4, 4],
    ['Camarones al Ajillo', 'Camarones salteados con ajo y mantequilla', 18.0, 6, 5],
    ['Fettuccine Alfredo', 'Pasta fresca con salsa cremosa', 11.5, 7, 6],
    ['Cafe Aurora', 'Cafe de especialidad preparado al momento', 4.0, 3, 7],
    ['Bowl Vegetariano', 'Vegetales, granos y aderezo de hierbas', 9.5, 9, 8],
    ['Desayuno Chapin', 'Huevos, frijoles, platano y queso fresco', 7.5, 8, 9]
  ].map(([name, description, price, categoryIndex, productIndex], index) => ({
    name,
    description,
    price,
    category: byIndex(categories, categoryIndex),
    restaurant: byIndex(restaurants, index),
    products: [{ product: byIndex(products, productIndex), quantity: index + 1 }],
    isAvailable: true
  })), 'Dish');

  const menus = await seedMongoCollection(Menu, [
    ['Menu Ejecutivo', 'Plato principal con bebida incluida', 'DAILY', 0],
    ['Menu Familiar', 'Opcion para compartir con la familia', 'EVENT', 1],
    ['Menu Mar', 'Especiales del mar para compartir', 'PROMOTION', 2],
    ['Menu Parrilla', 'Seleccion de cortes y acompanamientos', 'DAILY', 3],
    ['Menu Dulce', 'Postres y bebidas para cerrar con sabor', 'PROMOTION', 4],
    ['Menu Nativo', 'Sabores guatemaltecos de temporada', 'DAILY', 5],
    ['Menu Bistro', 'Platos modernos para almuerzo y cena', 'EVENT', 6],
    ['Menu Verde', 'Opciones vegetarianas completas', 'PROMOTION', 7],
    ['Menu Pasta', 'Pastas frescas con entrada', 'DAILY', 8],
    ['Menu Brunch', 'Desayuno tardio con cafe incluido', 'EVENT', 9]
  ].map(([name, description, type, index]) => ({
    name,
    description,
    restaurant: byIndex(restaurants, index),
    dishes: [byIndex(dishes, index), byIndex(dishes, index + 1)],
    type,
    validFrom: new Date('2026-01-01T00:00:00.000Z'),
    validUntil: new Date('2026-12-31T23:59:59.000Z'),
    isActive: true
  })), 'Menu');

  const tables = await seedMongoCollection(Table, Array.from({ length: REQUIRED_RECORDS }, (_, index) => ({
    number: index + 1,
    capacity: [2, 4, 4, 6, 8][index % 5],
    status: ['available', 'available', 'reserved', 'occupied'][index % 4],
    restaurant: byIndex(restaurants, index),
    location: ['Terraza', 'Salon Principal', 'Interior', 'VIP', 'Jardin'][index % 5]
  })), 'Table', null);

  const reservations = await seedMongoCollection(Reservation, Array.from({ length: REQUIRED_RECORDS }, (_, index) => ({
    user: String(index + 2),
    customerName: ['Ana Garcia', 'Luis Molina', 'Maria Perez', 'Jose Ruiz', 'Paola Mendez', 'Sofia Leon', 'Diego Cano', 'Valeria Soto', 'Andres Lima', 'Lucia Reyes'][index],
    customerPhone: `77${String(710000 + index).slice(0, 6)}`,
    table: byIndex(tables, index),
    date: fixedDate(index + 3, 19 + (index % 3)),
    numberOfPeople: [2, 3, 4, 5, 6][index % 5],
    status: ['pending', 'confirmed', 'confirmed', 'pending'][index % 4],
    notes: ['Mesa tranquila', 'Cumpleanos', 'Reunion de trabajo', 'Cena familiar', 'Menu vegetariano'][index % 5]
  })), 'Reservation', null);

  const events = await seedMongoCollection(Event, [
    ['Noche de Asado', 'Asado especial con cortes premium y musica en vivo', 7],
    ['Festival de Pasta', 'Degustacion de pastas y vinos seleccionados', 10],
    ['Tarde Marina', 'Mariscos frescos y degustacion costera', 14],
    ['Parrillada Nocturna', 'Cortes y acompanamientos para una velada', 21],
    ['Tardes Dulces', 'Postres y cafe en ambiente acogedor', 12],
    ['Sabores Chapines', 'Recetas tradicionales con marimba en vivo', 8],
    ['Cena Bistro', 'Menu de autor por temporada', 16],
    ['Brunch Verde', 'Brunch saludable con bebidas naturales', 6],
    ['Pasta Night', 'Noche italiana con pasta fresca', 18],
    ['Cafe y Jazz', 'Cafe de especialidad con musica suave', 11]
  ].map(([name, description, day], index) => ({
    restaurant: byIndex(restaurants, index),
    name,
    description,
    date: fixedDate(day, 20),
    status: 'active'
  })), 'Event');

  const orders = await seedMongoCollection(Order, Array.from({ length: REQUIRED_RECORDS }, (_, index) => {
    const subtotal = Number((18 + index * 4.75).toFixed(2));
    const tax = Number((subtotal * 0.12).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));
    const type = ['dine_in', 'delivery', 'takeaway'][index % 3];

    return {
      user: String(index + 2),
      restaurant: byIndex(restaurants, index),
      table: type === 'dine_in' ? byIndex(tables, index) : undefined,
      type,
      status: ['pending', 'preparing', 'ready', 'delivered', 'paid'][index % 5],
      address: type === 'delivery' ? `Zona ${index + 1}, Calle ${index + 10}` : '',
      subtotal,
      tax,
      total
    };
  }), 'Order', null);

  const orderDetails = await seedMongoCollection(OrderDetail, Array.from({ length: REQUIRED_RECORDS }, (_, index) => {
    const quantity = (index % 3) + 1;
    const price = dishes[index % dishes.length].price ?? 8;

    return {
      order: byIndex(orders, index),
      dish: byIndex(dishes, index),
      quantity,
      price,
      subtotal: Number((price * quantity).toFixed(2))
    };
  }), 'OrderDetail', null);

  await seedMongoCollection(Review, Array.from({ length: REQUIRED_RECORDS }, (_, index) => ({
    user: String(index + 2),
    restaurant: byIndex(restaurants, index),
    rating: [5, 4, 5, 4, 5, 4, 5, 3, 5, 4][index],
    comment: [
      'Excelente servicio y comida deliciosa.',
      'Muy buena experiencia, volvere pronto.',
      'Los mariscos estaban frescos y sabrosos.',
      'Ambiente agradable y buen sabor.',
      'Postres deliciosos y atencion excelente.',
      'Menu tradicional muy bien presentado.',
      'Buen ambiente para una cena tranquila.',
      'Opciones vegetarianas muy completas.',
      'La pasta estaba en su punto.',
      'Cafe excelente y servicio rapido.'
    ][index]
  })), 'Review', null);

  console.log(`RestaurantManagment fixed seed completed with at least ${REQUIRED_RECORDS} records per main entity.`);
};
