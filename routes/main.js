const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const User = require('../models/User');
const Brand = require('../models/Brand');

router.get('/', async (req, res) => {
	var brands = await Brand.findAll()
	// renders views/index.handlebars, passing title as an object
	res.render('index', { brands })
});

router.post('/flash', (req, res) => {
	const message = 'This is an important message';
	const error = 'This is an error message';
	const error2 = 'This is the second error message';
	// req.flash('message', message);
	// req.flash('error', error);
	// req.flash('error', error2);
	flashMessage(res, 'success', message);
	flashMessage(res, 'info', message);
	flashMessage(res, 'error', error);
	flashMessage(res, 'error', error2, 'fas fa-sign-in-alt', true);
	res.redirect('/about');
});
router.get('/about', (req, res) => {
	const author = 'Your Name';
	res.render('about', { author });
	});

router.get('/usercoupongenerate', (req, res) => {
	User.findAll({
		order: [['amountSpent', 'DESC']],
		raw: true
	})
		.then((users) => {
			// pass object to admincouponlist.handlebars
			res.render('coupon/usercoupongenerate');
		})
		.catch(err => console.log(err));


	res.render('coupon/usercoupongenerate')
});

// router.post('/admincouponedit/:id', (req, res) => {
// 	let couponName = req.body.couponName;
// 	let percentageDiscount = req.body.percentageDiscount;
// 	let expiryDate = moment(req.body.expiryDate, ' YYYY-MM-DD HH:MI:SS');
	
// 	const metadata = {
// 		layout: 'admin',
// 		nav: {
// 			sidebarActive: 'dashboard'
// 		}
// 	}
//     Coupon.update(
//         { couponName, percentageDiscount, expiryDate },
//         { where: { id: req.params.id } }
//     )
//         .then((result) => {
//             console.log(result[0] + ' coupon updated');
//             res.redirect('/admin/admincouponlist');
//         })
//         // .catch(err => console.log(err));
// 	});

module.exports = router;
