const sequelize = require('sequelize');
const Sequelize = require('sequelize');
const db = require('../config/DBConfig');


const Coupon = db.define('coupon',
    {
        pointstoattain: { type: Sequelize.INTEGER },
        couponName: { type: Sequelize.STRING },
        percentageDiscount: { type: Sequelize.INTEGER },
        expiryDate: { type: Sequelize.DATE },
        couponQuantity: { type: Sequelize.INTEGER },
        redeemedquantity: { type: Sequelize.INTEGER },
    });

module.exports = Coupon;