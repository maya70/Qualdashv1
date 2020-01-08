// Taken from model.js line 1882

if(metric === "48h Readmission"){ 
                                // calculate 48-hour readmissions:
                                for(var key in self.ehr ){
                                    var patientEHR = self.ehr[key];
                                    var adm = patientEHR["admissionsT"];
                                    var disc = patientEHR["dischargesT"];
                                    var one_hour=1000*60*60;  // in ms
                                   
                                    //var index_a = adm.indexOf(self.data[i]["3.06 ArrivalAtHospital"]);
                                    if(adm.length <= 1)  // this patient was only admitted once
                                        continue;

                                    else{
                                        disc.forEach(function(discharge, did){
                                            var d_date = self.stringToDate(discharge);
                                            adm.forEach(function(admission, aid){
                                                var a_date = self.stringToDate(admission);
                                                var adt = a_date.getTime(),
                                                    ddt = d_date.getTime(); 
                                                var diff = Math.round((adt-ddt)/one_hour);
                                                if(diff >=0 && diff <= 48 && (aid !== did)){
                                                //if(aid !== did){
                                                    var adrec = patientEHR['data'][aid];
                                                    // find corresponding entry in dict
                                                    // assuming dict is organized by months
                                                    // find the months of this readmission event
                                                    var month = parseInt(self.stringToMonth(adrec[$Q.DataDefs[self.audit]["admissionDateVar"]])); //adrec[$Q.DataDefs[self.audit]["monthVar"]];
                                                    var unit = adrec[$Q.DataDefs[self.audit]["unitIdVar"]];
                                                    var quar = self.getRecordQuarter(adrec);
                                                    //var month = adrec[$Q.DataDefs[self.audit]["monthVar"]];
                                                    var mon = parseInt(self.stringToMonth(adrec[$Q.DataDefs[self.audit]["admissionDateVar"]])); //parseInt(adrec[$Q.DataDefs[self.audit]["monthVar"]]);
                                                    var week = parseInt(self.stringToDate(adrec[$Q.DataDefs[self.audit]["admissionDateVar"]]).getDate()/7);
                                                    //parseInt(adrec[$Q.DataDefs[self.audit]["weekVar"]]);
                                                    if(isNaN(mon))
                                                        self.recordMissing(metric, "der_readmit", aid); 
                                                    //if(unit === self.unitID)
                                                    if(true)
                                                    {
                                                        // update the der_readmit field in the corresponding data record
                                                        var recID = self.getRecordByEventId(adrec["EventID"]);
                                                        self.data[recID]['der_readmit'] = 1; 
                                                        // update this view's master dict
                                                        result['dict'][month]["der_readmit"]["value"]++;
                                                        result['dict'][month]["der_readmit"]["data"].push(patientEHR['ids'][aid]);
                                                        result['slaves']['data']['der_readmit'][month]['unit']++; 
                                                        // update the time hierarchy
                                                        
                                                        var auditVars = (self.audit === 'picanet')? $Q.Picanet["displayVariables"] : $Minap["displayVariables"];
                                                        for(var v = 0; v < self.dataViews.length; v++){
                                                           var granT = auditVars[v]['granT']["monthly-annual"];
                                                            if(granT.indexOf("der_readmit") >= 0)
                                                                self.tHier[v][year][quar][mon][week]["der_readmit"]++; 
                                                        }
                                                    }
                                                    // update the slave that will show national average
                                                    result['slaves']['data']['der_readmit'][month]['national']++; 
                                                }


                                            });
                                        });
                                        
                                       
                                     }
                                }
                              //  return result;
                            } // if(metric === "48h Readmission")
                           