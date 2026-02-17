'use strict'

import { Router } from 'express';
import { createUser, getUsers, updateUser, deleteUser } from './userController.js';
import { uploadProfilePicture } from '../../../middlewares/multer-upload.js';

const router = Router();

router.post(
    '/register', 
    uploadProfilePicture.single('profilePicture'), 
    createUser
);

router.get('/', getUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;