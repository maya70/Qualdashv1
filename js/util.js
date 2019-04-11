// Define the namespace if it's not already defined

var QUALDASH = QUALDASH || {};
var $Q = QUALDASH; 

$Q.classes = {};

/**
 * Simple class inheritance.
 * Does not handle calling the superclass constructor.
 * Defines superclass on the prototype.
 * Stores in $P.classes[name of init function].
 * @param {?Function} superclass - the parent class
 * @param {!Function} init - the initialization function
 * @param {Object} prototype - the prototype methods
 */
$Q.defineClass = function(superclass, init, prototype) {
    init.prototype = Object.create(superclass && superclass.prototype);
    Object.getOwnPropertyNames(prototype).forEach(function(name) {
        Object.defineProperty(init.prototype, name, Object.getOwnPropertyDescriptor(prototype, name));});
    init.prototype.constructor = init;
    init.prototype.superclass = superclass;
    init.prototype.classname = init.name;
    $Q.classes[init.name] = init;
    return init;};


/**
 * ajax wrapper to read and write JSON data from/to file
 * @param {Object} url - the file path
 * @param {!Function} callback - the callback function once read/write finsihes
 * @param {Object} params - ajax call parameters
 */

$Q.handleJSON = function(url, callback, params) {
    var call, config, count = 0;
    config = {
        dataType: 'json',
        url: url,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            if ('timeout' === textStatus) {
                call();}
            else {
                console.error(errorThrown);
                console.error(textStatus);}},
        timeout: 120000,
        success: callback};
    if (params) {config = $.extend(config, params);}
    call = function call() {
                    ++count;
                    if (count < 5) {
                        $.ajax(config);}};
    call();};

/**
 * Create a function that retrieves a specific key from an object.
 * @param {string} key - the key to return
 * @returns {getter}
 */
$Q.getter = function (key) {return function(object) {return object[key];};};


$Q.Control_getDisplayVariable = function(){
	return $Q.displayVariable; 
};

$Q.getUrlVars = function() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    if(window.location.href.indexOf('audit') < 0)
      vars['audit'] = 'minap'; 
    return vars;
}; 

