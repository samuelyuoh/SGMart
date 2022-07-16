const sequelize = require('sequelize');
const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create videos table in MySQL Database
const Coupon = db.define('coupon',
    {
        couponName: { type: Sequelize.STRING },
        percentageDiscount: { type: Sequelize.INTEGER },
        expiryDate: { type: Sequelize.DATE },
    });

module.exports = Coupon;