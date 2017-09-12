// A1 .==========================================================================================
[index.js]
|----- 新增員工單日排班
       | FORM------SingleDirectPageToAddEmployeeWorkSchedule
               |
               [server.js]
               | APP.GET ------SingleDirectPageToAddEmployeeWorkSchedule
                      |
                      [AddEmployeeWorkSchedule.ejs]
                      | FORM -----AddEmployeeWorkSchedule
                            |
                            [server.js]
                            | APP.GET ------AddEmployeeWorkSchedule
                                            |
                                            [setting.js]
                                            |-----SettingPage.PromiseGetBrandInfo
                                                  |-> item.brandname
                                                  |-> item.uniID
                                                  |-----SettingPage.AddEmployeeWorkSchedule
                                                        |-> items.uniID,
                                                        |-> items.userbrandname
                                                        |-> items.userbrandplace
                                                        |-> req.body.checkName
                                                        |-> req.body.checkPeriodYear
                                                        |-> req.body.checkPeriodMonth
                                                        |-> req.body.checkPeriodDay
                                                        |-> req.body.checkPeriodOnlineHour
                                                        |-> req.body.checkPeriodOnlineMinute
                                                        |-> req.body.checkPeriodOfflineHour
                                                        |-> req.body.checkPeriodOffineMinute
// A2 .==========================================================================================
[index.js]
|----- 新增員工多日排班
       | FORM------MultipleDirectPageToAddEmployeeWorkSchedule
                   |
                   [server.js]
                   | APP.GET ------SingleDirectPageToAddEmployeeWorkSchedule
                                   |
                                   [UseCheckBoxByAddEmployeeWorkSchedule.ejs]
                                   | FORM ----- UseCheckBoxByAddEmployeeWorkSchedule
                                                |
                                                [server.js]
                                                | APP.POST ----- UseCheckBoxByAddEmployeeWorkSchedule
                                                                 |-----SettingPage.PromiseGetBrandInfo
                                                                 |-> item.brandname
                                                                 |-> item.uniID
                                                                 |-----SettingPage.AddEmployeeWorkSchedule
                                                                       |-> items.uniID,
                                                                       |-> items.userbrandname
                                                                       |-> items.userbrandplace
                                                                       |-> req.body.checkName
                                                                       |-> req.body.checkPeriodYear
                                                                       |-> req.body.checkPeriodMonth
                                                                       |-> req.body.checkPeriodDay
                                                                       |-> req.body.checkPeriodOnlineHour
                                                                       |-> req.body.checkPeriodOnlineMinute
                                                                       |-> req.body.checkPeriodOfflineHour
                                                                       |-> req.body.checkPeriodOffineMinute
// A3. ==========================================================================================
[index.js]
|----- 計算薪資
       | FORM------SalaryCount
                   |
                   [server.js]
                   | APP.GET ------SalaryCount
                                   |->dbtoken.collection('memberbrandinformation').find()
                                   |-> uniID
                                   |-> year
                                   |-> month
                                   |->SalaryCalculate.OnlineOfflineTimingCompare
                                      |
                                      [salaryCalculate.js]
                                      |
                                      |-> SettingPage.OnlineOfflineTimingCompare
                                      |-> dbtoken.collection('memberbrandinformation').find()
