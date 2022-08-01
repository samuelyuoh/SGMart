const mySQLDB = require('./DBConfig');
const User = require('../models/User');

const Coupon = require('../models/Coupon')
const Delivery = require('../models/Delivery')
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Blog = require('../models/Category');
const Cart = require('../models/cart');
const Item = require('../models/item');



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
           User.hasMany(Cart)
           Cart.belongsTo(User, {foreignKey:{allowNull: true}});
           Cart.hasMany(Item);
           Item.belongsTo(Cart);
Item.belongsTo(Product);
            mySQLDB.sync({
                force: drop
            });
        })
        .catch(err => console.log(err));
};

module.exports = { setUpDB };