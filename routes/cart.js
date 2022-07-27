const express = require('express');
const router = express.Router();
const moment = require('moment');
const Product = require('../models/Product');
const Cart = require('../models/cart');
const flashMessage = require('../helpers/messenger');

router.post('/add/:id', async function(req, res, next) {
    let productid = req.params.id;
    let quantity = req.body.quantity
    // let totalCost = req.body.totalCost
    console.log(quantity)
    // console.log(productid)
    var product = await Product.findByPk(productid)
    let cart_item = await Cart.create({
        productId: productid,
        quantity: quantity, 
        product_name: product.product_name,
        product_price: product.product_price,
        totalCost: quantity * product.product_price,
        discount: product.discount,
        stock: product.stock,
        desc: product.desc,
        image: product.image,
        
    })
        .then((cart) => {
            console.log(cart.toJSON());
            flashMessage(res, 'success', 'Product added successfully.');
            res.redirect('/product/products');
        })
        .catch(err => console.log(err))

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

router.post('/updateqty',(req,res)=>{
    let quantity =req.body.quantity;
    console.log(quantity)
    let productId = req.body.id
    Cart.update(
        { quantity },
        { where: { productId: productId } }
    )
        .catch(err => console.log(err));
});

module.exports = router;

