const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Invoice = db.define('invoice',
    {
        quantity:{type: Sequelize.INTEGER},
        product_name: { type: Sequelize.STRING },
        product_price: { type: Sequelize.DECIMAL(5,2) },
        totalCost: { type: Sequelize.DECIMAL(5,2) },
        discount: { type: Sequelize.DECIMAL(5,2) },
        desc: { type: Sequelize.STRING(500) },
        image: { type: Sequelize.STRING }
    });


module.exports = Invoice;