const { raw } = require('express');
const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Product = require('../models/Product');

router.get('/', (req, res) => {
	const title = 'Admin';
	// renders views/index.handlebars, passing title as an object

	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'dashboard'
		}
	}
	res.render('admin/index', metadata)
});


router.get('/addproduct',async (req, res) => {
	var brand = await Brand.findAll({raw: true})
	var category = await Category.findAll({raw: true})
	res.render('admin/addproducts', { brands: brand , category: category , layout: 'admin', nav: { sidebarActive: 'addproduct' } })
});

router.post('/addproduct',async function (req, res) {	
	let { product_name, product_price, discount, stock, desc, image, brandId, categoryId } = req.body;
	try{
		let product = await Product.create({product_name, product_price, discount, stock, desc, image, brandId, categoryId});
		flashMessage(res, 'success', 'Product created successfully.');
		res.redirect('/')
	}
	catch(err){
		console.log(err)
	}

})

router.get('/updateproduct/:id', async (req, res) => {
	var brand = await Brand.findAll({raw: true})
	var category = await Category.findAll({raw: true})
	var product = await Product.findByPk(req.params.id)
	var brand_name = await Brand.findByPk(product.brandId)
	var category_name = await Category.findByPk(product.categoryId)
	res.render('admin/addproducts', { brands: brand, category, product, brand_name ,category_name, layout: 'admin', nav: { sidebarActive:	'addproduct'}})
})

router.post('/updateproduct/:id', async function(req, res) {
	let { product_name, product_price, discount, stock, desc, image, brandId, categoryId } = req.body;
	try{
		Product.update(
			{
				product_name, product_price, discount, stock, desc, image, brandId, categoryId 
			},
			{
				where: { id: req.params.id}
			})
			flashMessage(res, 'success', 'Product updated successfully.')
			res.redirect('/')
	}
	catch(err){
		console.log(err);
	}
})

router.get('/deleteproduct/:id', async function(req, res){
	try{
		let product = await Product.findByPk(req.params.id)
		let result = await Product.destroy({where: { id: product.id}})
		console.log(result +' product deleted')
		res.redirect('/')
	}catch(err){
		console.log(err)
	}
})
module.exports = router;
