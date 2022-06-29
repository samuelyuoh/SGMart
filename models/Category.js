const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Category = db.define('category',
{
    category_name: { type: Sequelize.STRING }
});



module.exports = Category;