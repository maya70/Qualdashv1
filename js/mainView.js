(function($Q){
	'use strict'
	$Q.MainView = $Q.defineClass(
					null, 
					function MainView(control){
						var self = this;
						self.control = control;
						self.iter = 0; 						
						self.urgencyColor =  "darkgrey"; // "#009933"; //"#63F3B9";
						self.toggle = "grouped";
						self.control.viewReady(self); 
						self.availViews = [{"value": "bar", "text": "Bar Chart"}, 
											{"value": "line", "text": "Line Chart"}, 
											{"value": "scatter", "text": "Scatter Plot"}, 
											{"value": "pie", "text": "Pie Chart"}]; 
						
						//self.createQualCard(1);
						//self.cardSetupDrag(1);
					},
					{
						createQualCards: function(dataViews){
							var self = this; 
							self.availMetrics = self.control.getAvailMetrics(); 
							for(var i=0; i< dataViews.length; i++){
								self.createQualCard(i);
							}
							self.initGrid(); 
							for(var i=0; i< dataViews.length-1; i++){
								self.populateCard(dataViews[i]);
							}
	
						},
						getChartType: function(viewId){
							var self = this; 
							var viewType = $("#vsel"+viewId +' option:selected').val(); 
							//console.log("TYPE = "+ viewType);
							return viewType; 

						},
						createQualCard: function(viewId){
							var self = this; 
							var container = d3.select("#mainCanvas").append("div")
												.attr("class", "item")
												.attr("id", "cardcontainer"+viewId);
							
							self.createHeader(container, viewId);
							self.setupControls(); 
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
							self.setupPopover(viewId);
							self.createButtons(panel, viewId); 


							
							var card = cbody.append("div")
											.attr("class", "item-content")
											.attr("id", "card"+viewId)
											.on("doubleclick", function(d){
												//////console.log(d3.select(this));
												// fit to original size
												//d3.select(this).attr("width", 50)
												//				.attr("height", 50);
											});
							card.append("div")
								.attr("class", "draw-area")
								.attr("id", "draw-area"+viewId);
									
							
						},
						setupPopover: function(viewId){
							var self = this; 
							self.pop = d3.select("body").append("div")
											.attr("id", "pp"+viewId)
											.attr("class", "hidden");
							self.pop.append("div")
											.attr("class","popover-heading" )
											.text("Add/Remove Grouping Variables");
							var pbody = self.pop.append("div")
											.attr("class", "popover-body")
											.attr("id", "cat-popover"); 
							var varselect=	pbody.append("select")
												.attr("name", "varselector")
												.attr("class", "form-control")
												.style("vertical-align", "top")
												.attr("id", "varsel"+viewId)
												.style("font-size", "9pt")
												.style("horizontal-align", "left")
												.style("min-width", "65%")
												.style("margin-left",0)
												.on("change", function(d){
													//////console.log(this.value);
												});
								var allVars = self.control.getAvailVars(); 
								//////console.log(allVars); 
								for(var m = 0; m < allVars.length; m++){
								varselect.append("option")
											.attr("value", allVars[m])
											.text(allVars[m])
											.style("font-size", "9pt");
									}

							self.pop2 = d3.select("body").append("div")
											.attr("id", "aa"+viewId)
											.attr("class", "hidden");
							self.pop2.append("div")
											.attr("class","popover-heading" )
											.text("Axis Controls");
							var pbody2 = self.pop2.append("div")
											.attr("class", "popover-body")
											.attr("id", "cat-popover"); 
							
							//event delegation to detect change 
							// suggested by: https://stackoverflow.com/questions/20786696/select-on-change-inside-bootstrap-popover-does-not-fire
							$(document).on('change', '#varsel'+viewId, function(){
								////////console.log($('#varsel'+viewId +' option:selected').val()); 
							});
							$(':not(#anything)').on('click', function (e) {
							    self.popSettings.each(function () {
							        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
							            $(this).popover('hide');
							            return;
							        }
							    });
							});

							
							pbody.append("button")
									.attr("type", "submit")						
									.attr("class", "btn_vg_parse hide-vl")
									.text( "Add Grouping")
									.attr("id", "group-but"+viewId);
									
							$(document).on('click', '#group-but'+viewId, function(){
								//////console.log($('#varsel'+viewId +' option:selected').val());
								self.addGroup(viewId, $('#varsel'+viewId +' option:selected').val()); 
							});

						},
						addGroup: function(viewId, gvar){
							//console.log(gvar);
							//console.log(viewId); 
							//TODO: remove the following line
							//var gvar = "Record Created By";  // I'm hard coding a grouping variable for now
							var self = this; 
							self.control.addCategorical(viewId, gvar); 
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

							//header.append("label")
							//	.attr("class", "form-label")
							//	.attr("for", "sel1")
							//	.text("Metric: ");

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
													self.control.updateMetrics(viewId, this.value); 											
													var dv = self.getMetricDataView(this.value);
													//console.log(dv); 
													//TODO: reset here the grouping variables and dicts of this view
													self.control.resetCategoricals(viewId); 
													self.drawBarChart(viewId, dv['data']);
												});

							
							for(var m = 0; m < self.availMetrics.length; m++){
								metricSelect.append("option")
											.attr("value", self.availMetrics[m]['value'])
											.text(self.availMetrics[m]['text'])
											.style("font-size", "9pt");
							}
							
							var curMetric = self.availMetrics[(viewId%self.availMetrics.length)]['value'];
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
													var dataViews = self.control.getDataViews(); 
													//console.log(dataViews[viewId]); 
													self.populateCard(dataViews[viewId]); 
												});
							
							for(var m = 0; m < self.availViews.length; m++){
								viewSelect.append("option")
											.attr("value", self.availViews[m]['value'])
											.text(self.availViews[m]['text'])
											.style("font-size", "9pt");
								}
							
						},
						getMetricDataView: function(txt){
							var self = this; 
							var views = self.control.getDataViews();
							for(var v=0; v < views.length; v++){
								if(views[v]['metric'] === txt)
									return views[v];
							}
							return -1; 
						},
						createButtons: function(panel, viewId){
							var self = this; 

							var pbody = panel;//.append("fieldset")
											//.attr("class", "btn-container");
		/*<button type="button" class="btn btn-secondary" data-container="body" data-toggle="popover" data-placement="top" data-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus.">
  Popover on top
</button>*/					var undef; 
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

							/*	pbody.append("button")
									//.attr("href", "#")
									.attr("id", "split-btn"+viewId)
									.attr("type", "button")
									//.attr("class", "btn btn-primary control-button")
									.attr("class", "fa fa-share-alt")
									//.attr("tabindex", 0)
									.style("vertical-align", "top")
									.style("width", "70%")
									.style("horizontal-align", "center")
									.attr("data-toggle", "popover")
									//.attr("data-trigger", "focus")
									.attr("data-placement", function(d){
										if(viewId%3 === 0)
											return "bottom";
										else
											return "left"; 
									})
									.attr("data-popover-content","#pp"+viewId)
									//.text("XY")
									//.style("font-size", "7pt")									
									.style("margin-right", "2%")
									//.style("margin-bottom", "100%")
									//.style("margin-top", "-50px")
									.style("background-color", "lightgrey")
									//.style("padding", 0)
									.style("color", "black");
							*/ 
							$("#split-btn"+viewId).tooltip({    
							    placement : 'bottom',  
							    title : "Groups"         
							  });

							 $("#axes-btn"+viewId).tooltip({    
							    placement : 'bottom',  
							    title : "Axes"         
							  });    
							  

						},
						initGrid: function(){
							var grid = new Muuri('.grid', {
							                dragEnabled: true,
							                dragStartPredicate: function (item, event) {
							                	//////console.log(event.target); 
							                    if (event.target.matches('[data-toggle="popover"]') 
							                    	|| (event.target.matches('[class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se"]')) ) {
							                      return false;
							                      }
							                    return Muuri.ItemDrag.defaultStartPredicate(item, event);
							                    }
							                });
							$('.item-content').resizable();

							grid.on('dragEnd', function (item, event) {
							  //$(".item-content").css('background-color', 'green');
							  //$(".item-content").css('opacity', 0.5);
							  $(".item-content").css('z-index', 1);

							  //$(item.getElement()).css('background-color', 'yellow');
							  $(item.getElement()).css('opacity', 1.0);
							  $(item.getElement()).css('z-index', 10);
							  
							  //////console.log(item.getElement());
							  
							});

						},
						
						setupControls: function(){
							var self = this;
							d3.select("#cat-button").on("click", function(o){
								var pan = this.nextElementSibling; 
								if(pan){
									if(pan.style.display === "none"){
				                            	pan.style.display = "block";
				                        		}
				                       		 else
				                            	pan.style.display = "none"; 
								}
							});
							/*var buttons = d3.selectAll(".control-button"); 
							buttons.each(function(but){
								but.class("acco")
								////////console.log(but); 
							}); */
							self.popSettings= jQuery("[data-toggle=popover]").popover({
						        html : true,
						        container: '#home',
						        content: function() {
						          var content = $(this).attr("data-popover-content");
						          return $(content).children(".popover-body").html();
						        },
						        title: function() {
						          var title = $(this).attr("data-popover-content");
						          return $(title).children(".popover-heading").html();
						        }
						    });


							// Muuri setup
							//$('.item-content').resizable();
							
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
                               
						},
						drawPieChart: function(dataView){
							var self = this; 
							console.log(dataView);
							var viewId = dataView['viewId'];
							var data = dataView['data'];
							var drawArea = d3.select("#draw-area"+viewId);
							var parentArea = drawArea.select(function(){
								//d3.select(this.parentNode).on("resize", resize);
								return this.parentNode; 
							});
							////////console.log(parentArea.node().getBoundingClientRect());
							var svgw =  1.0* parentArea.node().getBoundingClientRect().width;
							var svgh =  1.0* parentArea.node().getBoundingClientRect().height; 

							if(self.svg)
								d3.select(".mainsvg"+viewId).remove(); 

							self.svg = d3.select("#draw-area"+viewId).append("svg")
											.attr("id", "mainsvg"+viewId)
											.attr("class", "mainsvg"+viewId)
											.attr("width", svgw)
											.attr("height", svgh)											
											//.attr("transform", "translate(0,10)")
											.attr("text-anchor", "middle")
							      			.style("font", "12px sans-serif");
							
							
							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);

							var margin = {top: 10, right: 20, bottom: 20, left:20};
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
							var arc = d3.arc()
									    .innerRadius(0)
									    .outerRadius(radius);
							var color = d3.scaleOrdinal()
										  .domain(data.map(d => d.date))
										  .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());
										  //.range(d3.quantize(t => d3.interpolateRgb("steelblue", "brown"), data.length).reverse());
						  const arcs = pie(data);



						  const g = self.svg.append("g")
						      .attr("transform", "translate("+((width / 2)+margin.left)+","+((height / 2)+margin.top)+")");
						  
						  g.selectAll("path")
						    .data(arcs)
						    .enter().append("path")
						      .attr("fill", d => 
						      	 color(d.data.date))
						      .attr("stroke", "white")
						      .attr("d", arc)
						    .append("title")
						      .text(d => `${d.data.date}: ${d.data.number.toLocaleString()}`);

						      /* const text = g.selectAll("text")
								    .data(arcs)
								    .enter().append("text")
								      .attr("transform", d => `translate(${arc.centroid(d)})`)
								      .attr("dy", "0.35em");
								  
								  text.append("tspan")
								      .attr("x", 0)
								      .attr("y", "-0.7em")
								      .style("font-weight", "bold")
								      .style("font-size", "7pt")
								      .text(d => d.data.date);
								  
								  text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
								      .attr("x", 0)
								      .attr("y", "0.7em")
								      .attr("fill-opacity", 0.7)
								      .text(d => d.data.number.toLocaleString());

							*/

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
											//console.log(d); 
											if(d.data.number === 0)
												return '';
											else 
												return d.data.date;
										});
									
							function midAngle(d){
								return d.startAngle + (d.endAngle - d.startAngle)/2;
							}

							text.transition().duration(1000)
								.attrTween("transform", function(d) {
									this._current = this._current || d;
									var interpolate = d3.interpolate(this._current, d);
									this._current = interpolate(0);
									return function(t) {
										var d2 = interpolate(t);
										var pos = arc.centroid(d2);
										pos[1] *= 2; 
										pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
										return "translate("+ pos +")";
									};
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

							text.exit()
							  .remove();
							 
							var polyline = g.select(".lines").selectAll("polyline")
								.data(arcs).enter()
								.append("polyline")
								.style("opacity", function(d){
									console.log(d);
									if(d.data.number === 0)
										return 0.0; 
									else
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
										pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
										return [arc.centroid(d2), arc.centroid(d2), pos];
									};			
								});
							
							polyline.exit()
								.remove();
							
						    // Add labels, using .centroid() to position
						   

						},
						drawLineChart: function(dataView){
							var self = this; 
							console.log(dataView);
							var viewId = dataView['viewId'];
							var data = dataView['data'];
							var drawArea = d3.select("#draw-area"+viewId);
							var parentArea = drawArea.select(function(){
								//d3.select(this.parentNode).on("resize", resize);
								return this.parentNode; 
							});
							var margin = {top: 10, right: 10, bottom: 65, left:30};
							////////console.log(parentArea.node().getBoundingClientRect());
							var svgw =  0.9* parentArea.node().getBoundingClientRect().width;
							var svgh =  0.9* parentArea.node().getBoundingClientRect().height; 
							var width = svgw - margin.left - margin.right; 
							var height = svgh - margin.top - margin.bottom;

							if(self.svg)
								d3.select(".mainsvg"+viewId).remove(); 

							self.svg = d3.select("#draw-area"+viewId).append("svg")
											.attr("id", "mainsvg"+viewId)
											.attr("class", "mainsvg"+viewId)
											.attr("width", svgw)
											.attr("height", svgh)											
											.attr("transform", "translate("+ 0+","+0+")")
											.attr("text-anchor", "middle")
							      			.style("font", "12px sans-serif");
											
							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);
							
							// parse the date / time
							//var parseTime = d3.timeParse("%d-%b-%y");

							var g = self.svg.append("g")
									.attr("transform", "translate(" + margin.left + ", "+ 0 +")");

							// set the ranges
							var x = d3.scaleBand().rangeRound([0, width]).padding(0.1), 
								y = d3.scaleLinear().range([height, 0]).nice(); 
		
							x.domain(data.map(function(d){
									return d.date; 
							}));
							y.domain([0, d3.max(data, function(d){ return d.number; })]);
											
							g.append("g")
							      .attr("class", "x axis")
							      .attr("transform", "translate("+ 0+"," + (height+margin.top) + ")")
							      .call(d3.axisBottom(x))
									.selectAll("text")	
								        .style("text-anchor", "end")
								        .attr("dx", "-.8em")
								        .attr("dy", ".15em")
								        .attr("transform", "rotate(-65)");

							//console.log(y.domain());
							//console.log(y.range());
						
							g.append("g")
							      .attr("class", "y axis")
							      .call(d3.axisLeft(y).ticks(5,"s"))
							      .attr("transform", "translate("+0+","+ margin.top+")");
							
							// define the line
							var valueline = d3.line()
							    .x(function(d) { return x(d.date); })
							    .y(function(d) { return y(d.number); });

							 // Add the valueline path.
							  g.append("path")
							      .data([data])
							      .attr("class", "line")
							      .attr("d", valueline)
							      .style("fill", "none")
							      .style("stroke", "black");


							
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
			
						},
						drawCatBar: function(viewId, dict, cat, levels, iter, trellis){
							var self = this; 
								self.dict = dict;
								self.cat = cat;
								self.levels = levels; 
								var undef;

								if(trellis)
									console.log("this is a trellis view");
								// sort dict by date
                                function custom_sort(a,b){
                                    return new Date("01-"+a).getTime() - new Date("01-"+b).getTime(); 
                                }
    							
    							d3.select("#toggle-btn"+viewId)
    								.attr("hidden", undef); 
                               		
                                /* d3.select("#panel"+viewId).append("button")
									//.attr("href", "#")
									.attr("id", "toggle-btn"+viewId)
									.attr("type", "button")
									.attr("class", "fa fa-adjust")
									//.text("Toggle")
									.style("vertical-align", "top")
									.style("width", "70%")
									//.style("margin-left", "2%")
									.style("margin-top", "-1040%")
									//.style("vertical-align", "center")
									.style("background-color", "lightgrey")
									//.style("padding", 0)
									.style("color", "black")
									.on("click", function(){
										self.control.toggleBars(viewId); 
									});
								*/ 
									$("#toggle-btn"+viewId).tooltip({    
									    placement : 'bottom',  
									    title : "Toggle Groups"         
									  });     

                                /*.append("svg")
										.attr("width", 100)
										.attr("height", 100)
										.attr("x", 10)
										.attr("y", 10)
										.append("rect")
											.attr("height", 20)
											.attr("width", 20)
											.attr("x", 10)
											.attr("y", 10)
											.style("color", "red"); */

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
                                            yz[ky][kx] += dict[xz[kx]][levels[ky]];
                                        }
                                    }
                                    


                                   var y01z = d3.stack().keys(d3.range(levels.length))(d3.transpose(yz)),
                                        yMax = d3.max(yz, function(y) { return d3.max(y); }),
                                        y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); });
    
                               	
                            self.palette = [];

							if(self.svg && iter === 0){
							//	d3.selectAll("svg").remove(); 
								var undef; 
								self.legend = undef; 
								d3.select(".mainsvg"+viewId).remove(); 
							}
							////////console.log(dict);

							var drawArea = d3.select("#draw-area"+viewId);
							if(iter > 0)
								drawArea.style("overflow-y", "scroll"); 

							
							var parentArea = drawArea.select(function(){
								return this.parentNode; 
							});
							////////console.log(parentArea.node().getBoundingClientRect());
							//var viewshare = self.dicts? Object.keys(self.dicts).length : 1; 
							var viewshare = trellis? 2 : 1; 
							//////console.log(viewshare); 
							//if(viewshare > 2) viewshare = 2; 
							var svgw = 0.9 * parentArea.node().getBoundingClientRect().width;
							var svgh = 0.9* parentArea.node().getBoundingClientRect().height / viewshare; 

							self.svg = d3.select("#draw-area"+viewId).append("svg")
										.attr("id", "mainsvg"+viewId+"_"+iter)
										.attr("class", "mainsvg"+viewId)
										.attr("width", svgw).attr("height", svgh)
										.style("vertical-align", "top")
										.attr("transform", "translate(0,"+ (-svgh*iter) +")");
							
							
							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);

							var margin = {top: 0, right: 10, bottom: 50, left:30};							
							var width = svgw - margin.left - margin.right; 
							var height = svgh - margin.top - margin.bottom;
							

							var g = self.svg.append("g").attr("transform","translate(" + margin.left + "," + margin.top + ")" );

							var timeout = d3.timeout(function() {
											  d3.select("input[value=\"grouped\"]")
											      .property("checked", true)
											      .dispatch("change");
											}, 2000);

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
							    .range(d3.schemeCategory20c);

							var series = g.selectAll(".series")
							  .data(y01z)
							  .enter().append("g")
							    .attr("fill", function(d, i) { 
							    	self.palette[i] = color(i);
							    	return color(i); });

							 
							 if(!self.legend)
							 {	
							 self.legend = self.svg.selectAll(".legend")
							 				.data(color.domain())
							 				.enter().append("g")
							 					 .attr("class", "legend")
     											 .attr("transform", function(d, i) { return "translate(0," + i * 15 + ")"; });
     						 
     						 // draw legend colored rectangles
							  self.legend.append("rect")
							      .attr("x", svgw- 10)
							      .attr("width", 10)
							      .attr("height", 10)
							      .style("fill", color);

							  // draw legend text
							  self.legend.append("text")
							      .attr("x", svgw- 14)
							      .attr("y", 3)
							      .attr("dy", ".35em")
							      .style("text-anchor", "end")							      
							      .text(function(d) { return levels[d];})
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
							     .on("mouseover", function(d){
							  
							      	div.transition()
							      		.duration(200)
							      		.style("opacity", 0.9);
							      	div .html((d[1] - d[0]+ ""))
							      		.style("left", (d3.event.pageX) + "px")
							      		.style("top", (d3.event.pageY - 28) + "px");
							      	origColor = d3.select(this).style("fill");
							      	d3.select(this).style("fill", "brown");

							      })
							      .on("mouseout", function(d){
							      	div.transition()
							      		.duration(500)
							      		.style("opacity", 0);
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

						  rect.transition()
						      .duration(500)
						      .delay(function(d, i) { return i * 10; })
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
						      .duration(500)
						      .delay(function(d, i) { return i * 10; })
						      .attr("y", function(d) { return y(d[1]); })
						      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
						    .transition()
						      .attr("x", function(d, i) { return x(xz[i]); })
						      .attr("width", x.bandwidth());
						}

						function resize() {
							//console.log("RESIZE CALLED");
							var svgw = parseInt(d3.select("#card"+viewId).style("width")) * 0.9,
								svgh = parseInt(d3.select("#card"+viewId).style("height")) * 0.9;

							// update svg width and height
							self.svg = d3.select("#mainsvg"+viewId+"_"+iter); 

							self.svg.attr("width", svgw)
												.attr("height", svgh);


						 	// update the range of the scale with new width/ height
							var width = svgw - margin.right - margin.left, 
								height = svgh - margin.top - margin.bottom; 

							x.rangeRound([0, width]).padding(0.1);
							y.range([height, 0]); 


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

							////console.log(self.svg.selectAll("g").selectAll(".bar"));
							/*self.svg.selectAll("g").selectAll(".bar")
								.attr("x", function(d, i) { return x(i); })
							      .attr("y", function(d) { 
							      	return y(d.number)+ margin.top; })
							      .attr("width", x.bandwidth())
							      .attr("height", function(d) { return height  - y(d.number); })*/
							     changed(); 

						}
						 
						$("#card"+viewId).resize(function(e){
							 resize(); 
						});
						
						},


						toggleBarView: function(viewId){
							var self = this;
							if(self.toggle === "grouped")
								self.toggle = "stacked";
							else
								self.toggle = "grouped";

							if(self.iter < 1)
								self.drawCatBar(viewId, self.dict, self.cat, self.levels, 0); 
							else{
								 var c = 0;
								 for(var key in self.dicts){
		                         	   self.drawCatBar(viewId, self.dicts[key], self.cat, self.levels, c, 1);
		                         	   c++; 
		                         	}
							}

						},
						populateCard: function(dataView){
							var self = this;
							//////console.log(dataView);
							var chartType = self.getChartType(dataView['viewId']); 

							if(chartType === 'bar')
								self.drawBarChart(dataView['viewId'], dataView['data']);
							else if(chartType === 'line')
								self.drawLineChart(dataView);
							else if(chartType === 'scatter')
								self.drawScatter(dataView);
							else if(chartType === 'pie')
								 self.drawPieChart(dataView); 
						},
						drawBarChart: function(viewId, data){
							var self = this;
							//////////console.log(data);
							var drawArea = d3.select("#draw-area"+viewId);
							var parentArea = drawArea.select(function(){
								//d3.select(this.parentNode).on("resize", resize);
								return this.parentNode; 
							});
							////////console.log(parentArea.node().getBoundingClientRect());
							var svgw =  0.9* parentArea.node().getBoundingClientRect().width;
							var svgh =  0.9* parentArea.node().getBoundingClientRect().height; 

							if(self.svg)
								d3.select(".mainsvg"+viewId).remove(); 

							self.svg = d3.select("#draw-area"+viewId).append("svg")
											.attr("id", "mainsvg"+viewId)
											.attr("class", "mainsvg"+viewId)
											.attr("width", svgw)
											.attr("height", svgh)											
											.attr("transform", "translate(0,10)");
							
							
							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);

							var margin = {top: 10, right: 10, bottom: 65, left:30};
							var width = svgw - margin.left - margin.right; 
							var height = svgh - margin.top - margin.bottom;
							/*var yAxis = g => g
									    .attr("transform", `translate(${margin.left},0)`)
									    .call(d3.axisLeft(y))
									    .call(g => g.select(".domain").remove());*/

							var x = d3.scaleBand().rangeRound([0, width]).padding(0.1), 
								y = d3.scaleLinear().range([height, 0]).nice(); 

							var g = self.svg.append("g")
									.attr("transform", "translate(" + margin.left + ", "+ 0 +")");

							x.domain(data.map(function(d){
									return d.date; 
							}));
							y.domain([0, d3.max(data, function(d){ return d.number; })]);
							
							
							
							g.append("g")
							      .attr("class", "x axis")
							      .attr("transform", "translate("+ 0+"," + (height+margin.top) + ")")
							      .call(d3.axisBottom(x))
									.selectAll("text")	
								        .style("text-anchor", "end")
								        .attr("dx", "-.8em")
								        .attr("dy", ".15em")
								        .attr("transform", "rotate(-65)");

							//console.log(y.domain());
							//console.log(y.range());
							

							g.append("g")
							      .attr("class", "y axis")
							      .call(d3.axisLeft(y).ticks(5,"s"))
							      .attr("transform", "translate("+0+","+ margin.top+")");
							
							/* g.append("g")
							 	.attr("class", "y axis")
      							.call(yAxis);*/

							g.selectAll(".bar")
							    .data(data)
							    .enter().append("rect")
							      .attr("class", "bar")
							      .attr("x", function(d) { return x(d.date); })
							      .attr("y", function(d) { return y(d.number)+margin.top; })
							      .attr("width", x.bandwidth())
							      .attr("height", function(d) { return height  - y(d.number); })
							      .style("fill", "steelblue")
							      .on("mouseover", function(d){
							      	div.transition()
							      		.duration(200)
							      		.style("opacity", 0.9);
							      	div .html((d.date) + "<br/>" + (d.number+ ""))
							      		.style("left", (d3.event.pageX) + "px")
							      		.style("top", (d3.event.pageY - 28) + "px");
							      	d3.select(this).style("fill", "brown");
							      })
							      .on("mouseout", function(d){
							      	div.transition()
							      		.duration(500)
							      		.style("opacity", 0);
							      	d3.select(this).style("fill", "steelblue");
							      });


						function resize() {
							if(!self.cat)
							{	
							//console.log("RESIZE CALLED 22 ");

							var svgw = parseInt(d3.select("#card"+viewId).style("width")) * 0.9,
								svgh = parseInt(d3.select("#card"+viewId).style("height")) * 0.9;

							// update svg width and height
							self.svg = d3.select("#mainsvg"+viewId); 

							self.svg.attr("width", svgw)
												.attr("height", svgh);


						 	// update the range of the scale with new width/ height
							var width = svgw - margin.right - margin.left, 
								height = svgh - margin.top - margin.bottom; 

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
							self.svg.selectAll(".bar")
								.attr("x", function(d) { 
									return x(d.date); })
							      .attr("y", function(d) { 
							      	return y(d.number)+ margin.top; })
							      .attr("width", x.bandwidth())
							      .attr("height", function(d) { return height  - y(d.number); })
							}
						}
						 
						$("#card"+viewId).resize(function(e){
							resize(); 
						});
						//d3.select("#card"+viewId).on("resize", resize); 
						//resize(); 

						}
					}
		);
})(QUALDASH);