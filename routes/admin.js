const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');

router.get('/', (req, res) => {
	const title = 'Admin';
	// renders views/index.handlebars, passing title as an object

	const metadata = {
		layout: 'admin',
		nav: {
			sidebarActive: 'dashboard'
		}
	}
	res.render('admin/index', metadata)
});

module.exports = router;
