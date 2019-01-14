var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

var User = require('../models/user');

passport.serializeUser((user, done) => {
    done(null, user.id);                //Saving user's id in the session
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {  //Searching user's data by id, if found then user's data will be stored in 'user' var
        done(err, user);
    });
});

//passport middleware for sign up
passport.use('local.signup', new localStrategy({
    usernameField: 'email', 
    passwordField: 'password',
    passReqToCallback: true//we are passing all these uField and pField in callback
}, (req, email, password, done) => {
    User.findOne({'email': email}, (err, user) => {
        if(err){           //Connection problem or data not found
            return done(err);
        }

        if(user){           //if user's email exists then error
            return done(null, false, req.flash('error', 'User With Email Already Exists.'));
        }
        
        var newUser = new User();
        newUser.fullname = req.body.fullname;
        newUser.email    = req.body.email;
        newUser.password = newUser.encryptPassword(req.body.password);
        newUser.image    = req.body.upload;
        
        newUser.save((err) => {
            return done(null, newUser);
        });
    });
}));


// Passport middleware for login
passport.use('local.login', new localStrategy({
    usernameField: 'email', 
    passwordField: 'password',
    passReqToCallback: true//we are passing all these uField and pField in callback
}, (req, email, password, done) => {
    User.findOne({'email': email}, (err, user) => {
        if(err){           //Connection problem or data not found
            return done(err);
        }
        var messages = [];
        if(!user || !user.validPassword(password)){           //if user not found with that email
            messages.push('Email Does Not Exist or Password is Invalid');
            return done(null, false, req.flash('error', messages));
        }
        
            return done(null, user);
    });
}));