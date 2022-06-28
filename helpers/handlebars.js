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
// Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
//     return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
// });
module.exports = {formatDate, replaceCommas, checkboxCheck, radioCheck, ifEquals};