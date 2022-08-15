const Handlebars = require('handlebars');
const moment = require('moment');
const { DATEONLY } = require('sequelize');
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

const checkdiscount = function(discount){
    if (discount > 0) {
        return true;
    }else{
        return false;
    }
};


const ifpoints50 = function(Points) {
    return (Points >= 50 ? true : false)
};

const ifcouponquantityzero = function(couponQuantity) {
    return (couponQuantity > 0 ? true : false)
}


const checkstock = function(stock){
    if (stock > 0) {
        return true;
    }else{
        return false;
    }
};

const checkurl = function(arg1, arg2) {
    if (arg1 == arg2){
        return true;
    }else{
        return false;
    }
}
const ifstatus = function(value, cvalue) {
    return (value == cvalue ? true : false)
}

const iftfa = function(value1, value2) {
    return ((value1 == 1 || value2 == 1) ? true : false)
}

const isStaff = function(userType) {
	return (userType == 'staff' || userType == 'admin' || userType == 'madmin')
};
const isAdmin = function(userType) {
	return (userType == 'admin' || userType == 'madmin')
};
const isMAdmin = function(userType) {
	return (userType == 'madmin')
};

const checkWishlist = function(id, wishlist){
    if(id == wishlist){
        return true;
    }else{
        return false
    }
}

const next = function(currentPage){
    return parseInt((parseInt(currentPage) + 1))
}

const previous = function(currentPage){
    return parseInt((parseInt(currentPage) - 1))
}

const havePrevious = function(currentPage){
    if (currentPage == 0){
        return false
    }else{
        return true
    }
}

const haveNext = function(currentPage, totalPages){
    if(currentPage+1 == totalPages){
        return false
    }else{return true}
}

const calculatePrice = function(price, discount){
    return parseFloat(parseFloat(price) * ((100-parseFloat(discount))/100)).toFixed(2)
}

const breaklines = function(text){
    text = Handlebars.Utils.escapeExpression(text);
    text =  text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Handlebars.SafeString(text);
}
const increment = function(page, totalPages){
    list_of_pages = []
    if(page < totalPages){
        while(page < 5){
            list_of_pages.push(page)
            page += 1
        }
    }
    return list_of_pages
}
const getDateOnly = function(date){
    return require('moment')(date).format('DD-MM-YYYY');
}

module.exports = {formatDate, replaceCommas, checkboxCheck, radioCheck, ifEquals, 
                checkdiscount, checkstock,checkurl, ifstatus, isStaff, 
                isAdmin, isMAdmin, checkWishlist, next, previous, haveNext, havePrevious,
                calculatePrice, breaklines, increment, iftfa, getDateOnly,ifpoints50,
                ifcouponquantityzero};
