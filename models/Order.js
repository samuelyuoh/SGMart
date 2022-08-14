const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
var Schema = db.Schema

const Order = db.define('order',
    {
        name: { type: Sequelize.STRING },
        email: { type: Sequelize.STRING },
        address: {type: Sequelize.STRING},
        phone: {type: Sequelize.INTEGER},
        delivery_date: {type: Sequelize.DATE},
        delivery_time: {type: Sequelize.STRING}
    });
module.exports = Order;