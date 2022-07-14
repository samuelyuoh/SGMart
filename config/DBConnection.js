const mySQLDB = require('./DBConfig');
const User = require('../models/User');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Blog = require('../models/Category');


// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Database connected');
            /*
            Defines the relationship where a user has many videos.
            The primary key from user will be a foreign key in video.
            */
           Product.belongsTo(Brand);
           Brand.hasMany(Product);
           Product.belongsTo(Category);
           Category.hasMany(Product);
            mySQLDB.sync({
                force: drop
            });
        })
        .catch(err => console.log(err));
};
module.exports = { setUpDB };