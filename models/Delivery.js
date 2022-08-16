const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create videos table in MySQL Database
const Delivery = db.define('delivery',
    {
        delivery_date: {type: Sequelize.DATE},
        delivery_time: {type: Sequelize.STRING},
        delivery_address : {type: Sequelize.STRING},
        delivery_city : {type: Sequelize.STRING},
        delivery_state : {type: Sequelize.STRING},
        delivery_zip : {type: Sequelize.STRING},
        userId: {
            allowNull: true,
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        orderId: {
            allowNull: true,
            type: Sequelize.INTEGER,
            references: {
                model: 'orders',
                key: 'id'
            }
        },   
    });
module.exports = Delivery;