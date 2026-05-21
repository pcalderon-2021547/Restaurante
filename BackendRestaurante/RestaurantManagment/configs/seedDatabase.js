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

const createAdminUsers = async () => {
  const passwordHash = bcrypt.hashSync('Admin123!', 10);
  const baseUsers = [
    {
      name: 'Admin',
      surname: 'Restaurante',
      username: 'admin',
      email: 'admin@restaurante.local',
      password: passwordHash,
      role: 'ADMIN_ROLE',
      status: true,
      emailVerified: true
    },
    {
      name: 'Carlos',
      surname: 'Perez',
      username: 'cperez',
      email: 'carlos@restaurante.local',
      password: passwordHash,
      role: 'USER_ROLE',
      status: true,
      emailVerified: true
    },
    {
      name: 'Ana',
      surname: 'Lopez',
      username: 'alopez',
      email: 'ana@restaurante.local',
      password: passwordHash,
      role: 'USER_ROLE',
      status: true,
      emailVerified: true
    },
    {
      name: 'Luis',
      surname: 'Gomez',
      username: 'lgomez',
      email: 'luis@restaurante.local',
      password: passwordHash,
      role: 'USER_ROLE',
      status: true,
      emailVerified: true
    },
    {
      name: 'Maria',
      surname: 'Lopez',
      username: 'mlopez',
      email: 'maria@restaurante.local',
      password: passwordHash,
      role: 'USER_ROLE',
      status: true,
      emailVerified: true
    }
  ];

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
    return;
  }

  console.log('Users already exist, skipping user seed.');
};

const seedMongoCollection = async (Model, items, collectionName) => {
  const count = await Model.countDocuments();

  if (count === 0) {
    const docs = await Model.insertMany(items);
    console.log(`Seeded ${docs.length} documents into ${collectionName}.`);
    return docs;
  }

  const canMatchByName = items.every((item) => item && Object.prototype.hasOwnProperty.call(item, 'name'));
  if (count < items.length && canMatchByName) {
    const existing = await Model.find({
      name: { $in: items.map((item) => item.name) }
    });
    const existingNames = new Set(existing.map((doc) => doc.name));
    const toInsert = items.filter((item) => !existingNames.has(item.name));

    if (toInsert.length > 0) {
      const inserted = await Model.insertMany(toInsert);
      console.log(`Added ${inserted.length} missing documents to ${collectionName}.`);
      return [...existing, ...inserted];
    }

    console.log(`${collectionName} already has data, skipping seed.`);
    return await Model.find().limit(items.length);
  }

  if (count < items.length) {
    const existing = await Model.find().limit(count);
    const toInsert = items.slice(count);
    const inserted = await Model.insertMany(toInsert);
    console.log(`Added ${inserted.length} missing documents to ${collectionName}.`);
    return [...existing, ...inserted];
  }

  console.log(`${collectionName} already has data, skipping seed.`);
  return await Model.find().limit(items.length);
};

