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
const Wishlist = require('../models/Wishlist')
const otpGenerator = require('otp-generator');
const Swal = require('sweetalert2');
const Product = require('../models/Product');
// Required for file upload
const fs = require('fs');
const upload = require('../helpers/imageUpload');
const googlelogin = require('../helpers/googlelogin');
const speakeasy = require('speakeasy');
const isStaff = function(userType) {
	return (userType == 'staff' || userType == 'admin' || userType == 'madmin')
};
googlelogin()
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
            let user = await User.create({ name, email, password: hash, 'userType': 'customer', 'status': 0, 'tfa': 0, 'gtfa': 0  });
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
                    flashMessage(res, 'success', user.email + ' registered successfully. Please check your email to verify your email.');
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
        let token = jwt.sign({payload: {otp, id: user.id}}, process.env.APP_SECRET, {expiresIn: 5 * 60});
        a = `/user/${user.id}/2fa/verifyotp/${token}`;
        id = user.id;
        await User.update({otptoken: token}, 
            {where: {id: id}})
            .then((user) => {
                console.log('otp saved')
            })
            .catch (err => console.log(err));
        
        console.log(jwt.decode(token));
        const message = {
            to: user.email,
            from: `SGMart <${process.env.SENDGRID_SENDER_EMAIL}>`,
            subject: 'SGMart Login OTP',
            html: `<br><br> Please use this OTP for logging in.<br><strong>Please Note: This OTP will only last 5 minutes.</strong>
                    <br><br>OTP: <strong>${otp}</strong>`
        };
        sendEmail(message)
            .then(response => {
                flashMessage(res, 'success','OTP successfully sent to ' +  user.email);
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
    } else {
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
    }

});

router.get('/logout', (req, res) => {
    req.logout();
    flashMessage(res, 'success', 'Logged Out.')
    res.redirect('/');
});

