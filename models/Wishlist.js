const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create videos table in MySQL Database
const Wishlist = db.define('wishlist',
    {
        quantity :{ type: Sequelize.INTEGER},
    });
module.exports = Wishlist;