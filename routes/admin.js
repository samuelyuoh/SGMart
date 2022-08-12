const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Coupon = require('../models/Coupon');
const moment = require('moment');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { Op } = require('sequelize');
const ensureAuthenticated = require('../helpers/auth');
const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');

const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const User = require('../models/User');

function rot13(message) {
    // cypher cus cnt upload actual key
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var b = "nopqrstuvwxyzabcdefghijklmNOPQRSTUVWXYZABCDEFGHIJKLM";
    return message.replace(/[a-z]/gi, (c) => b[a.indexOf(c)]);
}

function sendEmail(message) {
    key = rot13(process.env.SENDGRID_API_KEY)
    sgMail.setApiKey(key);

    // Returns the promise from SendGrid to the calling function
    return new Promise((resolve, reject) => {
        sgMail.send(message)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}

const isStaff = function(userType) {
	return (userType == 'staff' || userType == 'admin' || userType == 'madmin')
};
const isAdmin = function(userType) {
	return (userType == 'admin' || userType == 'madmin')
};
const isMAdmin = function(userType) {
	return (userType == 'madmin')
};

router.get('/', ensureAuthenticated, async (req, res) => {
	if (!isStaff(req.user.userType)) {
		res.redirect('/');
	} else {
		const metadata = {
			layout: 'admin',
			nav: {
				sidebarActive: 'dashboard'
			},
			user: req.user
		}
		const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
		// a = new Date().add(-30).days();
		b = moment().subtract(30, 'days');
		curdate = moment.now()
		users = await User.findAll();
		a = []
		for (var i = 0;i < users.length;i++) {
			if ((curdate - moment(users[i].createdAt))< 2592000000 ) { //num of seconds in 30 days
				a.push(users[i])
			}
		}
		metadata.l30 = a.length;
		res.render('admin/index', metadata)

	}
	
});

router.get('/createStaffAcc', ensureAuthenticated, (req, res) => {
	if (!isAdmin(req.user.userType) && isStaff(req.user.userType)) {
		res.redirect('/admin');
	} else if (!isStaff(req.user.userType)){
		res.redirect('/')
	} else {
		const metadata = {
			layout: 'admin',
			nav: {
				sidebarActive: 'cstaff'
			},
			user: req.user
		}

		res.render('admin/createStaff', metadata)
	}
	
});

router.post('/createStaffAcc', ensureAuthenticated, async (req, res) => {
	email = req.body.email;
	user = await User.findOne({where: {email: email}});
	if (!user) {
		let token = jwt.sign(email, process.env.APP_SECRET);
		let url = `${process.env.BASE_URL}:${process.env.PORT}/admin/staffRegister/${email}/${token}`;
		console.log(token)
		const message = {
			to: email,
			from: `SGMart <${process.env.SENDGRID_SENDER_EMAIL}>`,
			subject: 'Register SGMart Staff Account',
			html: `Welcome to the SGMart Staff Team.<br><br> Please <a href=\"${url}"><strong>register</strong></a> your account.`
		};
		sendEmail(message)
			.then(response => {
				console.log(response);
				flashMessage(res, 'success','registered link sent to '+email+' successfully');
				res.redirect('/admin');
			})
			.catch(err => {
				console.log(err);
				flashMessage(res, 'error', 'Error when sending email to ' + email);
			});
	} else {
		User.update(
			{userType: 'staff'},
			{where: {email: email}}
		).then((result) => {
			flashMessage(res, 'success', 'Account updated to staff account');
			res.redirect('/admin')
		})
	}
	
});

router.get('/staffRegister/:email/:token', async function (req, res) {
	// if email is already used, account will be updated to a staff account (maybe make them login first)
	// if email is new make them sign up
    let token = req.params.token;
	let email = req.params.email;
    try {
        user = await User.findOne({where: {email: req.params.email}})
		if (user) {
			if (user.userType == 'admin' || user.userType == 'staff') {
				flashMessage(res, 'error', 'Account is already updated to staff account');
			} else {
				let result = await User.update(
					{ userType: 'staff' },
					{ where: { id: user.id } });
				flashMessage(res, 'success', 'Account updated to staff account');
				
			}
			res.redirect('/admin');
		} else {
			const metadata = {
				staffEmail: email,
			}
			res.render('user/staffRegister', metadata);
		}

    }
    catch (err) {
        console.log(err);
    }
});

router.get('/userList', async (req, res) => {
	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'users'
		},
		user: req.user,
	}

	User.findAll({
		where: {
			userType: {
			  [Op.eq]: 'customer'
			}
		  },
		order: Sequelize.col('id'),
		raw: true
	})
		.then((users) => {
			metadata.users = users;
			res.render('admin/userList', metadata);
			
		})
		.catch(err => console.log(err));

})

