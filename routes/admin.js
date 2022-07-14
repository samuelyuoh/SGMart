const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Coupon = require('../models/Coupon');
const moment = require('moment');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { condition } = require('sequelize');


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

router.get('/admincouponcreate', (req, res) => {
	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'coupon'
		}
	}

	res.render('admin/admincouponcreate', metadata)
	});

router.get('/addproduct',async (req, res) => {
	var brand = await Brand.findAll({raw: true})
	var category = await Category.findAll({raw: true})
	var path = req.path
	res.render('admin/addproducts', { brands: brand , category: category , layout: 'admin', nav: { sidebarActive: 'addproduct' },path })
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
	var brand_name = await Brand.findByPk(product.brandId);
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

router.post('/admincouponcreate', (req, res) => {
	let { couponName, percentageDiscount, expiryDate } = req.body;

	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'coupon'
		}
	}

	Coupon.create({ couponName, percentageDiscount, expiryDate });
	flashMessage(res, 'success', couponName + ' has been created successfully');

	res.render('admin/admincouponcreate', metadata)
	});

router.get('/admincouponedit/:id',async (req, res)=> {
	let coupon = await Coupon.findOne({where: {id:req.params.id}})
	console.log(coupon)
	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'dashboard'
		}
	}

	res.render('admin/admincouponedit', {coupon, layout: 'admin', nav: {sidebarActive: 'dashboards'}})
	});

router.post('/admincouponedit/:id', (req, res) => {
	let couponName = req.body.couponName;
	let percentageDiscount = req.body.percentageDiscount;
	let expiryDate = moment(req.body.expiryDate, ' YYYY-MM-DD HH:MI:SS');
	
	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'dashboard'
		}
	}
    Coupon.update(
        { couponName, percentageDiscount, expiryDate },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' coupon updated');
            res.redirect('/admin/admincouponlist');
        })
        // .catch(err => console.log(err));
	});


router.get('/admincouponlist', (req, res) => {
	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'dashboard'
		}
	}
	Coupon.findAll({
		order: [['expiryDate', 'DESC']],
		raw: true
	})
		.then((coupons) => {
			// pass object to admincouponlist.handlebars
			metadata.coupons = coupons
			res.render('admin/admincouponlist', metadata);
		})
		.catch(err => console.log(err));


		// res.render('admin/admincouponlist', metadata)
	// res.render('admin/admincouponlist', metadata)
});



router.get('/admincoupondelete/:id', async function (req, res) {
	try {
		let coupon = await Coupon.findByPk(req.params.id);
		if (!coupon) {
			flashMessage(res, 'error', 'Coupon not found');
			res.redirect('/admin/admincouponlist');
			return;
		}

		let result = await Coupon.destroy({ where: { couponName: coupon.couponName } });
		flashMessage(res, 'success',result + ' coupon deleted');
		res.redirect('/admin/admincouponlist');
	}
	catch (err) {
	console.log(err);
	}
});

module.exports = router;
