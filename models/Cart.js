const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Cart = db.define('cart',
    {
        // productId:{type: Sequelize.INTEGER},
        // quantity:{type: Sequelize.INTEGER},
        // product_name: { type: Sequelize.STRING },
        // product_price: { type: Sequelize.DECIMAL(5,2) },
        // totalCost: { type: Sequelize.DECIMAL(5,2) },
        // discount: { type: Sequelize.DECIMAL(5,2) },
        // stock: { type: Sequelize.INTEGER },
        // desc: { type: Sequelize.STRING },
        // image: { type: Sequelize.STRING }
    });

module.exports = Cart;