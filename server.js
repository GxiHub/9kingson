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
    console.log('req.headers.contenttype = ',req.headers['content-type']);console.log('req.headers.language = ',req.headers['accept-language']);console.log('req.headers.deviceid = ',req.headers['deviceid']);console.log('req.query.usertoken = ',req.headers['usertoken']);
    
    SettingPage.CheckDeviceIDAndToken(req.headers['deviceid'],req.headers['usertoken']).then(function(items) 
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

//透過帳號與密碼比對資料庫，若正確則返回一組 token
app.get('/GetMemberBrandInformation/',function(req,res){
  dbtoken.collection('memberbrandinformation').find({'uniID':req.headers['uniid']},{_id:0,uniID:0,name:0}).toArray(function(err, results) {
    if(results==null){ json = { 'status':{'code':'E0003','msg':'唯一碼有錯，請重新輸入'},'data':results}; }
    else{ json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'data':results};}
        var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
  });
});


// 傳遞 uniID 當作索引來查詢員工姓名，再查詢出員工上班狀況
app.get('/QueryPersonalSalaryList/',function(req,res){
    console.log(' req.headers[uniid] = ',req.headers['uniid']);
    SettingPage.GetUniIDAndUseItAsQueryParameter(req.headers['uniid']).then(function(items) 
    {
            if(items != null)
            {
                    console.log(' items.name = ',items.name);
                    dbwork.collection('CountSalary').find({'name':items.name},{_id:0,TID:0,uniID:0,name:0}).toArray(function(err, results) {
                      json = { 'status':{'code':'S0000','msg':'唯一碼正確'},'data':results};
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
    var uniID = req.query.uniID;var namePass = req.query.username;var userBrandtitle = req.query.userbrandtitle;var userBrandname = req.query.userbrandname;var userBrandplace = req.query.userbrandplace;
    SettingPage.AddMemberBrandInformation(uniID,namePass,userBrandtitle,userBrandname,userBrandplace);
});

// 檢查上班情形
app.get('/CheckSettingInformation/',function(req,res){
  // console.log('req.query.UserName = ',req.query.UserName);
  var a='6';
  //db.collection.find( { field: { $gt: value1, $lt: value2 } } );city: { $in:['NEW YORK'] } 
  dbwork.collection('CountSalary').find({'onlineTiming':new RegExp(a),'name':'小香'},{_id:0,uniID:0,deviceid:0}).toArray(function(err, results) {
    json = { 'status':{'code':'success'},'data':results};
    var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
  });
});

app.post('/CheckSalaryPeriod/',function(req,res){
  dbwork.collection('CountSalary').find().toArray(function(err, results) {
      res.render('CheckSalaryPage.ejs',{SalaryList:results,PeriodYear:req.body.checkPeriodYear,PeriodMonth:req.body.checkPeriodMonth,CheckName:req.body.checkName});
  });
});

app.get('/Setting/',function(req,res){
  dbwork.collection('workperiod').find().toArray(function(err, results) {
      res.render('SettingPage.ejs',{WorkHour:results});
  });
});

app.get('/SalaryCount/',function(req,res){
  SettingPage.EmployeeSalaryCount();
});

app.post('/update/', (req, res) => {
  SettingPage.UpdateUserData(req.body.TID,req.body.updathour,req.body.updateminute,req.body.updateday,req.body.updatemonth);
  sleep(1.5);
  res.redirect('/Setting/');
});

app.post('/delete/', (req, res) => {
  SettingPage.DeleteUserData(req.body.TID,req.body.DeleteType);
  sleep(1);
  if(req.body.DeleteType == 'Setting')
  {
    res.redirect('/Setting/');    
  }
  else 
  {
    res.redirect('/');
  }
});





