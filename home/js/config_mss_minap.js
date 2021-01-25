$Q.Minap = {
    "availMetrics": [{"value": "Mortality by month of admission", 
                        "text": "Mortality by month of admission"},
                        //{"value": "derived_readmission", 
                         // "text": "48h Readmission"}, 
                        {"value": "Call-to-Balloon (STEMI Only)", 
                        "text": "Call-to-Balloon (STEMI Only)"},
                        {"value": "Door-to-Angio (NSTEMI Only)", 
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
    "variableDict": {"X1.02.HospitalNumber": "Admissions",
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
                        "x": "X3.06.ArrivalAtHospital",
                        "y": ["X1.02.HospitalNumber", "X4.04.DeathInHospital"], 
                        "yaggregates": ["count", "count"], 
                        "yfilters": {"X1.02.HospitalNumber": {"where": {"X4.04.DeathInHospital":"0. No"},
                                                                         "valid": ["1. From MI", "3. Other non cardiac related cause", "4. Other cardiac cause"]}, 
                                     "X4.04.DeathInHospital": {"where": {"X4.04.DeathInHospital": ["1. From MI", "3. Other non cardiac related cause", "4. Other cardiac cause"]}, 
                                                                "valid": ["0. No"]}
                                      },
                        "xType": "t",
                        "yType": ["q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "All admissions",                        
                        "tspan": 3,     
						"event": {"name":"X4.04.DeathInHospital",
                                    "desc": "Death in hospital", 
                                    "date": "X4.01.DischargeDate", 
                                    "id": "X1.02.HospitalNumber" }, 
                        						
                        "granP": ["unit", "unit"], 
                        "ehr": "Admissions",
                        "legend": ["Alive", "Deceased"],
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["X2.01.AdmissionDiagnosis", "X2.39.AdmissionMethod"],      
                        "quantities": [
                                        //{"q":"X1.02.HospitalNumber","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        {"q":"X2.30.Weight", "granT": "admonth", "granP":["unit"], "yaggregates": "average" }
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["X1.02.HospitalNumber", "X4.04.DeathInHospital"] }   // the first element holds the master view's granT                                             
          
                        },
                        {  
                        "metric": "Call-to-Balloon (STEMI Only)",      
						 "desc": "STEMI patients who met / did not meet \n the 120-min target for Call to Balloon time.",
                        "mark": "bar", // should remove this 
                        "chart": "stacked",
                        "x": "X3.06.ArrivalAtHospital",
                        "y": [ "ctbTarget", "ctbNoTarget", "missing"], 
                        "yaggregates": ["count", "count", "count"], 
						"event": {"name":"ctbNoTarget",
                                    "desc": "Last admission not meeting target", 
                                    "date": "X3.06.ArrivalAtHospital", 
                                    "id": "X1.02.HospitalNumber" },
                        "yfilters": {"ctbTarget": {"where": {"X4.02.FinalDiagnosis": "1. Myocardial infarction (ST elevation)",
															  "ctbTarget": "1"	
																},
                                                                          "operator": "AND", 
																		   "valid": [ "0", "1",
																					// for first criterion
                                                                                    "1. Myocardial infarction (ST elevation)", 
                                                                                    "2. Myocardial infarction (non ST elevation)",
                                                                                    "3. Threatened MI",
                                                                                    "4. Acute coronary syndrome (troponin positive)/ nSTEMI",
																					"5. Acute coronary syndrome (troponin negative)", 
																					"6. Chest pain of uncertain cause", 
																					"7. Myocardial infarction (unconfirmed)",
																					"8. Other diagnosis", 
																					"9. Takotsubo Cardiomyopathy", 
																					"10. Acute coronary syndrome (troponin unspecified)", 
																					"11. PCI related infarction",
                                                                                   ]
                                                                                  },
                                     "ctbNoTarget": {"where": { "X4.02.FinalDiagnosis":  "1. Myocardial infarction (ST elevation)",
																 "ctbNoTarget": "1",
																		}, 
                                                                "operator": "AND",  "valid": [// for first criterion
                                                                                    "1. Myocardial infarction (ST elevation)", 
                                                                                    "2. Myocardial infarction (non ST elevation)",
                                                                                    "3. Threatened MI",
                                                                                    "4. Acute coronary syndrome (troponin positive)/ nSTEMI",
																					"5. Acute coronary syndrome (troponin negative)", 
																					"6. Chest pain of uncertain cause", 
																					"7. Myocardial infarction (unconfirmed)",
																					"8. Other diagnosis", 
																					"9. Takotsubo Cardiomyopathy", 
																					"10. Acute coronary syndrome (troponin unspecified)", 
																					"11. PCI related infarction", "NA",
                                                                                    "1", "0"  ]
                                                                                },
										"missing": {"where": {"ctbTarget": "NA", "X4.02.FinalDiagnosis": "1. Myocardial infarction (ST elevation)"}, "operator": "AND",
													 "valid": [// for first criterion
                                                                                    "1. Myocardial infarction (ST elevation)", 
                                                                                    "2. Myocardial infarction (non ST elevation)",
                                                                                    "3. Threatened MI",
                                                                                    "4. Acute coronary syndrome (troponin positive)/ nSTEMI",
																					"5. Acute coronary syndrome (troponin negative)", 
																					"6. Chest pain of uncertain cause", 
																					"7. Myocardial infarction (unconfirmed)",
																					"8. Other diagnosis", 
																					"9. Takotsubo Cardiomyopathy", 
																					"10. Acute coronary syndrome (troponin unspecified)", 
																					"11. PCI related infarction",
                                                                                    "1", "0", "NA"  ]
											}
                                      },
                        "xType": "t",
                        "yType": ["q", "q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "PCI Patients",                        
                        "tspan": 3,                           
                        "granP": ["unit", "unit"], 
                        "ehr": "Admissions",
                        "legend": ["Meeting CTB Target", "Not meeting CTB target", "No PCI date"],
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["X3.10.JustifiedDelay", "X2.39.AdmissionMethod", "X2.01.AdmissionDiagnosis"],      
                        "quantities": [
                                         {"q":"dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ],                                                               
                        "granT": {"monthly-annual": [ "ctbTarget", "ctbNoTarget"] }             
          
                        },
                         {  
                        "metric": "Door-to-Angio (NSTEMI Only)",
						"desc": "NSTEMI patients who met / did not meet \n the 72-hour target for Door-to-Angio.",
                        "mark": "bar", // should remove this 
                        "chart": "stacked",
                        "x": "X3.06.ArrivalAtHospital",
                        "y": [ "dtaTarget", "dtaNoTarget", "missing"], 
                        "yaggregates": [ "count", "count", "count"], 
                        "legend": ["Meeting DTA Target", "Not meeting DTA target", "NA"],
                        "xType": "t",
                        "yType": [ "q", "q", "q"],
                        "yfilters": {"dtaTarget": {"where": {"dtaTarget": "1", "X4.02.FinalDiagnosis": "4. Acute coronary syndrome (troponin positive)/ nSTEMI" }, 
                                                     "operator": "AND",
                                                     "valid": [// for first criterion
                                                                                    "1. Myocardial infarction (ST elevation)", 
                                                                                    "2. Myocardial infarction (non ST elevation)",
                                                                                    "3. Threatened MI",
                                                                                    "4. Acute coronary syndrome (troponin positive)/ nSTEMI",
																					"5. Acute coronary syndrome (troponin negative)", 
																					"6. Chest pain of uncertain cause", 
																					"7. Myocardial infarction (unconfirmed)",
																					"8. Other diagnosis", 
																					"9. Takotsubo Cardiomyopathy", 
																					"10. Acute coronary syndrome (troponin unspecified)", 
																					"11. PCI related infarction",
                                                                                    "1", "0"  ]
                                                      }, 
                                     "dtaNoTarget": {"where": {"dtaTarget": "0", "X4.02.FinalDiagnosis": "4. Acute coronary syndrome (troponin positive)/ nSTEMI" }, 
                                                        "operator": "AND",
                                                       "valid": [// for first criterion
                                                                                    "1. Myocardial infarction (ST elevation)", 
                                                                                    "2. Myocardial infarction (non ST elevation)",
                                                                                    "3. Threatened MI",
                                                                                    "4. Acute coronary syndrome (troponin positive)/ nSTEMI",
																					"5. Acute coronary syndrome (troponin negative)", 
																					"6. Chest pain of uncertain cause", 
																					"7. Myocardial infarction (unconfirmed)",
																					"8. Other diagnosis", 
																					"9. Takotsubo Cardiomyopathy", 
																					"10. Acute coronary syndrome (troponin unspecified)", 
																					"11. PCI related infarction",
                                                                                    "1", "0", "NA"  ]
                                                    },
                                      "missing": {"where": {"dtaTarget": "NA", "X4.02.FinalDiagnosis": "4. Acute coronary syndrome (troponin positive)/ nSTEMI"}, 
									               "operator": "AND"}

                                      },
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "NSTEMI Admissions",                        
                        "tspan": 3,                           
                        "granP": [ "unit", "unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["X2.39.AdmissionMethod", "1.07 Gender", "X3.10.JustifiedDelay"],      
                        "quantities": [
                                         {"q":"dta", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": [ "dtaTarget", "dtaNoTarget"] }   // the first element holds the master view's granT                                             
          
                         },
                         {  
                        "metric": "Gold Standard Drugs",
						"desc": "All given = Beta Blocker & ACEI or ARB & Statin \n & Aspirin & Ticagrelor or Thienopyridine Inhibitor \n Not all given = one or more of the above not given.  ",
                        "mark": "bar", // should remove this 
                        "chart": "stacked",
                        "x": "X3.06.ArrivalAtHospital",
                        "y": [ "1", "2"], 
                        "yaggregates": [ "count", "count"], 
                        "xType": "t",
                        "yType": [ "q", "q"],
                        "yfilters": {"1": {"where": {
							                "X4.02.FinalDiagnosis": ["1. Myocardial infarction (ST elevation)", "4. Acute coronary syndrome (troponin positive)/ nSTEMI"],
                                            "P2Y12": "1", 
                                            "X4.05.Betablocker": "1. Yes" , 
                                            "X4.06.ACEInhibitor": "1. Yes" ,
                                            "X4.07.Statin": "1. Yes" ,
                                            "X4.08.AspirinSecondary": "1. Yes" 
											//"X4.02.FinalDiagnosis": ["4. Acute coronary syndrome (troponin positive)/ nSTEMI", "1. Myocardial infarction (ST elevation)" ]
                            }, 
                            "valid": ["0", "1", "0. No", "1. Yes" , "4. Not applicable","2. Contraindicated", "3. Patient declined treatment", "8. Not indicated", 
							   "1. Myocardial infarction (ST elevation)", 
                                                                                    "2. Myocardial infarction (non ST elevation)",
                                                                                    "3. Threatened MI",
                                                                                    "4. Acute coronary syndrome (troponin positive)/ nSTEMI",
																					"5. Acute coronary syndrome (troponin negative)", 
																					"6. Chest pain of uncertain cause", 
																					"7. Myocardial infarction (unconfirmed)",
																					"8. Other diagnosis", 
																					"9. Takotsubo Cardiomyopathy", 
																					"10. Acute coronary syndrome (troponin unspecified)", 
																					"11. PCI related infarction"
                                                                                    
							], 
                            "operator": "AND"}, 
                           "2": {"where": {
												"missingOneDrug": "1", 
												"X4.02.FinalDiagnosis": ["1. Myocardial infarction (ST elevation)", "4. Acute coronary syndrome (troponin positive)/ nSTEMI"]
                                            //"4.27 DischargedOnThieno": ["0", "2", "3", "4", "8", "9"] ,
                                            //"4.31 Discharged on TIcagrelor (v10.3 Dataset)": ["0", "2", "3", "4", "8", "9"] ,
                                            //"P2Y12": "0", 
                                            //"X4.05.Betablocker": ["0. No", "4. Not applicable","2. Contraindicated", "3. Patient declined treatment", "8. Not indicated"] , 
                                            //"X4.06.ACEInhibitor": ["0. No", "4. Not applicable","2. Contraindicated", "3. Patient declined treatment", "8. Not indicated"] ,
                                            //"X4.07.Statin": ["0. No", "4. Not applicable","2. Contraindicated", "3. Patient declined treatment", "8. Not indicated"] ,
                                            //"X4.08.AspirinSecondary": ["0. No", "4. Not applicable","2. Contraindicated", "3. Patient declined treatment", "8. Not indicated"]
											
											},
                                          "valid": ["0. No", "1. Yes" ,"4. Not applicable","2. Contraindicated", "3. Patient declined treatment", "8. Not indicated"
                                                                                   
										  ], "operator":"AND"}   
                        }, 
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "Discharged patients", 
                        "legend": ["All given", "Not all given"],                       
                        "tspan": 3,                           
                        "granP": [ "unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["X4.02.FinalDiagnosis", "X4.05.Betablocker", "X4.07.Statin", "X4.06.ACEInhibitor", "4.27 DischargedOnThieno"],      
                        "quantities": [
                                        //{"q":"4.27 DischargedOnThieno","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        //{"q":"4.31 Discharged on TIcagrelor (v10.3 Dataset)", "granT": "admonth", "granP":["unit"], "yaggregates": "count"}, 
                                        // {"q":"der_ctb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}, 
                                         {"q":"X2.30.Weight", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": [ "1", "2" ] }   // the first element holds the master view's granT                                             
          
                         },
                          {  
                        "metric": "Referral for Cardiac Rehabiliation",
						"desc": "Was patient referred for Cardiac Rehabilitation?",
                        "mark": "bar", // should remove this 
                        "chart": "stacked",
                        "x": "X3.06.ArrivalAtHospital",
                        "y":   ["0", "1", "3", "8", "9"], //"X4.09.CardiacRehabilitation", 
                        "yaggregates": [ "count", "count", "count", "count", "count"], 
                        "xType": "t",
                        "yType": "n",
                        "yfilters": {"0": {"where": {"X4.09.CardiacRehabilitation": "0. No"}, "valid": ["0. No", "1. Yes", "3. Patient declined", "8. Not indicated"] },
                                      "1": {"where": {"X4.09.CardiacRehabilitation": "1. Yes"}, "valid": ["0. No", "1. Yes", "3. Patient declined", "8. Not indicated"] },
                                      "3": {"where": {"X4.09.CardiacRehabilitation": "3. Patient declined"}, "valid": ["0. No", "1. Yes", "3. Patient declined", "8. Not indicated"] },
                                      "8": {"where": {"X4.09.CardiacRehabilitation": "8. Not indicated"}, "valid": ["0. No", "1. Yes", "3. Patient declined", "8. Not indicated"] },
                                      "9": {"where": {"X4.09.CardiacRehabilitation": "9"}, "valid": ["0. No", "1. Yes", "3. Patient declined", "8. Not indicated"] }
                                      },
                        "legend": ["No", "Yes", "Patient declined", "Not indicated", "Unknown"],
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "Num. records",                        
                        "tspan": 3,                           
                        "granP": [ "unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["1.07 Gender", "X3.10.JustifiedDelay"],      
                        "quantities": [
                                        //{"q":"der_nstemi","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        //{"q":"der_ctbTarget", "granT": "admonth", "granP":["unit"], "yaggregates": "count"}, 
                                         {"q":"der_angioTarget", "granT": "admonth", "granP":["unit"], "yaggregates": "sum"}, 
                                         {"q":"X2.30.Weight", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": [ "0", "1", "3", "8", "9"] }   // the first element holds the master view's granT                                             
          
                         },
                          {  
                        "metric": "Accute Use of Aspirin",
						"desc": "Accute use of aspirin", 
                        "mark": "bar", // should remove this 
                        "chart": "stacked",
                        "x": "X3.06.ArrivalAtHospital",
                        "y":   ["1", "2", "3", "4", "8"], //"X4.09.CardiacRehabilitation", 
                        "yaggregates": [ "count", "count", "count", "count", "count"], 
                        "xType": "t",
                        "yType": "n",
                        "yfilters": {"1": {"where": {"X2.04.Aspirin": "1. Already on aspirin/antiplatelet drug"}, "valid": ["1. Already on aspirin/antiplatelet drug",                    
                                                                                       "2. Aspirin/antiplatelet drug given out of hospital",          
                                                                                       "3. Aspirin/antiplatelet drug given after arrival in hospital",
                                                                                       "4. Aspirin/antiplatelet contraindicated", "8. Not given" ] },
                                      "2": {"where": {"X2.04.Aspirin": "2. Aspirin/antiplatelet drug given out of hospital"}, "valid": [ "1. Already on aspirin/antiplatelet drug",                    
                                                                                       "2. Aspirin/antiplatelet drug given out of hospital",          
                                                                                       "3. Aspirin/antiplatelet drug given after arrival in hospital",
                                                                                       "4. Aspirin/antiplatelet contraindicated", "8. Not given" ] },
                                      "3": {"where": {"X2.04.Aspirin": "3. Aspirin/antiplatelet drug given after arrival in hospital"}, "valid": [ "1. Already on aspirin/antiplatelet drug",                    
                                                                                       "2. Aspirin/antiplatelet drug given out of hospital",          
                                                                                       "3. Aspirin/antiplatelet drug given after arrival in hospital",
                                                                                       "4. Aspirin/antiplatelet contraindicated", "8. Not given" ] },
                                      "4": {"where": {"X2.04.Aspirin": "4. Aspirin/antiplatelet contraindicated"}, "valid": [ "1. Already on aspirin/antiplatelet drug",                    
                                                                                       "2. Aspirin/antiplatelet drug given out of hospital",          
                                                                                       "3. Aspirin/antiplatelet drug given after arrival in hospital",
                                                                                       "4. Aspirin/antiplatelet contraindicated", "8. Not given" ] },
                                      "8": {"where": {"X2.04.Aspirin": "8. Not given"}, "valid": [ "1. Already on aspirin/antiplatelet drug",                    
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
                        "categories": [ "X2.39.AdmissionMethod", "X3.10.JustifiedDelay"],      
                        "quantities": [
                                        //{"q":"der_nstemi","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        //{"q":"der_ctbTarget", "granT": "admonth", "granP":["unit"], "yaggregates": "count"}, 
                                         {"q":"dtaTarget", "granT": "admonth", "granP":["unit"], "yaggregates": "sum"}, 
                                         {"q":"dta", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": [ "1", "2", "3", "4", "8"] }   // the first element holds the master view's granT                                             
          
                         }
                      
                      
                                                ]
};