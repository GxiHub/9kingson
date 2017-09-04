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

var addTimeConditionHour = 2;
// 新增每個月員工新水資訊
exports.OnlineOfflineTimingCompare = function(_OnlyID,_Year,_Month)
{
      dbtoken.collection('memberbrandinformation').find({'uniID':_OnlyID}).toArray(function(err, minuteSalary) {
          var collection = dbwork.collection('workperiod');
          collection.find({'uniID':_OnlyID,'Year':_Year,'Month':_Month}).sort({"name": 1,"Day": 1}).toArray(function(err, data ) 
          {
              var count = 0;var arr =[];
              dbwork.collection('employeeworkschedule').find({'uniID':_OnlyID,'workyear':_Year,'workmonth':_Month}).sort({"name": 1,"workday": 1,"Hour" :1}).toArray(function(err, results) {
                  var total_addtimesalary=0;var total_latetimesalary=0;var OutsideYear;var OutsideMonth;
                  for( var i = 0; i<results.length; i++ ) { arr.push([]);}
                  for( var i = 0; i<results.length; i++ )
                  {
                      var CannotFindSameDate = false;
                      for( var j = 0; j<data.length; j++ )
                      {
                          if( (results[i].workyear == data[j].Year) && (results[i].workmonth == data[j].Month) && (results[i].workday == data[j].Day))
                          {
                              if(data[j].status=='上班')
                              { 
                                  arr[i]['name'] = results[i].name;
                                  arr[i]['uniID'] = results[i].uniID;
                                  arr[i]['Year'] = results[i].workyear;
                                  arr[i]['Month'] = results[i].workmonth;
                                  arr[i]['Day'] = results[i].workday;
                                  arr[i]['onlinehour'] = results[i].onlinehour;
                                  arr[i]['onlineminute'] = results[i].onlineminute;
                                  arr[i]['realonlinehour'] = data[j].Hour;
                                  arr[i]['realonlineminute'] = data[j].Minute;
                                  arr[i]['offlinehour'] = results[i].offlinehour;
                                  arr[i]['offlineminute'] = results[i].offlineminute;            
                              }
                              else
                              {
                                  arr[i]['realofflinehour'] = data[j].Hour; 
                                  arr[i]['realofflineminute'] = data[j].Minute; 
                              }
                              CannotFindSameDate = true;
                          }
                      }
                      if(parseInt(arr[i]['realonlinehour'],10) < parseInt(arr[i]['onlinehour'],10))
                      {
                        arr[i]['lateTime'] = 0;
                      }
                      else
                      {
                        arr[i]['lateTime'] = (parseInt(arr[i]['realonlinehour'],10)*60 + parseInt(arr[i]['realonlineminute'],10)) - (parseInt(arr[i]['onlinehour'],10)*60 + parseInt(arr[i]['onlineminute'],10));
                      }

                      if(parseInt(arr[i]['realofflinehour'],10) < (parseInt(arr[i]['offlinehour'],10)-addTimeConditionHour))
                      {
                        arr[i]['addTime'] = 0;
                      }
                      else
                      {
                        arr[i]['addTime'] = (parseInt(arr[i]['realofflinehour'],10)*60 + parseInt(arr[i]['realofflineminute'],10)) - ( (parseInt(arr[i]['offlinehour'],10)-addTimeConditionHour) *60 + parseInt(arr[i]['offlineminute'],10));
                      }
                      //console.log("arr[",i,"] = ", arr[i]); 
                      var latetime_salary = 0;
                      var addtime_salary = (parseInt(minuteSalary[0].usermonthsalary,10)+parseInt(minuteSalary[0].userwithoutsalary,10)+parseInt(minuteSalary[0].userfoodsalary,10)+parseInt(minuteSalary[0].usertitlesalary,10))/30/8/60*1.33*arr[i]['addTime'];
                      //console.log("minute_salary = ", Math.round(addtime_salary)); 
                      total_latetimesalary = total_latetimesalary + latetime_salary;
                      total_addtimesalary = total_addtimesalary + Math.round(addtime_salary);
                      OutsideYear = arr[i].Year;
                      OutsideMonth = arr[i].Month

                      //console.log(""); 
                      if(CannotFindSameDate == true)
                      {
                         dbwork.collection('everydayonlineofflinelist').save({TID:Date.now(),uniID:arr[i].uniID,name:arr[i].name,Year:arr[i].Year,Month:arr[i].Month,Day:arr[i].Day,onlinehour:arr[i].onlinehour,onlineminute:arr[i].onlineminute,realonlinehour:arr[i].realonlinehour ,realonlineminute:arr[i].realonlineminute,offlinehour:arr[i].offlinehour,offlineminute:arr[i].offlineminute,realofflinehour:arr[i].realofflinehour,realofflineminute:arr[i].realofflineminute,addtime:arr[i].addTime,latetime:arr[i].lateTime,addtimesalary:Math.round(addtime_salary),latetimesalary:latetime_salary},function(err,result){
                            if(err)return console.log(err);
                         });
                      }
                  }
                  var YearMonth = OutsideYear+'/'+OutsideMonth;
                  var total_month_salaty = parseInt(minuteSalary[0].usermonthsalary,10)+parseInt(minuteSalary[0].userwithoutsalary,10)+parseInt(minuteSalary[0].userfoodsalary,10)+parseInt(minuteSalary[0].usertitlesalary,10)+
                    parseInt(minuteSalary[0].userextrasalary,10)+parseInt(minuteSalary[0].userlawsalary,10)+parseInt(total_addtimesalary,10)+parseInt(total_latetimesalary,10);
                  dbwork.collection('monthlysalaryinformation').save({TID:Date.now(),uniID:minuteSalary[0].uniID,name:minuteSalary[0].name,monthperiod:YearMonth,monthsalary:minuteSalary[0].usermonthsalary,
                                                                      withoutsalary:minuteSalary[0].userwithoutsalary,foodsalary:minuteSalary[0].userfoodsalary,titlesalary:minuteSalary[0].usertitlesalary,
                                                                      addtimesalary:total_addtimesalary,latetimesalary:total_latetimesalary,extrabonus:minuteSalary[0].userextrasalary,lawsalary:minuteSalary[0].userlawsalary,
                                                                      totalmonthsalaty:total_month_salaty},function(err,result){
                          if(err)return console.log(err);
                  });   
              });

          });
      });
}


