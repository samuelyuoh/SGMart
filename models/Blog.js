const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create videos table in MySQL Database
const Blog = db.define('blog',
    {
        title: { type: Sequelize.STRING },
        article: { type: Sequelize.STRING(2000) },
        image: { type: Sequelize.STRING },
        topic: { type: Sequelize.STRING },
        language: { type: Sequelize.STRING }

    });


module.exports = Blog;