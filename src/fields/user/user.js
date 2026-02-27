'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from '../../../configs/db.js'; // ajusta la ruta si es necesario

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    surname: {
        type: DataTypes.STRING,
        allowNull: false
    },

    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    role: {
        type: DataTypes.ENUM('ADMIN_ROLE', 'USER_ROLE'),
        defaultValue: 'USER_ROLE'
    },

    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    emailToken: {
        type: DataTypes.STRING
    },
    resetToken: {
        type: DataTypes.STRING
    },
    resetTokenExpiration: {
        type: DataTypes.BIGINT
    },
    deleteToken: {
        type: DataTypes.STRING
    },
    deleteTokenExpiration: {
        type: DataTypes.BIGINT
    }

}, {
    timestamps: true
});

export default User;