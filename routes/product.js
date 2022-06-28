const express = require('express');
const router = express.Router();
const moment = require('moment');
const Product = require("../models/Product");
const Brand = require("../models/Brand");
const ensureAuthenticated = require('../helpers/auth');

router.get('/inventory', (req, res) => {
    Product.findAll({
<<<<<<< Updated upstream
        where: {product_id: 'product_id'},
        order: [['price', 'DESC']],
        raw: true
=======
        include : [{
            model: Brand,
            required: false,
        }],
        raw:true
>>>>>>> Stashed changes
    })
        .then((products) => {
            // pass object to inventory.handlebar
            res.render('product/inventory', { products });
    })
        .catch (err => console.log(err));
})


module.exports = router;