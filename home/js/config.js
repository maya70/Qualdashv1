$Q.Picanet = {
  "availMetrics": [{"value": "mortality", 
                    "text": "Mortality"},
                    {"value": "derived_readmission", 
                      "text": "48h Readmission"}, 
                    //{"value": "bed_days", 
                    //"text": "Bed Days and Extubation"},
                    //{"value": "case_mix", 
                    //"text": "Specialty Case Mix"},
                    {"value": "dependency", 
                      "text": "Dependency"
                    }
                    //{"value": "data_quality",
                    // "text": "Data Quality"}
                    ], 
"variableDict": {"primarydiagnosisgroup": "Diagnosis",
                 "unplannedextubation": "Unplanned Extubation", 
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
                  "der_invalid": "Invalid",
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
                                     "unitdisstatus":{"where": "unitdisstatus", "sign": "=", "value":"2", "valid":["1", "9"], "countexisting": {"unitdisdate":""}}
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
                     {  "metric": "dependency",                        
                        "mark": "bar", 
                        "chart": "stacked",
                        "x": "addate",
                        "y": ["der_depLevel0", "der_depLevelEC" ,"der_depLevel1", "der_depLevel2", "der_depLevel3", "der_depLevel4", "der_depLevel5", "der_depLevel6"], 
                        "yaggregates": ["count", "count", "count", "count", "count", "count", "count", "count" ], 
                        "xType": ["t", "n"],
                        "yType": "q",  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "tspan": 3,                           
                        "granP": ["unit"], 
                        "ehr": "Admissions",                        
                        "categories": ["primarydiagnosisgroup","adtype", "sex", "ethnic"],      
                        "quantities": [ {"q":"der_depLevel2", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"der_depLevel3", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"pim3_s", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" }
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["der_depLevel2", "der_depLevel3"]}   // the first element holds the master view's granT                                             
          
                     }
                       
                    
                     
                     ]

};

$Q.Minap = {
    "availMetrics": [{"value": "4.04 Death in hospital", 
                                              "text": "Mortality"},
                                              //{"value": "derived_readmission", 
                                               // "text": "48h Readmission"}, 
                                              {"value": "Delay from Call for Help to Reperfusion Treatment", 
                                              "text": "Call-to-Balloon"},
                                              {"value": "Delay from Call for Help to Angiogram", 
                                              "text": "Door-to-Angio"},
                                              {"value": "der_reqEcho", 
                                              "text": "Capacity for Echo"},
                                              {"value": "Gold Std Drugs",//"Bleeding complications", // TODO: check how to calcul. complication rates 
                                                "text": "Gold Std Drugs"//"Complications"
                                              }], 
    "variableDict": {"1.02 Patient case record number": "Admissions",
                      "der_discharge": "Discharges",
                      "der_readmit": "Readmissions",
                      "der_stemi": "PCI patients", 
                      "der_nstemi": "NSTEMI admissions", 
                      "der_ctbTarget": "CTB Not meeting target",
                      "der_angioTarget": "DTA Not meeting target",
                      "der_ctbTargetMet": "Met target",
                      "der_ctb": "Avgerage CTB",
                      "der_dtb": "Door-to-Balloon"
                      }, 
    "displayVariables": [
                         {  
                        "metric": "Mortality",                      
                        "mark": "bar", // should remove this 
                        "chart": "stacked",
                        "x": "3.06 Date/time arrival at hospital",
                        "y": ["1.02 Patient case record number", "4.04 Death in hospital"], 
                        "yaggregates": ["count", "sum"], 
                        "yfilters": {"1.02 Patient case record number": {"where": "4.04 Death in hospital", "sign": "=", "value": "0", "valid": ["1"]}, 
                                     "4.04 Death in hospital": {"where": "4.04 Death in hospital", "sign": "=", "value": "1", "valid": ["0"]}
                                      },
                        "xType": "t",
                        "yType": ["q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "PCI admissions",                        
                        "tspan": 3,                           
                        "granP": ["unit", "unit"], 
                        "ehr": "Admissions",
                        "legend": ["Alive", "Deceased"],
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["2.01 Initial diagnosis", "2.02 Method of admission"],      
                        "quantities": [{"q":"4.04 Death in hospital", "granT": "admonth", "granP":["unit"], "yaggregates": "count" },
                                        {"q":"1.02 Patient case record number","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        {"q":"der_bedDays", "granT": "admonth", "granP":["unit"], "yaggregates": "average" }
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["1.02 Patient case record number", "4.04 Death in hospital"] }   // the first element holds the master view's granT                                             
          
                        },
                        {  
                        "metric": "Call-to-Balloon",                      
                        "mark": "bar", // should remove this 
                        "chart": "grouped",
                        "x": "3.06 Date/time arrival at hospital",
                        "y": [ "2.01 Initial diagnosis", "der_ctbTarget"], 
                        "yaggregates": ["count", "count"], 
                        "yfilters": {"2.01 Initial diagnosis": {"where": "2.01 Initial diagnosis", "sign": "=", "value": "1"}, 
                                     "der_ctbTarget": {"where": "*"}
                                      },
                        "xType": "t",
                        "yType": ["q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "Num. Records",                        
                        "tspan": 3,                           
                        "granP": ["unit", "unit"], 
                        "ehr": "Admissions",
                        "legend": ["PCI Patients", "Not meeting target"],
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["2.02 Method of admission", "Patient District Number"],      
                        "quantities": [
                                        {"q":"2.01 Initial diagnosis","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        {"q":"der_ctbTargetMet", "granT": "admonth", "granP":["unit"], "yaggregates": "percent"}, 
                                         {"q":"der_dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ],                                                               
                        "granT": {"monthly-annual": [ "2.01 Initial diagnosis", "der_ctbTarget"] }             
          
                        },
                         {  
                        "metric": "Door-to-Angio",
                        "mark": "bar", // should remove this 
                        "x": "3.06 Date/time arrival at hospital",
                        "y": [ "der_nstemi", "der_angioTarget"], 
                        "yaggregates": [ "count", "count"], 
                        "xType": "t",
                        "yType": [ "q", "q"],
                        "yfilters": {"der_nstemi": {"where": "*"}, 
                                     "der_angioTarget": {"where": "*"}
                                      },
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "Num. Records",                        
                        "tspan": 3,                           
                        "granP": [ "unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["2.02 Method of admission", "1.07 Patient gender", "Patient District Number", "3.10 Delay before treatment"],      
                        "quantities": [
                                        {"q":"der_nstemi","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        {"q":"der_ctbTarget", "granT": "admonth", "granP":["unit"], "yaggregates": "count"}, 
                                         {"q":"der_ctb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}, 
                                         {"q":"der_dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": [ "der_nstemi", "der_ctbTarget"] }   // the first element holds the master view's granT                                             
          
                         },
                         {  
                        "metric": "Gold Std Drugs",
                        "mark": "bar", // should remove this 
                        "chart": "stacked",
                        "x": "3.06 Date/time arrival at hospital",
                        "y": [ "4.27 Discharged on a thienopyridine inhibitor", "4.31 Discharged on TIcagrelor (v10.3 Dataset)", "4.05 Discharged on beta blocker", 
                              "4.06 Angiotensin converting enzyme inhibitor or angiotensin receptor blocker", "4.07 Discharged on statin", "4.08 Discharged on aspirin"], 
                        "yaggregates": [ "count", "count" ,"count", "count", "count", "count"], 
                        "xType": "t",
                        "yType": [ "q", "q", "q", "q", "q", "q"],
                        "yfilters": {"4.27 Discharged on a thienopyridine inhibitor": {"where": "*"}, 
                                     "4.31 Discharged on TIcagrelor (v10.3 Dataset)": {"where": "*"}, 
                                     "4.05 Discharged on beta blocker": {"where": "*"}, 
                                     "4.06 Angiotensin converting enzyme inhibitor or angiotensin receptor blocker": {"where": "*"}, 
                                     "4.07 Discharged on statin": {"where": "*"}, 
                                     "4.08 Discharged on aspirin": {"where": "*"}
                                      },
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "Num. Records",                        
                        "tspan": 3,                           
                        "granP": [ "unit", "unit", "unit", "unit", "unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["2.02 Method of admission", "1.07 Patient gender", "Patient District Number", "3.10 Delay before treatment"],      
                        "quantities": [
                                        {"q":"4.27 Discharged on a thienopyridine inhibitor","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        {"q":"4.31 Discharged on TIcagrelor (v10.3 Dataset)", "granT": "admonth", "granP":["unit"], "yaggregates": "count"}, 
                                         {"q":"der_ctb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}, 
                                         {"q":"der_dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": [ "4.27 Discharged on a thienopyridine inhibitor", "4.31 Discharged on TIcagrelor (v10.3 Dataset)", "4.05 Discharged on beta blocker", 
                              "4.06 Angiotensin converting enzyme inhibitor or angiotensin receptor blocker", "4.07 Discharged on statin", "4.08 Discharged on aspirin"] }   // the first element holds the master view's granT                                             
          
                         }
                      
                                                ]
};

