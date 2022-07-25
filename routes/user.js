const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const ensureAuthenticated = require('../helpers/auth');
const Delivery = require('../models/Delivery');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');

function sendEmail(message) {
    key = rot13(process.env.SENDGRID_API_KEY)
    sgMail.setApiKey(key);

    // Returns the promise from SendGrid to the calling function
    return new Promise((resolve, reject) => {
        sgMail.send(message)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}

function rot13(message) {
    // cypher cus cnt upload actual key
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var b = "nopqrstuvwxyzabcdefghijklmNOPQRSTUVWXYZABCDEFGHIJKLM";
    return message.replace(/[a-z]/gi, (c) => b[a.indexOf(c)]);
}

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
            let user = await User.create({ name, email, password: hash, 'userType': 'customer' });
            // Send email
            let token = jwt.sign(email, process.env.APP_SECRET);
            let url = `${process.env.BASE_URL}:${process.env.PORT}/user/verify/${user.id}/${token}`;
            const message = {
                to: user.email,
                from: `SGMart <${process.env.SENDGRID_SENDER_EMAIL}>`,
                subject: 'Verify SGMart Account',
                html: `Thank you registering with SGMart.<br><br> Please <a href=\"${url}"><strong>verify</strong></a> your account.`
            };
            sendEmail(message)
                .then(response => {
                    console.log(response);
                    flashMessage(res, 'success', user.email + ' registered successfully');
                    res.redirect('/user/login');
                })
                .catch(err => {
                    console.log(err);
                    flashMessage(res, 'error', 'Error when sending email to ' + user.email);
                    res.redirect('/');
                });
        }
    }
    catch (err) {
        console.log(err);
    }
});
router.get('/verify/:userId/:token', async function (req, res) {
    let id = req.params.userId;
    let token = req.params.token;

    try {
        // Check if user is found
        let user = await User.findByPk(id);
        if (!user) {
            flashMessage(res, 'error', 'User not found');
            res.redirect('/user/login');
            return;
        }
        // Check if user has been verified
        if (user.verified) {
            flashMessage(res, 'info', 'User already verified');
            res.redirect('/user/login');
            return;
        }
        // Verify JWT token sent via URL 
        let authData = jwt.verify(token, process.env.APP_SECRET);
        if (authData != user.email) {
            flashMessage(res, 'error', 'Unauthorised Access');
            res.redirect('/user/login');
            return;
        }

        let result = await User.update(
            { verified: 1 },
            { where: { id: user.id } });
        console.log(result[0] + ' user updated');
        flashMessage(res, 'success', user.email + ' verified. Please login');
        res.redirect('/user/login');
    }
    catch (err) {
        console.log(err);
    }
});
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        // Success redirect URL
        successRedirect: '/',
        // Failure redirect URL 
        failureRedirect: '/user/login',
        /* Setting the failureFlash option to true instructs Passport to flash 
        an error message using the message given by the strategy's verify callback.
        When a failure occur passport passes the message object as error */
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    console.log(req.params)
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
    let name = req.body.name;
    let email = req.body.email;
    let phoneNumber = req.body.phoneNumber ? req.body.phoneNumber : null;
    let address = req.body.address ? req.body.address : null;
    let address2 = req.body.address2 ? req.body.address2 : null;
    let postalCode = req.body.postalCode ? req.body.postalCode : null;
    User.update(
        {   'name' : name,
            'email' : email,
            'phoneNumber' : phoneNumber,
            'address' : address,
            'address2' : address2,
            'postalCode' : postalCode}, 
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
        let result = await User.update(
            {status: 1},
            { where: { id: user.id } });
        console.log(result + ' user deleted');
        flashMessage(res, 'success', 'Account Deleted');
        res.redirect('/');
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/resetpassword', (req, res) => {
    res.render('user/resetpwd');
})

router.post('/resetpassword', async (req, res) => {
    email = req.body.email;
    user = await User.findOne({where: {email: email}});
    if (!user) {
        flashMessage(res, 'error', 'No email found');
        res.redirect('/user/resetpassword')
    } else {
        let token = jwt.sign(email, process.env.APP_SECRET);
        let url = `${process.env.BASE_URL}:${process.env.PORT}/user/resetpassword/${user.id}/${token}`;
        const message = {
            to: email,
            from: `SGMart <${process.env.SENDGRID_SENDER_EMAIL}>`,
            subject: 'Reset SGMart Account Password',
            html: `<br><br> Please <a href=\"${url}"><strong>click here</strong></a> to reset your password.`
        };
        sendEmail(message)
            .then(response => {
                console.log(response);
                flashMessage(res, 'success','Reset email sent successfully to ' +  email);
                res.redirect('/user/resetpassword');
            })
            .catch(err => {
                console.log(err);
                flashMessage(res, 'error', 'Error when sending email to ' + email);
                res.redirect('/');
            });
    }
    
})

router.get('/resetpassword/:id/:token', (req, res) => {
    
    res.render('user/newpwd')
})

router.post('/resetpassword/:id/:token', async (req, res) => {
    let {password, password2} = req.body;
    valid = true
    if (password != password2) {
        flashMessage(res, 'error', 'Passwords do not match');
        valid = false;
    } 
    if  (password.length < 6) {
        flashMessage(res, 'error', 'Password must be at least 6 characters');
        valid = false;
    } 
    if (!valid) {
        res.render('user/newpwd');
        return;
    } else {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);
        await User.update(
            {password: hash},
            {where: {id: req.params.id}})
            .then((result) => {
                flashMessage(res, 'success', 'Password has been changed');
                res.redirect('/user/login');
            })
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