$Q.Picanet = {
  "availMetrics": [{"value": "mortality", 
                    "text": "Mortality"},
                    {"value": "derived_readmission", 
                      "text": "48h Readmission"}, 
                    {"value": "bed_days", 
                    "text": "Bed Days and Extubation"},
                    {"value": "case_mix", 
                    "text": "Specialty Case Mix"},
                    {"value": "data_quality",
                     "text": "Data Quality"},
                    {"value": "dependency", 
                      "text": "Dependency"
                    }], 
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
                        "chart": "stack", 
                        "x": "admonth",
                        "y": ["eventidscr", "der_death", "der_smr"], 
                        "yaggregates": ["count", "count", "runningAvg"], 
                        "yfilters": [{"where": "*"},      
                                     {"where": "self", "sign": "=", "value":"1"},
                                     {"where": "unitdisstatus", "sign": "=", "value": "2"}],                                                
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
                        "quantities": [{"q":"der_death", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"pim3_s","granT": "admonth", "granP":["unit"], "yaggregates": "sum" },                                         
                                        {"q":"eventidscr", "granT": "admonth", "granP":["unit"], "yaggregates": "count" }
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["der_death", "eventidscr"] }   // the first element holds the master view's granT                                             
          
                     }, 
                     {  "metric": "48h Readmission",
                        "mark": "bar",
                        "x": "admonth",
                        "y": ["der_discharge", "der_readmit"],
                        "categories": ["sourcead", "careareaad", "unitdisdest", "primarydiagnosisgroup"], 
                        "quantities": [{"q":"der_readmit", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" },
                                      {"q":"der_unplannedAdm", "granT": "admonth", "granP":["unit","national"], "yaggregates": "sum" }],
                        "xType": "t",
                        "yType": ["q", "q"],
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "No. Records",
                        "tspan": 3,
                        "yaggregates": ["count", "count"],
                        "ehr": "Admissions",
                        "granP": ["unit", "unit"], 
                        "granT": {"monthly-annual": ["der_readmit"]}, 
                        "combinations": ["adtype&der_readmit"]
                     },
                     {  "metric": "Bed Days and Extubation",
                        "mark": "bar",
                        "x": "admonth" ,
                        "y":["der_bedDays", "der_invVentDays"],
                        "xType": "t",
                        "yType": ["q", "q"], 
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "No. Days",
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
                     {  "metric": "Specialty Case Mix",
                        "mark": "bar",
                        "x": "admonth",
                        "y": "eventidscr",
                        "xType": ["t", "n"],
                        "yType": "q",
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "No. Records",                        
                        "tspan": 3,                        
                        "yaggregates": ["count"],
                        "ehr": "Admissions", 
                        "granP": ["unit"], 
                        "categories": ["primarydiagnosisgroup","intubation", "surgicalprocedure"], 
                        "quantities": [
                                        {"q":"der_death", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"eventidscr", "granT": "admonth", "granP":["unit"], "yaggregates": "count"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["der_death"]}, 
                        "combinations": ["adtype&der_readmit"]
                     },
              
                     {  "metric": "dependency",                        
                        "mark": "bar", // should remove this 
                        "x": "admonth",
                        "y": ["der_depLevel0", "der_depLevelEC" ,"der_depLevel1", "der_depLevel2", "der_depLevel3", "der_depLevel4", "der_depLevel5", "der_depLevel6"], 
                        "yaggregates": ["count"], 
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
          
                     }, 
                      {
                      "metric": "Data Quality",
                      "mark": "bar", // should remove this 
                        "x": "admonth",
                        "y": ["der_missing", "der_invalid"], 
                        "yaggregates": ["sum", "sum"], 
                        "xType": "t",
                        "yType": ["q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "No. Values",                         
                        "tspan": 3,                           
                        "granP": ["unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["primarydiagnosisgroup","adtype", "sex", "ethnic"],      
                        "quantities": [
                                        {"q":"der_death", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" },
                                        {"q":"eventidscr", "granT": "admonth", "granP":["unit"], "yaggregates": "count" },
                                        {"q":"der_missing", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" }
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["der_missing"]}   // the first element holds the master view's granT                                             
          
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
                        "mainQ": "What is the number of inpatient mortality per month?",
                        "mark": "bar", // should remove this 
                        "x": "3.06 Date/time arrival at hospital",
                        "y": ["1.02 Patient case record number", "4.04 Death in hospital"], 
                        "yaggregates": ["count", "sum"], 
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
          
                     },
                       {  
                        "metric": "48h Readmission",
                        "mark": "bar", // should remove this 
                        "x": "3.06 Date/time arrival at hospital",
                        "y": ["der_discharge", "der_readmit"], 
                        "yaggregates": ["count", "count"], 
                        "xType": "t",
                        "yType": ["q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "No. Records",                        
                        "tspan": 3,                           
                        "granP": ["unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["2.01 Initial diagnosis","2.03 ECG determining treatment", "2.02 Method of admission", "1.07 Patient gender"],      
                        "quantities": [{"q":"der_discharge", "granT": "admonth", "granP":["unit"], "yaggregates": "count" },
                                        {"q":"der_readmit","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        {"q":"2.29 Height", "granT": "admonth", "granP":["unit"], "yaggregates": "sum" }
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["der_readmit", "der_discharge"] }   // the first element holds the master view's granT                                             
          
                     },
                     {  
                        "metric": "Call-to-Balloon",
                        "mark": "bar", // should remove this 
                        "x": "3.06 Date/time arrival at hospital",
                        "y": [ "der_stemi", "der_ctbTarget"], 
                        "yaggregates": [ "count", "count"], 
                        "xType": "t",
                        "yType": [ "q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "No. Records",                        
                        "tspan": 3,                           
                        "granP": [ "unit", "unit"], 
                        "ehr": "Admissions",
                        /** Slave Tasks spec begin here **/ 
                        "categories": ["2.02 Method of admission", "Patient District Number"],      
                        "quantities": [
                                        {"q":"der_stemi","granT": "admonth", "granP":["unit"], "yaggregates": "count" },                                         
                                        {"q":"der_ctbTargetMet", "granT": "admonth", "granP":["unit"], "yaggregates": "percent"}, 
                                         {"q":"der_dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ],                                                               
                        "granT": {"monthly-annual": [ "der_stemi", "der_ctbTarget"] }             
                     },
                     {  
                        "metric": "Door-to-Angio",
                        "mark": "bar", // should remove this 
                        "x": "3.06 Date/time arrival at hospital",
                        "y": [ "der_nstemi", "der_angioTarget"], 
                        "yaggregates": [ "count", "count"], 
                        "xType": "t",
                        "yType": [ "q", "q"],  
                        "xspan": "year",    
                        "yspan": "unit",  
                        "ylabel": "No. Records",                        
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
          
                     }/*,
                     {  "metric": "Capacity for Echo",    
                        "mark": "bar",
                        "x": "3.06 Date/time arrival at hospital",
                        "y": "der_reqEcho",
                        "xType": ["t", "n"],
                        "yType": "q",
                        "xspan": "year",    
                        "yspan": "unit", 
                        "ylabel": "No. Records",                        
                        "tspan": 3,                        
                        "yaggregates": ["count"],
                        "ehr": "Admissions", 
                        "granP": ["unit"], 
                        "categories": ["2.36 Site of infarction", "1.07 Patient gender"], 
                        "quantities": [
                                        {"q":"der_reqEcho", "granT": "admonth", "granP":["unit"], "yaggregates": "count" },
                                        {"q":"der_dtb", "granT": "admonth", "granP":["unit"], "yaggregates": "average"}
                                       ], // from tasks with a single quantitative variable                                                                   
                        "granT": {"monthly-annual": ["der_reqEcho"]} 
                        
                     }*/
                     
                                                 /*{  "metric": "48h Readmission",
                                                    "x": "3.06 Date/time arrival at hospital",
                                                    "y": "derived",
                                                    "xType": "t",
                                                    "yType": "q",
                                                    "aggregate": "count",
                                                    "scale": "monthly"
                                                 },
                                                 {  "metric": "Call-to-Balloon",
                                                    "x": "3.06 Date/time arrival at hospital" ,
                                                    "y":"Delay from Call for Help to Reperfusion Treatment",
                                                    "xType": "t",
                                                    "yType": "q", 
                                                    "aggregate": "count",
                                                    "scale": "monthly"
                                                 }, 
                                                 {  "metric": "Door-to-Balloon",
                                                    "x": "3.06 Date/time arrival at hospital",
                                                    "y": "Delay from Arrival in Hospital to Reperfusion Treatment",
                                                    "xType": "t",
                                                    "yType": "q",
                                                    "aggregate": "count",
                                                    "scale": "monthly"
                                                 },
                                                 {  "metric": "Length of Stay",
                                                    "x": "3.06 Date/time arrival at hospital",
                                                    "y": "derived",
                                                    "xType": "t",
                                                    "yType": "q",
                                                    "aggregate": "count",
                                                    "scale": "monthly"
                                                 },
                                                 {  "metric": "Complications",
                                                    "x": "3.06 Date/time arrival at hospital" ,
                                                    "y":"Bleeding complications",
                                                    "xType": "t",
                                                    "yType": "q", 
                                                    "aggregate": "count",
                                                    "scale": "monthly"
                                                }*/
                                                ]
};

$Q.DataDefs = {"picanet": {"secondaryKey": "eventidscr",
                          "monthVar": "admonth", 
                          "weekVar": "adweek",
                          "yearVar": "adyear",
                          "patientIdVar": "pidscr", 
                          "unitIdVar": "siteidscr",
                          "admissionDateVar": "addate",
                          "dischargeDateVar": "unitdisdate",
                          "dischargeStatusVar": "unitdisstatus"
                          }, 
               "minap": {
                          "patientIdVar": "1.02 Patient case record number", 
                          "unitIdVar": "1.01 Hospital identifier",
                          "admissionDateVar": "3.06 Date/time arrival at hospital",
                          "yearVar": "admYear",
                          "dischargeDateVar": "4.01 Date of discharge",
                          "dischargeStatusVar": "4.16 Discharge destination"
                        } };
$Q.ValueDefs = {"picanet": {"adtype": {"1":"Planned-following surgery", 
                                       "2":"Unplanned-following surgery",
                                       "3":"Planned-Other",
                                       "4":"Unplanned", 
                                       "9":"N/K"
                                      },
                            "unitdisstatus": {"1": "alive",
                                              "2": "deceased"},
                            "sex": {"1":"male", "2": "female"},
                            "ethnic": {"A": "White British", 
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
                                            "8": "Missing DataDef",

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
                            "unplannedextubation": {"1": "yes", "0": "no"}
                            },
                "minap":{ 
                          "2.02 Method of admission": {
                                "1": "Direct Emergency",
                                "2": "Self-presenter",
                                "3": "Alredy in Hospital",
                                "4": "Transfer",
                                "5": "Repatriation",
                                "6": "Other",
                                "9": "Unknown"
                          },

                        }
                      };
$Q.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//$Q.colors = ["#93969b", "#0f0f0f", "#c18f2a"];
$Q.colors = ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99",
"#e31a1c",
"#fdbf6f",
"#ff7f00",
"#cab2d6",
"#6a3d9a",
"#ffff99",
"#b15928"];