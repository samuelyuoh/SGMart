const sequelize = require('sequelize');
const Sequelize = require('sequelize');
const db = require('../config/DBConfig');


const CouponRedemption = db.define('couponredemption',
    {
        DateofRedemption: { type: Sequelize.DATEONLY, allowNull: false },

    });

module.exports = CouponRedemption;