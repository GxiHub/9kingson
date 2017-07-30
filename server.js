express = require('express');
bodyParser = require('body-parser');
MongoClient = require('mongodb').MongoClient;
path = require('path');
moment = require('moment');

app = express();

//app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({extended:true}));

SettingPage= require('./setting');
var sleep = require('system-sleep');

var db;
MongoClient.connect('mongodb://mushi:mushi@ds137090.mlab.com:37090/mushi_work_hour', function(err, database){ 
  if (err) return console.log(err);
  db = database;
  app.listen(8080, function(){
    console.log('listening on 8080');
  })
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

app.get('/',function(req,res){
  res.render('index.ejs');
});

//透過手機端掃描二維條碼，並添加個人上下班時間
app.get('/GetTokenToServer/',function(req,res){
    //body = Object.assign({}, results); 
    console.log('req.headers.contenttype = ',req.headers['content-type']);console.log('req.headers.language = ',req.headers['accept-language']);console.log('req.headers.deviceid = ',req.headers['deviceid']);console.log('req.query.usertoken = ',req.query.usertoken);
    
    SettingPage.CheckDeviceIDAndToken(req.headers['deviceid'],req.query.usertoken).then(function(items) 
    {
            if(items != null)
            {
                    SettingPage.EmployeeWorkTimeAndStatus(items.uniID,items.name,items.status);
                    var body = {'status':{'code':'S0000','msg':items.status}};
                    console.log(' DeviceID is ',items.deviceid, ' and ',items.name,' is ',items.status);          
            }
            else
            {
                    var body = {'status':{'code':'E0001','msg':'DeviceID or Token is incorrect'}};
            }
            body = JSON.stringify(body); res.type('application/json'); res.send(body);

        }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });  
});

//透過帳號與密碼比對資料庫，若正確則返回一組 token
app.get('/FisrtLoginAndReturnMemberToken/',function(req,res){
  dbtoken.collection('memberinformationcollection').findOne({'account':req.headers['account'],"password":req.headers['password']},function(err, results) {
    if(results==null){ json = { 'status':{'code':'E0002','msg':'帳號或密碼有錯，請重新輸入'},'data':results}; }
    else{ json = { 'status':{'code':'S0000','msg':'帳號密碼正確'},'data':results.uniID};}
        var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
  });
});

//透過UID比對資料庫，若正確則返回一組 token
app.get('/GetMemberBrandInformation/',function(req,res){
  dbtoken.collection('memberbrandinformation').find({'uniID':req.headers['uniid']},{_id:0,uniID:0,name:0}).toArray(function(err, results) {
    if(results==null){ json = { 'status':{'code':'E0003','msg':'唯一碼有錯，請重新輸入'},'data':results}; }
    else{ json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'data':results};}
        var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
  });
});

// 傳遞 uniID 當作索引來查詢員工姓名，再查詢出員工上班狀況
app.get('/QueryPersonalSalaryList/',function(req,res){
    var month = req.headers['month'];
    //if(month[0]==0){month=month[1];}
    var year = req.headers['year'];
    var b=year+'/'+month;
    console.log(' req.headers[uniid] = ',req.headers['uniid']);
    SettingPage.GetUniIDAndUseItAsQueryParameter(req.headers['uniid']).then(function(items) 
    {
            if(items != null)
            {
                    console.log(' items.name = ',items.name);
                    dbwork.collection('workperiod').find({'name':items.name,'Year':year,'Month':month},{_id:0,TID:0,uniID:0,SalaryCountStatus:0,addworkstatus:0,extrainfo1:0,extrainfo2:0}).toArray(function(err, results) {                
                      var count = 0;while(results[count]!=null){ count++;}console.log(' count = ',count);
                      var jsonArray = [];
                      //console.log(' results = ',results[0].name);
                      for(var i = 0;i<count;i++)
                      {
                          var onlineTime = results[i].Year+'/'+results[i].Month+'/'+results[i].Day+' '+results[i].Hour+':'+results[i].Minute;
                          // console.log(' onlineTime = ',onlineTime);
                          // console.log(' results.name = ',results[i].status);
                          jsonArray.push({'WorkTime':onlineTime,'status':results[i].status});
                      }
                      json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'data':jsonArray};
                      var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
                    });           
            }
            else
            {
                    var body = {'status':{'code':'E0004','msg':'唯一碼有錯，請重新輸入'}};
                    console.log('  WithErrorUniID'); 
                    body = JSON.stringify(body); res.type('application/json'); res.send(body);
            }
        }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });  
});

