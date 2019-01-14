    var formidable = require('formidable');
    var path = require('path');// Build in nodejs module
    var fs = require('fs');      //,,    FileSystem
    var async = require('async');

    var Place = require('../models/place');
    var User = require('../models/user');

    var {arrayAverage} = require('../myFunctions');


    module.exports = (app) => {

        app.get('/place/create', (req, res) => {
            var success = req.flash('success');
            res.render('place/place.ejs', {title: 'Add Place', user: req.user, success: success, noErrors: success.length > 0});
        }); 

        app.post('/place/create', (req, res) => {
            
            var newPlace = new Place();
            newPlace.name = req.body.name;
            newPlace.map = req.body.map;
            newPlace.city = req.body.city;
            newPlace.country = req.body.country;
            newPlace.image = req.body.upload;

            newPlace.save((err) => {
                if(err){
                    console.log(err);
                }

                console.log(newPlace);

                req.flash('success', 'Place data has been added.');
                res.redirect('/place/create');
            });
        });

        app.post('/upload', (req, res) => {
            var form = new formidable.IncomingForm();
            
           /* form.uploadDir = path.join(__dirname, '../public/uploads');// path where we save the files
            
            form.on('file', (field, file) => { // 'file' is a Event
                fs.rename(file.path, path.join(form.uploadDir, file.name), (err) => {
                    if(err){
                        throw err
                    }

                    console.log('File has been renamed');
                });
            });*/

            form.on('error', (err) => {// 'error' is an event
                console.log('An error occured', err);
            });

            form.on('end', () => {
                console.log('File has been uploaded');  
            });

            form.parse(req);// parse an incoming req that contains data

        });

        //FIND method returns the array of the data in the database
        //FINDBYID return object
        app.get('/places', (req, res) => {
            Place.find({}, (err, result) => {//all data is stores in 'data', mongoose.find method 
            console.log(result);
            res.render('place/places.ejs', {title: 'All Places || Rate Me', user: req.user, data: result});    
            });
            
        });

        app.get('/place-profile/:id', (req, res) => {
            Place.findOne({'_id':req.params.id}, (err, data) => {
                var avg = arrayAverage(data.ratingNumber);

                console.log(avg);

                res.render('place/place-profile.ejs', {title: 'Place Name || Rate Me', user:req.user, id: req.params.id, data:data, average: avg});
            });
        });
         

        app.get('/places/leaderboard', (req, res) => {
            Place.find({}, (err, result) => {//all data is stores in 'data', mongoose.find method 
            console.log(result);
            res.render('place/leaderboard.ejs', {title: 'Leaderboard || Rate Me', user: req.user, data: result}); //we want to sort the returned data on the basis pf ratingSum.     
            }).sort({'ratingSum': -1});// sort -1 => highest to lowest ,   sort 1 => lowest to highest
            
        });

        app.get('/place/search', (req, res) => {
            var errors = req.flash('error');
            console.log(errors);
            res.render('place/search.ejs', {title: 'Search || rate Me', user: req.user, messages: errors, hasErrors: errors.length > 0});
        }); 
        
        app.post('/place/search', (req, res) => {
            var name = req.body.search;
            var regex = new RegExp(name, 'i'); // 'i' is to specify ignore UPPERCASES
            // find returns an array
            Place.find({'$or': [{'name': regex}]}, (err, data) => { // we want to search acc to search attribute , // we can pass more objects to get whatever result we want  //, {'city': regexCity}
                 if(err){
                     console.log(err);   
                 }

                 var messages = [];
                 if(!data[0]){
                    messages.push('Place does not exists');
                 }
                 req.checkBody('search', 'Place is Required').notEmpty();
                 var searchErrors = req.validationErrors();
                 if(searchErrors){
                 searchErrors.forEach((error) => {
                    messages.push(error.msg);
                })
                }


                 if(searchErrors || !data[0]){ 
              
                    req.flash('error', messages);
                    res.redirect('/place/search');
                }
                else{
                 res.redirect('/place-profile/' + data[0]._id);
                }
            });
        }); 

        app.get('/places/leaderboard-search', (req, res) => {
            var errors = req.flash('error');
            console.log(errors);
            res.render('place/leaderboard-search.ejs', {title: 'Leaderboard-Search || rate Me', user: req.user, messages: errors, hasErrors: errors.length > 0});
        }); 
        
        app.post('/places/leaderboard-search', (req, res) => {
            var name = req.body.search;
            var regex = new RegExp(name, 'i'); // 'i' is to specify ignore UPPERCASES
        
            var messages = [];
            req.checkBody('search', 'Input is Required').notEmpty();
            var searchErrors = req.validationErrors();
            if(searchErrors){
            searchErrors.forEach((error) => {
               messages.push(error.msg);
           })
           }

            if(searchErrors){ 
         
               req.flash('error', messages);
               res.redirect('/places/leaderboard-search');
           }
           else{// if we have input

            if(name == 'global'){
                Place.find({}, (err, result) => {//all data is stores in 'data', mongoose.find method 
            console.log(result);
            res.render('place/leaderboard.ejs', {title: 'Leaderboard || Rate Me', user: req.user, data: result}); //we want to sort the returned data on the basis pf ratingSum.     
            }).sort({'ratingSum': -1});// sort -1 => highest to lowest ,   sort 1 => lowest to highest
            
               }
               Place.find({'$or': [{'city': regex}]}, (err, result) => { // we want to search acc to search attribute , // we can pass more objects to get whatever result we want  //, {'city': regexCity}
               if(err){
                   console.log(err);   
               }
               
              if(result.length != 0){
                console.log("City Running");

                  console.log(result);
                res.render('place/leaderboard.ejs', {title: 'Leaderboard || Rate Me', user: req.user, data: result});
             
            }
          }).sort({'ratingSum': -1});



        Place.find({'$or': [{'country': regex}]}, (err, result) => { // we want to search acc to search attribute , // we can pass more objects to get whatever result we want  //, {'city': regexCity}
          if(err){
              console.log(err);   
          }
          
         if(result.length != 0){
             console.log("Country Running");
             console.log(result);
           res.render('place/leaderboard.ejs', {title: 'Leaderboard || Rate Me', user: req.user, data: result});
         }
     }).sort({'ratingSum': -1});
     
    //Errors
    /* messages.length = 0;//clearing "input required" data
     var messages = [];
        messages.push('Try Again');
        
        req.flash('error', messages);
        res.redirect('/places/leaderboard-search');*/
    }
        }); 
        
    }