router.get('/logout1', (req, res) => {
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

router.post('/checkStatus', (req, res) => {
    if(req.isAuthenticated()){
        res.send({status: "logged in"})
    }else{
        res.send({status: "not logged in"})
    }
})

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

router.get('/resetpassword/:id/:token', async (req, res) => {
    try {
        token = req.params.token;
        user = await User.findByPk(req.params.id)
        .catch(err => console.log(err));
        a = jwt.decode(token);
        console.log(a);
        if (a != null) {
            if (user) {
                if (a['email'] == user.email) {
                    if (Date.now() >= a['exp'] * 1000) {
                        flashMessage(res, 'error', 'Reset password has expired');//expired token
                        res.redirect('/user/resetpassword');
                    } else {
                        res.render('user/newpwd');
                    }
                } else {
                    flashMessage(res, 'error', 'Error. Access denied')
                    res.redirect('/');
                }
            } else {
                flashMessage(res, 'error', 'Error. Access denied')
                res.redirect('/');
            }
        } else {
            flashMessage(res, 'error', 'Error. Access denied')
            res.redirect('/')
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
router.get('/:id/2fa/:action', async (req, res) => {
    id = req.params.id;
    a = req.params.action == 'enable' ? 1 : 0;
    user = await User.findByPk(id);
    if (isStaff(user.userType)) {
        //need to allow staff to be able to change 2fa type
        flashMessage(res, 'error', '2FA of staffs cannot be disabled')
        res.redirect(`/user/profile/${id}`)
    } else {
        await User.update(
            {tfa: a},
            {where: {id: id}}
        )
        .then((user) => {
            if (!a) {
                flashMessage(res, 'success', '2FA Disabled');
            } else {
                flashMessage(res, 'success', '2FA Enabled');
            }
            res.redirect(`/user/profile/${id}`)
        })
        .catch(err => console.log(err));
    } 
});

router.post('/:id/2fa/:action', async (req, res) => {
    let {pwd} = req.body;
    id = req.params.id;
    user = await User.findByPk(id);
    a = req.params.action == 'enable' ? 1 : 0;

    if (user.password == null) {
        await User.update(
            {tfa: a},
            {where: {id: id}}
        )
        .then((user) => {
            if (!a) {
                flashMessage(res, 'success', '2FA Disabled');
            } else {
                flashMessage(res, 'success', '2FA Enabled');
            }
            res.redirect(`/user/profile/${id}`)
        })
        .catch(err => console.log(err));
    } else {
        const validPassword = await bcrypt.compare(pwd, user.password);
        if (validPassword) {
            await User.update(
                {tfa: a},
                {where: {id: id}}
            )
            .then((user) => {
                if (!a) {
                    flashMessage(res, 'success', '2FA Disabled');
                } else {
                    flashMessage(res, 'success', '2FA Enabled');
                }
                res.redirect(`/user/profile/${id}`)
            })
            .catch(err => console.log(err));
        } else {
            flashMessage(res, 'error', 'Wrong Password. Please try again.');
            res.redirect(`/user/profile/${id}`)
        }
    }
});

router.get('/:id/2fa/verifyotp/:token', async (req, res) => {
    // must store token in db to verify
    token = jwt.decode(req.params.token);
    console.log(token)
    user = await User.findByPk(req.params.id)
    // console.log(token['payload'])
    if (user.otptoken != req.params.token) {
        flashMessage(res, 'error', 'Error. Access denied');
        res.redirect('/user/logout1');
    } else {
        if (token == null) {
            flashMessage(res, 'error', 'Error. Access denied');
            // res.redirect('/user/logout');
        } else {
            user = await User.findByPk(token['payload']['id'])
            if (token['payload']['id'] == req.params.id && user.otptoken == req.params.token) {
                res.render('user/otp');
            } else {
                flashMessage(res, 'error', 'Error. Access denied');
                res.redirect('/user/logout1');
            }
        }
    }
    

});
router.post('/:id/2fa/verifyotp/:token', async (req, res) => {
    let {otp} = req.body;
    user = User.findByPk(req.params.id);
    if (user.otptoken != req.params.token) {
        flashMessage(res, 'error', 'Error. Access denied');
        res.redirect('/user/logout1');
    } else {
        token = jwt.decode(req.params.token);
        // console.log(token);
        email = user.email;
        if (token == null || token.length == 0) {
            flashMessage(res, 'error', 'Error. Access denied');
            // res.redirect('/user/logout');
        } else {
            if (token['payload']['otp'] == otp) {
                flashMessage(res, 'success', 'Successfully logged in');
                User.update(
                    {otptoken: null,},
                    {where: {id : req.params.id}})
                .catch(err => console.log(err));
                res.redirect('/');

            } else {
                flashMessage(res, 'error', 'Wrong OTP, please log in again');
                res.redirect('/user/logout1');
            }
        }
    }

})

router.post('/upload', ensureAuthenticated, (req, res) => {
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/' + req.user.id)) {
        fs.mkdirSync('./public/uploads/' + req.user.id, { recursive: true });
    }

    upload(req, res, (err) => {
        if (err) {
            // e.g. File too large
            res.json({ err: err });
        }
        else if (req.file == undefined) {
            res.json({});
        }
        else {
            res.json({ file: `/uploads/${req.user.id}/${req.file.filename}` });
        }
    });
});

router.post('/uploadsubmit', ensureAuthenticated, async (req, res) => {
    const {pfpUpload, pfpURL} = req.body;
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/' + req.user.id)) {
        fs.mkdirSync('./public/uploads/' + req.user.id, { recursive: true });
    }
    await User.update(
        {pfp:pfpURL.split('/')[3]},
        {where: {id: req.user.id}}
    ).then((result) => {
        flashMessage(res, 'success', 'Profile picture changed')
        res.redirect(`/user/profile/${req.user.id}`)
    }).catch(err => console.log(err))
});

router.get('/login/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
router.get('/login/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect success.
    // console.log(res.message)
    flashMessage(res, 'success', req.authInfo.message)
    res.redirect('/');
  });
// router.get('/check_delivery', (req, res) => {
//     res.render('user/check_delivery');
// });

router.post('/login/gotp/:id/:action', async (req, res) => {
    id = req.params.id;
    if (id != req.user.id) {
        flashMessage(res, 'error', 'Error. Access denied')
        res.redirect('/')
    } else if (req.params.action == 'enable') {
        
        user = await User.findByPk(id)
        if (user) {
            await User.update(
                {gtfa: 1},
                {secret: speakeasy.generateSecret().base32},
                {where: {id: id}}
            ).then((user) => {
                flashMessage(res, 'success', 'Google Authenticator 2FA enabled');
                res.redirect(`/user/profile/${id}`);
            }).catch(err => console.log(err));
        } else {
            flashMessage(res, 'error', 'User not found');
            res.redirect(`/`);
        }
    } else {
        user = await User.findByPk(id)
        if (user) {
            if (user.password == null) {
                await User.update(
                    {gtfa: 0},
                    {where: {id: id}}
                ).then((user) => {
                    flashMessage(res, 'success', 'Google Authenticator 2FA disabled');
                    res.redirect(`/user/profile/${id}`);
                }).catch(err => console.log(err));
            } else {
                const {pwd} = req.body;
                const validPassword = await bcrypt.compare(pwd, user.password);
                if (validPassword) {
                    await User.update(
                        {gtfa: 0},
                        {where: {id: id}}
                    ).then((user) => {
                        flashMessage(res, 'success', 'Google Authenticator 2FA disabled');
                        res.redirect(`/user/profile/${id}`);
                    }).catch(err => console.log(err));
                } else {
                    flashMessage(res, 'error', 'Wrong Password. Please try again.');
                    res.redirect(`/user/profile/${id}`)
                }
            }
        } else {
            flashMessage(res, 'error', 'User not found');
            res.redirect(`/`);
        }
    } 
})

router.get('/login/gotp/:id/:action', (req, res) => {
    id = req.params.id;
    if (id != req.user.id) {
        flashMessage(res, 'error', 'Error. Access denied')
        res.redirect('/')
    } else if (req.params.action == 'enable') {
        
        user = User.findByPk(id)
        if (user) {
            User.update(
                {gtfa: 1},
                {secret: speakeasy.generateSecret().base32},
                {where: {id: id}}
            ).then((user) => {
                flashMessage(res, 'success', 'Google Authenticator 2FA enabled');
                res.redirect(`/user/profile/${id}`);
            }).catch(err => console.log(err));
        } else {
            flashMessage(res, 'error', 'User not found');
            res.redirect(`/`);
        }
    } else {
        user = User.findByPk(id)
        if (user) {
            User.update(
                {gtfa: 0},
                {where: {id: id}}
            ).then((user) => {
                flashMessage(res, 'success', 'Google Authenticator 2FA disabled');
                res.redirect(`/user/profile/${id}`);
            }).catch(err => console.log(err));
        } else {
            flashMessage(res, 'error', 'User not found');
            res.redirect(`/`);
        }
    } 
})

router.get('/login/:id/gotp/verify', (req, res) => {
    if (req.params.id == req.user.id) {
        res.render('user/gotp');
    } else {
        flashMessage(res, 'error', 'Access denied.')
        res.redirect('/')
    }
    
})
router.post('/login/:id/gotp/verify', async (req, res) => {
    const {gotp} = req.body;
    id = req.params.id;
    try {
        user = await User.findByPk(id);
        const s = user.secret;
        const verified = speakeasy.totp.verify({secret: s,
        encoding: 'base32',
        token: gotp});

        if (verified) {
            flashMessage(res, 'success', 'You have logged in.')
            res.redirect('/')
        } else {
            flashMessage(res, 'error', 'Wrong OTP.')
            res.redirect('/user/logout1')
        }
    } catch (error) {
        console.log(error)
    }
})
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

router.get('/viewWishlist', async(req, res) => {
    var wishlist = await Wishlist.findAll(
        {where: { userId: req.user.id},
        include: {model: Product,
        required: true}, 
        raw:true
    }
    )
    res.render('user/viewWishlist', {wishlist})
})

module.exports = router;