// 查詢員工單月薪水資訊
app.get('/GetMonthlySalaryForEachEmployee/',function(req,res){
  var month = req.headers['month'];
  // if(month[0]==0){month=month[1];}
  var year = req.headers['year'];
  var b=year+'/'+month;
  dbwork.collection('monthlysalaryinformation').find({'uniID':req.headers['uniid'],'monthperiod':new RegExp(b)},{_id:0,TID:0,uniID:0}).toArray(function(err, results) {
    if(results==null){ json = { 'status':{'code':'E0005','msg':'唯一碼有錯，請重新輸入'},'data':results}; }
    else{ json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'data':results};}
        var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
  });
});

// 查詢員工單月上班情形
app.get('/GetMonthlyEmployeeWorkSchedule/',function(req,res){
  var arraylength = 0;
  var month = req.headers['month'];
  var year = req.headers['year'];

  if(month == 01 || month == 03 || month == 05 || month == 07 || month == 08 || month == 10 || month == 12){ arraylength = 31; }
  else if(month == 02){ arraylength = 28; }
  else { arraylength = 30; }

    SettingPage.PromiseGetMonthSalaryOrHourSalary(req.headers['uniid']).then(function(items) 
    {
        dbwork.collection('employeeworkschedule').find({'userbrandname':items.userbrandname,'userbrandplace':items.userbrandplace,'workyear':year,'workmonth':month},{_id:0,TID:0,uniID:0,userbrandname:0,userbrandplace:0,onlinehour:0,onlineminute:0,offlinehour:0,offlineminute:0}).toArray(function(err, results) {
           var count = 0;var arr =[];var jsonArray = [];
           for( var i = 0; i<arraylength; i++ ) {
              var day = i + 1;
              arr.push([]);
           }
           while(results[count]!=null)
           {  
              var indexleft = parseInt(results[count].workday,10)-1;
              var indexright = results[count].name;
              arr[indexleft].push(results[count].name);
              count++;
           }   
           for( var i = 0; i<arraylength; i++ ) {
               var day = i + 1; 
               var date = month+'/'+day;
               jsonArray.push({'Date':date,'Employee':arr[i]});
           }  
           results = jsonArray;

           if(results==null){ json = { 'status':{'code':'E0006','msg':'唯一碼有錯，請重新輸入'},'data':results}; }
           else{ json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'data':results};}
           var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
        });
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });  
});

//查詢佈告欄
app.get('/GetManageNews/',function(req,res){
   console.log(' GetManageNews ');
    SettingPage.PromiseGetMonthSalaryOrHourSalary(req.headers['uniid']).then(function(items) 
    {
        console.log(' items.userbrandname = ',items.userbrandname);
        console.log(' items.userbrandplace = ',items.userbrandplace);
        dbwork.collection('managenews').find({'userbrandname':items.userbrandname,'userbrandplace':items.userbrandplace},{_id:0,TID:0,userbrandname:0,userbrandplace:0}).toArray(function(err, results) {
           if(results==null){ json = { 'status':{'code':'E0007','msg':'唯一碼有錯，請重新輸入'},'data':results}; }
           else{ json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'data':results};}
           var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
        });
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });  
});

// 查詢單日員工上班細項
app.get('/GetSingleDayWorkScheduleDetail/',function(req,res){
  var month = req.headers['month'];
  //if(month[0]==0){month=month[1];}
  var year = req.headers['year'];
  var day = req.headers['day'];
  //if(day[0]==0){day=day[1];}

    SettingPage.PromiseGetMonthSalaryOrHourSalary(req.headers['uniid']).then(function(items) 
    {
        dbwork.collection('employeeworkschedule').find({'userbrandname':items.userbrandname,'userbrandplace':items.userbrandplace,'workyear':year,'workmonth':month,'workday':day},{_id:0,TID:0,uniID:0,userbrandname:0,userbrandplace:0}).toArray(function(err, results) {
           var count = 0;while(results[count]!=null){ count++;}console.log(' count = ',count);
           var jsonArray = [];

           for(var i = 0;i<count;i++)
           {
              var onlineTime = results[i].workyear+'/'+results[i].workmonth+'/'+results[i].workday+' '+results[i].onlinehour+':'+results[i].onlineminute+'-'+results[i].offlinehour+':'+results[i].offlineminute;
              // console.log(' onlineTime = ',onlineTime);
              // console.log(' results.name = ',results[i].status);
              jsonArray.push({'name':results[i].name,'WorkTime':onlineTime,'status':results[i].status});
           }
          
           if(results==null){ json = { 'status':{'code':'E0008','msg':'唯一碼有錯，請重新輸入'},'data':jsonArray}; }
           else{ json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'data':jsonArray};}
           var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
        });
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });  
});

