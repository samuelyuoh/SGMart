const express = require('express');
const router = express.Router();
const moment = require('moment');
const Product = require('../models/Product');
const Cart = require('../models/cart');
const flashMessage = require('../helpers/messenger');

router.post('/add/:id', async function(req, res, next) {
    let productid = req.params.id;
    console.log(productid)
    var product = await Product.findByPk(productid)
    console.log(product.product_name)
    let cart_item = await Cart.create({productId: productid})
    flashMessage(res, 'success', 'Product added successfully.');
    res.redirect('/product/products')
});
  
router.get('/cart', function(req, res, next) {
    Cart.findAll({
        raw: true,
        include:{
            model: Product,
            required:false
        }
    })
        .then((carts) => {
            console.log(carts)
            res.render('cart/cart', { carts });
            
        })
        .catch(err => console.log(err));
});

router.get('/delete/:id', async function (req, res) {
    try {
        let cart = await Cart.findByPk(req.params.id);

        if (!cart) {
            // flashMessage(res, 'error', 'Blog not found');
            res.redirect('/product/products');
            return;
        }

        let result = await Cart.destroy({ where: { id: cart.id } });
        console.log(result + ' cart deleted');
        res.redirect('/cart/cart');
    }
    catch (err) {
        console.log(err);
    }
});


module.exports = router;