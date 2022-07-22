const bcrypt = require('bcryptjs');
const User = require('../models/User');

var salt = bcrypt.genSaltSync(10);
// var hash = bcrypt.hashSync(password, salt);

defaultusers = [{name: 'admin',
                email: 'admin@site.com',
                password: 'hashthing',
                userType: 'admin',
                verified: 1,}]

num = 10         

// for (var i=0; i < defaultusers.length; i++) {
//     User.create(
        
//     )
// }