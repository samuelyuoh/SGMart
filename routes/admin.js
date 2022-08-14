const { raw } = require('express');
const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const moment = require('moment');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');

const { Op } = require('sequelize');
const ensureAuthenticated = require('../helpers/auth');
const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const User = require('../models/User');
const createlogs = require('../helpers/logs');
const {convertJsonToExcel, getUsers, getStaff} = require('../helpers/excel');
const fs = require('fs');
const upload = require('../helpers/productUpload');

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
		list: 'user',
	}

	await User.findAll({
		where: {
			userType: {
			  [Op.or]: ['customer','admin', 'staff', 'madmin']
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
		list: 'staff',
	}

	await User.findAll({
		where: {
			userType: {
			  [Op.or]: ['admin', 'staff', 'madmin']
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
					createlogs(`Banned user ${req.params.id}`, req.user.id)
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
					createlogs(`Unbanned user ${req.params.id}`, req.user.id)
				})
			}
		}

	}
	res.redirect('/admin/userlist');
})



router.get('/generateexcel/:list', async (req, res) => {
	list = req.params.list;
	if (list == 'users') {
		var data = await getUsers();
		var sheetName = 'users';
		var fileName = 'users.xlsx';
	} else if (list == 'staff') {
		// sth sth
		var data = await getStaff();
		var sheetName = 'staff';
		var fileName = 'staff.xlsx';
	} else {
		flashMessage(res, 'error', 'Invalid Parameter');
		res.redirect('/admin');
	}
	if (list == 'users' || list == 'staff') {
		res.removeHeader('Content-Type')
		res.removeHeader("Content-Disposition")
		convertJsonToExcel(data, sheetName , fileName);
		file = __dirname + '/../public/excel/' + fileName;
		res.setHeader("Content-Disposition", `attachment;filename=${fileName}`);
		res.setHeader('Content-Type', 'application/xlsx');
		

		setTimeout(() => {
			res.download(file)
		}, 500)
		setTimeout(() => {
			try {
				fs.unlinkSync(file)
				//file removed
				} catch(err) {
				console.error(err)
				}
		}, 3000)
	}
});

