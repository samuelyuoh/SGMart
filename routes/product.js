const express = require('express');
const router = express.Router();
const moment = require('moment');
const Product = require("../models/Product");
const Brand = require("../models/Brand");
const ensureAuthenticated = require('../helpers/auth');
const Category = require('../models/Category');
const Wishlist = require('../models/Wishlist');
const flashMessage = require('../helpers/messenger');
const User = require('../models/User');
const paginate = require('express-paginate');
const sequelize = require('sequelize')
const op = sequelize.Op

router.get('/products', async (req, res) => {
	var brands = await Brand.findAll({raw:true});
	var category = await Category.findAll({raw:true});
	const pageAsNumber = Number.parseInt(req.query.page)
	var search = req.query.search
	if(search == undefined){
		search =""
	}
	let page = 0
	if(!Number.isNaN(pageAsNumber) && pageAsNumber >= 0) {
		page = pageAsNumber;
	}
	if (req.isAuthenticated()){
		var wishlist = await Wishlist.findAll({
			where: {userId: req.user.id},
			raw: true
			})
		
		var product = await Product.findAndCountAll({
			limit:2,
			offset: page*2,
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
			res.render('product/products', {
				product: product.rows,
				totalPages: Math.ceil(product.count/2),
				currentPage: page,
				brands: brands, 
				wishlist: wishlist,
				category: category, 
			});
		}else{
			Product.findAndCountAll({
				limit:2,
				offset: page*2,
				include: [{
					model: Brand,
					required: true,
				},
				{
					model: Category,
					required: true
				},
			],
			where: {
				product_name: {
					[op.like]: '%'+	search +'%'
				},
			},
			raw: true
		})
		.then((product) => {
			
			res.render('product/products', 
			{
				product: product.rows,
				totalPages: Math.ceil(product.count/2),
				currentPage: page,
				brands: brands,
				category: category, 
			});
		})
		.catch(err => console.log(err));
	}
})

router.post('/wishlist', async (req, res) => {
	let quantity = 1;
	let productId = req.body.id;
	if (req.isAuthenticated()){
		var check = await Wishlist.findAll(
			{where: { userId: req.user.id, productId: productId}, raw:true  },
		)
		if (check.length != 0){
			let wishlist = await Wishlist.destroy({where: { userId: req.user.id, productId: productId}  })
			res.send({status: "remove"})
			// flashMessage(res, 'success', 'Product has been removed from wishlist')
		}else if (check.length == 0){
			let userId = req.user.id; //this is a placeholder for the user
			let wishlist = await Wishlist.create({quantity, userId, productId})
			res.send({status: "add"})
		}
	}else{
		res.send({status: "error"})
	}
})

router.post('/removewishlist', async (req, res) => {
	let productId = req.body.id;
	let wishlist = await Wishlist.destroy({where: { userId: req.user.id, productId: productId}  })
	res.send({status: "deleted"})
})

router.get('/nextpage', async (req, res) => {
	var brands = await Brand.findAll({raw:true});
	var category = await Category.findAll({raw:true});
	var categoryAsName = await Category.findAll({raw:true, attributes: ['category_name']});
	var brandAsName = await Brand.findAll({raw:true, attributes: ['brand_name']});
	let categoryAsFilter = req.query.category
	let brandAsFilter = req.query.brand
	var search = req.query.search
	if(categoryAsFilter == ""){
		categoryAsFilter = ""
	}else if(categoryAsFilter == undefined || categoryAsFilter == "null"){
		categoryAsFilter = []
		for(var a in categoryAsName){
			categoryAsFilter.push(categoryAsName[a]['category_name'])
		}
	}else{
		categoryAsFilter = categoryAsFilter.split('|')
		categoryAsFilter.pop(-1)
	}
	if(brandAsFilter == ""){
		brandAsFilter = ""
	}
	else if(brandAsFilter == undefined || brandAsFilter == "null"){
		brandAsFilter = []
		for(var a in brandAsName){
			brandAsFilter.push(brandAsName[a]['brand_name'])
		}
	}else{
		brandAsFilter = brandAsFilter.split('|')
		brandAsFilter.pop(-1)
	}
	categoryAsFilter = await Category.findAll({where: {category_name: categoryAsFilter}, attributes: [['id', 'categoryId']], raw:true})
	brandAsFilter = await Brand.findAll({where: {brand_name: brandAsFilter}, attributes: [['id', 'brandId']], raw:true})
	var tmp = categoryAsFilter.concat(brandAsFilter)
	console.log(tmp)
	if(search == undefined){
		search = ""
	}
	var brands = await Brand.findAll({raw:true});
	const pageAsNumber = Number.parseInt(req.query.page)
	let page = 0
	if(!Number.isNaN(pageAsNumber) && pageAsNumber >= 0) {
		page = pageAsNumber;
	}
	if (req.isAuthenticated()){
		var wishlist = await Wishlist.findAll({
			where: {userId: req.user.id},
			raw: true
			})
		
		var product = await Product.findAndCountAll({
			limit:2,
			offset: page*2,
			include: [{
				model: Brand,
				required: true,
			},
			{
				model: Category,
				required: true
			}
			],
			where: {
				product_name: {
					[op.like]: '%'+	search +'%'
				},
			},
				raw: true
			})
			res.send({
				product: product.rows,
				totalPages: Math.ceil(product.count/2),
				currentPage: page,
				brands: brands,
				category: category, 
				wishlist: wishlist,
			});
		}else{
			Product.findAndCountAll({
			limit:2,
			offset: page*2,
			include: [{
				model: Brand,
				required: true,
			},
			{
				model: Category,
				required: true
			}
		],
		where: {
			product_name: {
				[op.like]: '%'+	search +'%'
			},
			[op.or]: tmp,
		},
			raw: true
		})
			.then((product) => {
			res.send( 
			{
				product: product.rows,
				totalPages: Math.ceil(product.count/2),
				currentPage: page,
				category: category,
				brands: brands
			});
		})
	}
})

module.exports = router;