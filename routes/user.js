var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');//to send messages inside our nodejs application
var async = require('async');

var crypto = require('crypto');//To create the random token, Built in module in nodejs , don't have to install that
var User = require('../models/user');
var Place = require('../models/place');
var secret = require('../secret/secret.js');

module.exports = (app, passport) => {// app? , now we have access to the instance of express i.e. app

    app.get('/', (req, res, next) =>{//http method, Gets information

        if(req.session.cookie.originalMaxAge !== null){
            res.redirect('/home');
        } 
        else{
            //show all Places  
            Place.find({}, (err, result) => {//all data is stores in 'data', mongoose.find method 
            res.render('index.ejs', {title: 'Index || Rate Me', data: result});  
            }); 
        }
    });

    app.get('/signup', (req, res, next) =>{
        var errors = req.flash('error');//#messages = errors
        console.log(errors);
        res.render('user/signup.ejs', {title: 'Sign Up || Rate Me', messages: errors, hasErrors: errors.length > 0});// why not /signup.ejs? because the render check for signup file in view folder BUT signup is in view/user/signup.ejs
    });

    app.post('/signup', validate, passport.authenticate('local.signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash   : true
    }));

    app.get('/login', (req, res, next) =>{
        var errors = req.flash('error');
        console.log(errors);
        res.render('user/login.ejs', {title: 'Login || Rate Me', messages: errors, hasErrors: errors.length > 0});// why not /login.ejs? because the render check for signup file in view folder BUT signup is in view/user/signup.ejs
    });

    app.post('/login' , loginValidation, passport.authenticate('local.login', {
        //successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash   : true
    }), (req, res) => {
        if(req.body.rememberme){//If the input field is checked 
            req.session.cookie.maxAge = 30*24*60*60*1000; // 30 days 
        }
        else{
            req.session.cookie.expires = null; 
        }
        res.redirect('/home'); 
    });

    app.get('/home', (req, res) => {
        res.render('home.ejs', {title: 'Home || Rate Me', user: req.user});// req.user returns all of the user's data in an object
    });


    app.get('/forgot', (req,res) => {
        var errors = req.flash('error');
        var info = req.flash('info');
        
        res.render('user/forgot.ejs', {title: 'Forgot || Rate Me', messages: errors, hasErrors: errors.length > 0, info: info, noErrors: info.length > 0});
    });

    app.post('/forgot', (req, res, next) => {
        async.waterfall([////To send result of a first function to the second function
            function(callback){
                crypto.randomBytes(20, (err, buf) => {//create the random value and value will be stored inside the buf
                    var rand = buf.toString('hex');   //Token, token is used to ride bus inside client-side   
                    callback(err, rand);              // beacuse we want to use rand value in another function thats why we passing it into the callback
                })
            },

            function(rand, callback){// 2 args? because callback passes 2 args
                User.findOne({'email': req.body.email}, (err, user) =>{// returns the object, "user" is return as an object
                   if(!user){
                       req.flash('error', 'No Account With That Email Exists Or Email is Invalid');
                       return res.redirect('/forgot');
                    }

                    user.passwordResetToken = rand;
                    user.passwordResetExpires = Date.now() + 60*60*1000;// if passResetExpires expires then user cannot reset their password
                
                    user.save((err) => {
                        callback(err, rand, user);
                    });
                })
            },

            function(rand, user, callback){//now we want to send the email to the user
                    var smtpTransport = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: secret.auth.user,
                            pass: secret.auth.pass
                        }
                    });

                    var mailOptions = {
                        to: user.email,//or req.body.email
                        from: 'RateMe '+'<'+secret.auth.user+'>',
                        subject: 'RateMe Application Password Reset Token',
                        text: 'You have requested for password reset token. \n\n'+
                            'Please click on the link to complete the process: \n\n'+
                            'http://localhost:3000/reset/'+rand+'\n\n'
                    };

                    //to send the email
                    smtpTransport.sendMail(mailOptions, (err, response) => {
                        //If the mail sent sucessfully
                        req.flash('info', 'A password reset token has been sent to '+user.email);
                        return callback(err, user);
                    });
            }       
        ], (err) => {
            if(err){
                return  next(err);
            }

            res.redirect('/forgot');     
        })                               
    });

    app.get('/reset/:token', (req, res) => {// to get token , /reset/:token
       //to get parameter added to the url we use "params" in express
        User.findOne({passwordResetToken: req.params.token, passwordResetExpires: {$gt: Date.now()}}, (err, user) => {//because we are dealing with only one user
             if(!user){
                 req.flash('error','password reset Token has expired or is Invalid. Enter your Email to get a new token');
                 return res.redirect('/forgot');
                }
             var errors = req.flash('error');
             var success = req.flash('success');

             res.render('user/reset.ejs', {title: 'Reset || Rate Me', messages: errors, hasErrors: errors.length > 0, success: success, noErrors: success.length > 0});// beacuse render parameter should be same whenever we do res.rende thatswhy we are passing some extra keys and values
        });

       
    });

    app.post('/reset/:token', (req, res) => {
        async.waterfall([
            function(callback){
                User.findOne({passwordResetToken: req.params.token, passwordResetExpires: {$gt: Date.now()}}, (err, user) => {//checking if passwordResetToken is still valid
                    if(!user){
                        req.flash('error','password reset Token has expired or is Invalid. Enter your Email to get a new token');
                        return res.redirect('/forgot');
                       }

                        req.checkBody('password', 'Password is Required').notEmpty();
                     // req.checkBody('Password', 'Password Must not be less then 5').isLength({min:5});
                        req.check('password', 'Password Must Contain at least 1 Number').matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");                    
                        
                        var errors = req.validationErrors();

                        if(req.body.password == req.body.cpassword){
                            if(errors){
                                var messges = [];
                                errors.forEach((error) => {
                                    messages.push(error.msg);
                                })
                                var errors = req.flash('error');
                                res.redirect('/reset/'+req.params.token);
                            }
                            else{// now we have to save the password in the database, and also EMPTY token and expires 
                                user.password = user.encryptPassword(req.body.password);
                                user.passwordResetToken = undefined;
                                user.passwordResetExpires = undefined;
                                user.save((err) => {// passing the error function
                                    //If the password is successfully saved 
                                    req.flash('success', 'Your Password has been sucessfully updated.');
                                    callback(err, user);
                                })   
                            }
                        }
                        else{
                            req.flash('error', 'Password and confirm password are not equal.');
                            res.redirect('/reset/'+req.params.token);

                        }

               });
            },

            //now we want to send email to the user
            function(user, callback){
                var smtpTransport = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: secret.auth.user,
                        pass: secret.auth.pass
                    }
                });

                var mailOptions = {
                    to: user.email,
                    from: 'RateMe '+'<'+secret.auth.user+'>',
                    subject: 'Your Password Has Been Updated.',
                    text: 'This is a confirmation that you updated the password for '+user.email
                };

                //to send the email
                smtpTransport.sendMail(mailOptions, (err, response) => {
                    //If the mail sent sucessfully
                     callback(err, user);
                
                     var error = req.flash('error');
                     var success = req.flash('success');
                
                     res.render('user/reset.ejs', {title: 'Reset || Rate Me', messages: error, hasErrors: error.length > 0, success: success, noErrors: success.length > 0});
                });
            }
        ]);
    });

    app.get('/logout', (req, res) => {
        req.logout();//method available through passport, CLEARS THE LOGIN SESSION, REMOVES THE req.user PROPERTY

        req.session.destroy((err) => {
            //path where user to be taken to after user is successfully logout
            res.redirect('/');
        })
    });  
}

