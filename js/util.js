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
                    {"value": "retrievals", 
                      "text": "Retrievals and Refusals"},
                    {"value": "case_mix", 
                    "text": "Specialty Case Mix"},
                    {"value": "dependency", // TODO: check how to calcul. complication rates 
                      "text": "Dependency"
                    }], 
"displayVariables": [{  "metric": "Mortality",
                        "mark": "bar",
                        "x": "admonth",
                        "y": ["der_death", "agg_smr"],                                     
                        "categories": ["year", "siteidscr"], 
                        "xType": "t",
                        "yType": "q", 
                        "aggregate": "count",
                        "scale": "monthly",
                        "children": [
                                {"x": "admission",
                                "y": "diagnosis",
                                "xType": "q",
                                "yType": "n", 
                                "aggregate": "count"
                                }
                        ]
                     }, 
                     {  "metric": "48h Readmission",
                        "x": "",
                        "y": [""],
                        "categories": [], 
                        "xType": "t",
                        "yType": "q",
                        "aggregate": "count",
                        "scale": "monthly"
                     },
                     {  "metric": "Bed Days and Extubation",
                        "x": "" ,
                        "y":"",
                        "categories": [], 
                        "xType": "t",
                        "yType": "q", 
                        "aggregate": "count",
                        "scale": "monthly"
                     }, 
                     {  "metric": "Retrievals and Refusals",
                        "x": "",
                        "y": "",
                        "categories": [], 
                        "xType": "t",
                        "yType": "q",
                        "aggregate": "count",
                        "scale": "monthly"
                     },
                     {  "metric": "Specialty Case Mix",
                        "x": "",
                        "y": [""],
                        "categories": [], 
                        "xType": "t",
                        "yType": "q",
                        "aggregate": "count",
                        "scale": "monthly"
                     },
                     {  "metric": "Dependency",
                        "x": "" ,
                        "y":"",
                        "categories": [], 
                        "xType": "t",
                        "yType": "q", 
                        "aggregate": "count",
                        "scale": "monthly"
                    }]

};

$Q.Minap = {
    "availMetrics": [{"value": "4.04 Death in hospital", 
                                              "text": "Mortality"},
                                              {"value": "derived_readmission", 
                                                "text": "48h Readmission"}, 
                                              {"value": "Delay from Call for Help to Reperfusion Treatment", 
                                              "text": "Call-to-Balloon"},
                                              {"value": "Delay from Arrival in Hospital to Reperfusion Treatment", 
                                                "text": "Door-to-Balloon"},
                                              {"value": "derived_los", 
                                              "text": "Length of Stay"},
                                              {"value": "Bleeding complications", // TODO: check how to calcul. complication rates 
                                                "text": "Complications"
                                              }], 
    "displayVariables": [{  "metric": "Mortality",
                                                    "x": "3.06 Date/time arrival at hospital" ,
                                                    "y":"4.04 Death in hospital",
                                                    "xType": "t",
                                                    "yType": "q", 
                                                    "aggregate": "count",
                                                    "scale": "monthly"
                                                 }, 
                                                 {  "metric": "48h Readmission",
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
                                                }]
};