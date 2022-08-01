const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Delivery = require('../models/Delivery')
const moment = require('moment');
const Product = require('../models/Product');
const Cart = require('../models/cart');
const Order = require('../models/order');
const Item = require('../models/item');


router.get('/', (req, res) => {
	const title = 'Delivery';
    Item.findByPk(req.params.id)
        .then((items) => {
            res.render('delivery/delivery', { items });
        })
})


router.post('/', async function (req, res) {
    let name = req.body.name;
    let email = req.body.email;
    let address = req.body.address;
    let phone = req.body.phone;
    let delivery_date = req.body.fromDate;
    let delivery_time = req.body.time;
    let cartId = req.body.cartId
    Delivery.create({delivery_date, delivery_time})
        .then((delivery)=> {
        })
        .catch(err => console.log(err))
    Order.create({name, email, address, phone, delivery_date, delivery_time})
        .then((order)=> {
            flashMessage(res,'success', 'Successfully Purchased Items')
        })
        .catch(err => console.log(err))

});


module.exports = router