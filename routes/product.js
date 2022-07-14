const express = require('express');
const router = express.Router();
const moment = require('moment');
const Product = require("../models/Product");
const Brand = require("../models/Brand");
const ensureAuthenticated = require('../helpers/auth');
const Category = require('../models/Category');

router.get('/products', async (req, res) => {
	Product.findAll({
		include: [{
			model: Brand,
			required: true,
		},
		{
			model: Category,
			required: true
		}
	],
		raw: true
	})
		.then((product) => {
			console.log(product);
		res.render('product/products', {product: product})
	})
	.catch(err => console.log(err));
})

router.get('/details/:id', (req, res) => {
    Product.findByPk(req.params.id)
        .then((products) => {
            res.render('product/details', { products });
        })
})

module.exports = router;