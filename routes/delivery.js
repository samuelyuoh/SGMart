const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Delivery = require('../models/Delivery')
const moment = require('moment');
const Product = require('../models/Product');
const Cart = require('../models/cart');
const Order = require('../models/order');
const Item = require('../models/item');
const Invoice = require('../models/Invoice');

router.get('/', async (req, res) => {
    let item = await Item.findAll({
        raw: true,
    })
    Cart.findAll({
        raw: true,
    })
        .then((carts) => {
            res.render('delivery/delivery', { carts, item });

        })

        .catch(err => console.log(err));
    console.log(item)
})


router.post('/', async function (req, res) {
    let name = req.body.name;
    let email = req.body.email;
    let address = req.body.address;
    let phone = req.body.phone;
    let delivery_date = req.body.fromDate;
    let delivery_time = req.body.time;
    let userId = req.user.id
    var id = await Cart.findAll({where: {userId: req.user.id}})
    // console.log(req.body)
    Delivery.create({delivery_date, delivery_time})
    Order.create({name, email, address, phone, delivery_date, delivery_time, userId})
        .then((order)=> {
            orderId = order.id
            Invoice.update(
                {orderId: orderId,
                cartId: null},
                {where: {cartId: id[0]['id']}}
            );
            Item.destroy({where: {cartId: id[0]['id']}});
            // console.log(orderId)
            flashMessage(res,'success', 'Successfully Purchased Items')
            res.render('delivery/delivery_completed');
        })
        .catch(err => console.log(err))


});


module.exports = router