var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var mongoose = require('mongoose');//To save and manipulate data
var mongoStore = require('connect-mongo')(session);//to save data and save session values in the DB
var passport = require('passport');
var flash = require('connect-flash');// to display errors or sucessfull messages 
var _ = require('underscore');// making _ global variable, to use this variable in our .EJS files 


var app = express();

mongoose.Promise = global.Promise;//plugin our own mongoose library ELSE deprecated WARNING
// For localhost
// mongoose.connect('mongodb://localhost/travel', { useNewUrlParser: true, useUnifiedTopology: true });//because we only want to use 1 database at a time,IF we want to use several databases at a time then mongoose.createconnection 
// For cloud
mongoose.connect('mongodb+srv://rateme:rateme@rateme.mi4hrkz.mongodb.net/rateme?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });//because we only want to use 1 database at a time,IF we want to use several databases at a time then mongoose.createconnection 

require('./config/passport');
require('./secret/secret.js');

app.use(express.static('public'));//To display static files
app.engine('ejs', engine);        //To specify which engine we are using
app.set('view engine+', 'ejs');    //look for files in the views folder
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));//becuase type of data we want to send is in json format  
app.use(bodyParser.json());                      //type of data we want to send is json type of data

// add validator middleware after bodyParsor
app.use(validator());

app.use(session({//session middleware
    secret: 'Thisismytestkey',//secret used to sign the session id to the cookies,Only the session id is saved in the cookies and every data is sved in the databse only,allow the session data to be used across different pages
    resave: false,           //Whenever user refresh,login or logout We don't want to reset our database 
    saveUninitialized:false,
    store: new mongoStore({mongooseConnection: mongoose.connection})//session data will be saved in the database  
}));                         //now even if user will refresh the page the data will still persist in the databse

//always add passport middleware after session ELSE errors

app.use(flash());//middleware for flash

app.use(passport.initialize());//middleware for passport
app.use(passport.session());

app.locals._ = _;//value of app.locals properties exists throughout the life of application

require('./routes/user')(app, passport);//app is the instance of express method
require('./routes/place')(app);
require('./routes/review')(app);


app.listen(3000, function(err){
    if(err){
        console.log('err', err);
        return;
    }
console.log("App running on port 3000");
});
