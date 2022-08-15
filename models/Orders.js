const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Orders = db.define('orders',
    {
        name: { type: Sequelize.STRING },
        email: { type: Sequelize.STRING },
        address: {type: Sequelize.STRING},
        phone: {type: Sequelize.INTEGER},
        delivery_date: {type: Sequelize.DATE},
        delivery_time: {type: Sequelize.STRING},
        total_price: { type: Sequelize.DECIMAL(7,2) },
    });
module.exports = Orders;