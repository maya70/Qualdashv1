(function($Q){
    'use strict'
    $Q.Model = $Q.defineClass(
                    null, 
                    function Model(control){
                        var self = this;
                        self.control = control; 
                        self.dataViews = []; 
                        self.ehr = {};  // keeps a dictionary by patient NHS number for patient pathway calculations (including 48h readmission)
                        self.ehrHist = {};
                        //self.unitID = "194281";                        
                        self.slaves = {};
                        self.year = "2014"; 
                        self.cardCats = []; 
                        self.cardQs = []; 
                        self.missing = {}; 
                        /** availMetrics keeps a list of metrics that are made available 
                         *  in a drop-down menu for users to select from in each QualCard
                         *  Defaults for each audit are set here
                         *  On launching the site it will display metrics in this order 
                         */ 
                        self.audit = $Q.getUrlVars()["audit"];
                        self.unitID = (self.audit === "picanet")? "194281" :"MRI"; 
                        var auditMetrics = (self.audit==="picanet")? $Q.Picanet.availMetrics : $Q.Minap.availMetrics; 
                        var auditVariables = (self.audit==="picanet")? $Q.Picanet.displayVariables : $Q.Minap.displayVariables; 
                        
                        self.availMetrics = control.savedMetrics || auditMetrics ;   
                        self.displayVariables = control.savedVariables || auditVariables;
                          
                        self.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        //self.dateVar = self.;
                        //self.categoricals = [];
                        for(var i=0; i < self.displayVariables.length; i++){
                            //self.categoricals[i] = []; 
                            var auditVars = (self.audit === "picanet")? $Q.Picanet["displayVariables"][i]: $Q.Minap["displayVariables"][i];  
                            var cats = auditVars["categories"]; 
                            var qobjs = auditVars["quantities"];                                                               
                            self.cardCats.push(cats);
                            var qs = [];
                            qobjs.forEach(function(qobj){
                                qs.push(qobj['q']); 
                            });
                            self.cardQs.push(qs); 

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
                            //////console.log(metric); 
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
                            self.metaDict = {}; 
                            d3.csv("./data/minap_meta.csv", function(meta){
                                for(var k=0; k < meta.length; k++)
                                    if(meta[k]['fieldName'] !== ""){
                                        self.meta.push(meta[k]); 
                                        self.metaDict[meta[k]['fieldName']] = meta[k]['fieldType'];
                                    }
                                //self.meta = meta; 
                                ////console.log(meta); 
                                d3.csv("./data/minap_admission/"+self.year+".csv", function(data){
                                        ////console.log(data); 
                                        self.data = data;                                     
                                        ////////console.log(displayVar);
                                         for(var i=0; i < self.data.length; i++){
                                            self.data[i]["1.02 Patient case record number"] = ""+self.data[i]["1.02 Patient case record number"];                                            
                                        }                                    
                                       
                                        for(var display = 0; display < self.displayVariables.length; display++)
                                        {

                                            self.applyAggregateRule2(self.displayVariables[display], display, data);
                                        }
                                        self.loadHistory();
                                        self.control.dataReady(self.dataViews, self.data); 

                                    });
                                });
                            },
                        readPicanetData: function(){
                            var self = this; 
                            self.meta = [];
                            self.metaDict = {}; 
                            d3.csv("./data/picanet_meta.csv", function(meta){
                                for(var k=0; k < meta.length; k++){
                                    if(meta[k]['COLUMN_NAME'] !== ""){
                                        var metaEntry = {}; 
                                        metaEntry['fieldName'] = meta[k]['COLUMN_NAME'].toLowerCase();
                                        metaEntry['fieldType'] = (meta[k]['DATA_TYPE'] === "decimal")? "q" :
                                                                    (( meta[k]['DATA_TYPE'] === "smallint" )?"o" : 
                                                                        ((meta[k]['DATA_TYPE'] === "nvarchar" || meta[k]['DATA_TYPE'] === "varchar" || meta[k]['DATA_TYPE'] === "bit" || meta[k]['DATA_TYPE'] === "int")? "n" : "t"));
                                        self.meta.push(metaEntry); 
                                        
                                        self.metaDict[metaEntry['fieldName']] = metaEntry['fieldType'];
                                        
                                    }
                                }
                                
                                d3.csv("./data/picanet_admission/"+self.year+".csv", function(data){                                      
                                        self.data = data;  
                                        //console.log(self.data);
                                        for(var i=0; i < self.data.length; i++){
                                            self.data[i]["EVENTID"] = ""+self.data[i]["eventidscr"];                                            
                                        }                                    
                                        d3.csv("./data/picanet_admission/shortactiv"+self.year+".csv", function(extra){                                                                         
                                            
                                            self.activityIndex = {};
                                            for(var ex=0; ex < extra.length; ex++){
                                                if(extra[ex][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID){
                                                    if(!self.activityIndex[extra[ex]["eventidscr"]])
                                                        self.activityIndex[extra[ex]["eventidscr"]] = [];
                                                    self.activityIndex[extra[ex]["eventidscr"]].push(extra[ex]);
                                                }
                                            }
                                            //console.log(self.activityIndex); 
                                            
                                            for(var display = 0; display < self.displayVariables.length; display++)
                                            { 
                                               self.applyAggregateRule2(self.displayVariables[display],display, data);
                                            }
                                            ////console.log(self.dataViews);
                                            self.loadHistory();
                                            self.control.dataReady(self.dataViews, self.data); 
                                        });
                                    });
                                });
                            },
                        getTimeQs: function(viewId){
                            var self = this; 
                            var Qs = []; 
                            var auditVars = self.audit === "picanet"? $Q.Picanet['displayVariables'][viewId]: $Q.Minap['displayVariables'][viewId];
                            for(var key in auditVars['granT']){
                                var granT = auditVars['granT'][key]; 
                                if(granT.constructor === Array){
                                    granT.forEach(function(g){
                                        if(Qs.indexOf(g) < 0)
                                            Qs.push(g);       
                                    });
                                }
                                else if(Qs.indexOf(granT) < 0 )
                                    Qs.push(granT);
                            }
                            return Qs; 
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
                                        ////console.log("Loading History");
                                        var yearupdated = data[0][[$Q.DataDefs[self.audit]["yearVar"]]]; 
                                        for(var d = 0; d < data.length; d++){
                                            // load historical data for this unit only unless required otherwise
                                            if(data[d][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID ){
                                                for(var v = 0; v < self.dataViews.length; v++){
                                                    var Qs = self.getTimeQs(v); 
                                                    var metric = self.dataViews[v]['metric'];
                                                    Qs.forEach(function(qname){ 
                                                        self.recordEHR(data[d], d , metric, yearupdated);
                                                        var qobj = self.getQObject(qname, v); 
                                                        if(qobj){
                                                                var qval = parseFloat(self.computeVar(qname, qobj, data[d], 0, 0)) ; 
                                                                self.updateTimeHierarchy(yearupdated, qname, v, data[d], qval);
                                                            }
                                                    });
                                                }
                                            }
                                        }
                                        self.postProcessHistory(yearupdated, "der_readmit" ); 
                                        //console.log(self.tHier); 

                                    });
                                } 

                            }
                            else
                            {
                                tspan = $Q.Minap['displayVariables'][0]['tspan']; 
                                fpath = "./data/minap_admission/";

                                for(var i=1; i < tspan; i++){                                    
                                    var year = parseInt(self.year)-i;                                 
                                    d3.csv(fpath+year+".csv", function(data){                                        
                                        ////console.log("Loading History");
                                        var yearupdated = data[0][[$Q.DataDefs[self.audit]["yearVar"]]] || self.stringToDate(data[0][[$Q.DataDefs[self.audit]["admissionDateVar"]]]).getYear()+1900; 
                                        for(var d = 0; d < data.length; d++){
                                            // load historical data for this unit only unless required otherwise
                                            if(data[d][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID ){
                                                for(var v = 0; v < self.dataViews.length; v++){
                                                    var Qs = self.getTimeQs(v); 
                                                    var metric = self.dataViews[v]['metric'];
                                                    Qs.forEach(function(qname){ 
                                                        self.recordEHR(data[d], d , metric, yearupdated);
                                                        var qobj = self.getQObject(qname, v); 
                                                        if(qobj){
                                                                var qval = parseFloat(self.computeVar(qname, qobj, data[d], 0, 0)) ; 
                                                                self.updateTimeHierarchy(yearupdated, qname, v, data[d], qval);
                                                            }
                                                    });
                                                }
                                            }
                                        }
                                        self.postProcessHistory(yearupdated, "der_readmit" ); 
                                       
                                    });
                                } 

                            }
                            
                        },
                        getQObject: function(qname, viewId){
                            var self = this;
                            var qres;  
                            var auditVars = self.audit === "picanet"? $Q.Picanet['displayVariables'][viewId] : $Q.Minap['displayVariables'][viewId];
                            auditVars['quantities'].forEach(function(qobj){
                                if(qobj['q'] === qname){
                                            qres = qobj;
                                        }
                            });
                            return qres; 
                        },
                        addCategorical: function(viewId, varName){
                            var self = this;
                            //var viewId = id[id.length-1];
                            ////////console.log("VIEW ID = "+ viewId); 
                            self.categoricals[viewId].push(varName);
                            self.applyAggregateRule(self.displayVariables[viewId], viewId, self.data, 1 );
                        },
                        resetCategoricals: function(viewId){
                            var self = this;
                            self.categoricals[viewId] = []; 
                        },
                        setCategoricals: function(viewId, newcats){
                            var self = this;
                            self.cardCats[viewId] = newcats; 
                            // update the slaves data structure
                            var slaves = {};
                            slaves['cats'] = newcats; 
                            slaves['data'] = {};

                            for(var i=0; i < self.data.length; i++){
                                // setup data aggregates for slave categories (this unit only)
                                if(self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID ){
                                        slaves['cats'].forEach(function(cat){
                                            // get the current rec's level of this categorical
                                            var lev = self.data[i][cat];
                                            if(!slaves['data'][cat])
                                                slaves['data'][cat] = {};
                                            if(!slaves['data'][cat][lev]) slaves['data'][cat][lev] = [];
                                            else slaves['data'][cat][lev].push(i);  
                                         });
                                    }
                                }
                            // update the model's cats for this view
                            self.slaves[viewId]['cats'] = newcats;
                            // merge into the model's slaves' data
                            for(var key in slaves['data']){
                                if(!self.slaves[viewId]['data'][key])
                                    self.slaves[viewId]['data'][key] = slaves['data'][key];
                            }                              
                            self.control.updateDataViews(viewId, self.slaves);
                        },
                        getCategoricals: function(viewId){
                            return this.cardCats[viewId];
                        },
                        getQs: function(viewId){
                            return this.cardQs[viewId]; 
                        },
                        setQuantitatives:function(viewId, newQs){
                            var self = this;
                            self.cardQs[viewId] = newQs; 
                            // update the slaves data structure
                            var slaves = {};
                            slaves['quants'] = []; 
                            slaves['data'] = {};
                            newQs.forEach(function(q){
                                slaves['quants'].push({"q": q, "yaggregates": "sum"}); // TODO: find a way to modify this default
                            });
                            // same x-axis as main view
                            var auditVars = (self.audit === "picanet")? $Q.Picanet["displayVariables"][viewId]: $Q.Minap["displayVariables"][viewId] ;
                            var dateVar = auditVars['x'];

                            for(var i=0; i < self.data.length; i++){
                                // setup data aggregates for slave categories (this unit only)
                                
                                slaves['quants'].forEach(function(quant, sid){
                                    if(self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID ){
                                            var qval = parseFloat(self.computeVar(quant['q'], quant, self.data[i], sid, viewId)) ; 

                                            if(!slaves['data'][quant['q']])
                                                slaves['data'][quant['q']] = {}; 
                                            if(!slaves['data'][quant['q']][self.data[i][dateVar]])
                                                slaves['data'][quant['q']][self.data[i][dateVar]] =  {};
                                            if(!slaves['data'][quant['q']][self.data[i][dateVar]])
                                                slaves['data'][quant['q']][self.data[i][dateVar]] = {};
                                            if(!slaves['data'][quant['q']][self.data[i][dateVar]]['unit'])
                                                slaves['data'][quant['q']][self.data[i][dateVar]]['unit'] = (self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID )? qval : 0;                                               
                                            else
                                                slaves['data'][quant['q']][self.data[i][dateVar]]['unit'] += (self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID )? qval : 0;
                                            
                                            
                                            if(!slaves['data'][quant['q']][self.data[i][dateVar]]['data'])
                                                slaves['data'][quant['q']][self.data[i][dateVar]]['data'] = [];
                                            
                                            if(self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID )
                                                slaves['data'][quant['q']][self.data[i][dateVar]]['data'].push(i);

                                            //keeping national computations the same for now
                                            if(!slaves['data'][quant['q']][self.data[i][dateVar]]['national'])
                                                        slaves['data'][quant['q']][self.data[i][dateVar]]['national'] = qval;            
                                            else
                                                slaves['data'][quant['q']][self.data[i][dateVar]]['national'] += qval;
                                                ////console.log(slaves['data'][quant['q']]['national'][self.data[i][dateVar]]);                                             
                                            
                                            
                                            }

                                         });
                                                                    
                                    
                                }
                            // update the model's cats for this view
                            self.slaves[viewId]['quants'] = slaves['quants'];
                            // merge into the model's slaves' data
                            for(var key in slaves['data']){
                                if(!self.slaves[viewId]['data'][key])
                                    self.slaves[viewId]['data'][key] = slaves['data'][key];
                            }                              
                            self.control.updateDataViews(viewId, self.slaves);

                        },
                        getSlaves: function(viewId){
                            return this.slaves[viewId]; 
                        },
                        getRecordById: function(recId){
                            var self = this;
                            return self.data[recId]; 
                        },
                        metaRecByFieldName: function(vname){
                            var self = this;
                            for(var m=0; m < self.meta.length; m++){
                                if(self.meta[m]["fieldName"] === vname)
                                    return true; 
                            }
                        },
                        setDerivedValue: function(viewId, recId, vname, value){
                            var self = this; 
                            var auditVars = self.audit === "picanet"? $Q.Picanet["displayVariables"][viewId] : $Q.Minap["displayVariables"][viewId];  
                            if(!self.metaDict[vname]){
                                auditVars["quantities"].forEach(function(qobj){
                                    if(qobj['q'] === vname){
                                        // see if a metadata entry exists for this field
                                        if(!self.metaRecByFieldName(vname))
                                            self.meta.push({"fieldName":vname , "fieldType": "q"});                                     
                                    }
                                });                                
                            self.data[recId][vname] = value; 
                            }
                            
                        },
                        recordMissing: function(vname, rec){
                            var self = this;
                            if(!self.missing[vname])
                                self.missing[vname] = 1; 
                            else
                                self.missing[vname]++; 
                        },
                        getDerivedValue: function(vname, rec, mainview){
                            var self = this;
                            //TODO: use callbacks for variable rules instead of this exhaustive branching

                            if(vname === "death" && self.audit === "picanet"){
                                if(rec[$Q.DataDefs[self.audit]["dischargeStatusVar"]] === "2")
                                    return 1;
                                else{
                                    var val = rec[$Q.DataDefs[self.audit]["dischargeStatusVar"]];
                                    if(val !== "1" && val !== "9")
                                        self.recordMissing("der_"+vname, rec);
                                    return 0; 
                                }
                            }
                            else if(vname === "smr" && self.audit === "picanet"){
                                if(isNaN(rec["pim3_s"]))
                                    self.recordMissing("der_"+vname, rec);
                                return rec["pim3_s"]; 
                            }
                            else if(vname === "discharge"){
                                if((rec[$Q.DataDefs[self.audit]["dischargeStatusVar"]] === "1" && self.audit === "picanet") || 
                                    (rec[$Q.DataDefs[self.audit]["dischargeStatusVar"]] !== "4" && self.audit === "minap") )
                                    return 1;
                                else{
                                    var val = rec[$Q.DataDefs[self.audit]["dischargeStatusVar"]];
                                    if(isNaN(val) || val === "NA" || val === "")
                                        self.recordMissing("der_"+vname, rec); 
                                    return 0; 
                                }
                            }
                            else if(vname === "readmit"){
                                    return 0; 
                                }
                            else if(vname === "bedDays"){
                                if(!self.excessDays)  // record bed days for additional months if the 
                                        self.excessDays = {};  // admission and discharge are not in the same month
                                    
                                var one_day = 1000*60*60*24;  
                                var d1 = self.stringToDate(rec[$Q.DataDefs[self.audit]["dischargeDateVar"]]).getTime(),
                                    m1 = self.stringToMonth(rec[$Q.DataDefs[self.audit]["dischargeDateVar"]]);
                                var d2 = self.stringToDate(rec[$Q.DataDefs[self.audit]["admissionDateVar"]]).getTime(),
                                    m2 = self.stringToMonth(rec[$Q.DataDefs[self.audit]["admissionDateVar"]]);

                                if(isNaN(d1) || isNaN(d2))
                                    self.recordMissing("der_"+vname, rec);   

                                var dayCount = Math.round(Math.abs( d1 - d2)/one_day*10)/10;   

                                if(mainview && m1 !== m2){
                                    // toss days to the following months (after admission month)
                                    for(var m= m2+1; m <= m1; m++){ 
                                        var span =0; 

                                        // did discharge happen in this month?                                        
                                        if(m === m1){
                                            var lastDayPrevMon = new Date(self.year, m, 0);
                                            span = Math.round(Math.abs(d1 - lastDayPrevMon.getTime())/one_day*10)/10;     
                                        }
                                        else{
                                            // patient was in hospital throughout this whole month
                                         var firstDay = new Date(self.year, m, 0); //self.stringToDate("1/"+m+"/"+self.year).getTime();
                                         var lastDay = new Date(self.year, (m+1), 0); //self.stringToDate("1/"+(m+1)+"/"+self.year).getTime();
                                         span = Math.round(Math.abs(lastDay.getTime() - firstDay.getTime())/one_day*10)/10;
                                        }
                                        if(rec[$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID )
                                            {                                           
                                            if(!self.excessDays[m])
                                                self.excessDays[m] = {};
                                            if(!self.excessDays[m][rec[$Q.DataDefs[self.audit]["patientIdVar"]]])
                                                self.excessDays[m][rec[$Q.DataDefs[self.audit]["patientIdVar"]]] = [];
                                            self.excessDays[m][rec[$Q.DataDefs[self.audit]["patientIdVar"]]].push(span); 
                                            }

                                    }                                    
                                    // record bed days from admission day to the end of admission month only
                                    var dd = new Date(self.year, (m2+1), 0);
                                    dayCount = Math.round(Math.abs(dd.getTime() - d2)/one_day*10) / 10;
                                }
                                
                                return dayCount;
                            }
                            else if(vname === "invVentDays" && self.audit === "picanet"){                                
                                return  parseInt(rec["invventday"]) >0  ? 1 : 0; 
                                /*var countVent = 0; 
                                // get the corresponding activity records
                                var active = self.activityIndex[rec["EVENTID"]];
                                if(active){
                                    active.forEach(function(a){
                                        if(parseInt(a["invventet"]) === 1 )
                                            //|| a["ventilationstatus"] === "Invasive only" 
                                            //|| a["ventilationstatus"] === "Both")
                                            countVent++; 
                                    });
                                    return countVent; 
                                }
                                return 0; */
                            }
                            else if(vname === "noninvVentDays" && self.audit === "picanet"){
                                return parseInt(rec["noninvventday"]) || 0; 
                            }
                            else if(vname === "unplannedAdm" && self.audit === "picanet"){
                                return  (parseInt(rec["adtype"]) === 2 || parseInt(rec["adtype"]) === 4)? 1 : 0; 
                            }
                            else if(vname === "extubation" && self.audit === "picanet"){
                                return (parseInt(rec["unplannedextubation"])===1)? 1: 0;
                                /*var countVent = 0; 
                                // get the corresponding activity records
                                var active = self.activityIndex[rec["EVENTID"]];
                                if(active){
                                    active.forEach(function(a, i){
                                        active.forEach(function(b, j){
                                            if( (i < j) && a["invventet"] === "1" && b["invventet"] === "0") 
                                                //&& self.stringToDate(a["addate"]).getTime() < self.stringToDate(b["addate"]).getTime())
                                                countVent++; 
                                        });
                                    });
                                    return countVent; 
                                }
                                return 0; */

                            }
                            else if(self.audit === "picanet" && vname==="depLevel0"){
                                var countDep = 0; 
                                var active = self.activityIndex[rec["EVENTID"]];
                                if(active){
                                    active.forEach(function(a,i){
                                        if(a["hrggroup"] === "Unable to Group"){
                                            countDep++;
                                        }
                                    });
                                }
                                return countDep; 

                            }
                            else if(self.audit === "picanet" && vname==="depLevelEC"){
                                var countDep = 0; 
                                var active = self.activityIndex[rec["EVENTID"]];
                                if(active){
                                    active.forEach(function(a,i){
                                        if(a["hrggroup"] === "Enhanced Care"){
                                            countDep++;
                                        }
                                    });
                                }
                                return countDep; 

                            }
                            else if(self.audit === "picanet" && vname==="depLevel1"){
                                var countDep = 0; 
                                var active = self.activityIndex[rec["EVENTID"]];
                                if(active){
                                    active.forEach(function(a,i){
                                        if(a["hrggroup"] === "High Dependency"){
                                            countDep++;
                                        }
                                    });
                                }
                                return countDep; 
                            }
                            else if(self.audit === "picanet" && vname==="depLevel2"){
                                var countDep = 0; 
                                var active = self.activityIndex[rec["EVENTID"]];
                                if(active){
                                    active.forEach(function(a,i){
                                        if(a["hrggroup"] === "High Dependency Advanced"){
                                            countDep++;
                                        }
                                    });
                                }
                                return countDep; 

                            }
                            else if(self.audit === "picanet" && vname==="depLevel3"){
                                var countDep = 0; 
                                var active = self.activityIndex[rec["EVENTID"]];
                                if(active){
                                    active.forEach(function(a,i){
                                        if(a["hrggroup"] === "Intensive Care Basic"){
                                            countDep++;
                                        }
                                    });
                                }
                                return countDep; 

                            }
                            else if(self.audit === "picanet" && vname==="depLevel4"){
                                var countDep = 0; 
                                var active = self.activityIndex[rec["EVENTID"]];
                                if(active){
                                    active.forEach(function(a,i){
                                        if(a["hrggroup"] === "Intensive Care Basic Enhanced"){
                                            countDep++;
                                        }
                                    });
                                }
                                return countDep; 

                            }
                            else if(self.audit === "picanet" && vname==="depLevel5"){
                                var countDep = 0; 
                                var active = self.activityIndex[rec["EVENTID"]];
                                if(active){
                                    active.forEach(function(a,i){
                                        if(a["hrggroup"] === "Intensive Care Advanced"){
                                            countDep++;
                                        }
                                    });
                                }
                                return countDep; 

                            }
                            else if(self.audit === "picanet" && vname==="depLevel6"){
                                var countDep = 0; 
                                var active = self.activityIndex[rec["EVENTID"]];
                                if(active){
                                    active.forEach(function(a,i){
                                        if(a["hrggroup"] === "Intensive Care Advanced Enhanced"){
                                            countDep++;
                                        }
                                    });
                                }
                                return countDep; 

                            }
                            else if(vname === "invalid" && self.audit === "picanet"){
                                var count = 0; 
                                for(var key in rec){
                                    if(rec[key] === "INV")
                                        count++;
                                }
                                return count; 
                            }
                            else if(vname === "stemi"){
                                return rec["2.01 Initial diagnosis"] === "1" ? 1: 0; 
                            }
                            else if(vname === "nstemi"){
                                return rec["2.01 Initial diagnosis"] === "1" ? 0: 1; 
                            }
                            else if(vname === "ctbTarget"){
                                return (rec["2.01 Initial diagnosis"] === "1" && rec["3.10 Delay before treatment"] !== "0")? 1: 0; 
                            }
                            else if(vname === "ctbTargetMet"){
                                return (rec["2.01 Initial diagnosis"] === "1" && rec["3.10 Delay before treatment"] === "0")? 1: 0; 
                            }
                            else if(vname === "ctb"){
                                return (self.stringToDate(rec["3.09 Date/time of reperfusion treatment"], 1) - self.stringToDate(rec["3.02 Date/time of call for help"], 1))/60000;
                            }
                            else if(vname === "dtb"){
                                var dtb = (self.stringToDate(rec["3.09 Date/time of reperfusion treatment"], 1) - self.stringToDate(rec["3.06 Date/time arrival at hospital"], 1))/60000;
                                return (self.stringToDate(rec["3.09 Date/time of reperfusion treatment"], 1) - self.stringToDate(rec["3.06 Date/time arrival at hospital"], 1))/60000;
                            }
                            else if(vname === "angioTarget"){
                                var tta = (self.stringToDate(rec["4.18 Local angio date"], 1) - self.stringToDate(rec["3.02 Date/time of call for help"], 1))/60000;
                                return (rec["2.01 Initial diagnosis"] !== "1" &&  tta > 360)? 1: 0; 
                            }
                            else if(vname === "reqEcho"){
                                var possible = ["1", "2", "3", "4", "5", "9"];
                                return (rec["2.01 Initial diagnosis"] === "1"  && rec["2.03 ECG determining treatment"] === 1 && possible.indexOf(rec["2.36 Site of infarction"])>=0)? 1: 0; 
                            }
                            else if(vname === "missing" && self.audit === "picanet"){
                                var count = 0;
                                for(var key in rec){
                                    if(rec[key] === "NA")
                                        count++;
                                }
                                return count; 
                            }
                        },
                        calculateDerivedVar: function(metric, yvar){
                            //////console.log("Calculating "+ metric); 
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
                                    //////console.log(diff); 
                                    self.data[i][metric] = ((diff > 0) && (diff <= 2))? 1: 0; */
                                }
                                else if(metric === "Length of Stay"){
                                    var adm = self.data[i]["3.06 Date/time arrival at hospital"];
                                    var disc = self.data[i]["4.01 Date of discharge"];
                                    var one_day = 1000*60*60*24; 
                                    self.data[i][metric] = (self.stringToDate(disc).getTime() - self.stringToDate(adm).getTime())/one_day; 
                                }

                            }        
                            ////////console.log(self.ehr); 
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
                                //    ////console.log(self.data[j][metric]);
                            return metric; 
                        },
                        
                        stringToMonth: function(str){
                            var self = this; 
                             var time, timeParts, hour, minute, second;
                            var strings = str.split(" ");
                            var date = strings[0];
                                time = strings[1];
                            var dateSeparator = (date.indexOf("/")>0)? "/": "-";

                            var dateParts = date.split(dateSeparator);
                            if(time) timeParts = time.split(":");
                            var day = dateParts[0],
                                month = dateParts[1],
                                year = (dateParts[2] && dateParts[2].length<=2)? "20"+dateParts[2]: dateParts[2];
                            if(timeParts){
                                hour = timeParts[0],
                                minute = timeParts[1],
                                second = timeParts[1];   
                            }
                           return parseInt(month); 
                        },
                        /** Utility function that converts dates from the MINAP-specified format dd/mm/yyyy hh:mm
                        *   to an ISO-friendly Date() object
                        */
                        stringToDate: function(str, timeElement){
                            var self = this;
                            var time, timeParts, hour, minute, second;
                            var strings = str.split(" ");
                            var date = strings[0];
                                time = strings[1];
                            var dateSeparator = (date.indexOf("/")>0)? "/": "-";

                            var dateParts = date.split(dateSeparator);
                            if(time) timeParts = time.split(":");
                            var day = dateParts[0],
                                month = dateParts[1],
                                year = (dateParts[2] && dateParts[2].length<=2)? "20"+dateParts[2]: dateParts[2];
                            if(timeParts){
                                hour = timeParts[0],
                                minute = timeParts[1],
                                second = timeParts[1];   
                            }
                            
                            if(timeElement)
                                return new Date(year + "-" + month + "-" + day + "T"+ hour + ":"+ minute+":"+ second +"Z"); 
                            else
                                return new Date(parseInt(year), (parseInt(month)), parseInt(day), 0); 

                        },
                        getTimeHier:function(){
                            var self= this;
                            return self.tHier; 
                        },
                        listTimeVar: function(t){
                            var self = this;
                            if(t === "weekly")
                                return self.audit === "picanet"? "adweek": "";
                            if(t === "monthly")
                                return self.audit === "picanet"? "admonth": "";
                            if(t === "quarterly")
                                return self.audit === "picanet"? "adquarter": "";
                            if(t === "annual")
                                return self.audit === "picanet"? "adyear": "";
                              
                        },
                        buildTimeHierarchy: function(data, viewId, vname){
                            var self = this;                             
                            var result = [];
                            for(var key in data){
                                var tempres = [];
                                var year = self.year;
                                var k = parseInt(key);
                                var quarter =  k < 4 ? 1: (k < 7? 2: (k < 10? 3 : 4)) ;
                                
                                for(var i=0; i < 4; i++){
                                    var temp = {};
                                    temp['year'] = year;
                                    temp['quarter'] = quarter;
                                    temp['month'] = key;
                                    temp['week'] = i+1;
                                    temp['number'] = 0;
                                    tempres.push(temp);                                     
                                }

                                    data[key][vname]['data'].forEach(function(recId){
                                        var weeksToThisMonth = 4.348125 * (parseInt(self.data[recId][self.listTimeVar('monthly')])-1);                                        
                                        var wid = parseInt(self.data[recId][self.listTimeVar('weekly')]) - parseInt(weeksToThisMonth);
                                        if((wid>4) && (tempres.length < 5)){
                                             
                                            tempres.push({'year': year, 
                                                            'quarter': quarter,
                                                            'month': key, 
                                                            'week': 5,
                                                            'number': 0 });
                                        }
                                        tempres[(wid-1)]['number']++;
                                    });
                                   tempres.forEach(function(tr){
                                    result.push(tr); 
                                   });
                                
                            }
                            ////console.log(data);
                            ////console.log(result);
                            return result; 
                        },
                        prepTimeData: function(span, viewId, vname){
                            var self = this;
                            var tspan = Object.keys(span);
                            if(tspan.indexOf("-")>=0){ // this is a composite time span 
                                var str = tspan.split("-");
                                var containsHistory = false;
                                str.forEach(function(span){
                                    if(span==="annual")
                                        containsHistory = true;
                                });
                                if(containsHistory){
                                    return self.history; 
                                }
                                else{
                                    // the data for this time view is same time period shown in the main view
                                    // apply aggregation granularities:
                                    return self.buildTimeHierarchy(self.dataViews[viewId]['data'], viewId, vname); 
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
                            ////console.log(self.meta);
                            ////console.log("METAHIER: ");
                            ////console.log(self.metaHier); 

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
                        /*list2QCombo: function(viewId){
                            var self = this;
                            var auditVars = (self.audit === "picanet")? $Q.Picanet : $Q.Minap;                             
                            var comps = auditVars['displayVariables'][viewId]['combinations'];
                            return comps;
                        },*/
                        list1QCats: function(viewId){
                            var self = this;
                            var auditVars = (self.audit === "picanet")? $Q.Picanet : $Q.Minap;                             
                            var cats = auditVars['displayVariables'][viewId]['categories'];
                            cats.splice(0,1);
                            return cats; 
                        },
                        list1QComp: function(viewId){
                            var self = this;
                            var auditVars = (self.audit === "picanet")? $Q.Picanet : $Q.Minap;                             
                            var comps = auditVars['displayVariables'][viewId]['quantities'];
                            return comps;
                        },
                        /*list1QCombo: function(viewId){
                            var self = this;
                            var auditVars = (self.audit === "picanet")? $Q.Picanet : $Q.Minap;                             
                            var comps = auditVars['displayVariables'][viewId]['combinations'];
                            return comps;
                        },*/
                        computeVar: function(yvar, displayObj, rec, sid, viewId, mainview){
                            var self = this;
                            var vname;
                            var vval;
                            var isDerived = false; 
                            var auditVars = (self.audit === "picanet")? $Q.Picanet["displayVariables"][0]: $Q.Minap["displayVariables"][viewId] ;
                            var dateVar = auditVars['x'];
                            var yaggregates = (displayObj["yaggregates"].constructor === Array)? displayObj["yaggregates"][sid] : displayObj["yaggregates"] ;
                            

                            if(yvar.indexOf("_") >= 0 ){
                                var strs = yvar.split("_");
                                if(strs[0] === "der")
                                    isDerived = true;
                            }

                            if(!isDerived ){
                                // this is a database variable
                                vname = yvar; 
                                vval = (yaggregates === "count")? 1 : rec[vname];  
                                if(isNaN(vval)){
                                    vval = 0;
                                    if(!self.missing[yvar])
                                        self.missing[yvar] = 1;
                                    //if(!self.missing[yvar][dateVar])
                                    //    self.missing[yvar][dateVar] = 1; 
                                    else 
                                        self.missing[yvar]++; 
                                }
                            }
                            else{
                                // this is a derived variable
                                var strs = yvar.split("_");
                                var rule = strs[0]; 
                                vname = strs[1];
                                var derval = self.getDerivedValue(vname, rec, mainview);                                
                                vval = (yaggregates === "count")? ((derval>0)? 1: 0) 
                                            : derval;  
                            }
                            return vval; 

                        },
                        getDataLength: function(){
                            var self = this;
                            return self.data.length; 
                        },
                        getQuality: function(varname){
                            var self = this;
                            if(self.missing[varname])
                                {
                                    var qual = (self.data.length - self.missing[varname])/ self.data.length * 100; 
                                    return Math.round(qual*10)/10; 
                                }
                            else 
                                return 100; 
                        
                        },
                        getMissing: function(varname){
                            var self = this; 
                            if(self.missing[varname])
                                {
                                    
                                    return self.missing[varname]; 
                                }
                            else 
                                return 0; 
                        },
                        computeVarSingle: function(group, cat, yvar, displayObj, rec){
                            var self = this;
                            var vname;
                            var vval; 
                            var isDerived = false; 
                            var auditVars = (self.audit === "picanet")? $Q.Picanet["displayVariables"][0]: $Q.Minap["displayVariables"][0] ;
                            var dateVar = auditVars['x'];
                            var yaggregates = (displayObj["yaggregates"].constructor === Array)? displayObj["yaggregates"][0] : displayObj["yaggregates"] ;

                           if(yvar.indexOf("_") >= 0 ){
                                  var strs = yvar.split("_");
                                  if(strs[0] === "der")
                                      isDerived = true;
                              }

                            if(!isDerived){
                                // this is a database variable
                                vname = yvar; 
                                if(rec[cat] === group)
                                    vval = (yaggregates === "count")? 1 : rec[vname];  
                                else
                                    vval = 0; 
                               
                                    }
                            else{
                                // this is a derived variable
                                var strs = yvar.split("_");
                                var rule = strs[0]; 
                                vname = strs[1];
                                var derval = self.getDerivedValue(vname, rec, mainview);
                                if(!displayObj)
                                   {//console.log(yvar);
                                    //console.log(rec);
                                    //console.log(sid);
                                   } 

                                vval = (yaggregates === "count")? ((derval>0)? 1: 0) 
                                            : derval;  
                            }
                            //if(!vval && yvar === "der_smr")
                             //   //console.log(rec);
                              if(isNaN(vval)){
                                     vval = 0;
                                     if(!self.missing[yvar])                    
                                          self.missing[yvar] = 1;
                                     //if(!self.missing[yvar][dateVar])
                                      //    self.missing[yvar][dateVar] = 1; 
                                     else 
                                         self.missing[yvar]++; 
                                    }
                            return vval; 

                        },
                        updateTimeHierarchy: function(year, varname, displayId, rec, qval){
                            var self = this;                             
                            if(self.checkGranT(varname , displayId)){
                                if(!self.tHier)
                                    self.tHier= {}; 
                                if(!self.tHier[year])
                                    self.tHier[year] = {}; 
                                var quar = self.getRecordQuarter(rec); 
                                if(!self.tHier[year][quar])
                                    self.tHier[year][quar] = {};
                                var mon = parseInt(rec[$Q.DataDefs[self.audit]["monthVar"]]) || self.stringToMonth(rec[$Q.DataDefs[self.audit]["admissionDateVar"]]);
                                if(!self.tHier[year][quar][mon])
                                    self.tHier[year][quar][mon] = {};
                                var week = parseInt(rec[$Q.DataDefs[self.audit]["weekVar"]]) || parseInt(self.stringToDate(rec[$Q.DataDefs[self.audit]["admissionDateVar"]]).getDate()/7);
                                if(!self.tHier[year][quar][mon][week])
                                    self.tHier[year][quar][mon][week] = {};
                                if(!self.tHier[year][quar][mon][week][varname])
                                    self.tHier[year][quar][mon][week][varname] = qval; 
                                else
                                    self.tHier[year][quar][mon][week][varname] += qval;

                            }                            
                        },
                        variableInData: function(newvar){
                            var self = this;
                            var vars = Object.keys(self.data[0]);
                            if(vars.indexOf(newvar) >=0)
                                return true;
                            return false; 

                        },
                        applySingleQ: function(displayObj, displayId, data, redraw){
                            var self = this;
                            var dict = {};
                            var tHier = {}; 
                            var metric = displayObj["metric"],
                                dateVar = displayObj["x"],
                                displayVar = displayObj["y"],
                                categoricals = displayObj["categories"],
                                yType = displayObj["yType"],
                                levels = [],
                                slaves = {};  

                                 // define levels of the x-axis
                            var xlevels = d3.map(self.data, function(item){
                                                var res;
                                                res = (self.audit === "picanet")? item[dateVar] : self.stringToMonth(item[dateVar]);
                                                return res;
                                                }).keys();

                           
                            // define record groups using the first categorical
                            var cat = categoricals[0];
                            var groups = d3.map(self.data, function(item){
                                                return item[cat];
                                                }).keys();
                            xlevels.forEach(function(xl){
                                dict[xl] = {};
                                groups.forEach(function(cl){
                                    dict[xl][cl] = {};                                        
                                    });                                    
                                });
                            
                            // Remaining categoricals will be tossed for slave views + popover
                            slaves['cats'] = self.list1QCats(displayId); 
                            slaves['quants'] = self.list1QComp(displayId);
                            //slaves['combo'] = self.list1QCombo(displayId);
                            slaves['data'] = {}; 
  
                            
                            // one big for loop fits all
                            var ownrecords = 0;  // keep a count of this unit's records
                            for(var i=0; i < self.data.length; i++){
                                if(displayObj["yspan"] === "unit" && self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID )
                                    self.recordEHR(self.data[i], i, metric);                                
                                // the main dict will hold aggregates for all groups                                    
                                groups.forEach(function(group, id){
                                        //var vname;
                                        var vval = self.computeVarSingle(group, cat, displayVar, displayObj, self.data[i], id);
                                        // select yspan items
                                        if(displayObj["yspan"] === "unit" && self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID )
                                            {
                                            ownrecords++; 
                                            // update x-bin                                                       
                                            if(!dict[self.data[i][dateVar]][group]["value"])
                                                dict[self.data[i][dateVar]][group]["value"] = 0;                                             
                                            dict[self.data[i][dateVar]][group]["value"] += vval;

                                            if(!dict[self.data[i][dateVar]][group]["data"])
                                                dict[self.data[i][dateVar]][group]["data"] = [];
                                            if(vval > 0) dict[self.data[i][dateVar]][group]["data"].push(i); 

                                            // setup combo slaves
                                           /* slaves['combo'].forEach(function(combo, sid){
                                                var str = combo.split("&");
                                                if(slaves['data'][combo]['xs'].indexOf(self.data[i][str[0]]) < 0)
                                                    slaves['data'][combo]['xs'].push(self.data[i][str[0]]);
                                                if(slaves['data'][combo]['ys'].indexOf(self.data[i][str[1]]) < 0)
                                                    slaves['data'][combo]['ys'].push(self.data[i][str[1]]);
                                                if(!slaves['data'][combo][self.data[i][str[0]]])
                                                    slaves['data'][combo][self.data[i][str[0]]] = {};
                                                if(!slaves['data'][combo][self.data[i][str[0]]][self.data[i][str[1]]])
                                                    slaves['data'][combo][self.data[i][str[0]]][self.data[i][str[1]]] = {};
                                                if(!slaves['data'][combo][self.data[i][str[0]]][self.data[i][str[1]]][group])
                                                    slaves['data'][combo][self.data[i][str[0]]][self.data[i][str[1]]][group] = vval;
                                                
                                                slaves['data'][combo][self.data[i][str[0]]][self.data[i][str[1]]][group] += vval; 
                                            });*/
                                             // check to see if multiple time granularities are needed for y-axis variables                                            
                                            self.updateTimeHierarchy(self.year, displayVar, displayId, self.data[i], vval); 
                                            }    
                                        });

                                // setup categories and levels for main bar chart (or other vis)
                                //categoricals = displayObj["yaggregates"][0];                                         
                                levels = groups; 

                                // setup data aggregates for slave categories (this unit only)
                                if(displayObj["yspan"] === "unit" && self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID ){
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
                                            var qval = parseFloat(self.computeVar(quant['q'], quant, self.data[i], sid, displayId)) ; 

                                            if(!slaves['data'][quant['q']])
                                                slaves['data'][quant['q']] = {}; 
                                            if(!slaves['data'][quant['q']][self.data[i][dateVar]])
                                                slaves['data'][quant['q']][self.data[i][dateVar]] =  {};
                                            if(!slaves['data'][quant['q']][self.data[i][dateVar]]['national'])
                                                slaves['data'][quant['q']][self.data[i][dateVar]]['national'] = qval;
                                                
                                            else{
                                                slaves['data'][quant['q']][self.data[i][dateVar]]['national'] += qval;
                                                ////console.log(slaves['data'][quant['q']]['national'][self.data[i][dateVar]]);                                             
                                            }
                                            if(!slaves['data'][quant['q']][self.data[i][dateVar]])
                                                slaves['data'][quant['q']][self.data[i][dateVar]] = {};
                                            if(!slaves['data'][quant['q']][self.data[i][dateVar]]['unit'])
                                                slaves['data'][quant['q']][self.data[i][dateVar]]['unit'] = (self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID )? qval : 0;                                               
                                            else
                                                slaves['data'][quant['q']][self.data[i][dateVar]]['unit'] += (self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID )? qval : 0;
                                            
                                            
                                            if(!slaves['data'][quant['q']][self.data[i][dateVar]]['data'])
                                                slaves['data'][quant['q']][self.data[i][dateVar]]['data'] = [];
                                            
                                            if(self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID )
                                                slaves['data'][quant['q']][self.data[i][dateVar]]['data'].push(i);

                                            
                                        }

                                    });                                                   
                                                             
                            } // end for data records
                            ////console.log(self.tHier); 

                            /// For variables that require a post-process:
                             // 1. Update the master data structure:                              
                            //if(metric === "48h Readmission"){
                                var postData = self.postProcess(dict, slaves, metric, self.observedDeathsNational, displayObj);
                                dict = postData? postData['dict']: dict;
                                slaves =postData? postData['slaves']: slaves;
                            //}
                            ////console.log(dict);
                            
                               
                                //console.log(slaves); 
                                self.slaves[displayId] = slaves; 
                                self.dataViews.push({"viewId": displayId,   
                                                    "data": dict, 
                                                    "metric": self.availMetrics[displayId]['text'], //self.availMetrics[displayId]['value'], 
                                                    "mark": displayObj["mark"],
                                                    "yscale": displayObj["granP"],
                                                    //"cats": categoricals,
                                                    "levels": levels,
                                                    "slaves": slaves, 
                                                    "ylength": displayObj["y"].length, 
                                                    "metricLabel": self.availMetrics[displayId]['text']});                                 
                           
                                                          
                            
                        },
                        applyMultiQ: function(displayObj, displayId, data, redraw){
                            var self = this;
                            var dict = {};
                            var tHier = {}; 
                            
                            var metric = displayObj["metric"],
                                dateVar = displayObj["x"],
                                displayVar = displayObj["y"],
                                categoricals = displayObj["categories"],
                                yType = displayObj["yType"],
                                levels = [],
                                slaves = {};   
                            
                            // define levels of the x-axis
                            var xlevels = d3.map(self.data, function(item){
                                                var res;
                                                res = (self.audit === "picanet")? item[dateVar] : self.stringToMonth(item[dateVar]);
                                                return res;
                                                }).keys();
                            
                            // define record groups for different y variables
                            xlevels.forEach(function(level){
                                dict[level] = {};
                                displayVar.forEach(function(dv, iv){
                                    dict[level][displayVar[iv]] = {};                                        
                                    });                                    
                                });
                            ////console.log(dict);
                            // any categoricals will be tossed for slave views + popover
                            slaves['cats'] = self.list2QCats(displayId); 
                            slaves['quants'] = self.list2QComp(displayId);
                            slaves['data'] = {}; 
                     
                            // one big for loop fits all
                            var ownrecords = 0;  // keep a count of this unit's records
                            var observedDeathsNational = {}; 
                           
                            for(var i=0; i < self.data.length; i++){
                                /**
                                 * handle multiple quantitative variables
                                **/
                                var mon = self.audit === "picanet"? self.data[i][dateVar] : self.stringToMonth(self.data[i][dateVar]); 
                                //if(isNaN(mon))
                                  //  console.log(mon); 

                                if(displayObj["yspan"] === "unit" && self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID )
                                    self.recordEHR(self.data[i], i, metric);                                
                                // the main dict will hold aggregates for all variables assigned to y-axis                                    
                                displayVar.forEach(function(yvar, id){
                                        //var vname;
                                        var vval = parseFloat(self.computeVar(yvar, displayObj, self.data[i], id, displayId, 1));
                                        self.setDerivedValue(displayId, i, yvar, vval);
                                        if(yvar === "der_death"){
                                            if(!observedDeathsNational[self.data[i][dateVar]])
                                                observedDeathsNational[self.data[i][dateVar]] = vval; 
                                            else
                                                observedDeathsNational[self.data[i][dateVar]] += vval;                                                 
                                            }
                                        // select yspan items
                                        if(displayObj["yspan"] === "unit" && self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID )
                                            {
                                            ownrecords++; 
                                            // update x-bin                                                       
                                            if(!dict[mon][yvar]["value"])
                                                dict[mon][yvar]["value"] = 0;                                             
                                            dict[mon][yvar]["value"] += vval;
                                            if(!dict[mon][yvar]["data"])
                                                dict[mon][yvar]["data"] = [];
                                            if(vval > 0) dict[mon][yvar]["data"].push(i); 

                                             // check to see if multiple time granularities are needed for y-axis variables                                            
                                            self.updateTimeHierarchy(self.year, yvar, displayId, self.data[i], vval); 
                                            }    
                                        });

                                // setup fake categories and levels for main bar chart (or other vis)                                
                                levels = displayVar; 

                                // setup data aggregates for slave categories (this unit only)
                                if(displayObj["yspan"] === "unit" && self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID ){
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
                                            var qval = parseFloat(self.computeVar(quant['q'], quant, self.data[i], sid, displayId)) ; 
                                            self.setDerivedValue(displayId, i, quant['q'], qval);
                                            if(!slaves['data'][quant['q']])
                                                slaves['data'][quant['q']] = {}; 
                                            if(!slaves['data'][quant['q']][mon])
                                                slaves['data'][quant['q']][mon] =  {};
                                            if(!slaves['data'][quant['q']][mon]['national'])
                                                slaves['data'][quant['q']][mon]['national'] = qval;
                                                
                                            else{
                                                slaves['data'][quant['q']][mon]['national'] += qval;
                                                ////console.log(slaves['data'][quant['q']]['national'][self.data[i][dateVar]]);                                             
                                            }
                                            if(!slaves['data'][quant['q']][mon])
                                                slaves['data'][quant['q']][mon] = {};
                                            if(!slaves['data'][quant['q']][mon]['unit'])
                                                slaves['data'][quant['q']][mon]['unit'] = (self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID )? 
                                                                                                            (quant['yaggregates']==="count"? 1: qval) : 0;                                               
                                            else
                                                slaves['data'][quant['q']][mon]['unit'] += (self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID )? 
                                                                                                            (quant['yaggregates']==="count"? 1: qval) : 0;
                                            

                                            if(!slaves['data'][quant['q']][mon]['data'])
                                                slaves['data'][quant['q']][mon]['data'] = [];
                                            
                                            if(self.data[i][$Q.DataDefs[self.audit]["unitIdVar"]] === self.unitID )
                                                slaves['data'][quant['q']][mon]['data'].push(i);

                                            // check if we need nultiple time granularities for this
                                            // only update the time hierarchy if this variable wasn't already setup in the hierarchy by the main view
                                            if(displayVar.indexOf(quant['q']) < 0)
                                                self.updateTimeHierarchy(self.year, quant['q'], displayId, self.data[i], qval);  
                                            //self.updateTimeHierarchy(self.year, yvar, displayId, self.data[i], vval);                                               
                                        }

                                    });                                                   
                                                             
                            } // end for data records
                            ////console.log(self.tHier); 

                            /// For variables that require a post-process:
                             // 1. Update the master data structure:                              
                            //if(metric === "48h Readmission"){
                                self.observedDeathsNational = observedDeathsNational; 
                                var postData = self.postProcess(dict, slaves, metric, observedDeathsNational, displayObj);
                                dict = postData? postData['dict']: dict;
                                slaves = postData? postData['slaves']: slaves;
                                //console.log(slaves);                                 
                            //}
                            ////console.log(dict);
                           
                               
                                //console.log(slaves); 
                                self.slaves[displayId] = slaves; 
                                self.dataViews.push({"viewId": displayId,   
                                                    "data": dict, 
                                                    "metric": self.availMetrics[displayId]['text'], //self.availMetrics[displayId]['value'], 
                                                    "mark": displayObj["mark"],
                                                    "yscale": displayObj["granP"],
                                                    //"cats": categoricals,
                                                    "levels": levels,
                                                    "slaves": slaves, 
                                                    "ylength": displayObj["y"].length, 
                                                    "metricLabel": self.availMetrics[displayId]['text']});                                 
                                
                        },
                        applyAggregateRule2: function(displayObj, displayId, data, redraw){
                            var self = this; 
                            var displayVar = displayObj["y"];
                            //console.log(self.data);
                            // prepare the dict
                            if(displayVar.constructor == Array){                                
                                    self.applyMultiQ(displayObj, displayId, data, redraw);
                                }
                            else
                                self.applySingleQ(displayObj, displayId, data, redraw);
                            
                        },
                        getEHR: function(){
                            return this.ehr;
                        },
                        recordEHR: function(rec, i , metric, year){
                            var self = this;
                            var ehr;
                           
                            if(year){
                                if(!self.ehrHist[year]) 
                                    self.ehrHist[year] = {};
                                ehr = self.ehrHist[year];
                            }
                            else
                                ehr = self.ehr; 

                            if(metric === "48h Readmission"){
                                                            var pidVar = $Q.DataDefs[self.audit]["patientIdVar"];
                                                            if(!ehr[rec[pidVar]]){                                        
                                                                    ehr[rec[pidVar]] = {}; 
                                                                    ehr[rec[pidVar]]["admissionsT"] = [];
                                                                    ehr[rec[pidVar]]["dischargesT"] = [];
                                                                    ehr[rec[pidVar]]["data"] = [];
                                                                    ehr[rec[pidVar]]["ids"] = [];
                                                                }
                                                                
                                                                ehr[rec[pidVar]]["admissionsT"].push(rec[$Q.DataDefs[self.audit]["admissionDateVar"]]);
                                                                ehr[rec[pidVar]]["dischargesT"].push(rec[$Q.DataDefs[self.audit]["dischargeDateVar"]]);
                                                                ehr[rec[pidVar]]["data"].push(rec);
                                                                ehr[rec[pidVar]]["ids"].push(i);
                                                        }
                            
                        },
                        postProcessHistory: function(year, varname){
                            var self = this;
                            for(var key in self.ehrHist[year]){
                                var patientEHR = self.ehrHist[year][key];
                                var adm = patientEHR["admissionsT"];
                                var disc = patientEHR["dischargesT"];
                                var one_hour=1000*60*60;  // in ms
                                //var index_a = adm.indexOf(self.data[i]["3.06 Date/time arrival at hospital"]);
                                if(adm.length <= 1)  // this patient was only admitted once
                                    continue;

                                else{
                                    disc.forEach(function(discharge, did){
                                        var d_date = self.stringToDate(discharge);
                                        adm.forEach(function(admission, aid){
                                            var a_date = self.stringToDate(admission);
                                            var adt = a_date.getTime(),
                                                ddt = d_date.getTime(); 
                                            var diff = Math.round((adt-ddt)/one_hour);
                                            if(diff >=0 && diff < 48 && (aid !== did)){

                                                var adrec = patientEHR['data'][aid];
                                                // find corresponding entry in dict
                                                // assuming dict is organized by months
                                                // find the months of this readmission event
                                                //var year = adrec[$Q.DataDefs[self.audit]["yearVar"]];
                                                var quar = self.getRecordQuarter(adrec);
                                                //var month = adrec[$Q.DataDefs[self.audit]["monthVar"]];
                                                var mon = parseInt(adrec[$Q.DataDefs[self.audit]["monthVar"]]);
                                                var week = parseInt(adrec[$Q.DataDefs[self.audit]["weekVar"]]);
                                                var unit = adrec[$Q.DataDefs[self.audit]["unitIdVar"]];
                                                
                                                if(unit === self.unitID){
                                                    // update this view's time hierarchy
                                                    // //console.log("FOUND "+ year + " " + a_date + " " + d_date); 
                                                    self.tHier[year][quar][mon][week][varname]++; 
                                                }
                                                // either way update the slave that will show national average
                                                //result['slaves']['data']['der_readmit'][month]['national']++; 
                                               

                                            }


                                        });
                                    });
                                    
                                   
                                 }
                            }
                        },
                        postProcess: function(dict, slaves, metric, observedDeathsNational, displayObj){
                            var self = this;
                            var result = {};
                            result['dict'] = dict;
                            result['slaves'] = slaves;
                            if(metric === "48h Readmission"){ 
                                // calculate 48-hour readmissions:
                                for(var key in self.ehr ){
                                    var patientEHR = self.ehr[key];
                                    var adm = patientEHR["admissionsT"];
                                    var disc = patientEHR["dischargesT"];
                                    var one_hour=1000*60*60;  // in ms
                                   
                                    //var index_a = adm.indexOf(self.data[i]["3.06 Date/time arrival at hospital"]);
                                    if(adm.length <= 1)  // this patient was only admitted once
                                        continue;

                                    else{
                                        disc.forEach(function(discharge, did){
                                            var d_date = self.stringToDate(discharge);
                                            adm.forEach(function(admission, aid){
                                                var a_date = self.stringToDate(admission);
                                                var adt = a_date.getTime(),
                                                    ddt = d_date.getTime(); 
                                                var diff = Math.round((adt-ddt)/one_hour);
                                                if(diff >=0 && diff < 48 && (aid !== did)){
                                                    var adrec = patientEHR['data'][aid];
                                                    // find corresponding entry in dict
                                                    // assuming dict is organized by months
                                                    // find the months of this readmission event
                                                    var month = adrec[$Q.DataDefs[self.audit]["monthVar"]];
                                                    var unit = adrec[$Q.DataDefs[self.audit]["unitIdVar"]];
                                                    var quar = self.getRecordQuarter(adrec);
                                                    //var month = adrec[$Q.DataDefs[self.audit]["monthVar"]];
                                                    var mon = parseInt(adrec[$Q.DataDefs[self.audit]["monthVar"]]);
                                                    var week = parseInt(adrec[$Q.DataDefs[self.audit]["weekVar"]]);
                                                    if(isNaN(mon))
                                                        self.recordMissing("der_readmit"); 
                                                    if(unit === self.unitID){
                                                        // update this view's master dict
                                                        result['dict'][month]["der_readmit"]["value"]++;
                                                        result['dict'][month]["der_readmit"]["data"].push(patientEHR['ids'][aid]);
                                                        result['slaves']['data']['der_readmit'][month]['unit']++; 
                                                        // update the time hierarchy
                                                        self.tHier[self.year][quar][mon][week]["der_readmit"]++; 
                                                    }
                                                    // either way update the slave that will show national average
                                                    result['slaves']['data']['der_readmit'][month]['national']++; 
                                                }


                                            });
                                        });
                                        
                                       
                                     }
                                }
                                return result;
                            } // if(metric === "48h Readmission")
                            else if(metric === "Bed Days and Extubation"){
                                //console.log(dict);
                                //console.log(self.excessDays);
                                for(var key in dict){
                                   if(self.excessDays[key])
                                    for(var kk in self.excessDays[key])
                                       result['dict'][key]['der_bedDays']['value'] += self.excessDays[key][kk][0];
                                }
                            }
                            else{
                                //console.log(result);
                                // calculate averages (if any)
                                slaves['quants'].forEach(function(q){
                                    if(q['yaggregates'] === "average"){
                                        var firstKey = Object.keys(dict)[0];
                                        // update dict
                                        if(dict[firstKey][q['q']]){
                                            result['dict'][firstKey][q['q']]['value'] /= dict[firstKey][q['q']]['data'].length;  
                                        }
                                        // update slaves 
                                        if(slaves['data'][q['q']]){
                                            for(var key in result['slaves']['data'][q['q']])
                                                result['slaves']['data'][q['q']][key]['unit'] /= slaves['data'][q['q']][key]['data'].length;
                                        }
                                    }
                                    else if(q['yaggregates'] === "percent"){
                                        var firstKey = Object.keys(dict)[0];
                                        // update dict
                                        if(dict[firstKey][q['q']]){
                                            result['dict'][firstKey][q['q']]['value'] *= 100/dict[firstKey][q['q']]['data'].length;  
                                        }
                                        // update slaves 
                                        if(slaves['data'][q['q']]){
                                            for(var key in result['slaves']['data'][q['q']])
                                                result['slaves']['data'][q['q']][key]['unit'] *= 100/ slaves['data'][q['q']][key]['data'].length;
                                        }
                                    }
                                });
                                 // 2. Update the slaves: 
                             if(displayObj["quantities"]){
                                    displayObj["quantities"].forEach(function(quant){

                                        if(quant['q'] === "der_smr" && slaves['data'][quant['q']]){
                                            for(var key in slaves['data'][quant['q']]){
                                                slaves['data'][quant['q']][key]['national'] = observedDeathsNational[key] / slaves['data'][quant['q']][key]['national'];
                                                slaves['data'][quant['q']][key]['unit'] = dict[key]["der_death"]['value'] / slaves['data'][quant['q']][key]['unit']; 
                                            }
                                        }
                                    });
                                 }
                               // check for (cumulative) averages or percentages in main view
                                var first = Object.keys(dict)[0];
                                var mainQs = Object.keys(dict[first]); 

                                mainQs.forEach(function(q, qid){
                                    if(q === "der_smr"){
                                        if(yaggregates === "average"){
                                            for(var key in dict){
                                                result['dict'][key][q]['value'] = result['dict'][key][q]['data'].length / result['dict'][key][q]['value']; 
                                            }
                                        }
                                        else if (yaggregates === "runningAvg"){
                                            var runningSum = 0;
                                            var runningLen = 0; 

                                          for(var key in dict){
                                                runningLen += result['dict'][key][q]['data'].length;
                                                runningSum += result['dict'][key][q]['value'];
                                                result['dict'][key][q]['value'] =  runningLen / runningSum; 
                                            }   
                                        }
                                    }
                                    else{
                                            var yaggregates = (displayObj["yaggregates"].constructor === Array)? displayObj["yaggregates"][qid] : displayObj["yaggregates"];
                                            if(yaggregates === "average"){
                                                for(var key in dict){
                                                    result['dict'][key][q]['value'] /= result['dict'][key][q]['data'].length; 
                                                }
                                            }
                                            else if(yaggregates === "runningAvg"){
                                                var runningSum = 0;
                                                var runningLen = 0;  

                                             for(var key in dict){
                                                    
                                                    runningSum += result['dict'][key][q]['value'];
                                                    runningLen += result['dict'][key][q]['data'].length; 
                                                    result['dict'][key][q]['value'] = runningSum;

                                        }   
                                    }
                                    }
                                });    
                                //console.log(result);
                                return result; 
                            } 
                        },
                        getRecordQuarter: function(rec){
                            var self = this; 
                            var recMonth = parseInt(rec[$Q.DataDefs[self.audit]["monthVar"]]) || parseInt(self.stringToDate(rec[$Q.DataDefs[self.audit]["admissionDateVar"]]).getMonth());
                            if(recMonth === 12) return 4; 
                            return recMonth < 4 ? 1: (recMonth < 7? 2: (recMonth < 10? 3 : 4))
                        },
                        checkGranT: function(varname, displayId){
                            var self = this; 
                            var granT = self.audit === "picanet"? $Q.Picanet['displayVariables'][displayId]['granT']
                                                                : $Q.Minap['displayVariables'][displayId]['granT'];
                            for(var key in granT){
                                if(granT[key].constructor === Array){
                                    return (granT[key].indexOf(varname) >=0)? true : false;  
                                }
                                else if(granT[key] === varname)
                                    return true;
                            }
                            return false; 
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
                            ////console.log(displayObj);
                            if(displayVar === "derived")
                                displayVar = self.calculateDerivedVar(metric, displayVar); 
                            //else if(displayVar.constructor == Array){}
                            
                            ////console.log(categoricals); 

                            if(!categoricals){
                                for(var i=0; i< data.length; i++){
                                    // get the month of this entry
                                    var date = self.stringToDate(data[i][dateVar]);                                                        
                                    var month = self.months[date.getMonth()];
                                    var year = date.getYear()+1900; 
                                    var my = month+"-"+year; 
                                    ////////console.log(my); 
                                    dict[my] = dict[my]? dict[my]+parseInt(data[i][displayVar]) : parseInt(data[i][displayVar]);
    
                                }
    
                                //////console.log(dict); 
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
                                ////////console.log(temp); 
                                var orderedKeys = Object.keys(dict).sort(custom_sort);
                                ////////console.log(orderedKeys);
    
                                for(var k= 0; k < orderedKeys.length; k++){
                                    var obj = {};
                                    obj['date'] = orderedKeys[k];
                                    obj['number'] = dict[orderedKeys[k]];
                                    ordered.push(obj); 
    
                                }
    
                                //////console.log(ordered); 
                                //self.control.drawChart(displayId, ordered); 
                                self.dataViews.push({"viewId": displayId,   
                                                    "data": ordered, 
                                                    "metric": self.availMetrics[displayId]['value'], 
                                                    "metricLabel": self.availMetrics[displayId]['text']});
                            }
                            else if(categoricals.length === 1){  // count within categories
                                var cat = categoricals[0];
                                

                                var levels = d3.map(self.data, function(item){
                                    return item[cat];
                                    }).keys();
                                
                                for(var i=0; i< data.length; i++){
                                                        // get the month of this entry
                                                        var date = self.stringToDate(data[i][dateVar]);
                                                        var month = self.months[date.getMonth()];
                                                        var year = date.getYear()+1900; 
                                                        var my = month+"-"+year; 
                                                        if(!dict[my]){
                                                            dict[my] = {};
                                                            levels.forEach(function(level){
                                                                dict[my][level] = 0;
                                                            });

                                                        }
                                                        var level = data[i][cat];
                                                        dict[my][level] += parseInt(data[i][displayVar]);                                                        
                                                    }
                                
                               if(redraw)    
                                    self.control.drawChart(displayId, dict, cat, levels);

                            }
                        else if(categoricals.length === 2){
                           
                            // new variable divides the trellis
                            var levels0 = d3.map(self.data, function(item){
                                    return item[categoricals[displayId][1]];
                                    }).keys();
                            
                            var levels1 = d3.map(self.data, function(item){
                                    return item[categoricals[displayId][0]];
                                    }).keys();
                            
                            levels0.forEach(function(level){
                                dict[level] = {};
                            });
                            //////console.log(dict);
                            for(var i=0; i< data.length; i++){
                                                        // get the month of this entry
                                                        var date = self.stringToDate(data[i][dateVar]);
                                                        ////////console.log(date); 
                                                        var month = self.months[date.getMonth()];
                                                        var year = date.getYear()+1900; 
                                                        //////////console.log(month);
                                                        //////////console.log(year);
                                                        var my = month+"-"+year; 
                                                        ////////console.log(my); 
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
                               //////console.log(dict);
                               var levels = [levels0, levels1]; 
                            if(redraw)
                                self.control.drawChart(displayId, dict, categoricals[displayId], levels, 1);


                        }
                       
                    }
        });
})(QUALDASH);


