const { response } = require('express');
const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const ensureAuthenticated = require('../helpers/auth');
const CouponRedemption = require('../models/CouponRedemption');
const { DATEONLY } = require('sequelize');
const UserCouponInfo = require('../models/UserCouponInfo');

router.get('/', (req, res) => {
	const title = 'Video Jotter';
	// renders views/index.handlebars, passing title as an object
	res.render('index', { title: title })
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

router.get('/usercoupongenerate/:id', ensureAuthenticated, (req, res) => {

	
	Points = req.user.Points;
	
	Coupon.findAll({
		order: [['couponName', 'DESC']],
		raw: true
	})
		.then((coupons) => {
			res.render('coupon/usercoupongenerate', {coupons, Points});
		})
		.catch(err => console.log(err));
});


router.post('/usercoupongenerate/:id', ensureAuthenticated, async (req, res) => {
	// let DateofRedemption = req.body.DateofRedemption ? req.body.DateofRedemption : null;
	user = await User.findByPk(req.params.id);
	let {cid} = req.body;
	coupon = await Coupon.findByPk(cid);

	amt = user.Points;
	amt -= coupon.pointstoattain;


	User.update(
        {Points : amt}, 
        { where: { id: req.params.id } }
    )
        .catch(err => console.log(err));
	quant = coupon.couponQuantity;
	quant -= 1;	
	
	redeemingcount = coupon.redeemedquantity;
	redeemingcount += 1;

	Coupon.update(
		{couponQuantity : quant, redeemedquantity: redeemingcount}, 
		{ where: { id: cid } }
	)
		.catch(err => console.log(err));
	
	var datetime = new Date();
	x = datetime.toISOString().slice(0,10)
	todays_date = x; 
	
	CouponRedemption.create(
		{DateofRedemption : todays_date, couponId: cid}, 
		{ where: { id: cid } }
	)
	
	UserCouponInfo.create(
		{ couponName : coupon.couponName, percentageDiscount: coupon.percentageDiscount, expiryDate: coupon.expiryDate, userId: user.id, couponId: cid }, 
		{ where: { id: cid } }
	)

    User.findByPk(req.params.id)
        .then ((user) => {
            flashMessage(res, 'success', 'Coupon has been claimed');
            res.redirect(`/`);
        })
        .catch(err => console.log(err));


});



module.exports = router;
