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
exports.AddEmployeeMonthlySalaryInformation = function(OnlyID,YearMonth,UserName,UserBrandTitle,CalculateMonth,OverWorkTime,LateWorkTime,ExtraBonus,SpecialBonus,TotalMonthSalaty)
{
  dbwork.collection('monthlysalaryinformation').save({TID:Date.now(),monthperiod:YearMonth,uniID:OnlyID,name:UserName,userbrandtitle:UserBrandTitle,calculatemonth:CalculateMonth,overworktime:OverWorkTime,lateworktime:LateWorkTime,extrabonus:ExtraBonus,specialbonus:SpecialBonus,totalmonthsalaty:TotalMonthSalaty},function(err,result){
     if(err)return console.log(err);
  });
}

// 新增上下班資訊
exports.EmployeeWorkTimeAndStatus = function(OnlyID,UserName,WorkStatus)
{
  var Work_Year = moment().format('YYYY');
  var Work_Month = moment().format('MM');
  var Work_Day = moment().format('DD');
  var Work_Hour = moment().format('HH');
  var Work_Minute = moment().format('mm');
  var SalaryStatus = false;
  dbwork.collection('workperiod').save({TID:Date.now(),uniID:OnlyID,name:UserName,status:WorkStatus,Year:Work_Year,Month:Work_Month,Day:Work_Day,Hour:Work_Hour,Minute:Work_Minute,SalaryCountStatus:SalaryStatus},function(err,result){
     if(err)return console.log(err);
  });
}

// 透過 deviceID 和 token 來確認 uniID、name、status
exports.CheckDeviceIDAndToken = function(DeviceID,Token)
{
      console.log( 'DeviceID = ',DeviceID,' Token = ',Token);
      return new Promise(function(resolve, reject) 
      {
          var collection = dbtoken.collection('usertokenrelatedinformationcollection');
          collection.findOne({ deviceid:DeviceID,usertoken:Token}, function(err, data )
          {
              console.log(data);
              if (err) { 
                  reject(err);
              } else {
                  resolve(data);
              }
          });
      });
 }

// 用來新增每個人的 unitoken、deviceID、上下班狀態、
exports.AddUserTokenRelatedInformationFunction = function(OnlyId,DeviceID,UserToken,UserName,WorkStatus)
{
  dbtoken.collection('usertokenrelatedinformationcollection').save({uniID:OnlyId,deviceid:DeviceID,usertoken:UserToken,name:UserName,status:WorkStatus},function(err,result){
    if(err)return console.log(err);
  });
}

// 用來新增每個人的帳號和密碼和產生唯一碼
exports.AddMemberInformationFunction = function(UserName,Account,PassWord)
{
  dbtoken.collection('memberinformationcollection').save({uniID:Date.now(),name:UserName,account:Account,password:PassWord},function(err,result){
    if(err)return console.log(err);
  });
}

// 用來新增每個人的店務名稱、品牌、地點
exports.AddMemberBrandInformation = function(UniID,UserName,UserBrandtitle,UserBrandname,UserBrandplace,MonthSalary,HourSalary)
{
  dbtoken.collection('memberbrandinformation').save({uniID:UniID,name:UserName,userbrandtitle:UserBrandtitle,userbrandname:UserBrandname,userbrandplace:UserBrandplace,usermonthsalary:MonthSalary,userhoursalary:HourSalary},function(err,result){
    if(err)return console.log(err);
  });
}

// 若是要使用uniID當作查詢索引，需要透過 parseInt 來把變數變成int
exports.GetUniIDAndUseItAsQueryParameter = function(UniID)
{
      console.log( 'GetUniIDAndUseItAsQueryParameter->UniID = ',UniID);
      return new Promise(function(resolve,reject)
      {
          var collection = dbtoken.collection('memberinformationcollection');
          collection.findOne({ uniID:parseInt(UniID,10)}, function(err, data ) 
          {
              if (err) { 
                  reject(err);
              } else {
                  resolve(data);
              }
          });
      }); 
}

exports.PromiseGetMonthSalaryOrHourSalary = function(UniID)
{
      console.log( 'PromiseGetMonthSalaryOrHourSalary->PromiseUniID = ',UniID);
      return new Promise(function(resolve,reject)
      {
          var collection = dbtoken.collection('memberbrandinformation');
          collection.findOne({uniID:UniID}, function(err, data ) 
          {
              if (err) { 
                  reject(err);
              } else {
                  resolve(data);
              }
          });
      }); 
}

