const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const ensureAuthenticated = require('../helpers/auth');
const Delivery = require('../models/Delivery')

router.get('/login', (req, res) => {
    res.render('user/login');
});

router.get('/register', (req, res) => {
    res.render('user/register');
});

router.post('/register', async function (req, res) {
    let { name, email, password, password2 } = req.body;

    let isValid = true;
    if (password.length < 6) {
        flashMessage(res, 'error', 'Password must be at least 6 characters');
        isValid = false;
    }
    if (password != password2) {
        flashMessage(res, 'error', 'Passwords do not match');
        isValid = false;
    }
    if (!isValid) {
        res.render('user/register', {
            name, email
        });
        return;
    }

    try {
        // If all is well, checks if user is already registered
        let user = await User.findOne({ where: { email: email } });
        if (user) {
            // If user is found, that means email has already been registered
            flashMessage(res, 'error', email + ' already registered');
            res.render('user/register', {
                name, email
            });
        }
        else {
            // Create new user record 
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
            // Use hashed password
            let user = await User.create({ name, email, password: hash });
            flashMessage(res, 'success', email + ' registered successfully');
            res.redirect('/user/login');
        }
    }
    catch (err) {
        console.log(err);
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        // Success redirect URL
        send: {status:"logged in"},
        successRedirect: ('/'),
        // Failure redirect URL 
        failureRedirect: '/user/login',
        /* Setting the failureFlash option to true instructs Passport to flash 
        an error message using the message given by the strategy's verify callback.
        When a failure occur passport passes the message object as error */
        failureFlash: true,
    })(req, res, next);
});

router.post('/checkStatus', (req, res) => {
    if(req.isAuthenticated()){
        res.send({status: "logged in"})
    }else{
        res.send({status: "not logged in"})
    }
})

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get('/profile/:id', ensureAuthenticated, (req, res) => {
    User.findByPk(req.params.id)
        .then((user) => {
            if (!user) {
                flashMessage(res, 'error', 'User not found');
                res.redirect('/user/login');
                return;
            }
            if (req.user.id != req.params.id) {
                flashMessage(res, 'error', 'Unauthorised access');
                res.redirect('/');
                return;
            }
            res.render('user/profile', { user });
            
        })
        .catch(err => console.log(err));
});

router.post('/editprofile/:id', ensureAuthenticated, (req, res) => {
    let name = req.body.name ? req.body.name : null;
    let email = req.body.email ? req.body.email : null;
    let phoneNumber = req.body.phoneNumber ? req.body.phoneNumber : null;
    let address = req.body.address ? req.body.address : null;
    let address2 = req.body.address2 ? req.body.address2 : null;
    let postalCode = req.body.postalCode ? req.body.postalCode : null;
    let password = req.body.password ? req.body.password : null;
    let amountSpent = req.body.amountSpent ? req.body.amountSpent : null;
    User.update(
        { name, email, password, phoneNumber, address, address2, postalCode, amountSpent }, 
        { where: { id: req.params.id } }
    )
        .catch(err => console.log(err));
    User.findByPk(req.params.id)
        .then ((user) => {
            flashMessage(res, 'success', 'Information updated');
            res.redirect(`/user/profile/${user.id}`);
        })
        .catch(err => console.log(err));
});

router.get('/editprofile/:id', ensureAuthenticated, (req, res) => {
    User.findByPk(req.params.id)
        .then((user) => {
            if (!user) {
                flashMessage(res, 'error', 'User not found');
                res.redirect('/user/login');
                return;
            }
            if (req.user.id != req.params.id) {
                flashMessage(res, 'error', 'Unauthorised access');
                res.redirect('/');
                return;
            }
            res.render('user/editprofile', { user });
            
        })
        .catch(err => console.log(err));
});

router.get('/deleteAccount/:id', ensureAuthenticated, async function (req, res) {
    try {
        let user = await User.findByPk(req.params.id);
        if (!user) {
            flashMessage(res, 'error', 'Account not found');
            res.redirect('/user/login');
            return;
        }
        if (req.user.id != user.id) {
            flashMessage(res, 'error', 'Unauthorised access');
            res.redirect('/user/login');
            return;
        }
        req.logout();
        let result = await User.destroy({ where: { id: user.id } });
        console.log(result + ' user deleted');
        res.redirect('/');
    }
    catch (err) {
        console.log(err);
    }
});

// router.get('/check_delivery', (req, res) => {
//     res.render('user/check_delivery');
// });

router.get('/check_delivery', (req, res) => {
    const metadata = {
        // layout: 'user',
        // nav: {
        //     sidebarActive: 'dashboard'
        // }
    }
    Delivery.findAll({
        order: [['id']],
        raw: true
    })
        .then((delivery) => {
            // pass object to admincouponlist.handlebars
            metadata.delivery = delivery
            res.render('user/check_delivery', metadata);
        })
        .catch(err => console.log(err));
});

router.get('/deleteDelivery/:id', ensureAuthenticated, async function(req, res) {
    try {
        console.log("hi")
        let delivery = await Delivery.findByPk(req.params.id);
        // if (!video) {
        //     flashMessage(res, 'error', 'Delivery Time Slot not found');
        //     res.redirect('/about');
        //     return;
        // }
        // if (req.user.id != video.userId) {
        //     flashMessage(res, 'error', 'Unauthorised access');
        //     res.redirect('/about');
        //     return;
        // }
        let result = await Delivery.destroy({ where: { id: delivery.id } });
        console.log(result + ' Delivery Time Slot deleted');
        flashMessage(res, 'success', "Successfully deleted Delivery Time Slot")
        res.redirect('/user/check_delivery');
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/editDelivery/:id', ensureAuthenticated, async function(req, res) {
    try {
        console.log("fak u")
        let delivery = await Delivery.findByPk(req.params.id);
        // if (!video) {
        //     flashMessage(res, 'error', 'Delivery Time Slot not found');
        //     res.redirect('/about');
        //     return;
        // }
        // if (req.user.id != video.userId) {
        //     flashMessage(res, 'error', 'Unauthorised access');
        //     res.redirect('/about');
        //     return;
        // }
        // let result = await Delivery.destroy({ where: { id: delivery.id } });
        // console.log(result + ' Delivery Time Slot editted');
        // flashMessage(res, 'success', "Successfully editted Delivery Time Slot")
        res.render('user/edit_delivery');
    }
    catch (err) {
        console.log(err);
    }
});

router.post('/editDelivery/:id', ensureAuthenticated, (req, res) => {
    let delivery_time = req.body.time;
    let delivery_date = req.body.fromDate;
    Delivery.update(
        { delivery_time, delivery_date }, 
        { where: { id: req.params.id } }
    )
        .catch(err => console.log(err));
    Delivery.findByPk(req.params.id)
        .then ((delivery) => {
            flashMessage(res, 'success', 'Information updated');
            res.redirect(`/user/check_delivery`);
        })
        .catch(err => console.log(err));
});

module.exports = router;