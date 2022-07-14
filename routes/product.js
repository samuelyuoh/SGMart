const express = require('express');
const router = express.Router();
const moment = require('moment');
const Product = require("../models/Product");
const Brand = require("../models/Brand");
const ensureAuthenticated = require('../helpers/auth');
const Category = require('../models/Category');

router.get('/products', (req, res) => {
    Product.findAll({

        include : [{
            model: Brand,
            required: true,
        },
        {
            model: Category,
            required: true,
        }
    ],
        raw:true
    })
        .then((products) => {
            // pass object to inventory.handlebar
            res.render('product/products', { products });
    })
        .catch (err => console.log(err));
})

router.get('/details/:id', (req, res) => {
    Product.findByPk(req.params.id)
        .then((products) => {
            res.render('product/details', { products });
        })
})

module.exports = router;