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
												////////console.log(this);	
												var curh = parseInt($(this).css("height")),
													curw = parseInt($(this).css("width"));
												
												if(self.expanded === false)
												{  // grow
													////////console.log("growing from "+ curh);
													curh *= 2;
													curw *= 2;	
													self.expanded = true; 
												}
												else
												{   // shrink
													////////console.log("shrinking from "+ curh);
													curh /= 2;
													curw /= 2; 
													self.expanded = false; 
												}
												$(this).css("height", curh+"px"); 
												$(this).css("width", curw+"px"); 
												self.parent.refreshGrid(1); 
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
								 
						
						
						
						var card = cbody.append("div")
										.attr("class", "item-content")
										.attr("id", "card"+viewId);
						card.append("div")
							.attr("class", "draw-area")
							.attr("id", "draw-area"+viewId);

						var panel = cbody.append("div")
										.attr("class", "w3-sidebar")
										.attr("id", "panel"+viewId)
										.style("background-color", "darkgrey")
										.style("max-width", "9%")
										.style("height", "82%").style("padding-bottom", "3px")
										.style("display", "inline-block")
										.style("visibility", "hidden")
								.style("margin-right", "0%")
								.style("margin-left", "0%")
								.style("overflow", "visible"); 
						

						self.createButtons(panel, viewId); 					
						
					},
					{
					
						createSlave1: function(cats, ssvgW, ssvgH, xoffset){
							var self = this;
							var cat1 = cats['cats'][0];
							var catdata = cats['data'][cat1];
							//////console.log(catdata);

							var tabW = ssvgW/ cats['cats'].length;

							self.ssvg1div =d3.select("#draw-area"+self.id).append("div")
											.attr("class", "ssvgdiv"+self.id)																						
											.style("max-width", ssvgW+"px")
											.style("max-height", ssvgH+"px")	
											.style("position", "absolute")
											.style("top", "11px")
											.style("left", xoffset+"px")
											.style("border", "1px solid black");											

							self.ssvg1 = self.ssvg1div.append("svg")
											.attr("id", "ssvg1"+self.id)
											.attr("class", "ssvg"+self.id)
											.style("display", "inline-block")
											.attr("width", ssvgW)
											.attr("height", ssvgH);	
							
							
							/*self.ssvg1 = d3.select("#draw-area"+self.id).append("svg")
											.attr("id", "ssvg1"+self.id)
											.attr("class", "ssvg"+self.id)
											.style("display", "inline-block")
											.attr("width", ssvgW)
											.attr("height", ssvgH)	
											.style("position", "absolute")
											.style("top", 11)
											.style("left", xoffset);										
											//.attr("transform", "translate("+ 0 +","+ (-200) +")");
							*/
							var tabs = self.ssvg1.selectAll(".stabs"+self.id)
										.data(cats['cats'])
										.enter().append("g")
										.attr("class", "stabs"+self.id)
										.attr("transform", function(d, i){
											return "translate("+ (i*tabW) + ",0)"; 
										})
										.on("click", function(d){
											// deselect all tabs
											var all = d3.selectAll(".rtabs"+self.id);
											all.attr("active", 0);
											all.style("fill", "lightgrey");
											all.style("stroke", "white");

											// select only current tab
											var r = d3.select(this).select("rect");
												r.attr("active", 1);
												r.style("fill", "white");
												r.style("stroke", "black");			
											
											catdata = cats['data'][d];
											self.subVis1.draw(self.id, catdata , self, ssvgW-10, ssvgH-10);

										})
										.on("mouseover", function(d){
											d3.select(this).select("rect").style("fill", "white");
											//d3.select(this).style("fill", "white");
										     
										})
										.on("mouseout", function(d){
											d3.select(this).select("rect").style("fill", function(d){
												var a = d3.select(this).attr("active");
												return a === "1"? "white" : "lightgrey"; 
											});												
										});


									tabs.append("rect")
										.attr("class", "rtabs"+self.id)
										.attr("x", 0)
										.attr("y", 0)
										.attr("width", tabW )
										.attr("active", function(d,i){
											return i===0? 1 : 0; 
										})
										.attr("height", 15 )
										.style("fill", function(d){
											var a = d3.select(this).attr("active");
											return a === "1"? "white" : "lightgrey"; 
										})
										.style("rx", 5)
										.style("stroke", function(d){
											var a = d3.select(this).attr("active");
											return a === "1"? "black" : "white"; 
										});

							tabs.append("text")
								.attr("dy", "1.2em")
								.attr("dx", ".3em")
							    .text(function(d) { return $Q.Picanet["variableDict"][d] || d; })
							    .style("font", "8px sans-serif")
							     .style("text-anchor", "bottom")
							     ;
							
							/*self.ssvg1.append("rect")
									.attr("id","draw-rect-1-"+self.id)											
									.attr("x", 5)
									.attr("y", 15)
									.attr("width", ssvgW-10)
									.attr("height", ssvgH - 30)
									.style("stroke", "black")
									.style("fill", "none"); */

							
							self.subVis1 = new $Q.SubPieChart(self.id, catdata , self, ssvgW-10, ssvgH-10);

						},
						createSlave2: function(slaves, ssvgW, ssvgH, xoffset){
							var self = this;
							var quant1 = slaves['quants'][0]['q'];
							var qdata = slaves['data'][quant1];
							//////console.log(qdata);
							var quantityNames = slaves['quants']; 

							//exclude quantities that are already included in the main view 
							var mainQs = self.parent.control.audit === "picanet"? ($Q.Picanet["displayVariables"][self.id]["y"]):
																				 ($Q.Minap["displayVariables"][self.id]["y"]);

							mainQs.forEach(function(q){
								var index = quantityNames.indexOf(q);
								if(index >=0)
									quantityNames.splice(index,1); 
							});
							quantityNames.forEach(function(q, i){
								var index = mainQs.indexOf(q['q']);
								if(index >=0)
									quantityNames.splice(i,1); 
							});
						    console.log(quantityNames);

							var tabW = ssvgW/ quantityNames.length;

							self.ssvg2div =d3.select("#draw-area"+self.id).append("div")	
											.attr("class", "ssvgdiv"+self.id)																																												
											.style("max-width", ssvgW+"px")
											.style("max-height", ssvgH+"px")	
											.style("position", "absolute")
											.style("top", (ssvgH + 3)+"px")
											.style("left", xoffset+"px")
											.style("border", "1px solid black");											

							self.ssvg2 = self.ssvg2div.append("svg")
											.attr("id", "ssvg2"+self.id)
											.attr("class", "ssvg"+self.id)
											.style("display", "inline-block")
											.attr("width", ssvgW)
											.attr("height", ssvgH);													
						
																			
							var tabs = self.ssvg2.selectAll(".qtabs"+self.id)
										.data(quantityNames)
										.enter().append("g")
										.attr("class", "qstabs"+self.id)
										.attr("transform", function(d, i){
											return "translate("+ (i*tabW) + ",0)"; 
										})
										.on("click", function(d){
											// deselect all tabs
											var all = d3.selectAll(".rqtabs"+self.id);
												all.attr("active", 0);
												all.style("fill", "lightgrey");
												all.style("stroke", "white");

											// select only current tab
											var r = d3.select(this).select("rect");
												r.attr("active", 1);
												r.style("fill", "white");
												r.style("stroke", "black");			
											
											qdata = slaves['data'][d['q']];
											////console.log(qdata);
											//self.subVis2.draw(self.id, qdata , self, ssvgW-10, ssvgH-10);

										})
										.on("mouseover", function(d){
											d3.select(this).select("rect").style("fill", "white");
											//d3.select(this).style("fill", "white");
										     
										})
										.on("mouseout", function(d){
											d3.select(this).select("rect").style("fill", function(d){
												var a = d3.select(this).attr("active");
												return a === "1"? "white" : "lightgrey"; 
											});												
										});


							tabs.append("rect")
								.attr("class", "rqtabs"+self.id)
								.attr("x", 0)
								.attr("y", 0)
								.attr("width", tabW )
								.attr("active", function(d,i){
									return i===0? 1 : 0; 
								})
								.attr("height", 15 )
								.style("fill", function(d){
									var a = d3.select(this).attr("active");
									return a === "1"? "white" : "lightgrey"; 
								})
								.style("rx", 5)
								.style("stroke", function(d){
									var a = d3.select(this).attr("active");
									return a === "1"? "black" : "white"; 
								});

							tabs.append("text")
								.attr("dy", "1.2em")
								.attr("dx", "1.3em")
							    .text(function(d) { 
							    	return $Q.Picanet["variableDict"][d['q']]; })
							    .style("font", "8px sans-serif")
							     .style("text-anchor", "bottom");
							
							/*self.ssvg2.append("rect")
									.attr("id","draw-rect-2-"+self.id)											
									.attr("x", 5)
									.attr("y", 15)
									.attr("width", ssvgW-10)
									.attr("height", ssvgH - 30)
									.style("stroke", "black")
									.style("fill", "none"); */
							
							self.subVis2 = new $Q.SubBarChart(self.id, quant1, qdata , self, ssvgW-10, ssvgH-10);

						},
						createSlave3: function(slaves, ssvgW, ssvgH, xoffset){
							var self = this;
							
							var tabW = ssvgW/ slaves['combo'].length;
							self.ssvg3div =d3.select("#draw-area"+self.id).append("div")	
											.attr("class", "ssvgdiv"+self.id)																					
											.style("max-width", ssvgW+"px")
											.style("max-height", ssvgH+"px")	
											.style("position", "absolute")
											.style("top", (ssvgH*2 + 3)+"px")
											.style("left", xoffset+"px")
											.style("border", "1px solid black");											

							self.ssvg3 = self.ssvg3div.append("svg")
											.attr("id", "ssvg3"+self.id)
											.attr("class", "ssvg"+self.id)
											.style("display", "inline-block")
											.attr("width", ssvgW)
											.attr("height", ssvgH);													
						

							var ehrVar = self.parent.control.audit === "picanet"? $Q.Picanet["displayVariables"][self.id]["ehr"] 
																		:$Q.Minap["displayVariables"][self.id]["ehr"] ; 											
							var tabs = self.ssvg3.selectAll(".combstabs"+self.id)
										.data(ehrVar)
										.enter().append("g")
										.attr("class", "combstabs"+self.id)
										.attr("transform", function(d, i){
											return "translate("+ (i*tabW) + ",0)"; 
										})
										.on("click", function(d){
											// deselect all tabs
											var all = d3.selectAll(".combstabs"+self.id);
											all.attr("active", 0);
											all.style("fill", "lightgrey");
											all.style("stroke", "white");

											// select only current tab
											var r = d3.select(this).select("rect");
												r.attr("active", 1);
												r.style("fill", "white");
												r.style("stroke", "black");			
											
											//catdata = cats['data'][d];
											//self.subVis1.draw(self.id, catdata , self, ssvgW-10, ssvgH-10);

										})
										.on("mouseover", function(d){
											d3.select(this).select("rect").style("fill", "white");
											//d3.select(this).style("fill", "white");
										     
										})
										.on("mouseout", function(d){
											d3.select(this).select("rect").style("fill", function(d){
												var a = d3.select(this).attr("active");
												return a === "1"? "white" : "lightgrey"; 
											});												
										});


									tabs.append("rect")
										.attr("class", "rtabs"+self.id)
										.attr("x", 0)
										.attr("y", 0)
										.attr("width", tabW )
										.attr("active", function(d,i){
											return i===0? 1 : 0; 
										})
										.attr("height", 15 )
										.style("fill", function(d){
											var a = d3.select(this).attr("active");
											return a === "1"? "white" : "lightgrey"; 
										})
										.style("rx", 5)
										.style("stroke", function(d){
											var a = d3.select(this).attr("active");
											return a === "1"? "black" : "white"; 
										});

							tabs.append("text")
								.attr("dy", "1.2em")
								.attr("dx", ".3em")
							    .text(function(d) { return d; })
							    .style("font", "8px sans-serif")
							     .style("text-anchor", "bottom")
							     ;
							
							//var comb = slaves['combo'][0]; 
							//var combodata = slaves['data'][comb];
							var ehr = self.parent.control.getEHR(); 
							//self.subVis3 = new $Q.SubScatterChart(self.id, comb , combodata , self, ssvgW-10, ssvgH-10);
							self.subVis3 = new $Q.SubScatterChart(self.id, ehr , self, ssvgW-10, ssvgH-10);


						},
						createSlaveT: function(slaves, mainsvgW, drawAreaW, ssvgH, xoffset){
							var self = this;
							//var tdata = self.parent.control.getHistoryData(); 							
							var tdata = self.parent.control.getTimeHier(); 
							console.log(tdata);
							var span = self.parent.control.audit === "picanet"? $Q.Picanet['displayVariables'][self.id]['granT']
																				: $Q.Minap['displayVariables'][self.id]['granT'];
							var yvar =  self.parent.control.audit === "picanet"? $Q.Picanet['displayVariables'][self.id]['y'][1]
																				: $Q.Minap['displayVariables'][self.id]['y'][1];
							// filter tspan to remove the first time granularity, which is already displayed in the main view
							//var index = tspan.indexOf("monthly");
							var tspan = Object.keys(span);
							tspan.splice(0, 1);
							//var tdata = self.parent.control.prepTimeData(tspan[0], self.id, yvar );
							self.ssvgtdiv =d3.select("#draw-area"+self.id).append("div")	
											.attr("id", "ssvgtdiv"+self.id)																					
											.style("max-width", (drawAreaW-20)+"px")
											.style("max-height", ssvgH+"px")	
											.style("position", "absolute")
											.style("bottom", "10px")
											.style("left", "10px")
											.style("overflow-x", "scroll")
											.style("overflow-y", "hidden")
											.style("border", "1px solid black");											

							self.ssvgt = self.ssvgtdiv.append("svg")
											.style("display", "inline-block")
											.attr("id", "ssvgt"+self.id)
											.attr("class", "ssvg"+self.id)
											.attr("width", mainsvgW*2)
											.attr("height", ssvgH);	
																			
							
							var tabW = mainsvgW/ tspan.length;
							
							var tabs = self.ssvgt.selectAll(".sttabs"+self.id)
										.data(tspan)
										.enter().append("g")
										.attr("class", "sttabs"+self.id)
										.attr("transform", function(d, i){
											return "translate("+ (i*tabW) + ",0)"; 
										})
										.on("click", function(d){
											// deselect all tabs
											var all = d3.selectAll(".rttabs"+self.id);
											all.attr("active", 0);
											all.style("fill", "lightgrey");
											all.style("stroke", "white");

											// select only current tab
											var r = d3.select(this).select("rect");
												r.attr("active", 1);
												r.style("fill", "white");
												r.style("stroke", "black");			
											
											//catdata = cats['data'][d];
											//self.subVis1.draw(self.id, catdata , self, ssvgW-10, ssvgH-10);

										})
										.on("mouseover", function(d){
											d3.select(this).select("rect").style("fill", "white");
											//d3.select(this).style("fill", "white");
										     
										})
										.on("mouseout", function(d){
											d3.select(this).select("rect").style("fill", function(d){
												var a = d3.select(this).attr("active");
												return a === "1"? "white" : "lightgrey"; 
											});												
										});

									tabs.append("rect")
										.attr("class", "rttabs"+self.id)
										.attr("x", 0)
										.attr("y", 0)
										.attr("width", tabW )
										.attr("active", function(d,i){
											return i===0? 1 : 0; 
										})
										.attr("height", 15 )
										.style("fill", function(d){
											var a = d3.select(this).attr("active");
											return a === "1"? "white" : "lightgrey"; 
										})
										.style("rx", 5)
										.style("stroke", function(d){
											var a = d3.select(this).attr("active");
											return a === "1"? "black" : "white"; 
										});

							tabs.append("text")
								.attr("dy", "1.2em")
								.attr("dx", "1.3em")
							    .text(function(d) { 
							    	////console.log(d);
							    	 return d; })
							    .style("font", "8px sans-serif")
							     .style("text-anchor", "bottom");
											
							self.subVisT = new $Q.SubTimeChart(self.id, span[tspan[0]] , tspan[0], tdata , self, mainsvgW-10, ssvgH-10);						
						},
						nohighlight: function(){
							var self = this;
							self.vis.removeShade(); 
						},
						highlight: function(hdata, viewId){
							var self = this ;
							self.vis.highlight(hdata, viewId);
						},
						highlightSubs: function(recIds){
							var self = this; 
							if(self.subVis1) self.subVis1.highlight(recIds);
						},
						nohighlightSubs: function(){
							var self = this;
							if(self.subVis1) self.subVis1.nohighlight();	
						},
						resizeVis: function(refresh){
							var self = this;
							
							d3.select("#panel"+self.id)
								.style("visibility", "visible");

							self.vis.resize(); 
							var mainsvgW = parseInt(self.vis.getMainSVG(self.id).style("width"));
							var drawAreaW = parseInt(d3.select("#draw-area"+self.id).style("width"));
							var ssvgW = drawAreaW - mainsvgW - 40; 
							var xoffset = mainsvgW + 30 ;
							var mainsvgH = parseInt(self.vis.getMainSVG(self.id).style("height"));
							var drawAreaH = parseInt(d3.select("#draw-area"+self.id).style("height"));
							var ssvgH = drawAreaH / 3; 
							
								
							if(self.expanded && !self.ssvg1){
								
								
								// populate the first slave
								var slaves = self.getSlaves(); 
								////console.log(slaves);

								// handle the first visualization: a categorical
								
								self.createSlave1(slaves, ssvgW, ssvgH, xoffset);
								self.createSlave2(slaves, ssvgW, ssvgH, xoffset);
								//self.createSlave3(slaves, ssvgW, ssvgH, xoffset);
								self.createSlaveT(slaves, mainsvgW, drawAreaW, ssvgH, xoffset);

								

								
								
							}
							else if(!refresh || ((xoffset + ssvgW) > drawAreaW)){
								var undef;								
								d3.selectAll(".ssvg"+self.id).remove(); 
								d3.selectAll("#ssvgtdiv"+self.id).remove();
								d3.selectAll(".ssvgdiv"+self.id).remove();
								self.ssvg1 = undef;
								self.ssvg2 = undef;
								self.ssvg3 = undef;
								self.ssvgt = undef;
								self.expanded = false; 
								self.vis.resize();  
							}
							
						},
						getSlaves: function(){
								var self = this;
								return self.parent.getSlaves(self.id);
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
												.style("width", "45%")
												.style("margin-left",0)
												.on("change", function(d){													
													////////console.log(this.value);													
													self.parent.control.updateMetrics(viewId, this.value); 											
													var dv = self.parent.getMetricDataView(this.value);
													////////console.log(dv); 
													//TODO: reset here the grouping variables and dicts of this view
													self.parent.control.resetCategoricals(viewId); 
													self.drawBarChart(viewId, dv['data']);
												});

							document.getElementById("sel"+viewId).disabled = true;
							
							for(var m = 0; m < self.parent.availMetrics.length; m++){
								metricSelect.append("option")
											.attr("value", self.parent.availMetrics[m]['value'])
											.text(self.parent.availMetrics[m]['text'])
											.style("font-size", "9pt");
							}
							
							var curMetric = self.parent.availMetrics[(viewId%self.parent.availMetrics.length)]['value'];
							////////////console.log(curMetric);
							$('#sel'+viewId).val(curMetric);
							$('.selectpicker').selectpicker('refresh');

							/*var viewSelect = header.append("select")
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
													////////console.log(dataViews[viewId]); 
													self.populateCard(dataViews[viewId]); 
												});
							
							for(var m = 0; m < self.parent.availViews.length; m++){
								viewSelect.append("option")
											.attr("value", self.parent.availViews[m]['value'])
											.text(self.parent.availViews[m]['text'])
											.style("font-size", "9pt");
								}*/
							
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
						getAuditInfo: function(){
							return this.parent.control.audit; 
						},
						getChartType: function(dataView){
							var self = this; 
							////////console.log(dataView); 
							var viewType; 
							if(dataView.mark){
								viewType = dataView.mark; 
							}
							else 
								viewType = $("#vsel"+self.id +' option:selected').val(); 
							////////console.log("TYPE = "+ viewType);
							return viewType; 

						},
						drawCatBar: function(displayId, data, cat, levels, trellis){
							var self = this;
							self.vis.drawCatBar(displayId, data, cat, levels, trellis);
						},
						populateCard: function(dataView){
							var self = this; 
							var chartType = self.getChartType(dataView); 
							
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
							//////console.log(dataView);
							var viewId = dataView['viewId'];
							var data = dataView['data'];
							

						},
						drawScatter: function(dataView){
							var self = this; 
							////////console.log(dataView);
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