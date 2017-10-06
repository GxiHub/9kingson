MongoClient = require('mongodb').MongoClient;

var dbtoken;
MongoClient.connect('mongodb://9kingson:mini0306@ds111622.mlab.com:11622/usertokenrelatedinformation', function(err, database){ 
  if (err) return console.log(err);
  dbtoken = database;
})

var dbwork;
MongoClient.connect('mongodb://9kingson:9kingson@ds149382.mlab.com:49382/workinformation', function(err, database){ 
  if (err) return console.log(err);
  dbwork = database;
})

var Promise = require('rsvp').Promise;

exports.Check_UpdateEveryDayWorkStatus = function()
{
      dbwork.collection('workperiod').find({Year:"2017",Month:"09",Day:"27"}).sort({"name": 1,"Day": 1}).toArray(function(err, results) {
          console.log( 'results = ',results);
      });
}