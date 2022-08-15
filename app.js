/*
* 'require' is similar to import used in Java and Python. It brings in the libraries required to be used
* in this JS file.
* */
const express = require('express');
const { engine } = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

/*
* Creates an Express server - Express is a web application framework for creating web applications
* in Node JS.
*/
const app = express();

// Handlebars Middleware
/*
* 1. Handlebars is a front-end web templating engine that helps to create dynamic web pages using variables
* from Node JS.
*
* 2. Node JS will look at Handlebars files under the views directory
*
* 3. 'defaultLayout' specifies the main.handlebars file under views/layouts as the main template
*
* */
const helpers = require('./helpers/handlebars');
app.engine('handlebars', engine({
	helpers: helpers,
	handlebars: allowInsecurePrototypeAccess(Handlebars),
	defaultLayout: 'main' // Specify default template views/layout/main.handlebar 
}));
app.set('view engine', 'handlebars');

// Express middleware to parse HTTP body in order to read HTTP data
app.use(express.urlencoded({
	extended: true
}));
app.use(express.json());

// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, 'public')));

// Enables session to be stored using browser's Cookie ID
app.use(cookieParser());

// Library to use MySQL to store session objects
const MySQLStore = require('express-mysql-session');
var options = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PWD,
	database: process.env.DB_NAME,
	clearExpired: true,
	// The maximum age of a valid session; milliseconds:
	expiration: 3600000, // 1 hour = 60x60x1000 milliseconds
	// How frequently expired sessions will be cleared; milliseconds:
	checkExpirationInterval: 1800000 // 30 min
};
// To store session information. By default it is stored as a cookie on browser
app.use(session({
	key: 'vidjot_session',
	secret: process.env.APP_SECRET,
	store: new MySQLStore(options),
	resave: false,
	saveUninitialized: false,
}));

// Bring in database connection
const DBConnection = require('./config/DBConnection');
// Connects to MySQL database
DBConnection.setUpDB(process.env.DB_RESET == 1); // To set up database with new tables

// Messaging libraries
const flash = require('connect-flash');
app.use(flash());
const flashMessenger = require('flash-messenger');
app.use(flashMessenger.middleware);

// Passport Config
const passport = require('passport');
const passportConfig = require('./config/passportConfig');
passportConfig.localStrategy(passport);

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Place to define global variables
app.use(function (req, res, next) {
	res.locals.messages = req.flash('message');
	res.locals.errors = req.flash('error');
	res.locals.user = req.user || null;
	next();
});
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())


// mainRoute is declared to point to routes/main.js
const mainRoute = require('./routes/main');
const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin');
const deliveryRoute = require('./routes/delivery')
const productRoute = require('./routes/product');
const cartRoute = require('./routes/cart');
const blogRoute = require('./routes/blog');
const couponRoute = require('./routes/coupon');

const { application, response } = require('express');
const { request } = require('http');
const flashMessage = require('./helpers/messenger');
const { ifError } = require('assert');

// Any URL with the pattern ‘/*’ is directed to routes/main.js
app.use('/', mainRoute);
app.use('/user', userRoute);
app.use('/admin', adminRoute);
app.use('/cart', cartRoute);
app.use('/blog', blogRoute);
app.use('/delivery', deliveryRoute)
app.use('/product', productRoute);
app.use('/coupon', couponRoute);
/*
* Creates a port for express server since we don't want our app to clash with well known
* ports such as 80 or 8080.
* */
const port = process.env.PORT;

// Stripe Setup
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

app.get('*', (req, res)=>{
	res.render('404')
})
// Stripe items
const storeItems = new Map([
	[1, {priceInCents: 10000, name: "10 Dolla"}],
	[2, {priceInCents: 20000, name: "20 Dolla"}],
])

const { STATUS_CODES } = require('http');

// // Stripe
// app.post("/create-checkout-session", async (req, res) => {
// 	try {
// 		const session = await stripe.checkout.sessions.create({
// 			payment_method_types: ['card'],
// 			mode: 'payment',
// 			line_items:req.body.items.map(items => {
// 				const storeItem = storeItems.get(item.id)
// 				return {
// 					price_data: {
// 						currency: 'sgd',
// 						product_data: {
// 							name: storeItem.name
// 						},
// 						unit_amount: storeItem.priceInCents
// 					},
// 					quantity: item.quantity
// 				}
// 			}),
// 			success_url: `${process.env.SERVER_URL}/success.html`,
// 			cancel_url: `${process.env.SERVER_URL}/cancel.html`
// 		})
// 		res.json({ url:"Hi" })
// 	}catch (e) {
// 		res.status(500).json({ error:e.message })
// 	}
// })

// Starts the server and listen to port
app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});

app.post('/signup', (req, res) => {
	const { email } = req.body;

	if (!email) {
		console.log('fail')
		return;
	}

	const data = {
		members: [
		  {
			email_address: email,
			status: 'subscribed',
		  }
		]
	};

	const postData = JSON.stringify(data);


	fetch('https://us8.api.mailchimp.com/3.0/lists/647d66c570', {
		method: 'POST',
		headers: {
		  Authorization: 'auth df35f2b0e89b55385582cc9db74a34ae-us8'
		},
		body: postData
	})

	.then(res.statusCode === 200 ?
		res.redirect('/') :
		console.log('fail'))
	.catch(err => console.log(err))
	
});

