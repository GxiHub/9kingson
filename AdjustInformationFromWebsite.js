//D1 .==========================================================================================
[index.js]
|----- 調整員工上班時間
       | FORM------AdjustOnlineStatus
                   |
                   [server.js]
                   | APP.GET ------AdjustOnlineStatus
                                    |-> dbwork.collection('workperiod').find()
                                        |
                                        [AdjustOnlineStatus.ejs]
                                        |-> WorkHour[i].TID
                                        | FORM ------ delete
                                                      | 
                                                      [server.js]
                                                      | APP. POST ----- delete
                                                      |-> SettingPage.DeleteUserData()
                                                          |
                                                          [setting.js]
                                                          | FUNCTION -----DeleteUserData()
                                                          |-> dbwork.collection('workperiod').findOneAndDelete(TID)
                                        |-> updatemonth
                                        |-> updateday
                                        |-> updathour
                                        |-> updateminute
                                        | FORM ------ update
                                                      | 
                                                      [server.js]
                                        	          | APP. POST ----- update
                                        	          |-> SettingPage.UpdateUserData()
                                                          |
                                                          [setting.js]
                                                          | FUNCTION -----UpdateUserData()
                                                          |-> dbwork.collection('workperiod').findOneAndUpdate(TID)     
//D2 .==========================================================================================
[index.js]
|----- 調整員工排班狀況
       | FORM------AdjustWorkSchedule
                   |
                   [server.js]
                   | APP.GET ------AdjustWorkSchedule
                                    |-> dbwork.collection('employeeworkschedule').find()
                                        |
                                        [AdjustWorkSchedule.ejs]
                                        |-> WorkHour[i].TID
                                        | FORM ------ DeleteWorkScheduleData
                                                      | 
                                                      [server.js]
                                                      |APP. POST ----- DeleteWorkScheduleData
                                                                       |-> SettingPage.DeleteWorkSchdeule()
                                                          			       |
                                                          				   [setting.js]
                                                          				   | FUNCTION -----DeleteWorkSchdeule()
                                                          								   |-> dbwork.collection('employeeworkschedule').findOneAndDelete(TID)
//D3 .==========================================================================================