// 如果需要透過網頁設定的話可以使用 req.body，如果要透過 postman 就要使用 req.query
app.post('/AddUserTokenRelatedInformationBridge/',function(req,res){
    // var deviceID = req.body.deviceid;var UserToken = req.body.usertoken;var namePass = req.body.username;var statusPass = req.body.status;
    var onlyID = req.query.onlyid;var deviceID = req.query.deviceid;var UserToken = req.query.usertoken;var namePass = req.query.username;var statusPass = req.query.status;
    SettingPage.AddUserTokenRelatedInformationFunction(onlyID,deviceID,UserToken,namePass,statusPass);
});

// 透過postman新增會員資料
app.post('/AddMemberInformationFunction/',function(req,res){
    var namePass = req.query.username;var account = req.query.account;var password = req.query.password;
    SettingPage.AddMemberInformationFunction(namePass,account,password);
});

// 透過postman新增會員品牌店務資料
app.post('/AddMemberBrandInformation/',function(req,res){
    var uniID = req.query.uniID;var namePass = req.query.username;var userBrandtitle = req.query.userbrandtitle;var userBrandname = req.query.userbrandname;var userBrandplace = req.query.userbrandplace;var monthsalary = req.query.monthsalary;var hoursalary = req.query.hoursalary;
    SettingPage.AddMemberBrandInformation(uniID,namePass,userBrandtitle,userBrandname,userBrandplace,monthsalary,hoursalary);
});

app.post('/AddEmployeeWorkSchedule/',function(req,res){
    console.log(' req.body.checkName = ',req.body.checkName);
    //SettingPage.PromiseGetBrandInfo(req.headers['name']).then(function(items) 
    SettingPage.PromiseGetBrandInfo(req.body.checkName).then(function(items) 
    {
      console.log(' DeviceID is ',items.userbrandname, ' and ',items.uniID); 
      SettingPage.AddEmployeeWorkSchedule(items.uniID,items.userbrandname,items.userbrandplace,req.body.checkName,req.body.checkPeriodYear,req.body.checkPeriodMonth,req.body.checkPeriodDay,req.body.checkPeriodOnlineHour,req.body.checkPeriodOnlineMinute,req.body.checkPeriodOfflineHour,req.body.checkPeriodOffineMinute);
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });  
    res.redirect('/');
});

// 透過postman新增單店公告
app.get('/AddManageNews/',function(req,res){
    var news = req.headers['news'];
    SettingPage.PromiseGetMonthSalaryOrHourSalary(req.headers['uniid']).then(function(items) 
    {
      console.log(' item is ',items.userbrandname, ' and ',items.userbrandplace,  ' and ',news); 
      SettingPage.AddManageNews(news,items.name,items.userbrandname,items.userbrandplace);
    }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });  
    res.redirect('/');
});

app.get('/CalculateMonthlySalaryForEachEmployee/',function(req,res){
    console.log(' req.headers[uniid] = ',req.headers['uniid']);
    var month = '6';
    var year = '2017';
    var b=year+'/'+month;
    SettingPage.PromiseGetMonthSalaryOrHourSalary(req.headers['uniid']).then(function(items) 
    {
            if(items != null)
            {
                    //console.log(' items = ',items);
                    dbwork.collection('CountSalary').find({'name':items.name,'onlineTiming':new RegExp(b)},{_id:0,TID:0,uniID:0,onlineTiming:0,offLineTiming:0,DailySalary:0,name:0}).toArray(function(err, results) {
                            var count = 0 ; var totalSalary = 0;var OverWorkTime = 0; var LateWorkTime = 0;var ExtraBonus = 0; var SpecialBonus = 0;
                            while(results[count]!=null)
                            {  
                              totalSalary = totalSalary + parseInt(results[count].WorkPeriod,10);
                              count++;
                            }
                            var CalculateMonth = parseInt(items.userhoursalary,10) * totalSalary / 60;
                            var FinalSalary = parseInt(CalculateMonth,10) - OverWorkTime - LateWorkTime + ExtraBonus + SpecialBonus;                          
                            SettingPage.AddEmployeeMonthlySalaryInformation(req.headers['uniid'],b,items.name,items.userbrandtitle,parseInt(CalculateMonth,10),OverWorkTime,LateWorkTime,ExtraBonus,SpecialBonus,FinalSalary);
                    });           
            }
        }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    }); 
    res.send('Calculate Monthly Salary');
});

