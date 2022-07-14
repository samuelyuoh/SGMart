// const express = require('express');
// const router = express.Router();
// const moment = require('moment');
// const Product = require("../models/Product");

// var Cart = require('../models/cart');
// var fs = require('fs');

// router.post('/add/:id', function(req, res, next) {
//     var productId = req.params.id;
//     var cart = new Cart(req.session.cart ? req.session.cart : {});
//     Product.findByPk(req.params.id)
//         .then((product) => {
//             cart.add(product[0], productId);
//             return product.id == productId;
//         })      
//     req.session.cart = cart;
//     res.redirect('/');
// });
  
// router.get('/cart', function(req, res, next) {
//     if (!req.session.cart) {
//         return res.render('cart', {
//         products: null
//         });
// }

// var cart = new Cart(req.session.cart);
//     res.render('cart', {
//         title: 'NodeJS Shopping Cart',
//         products: cart.getItems(),
//         // totalPrice: cart.totalPrice
//     });
// });

// router.get('/remove/:id', function(req, res, next) {
//     var productId = req.params.id;
//     var cart = new Cart(req.session.cart ? req.session.cart : {});

//     cart.remove(productId);
//     req.session.cart = cart;
//     res.redirect('/cart');
// });

// // module.exports = router;