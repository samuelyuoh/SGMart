const Handlebars = require('handlebars');
const moment = require('moment');
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

const ifmoney = function(amountSpent) {
    console.log(amountSpent)
    return (amountSpent >= 50 ? true : false)
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
    return currentPage + 1
}

const previous = function(currentPage){
    return currentPage - 1
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

module.exports = {formatDate, replaceCommas, checkboxCheck, radioCheck, ifEquals, 
                checkdiscount, checkstock,checkurl, ifmoney, ifstatus, isStaff, 
                isAdmin, isMAdmin, checkWishlist, next, previous, haveNext, havePrevious,
            calculatePrice};
