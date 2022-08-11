const mySQLDB = require('./DBConfig');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const CouponRedemption = require('../models/CouponRedemption');


// If drop is true, all exis    ting tables are dropped and recreated
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Database connected');
            /*
            Defines the relationship where a user has many videos.
            The primary key from user will be a foreign key in video.
            // */
            // User.hasMany(Coupon)
            // Coupon.belongsTo(User)
            Coupon.hasMany(CouponRedemption)
            CouponRedemption.belongsTo(Coupon)
            mySQLDB.sync({
                force: drop
            });
        })
        .catch(err => console.log(err));
        
        
};



module.exports = { setUpDB };