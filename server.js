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


var 小香職稱 = '兼職'; var 小香上班店名 = '滴果'; var 小香上班位置 = '中山';
var 竹竹職稱 = '兼職'; var 竹竹上班店名 = '滴果'; var 竹竹上班位置 = '中山';
var 藝芳職稱 = '兼職'; var 藝芳上班店名 = '滴果'; var 藝芳上班位置 = '中山';
var 蓁蓁職稱 = '兼職'; var 蓁蓁上班店名 = '滴果'; var 蓁蓁上班位置 = '中山';
var 芸賢職稱 = '兼職'; var 芸賢上班店名 = '滴果'; var 芸賢上班位置 = '中山';



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
            //console.info('The promise was fulfilled with items!', items);
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

app.get('/LoginCheck/',function(req,res){
  console.log('req.query.UserName = ',req.query.UserName);
  dbtoken.collection('usertokenrelatedinformationcollection').find({'name':'林晉安'}).toArray(function(err, results) {
    json = { 'status':{'code':'success'},'data':results};
    var SendDataToPhone = JSON.stringify(json); res.type('application/json'); res.send(SendDataToPhone);
  });
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

app.post('/AddUserTokenRelatedInformationBridge/',function(req,res){
    var deviceID = req.body.deviceid;var UserToken = req.body.usertoken;var namePass = req.body.username;var statusPass = req.body.status;
    var brandTitle = req.body.brandtitle;var brandName = req.body.brandname;var brandPlace = req.body.brandplace;
    SettingPage.AddUserTokenRelatedInformationFunction(deviceID,UserToken,namePass,statusPass,brandTitle,brandName,brandPlace);
    res.redirect('/');
});

//========================================================================================

app.get('/jeffonline/',function(req,res){
  var namePass = '阿廣'; var statusPass = '上班'; brandTitle = 阿廣職稱 ; brandName = 阿廣上班店名; brandPlace = 阿廣上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/jeffoffline/',function(req,res){
  var namePass = '阿廣'; var statusPass = '下班'; brandTitle = 阿廣職稱 ; brandName = 阿廣上班店名; brandPlace = 阿廣上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/stephyonline/',function(req,res){
  var namePass = '小香'; var statusPass = '上班'; brandTitle = 小香職稱 ; brandName = 小香上班店名; brandPlace = 小香上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/stephyoffline/',function(req,res){
  var namePass = '小香'; var statusPass = '下班';  brandTitle = 小香職稱 ; brandName = 小香上班店名; brandPlace = 小香上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/joyceonline/',function(req,res){
  var namePass = '竹竹'; var statusPass = '上班';   brandTitle = 竹竹職稱 ; brandName = 竹竹上班店名; brandPlace = 竹竹上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/joyceoffline/',function(req,res){
  var namePass = '竹竹'; var statusPass = '下班';   brandTitle = 竹竹職稱 ; brandName = 竹竹上班店名; brandPlace = 竹竹上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/yvonneonline/',function(req,res){
  var namePass = '藝芳'; var statusPass = '上班';  brandTitle = 藝芳職稱 ; brandName = 藝芳上班店名; brandPlace = 藝芳上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/yvonneoffline/',function(req,res){
  var namePass = '藝芳'; var statusPass = '下班';  brandTitle = 藝芳職稱 ; brandName = 藝芳上班店名; brandPlace = 藝芳上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});


app.get('/janeonline/',function(req,res){
  var namePass = '蓁蓁'; var statusPass = '上班';  brandTitle = 蓁蓁職稱 ; brandName = 蓁蓁上班店名; brandPlace = 蓁蓁上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/janeoffline/',function(req,res){
  var namePass = '蓁蓁'; var statusPass = '下班';  brandTitle = 蓁蓁職稱 ; brandName = 蓁蓁上班店名; brandPlace = 蓁蓁上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/yunonline/',function(req,res){
  var namePass = '芸賢'; var statusPass = '上班'; brandTitle = 芸賢職稱 ; brandName = 芸賢上班店名; brandPlace = 芸賢上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/yunoffline/',function(req,res){
  var namePass = '芸賢'; var statusPass = '下班';  brandTitle = 芸賢職稱 ; brandName = 芸賢上班店名; brandPlace = 芸賢上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});
