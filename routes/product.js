const express = require('express');
const router = express.Router();
const moment = require('moment');
const Product = require("../models/Product");
const Brand = require("../models/Brand");
const ensureAuthenticated = require('../helpers/auth');
const Category = require('../models/Category');
const Wishlist = require('../models/Wishlist');
const flashMessage = require('../helpers/messenger');

router.get('/products', async (req, res) => {
	var brands = await Brand.findAll();
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
		res.render('product/products', {product: product, brands: brands})
	})
	.catch(err => console.log(err));
})

router.get('/details/:id', async (req, res) => {
	var brands = await Brand.findAll();
    Product.findByPk(req.params.id)
        .then((products) => {
            res.render('product/details', { products, brands });
        })
})

router.post('/wishlist/:id', async (req, res) => {
	let quantity = 1;
	let productId = req.params.id;
	if (req.isAuthenticated()){
		let userId = req.user.id; //this is a placeholder for the user
		flashMessage(res,'success', 'Product has been added into wishlist')
		let wishlist = await Wishlist.create({quantity, userId, productId})
		res.redirect('back')
	}else{
		flashMessage(res,'Error', 'Please login to add to wishlist')
		res.redirect('back')
	}
})

module.exports = router;