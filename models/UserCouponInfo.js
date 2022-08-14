const sequelize = require('sequelize');
const Sequelize = require('sequelize');
const db = require('../config/DBConfig');


const UserCouponInfo = db.define('usercouponinfo',
    {
        couponName: { type: Sequelize.STRING },
        percentageDiscount: { type: Sequelize.INTEGER },
        expiryDate: { type: Sequelize.DATE },
    });

module.exports = UserCouponInfo;