function validate(req, res, next){
  req.checkBody('fullname', 'Fullname is Required').notEmpty();
  req.checkBody('fullname', 'Fullname Must not be less then 5').isLength({min:5});        
  req.checkBody('email',    'Email is Required').notEmpty();
  req.checkBody('email',    'Email is Invalid').isEmail();
  req.checkBody('password', 'Password is Required').notEmpty();
 // req.checkBody('Password', 'Password Must not be less then 5').isLength({min:5});
   req.check('password', 'Password Must Contain at least 1 Number').matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");
  
  var errors = req.validationErrors();

  if(errors){
      var messages = [];
      errors.forEach((error) => {
          messages.push(error.msg);
      })

      req.flash('error', messages);
      res.redirect('/signup');
  }
  else{
      return next();//if no errors ,move to passport.authenticate
  }
}

function loginValidation(req, res, next){     
    req.checkBody('email',    'Email is Required').notEmpty();
    req.checkBody('email',    'Email is Invalid').isEmail();
    req.checkBody('password', 'Password is Required').notEmpty();
   // req.checkBody('Password', 'Password Must not be less then 5').isLength({min:5});
     req.check('password', 'Password Must Contain at least 1 Number').matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");
    
    var loginErrors = req.validationErrors();
  
    if(loginErrors){
        var messages = [];
        loginErrors.forEach((error) => {
            messages.push(error.msg);
        })
  
        req.flash('error', messages);
        res.redirect('/login');
    }
    else{
        return next();//if no errors ,move to passport.authenticate
    }
  }