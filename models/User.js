const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create users table in MySQL Database
const User = db.define('user',
    {
        name: { type: Sequelize.STRING },
        email: { type: Sequelize.STRING },
        password: { type: Sequelize.STRING },
        phoneNumber:{ type: Sequelize.INTEGER },
        address: { type: Sequelize.STRING },
        address2: { type: Sequelize.STRING },
        postalCode: { type: Sequelize.INTEGER },
        amountSpent: { type: Sequelize.INTEGER },
        userType: { type: Sequelize.STRING }, //admin, staff, customer
        status: { type: Sequelize.INTEGER }, //0 active, 1 deactivated, 2 banned
        verified: { type: Sequelize.BOOLEAN },
        tfa: { type: Sequelize.BOOLEAN },
    });
module.exports = User;