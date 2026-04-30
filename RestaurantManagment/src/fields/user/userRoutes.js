'use strict'

import { Router } from 'express';
import {
    createUser,
    getUsers,
    updateUser,
    deleteUser,
    confirmDeleteAdmin
} from './userController.js';

import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

/**
 * @swagger
 * /restaurantManagement/v1/users/create:
 *   post:
 *     summary: Crear usuario (solo ADMIN)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Usuario creado
 *       403:
 *         description: Solo administradores
 */

/**
 * @swagger
 * /restaurantManagement/v1/users/:
 *   get:
 *     summary: Listar todos los usuarios (paginado)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */

/**
 * @swagger
 * /restaurantManagement/v1/users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 */

/**
 * @swagger
 * /restaurantManagement/v1/users/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado o correo de confirmación enviado
 *       404:
 *         description: Usuario no encontrado
 */

router.post('/create',  createUser);
router.get('/', validateJWT, getUsers);
router.put('/:id', validateJWT,  updateUser);
router.delete('/:id', validateJWT, deleteUser);
router.get('/confirm-delete', validateJWT, confirmDeleteAdmin);

export default router;