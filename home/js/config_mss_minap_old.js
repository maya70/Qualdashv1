
$Q.Minap = {
    "availMetrics": [{"value": "4.04 DeathInHospital", 
                        "text": "Mortality by month of admission"},
                        //{"value": "derived_readmission", 
                         // "text": "48h Readmission"}, 
                        {"value": "Delay from Call for Help to Reperfusion Treatment", 
                        "text": "Call-to-Balloon (STEMI Only)"},
                        {"value": "Delay from admission at hospital to Angiogram", 
                        "text": "Door-to-Angio (NSTEMI Only)"},
                        //{"value": "der_reqEcho", 
                        //"text": "Capacity for Echo"},
                        {"value": "Gold Standard Drugs",//"Bleeding complications", // TODO: check how to calcul. complication rates 
                          "text": "Gold Standard Drugs"//"Complications"
                        }, 
                        {"value": "Referral for Cardiac Rehabiliation",
                         "text": "Referral for Cardiac Rehabiliation"}, 
                         {"value": "Acute use of Aspirin", 
                         "text": "Acute use of Aspirin"}], 
    "variableDict": {"1.02 HospitalNumber": "Admissions",
                      "der_discharge": "Discharges",
                      "der_readmit": "Readmissions",
                      "der_stemi": "PCI patients", 
                      "der_nstemi": "NSTEMI admissions", 
                      "der_ctbTarget": "CTB Not meeting target",
                      "der_angioTarget": "DTA meeting target",
                      "der_ctbTargetMet": "Met target",
                      "der_ctb": "Avgerage CTB",
                      "der_bedDays": "Bed Days", 
                      "dtb": "Door-to-Balloon"
                      }, 
    "displayVariables": [
                         {  
                        "metric": "Mortality by month of admission",   
                        "desc":"Admissions in a month broken down \n by eventual discharge status",                   
                        "mark": "bar", // should remove this 
                        "chart": "grouped",
                        "x": "3.06 ArrivalAtHospital",
                        "y": ["1.02 HospitalNumber", "4.04 DeathInHospital"], 
                        "yaggregates": ["count", "sum"], 
                        "yfilters": {"1.02 HospitalNumber": {"where": {"4.04 DeathInHospital":"0. No"},
                                                                         "valid": ["1. From MI", "3. Other non cardiac related cause", "4. Other cardiac cause"]}, 
                                     "4.04 DeathInHospital": {"where": {"4.04 DeathInHospital": ["1. From MI", "3. Other non cardiac related cause", "4. Other cardiac cause"]}, 
                                                                "valid": ["0. No"]}
                                      },
                        "xType": "t",
                        "yType": ["q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "All admissions",                        
                        "tspan": 3,                           
                        "granP": ["unit", "unit"], 
                        "ehr": "Admissions",
                        "event": {"name":"4.04 DeathInHospital",
                                    "desc": "Death in hospital", 
                                    "date": "4.01 DischargeDate", 
                                    "id": "1.02 HospitalNumber" }, 
                        "legend": ["Alive", "Deceased"],
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["2.01 AdmissionDiagnosis", "2.39 AdmissionMethod", "2.22 AdmittingConsultantType"],      
                        "quantities": [
                                        //{"q":"1.02 HospitalNumber","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        {"q":"2.22 AdmittingConsultantType", "granT": "admonth", "granP":["unit"], "yaggregates": "" }
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["1.02 HospitalNumber", "4.04 DeathInHospital"] }   // the first element holds the master view's granT                                             
          
                        },
                        {  
                        "metric": "Call-to-Balloon (STEMI Only)",                      
                        "mark": "bar", // should remove this 
                        "chart": "stacked",
                        "x": "3.06 ArrivalAtHospital",
                        "y": [ "1.02 HospitalNumber", "2.01 AdmissionDiagnosis"], 
                        "yaggregates": ["count", "count"], 
                        "yfilters": {"1.02 HospitalNumber": {"where": {"2.01 AdmissionDiagnosis": "1. Definite myocardial infarction", 
                                                                        "3.10 JustifiedDelay": "0. No" },
                                                                          "operator": "AND", 
                                                                          "valid": [ // for first criterion
                                                                                    "1. Definite myocardial infarction", 
                                                                                    "3. Acute Coronary Syndrome",
                                                                                    "4. Chest pain ? cause",
                                                                                    "5. Other initial diagnosis",
                                                                                    // for second criterion
                                                                                    "0. No", 
                                                                                    "1. Definite myocardial infarction", 
                                                                                    "2. Clinical concern about recent cerebrovascular event or surgery", 
                                                                                    "3. Delay obtaining consent",
                                                                                    "4. Initial ECG ineligible",
                                                                                    "5. Cardiac arrest",
                                                                                    "6. Obtaining consent for therapeutic trial",
                                                                                    "7. Hospital administrative failure",
                                                                                    "8. Ambulance procedural delay",
                                                                                    "9. Other",
                                                                                    "10. Ambulance 12 lead ECG not diagnostic of STEMI",
                                                                                    "11. Consideration of primary PCI",
                                                                                    "12. Ambulance administrative delay",
                                                                                    "13. Cath lab access delayed", 
                                                                                    "14. Delay in activating cath lab team",
                                                                                    "15. Pre-PCI complication",
                                                                                    "16. Equipment failure",
                                                                                    "17. Convalescent STEMI"  ]
                                                                                  },
                                     "2.01 AdmissionDiagnosis": {"where": { "2.01 AdmissionDiagnosis":  "1. Definite myocardial infarction",
                                                                          "3.10 JustifiedDelay": [ 
                                                                                    "1. Definite myocardial infarction", 
                                                                                    "2. Clinical concern about recent cerebrovascular event or surgery", 
                                                                                    "3. Delay obtaining consent",
                                                                                    "4. Initial ECG ineligible",
                                                                                    "5. Cardiac arrest",
                                                                                    "6. Obtaining consent for therapeutic trial",
                                                                                    "7. Hospital administrative failure",
                                                                                    "8. Ambulance procedural delay",
                                                                                    "9. Other",
                                                                                    "10. Ambulance 12 lead ECG not diagnostic of STEMI",
                                                                                    "11. Consideration of primary PCI",
                                                                                    "12. Ambulance administrative delay",
                                                                                    "13. Cath lab access delayed", 
                                                                                    "14. Delay in activating cath lab team",
                                                                                    "15. Pre-PCI complication",
                                                                                    "16. Equipment failure",
                                                                                    "17. Convalescent STEMI"  ]}, 
                                                                "operator": "AND",  "valid": [// for first criterion
                                                                                    "1. Definite myocardial infarction", 
                                                                                    "3. Acute Coronary Syndrome",
                                                                                    "4. Chest pain ? cause",
                                                                                    "5. Other initial diagnosis",
                                                                                    // for second criterion
                                                                                    "0. No", 
                                                                                    "1. Definite myocardial infarction", 
                                                                                    "2. Clinical concern about recent cerebrovascular event or surgery", 
                                                                                    "3. Delay obtaining consent",
                                                                                    "4. Initial ECG ineligible",
                                                                                    "5. Cardiac arrest",
                                                                                    "6. Obtaining consent for therapeutic trial",
                                                                                    "7. Hospital administrative failure",
                                                                                    "8. Ambulance procedural delay",
                                                                                    "9. Other",
                                                                                    "10. Ambulance 12 lead ECG not diagnostic of STEMI",
                                                                                    "11. Consideration of primary PCI",
                                                                                    "12. Ambulance administrative delay",
                                                                                    "13. Cath lab access delayed", 
                                                                                    "14. Delay in activating cath lab team",
                                                                                    "15. Pre-PCI complication",
                                                                                    "16. Equipment failure",
                                                                                    "17. Convalescent STEMI"  ]
                                                                                }
                                      },
                        "xType": "t",
                        "yType": ["q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "PCI Patients",                        
                        "tspan": 3,                           
                        "granP": ["unit", "unit"], 
                        "ehr": "Admissions",
                        "legend": ["Meeting Target", "Not meeting target"],
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["3.10 JustifiedDelay", "2.39 AdmissionMethod"],      
                        "quantities": [
                                         {"q":"dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ],                                                               
                        "granT": {"monthly-annual": [ "1.02 HospitalNumber", "2.01 AdmissionDiagnosis"] }             
          
                        },
                         {  
                        "metric": "Door-to-Angio (NSTEMI Only)",
                        "mark": "bar", // should remove this 
                        "chart": "stacked",
                        "x": "3.06 ArrivalAtHospital",
                        "y": [ "dtaTarget", "dtaNoTarget", "missing"], 
                        "yaggregates": [ "count", "count", "count"], 
                        "legend": ["Meeting Target", "Not meeting target", "NA"],
                        "xType": "t",
                        "yType": [ "q", "q", "q"],
                        "yfilters": {"dtaTarget": {"where": {"dtaTarget": "1", "2.01 AdmissionDiagnosis":[
                                                                                    "3. Acute Coronary Syndrome",
                                                                                    "4. Chest pain ? cause",
                                                                                    "5. Other initial diagnosis"
                                                                                    ] }, 
                                                     "operator": "AND"
                                                     /*"valid": ["0", "1", "1. Definite myocardial infarction", 
                                                                                    "3. Acute Coronary Syndrome",
                                                                                    "4. Chest pain ? cause",
                                                                                    "5. Other initial diagnosis"
                                                                                    ]*/
                                                      }, 
                                     "dtaNoTarget": {"where": {"dtaTarget": "0", "2.01 AdmissionDiagnosis":[
                                                                                    "3. Acute Coronary Syndrome",
                                                                                    "4. Chest pain ? cause",
                                                                                    "5. Other initial diagnosis"
                                                                                    ] }, 
                                                        "operator": "AND"
                                                        /*"valid": ["0", "1", "1. Definite myocardial infarction", 
                                                                                    "3. Acute Coronary Syndrome",
                                                                                    "4. Chest pain ? cause",
                                                                                    "5. Other initial diagnosis"
                                                                                    ]*/
                                                                                },
                                      "missing": {"where": {"dtaTarget": "NA", "2.01 AdmissionDiagnosis":[
                                                                                    "3. Acute Coronary Syndrome",
                                                                                    "4. Chest pain ? cause",
                                                                                    "5. Other initial diagnosis"
                                                                                    ]}, "operator": "AND"}

                                      },
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "NSTEMI Admissions",                        
                        "tspan": 3,                           
                        "granP": [ "unit", "unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["2.39 AdmissionMethod", "1.07 Gender", "3.10 JustifiedDelay"],      
                        "quantities": [
                                         {"q":"dta", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": [ "dtaTarget", "dtaNoTarget"] }   // the first element holds the master view's granT                                             
          
                         },
                         {  
                        "metric": "Gold Standard Drugs",
                        "mark": "bar", // should remove this 
                        "chart": "stacked",
                        "x": "3.06 ArrivalAtHospital",
                        "y": [ "1", "2"], 
                        "yaggregates": [ "count", "count"], 
                        "xType": "t",
                        "yType": [ "q", "q"],
                        "yfilters": {"1": {"where": {
                                            "P2Y12": "1", 
                                            "4.05 Betablocker": "1. Yes" , 
                                            "4.06 ACEInhibitor": "1. Yes" ,
                                            "4.07 Statin": "1. Yes" ,
                                            "4.08 AspirinSecondary": "1. Yes"      
                            }, 
                            "valid": ["0", "1", "0. No", "1. Yes" , "4. Not applicable","2. Contraindicated", "3. Patient declined treatment", "8. Not indicated"], 
                            "operator": "AND"}, 
                           "2": {"where": {
                                            //"4.27 DischargedOnThieno": ["0", "2", "3", "4", "8", "9"] ,
                                            //"4.31 Discharged on TIcagrelor (v10.3 Dataset)": ["0", "2", "3", "4", "8", "9"] ,
                                            "P2Y12": "0", 
                                            "4.05 Betablocker": ["0. No", "4. Not applicable","2. Contraindicated", "3. Patient declined treatment", "8. Not indicated"] , 
                                            "4.06 ACEInhibitor": ["0. No", "4. Not applicable","2. Contraindicated", "3. Patient declined treatment", "8. Not indicated"] ,
                                            "4.07 Statin": ["0. No", "4. Not applicable","2. Contraindicated", "3. Patient declined treatment", "8. Not indicated"] ,
                                            "4.08 AspirinSecondary": ["0. No", "4. Not applicable","2. Contraindicated", "3. Patient declined treatment", "8. Not indicated"]     },
                                          "valid": ["0. No", "1. Yes" ,"4. Not applicable","2. Contraindicated", "3. Patient declined treatment", "8. Not indicated"], "operator":"OR"}   
                        }, 
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "Discharged patients", 
                        "legend": ["All given", "Not all given"],                       
                        "tspan": 3,                           
                        "granP": [ "unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["P2Y12", "4.05 Betablocker", "4.07 Statin", "4.06 ACEInhibitor", "4.27 DischargedOnThieno"],      
                        "quantities": [
                                        //{"q":"4.27 DischargedOnThieno","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        //{"q":"4.31 Discharged on TIcagrelor (v10.3 Dataset)", "granT": "admonth", "granP":["unit"], "yaggregates": "count"}, 
                                        // {"q":"der_ctb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}, 
                                         {"q":"dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": [ "1", "2" ] }   // the first element holds the master view's granT                                             
          
                         },
                          {  
                        "metric": "Referral for Cardiac Rehabiliation",
                        "mark": "bar", // should remove this 
                        "chart": "stacked",
                        "x": "3.06 ArrivalAtHospital",
                        "y":   ["0", "1", "3", "8", "9"], //"4.09 CardiacRehabilitation", 
                        "yaggregates": [ "count", "count", "count", "count", "count"], 
                        "xType": "t",
                        "yType": "n",
                        "yfilters": {"0": {"where": {"4.09 CardiacRehabilitation": "0. No"}, "valid": ["0. No", "1. Yes", "3. Patient declined", "8. Not indicated"] },
                                      "1": {"where": {"4.09 CardiacRehabilitation": "1. Yes"}, "valid": ["0. No", "1. Yes", "3. Patient declined", "8. Not indicated"] },
                                      "3": {"where": {"4.09 CardiacRehabilitation": "3. Patient declined"}, "valid": ["0. No", "1. Yes", "3. Patient declined", "8. Not indicated"] },
                                      "8": {"where": {"4.09 CardiacRehabilitation": "8. Not indicated"}, "valid": ["0. No", "1. Yes", "3. Patient declined", "8. Not indicated"] },
                                      "9": {"where": {"4.09 CardiacRehabilitation": "9"}, "valid": ["0. No", "1. Yes", "3. Patient declined", "8. Not indicated"] }
                                      },
                        "legend": ["No", "Yes", "Patient declined", "Not indicated", "Unknown"],
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "Num. records",                        
                        "tspan": 3,                           
                        "granP": [ "unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["1.07 Gender", "3.10 JustifiedDelay"],      
                        "quantities": [
                                        //{"q":"der_nstemi","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        //{"q":"der_ctbTarget", "granT": "admonth", "granP":["unit"], "yaggregates": "count"}, 
                                         {"q":"der_angioTarget", "granT": "admonth", "granP":["unit"], "yaggregates": "sum"}, 
                                         {"q":"dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": [ "0", "1", "3", "8", "9"] }   // the first element holds the master view's granT                                             
          
                         },
                          {  
                        "metric": "Accute Use of Aspirin",
                        "mark": "bar", // should remove this 
                        "chart": "stacked",
                        "x": "3.06 ArrivalAtHospital",
                        "y":   ["1", "2", "3", "4", "8"], //"4.09 CardiacRehabilitation", 
                        "yaggregates": [ "count", "count", "count", "count", "count"], 
                        "xType": "t",
                        "yType": "n",
                        "yfilters": {"1": {"where": {"2.04 Aspirin": "1. Already on aspirin/antiplatelet drug"}, "valid": ["1. Already on aspirin/antiplatelet drug",                    
                                                                                       "2. Aspirin/antiplatelet drug given out of hospital",          
                                                                                       "3. Aspirin/antiplatelet drug given after arrival in hospital",
                                                                                       "4. Aspirin/antiplatelet contraindicated", "8. Not given" ] },
                                      "2": {"where": {"2.04 Aspirin": "2. Aspirin/antiplatelet drug given out of hospital"}, "valid": [ "1. Already on aspirin/antiplatelet drug",                    
                                                                                       "2. Aspirin/antiplatelet drug given out of hospital",          
                                                                                       "3. Aspirin/antiplatelet drug given after arrival in hospital",
                                                                                       "4. Aspirin/antiplatelet contraindicated", "8. Not given" ] },
                                      "3": {"where": {"2.04 Aspirin": "3. Aspirin/antiplatelet drug given after arrival in hospital"}, "valid": [ "1. Already on aspirin/antiplatelet drug",                    
                                                                                       "2. Aspirin/antiplatelet drug given out of hospital",          
                                                                                       "3. Aspirin/antiplatelet drug given after arrival in hospital",
                                                                                       "4. Aspirin/antiplatelet contraindicated", "8. Not given" ] },
                                      "4": {"where": {"2.04 Aspirin": "4. Aspirin/antiplatelet contraindicated"}, "valid": [ "1. Already on aspirin/antiplatelet drug",                    
                                                                                       "2. Aspirin/antiplatelet drug given out of hospital",          
                                                                                       "3. Aspirin/antiplatelet drug given after arrival in hospital",
                                                                                       "4. Aspirin/antiplatelet contraindicated", "8. Not given" ] },
                                      "8": {"where": {"2.04 Aspirin": "8. Not given"}, "valid": [ "1. Already on aspirin/antiplatelet drug",                    
                                                                                       "2. Aspirin/antiplatelet drug given out of hospital",          
                                                                                       "3. Aspirin/antiplatelet drug given after arrival in hospital",
                                                                                       "4. Aspirin/antiplatelet contraindicated", "8. Not given" ] },

                                      },
                        "legend": ["Already on drug", 
                                  "Given out of hospital",
                                  "Given after arrival in hospital",
                                  "Contraindicated", 
                                  "Not given"
                                  ],
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "Num. records",                        
                        "tspan": 3,                           
                        "granP": [ "unit", "unit", "unit", "unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": [ "2.39 AdmissionMethod", "3.10 JustifiedDelay"],      
                        "quantities": [
                                        //{"q":"der_nstemi","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        //{"q":"der_ctbTarget", "granT": "admonth", "granP":["unit"], "yaggregates": "count"}, 
                                         {"q":"der_angioTarget", "granT": "admonth", "granP":["unit"], "yaggregates": "sum"}, 
                                         {"q":"dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": [ "1", "2", "3", "4", "8"] }   // the first element holds the master view's granT                                             
          
                         }
                      
                      
                                                ]
};