export const seedDatabase = async () => {
  console.log('Starting data seed for RestaurantManagment.');

  await createAdminUsers();

  const categories = await seedMongoCollection(Category, [
    { name: 'Entradas', description: 'Platos para iniciar el menú', isActive: true },
    { name: 'Platos Fuertes', description: 'Platos principales con sabor local', isActive: true },
    { name: 'Postres', description: 'Dulces y postres para terminar la comida', isActive: true },
    { name: 'Bebidas', description: 'Refrescos y bebidas calientes', isActive: true },
    { name: 'Especiales', description: 'Platos especiales del chef', isActive: true }
  ], 'Category');

  const products = await seedMongoCollection(Product, [
    { name: 'Pan de Ajo', stock: 50, cost: 1.5, category: 'Entradas' },
    { name: 'Carne Asada', stock: 20, cost: 12.5, category: 'Platos Fuertes' },
    { name: 'Tiramisu', stock: 15, cost: 5.0, category: 'Postres' },
    { name: 'Limonada', stock: 40, cost: 2.0, category: 'Bebidas' },
    { name: 'Pizza Especial', stock: 25, cost: 10.0, category: 'Especiales' }
  ], 'Product');

  const restaurants = await seedMongoCollection(Restaurant, [
    {
      name: 'El Buen Sabor',
      description: 'Restaurante de comida tradicional con ambiente familiar',
      address: 'Zona 1, Ciudad',
      phone: '12345678',
      email: 'buen.sabor@example.com',
      category: 'Asado',
      averagePrice: 65,
      openingHour: '08:00',
      closingHour: '22:00',
      image: '',
      isActive: true
    },
    {
      name: 'La Cuchara Dorada',
      description: 'Cocina internacional con platos exclusivos',
      address: 'Zona 3, Ciudad',
      phone: '23456789',
      email: 'cuchara.dorada@example.com',
      category: 'Internacional',
      averagePrice: 90,
      openingHour: '09:00',
      closingHour: '23:00',
      image: '',
      isActive: true
    },
    {
      name: 'Sabores del Mar',
      description: 'Mariscos frescos y platos costeros',
      address: 'Zona 5, Ciudad',
      phone: '34567890',
      email: 'sabores.mar@example.com',
      category: 'Mariscos',
      averagePrice: 120,
      openingHour: '10:00',
      closingHour: '23:00',
      image: '',
      isActive: true
    },
    {
      name: 'Parrilla de la Casa',
      description: 'Parrilladas y cortes premium',
      address: 'Zona 2, Ciudad',
      phone: '45678901',
      email: 'parrilla.casa@example.com',
      category: 'Parrilla',
      averagePrice: 85,
      openingHour: '11:00',
      closingHour: '23:30',
      image: '',
      isActive: true
    },
    {
      name: 'Dulce Tentación',
      description: 'Postres y cafés especiales',
      address: 'Zona 4, Ciudad',
      phone: '56789012',
      email: 'dulce.tentacion@example.com',
      category: 'Postres',
      averagePrice: 40,
      openingHour: '07:00',
      closingHour: '21:00',
      image: '',
      isActive: true
    }
  ], 'Restaurant');

  const dishes = await seedMongoCollection(Dish, [
    {
      name: 'Ensalada César',
      description: 'Lechuga, pollo, queso parmesano y aderezo César',
      price: 8.5,
      category: categories[0]._id,
      restaurant: restaurants[0]._id,
      products: [{ product: products[0]._id, quantity: 2 }],
      isAvailable: true
    },
    {
      name: 'Filete de Res',
      description: 'Filete jugoso con papas a la francesa',
      price: 14.9,
      category: categories[1]._id,
      restaurant: restaurants[1]._id,
      products: [{ product: products[1]._id, quantity: 1 }],
      isAvailable: true
    },
    {
      name: 'Tiramisú Clásico',
      description: 'Postre italiano con café y mascarpone',
      price: 6.5,
      category: categories[2]._id,
      restaurant: restaurants[4]._id,
      products: [{ product: products[2]._id, quantity: 1 }],
      isAvailable: true
    },
    {
      name: 'Limonada Natural',
      description: 'Bebida refrescante con limón y hierbabuena',
      price: 3.5,
      category: categories[3]._id,
      restaurant: restaurants[2]._id,
      products: [{ product: products[3]._id, quantity: 1 }],
      isAvailable: true
    },
    {
      name: 'Pizza Especial de la Casa',
      description: 'Pizza con ingredientes premium y salsa especial',
      price: 12.0,
      category: categories[4]._id,
      restaurant: restaurants[3]._id,
      products: [{ product: products[4]._id, quantity: 1 }],
      isAvailable: true
    }
  ], 'Dish');

  const menus = await seedMongoCollection(Menu, [
    {
      name: 'Menú Ejecutivo',
      description: 'Plato principal con bebida incluida',
      restaurant: restaurants[0]._id,
      dishes: [dishes[0]._id, dishes[1]._id],
      type: 'DAILY',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      name: 'Menú Familiar',
      description: 'Opción para compartir con la familia',
      restaurant: restaurants[1]._id,
      dishes: [dishes[1]._id, dishes[2]._id],
      type: 'EVENT',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      name: 'Menú Mar',
      description: 'Especiales del mar para compartir',
      restaurant: restaurants[2]._id,
      dishes: [dishes[2]._id, dishes[3]._id],
      type: 'PROMOTION',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      name: 'Menú Parrilla',
      description: 'Selección de cortes y acompañamientos',
      restaurant: restaurants[3]._id,
      dishes: [dishes[1]._id, dishes[4]._id],
      type: 'DAILY',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      name: 'Menú Dulce',
      description: 'Postres y bebidas para cerrar con sabor',
      restaurant: restaurants[4]._id,
      dishes: [dishes[2]._id, dishes[3]._id],
      type: 'PROMOTION',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      isActive: true
    }
  ], 'Menu');

  const tables = await seedMongoCollection(Table, [
    { number: 1, capacity: 4, status: 'available', restaurant: restaurants[0]._id, location: 'Terraza' },
    { number: 2, capacity: 2, status: 'available', restaurant: restaurants[0]._id, location: 'Salón' },
    { number: 3, capacity: 4, status: 'reserved', restaurant: restaurants[1]._id, location: 'Interior' },
    { number: 4, capacity: 6, status: 'occupied', restaurant: restaurants[2]._id, location: 'VIP' },
    { number: 5, capacity: 4, status: 'available', restaurant: restaurants[3]._id, location: 'Jardín' }
  ], 'Table');

  const reservations = await seedMongoCollection(Reservation, [
    {
      user: '2',
      customerName: 'Ana García',
      customerPhone: '77712345',
      table: tables[0]._id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      numberOfPeople: 4,
      notes: 'Mesa cerca de ventana'
    },
    {
      user: '3',
      customerName: 'Luis Molina',
      customerPhone: '77723456',
      table: tables[1]._id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      numberOfPeople: 2,
      notes: 'Cumpleaños'
    },
    {
      user: '4',
      customerName: 'Maria Pérez',
      customerPhone: '77734567',
      table: tables[2]._id,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      numberOfPeople: 4,
      notes: 'Reunión de trabajo'
    },
    {
      user: '5',
      customerName: 'José Ruiz',
      customerPhone: '77745678',
      table: tables[3]._id,
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      numberOfPeople: 6,
      notes: 'Cena familiar'
    },
    {
      user: '2',
      customerName: 'Paola Méndez',
      customerPhone: '77756789',
      table: tables[4]._id,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      numberOfPeople: 4,
      notes: 'Solicita menú vegetariano'
    }
  ], 'Reservation');

  const events = await seedMongoCollection(Event, [
    {
      restaurant: restaurants[0]._id,
      name: 'Noche de Asado',
      description: 'Asado especial con cortes premium y música en vivo',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      restaurant: restaurants[1]._id,
      name: 'Festival de Pasta',
      description: 'Degustación de pastas italianas y vinos seleccionados',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      restaurant: restaurants[2]._id,
      name: 'Tarde Marina',
      description: 'Mariscos frescos y evento de degustación',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      restaurant: restaurants[3]._id,
      name: 'Parrillada Nocturna',
      description: 'Cortes y acompañamientos especiales para una velada',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      restaurant: restaurants[4]._id,
      name: 'Tardes Dulces',
      description: 'Postres y café en un ambiente acogedor',
      date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      status: 'active'
    }
  ], 'Event');

  const orders = await seedMongoCollection(Order, [
    {
      user: '2',
      restaurant: restaurants[0]._id,
      table: tables[0]._id,
      type: 'dine_in',
      status: 'pending',
      address: '',
      subtotal: 25,
      tax: 2.5,
      total: 27.5
    },
    {
      user: '3',
      restaurant: restaurants[1]._id,
      table: tables[1]._id,
      type: 'dine_in',
      status: 'preparing',
      address: '',
      subtotal: 30,
      tax: 3,
      total: 33
    },
    {
      user: '4',
      restaurant: restaurants[2]._id,
      type: 'delivery',
      status: 'preparing',
      address: 'Ciudad, Zona 9, Casa 123',
      subtotal: 20,
      tax: 2,
      total: 22
    },
    {
      user: '5',
      restaurant: restaurants[3]._id,
      table: tables[3]._id,
      type: 'dine_in',
      status: 'ready',
      address: '',
      subtotal: 45,
      tax: 4.5,
      total: 49.5
    },
    {
      user: '2',
      restaurant: restaurants[4]._id,
      type: 'takeaway',
      status: 'delivered',
      address: 'Zona 4, Calle 5',
      subtotal: 15,
      tax: 1.5,
      total: 16.5
    }
  ], 'Order');

  await seedMongoCollection(OrderDetail, [
    { order: orders[0]._id, dish: dishes[0]._id, quantity: 2, price: 8.5, subtotal: 17 },
    { order: orders[1]._id, dish: dishes[1]._id, quantity: 1, price: 14.9, subtotal: 14.9 },
    { order: orders[2]._id, dish: dishes[3]._id, quantity: 1, price: 3.5, subtotal: 3.5 },
    { order: orders[3]._id, dish: dishes[4]._id, quantity: 2, price: 12.0, subtotal: 24 },
    { order: orders[4]._id, dish: dishes[2]._id, quantity: 1, price: 6.5, subtotal: 6.5 }
  ], 'OrderDetail');

  await seedMongoCollection(Review, [
    { user: '2', restaurant: restaurants[0]._id, rating: 5, comment: 'Excelente servicio y comida deliciosa.' },
    { user: '3', restaurant: restaurants[1]._id, rating: 4, comment: 'Muy buena experiencia, volveré pronto.' },
    { user: '4', restaurant: restaurants[2]._id, rating: 5, comment: 'Los mariscos estaban frescos y sabrosos.' },
    { user: '5', restaurant: restaurants[3]._id, rating: 4, comment: 'Ambiente agradable y buen sabor.' },
    { user: '2', restaurant: restaurants[4]._id, rating: 5, comment: 'Postres deliciosos y atención excelente.' }
  ], 'Review');

  console.log('RestaurantManagment seed completed.');
};
