$Q.Picanet = {
  "availMetrics": [{"value": "mortality", 
                    "text": "Mortality"},
                    {"value": "derived_readmission", 
                      "text": "48h Readmission"}, 
                    {"value": "bed_days", 
                    "text": "Bed Days and Extubation"},
                    {"value": "case_mix", 
                    "text": "Specialty Case Mix"},
                    {"value": "dependency", 
                      "text": "Dependency"
                    },
                    {"value": "data_quality",
                     "text": "Data Quality"}
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
                        "x": "addate",
                        "y": ["eventidscr", "unitdisstatus", "der_smr"], 
                        "legend": ["Admissions", "Deaths in unit"],
                        "yaggregates": ["count", "count", "runningAvg"], 
                        "yfilters": {"eventidscr": {"where": "*"},      
                                     "unitdisstatus":{"where": "unitdisstatus", "sign": "=", "value":"2", "valid":["1", "9"]}
                                     },                                                
                        "xType": "t",
                        "yType": ["q", "q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "No. Records",                        
                        "tspan": 3,                           
                        "granP": ["unit", "unit"],  
                        "ehr": "Admissions",
              
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["primarydiagnosisgroup","adtype", "ethnic"],      
                        "quantities": [{"q":"pim3_s","granT": "addate", "granP":["unit"], "yaggregates": "sum" }], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["eventidscr", "unitdisstatus"] }   // the first element holds the master view's granT                                             
          
                     }
                     
                     ]

};

$Q.Minap = {
    "availMetrics": [{"value": "4.04 Death in hospital", 
                                              "text": "Mortality"},
                                              {"value": "derived_readmission", 
                                                "text": "48h Readmission"}, 
                                              {"value": "Delay from Call for Help to Reperfusion Treatment", 
                                              "text": "Call-to-Balloon"},
                                              {"value": "Delay from Call for Help to Angiogram", 
                                              "text": "Door-to-Angio"},
                                              {"value": "der_reqEcho", 
                                              "text": "Capacity for Echo"},
                                              {"value": "Bleeding complications", // TODO: check how to calcul. complication rates 
                                                "text": "Complications"
                                              }], 
    "variableDict": {"1.02 Patient case record number": "Admissions",
                      "der_discharge": "Discharges",
                      "der_readmit": "Readmissions",
                      "der_stemi": "PCI patients", 
                      "der_nstemi": "NSTEMI admissions", 
                      "der_ctbTarget": "CTB Not meeting target",
                      "der_angioTarget": "CTA Not meeting target",
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
                        "yfilters": {"1.02 Patient case record number": {"where": "*"}, 
                                     "4.04 Death in hospital": {"where": "4.04 Death in hospital", "sign": "=", "value": "1", "valid": ["0"]}
                                      },
                        "xType": "t",
                        "yType": ["q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "No. Records",                        
                        "tspan": 3,                           
                        "granP": ["unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["2.01 Initial diagnosis", "2.02 Method of admission"],      
                        "quantities": [{"q":"4.04 Death in hospital", "granT": "admonth", "granP":["unit"], "yaggregates": "count" },
                                        {"q":"1.02 Patient case record number","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        {"q":"der_bedDays", "granT": "admonth", "granP":["unit"], "yaggregates": "average" }
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"annual": ["1.02 Patient case record number", "4.04 Death in hospital"] }   // the first element holds the master view's granT                                             
          
                                                }
                      
                                                ]
};

