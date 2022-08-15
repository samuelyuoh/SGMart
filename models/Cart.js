const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Cart = db.define('cart',
    {
        userId: {
            allowNull: true,
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        }   
    });

module.exports = Cart;