const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Item = db.define('item',
    {
        quantity : {type: Sequelize.INTEGER},
    });


module.exports = Item;