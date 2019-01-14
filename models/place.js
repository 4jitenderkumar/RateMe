
var mongoose = require('mongoose');

var placeSchema = mongoose.Schema({
    name: {type: String}, 
    map: {type: String},
    city: {type: String},
    country: {type: String},
    image: {type: String, default: 'defaultPic.png'},
    
    placeRating: [{
        userFullname: {type: String, default: ''},
        userImage: {type: String, default: ''},
        userRating: {type: Number, default: 0},
        userReview: {type: String, default: ''},
        userDate:   {type: String, default: ''}
    }], 

    ratingNumber: [Number],
    ratingSum: {type: Number, default: 0}
}); 

module.exports = mongoose.model('Place', placeSchema);
