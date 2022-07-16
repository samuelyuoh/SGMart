const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Delivery = require('../models/Delivery')

// router.get('/', (req, res) => {
// 	const title = 'Delivery';
// 	// renders views/index.handlebars, passing title as an object

// 	const metadata = {
// 		layout: 'admin',
// 		nav: {
// 			sidebarActive: 'dashboard'
// 		}
// 	}
// 	res.render('delivery/delivery', metadata)
// });

// module.exports = router;

router.get('/', (req, res) => {
	const title = 'Delivery';
	// renders views/index.handlebars, passing title as an object
	res.render('delivery/delivery', { title: title })
});


router.post('/', async function (req, res) {
    // let { delivery_date, delivery_time } = req.body;
    let delivery_date = req.body.fromDate;
    let delivery_time = req.body.time;
    Delivery.create({delivery_date, delivery_time})
        .then((delivery)=> {
            console.log(delivery.toJSON());
            flashMessage(res,'success', 'Successfully Purchased Items')
            res.redirect('/');
        })
        .catch(err => console.log(err))
    // let isValid = true;
    // if (password.length < 6) {
    //     flashMessage(res, 'error', 'Password must be at least 6 characters');
    //     isValid = false;
    // }
    // if (password != password2) {
    //     flashMessage(res, 'error', 'Passwords do not match');
    //     isValid = false;
    // }
    // if (!isValid) {
    //     res.render('user/register', {
    //         name, email
    //     });
    //     return;
    // }
    
    // try {
    //     // If all is well, checks if user is already registered
    //     let user = await User.findOne({ where: { email: email } });
    //     if (user) {
    //         // If user is found, that means email has already been registered
    //         flashMessage(res, 'error', email + ' alreay registered');
    //         res.render('user/register', {
    //             name, email
    //         });
    //     }
    //     else {
    //         // Create new user record 
    //         var salt = bcrypt.genSaltSync(10);
    //         var hash = bcrypt.hashSync(password, salt);
    //         // Use hashed password
    //         let user = await User.create({ name, email, password: hash });
    //         flashMessage(res, 'success', email + ' registered successfully');
            // res.render('delivery/delivery_completed');
    //     }
    // }
    // catch (err) {
    //     console.log(err);
    // }
});

module.exports = router