const Handlebars = require('handlebars');
const moment = require('moment');
const Brand = require('../models/Brand');
const Coupon = require('../models/Coupon');
const formatDate = function (date, targetFormat) {
    return moment(date).format(targetFormat);
};

const replaceCommas = function(value) {
    return value ? value.replace(/,/g,' | ') : 'None';
}

const checkboxCheck = function (value, checkboxValue) {
    return (value.search(checkboxValue) >= 0 ? 'checked' : '')
}

const radioCheck = function (value, radioValue) {
    return (value == radioValue ? 'checked' : '')
}

const ifEquals = function (value, CorrectValue) {
    return (value == CorrectValue ? "active" : '')
}
// Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
//     return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
// });
const checkdiscount = function(discount){
    if (discount > 0) {
        return true;
    }else{
        return false;
    }
};

const checkstock = function(stock){
    if (stock > 0) {
        return true;
    }else{
        return false;
    }
};

const ifpoints50 = function(Points) {
    return (Points >= 50 ? true : false)
};

const ifpoints55 = function(Points){
    return (Points >= 55 ? true : false)
}

const ifpoints60 = function(Points) {
    return (Points >= 60 ? true : false)
};

const ifpoints65 = function(Points){
    return (Points >= 65 ? true : false)
}

const ifpoints70 = function(Points) {
    return (Points >= 70 ? true : false)
};

const ifpoints75 = function(Points){
    return (Points >= 75 ? true : false)
}

const ifowncoupon = function(couponInventory){
    return (couponInventory != null ? true : false)
}



module.exports = {formatDate, replaceCommas, checkboxCheck, radioCheck, ifEquals, checkdiscount, checkstock,
     ifpoints50, ifpoints55, ifpoints60, ifpoints65, ifpoints70, ifpoints75, ifowncoupon};