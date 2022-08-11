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
const otpGenerator = require('otp-generator');
const Swal = require('sweetalert2');
const Order = require('../models/order');
const Product = require('../models/Product');
const Cart = require('../models/cart');
const Invoice = require('../models/Invoice');
const Item = require('../models/item');
const sequelize = require('sequelize');
const { DATEONLY } = require('sequelize');
const nodemailer = require('nodemailer')


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
router.post('/login', async (req, res, next) => {
    let {email, password} = req.body;
    user = await User.findOne({where :{email: email}});
    valid = user.tfa ? user.tfa : false;
    
    if (valid) {
        otp = otpGenerator.generate(8, { upperCaseAlphabets: false, specialChars: false });
        let token = jwt.sign({otp}, process.env.APP_SECRET, {expiresIn: 5 * 60});
        a = `/user/${user.id}/2fa/verifyotp/${token}`;
        id = user.id;
        user = await User.findByPk(id);
        
        console.log(jwt.decode(token))
        const message = {
            to: user.email,
            from: `SGMart <${process.env.SENDGRID_SENDER_EMAIL}>`,
            subject: 'SGMart Login OTP',
            html: `<br><br> Please use this OTP for logging in.<br><strong>Please Note: This OTP will only last 5 minutes.</strong>
                    <br><br>OTP: <strong>${otp}</strong>`
        };
        sendEmail(message)
            .then(response => {
                console.log(response);
                flashMessage(res, 'success','OTP successfully sent to ' +  user.email);
                // res.redirect(`/user/${id}/2fa/verifyotp/${token}`);
            })
            .catch(err => {
                console.log(err);
                flashMessage(res, 'error', 'Error sending OTP to ' + user.email);
                res.redirect('/');
            });
        passport.authenticate('local', {
            // Success redirect URL
            successRedirect: a,
            // Failure redirect URL 
            failureRedirect: '/user/login',
            /* Setting the failureFlash option to true instructs Passport to flash 
            an error message using the message given by the strategy's verify callback.
            When a failure occur passport passes the message object as error */
            failureFlash: true
        })(req, res, next);
    }

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
        res.redirect('/user/resetpassword');
    } else {
        let token = jwt.sign({email}, process.env.APP_SECRET, {expiresIn: 5 * 60});
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
    try {
        token = req.params.token;
        a = jwt.decode(token);
        if (Date.now() >= a['exp'] * 1000) {
            flashMessage(res, 'error', 'Reset password has expired');//expired token
            res.redirect('/user/resetpassword');
        } else {
            res.render('user/newpwd');
        }
    }
    catch (err){
        console.log(err);
    }
    
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
router.get('/:id/2fa', async (req, res) => {
    id = req.params.id;
    await User.update(
        {tfa: 1},
        {where: {id: id}}
    )
    .then((user) => {
        flashMessage(res, 'success', '2FA Enabled');
        res.redirect(`/user/profile/${id}`)
    })
    .catch(err => console.log(err));
});

router.get('/:id/2fa/verifyotp/:token', (req, res) => {
    res.render('user/otp');
});
router.post('/:id/2fa/verifyotp/:token', async (req, res) => {
    let {otp} = req.body;
    token = jwt.decode(req.params.token);
    console.log(token);
    user = User.findByPk(req.params.id);
    email = user.email;
    if (token['otp'] == otp) {
        res.redirect('/');

    } else {
        res.redirect('/user/logout');
    }

})

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


router.get('/orders/:id', ensureAuthenticated, async  (req, res) => {
    let totalAmount = 0
    User.findByPk(req.params.id)
        .then((user) => {
            if (!user) {
                flashMessage(res, 'error', 'User not found');
                // res.redirect('/user/login');
                return;
            }
            if (req.user.id != req.params.id) {
                flashMessage(res, 'error', 'Unauthorised access');
                // res.redirect('/');
                return;
            }
        })

    var orders = await Order.findAndCountAll({
        raw: true,
        where:{userId: req.user.id},
    })
    var cart = await Cart.findAll({
        raw: true,
        where:{userId: req.user.id},
    })
    var items = await Item.findAndCountAll({
        where: {cartId: cart[0]['id']}
    })
            // var invoice = Invoice.findAll({where: {orderId: orders[0]['id']}})
    res.render('user/orders', {orders:orders.rows, order_count:orders.count, cart: items.count})
    
});

router.get('/orderDetail/:id', ensureAuthenticated, async(req, res) => {
    let totalAmount = 0
    var orders = await Order.findByPk(req.params.id)
    var cost_of_each_item = await Invoice.findAll({
        where: {orderId: orders['id']},
        attributes: [
            'totalCost',
        ],
        raw: true
    })
    var items = await Invoice.findAll({where: {orderId: orders['id']},raw:true})

    for(var a in cost_of_each_item){
        totalAmount += parseFloat(cost_of_each_item[a]['totalCost'])
    }
    res.render('user/orderdetail', {orders: orders, item: items, totalAmount: totalAmount})
})


router.get('/contact', (req, res) => {
    res.render('user/contact');
});

router.post('/contact', (req, res) => {
    const output = `
      <p>You have a new contact request</p>
      <h3>Contact Details</h3>
      <ul>  
        <li>Name: ${req.body.name}</li>
        <li>Email: ${req.body.email}</li>
        <li>Phone: ${req.body.phone}</li>
        <li>Subject: ${req.body.subject}</li>
      </ul>
      <h3>Message</h3>
      <p>${req.body.message}</p>
    `;
      // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sgmart2107@gmail.com',
      pass: 'cwaavbrqplassgid'
    },
    tls:{
        rejectUnauthorized:false
    }
  });

  var mailOptions = {
    from: 'sgmart2107@gmail.com',
    to: 'sgmartreceiver@gmail.com',
    subject: 'Node Contact Request',
    text: 'Hello World',
    html: output
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
    res.render('user/contact', {msg: 'Email has been sent'})
  });

});
module.exports = router;