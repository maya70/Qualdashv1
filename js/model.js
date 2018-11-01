(function($Q){
    'use strict'
    $Q.Model = $Q.defineClass(
                    null, 
                    function Model(control){
                        var self = this;
                        self.control = control; 
                        self.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        self.displayVar = self.control.getDisplayVariable(); 
                        self.dateVar = "3.06 Date/time arrival at hospital";
                        self.categoricals = [];
                    },
                    {
                        readMinapDummy: function(){
                            var self = this; 
                            
                            d3.csv("./data/minap_dummy.csv", function(data){
                                    //console.log(Object.keys(data[0])); 
                                    self.data = data; 
                                    
                                    //console.log(displayVar);
                                   
                                    self.aggMonthly(data, self.dateVar, self.displayVar);


                                });
                            },
                        addCategorical: function(varName){
                            var self = this;
                            
                            self.categoricals.push(varName);
                            console.log(self.categoricals);

                            self.aggMonthly(self.data, self.dateVar, self.displayVar, self.categoricals );
                        },
                        aggMonthly: function(data, dateVar, displayVar, categoricals){
                            var self = this; 
                            var dict = {};

                            if(!categoricals){
                                                        for(var i=0; i< data.length; i++){
                                                            // get the month of this entry
                                                            var date = new Date(data[i][dateVar]);
                                                            //console.log(date); 
                                                            var month = self.months[date.getMonth()];
                                                            var year = date.getYear()+1900; 
                                                            ////console.log(month);
                                                            ////console.log(year);
                                                            var my = month+"-"+year; 
                                                            //console.log(my); 
                                                            dict[my] = dict[my]? dict[my]+parseInt(data[i][displayVar]) : parseInt(data[i][displayVar]);
                            
                                                        }
                            
                                                        console.log(dict); 
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
                                                        //console.log(temp); 
                                                        var orderedKeys = Object.keys(dict).sort(custom_sort);
                                                        //console.log(orderedKeys);
                            
                                                        for(var k= 0; k < orderedKeys.length; k++){
                                                            var obj = {};
                                                            obj['date'] = orderedKeys[k];
                                                            obj['number'] = dict[orderedKeys[k]];
                                                            ordered.push(obj); 
                            
                                                        }
                            
                                                        //console.log(ordered); 
                                                        self.control.drawBarChart(ordered); 
                            }
                            else if(categoricals.length === 1){  // count within categories
                                var cat = categoricals[0];
                                console.log(cat);

                                var levels = d3.map(self.data, function(item){
                                    return item[cat];
                                    }).keys();
                                console.log(levels);
                                for(var i=0; i< data.length; i++){
                                                        // get the month of this entry
                                                        var date = new Date(data[i][dateVar]);
                                                        //console.log(date); 
                                                        var month = self.months[date.getMonth()];
                                                        var year = date.getYear()+1900; 
                                                        ////console.log(month);
                                                        ////console.log(year);
                                                        var my = month+"-"+year; 
                                                        //console.log(my); 
                                                        if(!dict[my]){
                                                            dict[my] = {};
                                                            levels.forEach(function(level){
                                                                dict[my][level] = 0;
                                                            });

                                                        }
                                                        var level = data[i][cat];
                                                        dict[my][level] += parseInt(data[i][displayVar]); 
                                                        
                                                    }


                                console.log(dict);

                               
                                   
                                    self.control.drawBarChart(dict, cat, levels);

                               

                            }
                        else if(categoricals.length === 2){
                            // first variable divides the trellis
                            
                            var levels0 = d3.map(self.data, function(item){
                                    return item[categoricals[0]];
                                    }).keys();
                            var levels1 = d3.map(self.data, function(item){
                                    return item[categoricals[1]];
                                    }).keys();
                            
                            console.log(levels0);
                            levels0.forEach(function(level){
                                dict[level] = {};
                            });
                            console.log(dict);
                            for(var i=0; i< data.length; i++){
                                                        // get the month of this entry
                                                        var date = new Date(data[i][dateVar]);
                                                        //console.log(date); 
                                                        var month = self.months[date.getMonth()];
                                                        var year = date.getYear()+1900; 
                                                        ////console.log(month);
                                                        ////console.log(year);
                                                        var my = month+"-"+year; 
                                                        //console.log(my); 
                                                        if(!dict[levels0[0]][my]){
                                                            levels0.forEach(function(level){
                                                                dict[level][my] = {}; 
                                                                levels1.forEach(function(level2){
                                                                    dict[level][my][level2] = 0;
                                                                });

                                                            });
                                                         }
                                                       dict[data[i][categoricals[0]]][my][data[i][categoricals[1]]] += parseInt(data[i][displayVar]);

                                                    }
                               console.log(dict);
                               var levels = [levels0, levels1]; 
                            self.control.drawBarChart(dict, categoricals, levels, 1);


                        }
                        else if(categoricals.length === 3){

                            
                        }
                    }
        });
})(QUALDASH);


