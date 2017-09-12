//C1 .==========================================================================================
[index.js]
|----- 以群組方式查詢單月員工上班情況
       | FORM------CheckEmployeeWorkSchedule
                   |
                   [server.js]
                   | APP.POST ------CheckEmployeeWorkSchedule
                                    |-> year
                                    |-> month
                                    |-> dbwork.collection('employeeworkschedule').find()
                                        |
                                        [CheckWorkSchedule.ejs]
//C2 .==========================================================================================
[index.js]
|----- 根據日期查詢員工上班狀況
       | FORM------CheckEveryDayWorkStatus
                   |
                   [server.js]
                   | APP.POST ------CheckEmployeeWorkSchedule
                                    |-> year
                                    |-> month
                                    |-> day
                                    |-> dbwork.collection('workperiod').find()
                                        |
                                        [CheckEveryDayWorkStatus.ejs]
//C3 .==========================================================================================
[index.js]
|----- 根據月份查詢員工上班狀況
       | FORM------CheckEveryMonthWorkStatus
                   |
                   [server.js]
                   | APP.POST ------CheckEmployeeWorkSchedule
                                    |-> year
                                    |-> month
                                    |-> name
                                    |-> dbwork.collection('workperiod').find()
                                        |
                                        [CheckEveryMonthWorkStatus.ejs]
//C4 .==========================================================================================
[index.js]
|----- 查詢加班遲到狀況
       | FORM------CheckSalaryCount
                   |
                   [server.js]
                   | APP.POST ------CheckSalaryCount
                                    |-> checkName
                                    |-> checkPeriodYear
                                    |-> checkPeriodMonth
                                    |-> dbwork.collection('everydayonlineofflinelist')
                                        |
                                        [PrintSalaryCalculate.ejs]
//C5 .==========================================================================================
[index.js]
|----- 查詢員工單月薪資
       | FORM------CheckMonthSalary
                   |
                   [server.js]
                   | APP.POST ------CheckSalaryCount
                                    |-> checkName
                                    |-> checkPeriodYear
                                    |-> checkPeriodMonth
                                    |-> dbwork.collection('everydayonlineofflinelist')
                                        |
                                        [PrintSalaryCalculate.ejs]