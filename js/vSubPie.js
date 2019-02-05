(function($Q){
	'use strict'
	$Q.SubPieChart = $Q.defineClass(
					null, 
					function SubPieChart(viewId, dname, data, parent, svgw, svgh){
						var self = this;	
						self.parent = parent; 
						
						self.draw(viewId, dname, data, parent, svgw, svgh);
							
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
							//console.log(self.dataLinks);
						},
						nohighlight: function(){
							var self = this;
							var updated = self.update(self.data); 
							self.updatePieLabels(updated); 

						},
						highlight: function(recIds){
							var self = this;	
							var temp = [];	
							for(var key in self.data){								
								var sum = 0;
								var arr = [];
								self.data[key]['data'].forEach(function(rec){
									if(recIds.indexOf(rec) >= 0){
										sum++;
										arr.push(rec);
									}
								});			
								temp.push({"date": self.data[key]['date'], "number": sum, "data": arr});					
							}	
							var updated = self.update(temp); 	
							self.updatePieLabels(updated, recIds);									

						},
						updatePieLabels: function(updated, recIds){
							var self = this;
							var sliceIndex = {};
							var highlighted = [];	
							
							for(var key in updated){
								sliceIndex[updated[key]['data']['date']] = updated[key];
								//newslices[updated[key]['data']['date']]['startAngle'] = updated[key]['startAngle'];
								//newslices[updated[key]['data']['date']]['endAngle'] = updated[key]['endAngle'];
							}
							var keys;
							if(self.parent.selection){	
								keys = [];	
								for(var kk in self.parent.selection){						
									var kkk = Object.keys(self.parent.selection[kk]);
									kkk.forEach(function(kkkk){
										keys.push(kkkk);
									}); 	
									}							
								//console.log(keys); 
							}
							
							var recIds = recIds || keys || []; 
							var arc = d3.arc()
									    .innerRadius(0)
									    .outerRadius(self.radius);	
							self.arcs.selectAll("path")
										.style("opacity", function(d){											
											var found = false; 
											if(d.data['data']){
												d.data['data'].forEach(function(rec){
													if(recIds.indexOf(rec) >=0 ){
														found = true;  		
													}
												});
											}
											if(found || recIds.length === 0){
												highlighted.push(d.data.date);
												self.text.transition().duration(100)
													.attrTween("transform", function(d){
														this._current = sliceIndex[d.data.date];
														var interpolate = d3.interpolate(this._current, d);
														this._current = interpolate(0);
														var cur = this._current; 
														
														return function(t) {
															var d2 = cur; 
															var pos = arc.centroid(d2);
															pos[1] *= 2.0; 
															pos[0] = self.radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
															return "translate("+pos+")";														
														};
													})
													.style("opacity", function(t){
														if(highlighted.indexOf(t.data.date) >=0)
															return 1;
														else
															return 0; 
													});
												self.polys.transition().duration(100)
												.attrTween("points", function(d){
															this._current = sliceIndex[d.data.date];
															var interpolate = d3.interpolate(this._current, d);
															this._current = interpolate(0);
															var cur = this._current; 
															return function(t) {
																var d2 = cur; 
																var pos = arc.centroid(d2);
																pos[1] *= 2; 
																pos[0] = self.radius * 0.92 * (midAngle(d2) < Math.PI ? 1 : -1);
																return [arc.centroid(d2), arc.centroid(d2), pos];
															};			
														})
													.style("opacity", function(p){
														return (highlighted.indexOf(p.data.date) >=0)? 1: 0;															
													});											    											    
											}
										
										return 1.0; 
										});		
								
										function midAngle(d){
												return d.startAngle + (d.endAngle - d.startAngle)/2;
											}
							
						},
/*text.transition().duration(1000)
								.attrTween("transform", function(d) {
									this._current = this._current || d;
									var interpolate = d3.interpolate(this._current, d);
									this._current = interpolate(0);
									
									return function(t) {
										var d2 = interpolate(t);
										var pos = arc.centroid(d2);
										pos[1] *= 2.0; 
										//pos[0] =  Math.atan(midAngle(d2));
										pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
										//var midAngle = d.endAngle < Math.PI ? d.startAngle/2 + d.endAngle/2 : d.startAngle/2  + d.endAngle/2 + Math.PI; 
										return "translate("+pos+")";
										//return (Math.abs(d.endAngle - d.startAngle) >= (Math.PI/8) )? 
										//		"translate("+ newarc.centroid(d) +") rotate(-90) rotate("+ (midAngle* 180/Math.PI) + ")"
										//		: "translate(0,0)";
									};
								})
								.style("opacity", function(d){
									//return (Math.abs(d.endAngle - d.startAngle) >= (Math.PI/8) )? 1: 0 ;
									return 1; 
								})
								.styleTween("text-anchor", function(d){
									this._current = this._current || d;
									var interpolate = d3.interpolate(this._current, d);
									this._current = interpolate(0);
									return function(t) {
										var d2 = interpolate(t);
										return midAngle(d2) < Math.PI ? "start":"end";
									};
								}); */
						update: function(data) {
							var self = this;
						    var duration = 500;
						    var pie = d3.pie()
									  .sort(null)
									  .value(function(d) {
									    return d.number;
									  });
							var key = function(d) { return d.data.date; };
							
						    var oldData = self.arcs.selectAll("path")
									      .selectAll("path")
									      .data().map(function(d) { return d.data });

						
						    if (oldData.length == 0) oldData = data;

						    var was = mergeWithFirstEqualZero(data, oldData);
						    var is = mergeWithFirstEqualZero(oldData, data);
						    //console.log(was);
						    var arc = d3.arc()
								  .outerRadius(self.radius * 1.0)
								  .innerRadius(self.radius * 0.0);
						    
						    var slice = self.arcs.selectAll("path")
						      			.data(pie(was), key);

						    slice.enter()
						      .insert("path")
						      .attr("class", "slice")
						      .style("fill", function(d) { return self.color(d.data.date); })
						      .each(function(d) {
						          this._current = d;
						        });

						    slice = self.arcs.selectAll("path")
						      			.data(pie(is), key);

						    slice.transition()
						      .duration(duration)
						      .attrTween("d", function(d) {
						          var interpolate = d3.interpolate(this._current, d);
						          var _this = this;
						          return function(t) {
						              _this._current = interpolate(t);
						              return arc(_this._current);
						            };
						        });

						    slice = self.arcs.selectAll("path")
						      .data(pie(data), key);

						    slice.exit()
						      .transition()
						      .delay(duration)
						      .duration(0)
						      .remove();

						    function mergeWithFirstEqualZero(first, second){

									  var secondSet = d3.set();

									  second.forEach(function(d) { secondSet.add(d.date); });

									  var onlyFirst = first
									    .filter(function(d){ return !secondSet.has(d.date) })
									    .map(function(d) { return {date: d.date, number: 0}; });

									  var sortedMerge = d3.merge([ second, onlyFirst ])
									    .sort(function(a, b) {
									        return d3.ascending(a.date, b.date);
									      });

									  return sortedMerge;
									}
							return pie(data); 
						},
						foundMatch: function(datum, cat, piedata){
							var self = this; 
							for(var i=0; i < piedata[cat].length; i++)
								if(piedata[cat][i] === datum)
									return true; 
							return false; 
						},
						draw: function(viewId, dname, data, parent, svgw, svgh){
							var self = this;
							////////////console.log(data);
							self.updateDataLinks(viewId, data, parent);
							self.parent = parent; 
							self.id = viewId;
							self.data = [];
							self.totalNumRecs = 0; 
							for(var key in data){
								self.totalNumRecs += data[key].length;
								self.data.push({'date': key, 'number': data[key].length, 'data': data[key]});
							}
							if(self.parent.g1){
								var undef;
								d3.selectAll(".slave-draw-area-1"+self.id).remove(); 
								//self.parent.g1 = undef; 
							}

							//self.svg = pSVG;
							self.parent.g1 = self.parent.ssvg1.append("g").attr("class", "slave-draw-area-1"+self.id);

							var margin = {top: 25, right: 30, bottom: 20, left:20};
							var width = svgw - margin.left - margin.right; 
							var height = svgh - margin.top - margin.bottom;
							
							var pie = d3.pie()
									    .sort(null)
									    .value(d => d.number);

							var arcLabel = function() { 
											const radius = Math.min(width, height) / 2 ;
  											return d3.arc().innerRadius(radius).outerRadius(radius);
											};
							var radius = Math.min(width, height) / 2 - 1; 
							self.radius = radius; 
							var arc = d3.arc()
									    .innerRadius(0)
									    .outerRadius(radius);
							var color = d3.scaleOrdinal()
										  .domain(self.data.map(d => d.date))
										  .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), self.data.length).reverse());
										  //.range(d3.quantize(t => d3.interpolateRgb("steelblue", "brown"), data.length).reverse());
	 					    self.color = color; 
	 					    const arcs = pie(self.data);

							const g = self.parent.g1.append("g")
						      .attr("transform", "translate("+((width / 2)+margin.left+10)+","+((height / 2)+margin.top)+")")
						      .attr("text-anchor", "middle")
							  .style("font", "12px sans-serif");
						  
							  var origColor;

							  g.selectAll("path")
							    .data(arcs)
							    .enter().append("path")
							      .attr("class", "vis-element")
							      .attr("fill", d => 
							      	 color(d.data.date))							      
							      .attr("stroke", "white")
							      .on("mouseover", function(d){		
							      	self.parent.highlight(self.dataLinks[d.data.date], viewId);
							      	////console.log(self.dataLinks[d.data.date]);			
							      	origColor = d3.select(this).style("fill");
							      	d3.select(this).style("fill", "brown");
							      })
							      .on("mouseout", function(d){
							      	self.parent.nohighlight(); 
							      	d3.select(this).style("fill", origColor);
							      })
							      .on("click", function(d){		
							       var selStatus = d3.select(this).attr("selected");
							      	if(!selStatus || selStatus === "false"){
							      		// set selection
							      		console.log(d.data.data);
							      		if(self.parent.selection){
							      			// filter existing selection for all keys 
							      			for(var key in self.parent.selection){
							      				self.parent.updateSelection(key, d.data.data, 0, 1); 
							      			}
							      		}
							      		else{
							      			// set new selection for all keys
							      			for(var key in self.parent.selection){
							      				self.parent.updateSelection(key, d.data.data, 1); 
							      			}
							      		}
							      	}

							       })
							      .attr("d", arc)
							    .append("title")
							      .text(d => `${d.data.date}: ${d.data.number.toLocaleString()}`);

						      g.append("g")
								.attr("class", "labels");

							  g.append("g")
								.attr("class", "lines")
								.style("opacity", 0.3)
								.style("stroke", "black")
								.style("stroke-width", "2px" )
								.style("fill", "none"); 
						     
						     var text = g.select(".labels").selectAll("text")
								.data(arcs).enter()
								.append("text")
										.attr("dy", ".35em")
										.text(function(d) {
											////console.log(d); 
											//if(d.data.number < (self.totalNumRecs/20))
											//	return '';
											//else 
												return $Q.ValueDefs[self.parent.parent.control.audit][dname]?
												 $Q.ValueDefs[self.parent.parent.control.audit][dname][d.data.date] : d.data.date;
										});
									
							function midAngle(d){
								return d.startAngle + (d.endAngle - d.startAngle)/2;
							}
							/*var newarc = d3.arc()
										.innerRadius(radius / 4)
										.outerRadius(radius/2);
							*/
							text.transition().duration(1000)
								.attrTween("transform", function(d) {
									this._current = this._current || d;
									var interpolate = d3.interpolate(this._current, d);
									this._current = interpolate(0);
									
									return function(t) {
										var d2 = interpolate(t);
										var pos = arc.centroid(d2);
										pos[1] *= 2.0; 
										//pos[0] =  Math.atan(midAngle(d2));
										pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
										//var midAngle = d.endAngle < Math.PI ? d.startAngle/2 + d.endAngle/2 : d.startAngle/2  + d.endAngle/2 + Math.PI; 
										return "translate("+pos+")";
										//return (Math.abs(d.endAngle - d.startAngle) >= (Math.PI/8) )? 
										//		"translate("+ newarc.centroid(d) +") rotate(-90) rotate("+ (midAngle* 180/Math.PI) + ")"
										//		: "translate(0,0)";
									};
								})
								.style("opacity", function(d){
									//return (Math.abs(d.endAngle - d.startAngle) >= (Math.PI/8) )? 1: 0 ;
									return 1; 
								})
								.styleTween("text-anchor", function(d){
									this._current = this._current || d;
									var interpolate = d3.interpolate(this._current, d);
									this._current = interpolate(0);
									return function(t) {
										var d2 = interpolate(t);
										return midAngle(d2) < Math.PI ? "start":"end";
									};
								});

							self.arcs = g;
							self.text = text; 
							
							text.exit()
							  .remove();

							  var polyline = g.select(".lines").selectAll("polyline")
								.data(arcs).enter()
								.append("polyline")
								.style("opacity", function(d){
									////console.log(d);
									//if(d.data.number < (self.totalNumRecs/20))
									//	return 0.0; 
									//else
										return 1.0; 
								});

							polyline.transition().duration(1000)
								.attrTween("points", function(d){
									this._current = this._current || d;
									var interpolate = d3.interpolate(this._current, d);
									this._current = interpolate(0);
									return function(t) {
										var d2 = interpolate(t);
										var pos = arc.centroid(d2);
										pos[1] *= 2; 
										pos[0] = radius * 0.92 * (midAngle(d2) < Math.PI ? 1 : -1);
										return [arc.centroid(d2), arc.centroid(d2), pos];
									};			
								});
							self.polys = polyline; 
							polyline.exit()
								.remove();
							

							
							
						}
					});
 })(QUALDASH);
