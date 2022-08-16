const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Delivery = require('../models/Delivery')
const moment = require('moment');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');

const Cart = require('../models/cart');
const Order = require('../models/order');
const Item = require('../models/item');
const Invoice = require('../models/Invoice');
const ensureAuthenticated = require('../helpers/auth');
const User = require('../models/User');
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
require('../app.js')

router.get('/', async (req, res) => {
    let item = await Item.findAll({
        raw: true,
    })
    let cart = await Cart.findAll({
        raw: true
    })
    let product = await Product.findAll({
        raw: true
    })

    
    Cart.findAll({
        raw: true,
    })
        .then((carts) => {
            res.render('delivery/delivery', { carts, item });

        })

        .catch(err => console.log(err));

    
});

// Stripe

router.get('/cancel', (req,res) => {
	res.render('delivery/cancel')
})


router.post('/',ensureAuthenticated, async function (req, res) {
    var products = await Item.findAll()
    console.log('start checkout')
	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			mode: 'payment',
			line_items:products.map(item => {
				return {
					price_data: {
						currency: 'sgd',
						product_data: {
							name: item.product_name
						},
						unit_amount: item.product_price*100
					},
					quantity: item.quantity
				}
			}),
			success_url: `${process.env.SERVER_URL}/delivery/success/`,
			cancel_url: `${process.env.SERVER_URL}/delivery/cancel/`
		})
        global.location = session.url
        res.redirect(session.url)
		console.log('redirect to stripe')
	}catch (e) {
		console.error('error')
		res.status(500).json({ error:e.message })
	}

    let name = req.body.name;
    let email = req.body.email;
    let address = req.body.address;
    let phone = req.body.phone;
    let delivery_date = req.body.fromDate;
    let delivery_time = req.body.time;
    let delivery_address = req.body.address;
    let delivery_city = req.body.city;
    let delivery_state = req.body.state;
    let delivery_zip = req.body.zip;
    let userId = req.user.id
    var id = await Cart.findAll({where: {userId: req.user.id}})
    // console.log(req.body)
    Order.create({name, email, address, phone, delivery_date, delivery_time, userId})
    .then((order)=> {
        orderId = order.id
        Invoice.update(
            {orderId: orderId,
                cartId: null},
                {where: {cartId: id[0]['id']}}
                );
                
                Delivery.create({delivery_date, delivery_time,delivery_address, delivery_city, delivery_state, delivery_zip, userId, orderId})  
            Item.destroy({where: {cartId: id[0]['id']}});
            // console.log(orderId)
            flashMessage(res,'success', 'Successfully Purchased Items')
            res.render('delivery/delivery_completed');
        })
        .catch(err => console.log(err))
});

router.get("/success", async (req,res) => {
    var products = await Product.findAll({
        limit:4,
        raw: true,
    })
    // console.log(req.body)
                
        // console.log(orderId)
    flashMessage(res,'success', 'Successfully Purchased Items')
    res.render('delivery/success', { products});

});

module.exports = router