app.post('/CheckSalaryPeriod/',function(req,res){
  dbwork.collection('CountSalary').find().toArray(function(err, results) {
      res.render('CheckSalaryPage.ejs',{SalaryList:results,PeriodYear:req.body.checkPeriodYear,PeriodMonth:req.body.checkPeriodMonth,CheckName:req.body.checkName});
  });
});

app.get('/DirectPageToAddEmployeeWorkSchedule/',function(req,res){
    res.render('AddEmployeeWorkSchedule.ejs');
});

app.get('/AdjustOnlineStatus/',function(req,res){
  dbwork.collection('workperiod').find().toArray(function(err, results) {
      res.render('AdjustOnlineStatus.ejs',{WorkHour:results});
  });
});

app.get('/AdjustWorkSchedule/',function(req,res){
  dbwork.collection('employeeworkschedule').find().toArray(function(err, results) {
      res.render('AdjustWorkSchedule.ejs',{WorkHour:results});
  });
});

app.get('/SalaryCount/',function(req,res){
  SettingPage.EmployeeSalaryCount();
});

app.post('/CheckEmployeeWorkSchedule/',function(req,res){
  var month = req.body.checkPeriodMonth;
  var year = req.body.checkPeriodYear;
  var arraylength = 0;

  if(month == null){  
      year = moment().format('YYYY');
      month = moment().format('MM');
  }
// console.log(' year = ',year);
// console.log(' month = ',month);
  if(month == '01' || month == '03' || month == '05' || month == '07' || month == '08' || month == '10' || month == '12'){ arraylength = 31; }
  else if(month == '02'){ arraylength = 28; }
  else { arraylength = 31; }
 
  dbwork.collection('employeeworkschedule').find({'workyear':year,'workmonth':month}).toArray(function(err, results) {
           var count = 0;var arr =[];
           for( var i = 0; i<arraylength; i++ ) {
              var day = i + 1;
              arr.push([]);
           }
           while(results[count]!=null)
           {  
              var indexleft = parseInt(results[count].workday,10)-1;
              var indexright = results[count].name+' '+results[count].onlinehour+':'+results[count].onlineminute+'-'+results[count].offlinehour+':'+results[count].offlineminute;
              arr[indexleft].push(indexright);
              count++;
           }     
           // console.log(' arr = ',arr);
           results = arr;
    res.render('CheckWorkSchedule.ejs',{WorkSchedule:results,MonthPass:month});
  });
});

app.post('/CheckEveryDayWorkStatus/',function(req,res){
    var month = req.body.checkPeriodMonth;
    var year = req.body.checkPeriodYear;
    var day = req.body.checkPeriodDay;
    console.log(' year = ',year);
    console.log(' month = ',month);
    console.log(' day = ',day);
    dbwork.collection('workperiod').find({'Year':year,'Month':month,'Day':day}).toArray(function(err, results) {
          res.render('CheckEveryDayWorkStatus.ejs',{passvariable:results});
    });
});

app.post('/CheckEveryMonthWorkStatus/',function(req,res){
    var month = req.body.checkPeriodMonth;
    var year = req.body.checkPeriodYear;
    var b=year+'/'+month;
    console.log(' year = ',year);
    console.log(' month = ',month);
    console.log(' req.body.checkName  = ',req.body.checkName );
    if(req.body.checkName == '全部')
    {
      dbwork.collection('workperiod').find({'Year':year,'Month':month}).toArray(function(err, results) {
          res.render('CheckEveryMonthWorkStatus.ejs',{passvariable:results});
      });
    }
    else
    {
      dbwork.collection('workperiod').find({'name':req.body.checkName,'Year':year,'Month':month}).toArray(function(err, results) {
          res.render('CheckEveryMonthWorkStatus.ejs',{passvariable:results});
      });
    }
});

app.post('/update/', (req, res) => {
  SettingPage.UpdateUserData(req.body.TID,req.body.updathour,req.body.updateminute,req.body.updateday,req.body.updatemonth);
  sleep(1.5);
  res.redirect('/AdjustOnlineStatus/');
});

app.post('/delete/', (req, res) => {
  SettingPage.DeleteUserData(req.body.TID);
  sleep(2);
  res.redirect('/AdjustOnlineStatus/');    
});

app.post('/DeleteWorkScheduleData/', (req, res) => {
  SettingPage.DeleteWorkSchdeule(req.body.TID);
  sleep(2);
  res.redirect('/AdjustWorkSchedule/');    
});
