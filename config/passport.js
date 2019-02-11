const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = function(passport){
    // Local Strategy               also note done here is a call back function
    passport.use(new LocalStrategy(function(username, password, done) {
        // match username
        let query = { username:username };
        User.findOne(query, function(err, user){
            if(err) throw err;
            if(!user) {
                return done(null, false, {message: 'No user found'});
            }
            // if there is a user it will just skip above
            // Match Password   password comes from above LocalStrategy we pass password thru
            // our HASHED password from database comes from User.findOne() we pass user there.
            bcrypt.compare(password, user.password, function(err, isMatch) {
                if(err) throw err;
                if(isMatch) {
                    // ossword matched were good
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Password incorrect'});
                }
            });
        });
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
}
