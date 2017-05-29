MongoClient = require('mongodb').MongoClient;

var db;
MongoClient.connect('mongodb://mushi:mushi@ds137090.mlab.com:37090/mushi_work_hour', function(err, database){ 
  if (err) return console.log(err);
  db = database;
})

exports.DeleteUserData = function(_UniqueID,_DeleteType)
{
  if(_DeleteType == 'Setting')
  {
    db.collection('WorkHour').findOneAndDelete({uniID:parseInt(_UniqueID,10)},
    (err, result) => {
      if (err) return res.send(500, err);
    })
  }
  else if(_DeleteType == 'Salary')
  {
    db.collection('CountSalary').findOneAndDelete({uniID:parseInt(_UniqueID,10)},
      (err, result) => {
        if (err) return res.send(500, err);
      })
  }
  else if(_DeleteType == 'PurchaseList')
  {
    db.collection('PurchaseList').findOneAndDelete({uniID:parseInt(_UniqueID,10)},
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
  db.collection('WorkHour').findOneAndUpdate({uniID:parseInt(_UniqueID,10)},{
    $set: 
    {
      Hour: _UpdateHour,
      Minute:_UpdateMinute,
      Day:_UpdateDay,
      Month:_UpdateMonth

    }
  },{
      sort: {_id: -1},
      upsert: true
  },(err, result) => {
    if (err) return res.send(err)
  });
}

exports.EmployeeWorkTimeAndStatus = function(UserName,WorkStatus,BrandTitle,BrandName,BrandPlace)
{
  var Work_Year = moment().format('YYYY');
  var Work_Month = moment().format('MM');
  var Work_Day = moment().format('DD');
  var Work_Hour = moment().format('HH');
  var Work_Minute = moment().format('mm');
  var SalaryStatus = false;
  db.collection('WorkHour').save({uniID:Date.now(),name:UserName,UserBrandTitle:BrandTitle,UserBrandName:BrandName,UserBrandPlace:BrandPlace ,status:WorkStatus,Year:Work_Year,Month:Work_Month,Day:Work_Day,Hour:Work_Hour,Minute:Work_Minute,SalaryCountStatus:SalaryStatus},function(err,result){
    if(err)return console.log(err);
  });
}

exports.EmployeeSalaryCount = function()
{
  var daily_salary,workPeriod,onlineTime,offlineTime;
  db.collection('WorkHour').find().toArray(function(err, results) {
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

              db.collection('CountSalary').save({uniID:Date.now(),name:results[i].name,UserBrandTitle:results[i].UserBrandTitle,UserBrandName:results[i].UserBrandName,UserBrandPlace:results[i].UserBrandPlace,onlineTiming:onlineTime,offLineTiming:offlineTime,WorkPeriod:workPeriod,DailySalary:dailySalary},function(err,result){
                if(err)return console.log(err);
              });
              db.collection('WorkHour').findOneAndUpdate({uniID:parseInt(results[i].uniID,10)},{
                $set: 
                {
                  SalaryCountStatus: true,
                }
              },{
                  upsert: false
              },(err, result) => {
                if (err) return res.send(err)
              });
              db.collection('WorkHour').findOneAndUpdate({uniID:parseInt(results[j].uniID,10)},{
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

exports.AddPurchaseItem = function(ProductName,ProductClasee,ProductUnit,ProductPrice,ProductNote,ProductAmount)
{
  var PurchaseYear = moment().format('YYYY');
  var PurchaseMonth = moment().format('MM');
  var PurchaseDay = moment().format('DD');
  var PurchaseTotal = parseInt(ProductPrice,10) * parseInt(ProductAmount,10) ;
  var MainTag=0 , SecondTag=0 , ThirdTag=0 ,FouthTag=0 ;
  console.log('ProductAmount=',ProductAmount);
  db.collection('PurchaseList').save({uniID:Date.now(),productname:ProductName,productclass:ProductClasee,productunit:ProductUnit,productamount:ProductAmount,productprice:ProductPrice,producttotal:PurchaseTotal,productnote:ProductNote,Year:PurchaseYear,Month:PurchaseMonth,Day:PurchaseDay,maintag:MainTag,secondtag:SecondTag,thirdtag:ThirdTag,fouthtag:FouthTag},function(err,result){
    if(err)return console.log(err);
  });
}