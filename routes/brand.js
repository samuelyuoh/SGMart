const express = require('express');
const router = express.Router();
const moment = require('moment');
const Brand = require("../models/Brand");
const ensureAuthenticated = require('../helpers/auth');


router.get('/inventory', (req, res) => {
    Brand.findAll()
})

module.exports = router;