const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Delivery = require('../models/Delivery')
const moment = require('moment');
const Product = require('../models/Product');
const Cart = require('../models/cart');
const Order = require('../models/order');
const ensureAuthenticated = require('../helpers/auth');
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
require('../app.js')

router.get('/', ensureAuthenticated,(req, res) => {
	const title = 'Delivery';
    Cart.findAll({
        raw: true,
        include:{
            model: Product,
            required:false
        }
    })
        .then((carts) => {
            res.render('delivery/delivery', { carts });
            
        })
        .catch(err => console.log(err));
});



// Stripe

const items = [
	{id:1, quantity:3},
    {id:2, quantity:1}
];

const storeItems = new Map([
	[1, {priceInCents: 10000, name: "10 Dolla"}],
	[2, {priceInCents: 20000, name: "20 Dolla"}],
])

router.post("/create-checkout-session", async (req, res) => {
    console.log('start checkout')
	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			mode: 'payment',
			line_items:items.map(item => {
				const storeItem = storeItems.get(item.id)
				return {
					price_data: {
						currency: 'sgd',
						product_data: {
							name: storeItem.name
						},
						unit_amount: storeItem.priceInCents
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
})

router.get("/success", (req,res) => {
	res.render('delivery/success')
})

router.get('/cancel', (req,res) => {
	res.render('delivery/cancel')
})

router.post('/',ensureAuthenticated, async function (req, res) {
    // let { delivery_date, delivery_time } = req.body;
    let delivery_date = req.body.fromDate;
    let delivery_time = req.body.time;
    let delivery_address = req.body.address;
    let delivery_city = req.body.city;
    let delivery_state = req.body.state;
    let delivery_zip = req.body.zip;
    let userId = req.user.id
    Delivery.create({delivery_date, delivery_time,delivery_address, delivery_city, delivery_state, delivery_zip, userId})
        .then((delivery)=> {
            console.log(delivery.toJSON());
        })
        .catch(err => console.log(err))
    Order.create({name, email, address, phone, delivery_date, delivery_time})
        .then((order)=> {
            console.log(order.toJSON());
            flashMessage(res,'success', 'Successfully Purchased Items')
            res.redirect('/');
        })
        .catch(err => console.log(err))
});


module.exports = router