var async = require('async');
var Place = require('../models/place');

module.exports = (app) => {
    
    app.get('/review/:id', (req, res) => {
        var messg = req.flash('success');
        Place.findOne({'_id':req.params.id}, (err, data) => {
            res.render('place/review.ejs', {title: 'Place Review', user:req.user, data:data, msg: messg, hasMsg: messg.length>0});
        });
    });
    
    app.post('/review/:id', (req, res) => {
        async.waterfall([
            function(callback){
                Place.findOne({'_id':req.params.id}, (err, result) => {
                    callback(err, result);
                });
            },
            
            function(result, callback){
                Place.update({
                    '_id': req.params.id
                },
                {
                    $push: {placeRating: {
                        userFullname: req.user.fullname,
                        userImage: req.user.image,
                        userRating: req.body.clickedValue,
                        userReview: req.body.review,
                        userDate: today       
                    }, 
                        ratingNumber: req.body.clickedValue       
                    },
                    $inc: {ratingSum: req.body.clickedValue}
                }, (err) => {
                    req.flash('success', 'Your review has been added.');
                    res.redirect('/review/'+req.params.id)
                })
            }
        ])
    });
}

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();

if(dd<10) {
    dd = '0'+dd
} 

if(mm<10) {
    mm = '0'+mm
} 

today = mm + '/' + dd + '/' + yyyy;






































