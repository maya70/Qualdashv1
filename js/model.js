(function($Q){
    'use strict'
    $Q.Model = $Q.defineClass(
                    null, 
                    function Model(control){
                        var self = this;
                        self.control = control; 
                        self.dataViews = []; 
                        self.ehr = {};  // keeps a dictionary by patient NHS number for patient pathway calculations (including 48h readmission)
                        self.unitID = "194281";
                        self.slaveCats = {};
                        self.slaves = {};
                        self.year = "2014"; 
                        /** availMetrics keeps a list of metrics that are made available 
                         *  in a drop-down menu for users to select from in each QualCard
                         *  Defaults for each audit are set here
                         *  On launching the site it will display metrics in this order 
                         */ 
                        self.audit = $Q.getUrlVars()["audit"];
                        var auditMetrics = (self.audit==="picanet")? $Q.Picanet.availMetrics : $Q.Minap.availMetrics; 
                        var auditVariables = (self.audit==="picanet")? $Q.Picanet.displayVariables : $Q.Minap.displayVariables; 
                        
                        self.availMetrics = control.savedMetrics || auditMetrics ;   
                        self.displayVariables = control.savedVariables || auditVariables;
                          
                        self.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        //self.dateVar = self.;
                        self.categoricals = [];
                        for(var i=0; i < self.displayVariables.length; i++){
                            self.categoricals[i] = []; 
                        }
                    },
                    {
                        updateMetrics: function(viewId, value){
                            var self = this; 
                            // get the metric corresponding to value
                            var metric = "Complications";
                            var metricId = 5; 
                            for(var i=0; i < self.availMetrics.length; i++){
                                if(self.availMetrics[i].value === value)
                                   { metric = self.availMetrics[i].text; 
                                    break; 
                                   }
                            }
                            //console.log(metric); 
                            // get index of this metric 
                            for(var j=0; j < self.displayVariables.length; j++){
                                if(self.displayVariables[j]['metric'] === metric){
                                    metricId = j; 
                                }
                            }

                            // Copy metric parameters into the newly assigned view
                            self.displayVariables[viewId]['metric'] = self.displayVariables[metricId]['metric'];
                            self.displayVariables[viewId]['x'] = self.displayVariables[metricId]['x'];
                            self.displayVariables[viewId]['y'] = self.displayVariables[metricId]['y'];
                            self.displayVariables[viewId]['xType'] = self.displayVariables[metricId]['xType'];
                            self.displayVariables[viewId]['yType'] = self.displayVariables[metricId]['yType'];

                        },
                        getMetaData: function(){
                            return this.meta; 
                        },
                        getAudit: function() {
                            var self = this;
                            return self.audit; 
                        },
                        readMinapData: function(){
                            var self = this; 
                            self.meta = [];
                            d3.csv("./data/minap_meta.csv", function(meta){
                                for(var k=0; k < meta.length; k++)
                                    if(meta[k]['fieldName'] !== "")
                                        self.meta.push(meta[k]); 
                                //self.meta = meta; 
                                //console.log(meta); 
                                d3.csv("./data/minap_dummy.csv", function(data){
                                        //console.log(data); 
                                        self.data = data;                                     
                                        //////console.log(displayVar);
                                        for(var display = 0; display < self.displayVariables.length; display++)
                                        {
                                            self.applyAggregateRule(self.displayVariables[display], display, data);
                                        }
                                        self.control.dataReady(self.dataViews, self.data); 

                                    });
                                });
                            },
                        readPicanetData: function(){
                            var self = this; 
                            self.meta = [];
                            d3.csv("./data/picanet_meta.csv", function(meta){
                                for(var k=0; k < meta.length; k++){
                                    if(meta[k]['COLUMN_NAME'] !== ""){
                                        var metaEntry = {}; 
                                        metaEntry['fieldName'] = meta[k]['COLUMN_NAME'].toLowerCase();
                                        metaEntry['fieldType'] = (meta[k]['DATA_TYPE'] === "datetime")? "t" :
                                                                    (( meta[k]['DATA_TYPE'] === "smallint" )?"o" : 
                                                                        ((meta[k]['DATA_TYPE'] === "nvarchar" || meta[k]['DATA_TYPE'] === "varchar" || meta[k]['DATA_TYPE'] === "bit")? "n" : "q"));
                                        self.meta.push(metaEntry); 
                                    }
                                }
                                //self.meta = meta; 
                                //console.log(meta); 
                                d3.csv("./data/picanet_admission/"+self.year+".csv", function(data){
                                        //console.log(data); 
                                        self.data = data;                                     
                                        //////console.log(displayVar);
                                        for(var display = 0; display < self.displayVariables.length; display++)
                                        {
                                            self.applyAggregateRule2(self.displayVariables[0],                                                                     
                                                                    display, data);
                                        }
                                        //console.log(self.dataViews);
                                        self.loadHistory();
                                        self.control.dataReady(self.dataViews, self.data); 

                                    });
                                });
                            },
                        loadHistory: function(){
                            var self = this;
                            var tspan, fpath; 
                            self.history = [];                             
                            if(self.control.audit === "picanet"){
                                tspan = $Q.Picanet['displayVariables'][0]['tspan']; 
                                fpath = "./data/picanet_admission/";
                                for(var i=1; i < tspan; i++){
                                    var year = parseInt(self.year)-i; 
                                    d3.csv(fpath+year+".csv", function(data){                                        
                                        //console.log(data);
                                        self.history.push({"year": year, "data": data});
                                    });
                                } 
                                //https://bl.ocks.org/carlvlewis/8a5b1cc987217607a47bd7d4e0fffacb
                            }
                            

                        },
                        addCategorical: function(viewId, varName){
                            var self = this;
                            //var viewId = id[id.length-1];
                            //////console.log("VIEW ID = "+ viewId); 
                            self.categoricals[viewId].push(varName);
                            //console.log(self.categoricals);
                            //console.log(self.displayVariables[viewId]["metric"]); 
                            //console.log(self.displayVariables[viewId]["x"]); 
                            //console.log(self.displayVariables[viewId]["y"]); 
                            self.applyAggregateRule(self.displayVariables[viewId], viewId, self.data, 1 );
                        },
                        resetCategoricals: function(viewId){
                            var self = this;
                            self.categoricals[viewId] = []; 
                        },
                        getSlaves: function(viewId){
                            return this.slaves[viewId]; 
                        },
                        getDerivedValue: function(vname, recId){
                            var self = this;
                            if(vname === "death" && self.audit === "picanet"){
                                if(self.data[recId]["unitdisstatus"] === "2")
                                    return 1;
                                else
                                    return 0; 
                            }
                            else if(vname === "smr" && self.audit === "picanet"){
                                return self.data[recId]["pim3_s"]; 
                            }
                        },
                        calculateDerivedVar: function(metric, yvar){
                            //console.log("Calculating "+ metric); 
                            var self = this; 
                            var derived = []; 
                            for(var i=0; i< self.data.length; i++){
                                var rec = self.data[i]; 
                                
                                if(yvar === "death"){
                                    if(rec["unitdisstatus"] === "1")
                                        self.data[i][yvar] = 1;
                                    else
                                        self.data[i][yvar] = 0;
                                }

                                
                                if(metric === "48h Readmission"){
                                    // data loop calculations
                                    if(!self.ehr[self.data[i]["1.03 NHS number"]]){
                                        
                                        self.ehr[self.data[i]["1.03 NHS number"]] = {}; 
                                        self.ehr[self.data[i]["1.03 NHS number"]]["admissionsT"] = [];
                                        self.ehr[self.data[i]["1.03 NHS number"]]["dischargesT"] = [];
                                    }
                                    
                                    self.ehr[self.data[i]["1.03 NHS number"]]["admissionsT"].push(self.data[i]["3.06 Date/time arrival at hospital"]);
                                    self.ehr[self.data[i]["1.03 NHS number"]]["dischargesT"].push(self.data[i]["4.01 Date of discharge"]);
                                    
                                    /*var discharge_date = new Date(self.data[i][vars[0]]);
                                    var readmission_date = new Date(self.data[i][vars[1]]);
                                    
                                    var diff = Math.round((readmission_date.getTime() - discharge_date.getTime())/one_day); 
                                    //console.log(diff); 
                                    self.data[i][metric] = ((diff > 0) && (diff <= 2))? 1: 0; */
                                }
                                else if(metric === "Length of Stay"){
                                    var adm = self.data[i]["3.06 Date/time arrival at hospital"];
                                    var disc = self.data[i]["4.01 Date of discharge"];
                                    var one_day = 1000*60*60*24; 
                                    self.data[i][metric] = (self.stringToDate(disc).getTime() - self.stringToDate(adm).getTime())/one_day; 
                                }

                            }        
                            ////console.log(self.ehr); 
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
                               
                                }                   
                                
                            }
                            //for(var j=0; j < self.data.length; j++)
                                //    //console.log(self.data[j][metric]);
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
                            var dateParts = date.split("-");
                            var timeParts = time.split(":");
                            var day = dateParts[0],
                                month = dateParts[1],
                                year = "20"+dateParts[2];
                            var hour = timeParts[0],
                                minute = timeParts[1],
                                second = timeParts[1];

                            return new Date(year + "-" + month + "-" + day + "T"+ hour + ":"+ minute+":"+ second +"Z");

                        },
                        getHistoryData:function(){
                            var self= this;
                            return self.history; 
                        },
                        prepTimeData: function(tspan, viewId){
                            var self = this;
                            if(tspan.indexOf("-")>=0){ // this is a composite time span 
                                var str = tspan.split("-");
                                var containsHistory = false;
                                str.forEach(function(span){
                                    if(span==="annual")
                                        containsHistory = true;
                                });
                                if(containsHistory){

                                }
                                else{
                                    // the data for this time view is same time period shown in the main view
                                    // apply aggregation granularities:
                                    self.applyAggregateRuleTimeSub(str, viewId); 
                                }

                            }
                        },
                        buildMetaHierarchy: function(){
                            var self = this; 
                            var n=0, q=1, t=2, o=3; 
                            self.metaHier = {};
                            self.metaHier['name'] = "types"; 
                            self.metaHier['children'] = []; 
                            self.metaHier['children'].push({'name':'n', 'children': []});
                            self.metaHier['children'].push({'name':'q', 'children': []});
                            self.metaHier['children'].push({'name':'t', 'children': []});
                            self.metaHier['children'].push({'name':'o', 'children': []});
                            self.metaHier['children'][q]['children'].push({'name': 'delay', 'children': []});

                            for(var i=0; i < self.meta.length; i++){
                                var type; 
                                if( self.meta[i]['fieldType'] === "n")
                                    type = n; 
                                else if(self.meta[i]['fieldType'] === "q")
                                    type = q; 
                                else if(self.meta[i]['fieldType'] === "t")
                                    type = t;
                                else if(self.meta[i]['fieldType'] === "o")
                                    type = o; 

                                self.metaHier['children'][type]['children'].push({'name': self.meta[i]['fieldName'], 
                                                                                   'children':[] });


                            }
                            //console.log(self.meta);
                            //console.log("METAHIER: ");
                            //console.log(self.metaHier); 

                        },
                        /**
                         * Handle the case where we have 2 quantitatives in the master task
                         * This will toss all categories as slaves
                         * 
                         **/
                        list2QCats: function(viewId){
                            var self = this;
                            var auditVars = (self.audit === "picanet")? $Q.Picanet : $Q.Minap;                             
                            var cats = auditVars['displayVariables'][viewId]['categories'];
                            return cats; 
                        },
                        list2QComp: function(viewId){
                            var self = this;
                            var auditVars = (self.audit === "picanet")? $Q.Picanet : $Q.Minap;                             
                            var comps = auditVars['displayVariables'][viewId]['quantities'];
                            return comps;
                        },
                        computeVar: function(yvar, displayObj, i, sid){
                            var self = this;
                            var vname;
                            var vval; 
                            if(yvar.indexOf("_") < 0 ){
                                // this is a database variable
                                vname = yvar; 
                                vval = (displayObj["yaggregates"][sid] === "count")? 1 : self.data[i][vname];  
                            }
                            else{
                                // this is a derived variable
                                var strs = yvar.split("_");
                                var rule = strs[0]; 
                                vname = strs[1];
                                var derval = self.getDerivedValue(vname, i);
                                vval = (displayObj["yaggregates"][sid] === "count")? ((derval>0)? 1: 0) 
                                            : derval;  
                            }
                            if(!vval && yvar === "der_smr")
                                console.log(i);
                            return vval; 

                        },
                        applyAggregateRuleTimeSub: function(spans, viewId){
                            var self = this;
                            console.log(spans);
                        },
                        applyAggregateRule2: function(displayObj, displayId, data, redraw){
                            var self = this; 
                            var dict = {};
                            var metric = displayObj["metric"],
                                rule = displayObj["aggregate"],
                                scale = displayObj["scale"],
                                dateVar = displayObj["x"],
                                displayVar = displayObj["y"],
                                categoricals = displayObj["categories"],
                                levels = [],
                                slaves = {}; 
                            
                            // prepare the dict
                            if(displayVar.constructor == Array){                                
                                var xlevels = d3.map(self.data, function(item){
                                                return item[dateVar];
                                                }).keys();
                                
                                xlevels.forEach(function(level){
                                    dict[level] = {};
                                    dict[level][displayVar[0]] = {};
                                    dict[level][displayVar[1]] = {};
                                    });
                                //console.log(dict);
                                // any categoricals will be tossed for slave views + popover
                                slaves['cats'] = self.list2QCats(displayId); 
                                slaves['quants'] = self.list2QComp(displayId);
                                slaves['data'] = {}; 

                                
                                }
                            // one big for loop fits all
                            var ownrecords = 0;  // keep a count of this unit's records
                            var observedDeathsNational = {}; 
                            for(var i=0; i < self.data.length; i++){
                                /**
                                 * handle multiple quantitative variables
                                **/
                                if(displayVar.constructor == Array){
                                    // the main dict will hold aggregates for all variables assigned to y-axis                                    
                                    displayVar.forEach(function(yvar, id){
                                            //var vname;
                                            var vval = self.computeVar(yvar, displayObj, i, id);
                                            if(yvar === "der_death"){
                                                if(!observedDeathsNational[self.data[i][dateVar]])
                                                    observedDeathsNational[self.data[i][dateVar]] = vval; 
                                                else
                                                    observedDeathsNational[self.data[i][dateVar]] += vval; 
                                            }
                                            // select yspan items
                                            if(displayObj["yspan"] === "unit" && self.data[i]["siteidscr"] === self.unitID )
                                            {
                                                ownrecords++; 
                                                // update x-bin   
                                                if(!dict[self.data[i][dateVar]][yvar]["value"])
                                                    dict[self.data[i][dateVar]][yvar]["value"] = 0;                                             
                                                dict[self.data[i][dateVar]][yvar]["value"] += vval;

                                                if(!dict[self.data[i][dateVar]][yvar]["data"])
                                                    dict[self.data[i][dateVar]][yvar]["data"] = [];
                                                if(vval > 0) dict[self.data[i][dateVar]][yvar]["data"].push(i); 
                                            }
                                        });

                                        // setup fake categories and levels for main bar chart (or other vis)
                                        categoricals = displayObj["yaggregates"][0];                                         
                                        levels = displayVar; 

                                        // setup data aggregates for slave categories (this unit only)
                                        if(displayObj["yspan"] === "unit" && self.data[i]["siteidscr"] === self.unitID ){
                                            slaves['cats'].forEach(function(cat){
                                                // get the current rec's level of this categorical
                                                var lev = self.data[i][cat];
                                                if(!slaves['data'][cat])
                                                    slaves['data'][cat] = {};
                                                if(!slaves['data'][cat][lev]) slaves['data'][cat][lev] = [];
                                                else slaves['data'][cat][lev].push(i);  
                                            });
                                        }
                                        // setup quantitative slaves
                                        slaves['quants'].forEach(function(quant, sid){
                                            var subYlength = 1; 
                                            // if we need national data
                                            if(quant['granP'].constructor == Array || quant['granP'] === "national"){
                                                subYlength = 2; 
                                                if(!slaves['data'][quant['q']])
                                                    slaves['data'][quant['q']] = {}; 
                                                if(!slaves['data'][quant['q']][self.data[i][dateVar]])
                                                    slaves['data'][quant['q']][self.data[i][dateVar]] =  {};
                                                if(!slaves['data'][quant['q']][self.data[i][dateVar]]['national'])
                                                    slaves['data'][quant['q']][self.data[i][dateVar]]['national'] = parseFloat(self.computeVar(quant['q'], quant, i, sid));
                                                    
                                                else{
                                                    slaves['data'][quant['q']][self.data[i][dateVar]]['national'] += parseFloat(self.computeVar(quant['q'], quant, i, sid));
                                                    //console.log(slaves['data'][quant['q']]['national'][self.data[i][dateVar]]);                                             
                                                }
                                                if(!slaves['data'][quant['q']][self.data[i][dateVar]])
                                                    slaves['data'][quant['q']][self.data[i][dateVar]] = {};
                                                if(!slaves['data'][quant['q']][self.data[i][dateVar]]['unit'])
                                                    slaves['data'][quant['q']][self.data[i][dateVar]]['unit'] = (self.data[i]["siteidscr"] === self.unitID )? parseFloat(self.computeVar(quant['q'], quant, i, sid)) : 0;                                               
                                                else
                                                    slaves['data'][quant['q']][self.data[i][dateVar]]['unit'] += (self.data[i]["siteidscr"] === self.unitID )? parseFloat(self.computeVar(quant['q'], quant, i, sid)) : 0;

                                            }

                                        }); 
                                        // setup comparators from other units if needed
                                        /*slaves['compareTo'].forEach(function(comp){
                                            if(comp === "siteidscr"){
                                                var lev = self.data[i][comp];
                                                if(!slaves['data'][comp])
                                                    slaves['data'][comp] = {};
                                                if(!slaves['data'][comp][lev])
                                                    slaves['data'][comp][lev] = 1;
                                                else
                                                    slaves['data'][comp][lev]++; 
                                            }
                                        }); */                                       
                                     }
                                
                                /**
                                 * handle categories
                                **/
                                else if(categoricals.length >=1 ){
                                    // only one variable is assigned to y-axis
                                    // use the first categorical to group the y-axis

                                    // any remaining categoricals are tossed for slave view + popover
                                }

                                /**
                                 * handle comparators
                                 **/

                            } // end for data records

                             if(displayObj["quantities"]){
                                    displayObj["quantities"].forEach(function(quant){
                                        if(quant['q'] === "der_smr" && slaves['data'][quant['q']]){
                                            //var national = slaves['data'][quant['q']]['national'];
                                            //var unit = slaves['data'][quant['q']]['unit'];
                                            for(var key in slaves['data'][quant['q']]){
                                                slaves['data'][quant['q']][key]['national'] = observedDeathsNational[key] / slaves['data'][quant['q']][key]['national'];
                                                slaves['data'][quant['q']][key]['unit'] = dict[key]["der_death"]['value'] / slaves['data'][quant['q']][key]['unit']; 
                                                //national = observedDeathsNational[key] / national;
                                                //unit = dict[key]["der_death"]['value'] / unit; 
                                            }
                                            //slaves['data'][quant['q']]['national'] = national;
                                            //slaves['data'][quant['q']]['unit'] = unit; 
                                        }
                                    });
                                 }
                                 console.log(slaves['data']); 
                               /**
                                * In all cases sort dict by date (assuming x-axis is temporal)
                                * TODO: handle the case where x-axis is not actually temporal
                                *
                                    function custom_sort(a,b){
                                        return parseInt(a) - parseInt(b); 
                                    }
        
                                    var ordered = [];
                                    var temp = Object.keys(dict);
                                    //////console.log(temp); 
                                    var orderedKeys = Object.keys(dict).sort(custom_sort);
                                    //////console.log(orderedKeys);
        
                                    for(var k= 0; k < orderedKeys.length; k++){
                                        var obj = {};
                                        obj[orderedKeys[k]] = dict[orderedKeys[k]];
                                        ordered.push(obj); 
                                    }
                                **/
                                
                                // filter comparators to only units with similar no. of admissions
                                /*var filtered = {}; 
                                filtered['data'] = {};
                                filtered['data'][slaves['compareTo'][0]] = {};

                                for(var key in slaves['data'][slaves['compareTo'][0]]){
                                    if(Math.abs(slaves['data'][slaves['compareTo'][0]][key] - ownrecords) <=100 )
                                        filtered['data'][slaves['compareTo'][0]][key] = slaves['data'][slaves['compareTo'][0]][key]; 
                                }
                                /*slaves['data'][slaves['compareTo'][0]] = filtered['data'][slaves['compareTo'][0]]; 
                                console.log(slaves['data'][slaves['compareTo'][0]]);
                                console.log("OWN "+ ownrecords); */
                                self.dataViews.push({"viewId": displayId,   
                                                    "data": dict, 
                                                    "metric": self.availMetrics[displayId]['value'], 
                                                    "mark": displayObj["mark"],
                                                    "yscale": displayObj["granP"],
                                                    "cats": categoricals,
                                                    "levels": levels,
                                                    "slaves": slaves, 
                                                    "ylength": displayObj["y"].length, 
                                                    "metricLabel": self.availMetrics[displayId]['text']});                                 
                        },
                        applyAggregateRule: function(displayObj, displayId, data, redraw){
                            var self = this; 
                            var dict = {};
                            var metric = displayObj["metric"],
                                rule = displayObj["aggregate"],
                                scale = displayObj["scale"],
                                dateVar = displayObj["x"],
                                displayVar = displayObj["y"],
                                categoricals = displayObj["categories"];
                            
                            if(redraw)
                                categoricals = self.categoricals[displayId]; 
                            //console.log(displayObj);
                            if(displayVar === "derived")
                                displayVar = self.calculateDerivedVar(metric, displayVar); 
                            //else if(displayVar.constructor == Array){}
                            
                            //console.log(categoricals); 

                            if(!categoricals){
                                for(var i=0; i< data.length; i++){
                                    // get the month of this entry
                                    var date = self.stringToDate(data[i][dateVar]);                                                        
                                    var month = self.months[date.getMonth()];
                                    var year = date.getYear()+1900; 
                                    var my = month+"-"+year; 
                                    //////console.log(my); 
                                    dict[my] = dict[my]? dict[my]+parseInt(data[i][displayVar]) : parseInt(data[i][displayVar]);
    
                                }
    
                                ////console.log(dict); 
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
                                //////console.log(temp); 
                                var orderedKeys = Object.keys(dict).sort(custom_sort);
                                //////console.log(orderedKeys);
    
                                for(var k= 0; k < orderedKeys.length; k++){
                                    var obj = {};
                                    obj['date'] = orderedKeys[k];
                                    obj['number'] = dict[orderedKeys[k]];
                                    ordered.push(obj); 
    
                                }
    
                                ////console.log(ordered); 
                                //self.control.drawChart(displayId, ordered); 
                                self.dataViews.push({"viewId": displayId,   
                                                    "data": ordered, 
                                                    "metric": self.availMetrics[displayId]['value'], 
                                                    "metricLabel": self.availMetrics[displayId]['text']});
                            }
                            else if(categoricals.length === 1){  // count within categories
                                var cat = categoricals[0];
                                //console.log(cat);

                                var levels = d3.map(self.data, function(item){
                                    return item[cat];
                                    }).keys();
                                //console.log(levels);
                                for(var i=0; i< data.length; i++){
                                                        // get the month of this entry
                                                        var date = self.stringToDate(data[i][dateVar]);
                                                        //////console.log(date); 
                                                        var month = self.months[date.getMonth()];
                                                        var year = date.getYear()+1900; 
                                                        ////////console.log(month);
                                                        ////////console.log(year);
                                                        var my = month+"-"+year; 
                                                        //////console.log(my); 
                                                        if(!dict[my]){
                                                            dict[my] = {};
                                                            levels.forEach(function(level){
                                                                dict[my][level] = 0;
                                                            });

                                                        }
                                                        var level = data[i][cat];
                                                        dict[my][level] += parseInt(data[i][displayVar]);                                                        
                                                    }
                                ////console.log(dict);                             
                               if(redraw)    
                                    self.control.drawChart(displayId, dict, cat, levels);

                            }
                        else if(categoricals.length === 2){
                            //console.log("TWO CATS"); 

                            // new variable divides the trellis
                            var levels0 = d3.map(self.data, function(item){
                                    return item[categoricals[displayId][1]];
                                    }).keys();
                            
                            var levels1 = d3.map(self.data, function(item){
                                    return item[categoricals[displayId][0]];
                                    }).keys();
                            
                            ////console.log(levels0);
                            levels0.forEach(function(level){
                                dict[level] = {};
                            });
                            ////console.log(dict);
                            for(var i=0; i< data.length; i++){
                                                        // get the month of this entry
                                                        var date = self.stringToDate(data[i][dateVar]);
                                                        //////console.log(date); 
                                                        var month = self.months[date.getMonth()];
                                                        var year = date.getYear()+1900; 
                                                        ////////console.log(month);
                                                        ////////console.log(year);
                                                        var my = month+"-"+year; 
                                                        //////console.log(my); 
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
                               ////console.log(dict);
                               var levels = [levels0, levels1]; 
                            if(redraw)
                                self.control.drawChart(displayId, dict, categoricals[displayId], levels, 1);


                        }
                       
                    }
        });
})(QUALDASH);


