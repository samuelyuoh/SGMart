const mySQLDB = require('./DBConfig');
const User = require('../models/User');

const Coupon = require('../models/Coupon')
const Delivery = require('../models/Delivery')
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Blog = require('../models/Category');
const Cart = require('../models/cart');
const Wishlist = require('../models/Wishlist');
const Logs = require('../models/Logs');



// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Database connected');
            /*
            Defines the relationship where a user has many videos.
            The primary key from user will be a foreign key in video.
            // */
            // User.hasMany(Coupon)
            // Coupon.belongsTo(User)
           Product.belongsTo(Brand);
           Brand.hasMany(Product);
           Product.belongsTo(Category);
           Category.hasMany(Product);
           Cart.belongsTo(Product);
           User.hasMany(Cart);
           Wishlist.belongsTo(User);
           User.hasMany(Wishlist);
           User.hasMany(Logs);
           Wishlist.belongsTo(Product);
            mySQLDB.sync({
                force: drop
            });
        })
        .catch(err => console.log(err));
};
module.exports = { setUpDB };