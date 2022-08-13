const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create users table in MySQL Database
const Logs = db.define('logs',
    {
        logId: {type: Sequelize.STRING,
        primaryKey: true},
        action: {type: Sequelize.STRING},
        userId: {type: Sequelize.INTEGER,
            allowNull: false},
    });
module.exports = Logs;