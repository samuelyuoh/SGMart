const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const ensureAuthenticated = require('../helpers/auth');

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
            flashMessage(res, 'error', email + ' alreay registered');
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
            // if (req.user.id != req.params.id) {
            //     flashMessage(res, 'error', 'Unauthorised access');
            //     res.redirect('/');
            //     return;
            // }
            res.render('user/profile', { user });
            
        })
        .catch(err => console.log(err));
});

router.post('/profile/:id', ensureAuthenticated, (req, res) => {
    let name = req.body.name ? req.body.name : null;
    let email = req.body.email ? req.body.email : null;
    let phoneNumber = req.body.phoneNumber ? req.body.phoneNumber : null;
    let address = req.body.address ? req.body.address : null;
    let address2 = req.body.address2 ? req.body.address2 : null;
    let postalCode = req.body.postalCode ? req.body.postalCode : null;
    let password = req.body.password ? req.body.password : null;
    // FHHA9XFM.isd/Uqx1tTMOkrcQC68H5ce2o2W8mYa
    User.update(
        { name, email, password, phoneNumber, address, address2, postalCode }, 
        { where: { id: req.params.id } }
    )
        .then((result) => {
            flashMessage(res, 'success', 'Profile updated');
            res.redirect('/');
        })
        .catch(err => console.log(err));
});

module.exports = router;