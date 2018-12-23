(function($Q){
	'use strict'
	$Q.QualCard = $Q.defineClass(
					null, 
					function QualCard(mainView, viewId){
						var self = this; 
						self.expanded = false; 
						self.id = viewId; 
						self.parent = mainView; 
						var container = d3.select("#mainCanvas").append("div")
											.attr("class", "item")
											.attr("id", "cardcontainer"+viewId)
											.on("dblclick", function(){
												//console.log(this);	
												var curh = parseInt($(this).css("height")),
													curw = parseInt($(this).css("width"));
												
												if(self.expanded === false)
												{  // grow
													//console.log("growing from "+ curh);
													curh *= 2;
													curw *= 2;	
													self.expanded = true; 
												}
												else
												{   // shrink
													//console.log("shrinking from "+ curh);
													curh /= 2;
													curw /= 2; 
													self.expanded = false; 
												}
												$(this).css("height", curh+"px"); 
												$(this).css("width", curw+"px"); 
												self.parent.refreshGrid(); 
												self.resizeVis(); 
											});
						
						self.createHeader(container, viewId);
						
						var cbody = container.append("div")
								.attr("class", "card-body")
								.style("width", "98%")
								.style("height", "92%")
								.style("padding-bottom", "3px")
								.style("margin-right", "1%")
								.style("margin-left", "1%")
								.style("margin-top", "-10px")
								.style("vertical-align", "top"); 
								 
						
						var panel = cbody.append("div")
										.attr("class", "w3-sidebar")
										.attr("id", "panel"+viewId)
										.style("background-color", "darkgrey")
										.style("max-width", "10%")
										.style("height", "82%").style("padding-bottom", "3px")
								.style("margin-right", "1%")
								.style("margin-left", "0%")
								.style("overflow", "visible"); 
						
						self.createButtons(panel, viewId); 					
						var card = cbody.append("div")
										.attr("class", "item-content")
										.attr("id", "card"+viewId)
										.on("doubleclick", function(d){
	
										});
						card.append("div")
							.attr("class", "draw-area")
							.attr("id", "draw-area"+viewId);
						
					},
					{
						resizeVis: function(){
							var self = this;
							var margin = self.cat? {top: 0, right: 10, bottom: 50, left:30} : {top: 10, right: 10, bottom: 65, left:30}; //TODO: modify this according to different views
							var svgw = parseInt(d3.select("#card"+self.id).style("width")) * 0.9,
								svgh = parseInt(d3.select("#card"+self.id).style("height")) * 0.9;
								// update the range of the scale with new width/ height
							var width = svgw - margin.right - margin.left, 
								height = svgh - margin.top - margin.bottom; 

							var x = d3.scaleBand().rangeRound([0, width]).padding(0.1), 
								y = d3.scaleLinear().range([height, 0]).nice(); 
							var data = self.parent.dataViews[self.id]['data']; 							
							x.domain(data.map(function(d){
									return d.date; 
							}));
							y.domain([0, d3.max(data, function(d){ return d.number; })]);
							
							// update svg width and height
							var iter = self.iter; 
							self.svg = (self.cat)? d3.select("#mainsvg"+self.id+"_"+iter) :d3.select("#mainsvg"+self.id); 

							self.svg.attr("width", svgw)
									.attr("height", svgh);

							x.rangeRound([0, width]).padding(0.1);
							y.range([(height), 0]); 

							////console.log(self.svg.selectAll("*"));
							self.svg.select(".x.axis")
							.attr("transform", "translate("+ 0+"," + (height + margin.top ) + ")")
							      .call(d3.axisBottom(x))
									.selectAll("text")	
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
						createHeader: function(container, viewId){
							var self = this; 
							var header = container.append("div")
									.attr("class", "form-inline")
									.style("text-align", "left")
									.style("max-height", 35)
									.style("width", "90%")
									.style("margin-left", "3px")
										.append("div").attr("class", "form-group")
											//.style("height", 43)
											.style("width", "90%")
											.style("max-height", 45)
											.style("vertical-align", "top")
											.style("text-align", "left")
											.style("padding-top", 0)											
											.style("margin-top", 0); 

							var metricSelect = header.append("select")
												.attr("name", "metricselector")
												.attr("class", "form-control")
												.style("vertical-align", "top")
												.attr("id", "sel"+viewId)
												.style("font-size", "9pt")
												.style("horizontal-align", "left")
												.style("min-width", "45%")
												.style("margin-left",0)
												.on("change", function(d){													
													//console.log(this.value);													
													self.parent.control.updateMetrics(viewId, this.value); 											
													var dv = self.parent.getMetricDataView(this.value);
													//console.log(dv); 
													//TODO: reset here the grouping variables and dicts of this view
													self.parent.control.resetCategoricals(viewId); 
													self.drawBarChart(viewId, dv['data']);
												});

							
							for(var m = 0; m < self.parent.availMetrics.length; m++){
								metricSelect.append("option")
											.attr("value", self.parent.availMetrics[m]['value'])
											.text(self.parent.availMetrics[m]['text'])
											.style("font-size", "9pt");
							}
							
							var curMetric = self.parent.availMetrics[(viewId%self.parent.availMetrics.length)]['value'];
							//////console.log(curMetric);
							$('#sel'+viewId).val(curMetric);
							$('.selectpicker').selectpicker('refresh');

							var viewSelect = header.append("select")
												.attr("name", "viewselector")
												.attr("class", "form-control")
												.attr("id", "vsel"+viewId)
												.style("font-size", "9pt")
												.style("vertical-align", "top")
												.style("horizontal-align", "right")
												//.style("margin-right", "10px")
												.style("min-width", "43%")
												.on("change", function(){
													var dataViews = self.parent.control.getDataViews(); 
													//console.log(dataViews[viewId]); 
													self.populateCard(dataViews[viewId]); 
												});
							
							for(var m = 0; m < self.parent.availViews.length; m++){
								viewSelect.append("option")
											.attr("value", self.parent.availViews[m]['value'])
											.text(self.parent.availViews[m]['text'])
											.style("font-size", "9pt");
								}
							
						},
						createButtons: function(panel, viewId){
							var self = this; 

							var pbody = panel;
							var undef; 
							self.btn_data = [{"id": "split-btn"+viewId, "class": "ctrl-btn fa fa-share-alt", "data-toggle": "popover", "hidden": false, "data-popover-content":"#pp"+viewId}, 
											{"id": "toggle-btn"+viewId, "class": "ctrl-btn fa fa-adjust", "data-toggle": "none", "hidden": true}, 
											{"id": "axes-btn"+viewId, "class": "ctrl-btn fa fa-arrows", "data-toggle": "popover", "hidden": false, "data-popover-content":"#aa"+viewId}]; 

							//pbody.style("background-color", "red");
							var divs = pbody.selectAll(".ctrl-btn")
											.data(self.btn_data)
											.enter().append("div")
											.style("background-color", "darkgrey")
											.style("max-height", "12%"); 

							divs.append("button")
								.attr("type", "button")
								.attr("id", function(d){
									return d["id"]; 
								})
								.attr("class", function(d){
									return d["class"]; 
								})
								.attr("data-toggle", function(d){
									return d["data-toggle"]; 
								})
								.attr("data-placement", function(d){
										if(viewId%3 === 0)
											return "bottom";
										else
											return "left"; 
									})
								.attr("data-popover-content",function(d){
									return d["data-popover-content"];
								})
								.attr("hidden", function(d){
									if(d["hidden"]) return true; 
									else 
										return undef; 
								})
								.style("max-width", "90%")
								.style("vertical-align", "top")
								.style("background-color", "lightgrey")
								.style("color", "black"); 

							var split_ttip = $("#split-btn"+viewId).tooltip({    
							    placement : 'bottom',  
							    title : "Groups"         
							  });


							 $("#axes-btn"+viewId).tooltip({    
							    placement : 'bottom',  
							    title : "Axes"         
							  });    
							  

						},
						getChartType: function(){
							var self = this; 
							var viewType = $("#vsel"+self.id +' option:selected').val(); 
							//console.log("TYPE = "+ viewType);
							return viewType; 

						},
						
						populateCard: function(dataView){
							var self = this; 
							var chartType = self.getChartType(dataView['viewId']); 
							
							if(chartType === 'bar')
								self.vis = new $Q.BarChart(dataView, self);
							else if(chartType === 'line')
								self.vis = new $Q.LineChart(dataView, self);
							else if(chartType === 'scatter')
								self.vis = new $Q.ScatterChart(dataView, self);
							else if(chartType === 'pie')
								self.vis = new $Q.PieChart(dataView, self); 
						},
						drawPieChart: function(dataView){
							var self = this; 
							console.log(dataView);
							var viewId = dataView['viewId'];
							var data = dataView['data'];
							

						},
						drawScatter: function(dataView){
							var self = this; 
							//console.log(dataView);
							//scale function
							/*
							var xScale = d3.scaleLinear()
								//.domain(["Alabama","Alaska","Arizona","Arkansas","California"])
								.domain([0, d3.max(dataset, function(d) { return d[0]; })])
								//.range([padding, w-padding * 2]);
								.range([padding, w - padding * 2]);
								
							var yScale = d3.scaleLinear()
								.domain([0, d3.max(dataset, function(d) { return d[1]; })])
								//.range([padding, w-padding * 2]);
								.range([h - padding, padding]);
							
							var xAxis = d3.axisBottom().scale(xScale).ticks(5);
							
							var yAxis = d3.axisLeft().scale(yScale).ticks(5);
							
							//create svg element
							var svg = d3.select("body")
										.append("svg")
										.attr("width", w)
										.attr("height", h);
										
							svg.selectAll("circle")
								.data(dataset)
								.enter()
								.append("circle")
								.attr("cx", function(d) {
									return xScale(d[0]);
								})
								.attr("cy", function(d) {
									return h - yScale(d[1]);
								})
								.attr("r", 5)
								.attr("fill", "green");
								
							//x axis
							svg.append("g")
								.attr("class", "x axis")	
								.attr("transform", "translate(0," + (h - padding) + ")")
								.call(xAxis);
							
							//y axis
							svg.append("g")
								.attr("class", "y axis")	
								.attr("transform", "translate(" + padding + ", 0)")
								.call(yAxis);

								*/
			
						}
						
					});
	})(QUALDASH);	