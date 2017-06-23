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

app.get('/',function(req,res){
  res.render('index.ejs');
});

app.get('/GetTokenToServer/',function(req,res){
    //body = Object.assign({}, results); 
    console.log('req.headers.contenttype = ',req.headers['content-type']);console.log('req.headers.language = ',req.headers['accept-language']);console.log('req.headers.deviceid = ',req.headers['deviceid']);console.log('req.query.usertoken = ',req.query.usertoken);
    
    SettingPage.CheckDeviceIDAndToken(req.headers['deviceid'],req.query.usertoken).then(function(items) 
    {
            if(items != null)
            {
                    SettingPage.EmployeeWorkTimeAndStatus(items.name,items.status,items.UserBrandTitle,items.UserBrandName,items.UserBrandPlace);
                    var body = {'status':{'code':'success','msg':items.status}};
                    console.log(' DeviceID is ',items.deviceid, ' and ',items.name,' is ',items.status);              
            }
            else
            {
                    var body = {'status':{'code':'fail','msg':'DeviceID or Token is incorrect'}};
                    console.log('  DeviceID or Token is incorrect '); 
            }
            body = JSON.stringify(body); res.type('application/json'); res.send(body);

        }, function(err) {
          console.error('The promise was rejected', err, err.stack);
    });  
});

app.get('/CheckSettingInformation/',function(req,res){
  console.log('req.query.UserName = ',req.query.UserName);
  dbtoken.collection('usertokenrelatedinformationcollection').find({'name':req.query.UserName}).toArray(function(err, results) {
    json = { 'status':{'code':'success'},'data':results};
    var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
  });
});

//透過帳號與密碼去比對資料庫，確認帳號密碼是否正確存在
app.get('/LoginCheck/',function(req,res){

  dbtoken.collection('memberinformationcollection').findOne({'account':req.headers['account'],"password":req.headers['password']},function(err, results) {
    if(results==null)
    { 
      json = { 'status':{'code':'fail','msg':'帳號或密碼有錯，請重新輸入'},'data':results}; 
    }
    else
    {
      if(results.UserBrandTitle == '店長')
      {
          dbtoken.collection('memberinformationcollection').find({'UserBrandName':results.UserBrandName}).toArray(function(err, results) {
            json = { 'status':{'code':'success','msg':'帳號密碼正確'},'data':results};
            var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
          });        
      }
      else 
      {
            json = { 'status':{'code':'success','msg':'帳號密碼正確'},'data':results};
            var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
      }
      
    }
  });
});

// 如果需要透過網頁設定的話可以使用 req.body，如果要透過 postman 就要使用 req.query
app.post('/AddUserTokenRelatedInformationBridge/',function(req,res){
    // var deviceID = req.body.deviceid;var UserToken = req.body.usertoken;var namePass = req.body.username;var statusPass = req.body.status;
    // var brandTitle = req.body.brandtitle;var brandName = req.body.brandname;var brandPlace = req.body.brandplace;
    var deviceID = req.query.deviceid;var UserToken = req.query.usertoken;var namePass = req.query.username;var statusPass = req.query.status;
    var brandTitle = req.query.brandtitle;var brandName = req.query.brandname;var brandPlace = req.query.brandplace;var account = req.query.account;var password = req.query.password;
    SettingPage.AddUserTokenRelatedInformationFunction(deviceID,UserToken,namePass,statusPass,brandTitle,brandName,brandPlace,account,password);
});

// 透過postman新增會員資料
app.post('/AddMemberInformationFunction/',function(req,res){
    var namePass = req.query.username;var brandTitle = req.query.brandtitle;var brandName = req.query.brandname;var brandPlace = req.query.brandplace;var account = req.query.account;var password = req.query.password;
    SettingPage.AddMemberInformationFunction(namePass,brandTitle,brandName,brandPlace,account,password);
});

app.post('/CheckWorkPeriod/',function(req,res){
  db.collection('WorkHour').find().toArray(function(err, results) {
      res.render('WorkHourPage.ejs',{WorkHour:results,PeriodYear:req.body.checkPeriodYear,PeriodMonth:req.body.checkPeriodMonth,CheckName:req.body.checkName});
  });
});

app.post('/CheckSalaryPeriod/',function(req,res){
  db.collection('CountSalary').find().toArray(function(err, results) {
      res.render('CheckSalaryPage.ejs',{SalaryList:results,PeriodYear:req.body.checkPeriodYear,PeriodMonth:req.body.checkPeriodMonth,CheckName:req.body.checkName});
  });
});

app.get('/Setting/',function(req,res){
  db.collection('WorkHour').find().toArray(function(err, results) {
      res.render('SettingPage.ejs',{WorkHour:results});
  });
});

app.get('/SalaryCount/',function(req,res){
  SettingPage.EmployeeSalaryCount();
  sleep(1);
  res.redirect('/');
});

app.post('/delete/', (req, res) => {
  SettingPage.DeleteUserData(req.body.UniqueID,req.body.DeleteType);
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

app.post('/update/', (req, res) => {
  SettingPage.UpdateUserData(req.body.UniqueID,req.body.updathour,req.body.updateminute,req.body.updateday,req.body.updatemonth);
  sleep(1);
  res.redirect('/Setting/');
});

//========================================================================================

app.post('/AddPurchaseItem/',function(req,res){
  console.log('req.body.addProductAmount=',req.body.addProductAmount);
  var productName = req.body.addProductName; var productClasee = req.body.addProductClass;var productUnit = req.body.addProductUnit ;var productPrice = req.body.addProductPrice;var productNote = req.body.addProductNote; var productAmount=req.body.addProductAmount;
  console.log('productAmount=',productAmount);
  SettingPage.AddPurchaseItem(productName,productClasee,productUnit,productPrice,productNote,productAmount);
  sleep(1.5);
  res.redirect('/');
});

app.post('/CheckPurchaseItem/',function(req,res){
  db.collection('PurchaseList').find().toArray(function(err, results) {
      res.render('CheckPurchaseList.ejs',{PurchaseList:results});
  });
});



