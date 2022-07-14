const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Coupon = require('../models/Coupon');

router.get('/admincouponcreate', (req, res) => {
	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'dashboard'
		}
	}

	res.render('admin/admincouponcreate', metadata)
	});


router.post('/admincouponcreate', (req, res) => {
	let { couponName, percentageDiscount, expiryDate } = req.body;

	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'dashboard'
		}
	}


	Coupon.create({ couponName, percentageDiscount, expiryDate });
	flashMessage(res, 'success', couponName + 'has been created successfully');

	res.render('admin/admincouponcreate', metadata)
	});

router.get('/admincouponedit', (req, res) => {
    const metadata = {
        layout: 'admin',
        nav: {
            sidebarActive: 'dashboard'
        }
    }

    res.render('admin/admincouponedit', metadata)
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
});

module.exports = router;