// 計算員工薪水
exports.EmployeeSalaryCount = function()
{
  var daily_salary,workPeriod,onlineTime,offlineTime;
  // db.collection('WorkHour').find().toArray(function(err, results) {
  dbwork.collection('workperiod').find().toArray(function(err, results) {
      // console.log('results=',results);
      for(var i=0; i<results.length; i++)
      {  
        hour_checkout = 0;
        minute_checkout = 0;
        daily_salary = 0;
        workPeriod = 0;
        for(var j=i+1; j<results.length; j++)
        {  
          if( (results[j].name == results[i].name) && (results[j].Year == results[i].Year) && (results[j].SalaryCountStatus == false)&& (results[j].SalaryCountStatus == false) &&
              (results[j].Month == results[i].Month)&& (results[j].Day == results[i].Day) && (results[j].status == '下班') && (results[i].status == '上班') )
            {
              onlineTime = results[i].Year+'/'+results[i].Month+'/'+results[i].Day+" "+results[i].Hour+':'+results[i].Minute;
              offlineTime = results[j].Year+'/'+results[j].Month+'/'+results[j].Day+" "+results[j].Hour+':'+results[j].Minute;
              workPeriod = (parseInt(results[j].Hour,10)*60+parseInt(results[j].Minute,10))-(parseInt(results[i].Hour,10)*60+parseInt(results[i].Minute,10));
              dailySalary = Math.round(workPeriod*133/60, 10);
              dbwork.collection('CountSalary').save({TID:Date.now(),uniID:results[i].uniID,name:results[i].name,onlineTiming:onlineTime,offLineTiming:offlineTime,WorkPeriod:workPeriod,DailySalary:dailySalary},function(err,result){
              //db.collection('CountSalary').save({uniID:Date.now(),name:results[i].name,UserBrandTitle:results[i].UserBrandTitle,UserBrandName:results[i].UserBrandName,UserBrandPlace:results[i].UserBrandPlace,onlineTiming:onlineTime,offLineTiming:offlineTime,WorkPeriod:workPeriod,DailySalary:dailySalary},function(err,result){
                if(err)return console.log(err);
              });
              dbwork.collection('workperiod').findOneAndUpdate({TID:parseInt(results[i].TID,10)},{
              //db.collection('WorkHour').findOneAndUpdate({uniID:parseInt(results[i].uniID,10)},{ 
                $set: 
                {
                  SalaryCountStatus: true,
                }
              },{
                  upsert: false
              },(err, result) => {
                if (err) return res.send(err)
              });
              //db.collection('WorkHour').findOneAndUpdate({uniID:parseInt(results[j].uniID,10)},{
              dbwork.collection('workperiod').findOneAndUpdate({TID:parseInt(results[j].TID,10)},{
                $set: 
                {
                  SalaryCountStatus: true,
                }
              },{
                  upsert: false
              },(err, result) => {
                if (err) return res.send(err)
              });            
            }          
        }
    
      }
  });
}

exports.DeleteUserData = function(_UniqueID,_DeleteType)
{
  if(_DeleteType == 'Setting')
  {
    dbwork.collection('workperiod').findOneAndDelete({TID:parseInt(_UniqueID,10)},
    (err, result) => {
      if (err) return res.send(500, err);
    })
  }
  else if(_DeleteType == 'Salary')
  {
    dbwork.collection('CountSalary').findOneAndDelete({TID:parseInt(_UniqueID,10)},
      (err, result) => {
        if (err) return res.send(500, err);
      })
  }

}

exports.UpdateUserData = function(_UniqueID,_UpdateHour,_UpdateMinute,_UpdateDay,_UpdateMonth)
{ 
  console.log('_UniqueID=',_UniqueID);
  console.log('_UpdateHour=',_UpdateHour);
  console.log('_UpdateMinute=',_UpdateMinute);
  dbwork.collection('workperiod').findOneAndUpdate({TID:parseInt(_UniqueID,10)},{
    $set: 
    {
      Hour: _UpdateHour,
      Minute:_UpdateMinute,
      Day:_UpdateDay,
      Month:_UpdateMonth

    }
  },{
      sort: {_id: -1},
      upsert: false
  },(err, result) => {
    if (err) return res.send(err)
  });
}

