'use strict';
import multer from 'multer';

// Esto guarda la foto en la carpeta principal de tu proyecto
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './'); 
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

export const uploadProfilePicture = multer({ storage });