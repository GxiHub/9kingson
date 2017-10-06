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


// 新增每個月員工新水資訊
exports.AddEmployeeMonthlySalaryInformation = function(OnlyID,YearMonth,UserName,UserBrandTitle,CalculateMonth,OverWorkTime,LateWorkTime,ExtraBonus,SpecialBonus,TotalMonthSalaty)
{
  dbwork.collection('monthlysalaryinformation').save({TID:Date.now(),monthperiod:YearMonth,uniID:OnlyID,name:UserName,userbrandtitle:UserBrandTitle,calculatemonth:CalculateMonth,overworktime:OverWorkTime,lateworktime:LateWorkTime,extrabonus:ExtraBonus,specialbonus:SpecialBonus,totalmonthsalaty:TotalMonthSalaty},function(err,result){
     if(err)return console.log(err);
  });
}

// 新增員工上班時數
exports.AddEmployeeWorkSchedule = function(UniID,Brand,Place,UserName,checkPeriodYear,checkPeriodMonth,checkPeriodDay,checkPeriodOnlineHour,checkPeriodOnlineMinute,checkPeriodOfflineHour,checkPeriodOfflineMinute)
{
  dbwork.collection('employeeworkschedule').save({TID:Date.now(),uniID:UniID,userbrandname:Brand,userbrandplace:Place,name:UserName,workyear:checkPeriodYear,workmonth:checkPeriodMonth,workday:checkPeriodDay,onlinehour:checkPeriodOnlineHour,onlineminute:checkPeriodOnlineMinute,offlinehour:checkPeriodOfflineHour,offlineminute:checkPeriodOfflineMinute},function(err,result){
     if(err)return console.log(err);
  });
}

// 新增單店公告
exports.AddManageNews = function(News,Name,Brand,Place)
{
  var Work_Year = moment().format('YYYY');
  var Work_Month = moment().format('MM');
  var Work_Day = moment().format('DD');
  var Time = Work_Year+'/'+Work_Month+'/'+Work_Day;
  dbwork.collection('managenews').save({TID:Date.now(),news:News,name:Name,publishtime:Time,userbrandname:Brand,userbrandplace:Place},function(err,result){
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
  var intWorkHour = parseInt(Work_Hour,10)+8;
  if(intWorkHour>23)
  {
    intWorkHour=intWorkHour-24;
    if(intWorkHour<10){ intWorkHour = '0'+intWorkHour;}
  }
  Work_Hour = intWorkHour;
  console.log( 'Work_Hour = ',Work_Hour);
  var Work_Minute = moment().format('mm');
  var SalaryStatus = false;
  dbwork.collection('workperiod').save({TID:Date.now(),uniID:OnlyID,name:UserName,status:WorkStatus,Year:Work_Year,Month:Work_Month,Day:Work_Day,Hour:Work_Hour,Minute:Work_Minute,SalaryCountStatus:SalaryStatus,addworkstatus:'0',extrainfo1:'0',extrainfo2:'0'},function(err,result){
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
exports.AddMemberBrandInformation = function(UniID,UserName,UserBrandtitle,UserBrandname,UserBrandplace,UserMonthSalary,UserFoodSalary,UserWithoutSalary,UserTitleSalary,UserExtraSalary,UserLawSalary,UserFirstArrival)
{
  dbtoken.collection('memberbrandinformation').save({uniID:UniID,name:UserName,userbrandtitle:UserBrandtitle,userbrandname:UserBrandname,userbrandplace:UserBrandplace,usermonthsalary:UserMonthSalary,userFoodsalary:UserFoodSalary,userwithoutsalary:UserWithoutSalary,usertitlesalary:UserTitleSalary,userextrasalary:UserExtraSalary,userlawsalary:UserLawSalary,userfirstarrival:UserFirstArrival},function(err,result){
    if(err)return console.log(err);
  });
}

// 若是要使用uniID當作查詢索引，需要透過 parseInt 來把變數變成int
exports.GetUniIDAndUseItAsQueryParameter = function(UniID)
{
      console.log( 'GetUniIDAndUseItAsQueryParameter->UniID = ',UniID);
      return new Promise(function(resolve,reject)
      {
          var collection = dbtoken.collection('memberbrandinformation');
          collection.findOne({ uniID:UniID}, function(err, data ) 
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
      console.log( 'PromiseGetMonthSalaryOrHourSalary->PromiseUniID new= ',UniID);
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

exports.PromiseGetBrandInfo = function(Name)
{
      console.log( 'PromiseGetBrandInfo->Name = ',Name);
      return new Promise(function(resolve,reject)
      {
          var collection = dbtoken.collection('memberbrandinformation');
          collection.findOne({name:Name}, function(err, data ) 
          {
              if (err) { 
                  reject(err);
              } else {
                  resolve(data);
              }
          });
      }); 
}

// D1 function
exports.DeleteUserData = function(_UniqueID)
{
    dbwork.collection('workperiod').findOneAndDelete({TID:parseInt(_UniqueID,10)},
    (err, result) => {
      if (err) return res.send(500, err);
    });
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
// D2 function
exports.DeleteWorkSchdeule = function(_UniqueID)
{
    dbwork.collection('employeeworkschedule').findOneAndDelete({TID:parseInt(_UniqueID,10)},
    (err, result) => {
      if (err) return res.send(500, err);
    });
}



exports.updateUserInformationByTID = function(_UniqueID)
{ 
  dbwork.collection('workperiod').findOneAndUpdate({TID:parseInt(_UniqueID,10)},{
    $set: 
    {
      name: '羅鈺晴',
    }
  },{
      sort: {_id: -1},
      upsert: false
  },(err, result) => {
    if (err) return res.send(err)
  });
}

