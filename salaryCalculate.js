MongoClient = require('mongodb').MongoClient;

var db;
MongoClient.connect('mongodb://mushi:mushi@ds137090.mlab.com:37090/mushi_work_hour', function(err, database){ 
  if (err) return console.log(err);
  db = database;
})

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


// 新增每個月員工新水資訊
exports.OnlineOfflineTimingCompare = function(_OnlyID,_Year,_Month)
{
      // dbwork.collection('workperiod').find({'uniID':_OnlyID,'Year':_Year,'Month':_Month}).sort({"name": 1,"Day": 1}).toArray(function(err, results) {
          console.log(' _OnlyID = ',_OnlyID);
          console.log(' _Year = ',_Year);
          console.log(' _Year = ',_Month);
      // });
      return new Promise(function(resolve,reject)
      {
          var collection = dbwork.collection('workperiod');
          collection.find({'uniID':_OnlyID,'Year':_Year,'Month':_Month}).sort({"name": 1,"Day": 1}).toArray(function(err, data ) 
          {
              if (err) { 
                  reject(err);
              } else {
                  resolve(data);
              }
          });
      }); 
}