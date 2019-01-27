(function($Q){
	'use strict'
	$Q.BarChart = $Q.defineClass(
					null, 
					function BarChart(dataView, pCard){
						var self = this;						
						self.parent = pCard;
						self.audit = self.parent.getAuditInfo(); 
						self.id = dataView['viewId'];
						self.data = self.audit=== "picanet"? self.fixDataFormat(dataView['data']) : dataView['data'];						
						self.iter = 0; 												
						self.toggle = "grouped";
						self.dataView = dataView; 
						self.palette = {};

						if(dataView.ylength > 1){
							//(dataView['yscale'][0] === dataView['yscale'][1])?
							 self.drawCatBar2(dataView,0);
							 //: self.drawDualBar();
						}

						
					},
					{
						getData: function(){
							return this;
						},
						highlight: function(hdata, viewId){
							var self = this; 
							if(self.dataView.ylength > 1){
								self.shadeCatBar(hdata, viewId);
							}	
						},
						removeShade: function(){
							var self = this;
							self.parent.svg.selectAll(".shades").remove(); 
						},
						shadeCatBar: function(dict, viewId){
							var self = this; 
							var undef;
                            var ordered = [];
                            
                            //////////console.log(temp); 
                            var orderedKeys = Object.keys(dict);
                            //////////console.log(orderedKeys);
                            var xz = orderedKeys,
                                yz = d3.range(self.levels.length).map(function(d){
                                    return Array.apply(null, Array(xz.length)).map(Number.prototype.valueOf,0);
                                });
                                for(var kx=0; kx < xz.length; kx++ ){
                                    for(var ky=0; ky < self.levels.length; ky++){  
                                     if(self.audit === "picanet")
                                     	yz[ky][kx] += dict[xz[kx]][self.levels[ky]]['value'];
                                     else                                      	
                                        yz[ky][kx] += dict[xz[kx]][self.levels[ky]];
                                    }
                                }
                                
                               var y01z = d3.stack().keys(d3.range(self.levels.length))(d3.transpose(yz));
                                    //yMax = self.yMax, // d3.max(yz, function(y) { return d3.max(y); }),
                                    //y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); });

                           	                            
							var drawArea = d3.select("#draw-area"+viewId);							
							var parentArea = drawArea.select(function(){
								return this.parentNode; 
							});
							
							var scale =  0.6; 
							var svgw = scale * parentArea.node().getBoundingClientRect().width;
							var svgh = scale * parentArea.node().getBoundingClientRect().height; 
							var shift = ((scale-1.0)*(1-scale)*parentArea.node().getBoundingClientRect().width); 
							
							var margin = {top: 0, right: 10, bottom: 50, left: 30};							
							var width = svgw - margin.left - margin.right; 
							var height = svgh - margin.top - margin.bottom;
							

							var g = self.parent.svg.append("g").attr("transform","translate(" + margin.left + "," + margin.top + ")" );
							
							var x = d3.scaleBand()
									    .domain(xz)
									    .rangeRound([0, width])
									    .padding(0.08);

							var y = d3.scaleLinear()
							    .domain([0, self.yMax])
							    .range([height, 0]);

							
							var series = g.selectAll(".shades")
							  .data(y01z)
							  .enter().append("g")
							  	.attr("class", "shades")
							    .attr("fill", function(d, i) { 
							    	return "brown"; });
							 
							 var rect = series.selectAll("rect.shade")
							  .data(function(d) { return d; })
							  .enter().append("rect")
							  	.attr("class", "shade")
							    .attr("x", function(d, i) { return x(i); })
							    .attr("y", height)
							    .attr("width", x.bandwidth())
							    .attr("height", 0);

							    rect.transition()
								    .delay(function(d, i) { return i * 10; })
								    .attr("y", function(d) { return y(d[1]); })
								    .attr("height", function(d) { return y(d[0]) - y(d[1]); })
								    .call(changed);

												
							function changed() {
							  
							  //console.log(self.toggle);
							  if (self.toggle === "grouped")
							  	transitionGrouped();
							  else 
							    transitionStacked();
							}
						
						function transitionGrouped() {
							
							y.domain([0, self.yMax]);
						  //console.log(xz);
						  rect.transition()
						      .duration(200)
						      //.delay(function(d, i) { return i * 10; })
						      .attr("x", function(d, i) {							         
						      	 return x(xz[i]) + x.bandwidth() / self.levels.length * this.parentNode.__data__.key; })
						      .attr("width", x.bandwidth() / self.levels.length)
						    .transition()
						      .attr("y", function(d) { 
						      	return y(d[1] - d[0]); })
						      .attr("height", function(d) { 
						      	return y(0) - y(d[1] - d[0]); });
						}
						function transitionStacked() {
							 y.domain([0, self.yMax]);
						  
						  rect.transition()
						      .duration(200)
						      .delay(function(d, i) { return i * 10; })
						      .attr("y", function(d) { 
						      	return y(d[1]); })
						      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
						    .transition()
						      .attr("x", function(d, i) { return x(xz[i]); })
						      .attr("width", x.bandwidth());
						}

						 
						
						},


						drawBaseBar: function(){
						
						
						},
						drawDualBar: function(){
							var self = this;
							 

						},
						drawCatBar2: function(dataView, trellis){
							var self = this; 
							console.log(dataView['data']);
							console.log(dataView['cats']);
							console.log(dataView['levels']);
							self.drawCatBar(dataView['viewId'], dataView['data'], dataView['cats'], dataView['levels'], self.iter);
							//self.drawCatBar(viewId, self.dict, self.cat[viewId], self.levels, 0); 
							//drawCatBar(displayId, data, cat, levels,0);
						},
						drawCatBar: function(viewId, dict, cat, levels, iter, trellis){
							var self = this; 
								self.dict = dict;
								self.cat = {}; 	
								self.cat[viewId] = cat;
								self.levels = levels; 
								var undef;
								console.log(dict);

								if(trellis)
									console.log("this is a trellis view");
								// sort dict by date
                                function custom_sort(a,b){
                                    return new Date("01-"+a).getTime() - new Date("01-"+b).getTime(); 
                                }
    							
    							d3.select("#toggle-btn"+viewId)
    								.attr("hidden", undef)
    								.on("click", function(){
										self.toggleBarView(viewId); 
									});
                               		
                  
								$("#toggle-btn"+viewId).tooltip({    
								    placement : 'bottom',  
								    title : "Toggle Groups"         
								  });     

                                var ordered = [];
                                var temp = Object.keys(dict);
                                //////////console.log(temp); 
                                var orderedKeys = Object.keys(dict).sort(custom_sort);
                                //////////console.log(orderedKeys);
                                var xz = orderedKeys,
                                    yz = d3.range(levels.length).map(function(d){
                                        return Array.apply(null, Array(xz.length)).map(Number.prototype.valueOf,0);
                                    });
                                    for(var kx=0; kx < xz.length; kx++ ){
                                        for(var ky=0; ky < levels.length; ky++){  
                                         if(self.audit === "picanet")
                                         	yz[ky][kx] += dict[xz[kx]][levels[ky]]['value'];
                                         else                                      	
                                            yz[ky][kx] += dict[xz[kx]][levels[ky]];
                                        }
                                    }
                                   
                                   console.log(yz);

                                   var y01z = d3.stack().keys(d3.range(levels.length))(d3.transpose(yz)),
                                        yMax = d3.max(yz, function(y) { return d3.max(y); }),
                                        y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); });
    
                               	self.yMax = y1Max; 
                           
							if(self.parent.svg && iter === 0){
							//	d3.selectAll("svg").remove(); 
								var undef; 
								self.legend = undef; 
								d3.select(".mainsvg"+viewId).remove(); 
							}
							
							var drawArea = d3.select("#draw-area"+viewId);
							if(iter > 0)
								drawArea.style("overflow-y", "scroll"); 
					
							var parentArea = drawArea.select(function(){
								return this.parentNode; 
							});
							//console.log(parentArea.node().getBoundingClientRect());
							//var viewshare = self.dicts? Object.keys(self.dicts).length : 1; 
							var viewshare = trellis? 2 : 1; 
							//////console.log(viewshare); 
							//if(viewshare > 2) viewshare = 2; 
							var scale = self.parent.expanded? 0.6 : 0.9; 
							var svgw = scale * parentArea.node().getBoundingClientRect().width;
							var svgh = scale * parentArea.node().getBoundingClientRect().height / viewshare; 
							var shift = self.parent.expanded? ((scale-1.0)*(1-scale)*parentArea.node().getBoundingClientRect().width) : 0; 
							self.parent.svg = d3.select("#draw-area"+viewId).append("svg")
										.attr("id", "mainsvg"+viewId+"_"+iter)
										.attr("class", "mainsvg"+viewId)
										.attr("width", svgw).attr("height", svgh)
										.style("vertical-align", "top")
										.attr("transform", "translate("+shift+","+ (-svgh*iter) +")");
							
							
							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);

							var margin = {top: 0, right: 10, bottom: 50, left: 30};							
							var width = svgw - margin.left - margin.right; 
							var height = svgh - margin.top - margin.bottom;
							

							var g = self.parent.svg.append("g").attr("transform","translate(" + margin.left + "," + margin.top + ")" );

							var timeout = d3.timeout(function() {
											  changed(); 
											}, 4000);

							//g.append("circle").attr("cx", 40).attr("cy", 50).attr("r", 100).style("fill", "red");

							var x = d3.scaleBand()
									    .domain(xz)
									    .rangeRound([0, width])
									    .padding(0.08);

							var y = d3.scaleLinear()
							    .domain([0, y1Max])
							    .range([height, 0]);

							var color = d3.scaleOrdinal()
							    .domain(d3.range(levels.length))
							    .range($Q.colors);
							    //.range(d3.schemeCategory10);

							 //for(var l=0; l < levels.length; l++){
							 //	self.palette[levels[l]] = color(levels[l]);
							// }

							var series = g.selectAll(".series")
							  .data(y01z)
							  .enter().append("g")
							  	.attr("class", "series"+viewId)
							    .attr("fill", function(d, i) { 
							    	//if(!self.palette[d]) self.palette[d] = color(i);
							    	return color(i); });

							 
							 if(!self.legend)
							 {	
							 self.legend = self.parent.svg.selectAll(".legend")
							 				.data(color.domain())
							 				.enter().append("g")
							 					 .attr("class", "legend")
     											 .attr("transform", function(d, i) { return "translate(0," + i * 15 + ")"; });
     						 
     						 // draw legend colored rectangles
							  self.legend.append("rect")
							      .attr("x", svgw- 10)
							      .attr("width", 10)
							      .attr("height", 10)
							      .style("fill", function(d){
							      	self.palette[levels[d]] = color(d);
							      	return color(d);});

							  // draw legend text
							  self.legend.append("text")
							      .attr("x", svgw- 14)
							      .attr("y", 6)
							      .attr("dy", ".35em")
							      .style("text-anchor", "end")							      
							      .text(function(d) {
							      	var tex = self.audit=== "picanet"? $Q.Picanet['variableDict'][levels[d]]: $Q.Minap['variableDict'][levels[d]];
							      	return  tex || levels[d] ;})
							      	.style("font-size", "7pt");
							     }
							
							var origColor; 
							var rect = series.selectAll("rect")
							  .data(function(d) { return d; })
							  .enter().append("rect")
							  	.attr("class", "bar")
							    .attr("x", function(d, i) { return x(i); })
							    .attr("y", height)
							    .attr("width", x.bandwidth())
							    .attr("height", 0)
							     .on("mouseover", function(d, i){
							  
							      	div.transition()
							      		.duration(200)
							      		.style("opacity", 0.9);
							      	div .html((d[1] - d[0]+ ""))
							      		.style("left", (d3.event.pageX) + "px")
							      		.style("top", (d3.event.pageY - 28) + "px");
							      	origColor = d3.select(this).style("fill");
							      	d3.select(this).style("fill", "brown");
							      	//console.log(this);
							      	//console.log(d); 
							      	//console.log(dict[i+1]);

							      	// find the key for the corresponding data entry
							      	for(var key in dict[i+1]){
							      		if(dict[i+1][key]['value'] === (d[1] - d[0]))
							      			self.parent.highlightSubs(dict[i+1][key]['data']);
							      			//console.log(dict[i+1][key]['data']); 
							      	}

							      })
							      .on("mouseout", function(d){
							      	div.transition()
							      		.duration(500)
							      		.style("opacity", 0);
							      	d3.select(this).style("fill", origColor);
							      	self.parent.nohighlightSubs(); 
							      });

							    rect.transition()
								    .delay(function(d, i) { return i * 10; })
								    .attr("y", function(d) { return y(d[1]); })
								    .attr("height", function(d) { return y(d[0]) - y(d[1]); });

								g.append("g")
								    .attr("class", "x axis")
								    .attr("transform", "translate(0," + height + ")")
								    .call(d3.axisBottom(x))
									.selectAll("text")	
										.text(function(d){
											return $Q.months[d-1]; 
										})
								        .style("text-anchor", "end")
								        .attr("dx", "-.8em")
								        .attr("dy", ".15em")
								        .attr("transform", "rotate(-65)")
								        .call(changed);

								////console.log(y.domain());
								////console.log(y.range());
								g.append("g")
							      .attr("class", "y axis")
							      .call(d3.axisLeft(y).ticks(5, "s"))
							      .attr("transform", "translate(0,"+0+")");

							d3.selectAll(".toggle-button")
							    .on("click", changed);

							function changed() {
							  timeout.stop();
							  if (self.toggle === "grouped") 
							  	transitionGrouped();
							  else 
							    transitionStacked();
							}
						self.changed = function(newx, newy, nviewId){
							 console.log("changing"); 
							 //timeout.stop();
							  if (self.toggle === "grouped") 
							  	transitionGrouped(newx, newy, nviewId);
							  else 
							    transitionStacked(newx, newy, nviewId);
						};
						function transitionGrouped(newx, newy, nviewId) {
							
							if(newx) x = newx; 
							if(newy) y = newy; 
							if(newx) viewId = nviewId; 
						  y.domain([0, yMax]);
						  if(newx) {  	
						  	  series = d3.selectAll(".series"+viewId);
						  	  //console.log(series);
						  	  rect = series.selectAll("rect");
						  }
						  //console.log(xz);
						  rect.transition()
						      .duration(1000)
						      //.delay(function(d, i) { return i * 10; })
						      .attr("x", function(d, i) {							         
						      	 return x(xz[i]) + x.bandwidth() / levels.length * this.parentNode.__data__.key; })
						      .attr("width", x.bandwidth() / levels.length)
						    .transition()
						      .attr("y", function(d) { 
						      	return y(d[1] - d[0]); })
						      .attr("height", function(d) { 
						      	return y(0) - y(d[1] - d[0]); });
						}
						function transitionStacked(newx, newy, nviewId) {
							if(newx) x = newx; 
							if(newy) y = newy; 
							if(newx) viewId = nviewId; 
						  y.domain([0, y1Max]);
						  if(newx) {
						  	//console.log("THERE");
						  	//console.log(viewId); 
						  	  series = d3.selectAll(".series"+viewId);
						  	  console.log(series);
						  	  rect = series.selectAll("rect");
						  }
						  rect.transition()
						      .duration(200)
						      .delay(function(d, i) { return i * 10; })
						      .attr("y", function(d) { return y(d[1]); })
						      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
						    .transition()
						      .attr("x", function(d, i) { return x(xz[i]); })
						      .attr("width", x.bandwidth());
						}

						 
						/*$("#card"+viewId).resize(function(e){
							 resize(); 
						});*/

						//self.event = new Event('resize');
						//document.getElementById("#card"+viewId).addEventListener("resize", resize);
						
						},
						fixDataFormat: function(sdata){
							var self = this;						
							var data = [];
							
							for(var key in sdata){
								data.push({'date': key, 'number': sdata[key][Object.keys(sdata[key])[0]]['value'] });								
							}							
							return data; 
						},
						resize: function(){
							var self = this;
							var margin = self.cat? {top: 0, right: 10, bottom: 50, left:30} : {top: 10, right: 10, bottom: 65, left:30}; //TODO: modify this according to different views
							var scale = self.parent.expanded? 0.6 : 0.9; 
							var parentW = parseInt(d3.select("#card"+self.id).style("width")),
								parentH = parseInt(d3.select("#card"+self.id).style("height"));
							var svgw = parentW * scale,
								svgh = parentH * scale;
								// update the range of the scale with new width/ height
							var width = svgw - margin.right - margin.left, 
								height = svgh - margin.top - margin.bottom; 

							var x = d3.scaleBand().rangeRound([0, width]).padding(0.1), 
								y = d3.scaleLinear().range([height, 0]).nice(); 
							//var data = self.audit === "picanet"? self.fixDataFormat() :self.data; 							
							var data = self.data; 
							console.log(data);
							x.domain(data.map(function(d){
									return d.date; 
							}));
							y.domain([0, d3.max(data, function(d){ return d.number; })]);
							
							// update svg width and height
							var iter = self.iter; 
							self.svg = self.getMainSVG(self.id); 
							var xoffset = self.parent.expanded? (scale - 0.9) * width : 0; 
							self.svg.attr("width", svgw)
									.attr("height", svgh)
									.attr("transform", "translate("+ xoffset +",0)" );

							x.rangeRound([0, width]).padding(0.1);
							y.range([(height), 0]); 

							////console.log(self.svg.selectAll("*"));
							self.svg.select(".x.axis")
							.attr("transform", "translate("+ 0+"," + (height + margin.top ) + ")")
							      .call(d3.axisBottom(x))
									.selectAll("text")	
									.text(function(d){
											return $Q.months[d-1]; 
										})
								        .style("text-anchor", "end")
								        .attr("dx", "-.8em")
								        .attr("dy", ".15em")
								        .attr("transform", "rotate(-65)");	

							self.svg.select(".y.axis")
									.call(d3.axisLeft(y).ticks(5, "s"))
							      	.attr("transform", "translate(0,"+ margin.top+")");
							
							if(self.cat) self.changed(x, y, self.id); 
							else{
								self.svg.selectAll(".bar")
								.attr("x", function(d) { 
									return x(d.date); })
							      .attr("y", function(d) { 
							      	return y(d.number)+ margin.top; })
							      .attr("width", x.bandwidth())
							      .attr("height", function(d) { return height  - y(d.number); });
							}		

						},
						getPalette: function(){
							return this.palette; 
						},
						getMainSVG: function(id){
							var self = this; 
							return (self.cat)? d3.select("#mainsvg"+id+"_"+self.iter) :d3.select("#mainsvg"+id); 
						},
						toggleBarView: function(viewId){
							var self = this;
							if(self.toggle === "grouped")
								self.toggle = "stacked";
							else
								self.toggle = "grouped";

							if(self.iter < 1)
								self.drawCatBar(viewId, self.dict, self.cat[viewId], self.levels, 0); 
							else{
								 var c = 0;
								 for(var key in self.dicts){
		                         	   self.drawCatBar(viewId, self.dicts[key], self.cat[viewId], self.levels, c, 1);
		                         	   c++; 
		                         	}
							}

						},
						drawBarTrellis: function(viewId, dicts, cat, levels){
							var self = this;						
							self.dicts = dicts; 
							var c =0; 
                            ////////console.log(dicts);
                            ////////console.log(cat);
                            ////////console.log(levels);
                            for(var key in dicts){
                         	   self.drawCatBar(viewId, dicts[key], cat[1], levels[1], c, 1);
                         	   c++;	
                         	   self.iter = c; 
                            }
                            
							//document.getElementById('mainCard').setAttribute("style","height:600px");
							//document.getElementById('mainCardPanel').setAttribute("style","height:500px");
							//document.getElementById('mainsvg').setAttribute("style","height:700px");
                               
						}

					});
 })(QUALDASH);
