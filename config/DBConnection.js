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
const Order = require('../models/order');
const Invoice = require('../models/Invoice');



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
            Invoice.belongsTo(Order);
            Invoice.belongsTo(Cart);
            Order.hasMany(Invoice);
            Order.belongsTo(User);
            User.hasMany(Order);
            Invoice.belongsTo(Product)
            // Order.hasOne(Cart)
            // Cart.belongsTo(Order)
            mySQLDB.sync({
                force: drop
            });
        })
        .catch(err => console.log(err));
};

module.exports = { setUpDB };