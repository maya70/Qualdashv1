(function($Q){
	'use strict'
	$Q.SubBarChart = $Q.defineClass(
					null, 
					function SubBarChart(viewId, data, parent, svgw, svgh){
						var self = this;	
						self.parent = parent; 			
						self.draw(viewId, data, parent, svgw, svgh);
					},
					{
						updateDataLinks: function(viewId, data, parent){
							var self = this; 
							var parentData = parent.parent.dataViews[viewId]['data'];
							var cats = Object.keys(data);
							self.dataLinks = {};
							cats.forEach(function(cat){
								var dataLinks = {};
								for(var key in parentData){
									dataLinks[key] = {};
									for(var kk in parentData[key]){
										dataLinks[key][kk] = {};
										dataLinks[key][kk]['data'] = []; 
										dataLinks[key][kk]['value'] = 0; 
										for(var i=0; i < parentData[key][kk]['data'].length; i++){
											if(self.foundMatch(parentData[key][kk]['data'][i], cat, data)){
												dataLinks[key][kk]['data'].push(parentData[key][kk]['data'][i]);
												dataLinks[key][kk]['value']++; 
											}
										}
									}
								}
								self.dataLinks[cat] = dataLinks;
							});
							console.log(self.dataLinks);
						},
						foundMatch: function(datum, cat, piedata){
							var self = this; 
							for(var i=0; i < piedata[cat].length; i++)
								if(piedata[cat][i] === datum)
									return true; 
							return false; 
						},
						drawCatBar: function(viewId, dict, parent, svgw, svgh){
							var self = this; 
								self.dict = dict;	
								var levels = Object.keys(dict[Object.keys(dict)[0]]); 
								var undef;

                                var ordered = [];
                                var orderedKeys = Object.keys(dict);
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
                                    
                                   var y01z = d3.stack().keys(d3.range(levels.length))(d3.transpose(yz)),
                                        yMax = d3.max(yz, function(y) { return d3.max(y); }),
                                        y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); });
    
                            self.yMax = y1Max; 
                            self.palette = [];

							if(self.parent.g2){
								var undef;
								d3.selectAll(".slave-draw-area-1"+self.id).remove(); 
								//self.parent.g1 = undef; 
							}
							
							self.parent.g2 = self.parent.ssvg2.append("g").attr("class", "slave-draw-area-2"+self.id);

							var margin = {top: 10, right: 20, bottom: 20, left:20};
							var width = svgw - margin.left - margin.right; 
							var height = svgh - margin.top - margin.bottom;
							
							var scale = 0.9; 
							
							self.parent.g2.append("g").attr("transform","translate(" + margin.left + "," + margin.top + ")" );

							var timeout = d3.timeout(function() {
											  changed(); 
											}, 4000);

							var g = self.parent.g2; 

							var x = d3.scaleBand()
									    .domain(xz)
									    .rangeRound([0, width])
									    .padding(0.08);

							var y = d3.scaleLinear()
							    .domain([0, y1Max])
							    .range([height, 0]);

							var color = d3.scaleOrdinal()
							    .domain(d3.range(levels.length))
							    .range(d3.schemeCategory10);

							var series = g.selectAll(".series-sub")
							  .data(y01z)
							  .enter().append("g")
							  	.attr("class", "series-sub"+viewId)
							    .attr("fill", function(d, i) { 
							    	self.palette[i] = color(i);
							    	return color(i); });
							
							var origColor; 
							var rect = series.selectAll("rect")
							  .data(function(d) { return d; })
							  .enter().append("rect")
							  	.attr("class", "bar-sub")
							    .attr("x", function(d, i) { return x(i); })
							    .attr("y", height)
							    .attr("width", x.bandwidth())
							    .attr("height", 0)
							     .on("mouseover", function(d){
							  
							      	origColor = d3.select(this).style("fill");
							      	d3.select(this).style("fill", "brown");

							      })
							      .on("mouseout", function(d){
							      
							      	d3.select(this).style("fill", origColor);
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
						
						function transitionGrouped() {
							
						  y.domain([0, yMax]);
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
						function transitionStacked() {
							  y.domain([0, y1Max]);
				
							  rect.transition()
							      .duration(200)
							      .delay(function(d, i) { return i * 10; })
							      .attr("y", function(d) { return y(d[1]); })
							      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
							    .transition()
							      .attr("x", function(d, i) { return x(xz[i]); })
							      .attr("width", x.bandwidth());
							}

						},
						draw: function(viewId, data, parent, svgw, svgh){
							var self = this;
							//self.updateDataLinks(viewId, data, parent);
							console.log(data); 
							self.drawCatBar(viewId, data, parent, svgw, svgh); 
							
						}
					});
 })(QUALDASH);