router.get('/staffList', async (req, res) => {
	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'cstaff'
		},
		user: req.user,
	}

	User.findAll({
		where: {
			userType: {
			  [Op.or]: ['admin', 'staff']
			}
		  },
		raw: true
	})
		.then((users) => {
			metadata.users = users;
			res.render('admin/userList', metadata);
			
		})
		.catch(err => console.log(err));

})

router.get('/status/:change/:id', async (req, res) => {
	// if banned status will change to 1 and must reactivate acc

	change = req.params.change;
	user = await User.findByPk(req.params.id);
	if (!user) {
		flashMessage(res, 'error', 'No user found');
		
	} else {
		if (change == 'ban') {
			if (user.status == 2) {
				flashMessage(res, 'error', 'User already banned');
			} else {
				await User.update(
					{status: 2},
					{where: {id: req.params.id}}
				)
				.then((result) => {
					console.log('user banned');
					flashMessage(res, 'success', `User ${req.params.id} has been banned`);
				})
			}
			
		} 
		else if (change == 'unban') {
			if (user.status == 0) {
				flashMessage(res, 'error', 'User is not banned');
			} else {
				await User.update(
					{status: 0},
					{where: {id: req.params.id}}
				)
				.then((result) => {
					console.log('user unbanned');
					flashMessage(res, 'success', `User ${req.params.id} has been unbanned`);
				})
			}
		}

	}
	res.redirect('/admin');
})

router.get('/admincouponcreate', (req, res) => {
	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'coupon'
		}
	}

	res.render('admin/admincouponcreate', metadata)
	});

router.get('/inventory', async (req, res) => {
	const pageAsNumber = Number.parseInt(req.query.page)
	let page = 0
	if(!Number.isNaN(pageAsNumber) && pageAsNumber >= 0) {
		page = pageAsNumber;
	}
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
		raw: true
	})
		.then((product) => {
			res.render('admin/inventory', {
				product: product.rows,
				totalPages: Math.ceil(product.count/2),
				currentPage: page,
				layout: 'admin', 
				nav: { sidebarActive: 'product' }
			})
	})
	.catch(err => console.log(err));
})
router.get('/getPage', async (req, res) => {
	const pageAsNumber = Number.parseInt(req.query.page)
	let page = 0
	if(!Number.isNaN(pageAsNumber) && pageAsNumber >= 0) {
		page = pageAsNumber;
	}
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
		raw: true
	})
		.then((product) => {
			res.send({
				product: product.rows,
				totalPages: Math.ceil(product.count/2),
				currentPage: page,
				layout: 'admin', 
				nav: { sidebarActive: 'product' }
			})
	})
	.catch(err => console.log(err));
})


router.get('/addproduct',async (req, res) => {
	var brand = await Brand.findAll({raw: true})
	var category = await Category.findAll({raw: true})
	var path = req.path
	res.render('admin/addproducts', { brands: brand , category: category , layout: 'admin', nav: { sidebarActive: 'addproduct' },path })
});
router.post('/addproduct',async function (req, res) {	
	let { product_name, product_price, discount, stock, desc, image, brandId, categoryId, cost } = req.body;
	try{
		let product = await Product.create({product_name, product_price, discount, stock, desc, image, brandId, categoryId, cost});
		flashMessage(res, 'success', 'Product created successfully.');
		res.redirect('/admin/inventory')
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

router.post('/updatestock/:id', async (req, res) =>{
	let product = await Product.findByPk(req.params.id).then((products)=>
	current_stock = products.stock)
	Product.update(
			{stock: parseInt(req.body.stock) + parseInt(current_stock)},
			{where: {id: req.params.id}}
	)
	.catch(err => console.log(err));
	flashMessage(res, 'success', 'Stock added successfully.')
	res.redirect('/admin/inventory')
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
