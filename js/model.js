(function($Q){
    'use strict'
    $Q.Model = $Q.defineClass(
                    null, 
                    function Model(control){
                        var self = this;
                        self.control = control; 
                        self.dataViews = []; 
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
                                                    "y": ["Date of discharge", "3.06 Date/time arrival at hospital"],
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
                            var self = this; 
                            var derived = []; 
                            for(var i=0; i< self.data.length; i++){
                                var rec = self.data[i]; 
                                if(metric === "48h Readmission"){
                                    var discharge_date = new Date(self.data[i][vars[0]]);
                                    var readmission_date = new Date(self.data[i][vars[1]]);
                                    var one_day=1000*60*60*24;  // in ms
                                    var diff = Math.round((readmission_date.getTime() - discharge_date.getTime())/one_day); 
                                    console.log(diff); 
                                    self.data[i][metric] = ((diff > 0) && (diff <= 2))? 1: 0; 
                                }
                            }                            
                            return metric; 
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
                                                            var date = new Date(data[i][dateVar]);
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
                                                        var date = new Date(data[i][dateVar]);
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
                                                        var date = new Date(data[i][dateVar]);
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


