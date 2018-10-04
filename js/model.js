(function($Q){
    'use strict'
    $Q.Model = $Q.defineClass(
                    null, 
                    function Model(control){
                        var self = this;
                        self.control = control; 
                        self.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    },
                    {
                        readMinapDummy: function(){
                            var self = this; 
                            d3.csv("./data/minap_dummy.csv", function(data){
                                    //console.log(Object.keys(data[0])); 
                                    var displayVar = self.control.getDisplayVariable(); 

                                    //console.log(displayVar);
                                    var dateVar = "3.06 Date/time arrival at hospital";
                                    self.aggMonthly(data, dateVar, displayVar);


                                });
                            },
                        aggMonthly: function(data, dateVar, displayVar){
                            var self = this; 
                            var dict = {};

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
                    }
        );
})(QUALDASH);


