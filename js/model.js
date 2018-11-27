(function($Q){
    'use strict'
    $Q.Model = $Q.defineClass(
                    null, 
                    function Model(control){
                        var self = this;
                        self.control = control; 
                        self.dataViews = []; 
                        self.ehr = {};  // keeps a dictionary by patient NHS number for patient pathway calculations (including 48h readmission)

                        /** availMetrics keeps a list of metrics that are made available 
                         *  in a drop-down menu for users to select from in each QualCard
                         *  Defaults for each audit are set here
                         *  On launching the site it will display metrics in this order 
                         */ 
                        self.availMetrics = control.savedMetrics || [{"value": "4.04 Death in hospital", 
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
                                              }];   
                        self.displayVariables = control.savedVariables || [{  "metric": "Mortality",
                                                    "x": "3.06 Date/time arrival at hospital" ,
                                                    "y":"4.04 Death in hospital",
                                                    "xType": "t",
                                                    "yType": "q"
                                                 }, 
                                                 {  "metric": "48h Readmission",
                                                    "x": "3.06 Date/time arrival at hospital",
                                                    "y": ["4.01 Date of discharge", "3.06 Date/time arrival at hospital"],
                                                    "xType": "t",
                                                    "yType": "q"
                                                 },
                                                 {  "metric": "Call-to-Balloon",
                                                    "x": "3.06 Date/time arrival at hospital" ,
                                                    "y":"Delay from Call for Help to Reperfusion Treatment",
                                                    "xType": "t",
                                                    "yType": "q"
                                                 }, 
                                                 {  "metric": "Door-to-Balloon",
                                                    "x": "3.06 Date/time arrival at hospital",
                                                    "y": "Delay from Arrival in Hospital to Reperfusion Treatment",
                                                    "xType": "t",
                                                    "yType": "q"
                                                 },
                                                 {  "metric": "Length of Stay",
                                                    "x": "3.06 Date/time arrival at hospital",
                                                    "y": ["4.01 Date of discharge", "3.06 Date/time arrival at hospital"],
                                                    "xType": "t",
                                                    "yType": "q"
                                                 },
                                                 {  "metric": "Complications",
                                                    "x": "3.06 Date/time arrival at hospital" ,
                                                    "y":"Bleeding complications",
                                                    "xType": "t",
                                                    "yType": "q"
                                                }];
                          
                        self.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        //self.dateVar = self.;
                        self.categoricals = [];
                        for(var i=0; i < self.displayVariables.length; i++){
                            self.categoricals[i] = []; 
                        }
                    },
                    {
                        readMinapDummy: function(){
                            var self = this; 
                            
                            d3.csv("./data/minap_dummy.csv", function(data){
                                    ////console.log(Object.keys(data[0])); 
                                    self.data = data; 
                                    
                                    ////console.log(displayVar);
                                    for(var display = 0; display < self.displayVariables.length; display++)
                                    {
                                        self.aggMonthly(self.displayVariables[display]["metric"], display, data, self.displayVariables[display]["x"], self.displayVariables[display]["y"]);
                                    }
                                    self.control.dataReady(self.dataViews, self.data); 

                                });
                            },
                        addCategorical: function(viewId, varName){
                            var self = this;
                            //var viewId = id[id.length-1];
                            ////console.log("VIEW ID = "+ viewId); 
                            self.categoricals[viewId].push(varName);
                            console.log(self.categoricals);

                            self.aggMonthly(self.displayVariables[viewId]["metric"], viewId, self.data, self.displayVariables[viewId]["x"], self.displayVariables[viewId]["y"], self.categoricals );
                        },
                        resetCategoricals: function(viewId){
                            var self = this;
                            self.categoricals[viewId] = []; 
                        },
                        calculateDerivedVar: function(metric, vars){
                            console.log("Calculating "+ metric); 
                            var self = this; 
                            var derived = []; 
                            for(var i=0; i< self.data.length; i++){
                                var rec = self.data[i]; 
                                if(metric === "48h Readmission"){
                                    // data loop calculations
                                    if(!self.ehr[self.data[i]["1.03 NHS number"]]){
                                        console.log("adding a new EHR");
                                        self.ehr[self.data[i]["1.03 NHS number"]] = {}; 
                                        self.ehr[self.data[i]["1.03 NHS number"]]["admissionsT"] = [];
                                        self.ehr[self.data[i]["1.03 NHS number"]]["dischargesT"] = [];
                                    }
                                    
                                    self.ehr[self.data[i]["1.03 NHS number"]]["admissionsT"].push(self.data[i]["3.06 Date/time arrival at hospital"]);
                                    self.ehr[self.data[i]["1.03 NHS number"]]["dischargesT"].push(self.data[i]["4.01 Date of discharge"]);
                                    
                                    /*var discharge_date = new Date(self.data[i][vars[0]]);
                                    var readmission_date = new Date(self.data[i][vars[1]]);
                                    
                                    var diff = Math.round((readmission_date.getTime() - discharge_date.getTime())/one_day); 
                                    console.log(diff); 
                                    self.data[i][metric] = ((diff > 0) && (diff <= 2))? 1: 0; */
                                }

                            }        
                            console.log(self.ehr); 
                            if(metric === "48h Readmission"){
                                for(var i=0; i< self.data.length; i++){

                                var patientEHR = self.ehr[self.data[i]["1.03 NHS number"]];
                                var adm = patientEHR["admissionsT"];
                                var disc = patientEHR["dischargesT"];
                                var one_hour=1000*60*60;  // in ms
                               
                                var index_a = adm.indexOf(self.data[i]["3.06 Date/time arrival at hospital"]);
                                if(index_a === 0)  // first admission for this patient
                                     self.data[i][metric] = 0;
                                else{
                                    // var thisDischarge = disc[index_a]; 
                                    // var d_date = self.stringToDate(thisDischarge);
                                    var a_date = self.stringToDate(adm[index_a]);  
                                    // look for discharges within 48 hours prior to this admission
                                    var found = 0; 
                                    for(var dt = 0; dt < disc.length; dt++){
                                        var d_date = self.stringToDate(disc[dt]);
                                         var adt = a_date.getTime(), 
                                             ddt = d_date.getTime();
                                        var diff = Math.round((adt - ddt)/one_hour);
                                        if(diff >= 0 && diff <=48){
                                            self.data[i][metric] = 1;
                                            found = 1; 
                                            break;
                                        }
                                    }
                                    if(found === 0)
                                        self.data[i][metric] = 0; 
                                }
                                /* var found = 0; 
                                for(var at=0; at < adm.length; at++){  
                                    var a_date = self.stringToDate(adm[at]);
                                    for( var dt= 0; dt < disc.length; dt++ ){
                                        var d_date = self.stringToDate(disc[dt]);
                                        var adt = a_date.getTime(), 
                                            ddt = d_date.getTime();
                                        var diff = Math.round((adt - ddt)/one_day);
                                        if(diff > 0 && diff <=2){
                                            self.data[i][metric] = 1;
                                            found = 1; 
                                            break;
                                        }
                                    }
                                }
                                if(found === 0)
                                    self.data[i][metric] = 0;*/
                                }                   
                                
                            }
                            for(var j=0; j < self.data.length; j++)
                                    console.log(self.data[j][metric]);
                            return metric; 
                        },
                        /** Utility function that converts dates from the MINAP-specified format dd/mm/yyyy hh:mm
                        *   to an ISO-friendly Date() object
                        */
                        stringToDate: function(str){
                            var self = this;
                            var strings = str.split(" ");
                            var date = strings[0],
                                time = strings[1];
                            var dateParts = date.split("/");
                            var timeParts = time.split(":");
                            var day = dateParts[0],
                                month = dateParts[1],
                                year = dateParts[2];
                            var hour = timeParts[0],
                                minute = timeParts[1],
                                second = timeParts[1];

                            return new Date(year + "-" + month + "-" + day + "T"+ hour + ":"+ minute+":"+ second +"Z");

                        },
                        aggMonthly: function(metric, displayId, data, dateVar, displayVar, categoricals){
                            var self = this; 
                            var dict = {};
                            if(displayVar.constructor == Array)
                                displayVar = self.calculateDerivedVar(metric, displayVar); 
                            //console.log(data[0][metric]); 

                            if(!categoricals){
                                                        for(var i=0; i< data.length; i++){
                                                            // get the month of this entry
                                                            var date = self.stringToDate(data[i][dateVar]);
                                                            ////console.log(date); 
                                                            var month = self.months[date.getMonth()];
                                                            var year = date.getYear()+1900; 
                                                            var my = month+"-"+year; 
                                                            ////console.log(my); 
                                                            dict[my] = dict[my]? dict[my]+parseInt(data[i][displayVar]) : parseInt(data[i][displayVar]);
                            
                                                        }
                            
                                                        //console.log(dict); 
                                                        var sum=0; 
                                                        for(var key in dict){
                                                            sum += dict[key];
                                                        }
                                                    
                            
                                                        // sort dict by date
                                                        function custom_sort(a,b){
                                                            return new Date("01-"+a).getTime() - new Date("01-"+b).getTime(); 
                                                        }
                            
                                                        var ordered = [];
                                                        var temp = Object.keys(dict);
                                                        ////console.log(temp); 
                                                        var orderedKeys = Object.keys(dict).sort(custom_sort);
                                                        ////console.log(orderedKeys);
                            
                                                        for(var k= 0; k < orderedKeys.length; k++){
                                                            var obj = {};
                                                            obj['date'] = orderedKeys[k];
                                                            obj['number'] = dict[orderedKeys[k]];
                                                            ordered.push(obj); 
                            
                                                        }
                            
                                                        //console.log(ordered); 
                                                        //self.control.drawBarChart(displayId, ordered); 
                                                        self.dataViews.push({"viewId": displayId, "data": ordered, "metric": self.availMetrics[displayId]['value']});
                            }
                            else if(categoricals[displayId].length === 1){  // count within categories
                                var cat = categoricals[displayId][0];
                                //console.log(cat);

                                var levels = d3.map(self.data, function(item){
                                    return item[cat];
                                    }).keys();
                                //console.log(levels);
                                for(var i=0; i< data.length; i++){
                                                        // get the month of this entry
                                                        var date = self.stringToDate(data[i][dateVar]);
                                                        ////console.log(date); 
                                                        var month = self.months[date.getMonth()];
                                                        var year = date.getYear()+1900; 
                                                        //////console.log(month);
                                                        //////console.log(year);
                                                        var my = month+"-"+year; 
                                                        ////console.log(my); 
                                                        if(!dict[my]){
                                                            dict[my] = {};
                                                            levels.forEach(function(level){
                                                                dict[my][level] = 0;
                                                            });

                                                        }
                                                        var level = data[i][cat];
                                                        dict[my][level] += parseInt(data[i][displayVar]); 
                                                        
                                                    }


                                //console.log(dict);

                               
                                   
                                    self.control.drawBarChart(displayId, dict, cat, levels);

                               

                            }
                        else if(categoricals[displayId].length === 2){
                            

                            // new variable divides the trellis
                            var levels0 = d3.map(self.data, function(item){
                                    return item[categoricals[displayId][1]];
                                    }).keys();
                            
                            var levels1 = d3.map(self.data, function(item){
                                    return item[categoricals[displayId][0]];
                                    }).keys();
                            
                            //console.log(levels0);
                            levels0.forEach(function(level){
                                dict[level] = {};
                            });
                            //console.log(dict);
                            for(var i=0; i< data.length; i++){
                                                        // get the month of this entry
                                                        var date = self.stringToDate(data[i][dateVar]);
                                                        ////console.log(date); 
                                                        var month = self.months[date.getMonth()];
                                                        var year = date.getYear()+1900; 
                                                        //////console.log(month);
                                                        //////console.log(year);
                                                        var my = month+"-"+year; 
                                                        ////console.log(my); 
                                                        if(!dict[levels0[0]][my]){
                                                            levels0.forEach(function(level){
                                                                dict[level][my] = {}; 
                                                                levels1.forEach(function(level2){
                                                                    dict[level][my][level2] = 0;
                                                                });

                                                            });
                                                         }
                                                       dict[data[i][categoricals[displayId][1]]][my][data[i][categoricals[displayId][0]]] += parseInt(data[i][displayVar]);

                                                    }
                               //console.log(dict);
                               var levels = [levels0, levels1]; 
                            self.control.drawBarChart(displayId, dict, categoricals[displayId], levels, 1);


                        }
                        else if(categoricals[displayId].length === 3){

                            
                        }
                    }
        });
})(QUALDASH);