exports.SalaryCalculateMonthCheck = function(_Year,_Month)
{
          var collection = dbwork.collection('workperiod');
          collection.find({'Year':_Year,'Month':_Month}).sort({"name": 1,"Day": 1}).toArray(function(err, data ) 
          {
              var count = 0;var arr =[];
              dbwork.collection('employeeworkschedule').find({'workyear':_Year,'workmonth':_Month}).sort({"name": 1,"workday": 1,"Hour" :1}).toArray(function(err, results) {
                  for( var i = 0; i<results.length; i++ ) { arr.push([]);}
                  for( var i = 0; i<results.length; i++ )
                  {
                      var CannotFindSameDate = false;
                      for( var j = 0; j<data.length; j++ )
                      {
                          if( (results[i].workyear == data[j].Year) && (results[i].workmonth == data[j].Month) && (results[i].workday == data[j].Day))
                          {
                              if(data[j].status=='上班')
                              { 
                                  arr[i]['name'] = results[i].name;
                                  arr[i]['uniID'] = results[i].uniID;
                                  arr[i]['Year'] = results[i].workyear;
                                  arr[i]['Month'] = results[i].workmonth;
                                  arr[i]['Day'] = results[i].workday;
                                  arr[i]['onlinehour'] = results[i].onlinehour;
                                  arr[i]['onlineminute'] = results[i].onlineminute;
                                  arr[i]['realonlinehour'] = data[j].Hour;
                                  arr[i]['realonlineminute'] = data[j].Minute;
                                  arr[i]['offlinehour'] = results[i].offlinehour;
                                  arr[i]['offlineminute'] = results[i].offlineminute;            
                              }
                              else
                              {
                                  arr[i]['realofflinehour'] = data[j].Hour; 
                                  arr[i]['realofflineminute'] = data[j].Minute; 
                              }
                              CannotFindSameDate = true;
                          }
                      }

                      // console.log("arr[",i,"] = ", arr[i]); 
                      // console.log(""); 
                      if(CannotFindSameDate == true)
                      {
                         dbwork.collection('everydayonlineofflinelist').save({TID:Date.now(),uniID:arr[i].uniID,name:arr[i].name,Year:arr[i].Year,Month:arr[i].Month,Day:arr[i].Day,onlinehour:arr[i].onlinehour,onlineminute:arr[i].onlineminute,realonlinehour:arr[i].realonlinehour ,realonlineminute:arr[i].realonlineminute,offlinehour:arr[i].offlinehour,offlineminute:arr[i].offlineminute,realofflinehour:arr[i].realofflinehour,realofflineminute:arr[i].realofflineminute,addtime:arr[i].addTime,latetime:arr[i].lateTime},function(err,result){
                            if(err)return console.log(err);
                         });
                      }
                  }    
              });

          });
}