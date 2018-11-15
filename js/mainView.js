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
											{"value": "histo", "text": "Histogram"}, 
											{"value": "scatter", "text": "Scatter Plot"}, 
											{"value": "pie", "text": "Pie Chart"}]; 
						
						//self.createQualCard(1);
						//self.cardSetupDrag(1);
					},
					{
						createQualCards: function(dataViews){
							var self = this; 
							
							self.availMetrics = self.control.getAvailMetrics(); 
							console.log(self.availMetrics);
							console.log(dataViews.length);
							for(var i=0; i< dataViews.length; i++){
								self.createQualCard(i);
							}
							self.initGrid(); 
							for(var i=0; i< dataViews.length; i++){
								self.populateCard(dataViews[i]);
							}
	
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
									.style("height", "85%")
									.style("padding-bottom", "3px")
									.style("margin-right", "1%")
									.style("margin-left", "1%")
									.style("margin-top", "-10px"); 
									 
							
							var panel = cbody.append("div")
											.attr("class", "w3-sidebar")
											.style("background-color", "darkgrey")
											.style("max-width", "20%")
											.style("height", "82%").style("padding-bottom", "3px")
									.style("margin-right", "1%")
									.style("margin-left", "0%")
									.style("overflow", "visible"); 
							self.createButtons(panel, viewId); 


							
							var card = cbody.append("div")
											.attr("class", "item-content")
											.attr("id", "card"+viewId)
											.on("doubleclick", function(d){
												console.log(d3.select(this));
												// fit to original size
												//d3.select(this).attr("width", 50)
												//				.attr("height", 50);
											});
							card.append("div")
								.attr("class", "draw-area")
								.attr("id", "draw-area"+viewId);
							
							
							
						},
						createHeader: function(container, viewId){
							var self = this; 
							var header = container.append("div")
									.attr("class", "form-inline")
									.style("text-align", "left")
									.style("max-height", 45)
									.style("width", "90%")
									.style("margin-left", "3px")
										.append("div").attr("class", "form-group")
											.style("height", 43)
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
													console.log(this.value);
												});

							
							for(var m = 0; m < self.availMetrics.length; m++){
								metricSelect.append("option")
											.attr("value", self.availMetrics[m]['value'])
											.text(self.availMetrics[m]['text'])
											.style("font-size", "9pt");
							}
							
							var curMetric = self.availMetrics[(viewId%self.availMetrics.length)]['value'];
							console.log(curMetric);
							$('#sel'+viewId).val(curMetric);
							$('.selectpicker').selectpicker('refresh');

							var viewSelect = header.append("select")
												.attr("name", "viewselector")
												.attr("class", "form-control")
												.attr("id", "vsel"+viewId)
												.style("font-size", "9pt")
												.style("vertical-align", "top")
												.style("horizontal-align", "right")
												.style("min-width", "45%")
												.on("change", function(){
													console.log(this.value);
												});
							
							for(var m = 0; m < self.availViews.length; m++){
								viewSelect.append("option")
											.attr("value", self.availViews[m]['value'])
											.text(self.availViews[m]['text'])
											.style("font-size", "9pt");
								}
							
						},
						createButtons: function(panel, viewId){
							var self = this; 
							var pbody = panel.append("fieldset")
											.attr("class", "btn-container");
								pbody.append("a")
									.attr("href", "#")
									.attr("class", "btn btn-primary control-button")
									//.attr("tabindex", 0)
									.attr("data-toggle", "popover")
									.attr("data-trigger", "focus")
									//.attr("data-placement", "bottom")
									.attr("data-popover-content","#a2")
									.text("Variables")
									.style("font-size", "7pt")
									.style("width", "90%")
									.style("margin-left", "2%")
									.style("margin-bottom", "100%")
									.style("margin-top", "-50px")
									.style("background-color", "lightgrey")
									.style("padding", 0)
									.style("color", "black");

								pbody.append("a")
									.attr("href", "#")
									.attr("class", "btn btn-primary control-button")
									.attr("tabindex", 2)
									.attr("data-toggle", "popover")
									.attr("data-trigger", "focus")
									.attr("data-placement", "bottom")
									.attr("data-popover-content","#a2")
									.text("Axes")
									.style("font-size", "7pt")
									.style("width", "90%")
									.style("margin-left", "2%")
									.style("margin-top", "-450px")
									.style("background-color", "lightgrey")
									.style("padding", 0)
									.style("color", "black");
							/*var rows = [];
								var table = pbody.append("table")
												.style("height", "60px")
												.style("background-color", "black");

								for(var i = 0; i < 3; i++){
									rows[i] = table.append("tr")
												.style("border-color", "black")
												.style("height", "30px")
												.style("background-color", "white");
								}

								var btn0 = rows[0].append("td"); 
								var btn1 = rows[1].append("td");
								
							btn0.append("a")
									.attr("href", "#")
									.attr("class", "btn btn-primary control-button")
									.attr("tabindex", 1)
									.attr("data-toggle", "popover")
									.attr("data-trigger", "focus")
									.attr("data-placement", "bottom")
									.attr("data-popover-content","#a2")
									.text("Variables")
									.style("font-size", "7pt")
									.style("width", "90%")
									.style("margin-left", "2%")
									.style("background-color", "lightgrey")
									.style("color", "black");

							btn1.append("a")
									.attr("href", "#")
									.attr("class", "btn btn-primary control-button")
									.attr("tabindex", 1)
									.attr("data-toggle", "popover")
									.attr("data-trigger", "focus")
									.attr("data-placement", "bottom")
									.attr("data-popover-content","#a2")
									.text("Axes")
									.style("font-size", "7pt")
									.style("width", "90%")
									.style("margin-left", "2%")
									.style("background-color", "lightgrey")
									.style("color", "black");

							/*pbody.append("a")
									.attr("href", "#")
									.attr("class", "btn btn-primary control-button")
									.attr("tabindex", 1)
									.attr("data-toggle", "popover")
									.attr("data-trigger", "focus")
									.attr("data-placement", "bottom")
									.attr("data-popover-content","#a2")
									.text("Variables")
									.style("font-size", "7pt")
									.style("width", "90%")
									.style("margin-left", "2%")
									.style("margin-top", "10%")
									.style("background-color", "lightgrey")
									.style("color", "black");
								*/ 

						},
						initGrid: function(){
							var grid = new Muuri('.grid', {
							                dragEnabled: true,
							                dragStartPredicate: function (item, event) {
							                    if (event.target.matches('[data-toggle="popover"]') ) {
							                      return false;
							                      }
							                    return Muuri.ItemDrag.defaultStartPredicate(item, event);
							                    }
							                });
							$('.item-content').resizable();
							//$('.item-content').resize(function(e){

							//});

							grid.on('dragEnd', function (item, event) {
							  //$(".item-content").css('background-color', 'green');
							  //$(".item-content").css('opacity', 0.5);
							  $(".item-content").css('z-index', 1);

							  //$(item.getElement()).css('background-color', 'yellow');
							  $(item.getElement()).css('opacity', 1.0);
							  $(item.getElement()).css('z-index', 10);
							  
							  console.log(item.getElement());
							  
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
								//console.log(but); 
							}); */
							 jQuery("[data-toggle=popover]").popover({
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
						drawBarTrellis: function(displayId, dicts, cat, levels){
							var self = this;						
							self.dicts = dicts; 
							var c =0; 
                            //console.log(dicts);
                            //console.log(cat);
                            //console.log(levels);
                            for(var key in dicts){
                         	   self.drawCatBar(displayId, dicts[key], cat[1], levels[1], c);
                         	   c++;	
                         	   self.iter = c; 
                            }
                            
							//document.getElementById('mainCard').setAttribute("style","height:600px");
							//document.getElementById('mainCardPanel').setAttribute("style","height:500px");
							//document.getElementById('mainsvg').setAttribute("style","height:700px");
                               
						},
						drawCatBar: function(displayId, dict, cat, levels, iter){
							var self = this; 
								self.dict = dict;
								self.cat = cat;
								self.levels = levels; 
								// sort dict by date
                                function custom_sort(a,b){
                                    return new Date("01-"+a).getTime() - new Date("01-"+b).getTime(); 
                                }
    
                                var ordered = [];
                                var temp = Object.keys(dict);
                                ////console.log(temp); 
                                var orderedKeys = Object.keys(dict).sort(custom_sort);
                                ////console.log(orderedKeys);
                                var xz = orderedKeys,
                                    yz = d3.range(levels.length).map(function(d){
                                        return Array.apply(null, Array(xz.length)).map(Number.prototype.valueOf,0);
                                    });
                                    for(var kx=0; kx < xz.length; kx++ ){
                                        for(var ky=0; ky < levels.length; ky++){
                                            yz[ky][kx] += dict[xz[kx]][levels[ky]];
                                        }
                                    }
                                    //console.log(xz);
                                    //console.log(yz);

                                   var y01z = d3.stack().keys(d3.range(levels.length))(d3.transpose(yz)),
                                        yMax = d3.max(yz, function(y) { return d3.max(y); }),
                                        y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); });
    
                                    //console.log(y01z);
                                    //console.log(yMax);
                                    //console.log(y1Max);

							if(self.svg && iter === 0){
								d3.selectAll("svg").remove(); 
							}
							//console.log(dict);
							var drawArea = d3.select("#draw-area-1");
							var parentArea = drawArea.select(function(){
								return this.parentNode; 
							});
							//console.log(parentArea.node().getBoundingClientRect());
							var viewshare = self.dicts? Object.keys(self.dicts).length : 1; 
							var svgw = 0.7 * parentArea.node().getBoundingClientRect().width;
							var svgh = 0.8* parentArea.node().getBoundingClientRect().height / viewshare; 

							self.svg = d3.select("#draw-area-1").append("svg")
										.attr("id", "mainsvg"+iter)
										.attr("width", svgw).attr("height", svgh)
										.attr("transform", "translate(50,"+ (20) +")");
							
							self.cardTitle = d3.select("#mainCardContainer").selectAll("span")
												.data(function(){
													var disp = self.control.getDisplayVariables();
													return disp[0]["y"];	
												})
												.enter()
												.append("span")
												.text(function(d){
													return d;
												})
												.style("color", "black")
												.style("margin-top", "5px")
												.style("font-size", "14pt");
							self.cardHeader = d3.select("#mainCardContainer")
												.on('mouseover', function() {
														d3.select(this)
														.style('background-color', self.urgencyColor)
													})
												.on("mouseout", function(){
														d3.select(this)
														.style('background-color', "darkgrey" );
														//console.log(d3.select(this).node().getBoundingClientRect().height);
												});
							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);

							var margin = {top: 50, right: 20, bottom: 50, left:30};
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
							    .attr("fill", function(d, i) { return color(i); });

							var origColor; 
							var rect = series.selectAll("rect")
							  .data(function(d) { return d; })
							  .enter().append("rect")
							    .attr("x", function(d, i) { return x(i); })
							    .attr("y", height)
							    .attr("width", x.bandwidth())
							    .attr("height", 0)
							     .on("mouseover", function(d){
							  
							      	div.transition()
							      		.duration(200)
							      		.style("opacity", 0.9);
							      	div .html((d[1] - d[0]+ " records"))
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
								    .attr("class", "axis axis--x")
								    .attr("transform", "translate(0," + height + ")")
								    .call(d3.axisBottom(x))
									.selectAll("text")	
								        .style("text-anchor", "end")
								        .attr("dx", "-.8em")
								        .attr("dy", ".15em")
								        .attr("transform", "rotate(-65)")
								        .call(changed);

							
								g.append("g")
							      .attr("class", "axis axis--y")
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


						},


						toggleBarView: function(displayId){
							var self = this;
							if(self.toggle === "grouped")
								self.toggle = "stacked";
							else
								self.toggle = "grouped";

							if(self.iter < 1)
								self.drawCatBar(displayId, self.dict, self.cat, self.levels, 0); 
							else{
								 var c = 0;
								 for(var key in self.dicts){
		                         	   self.drawCatBar(displayId, self.dicts[key], self.cat, self.levels, c);
		                         	   c++; 
		                         	}
							}

						},
						populateCard: function(dataView){
							var self = this;
							console.log(dataView);
							self.drawBarChart(dataView['viewId'], dataView['data']);
						},
						drawBarChart: function(viewId, data){
							var self = this;
							////console.log(data);
							var drawArea = d3.select("#draw-area"+viewId);
							var parentArea = drawArea.select(function(){
								//d3.select(this.parentNode).on("resize", resize);
								return this.parentNode; 
							});
							//console.log(parentArea.node().getBoundingClientRect());
							var svgw =  0.9* parentArea.node().getBoundingClientRect().width;
							var svgh =  0.9* parentArea.node().getBoundingClientRect().height; 


							self.svg = d3.select("#draw-area"+viewId).append("svg")
											.attr("id", "mainsvg"+viewId)
											.attr("width", svgw)
											.attr("height", svgh)
											.attr("transform", "translate(10,10)");
							
							/*self.cardTitle = d3.select("#mainCardContainer").selectAll("span")
												.data(function(){
													var disp = self.control.getDisplayVariables();
													return disp[0]["y"];	
												})
												.enter()
												.append("span")
												.text(function(d){
													return d;
												})
												.style("color", "black")
												.style("margin-top", "5px")
												.style("font-size", "14pt")
												.style("font-weight", "bold");
							self.cardHeader = d3.select("#mainCardContainer")
												.on('mouseover', function() {
														d3.select(this)
														.style('background-color', self.urgencyColor)
													})
												.on("mouseout", function(){
														d3.select(this)
														.style('background-color', "darkgrey");
														//console.log(d3.select(this).node().getBoundingClientRect().height);
												});
							*/	
	
							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);

							var margin = {top: 10, right: 10, bottom: 65, left:15};
							var width = svgw - margin.left - margin.right; 
							var height = svgh - margin.top - margin.bottom;


							var x = d3.scaleBand().rangeRound([0, width]).padding(0.1), 
								y = d3.scaleLinear().rangeRound([(height), 0]); 

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
							g.append("g")
							      .attr("class", "y axis")
							      .call(d3.axisLeft(y).ticks(5, "s"))
							      .attr("transform", "translate(0,"+ margin.top+")");

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
							      	div .html((d.date) + "<br/>" + (d.number+ " records"))
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
							//console.log("RESIZE CALLED");
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
							y.rangeRound([(height), 0]); 


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
								.attr("x", function(d) { return x(d.date); })
							      .attr("y", function(d) { return y(d.number)+ margin.top; })
							      .attr("width", x.bandwidth())
							      .attr("height", function(d) { return height  - y(d.number); })

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