router.get('/dashboardinfo', async (req, res) => {
	curdate = moment.now()
	users = await User.findAll();
	a = []
	b = []
	for (var i = 0;i < users.length;i++) {
		if ((curdate - moment(users[i].createdAt))< 2592000000 ) { //num of seconds in 30 days
			a.push(users[i])
			b.push(users[i])
			
		} else if ((curdate - moment(users[i].createdAt))< 2592000000*2) {
			b.push(users[i])
		}
	}
	c = []
	d = []
	orders = await Order.findAll()
	for (var i = 0;i < orders.length;i++) {
		if ((curdate - moment(orders[i].createdAt))< 2592000000 ) { //num of seconds in 30 days
			a.push(orders[i])
			b.push(orders[i])
			
		} else if ((curdate - moment(orders[i].createdAt))< 2592000000*2) {
			b.push(orders[i])
		}
	}
	const ResponseObject = {
		users: {
			all: users.length,
			l30: a.length,
			l60: b.length,
		},
		orders: {
			all: orders.length,
			l30: c.length,
			l60: d.length,
		},
		graph: {
			a: 0,
			b: 30,
			c: 60,
			d: 40,
			e: 70,
			f: 65,
			g: 40,
			h: 80,
			i: 60,
			w: 80,
			q: 100,
		}
	}
	return res.json(ResponseObject)
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

router.get('/inventory', async (req, res) => {
	const pageAsNumber = Number.parseInt(req.query.page)
	let page = 0
	if(!Number.isNaN(pageAsNumber) && pageAsNumber >= 0) {
		page = pageAsNumber;
	}
	Product.findAndCountAll({
		limit:8,
		offset: page*8,
		include: [{
			model: Brand,
		},
		{
			model: Category,
		}
	],
		raw: true
	})
		.then((product) => {
			res.render('admin/inventory', {
				product: product.rows,
				totalPages: Math.ceil(product.count/8),
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

router.post('/upload', ensureAuthenticated, (req, res) => {
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/images/')) {
        fs.mkdirSync('./public/images/', { recursive: true });
    }
    upload(req, res, (err) => {
		console.log(req.file)
        // console.log(req.file)
        if (err) {
            // e.g. File too large
            res.json({ err: err });
        }
        else if (req.file == undefined) {
            res.json({});
        }
        else {
            res.json({ file: `/images/${req.file.originalname}` });
        }
    });
});
router.post('uploadsubmit', (req,res)=>{
	let image = req.body
	if (!fs.existsSync('./public/images/')){
		fs.mkdirSync('./public/images/', {recursive: true})
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
	product = await Product.findByPk(req.params.id)
	if(image == ''){
		image = product.image
	}
	try{
		Product.update(
			{
				product_name, product_price, discount, stock, desc, image, brandId, categoryId 
			},
			{
				where: { id: req.params.id}
			})
			flashMessage(res, 'success', 'Product updated successfully.')
			res.redirect('/admin/inventory')
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
	let { couponName, percentageDiscount, expiryDate, couponQuantity, userid, pointstoattain, redeemedquantity } = req.body;

	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'coupon'
		}
	}
	redeemedquantity = 0;
	Coupon.create({ couponName, percentageDiscount, expiryDate, couponQuantity, userid, pointstoattain, redeemedquantity });
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
	let couponQuantity = req.body.couponQuantity;
	let pointstoattain = req.body.pointstoattain
	
	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'dashboard'
		}
	}
    Coupon.update(
        { couponName, percentageDiscount, expiryDate, couponQuantity, pointstoattain },
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
		order: [['couponName', 'DESC']],
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



router.post('/admincoupondelete/:id', async function (req, res) {
	try {
		let coupon = await Coupon.findByPk(req.params.id);
		if (!coupon) {
			flashMessage(res, 'error', 'Coupon not found');
			res.redirect('/admin/admincouponlist');
			return;
		}

		let result = await Coupon.destroy({ where: { couponName: coupon.couponName } }); //change to delete from id
		flashMessage(res, 'success',result + ' coupon deleted');
		res.redirect('/admin/admincouponlist');
	}
	catch (err) {
	console.log(err);
	}
});

router.get('/listorders', async(req, res) => {
	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'coupon'
		}
	}

	let totalAmount = 0
    var orders = await Order.findAll({
		order: [['id', 'desc']],
		raw: true
	})
    var cost_of_each_item = await Invoice.findAll({
        attributes: [
            'totalCost',
        ],
        raw: true
    })
    var items = await Invoice.findAll({raw:true})

    for(var a in cost_of_each_item){
        totalAmount += parseFloat(cost_of_each_item[a]['totalCost'])
    }
    res.render('admin/listorders', {orders: orders, item: items, totalAmount: totalAmount, layout: 'admin'})
})


router.get('/couponstats', async (req, res) => {
	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'coupon'
		}
	}

	var date = new Date();
	today = date.toISOString().slice(0,10) //Today's date

	date.setDate(date.getDate() - 1); 
	yesterday = date.toISOString().slice(0,10) //Yesterday's date

	date.setDate(date.getDate() - 1);
	twodaysback = date.toISOString().slice(0,10) // 2 days back date

	date.setDate(date.getDate() - 1);
	threedaysback = date.toISOString().slice(0,10) // 3 days back date

	date.setDate(date.getDate() - 1);
	fourdaysback = date.toISOString().slice(0,10) // 4 days back date

	const { count: todaycount } = await CouponRedemption.findAndCountAll({
		
		where: { DateofRedemption: today },
		groupBy: {
			DateofRedemption: today
		},
		
	});

	const { count: yesterdaycount } = await CouponRedemption.findAndCountAll({
		
		where: { DateofRedemption: yesterday },
		groupBy: {
			DateofRedemption: yesterday
		},
		
	});

	const { count: twodaysbackcount } = await CouponRedemption.findAndCountAll({
		
		where: { DateofRedemption: twodaysback },
		groupBy: {
			DateofRedemption: twodaysback
		},
		
	});

	const { count: threedaysbackcount } = await CouponRedemption.findAndCountAll({
		
		where: { DateofRedemption: threedaysback },
		groupBy: {
			DateofRedemption: threedaysback
		},
		
	});

	const { count: fourdaysbackcount } = await CouponRedemption.findAndCountAll({
		
		where: { DateofRedemption: fourdaysback },
		groupBy: {
			DateofRedemption: fourdaysback
		},
		
	});

	const { count: total } = await CouponRedemption.findAndCountAll({

	});
	
	console.log(total)

	metadata.todaycount = todaycount
	metadata.yesterdaycount = yesterdaycount
	metadata.twodaysbackcount = twodaysbackcount
	metadata.threedaysbackcount = threedaysbackcount
	metadata.fourdaysbackcount = fourdaysbackcount
	metadata.total = total
	res.render('admin/couponstats', metadata)
	
});


router.get('/couponstats', (req, res) => {
	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'coupon'
		}
	}
	
	res.render('admin/couponstats', metadata)
	});
module.exports = router;
