// const express = require('express');
// const router = express.Router();
// const moment = require('moment');
// const Product = require('../models/Product');
// const Cart = require('../models/cart');
// const flashMessage = require('../helpers/messenger');

// router.post('/add/:id', async function(req, res, next) {
//     let productid = req.params.id;
//     let quantity = req.body.quantity
//     // let totalCost = req.body.totalCost
//     console.log(quantity)
//     // console.log(productid)
//     var product = await Product.findByPk(productid)
//     let cart_item = await Cart.create({
//         productId: productid,
//         quantity: quantity, 
//         product_name: product.product_name,
//         product_price: product.product_price,
//         totalCost: quantity * product.product_price,
//         discount: product.discount,
//         stock: product.stock,
//         desc: product.desc,
//         image: product.image,
        
//     })
//         .then((cart) => {
//             console.log(cart.toJSON());
//             flashMessage(res, 'success', 'Product added successfully.');
//             res.redirect('/product/products');
//         })
//         .catch(err => console.log(err))

// });

// router.get('/cart', function(req, res, next) {
//     Cart.findAll({
//         raw: true,
//         include:{
//             model: Product,
//             required:false
//         }
//     })
//         .then((carts) => {
//             res.render('cart/cart', { carts });
            
//         })
//         .catch(err => console.log(err));
// });


// router.get('/delete/:id', async function (req, res) {
//     try {
//         let cart = await Cart.findByPk(req.params.id);

//         if (!cart) {
//             // flashMessage(res, 'error', 'Blog not found');
//             res.redirect('/product/products');
//             return;
//         }

//         let result = await Cart.destroy({ where: { id: cart.id } });

//         flashMessage(res, 'danger', ' Item deleted');
//         res.redirect('/cart/cart');
//     }
//     catch (err) {
//         console.log(err);
//     }
// });

// router.post('/updateqty',async (req,res)=>{
//     let quantity =req.body.quantity;
//     let productId = req.body.product_id
//     let product_price = req.body.price
//     console.log(product_price);
//         Cart.update(
//             { quantity, product_price},
//             { where: { productId: productId } }
//         )
//             .catch(err => console.log(err));
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const moment = require('moment');
const Product = require('../models/Product');
const Cart = require('../models/cart');
const flashMessage = require('../helpers/messenger');
const itemincart = require('../models/Item');

router.post('/add/:id', async function(req, res, next) {
    let productid = req.params.id;
    if (req.isAuthenticated()){
        //check if user is logged in
        // console.log(req.user.id)
        var cartId = await Cart.findOrCreate({where: {userId:req.user.id}, raw:true})//getting all cart with user id
        id = cartId[0]['id']
        var item = await itemincart.create({productId: productid, cartId: cartId[0]['id']})
    }
    flashMessage(res, 'success', 'Product added successfully.');
    res.redirect('/product/products')
});
  
router.get('/cart', async function(req, res, next) {//include parameter to get cartId
    var cartId = await Cart.findAll({where: {userId:req.user.id}})
    console.log(cartId);
    itemincart.findAll({
        //return all item with cartId: whatever
        raw: true,
        where:{cartId: cartId[0]['id']}//insert cartId into 1
    })
        .then((carts) => {
            console.log(carts)
            res.render('cart/cart', { carts });
            
        })
        .catch(err => console.log(err));
});

router.get('/delete/:id', async function (req, res) {
    try {
        let cart = await itemincart.findAll({
            where: {productId: req.params.id}});

        if (!cart) {
            // flashMessage(res, 'error', 'Blog not found');
            res.redirect('/product/products');
            return;
        }
        productId = pass//get productId from params
        var cartId = await Cart.findAll({where: {Userid:req.user.id}})
        let result = await itemincart.destroy({ where: { productId: req.params.id, cartId: cartId[0]['id'] } });
        console.log(result + ' cart deleted');
        res.redirect('/cart/cart');
    }
    catch (err) {
        console.log(err);
    }
});


module.exports = router;
