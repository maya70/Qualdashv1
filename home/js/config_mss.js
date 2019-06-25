$Q.Picanet = {
  "availMetrics": [{"value": "mortality", 
                    "text": "Mortality"},
                    {"value": "derived_readmission", 
                      "text": "48h Readmission"}, 
                    {"value": "bed_days", 
                    "text": "Bed Days and Extubation"},
                    //{"value": "case_mix", 
                    //"text": "Specialty Case Mix"},
                    {"value": "dependency", 
                      "text": "Dependency"
                    },
                    {"value": "data_quality",
                     "text": "Data Quality"}
                    ], 
"variableDict": {"primarydiagnosisgroup": "Diagnosis",
                 "unplannedextubation": "Unplanned Extubation", 
                 "unitdisstatus": "Deaths",
                 "missing1": "Group 1: fields containint missing values",
                 "missing2": "Group 2: fields containint missing values",
                 "missing3": "Group 3: fields containint missing values",
                 "missing4": "Group 4: fields containint missing values",
                  "adtype": "Ad. type",
                  "sex": "Gender",
                  "eventidscr": "Admissions",
                  "der_death": "Deaths in unit",
                  "der_smr": "SMR",
                  "der_discharge": "Discharges",
                  "der_readmit": "Readmissions",
                  "ethnic": "Ethnic",
                  "der_bedDays": "Bed Days",
                  "der_invVentDays": "Invasive Ventil.", 
                  "der_noninvVentDays": "Noninvasive Ventil.",
                  "der_missing": "Missing", 
                  "der_invalid": "Invalid (coming soon)",
                  "der_extubation": "Extubation",
                  "der_depLevelEC": "Enhanced Care",
                  "der_depLevel0": "Unable to Group",
                  "der_depLevel1": "High Dep.", 
                  "der_depLevel2": "High Dep. Adv.",
                  "der_depLevel3": "IC Basic",
                  "der_depLevel4": "IC Basic Enhanced",
                  "der_depLevel5": "IC Advanced",
                  "der_depLevel6": "IC Advanced Enhanced"
                },
"displayVariables": [{  "metric": "Mortality",
                        "mark": "bar", 
                        "chart": "grouped", 
                        "colorScale": "categorical",
                        "x": "addate",
                        "y": ["eventidscr", "unitdisstatus", "der_smr"], 
                        "legend": ["Admissions", "Deaths in unit"],
                        "yaggregates": ["count", "count", "runningAvg"], 
                        "yfilters": {"eventidscr": {"where": "*"},      
                                     "unitdisstatus":{"where":{ "unitdisstatus": "2" }, "valid":["1", "9"], "countexisting": {"unitdisdate":""}}
                                     },                                                
                        "xType": "t",
                        "yType": ["q", "q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "Num. Records",                        
                        "tspan": 3,                           
                        "granP": ["unit", "unit"],  
                        "ehr": "Admissions",
              
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["primarydiagnosisgroup","adtype", "ethnic"],      
                        "quantities": [{"q":"pim3_s","granT": "addate", "granP":["unit"], "yaggregates": "sum" }], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["eventidscr", "unitdisstatus"] }   // the first element holds the master view's granT                                             
          
                     },
                     {  "metric": "48h Readmission",
                        "mark": "bar",
                        "x": "addate",
                        "y": ["der_discharge", "der_readmit"],
                        "categories": ["sourcead", "careareaad", "unitdisdest", "primarydiagnosisgroup"], 
                        "quantities": [{"q":"der_readmit", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" },
                                      {"q":"der_unplannedAdm", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" }],
                        "xType": "t",
                        "yType": ["q", "q"],
                        "yfilters": {"der_discharge": "*", "der_readmit": "*"} ,
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "Num. Records",
                        "tspan": 3,
                        "yaggregates": ["count", "count"],
                        "ehr": "Admissions",
                        "granP": ["unit", "unit"], 
                        "granT": {"monthly-annual": ["der_readmit"]}, 
                        "combinations": ["adtype&der_readmit"]
                     },
                     {  "metric": "Bed Days and Extubation",
                        "mark": "bar",
                        "x": "addate",
                        "y":["der_bedDays", "der_invVentDays"],
                        "yfilters": {"der_bedDays" : "*", 
                                    "der_invVentDays": "*"}, 
                        "xType": "t",
                        "yType": ["q", "q"], 
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "Num. Days",
                        "tspan": 3,                        
                        "yaggregates": ["sum", "sum", "sum"],
                        "ehr": "Admissions", 
                        "granP": ["unit", "unit", "unit"], 
                        "categories": ["unplannedextubation"], 
                        "quantities": [{"q":"pim3_s", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" },
                                        {"q":"der_bedDays", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" }],                       
                        "granT": {"monthly-annual": ["der_bedDays"]}, 
                        "combinations": ["adtype&der_readmit"]
                     }, 
                     {  "metric": "dependency",                        
                        "mark": "bar",                         
                        "chart": "stacked",
                        "x": "addate",
                        "y": ["der_depLevel0", "der_depLevelEC" ,"der_depLevel1", "der_depLevel2", "der_depLevel3", "der_depLevel4", "der_depLevel5", "der_depLevel6"], 
                        "yfilters": {"der_depLevel0" : "*", "der_depLevelEC": "*" ,"der_depLevel1": "*", "der_depLevel2": "*", 
                                    "der_depLevel3": "*", "der_depLevel4": "*", "der_depLevel5": "*", "der_depLevel6": "*"} ,
                        "yaggregates": ["count", "count", "count", "count", "count", "count", "count", "count" ], 
                        "xType": "t",
                        "yType": "o",  
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "Activity", 
                        "tspan": 3,                           
                        "granP": ["unit"], 
                        "ehr": "Admissions",                        
                        "categories": ["primarydiagnosisgroup","adtype", "sex", "ethnic"],      
                        "quantities": [ {"q":"der_depLevel2", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"der_depLevel3", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"pim3_s", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" }
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["der_depLevel2", "der_depLevel3"]}   // the first element holds the master view's granT                                             
          
                     },
                      {
                      "metric": "Data Quality",
                      "mark": "bar", // should remove this 
                        "x": "addate",
                        "y": ["der_missing", "der_invalid"], 
                        "yfilters": {"der_missing" : "*", 
                                    "der_invalid": "*"}, 
                        "yaggregates": ["sum", "sum"], 
                        "legend": ["Missing values", ""],
                        "xType": "t",
                        "yType": ["q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "Num. Values",                         
                        "tspan": 3,                           
                        "granP": ["unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["missing1","missing2", "missing3", "missing4"],      
                        "quantities": [
                                        {"q":"unitdisstatus",  "granP":["unit"], "yaggregates": "sum", 
                                         "filters": {"where": { "unitdisstatus":"2" } } },
                                        {"q":"eventidscr",  "granP":["unit"], "yaggregates": "count" }
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["der_missing"]}   // the first element holds the master view's granT                                             
          
                     }
                       
                    
                     
                     ]

};

$Q.Minap = {
    "availMetrics": [{"value": "4.04 DeathInHospital", 
                        "text": "Mortality"},
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
                      "der_dtb": "Door-to-Balloon"
                      }, 
    "displayVariables": [
                         {  
                        "metric": "Mortality",                      
                        "mark": "bar", // should remove this 
                        "chart": "grouped",
                        "x": "3.06 ArrivalAtHospital",
                        "y": ["1.02 HospitalNumber", "4.04 DeathInHospital"], 
                        "yaggregates": ["count", "sum"], 
                        "yfilters": {"1.02 HospitalNumber": {"where": {"4.04 DeathInHospital":"0"},
                                                                         "valid": ["1"]}, 
                                     "4.04 DeathInHospital": {"where": {"4.04 DeathInHospital": "1"}, 
                                                                "valid": ["0"]}
                                      },
                        "xType": "t",
                        "yType": ["q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "All admissions",                        
                        "tspan": 3,                           
                        "granP": ["unit", "unit"], 
                        "ehr": "Admissions",
                        "legend": ["Alive", "Deceased"],
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["2.01 AdmissionDiagnosis", "2.39 AdmissionMethod"],      
                        "quantities": [
                                        //{"q":"1.02 HospitalNumber","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        {"q":"der_bedDays", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" }
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
                        "yfilters": {"1.02 HospitalNumber": {"where": {"2.01 AdmissionDiagnosis": "1", 
                                                                                  "3.10 JustifiedDelay": "0" },
                                                                          "operator": "AND"
                                                                                  },
                                     "2.01 AdmissionDiagnosis": {"where": { "2.01 AdmissionDiagnosis":  "1",
                                                                          "3.10 JustifiedDelay": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17"]}, 
                                                                "operator": "AND"        }
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
                        "categories": ["2.39 AdmissionMethod"],      
                        "quantities": [
                                       // {"q":"2.01 AdmissionDiagnosis","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        //{"q":"der_ctbTargetMet", "granT": "admonth", "granP":["unit"], "yaggregates": "percent"}, 
                                         {"q":"der_dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ],                                                               
                        "granT": {"monthly-annual": [ "1.02 HospitalNumber", "2.01 AdmissionDiagnosis"] }             
          
                        },
                         {  
                        "metric": "Door-to-Angio (NSTEMI Only)",
                        "mark": "bar", // should remove this 
                        "x": "3.06 ArrivalAtHospital",
                        "y": [ "der_angioTarget", "der_angioNoTarget"], 
                        "yaggregates": [ "count", "count"], 
                        "legend": ["Meeting Target", "Not meeting target"],
                        "xType": "t",
                        "yType": [ "q", "q"],
                        "yfilters": {"der_angioTarget": {"where": "*"}, 
                                     "der_angioNoTarget": {"where": "*"}
                                      },
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "NSTEMI Admissions",                        
                        "tspan": 3,                           
                        "granP": [ "unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["2.39 AdmissionMethod", "1.07 Gender", "3.10 JustifiedDelay"],      
                        "quantities": [
                                         {"q":"der_dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": [ "der_angioTarget", "der_angioNoTarget"] }   // the first element holds the master view's granT                                             
          
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
                                            //"4.27 DischargedOnThieno": "1" ,
                                            //"4.31 Discharged on TIcagrelor (v10.3 Dataset)": "1" ,
                                            "P2Y12": "1", 
                                            "4.05 Betablocker": "1" , 
                                            "4.06 ACEInhibitor": "1" ,
                                            "4.07 Statin": "1" ,
                                            "4.08 AspirinSecondary": "1"      
                            }, "valid": ["0", "1", "2", "3", "4", "8", "9"], "operator": "AND"}, 
                           "2": {"where": {
                                            //"4.27 DischargedOnThieno": ["0", "2", "3", "4", "8", "9"] ,
                                            //"4.31 Discharged on TIcagrelor (v10.3 Dataset)": ["0", "2", "3", "4", "8", "9"] ,
                                            "P2Y12": "0", 
                                            "4.05 Betablocker": ["0", "2", "3", "4", "8", "9"] , 
                                            "4.06 ACEInhibitor": ["0", "2", "3", "4", "8", "9"] ,
                                            "4.07 Statin": ["0", "2", "3", "4", "8", "9"] ,
                                            "4.08 AspirinSecondary": ["0", "2", "3", "4", "8", "9"]     },
                                          "valid": ["0","1", "2", "3", "4", "8", "9"], "operator":"OR"}   
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
                                         {"q":"der_dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
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
                        "yfilters": {"0": {"where": {"4.09 CardiacRehabilitation": "0"}, "valid": ["1", "3", "8", "9"] },
                                      "1": {"where": {"4.09 CardiacRehabilitation": "1"}, "valid": ["0", "3", "8", "9"] },
                                      "3": {"where": {"4.09 CardiacRehabilitation": "3"}, "valid": ["1", "0", "8", "9"] },
                                      "8": {"where": {"4.09 CardiacRehabilitation": "3"}, "valid": ["1", "0", "8", "9"] },
                                      "9": {"where": {"4.09 CardiacRehabilitation": "3"}, "valid": ["1", "0", "8", "9"] }
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
                                         {"q":"der_dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
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
                        "yfilters": {"1": {"where": {"2.04 Aspirin": "1",}, "valid": ["1","2" ,"3", "4", "8"] },
                                      "2": {"where": {"2.04 Aspirin": "2"}, "valid": [ "1","2", "3" ,"4" ,"8"] },
                                      "3": {"where": {"2.04 Aspirin": "3"}, "valid": [ "1","2", "3" ,"4" ,"8"] },
                                      "4": {"where": {"2.04 Aspirin": "4"}, "valid": [ "1","2", "3" ,"4" ,"8"] },
                                      "8": {"where": {"2.04 Aspirin": "8"}, "valid": [ "1","2", "3" ,"4" ,"8"] },

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
                                         {"q":"der_dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": [ "1", "2", "3", "4", "8"] }   // the first element holds the master view's granT                                             
          
                         }
                      
                      
                                                ]
};
