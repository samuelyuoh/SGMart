const express = require('express');
const router = express.Router();
const moment = require('moment');
const Product = require('../models/Product');
const Cart = require('../models/cart');
const Item = require('../models/item');
const flashMessage = require('../helpers/messenger');
const Invoice = require('../models/Invoice');
const ensureAuthenticated = require('../helpers/auth');

router.post('/add/:id', ensureAuthenticated ,async function(req, res, next) {
    let productid = req.params.id;
    let quantity = req.body.quantity
    // let totalCost = req.body.totalCost
    // console.log(quantity)
    // console.log(productid)
    // console.log(productid)
    var product = await Product.findByPk(productid)
    if(req.isAuthenticated()){
        await Cart.findOrCreate({where: {userId: req.user.id}})
        var id = await Cart.findAll({where: {userId: req.user.id}})
        var check = await Item.findAll({where: {cartId: id[0]['id'], productId: productid}})
        // console.log(check[0])
        if (check[0] == undefined){
            Invoice.create({
                productId: productid,
                quantity: quantity, 
                product_name: product.product_name,
                product_price: product.product_price,
                totalCost: quantity * product.product_price,
                discount: product.discount,
                stock: product.stock,
                desc: product.desc,
                image: product.image,
                cartId: id[0]['id']
            })
            await Item.findOrCreate({where:{
                productId: productid,
                quantity: quantity, 
                product_name: product.product_name,
                product_price: product.product_price,
                totalCost: quantity * product.product_price,
                discount: product.discount,
                stock: product.stock,
                desc: product.desc,
                image: product.image,
                cartId: id[0]['id']
            }
            })
            .catch(err => console.log(err))
            flashMessage(res, 'success', 'Product added successfully.');
        }
        else{
            // console.log('hi')
            await Item.increment({quantity:1}, {where: {cartId: id[0]['id']}})
            .catch(err => console.log(err))
            flashMessage(res, 'success', 'Product added successfully.');
        }
        
            res.redirect('/product/products');
    }
    // let cart_item = await Cart.create({
    //     productId: productid,
    //     quantity: quantity, 
    //     product_name: product.product_name,
    //     product_price: product.product_price,
    //     totalCost: quantity * product.product_price,
    //     discount: product.discount,
    //     stock: product.stock,
    //     desc: product.desc,
    //     image: product.image,
        
    // })

});

router.get('/cart', ensureAuthenticated, async function(req, res, next) {
    var id = await Cart.findOrCreate({where: {userId: req.user.id}})
    if (req.user.id == undefined){
        flashMessage(res, 'error', 'Please Login First');
    }
        Item.findAll({
            raw: true,
            include:{
                model: Product,
                required:false
            },
            where: { cartId: id[0]['id']}
        })
            .then((carts) => {
                res.render('cart/cart', { carts });
            })
            .catch(err => console.log(err));
});


router.get('/delete/:id', async function (req, res) {
    try {
        let cart = await Cart.findAll({where: {userId: req.user.id}});

        if (!cart) {
            // flashMessage(res, 'error', 'Blog not found');
            res.redirect('/product/products');
            return;
        }

        let result = await Item.destroy({ where: { productId: req.params.id, cartId: cart[0]['id'] } });
        Invoice.destroy({where: { cartId: cart[0]['id'] , productId: req.params.id}})
        console.log(result + ' cart deleted');
        res.redirect('/cart/cart');
    }
    catch (err) {
        console.log(err);
    }
});

router.post('/updateqty',async (req,res)=>{
    let new_quantity =req.body.quantity;
    // console.log(new_quantity)
    let productId = req.body.product_id
    // console.log(productId)
    let new_totalCost = req.body.price

    let cart = await Cart.findAll({where: {userId: req.user.id}});
    // console.log(new_totalCost);
        Item.update(
            { quantity: new_quantity, totalCost: new_totalCost},
            { where: { productId: productId, cartId: cart[0]['id'] } }
        )
            .catch(err => console.log(err));

        Invoice.update(
            {
                quantity: new_quantity,totalCost: new_totalCost},
                {where: { productId: productId, cartId: cart[0]['id'] }}
        )
            .catch(err => console.log(err))
});


module.exports = router;