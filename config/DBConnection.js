const mySQLDB = require('./DBConfig');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const CouponRedemption = require('../models/CouponRedemption');
const UserCouponInfo = require('../models/UserCouponInfo');


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
            UserCouponInfo.belongsTo(User)
            User.hasMany(UserCouponInfo)

            UserCouponInfo.belongsTo(Coupon)
            Coupon.hasMany(UserCouponInfo)

            Coupon.hasMany(CouponRedemption)
            CouponRedemption.belongsTo(Coupon)
            mySQLDB.sync({
                force: drop
            });
        })
        .catch(err => console.log(err));
        
        
};



module.exports = { setUpDB };