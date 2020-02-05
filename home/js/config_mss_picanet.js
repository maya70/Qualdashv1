$Q.Picanet = {
  "availMetrics": [{"value": "Mortality and Alive Discharges", 
                    "text": "Mortality and Alive Discharges"},
                    {"value": "48h Readmission", 
                      "text": "48h Readmission"}, 
                    {"value": "Bed Days and Ventilation", 
                    "text": "Bed Days and Ventilation"},
                    //{"value": "case_mix", 
                    //"text": "Specialty Case Mix"},
                    {"value": "Dependency", 
                      "text": "Dependency"
                    },
                    {"value": "Dependency (contd')", 
                      "text": "Dependency (contd')"
                    },
                    {"value": "Ventilation days by admission month",
                     "text": "Ventilation days by admission month"}
                    ], 
"variableDict": {"PrimReasonDescription": "Diagnosis",
                 "unplannedextubation": "Unplanned Extubation", 
                 "UnitDisStatus": "Deaths",
                 "missing1": "Group 1: fields containing missing values",
                 "missing2": "Group 2: fields containing missing values",
                 "missing3": "Group 3: fields containing missing values",
                 "missing4": "Group 4: fields containing missing values",
                  "AdTypeDescription": "Adm. type",
                  "sex": "Gender",
                  "EventID": "Admissions",
                  "der_death": "Deaths in unit",
                  "der_smr": "SMR",
                  "der_discharge": "Discharges",
                  "der_readmit": "Readmissions",
                  "ethnic": "Ethnic",
                  "der_spanbedDays": "Bed Days",
                  "der_spanventDays": "Inv. Vent. Days", 
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
"displayVariables": [{  "metric": "Mortality and Alive Discharges",
                        "mark": "bar", 
                        "desc": "Alive and deceased patient counts by \n month of release or death.",
                        "chart": "stacked", 
                        "colorScale": "categorical",
                        "x": "UnitDisDate",
                        "y": ["EventID", "UnitDisStatus", "SMR"], 
                        "legend": ["Alive Discharges", "Deaths in unit", "SMR"],
                        "yaggregates": ["count", "count", "average"], 
                        "yfilters": {"EventID": {"where":{ "UnitDisStatus": "1" }, "valid":["1", "2"]},      
                                     "UnitDisStatus":{"where":{ "UnitDisStatus": "2" }, "valid":["1", "2"]}
                                     
                                     },                                                
                        "xType": "t",
                        "yType": ["q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "Num. Records",                        
                        "tspan": 3,                           
                        "granP": ["unit", "unit"],  
                        "ehr": "Admissions",
                        "event": {"name":"UnitDisStatus",
                                    "desc": "Death in hospital", 
                                    "date": "UnitDisDate", 
                                    "id": "EventID" }, 
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["PrimReasonDescription","AdTypeDescription", "EthnicDescription"],      
                        "quantities": [{"q":"PIM3","granT": "AdDate", "granP":["unit"], "yaggregates": "average" }], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["EventID", "UnitDisStatus"] }   // the first element holds the master view's granT                                             
          
                     },
                     {  "metric": "48h Readmission",
                        "mark": "bar",
                        "desc": "Numbers of patients discharged per month and \n number of 48-hr readmissions per month",
                        "chart": "stacked", 
                        "x": "UnitDisDate",
                        "y": ["UnitDisStatus", "readmission"],
                        "event": {"name":"readmission",
                                    "desc": "Readmission within 48 hours", 
                                    "date": "UnitDisDate", 
                                    "id": "EventID" },                         
                        "categories": ["SourceAdDescription", "CareAreaAdDescription", "UnitDisDestDescription"], 
                        "quantities": [//{"q":"readmission", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" },
                                      {"q":"ADTYPE2OR4", "granT": "UnitDisDate", "granP":["unit","national"], "yaggregates": "count", "filters": {"where": { "AdType": ["1"] } } }],
                        "xType": "t",
                        "yType": ["q", "q"],
                        "legend": ["Discharged", "Readmitted"],
                        "yfilters": {"UnitDisStatus": {"where": {"UnitDisStatus": "1"} }, 
                                      "readmission": {"where":{"readmission": "1"}}} ,
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "Num. Records",
                        "tspan": 3,
                        "yaggregates": ["count", "count"],
                        "ehr": "Admissions",
                        "granP": ["unit", "unit"], 
                        "granT": {"monthly-annual": ["UnitDisStatus", "readmission"]}
                        
                     },
                      {  "metric": "Bed Days and Ventilation",
					     "desc":"Number of bed days and number of invasive ventilation days \n by month of occurrence",
                        "mark": "bar",
                        "chart": "grouped",
                        "x": "AdDate",
                        "y":["der_spanbedDays", "der_spanventDays"],
                        "yfilters": {"der_spanbedDays" : {"where":{"start": "AdDate", "end": "UnitDisDate"}}, 
                                    "der_spanventDays": {"where":{"start": "invVentStart", "end": "invVentEnd"}}}, 
                        "xType": "t",
                        "yType": ["t", "q"], 
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "Num. Days",
                        "tspan": 3,                        
                        "yaggregates": ["count", "count", "count"],
                        "ehr": "Admissions", 
                        "granP": ["unit", "unit", "unit"], 
                        "categories": ["InvVentDescription", "UnplannedExtubation"], 
                        "quantities": [{"q":"PIM3", "granT": "admonth", "granP":["unit","national"], "yaggregates": "average" },
                                        {"q":"der_spanbedDays", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" }],                       
                        "granT": {"monthly-annual": ["der_spanbedDays", "der_spanventDays"]}, 
                        "combinations": ["adtype&der_readmit"]
                     }, 
                      {  "metric": "dependency",   
						"desc":"By month of admission: \n Number of patients receiving enhanced care, high dependency, \n high dependency advanced and intensive care basic",
                        "mark": "bar",                         
                        "chart": "stacked",
                        "x": "AdDate",
                        "y": ["XB09Z", "XB07Z" ,"XB06Z", "XB05Z"], 
                        "yfilters": {"XB09Z" : {"where":"*"}, "XB07Z": {"where":"*"} ,"XB06Z": {"where":"*"}, 
                                      "XB05Z": {"where":"*"}
                                     } ,
                        "yaggregates": ["sum", "sum", "sum", "sum" ], 
                        "legend": ["Enhanced Care", "High Dependency" ,"High Dependency Advanced", "Intensive Care Basic"],
                        "xType": "t",
                        "yType": "o",  
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "Activity", 
                        "tspan": 3,                           
                        "granP": ["unit"], 
                        "ehr": "Admissions",                        
                        "categories": ["PrimReasonDescription","AdTypeDescription", "SexDescription", "EthnicDescription"],      
                        "quantities": [ {"q":"XB09Z", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"XB07Z", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"PIM3", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" }
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["XB09Z", "XB07Z","XB06Z", "XB05Z"]}   // the first element holds the master view's granT                                             
          
                     },
                      {  "metric": "Dependency (contd')",   
						"desc":"By month of admission: \n Number of patients receiving intensive care basic enhanced, \n intensive care advanced enhanced, intensive care advanced, \n intensive care ECMO/ECLS",
                        "mark": "bar",                         
                        "chart": "stacked",
                        "x": "AdDate",
                        "y": [ "XB04Z", "XB03Z", "XB02Z", "XB01Z"], 
                        "yfilters": {"XB04Z": {"where":"*"}, "XB03Z": {"where":"*"}, "XB02Z": {"where":"*"}, "XB01Z": {"where":"*"} } ,
                        "yaggregates": [ "sum", "sum", "sum", "sum" ], 
                        "legend": ["Intensive Care Basic Enhanced", "Intensive Care Advanced", "Intensive Care Advanced Enhanced", "Intensive Care ECMO/ECLS"],
                        "xType": "t",
                        "yType": "o",  
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "Activity", 
                        "tspan": 3,                           
                        "granP": ["unit"], 
                        "ehr": "Admissions",                        
                        "categories": ["PrimReasonDescription","AdTypeDescription", "SexDescription", "EthnicDescription"],      
                        "quantities": [ {"q":"XB04Z", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"XB03Z", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"PIM3", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" }
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["XB04Z", "XB03Z", "XB02Z", "XB01Z"]}   // the first element holds the master view's granT                                             
          
                     }
                       
                    
                     
                     ]

};
