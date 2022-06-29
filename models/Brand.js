const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Brand = db.define('brand',
{
    brand_name: { type: Sequelize.STRING },
});

module.exports = Brand;