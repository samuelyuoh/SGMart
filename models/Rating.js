const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Rating = db.define('rating',
    {
        rating: { type: Sequelize.INTEGER}
    });


module.exports = Rating;