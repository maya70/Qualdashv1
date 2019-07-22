$Q.DataDefs = {"picanet": {"secondaryKey": "EventID",
                          "monthVar": "AdMonth", 
                          "weekVar": "AdWeek",
                          "yearVar": "AdYear",
                          "patientIdVar": "PatientID", 
                          "unitIdVar": "PicuOrg",
                          "admissionDateVar": "AdDate",
                          "dischargeDateVar": "UnitDisDate",
                          "dischargeStatusVar": "UnitDisStatus"
                          }, 
               "minap": {
                          "patientIdVar": "NHS number", 
                          "unitIdVar": "HospitalNumber",
                          "admissionDateVar": "Arrival at hospital",
                          "yearVar": "adyear",
                          "dischargeDateVar": "Date of death or discharge",
                          "dischargeStatusVar": "Discharge Destination"
                        } };
$Q.ValueDefs = {"picanet": {"AdType": {"1":"Planned-following surgery", 
                                       "2":"Unplanned-following surgery",
                                       "3":"Planned-Other",
                                       "4":"Unplanned", 
                                       "9":"N/K"
                                      },
                            "UnitDisStatus": {"1": "alive",
                                              "2": "deceased"},
                            "sex": {"1":"male", "2": "female"},
                            "Ethnic": {"A": "White British", 
                                        "B": "White Irish",
                                        "C": "White other",
                                        "D": "Mixed White and Black Carribean", 
                                        "E":"Mixed White and Black African",
                                        "F": "Mixed White and Asian",
                                        "G": "Mixed other",
                                        "H": "Asian Indian"
                                    },
                            "sourcead": {"1": "Same hospital",
                                         "2": "Other hospital",
                                         "3":  "Clinic",
                                         "4":  "Home",
                                         "9":  "N/K"
                                        },
                            "careareaad": {"1": "X-ray, endoscopy, CT or similar",
                                            "2": "Recovery only",
                                            "3": "HDU (step-up/step-down unit)",
                                            "4": "Other intermediate care area",
                                            "5": "ICU or PICU or NICU",
                                            "6": "Ward",
                                            "7": "Missing DataDef",
                                            "8": "Missing DataDef"
                                            },
                            "unitdisdest": {"1": "PICU",
                                            "2": "NICU",
                                            "3": "ICU",
                                            "4": "HDU",
                                            "5": "Ward",
                                            "6": "Theatre",
                                            "7": "Other transport service",
                                            "8": "Normal residence",
                                            "9": "Hospice",
                                            "99": "Unknown"
                                            }, 
                            "PrimReason":{"0": "None of the below",
                                          "1":  "Asthma",
                                          "2":  "Bronchitis",
                                          "3":  "Croup",
                                          "4":  "Obstructive sleep apnoea",
                                          "5":  "Diabetic Ketoacidosis",
                                          "6":  "Recovery fro surgery",
                                          "7":  "Seizure disorder",
                                          "9":  "N/K"

                                          },
                            "unplannedextubation": {"1": "yes", "0": "no"}
                            },
                "minap":{ 
                        }
                      };
$Q.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//$Q.colors = ["#93969b", "#0f0f0f", "#c18f2a"];
/*$Q.colors = ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99",
"#e31a1c",
"#fdbf6f",
"#ff7f00",
"#cab2d6",
"#6a3d9a",
"#ffff99",
"#b15928"];*/

$Q.colors = [ "#a6cee3", "#1f78b4" , "#4daf4a", "#f781bf", "#999999", "#a65628", "#e41a1c", "#ffff33", "#984ea3", "#ff7f00"];
$Q.ordinalColors = ["#f7fcf0",
"#e0f3db",
"#ccebc5",
"#a8ddb5",
"#7bccc4",
"#4eb3d3",
"#2b8cbe",
"#0868ac",
"#084081"];