const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Rating = db.define('rating',
    {
        rating: { type: Sequelize.INTEGER},
        orderId: {allowNull: true,
            type: Sequelize.INTEGER,
            references: {
                model: 'orders',
                key: 'id'
            }}
    });


module.exports = Rating;