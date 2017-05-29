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


var 阿廣職稱 = '兼職'; var 阿廣上班店名 = '滴果'; var 阿廣上班位置 = '中山';
var 小香職稱 = '兼職'; var 小香上班店名 = '滴果'; var 小香上班位置 = '中山';
var 雲翔職稱 = '兼職'; var 雲翔上班店名 = '滴果'; var 雲翔上班位置 = '中山';
var 竹竹職稱 = '兼職'; var 竹竹上班店名 = '滴果'; var 竹竹上班位置 = '中山';
var 芳芳職稱 = '兼職'; var 芳芳上班店名 = '滴果'; var 芳芳上班位置 = '中山';
var 藝芳職稱 = '兼職'; var 藝芳上班店名 = '滴果'; var 藝芳上班位置 = '中山';
var 蓁蓁職稱 = '兼職'; var 蓁蓁上班店名 = '滴果'; var 蓁蓁上班位置 = '中山';


var 阿廣職稱 = '兼職'; var 阿廣上班店名 = '牧石'; var 阿廣上班位置 = '桃園';
var 小乖職稱 = '兼職'; var 小乖上班店名 = '牧石'; var 小乖上班位置 = '桃園';
var 士賢職稱 = '兼職'; var 士賢上班店名 = '牧石'; var 士賢上班位置 = '桃園';
var 小新職稱 = '兼職'; var 小新上班店名 = '牧石'; var 小新上班位置 = '桃園';
var 阿昌職稱 = '兼職'; var 阿昌上班店名 = '牧石'; var 阿昌上班位置 = '桃園';


var db;
MongoClient.connect('mongodb://mushi:mushi@ds137090.mlab.com:37090/mushi_work_hour', function(err, database){ 
  if (err) return console.log(err);
  db = database;
  app.listen(8080, function(){
    console.log('listening on 8080');
  })
})

app.get('/',function(req,res){
  res.render('index.ejs');
});

app.get('/GetTokenToServer/',function(req,res){
    //body = Object.assign({}, results); 
    console.log('req.headers.contenttype = ',req.headers['content-type']);
    console.log('req.headers.language = ',req.headers['accept-language']);
    console.log('req.headers.deviceid = ',req.headers['deviceid']);
    console.log('req.query.usertoken = ',req.query.usertoken);

    if (req.headers['deviceid'] == 'HT43ZWM00590') {

        if(req.query.usertoken == '3f7eff0a0763fc53b5531a1ff3f0789cc4cd0d63b330dc12551bbd339cae4e3e')
        {
          console.log(' phase1 ');
          var body = {'status':{'code':'success','msg':'上班'}};
        }
        else if(req.query.usertoken == 'efeca5e285669414cd49c417d0725f5969d29134b72be6e2853036db97d956d8')
        {
          console.log(' phase2 ');
          var body = {'status':{'code':'success','msg':'下班'}};
        }
        else
        {
          console.log(' phase3 ');
          var body = {'status':{'code':'fail','msg':'發生異常'}};
        }
        console.log(' phase4 ');
        body = JSON.stringify(body);
        res.type('application/json');
        res.send(body);
    }
    else
    {
        console.log(' phase5 ');
        res.status(404).send('Page Not found');
    }   
});

app.post('/PostTokenToServer/', (req, res) => {
        var body;
        console.log('req.body.deviceid = ',req.body.deviceid);
        if (req.body.deviceid == 'HT43ZWM00591') {
            body = {'name':'Jeff','status':'200'};
            body = JSON.stringify(body);
            res.type('application/json');
            res.send(body);
        }
        else
        {
            res.send(404)
        } 
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

app.get('/nickonline/',function(req,res){
  var namePass = '雲翔'; var statusPass = '上班';  brandTitle = 雲翔職稱 ; brandName = 雲翔上班店名; brandPlace = 雲翔上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/nickoffline/',function(req,res){
  var namePass = '雲翔'; var statusPass = '下班';   brandTitle = 雲翔職稱 ; brandName = 雲翔上班店名; brandPlace = 雲翔上班位置;
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

app.get('/tiffanyonline/',function(req,res){
  var namePass = '芳芳'; var statusPass = '上班';  brandTitle = 芳芳職稱 ; brandName = 芳芳上班店名; brandPlace = 芳芳上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/tiffanyoffline/',function(req,res){
  var namePass = '芳芳'; var statusPass = '下班';  brandTitle = 芳芳職稱 ; brandName = 芳芳上班店名; brandPlace = 芳芳上班位置;
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

app.get('/miconline/',function(req,res){
  var namePass = '小乖'; var statusPass = '上班'; brandTitle = 小乖職稱 ; brandName = 小乖上班店名; brandPlace = 小乖上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/micoffline/',function(req,res){
  var namePass = '小乖'; var statusPass = '下班';  brandTitle = 小乖職稱 ; brandName = 小乖上班店名; brandPlace = 小乖上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/samonline/',function(req,res){
  var namePass = '士賢'; var statusPass = '上班';  brandTitle = 士賢職稱 ; brandName = 士賢上班店名; brandPlace = 士賢上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/samoffline/',function(req,res){
  var namePass = '士賢'; var statusPass = '下班';   brandTitle = 士賢職稱 ; brandName = 士賢上班店名; brandPlace = 士賢上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/oswinonline/',function(req,res){
  var namePass = '小新'; var statusPass = '上班';   brandTitle = 小新職稱 ; brandName = 小新上班店名; brandPlace = 小新上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/oswinoffline/',function(req,res){
  var namePass = '小新'; var statusPass = '下班';   brandTitle = 小新職稱 ; brandName = 小新上班店名; brandPlace = 小新上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/audyonline/',function(req,res){
  var namePass = '阿昌'; var statusPass = '上班';  brandTitle = 阿昌職稱 ; brandName = 阿昌上班店名; brandPlace = 阿昌上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});

app.get('/audyoffline/',function(req,res){
  var namePass = '阿昌'; var statusPass = '下班';  brandTitle = 阿昌職稱 ; brandName = 阿昌上班店名; brandPlace = 阿昌上班位置;
  SettingPage.EmployeeWorkTimeAndStatus(namePass,statusPass,brandTitle,brandName,brandPlace);
  sleep(1.5);
  res.redirect('/');
});



  // console.log('req.body.checkPeriodYear =',req.body.checkPeriodYear);
  // console.log('req.body.checkPeriodMonth =',req.body.checkPeriodMonth);
  // console.log('req.body.checkName =',req.body.checkName);

  // console.log('req.body.UniqueID =',req.body.UniqueID);
  // console.log('req.body.updathour =',req.body.updathour);
  // console.log('req.body.updateminute =',req.body.updateminute);
  // console.log('req.body.updateday =',req.body.updateday);
  // console.log('req.body.updatemonth =',req.body.updatemonth);

  // console.log('req.body.UniqueID =',req.body.UniqueID);
  // console.log('req.body.DeleteType =',req.body.DeleteType);