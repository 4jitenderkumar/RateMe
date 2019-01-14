var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    fullname: {type: String, required: true},
    email   : {type: String, required: true},
    password: {type: String},                // we are not adding required because when the user login through facebook we don't store password in the DB 
    image: {type: String, default: 'defaultPic.PNG'},

    passwordResetToken  : {type: String, default: ''},// Token to reset Password
 passwordResetExpires: {type: Date  , default: Date.now}// Time frame in which user needs to reset their password otherwise token will become Invalid
});

userSchema.methods.encryptPassword = (password) => {
     return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

userSchema.methods.validPassword   = function(password){    
     return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);