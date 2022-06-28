const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');

router.get('/', (req, res) => {
	const title = 'Admin';
	// renders views/index.handlebars, passing title as an object
	res.render('admin/index', { layout: 'admin' })
});

module.exports = router;
