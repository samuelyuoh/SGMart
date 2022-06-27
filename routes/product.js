const express = require('express');
const router = express.Router();
const moment = require('moment');
const Product = require("../models/Product");
const ensureAuthenticated = require('../helpers/auth');


router.get('/inventory', (req, res) => {
    Product.findAll({
        where: {product_id: 'product_id'},
        order: [['price', 'DESC']],
        raw: true
    })
        .then((products) => {
            // pass object to listVideos.handlebar
            res.render('product/inventory', { products });
        })
        .catch (err => console.log(err));
})

module.exports = router;