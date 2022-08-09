const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '811352968755-gnjf5q7rdoludfvefic65ki09nnma3rc.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const passport = require('passport');
const User = require('../models/User');
const flashMessage = require('./messenger');
function googlelogin() {
    
    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/user/login/google/callback"
      },
        async function(accessToken, refreshToken, profile, done) {
            console.log(profile.photos[0].value)
            const [user, created] = await User.findOrCreate({
                where: {email: profile.emails[0].value},
                defaults: {
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    pfp : profile.photos[0].value, 
                    'userType': 'customer', 
                    'status': 0, 
                    'tfa': 0,
                    'verified': 1,
                },
            })
            if (created) {
                
                // flashMessage(res, 'success', 'Welcome! Thank you for creating your account.')
                return done(null, user,{ message: 'Welcome! Thank you for creating your account.'})
            } else {
                if (user.pfp != profile.photos[0].value) {
                    User.update(
                        {pfp : profile.photos[0].value},
                        {where: {id : user.id}})
                        .catch(err => console.log(err))
                }
                // flashMessage(res, 'success', 'Welcome! You have logged in.')
                return done(null, user,{ message: 'Welcome! You have logged in.'})
            }
        }
    ));

    passport.serializeUser((user, done) => {
        return done(null, user)
    });
    passport.deserializeUser((user, done) => {
        return done(null, user)
    });
}

module.exports = googlelogin;