const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Cart = db.define('cart',
    {
    });

module.exports = Cart;