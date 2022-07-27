const bcrypt = require('bcryptjs');
const User = require('../models/User');

var salt = bcrypt.genSaltSync(10);
// var hash = bcrypt.hashSync(password, salt);

num = 10         
User.create({
    name: 'master admin',
    email: 'admin@site.com',
    password: bcrypt.hashSync('12345678', salt),
    userType: 'madmin',
    status: 0,
    verified: 1,
    tfa: 1,
});

for (var i=1; i < 6; i++) {
    User.create({
        name: `user${i}`,
        email : `user${i}@gmail.com`,
        password: bcrypt.hashSync('12345678', salt),
        userType: 'customer',
        status: 0,
        verified: 1,
        tfa: 0,

    })
    console.log(`User${i} added`)
}