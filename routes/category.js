const express = require('express');
const router = express.Router();
const moment = require('moment');
const Category = require("../models/Category");
const Product = require("../models/Product");
const ensureAuthenticated = require('../helpers/auth');


router.get('/inventory', (req, res) => {
    Category.findAll()
})

router.get('/addproduct', (req, res) => {
    Category.findAll()
})

module.exports = router;