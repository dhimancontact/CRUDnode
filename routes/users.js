const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// bring in the model User Model so this folder knows what User model is
let User = require('../models/user');

// Register Form
router.get('/register', function(req, res) {
    res.render('register');
});


// register process
router.post('/register', function(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'email is required').notEmpty();
    req.checkBody('email', 'email is not valid').isEmail();
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('password2', 'passwords do no match').equals(req.body.password);

    let errors = req.validationErrors();

    if(errors) {
        // if error re-render register but with error message
        res.render('register', {
            errors:errors
        })
    } else {
        let newUser = new User({
            name:name,
            email:email,
            username:username,
            password:password,
        });
        // take in password add salt and get a hash back
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(newUser.password, salt, function(err, hash) {
                if(err) {
                    console.log(err);
                }
                newUser.password = hash;
                newUser.save(function(err) {
                    if(err) {
                        console.log(err);
                        return;
                    } else {
                        // if everything is ok  set success variable and send message
                        req.flash('success', 'You are now registered and may log in');
                        // then redirect to log in page
                        res.redirect('/users/login');
                    }
                })
            });
        });

    }
});

// create the log in route  Login Form
router.get('/login', function(req, res) {
    // response render 'login' template from views
    res.render('login');
});

// Login process
router.post('/login', function(req, res, next) {
    //passport.authenticate(strategy using, {success route, failure redirect, message you want to pass})
    // 'local' is the strategy we want to use.  
    passport.authenticate('local', {
        successRedirect:'/',
        failureRedirect:'/users/login',
        failureFlash: true
    })(req, res, next);
});

// LogOut
router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', 'Logged Out');
    res.redirect('/users/login');
});

module.exports = router;