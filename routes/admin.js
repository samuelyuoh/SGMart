const { raw } = require('express');
const express = require('express');
const sequelize = require('sequelize');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Brand = require('../models/Brand');
const Category = require('../models/Category');

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

module.exports = router;
