const XLSX = require('xlsx');
const User = require('../models/User');
const { Op } = require('sequelize');

function convertJsonToExcel(data, sheetName, fileName) {
    // file name must be in format of ___.xlsx
    var workSheet = XLSX.utils.json_to_sheet(data);
    var workBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workBook, workSheet, sheetName);

    // GENERATE BUFFER
    XLSX.write(workBook, {bookType: 'xlsx', type: 'buffer'});

    // BIBARY STRING
    XLSX.write(workBook, {bookType: 'xlsx', type: 'binary'});

    XLSX.writeFile(workBook, 'public/excel/'+fileName)
    
}

async function getUsers() {
    users = await User.findAll();
	var newUsers = []
	users.forEach(element => {
		
		var b = formatData(element.dataValues);
		
		newUsers.push(b);
	});
    return newUsers;
} 

async function getStaff() {
    staff = await User.findAll({
        where: {
        userType: {
            [Op.or]: ['admin', 'staff', 'madmin']
        }
    }});
	var newUsers = []
	staff.forEach(element => {
		
		var b = formatData(element.dataValues);
		
		newUsers.push(b);
	});
    return newUsers;
} 

function formatData(data) {
    var remove = ["status", "tfa", "gtfa", "pfp", "otptoken", "secret"];
    if (data.userType == 'madmin') {
        data.userType = 'master admin';
    }
    for (var i in remove) {
        delete data[remove[i]];
    }
    return data;
}
module.exports = {convertJsonToExcel, getUsers, getStaff};