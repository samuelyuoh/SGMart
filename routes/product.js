const express = require('express');
const router = express.Router();
const moment = require('moment');
const Product = require("../models/Product");
const Brand = require("../models/Brand");
const ensureAuthenticated = require('../helpers/auth');
const Category = require('../models/Category');

router.get('/inventory', (req, res) => {
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
            console.log(products)
            res.render('product/inventory', { products });
    })
        .catch (err => console.log(err));
})


module.exports = router;