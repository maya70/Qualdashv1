(function($Q){
	'use strict'
	$Q.MainView = $Q.defineClass(
					null, 
					function MainView(control){
						var self = this;
						//$Q.Model_readMinapDummy(); 
						self.control = control;
						self.setupControls(); 
						self.urgencyColor =  "#009933"; //"#63F3B9";
						self.toggle = "grouped";
						self.setupDrag(document.getElementById("mainCard"));
						self.control.viewReady(self); 
					},
					{
						setupDrag: function(elmnt){
							var self = this;
							var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
							if (document.getElementById(elmnt.id + "header")) {
							    /* if present, the header is where you move the DIV from:*/
							    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
							  } else {
							    /* otherwise, move the DIV from anywhere inside the DIV:*/
							    elmnt.onmousedown = dragMouseDown;
							  }
							function dragMouseDown(e) {
							    e = e || window.event;
							    // get the mouse cursor position at startup:
							    pos3 = e.clientX;
							    pos4 = e.clientY;
							    document.onmouseup = closeDragElement;
							    // call a function whenever the cursor moves:
							    document.onmousemove = elementDrag;
							  }

							 function elementDrag(e) {
							    e = e || window.event;
							    // calculate the new cursor position:
							    pos1 = pos3 - e.clientX;
							    pos2 = pos4 - e.clientY;
							    pos3 = e.clientX;
							    pos4 = e.clientY;
							    // set the element's new position:
							    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
							    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
							  }
							   function closeDragElement() {
								    /* stop moving when mouse button is released:*/
								    document.onmouseup = null;
								    document.onmousemove = null;
								  }
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
								console.log(but); 
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
						},
						drawBarTrellis: function(dicts, cat, levels){
							var self = this;
							var dict = dicts[levels[0][0]];
							var c =0; 
                            
                            self.drawCatBar(dict, cat[1], levels[1], 0);
                            
                            self.drawCatBar(dict, cat[1], levels[1], 1);
                               
						},
						drawCatBar: function(dict, cat, levels, iter){
							var self = this; 
								self.dict = dict;
								self.cat = cat;
								self.levels = levels; 
								console.log(dict);
								console.log(cat);
								console.log(levels);
								console.log(iter);
							   // sort dict by date
                                function custom_sort(a,b){
                                    return new Date("01-"+a).getTime() - new Date("01-"+b).getTime(); 
                                }
    
                                var ordered = [];
                                var temp = Object.keys(dict);
                                //console.log(temp); 
                                var orderedKeys = Object.keys(dict).sort(custom_sort);
                                //console.log(orderedKeys);
                                var xz = orderedKeys,
                                    yz = d3.range(levels.length).map(function(d){
                                        return Array.apply(null, Array(xz.length)).map(Number.prototype.valueOf,0);
                                    });
                                    for(var kx=0; kx < xz.length; kx++ ){
                                        for(var ky=0; ky < levels.length; ky++){
                                            yz[ky][kx] += dict[xz[kx]][levels[ky]];
                                        }
                                    }
                                    console.log(xz);
                                    console.log(yz);

                                   var y01z = d3.stack().keys(d3.range(levels.length))(d3.transpose(yz)),
                                        yMax = d3.max(yz, function(y) { return d3.max(y); }),
                                        y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); });
    
                                    console.log(y01z);
                                    console.log(yMax);
                                    console.log(y1Max);

							if(self.svg && iter === 0){
								d3.selectAll("svg").remove(); 
							}
							console.log(dict);
							var drawArea = d3.select("#draw-area-1");
							var parentArea = drawArea.select(function(){
								return this.parentNode; 
							});
							console.log(parentArea.node().getBoundingClientRect());
							var svgw = 0.7 * parentArea.node().getBoundingClientRect().width;
							var svgh = 0.8* parentArea.node().getBoundingClientRect().height; 

							self.svg = d3.select("#draw-area-1").append("svg")
										.attr("id", "mainsvg")
										.attr("width", svgw).attr("height", svgh)
										.attr("transform", "translate(50,"+ (20+ iter*svgh * 0.8) +")");
							
							self.cardTitle = d3.select("#mainCardHeader").selectAll("span")
												.data(self.control.getDisplayVariable())
												.enter()
												.append("span")
												.text(function(d){
													return d;
												})
												.style("color", "black")
												.style("margin-top", "0px");
							self.cardHeader = d3.select("#mainCardHeader")
												.on('mouseover', function() {
														d3.select(this)
														.style('background-color', self.urgencyColor)
													})
												.on("mouseout", function(){
														d3.select(this)
														.style('background-color', "darkgrey" );
														console.log(d3.select(this).node().getBoundingClientRect().height);
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


						toggleBarView: function(){
							var self = this;
							if(self.toggle === "grouped")
								self.toggle = "stacked";
							else
								self.toggle = "grouped";

							self.drawCatBar(self.dict, self.cat, self.levels); 

						},

						toggleTrellis: function(){
							var self = this; 
							document.getElementById('mainCardHeader').setAttribute("style","width:1000px");
							document.getElementById('mainCard').setAttribute("style","height:800px");
							document.getElementById('mainCardPanel').setAttribute("style","height:700px");
							document.getElementById('mainsvg').setAttribute("style","height:700px");
							
							//console.log(parentArea); 
							

							//var svgw = 0.7 * parentArea.node().getBoundingClientRect().width;
							//var svgh = 0.8* parentArea.node().getBoundingClientRect().height; 

						},

						drawBarChart: function(data){
							var self = this;
							console.log(data);
							var drawArea = d3.select("#draw-area-1");
							var parentArea = drawArea.select(function(){
								return this.parentNode; 
							});
							console.log(parentArea.node().getBoundingClientRect());
							var svgw = 0.7 * parentArea.node().getBoundingClientRect().width;
							var svgh = 0.8* parentArea.node().getBoundingClientRect().height; 

							self.svg = d3.select("#draw-area-1").append("svg")
											.attr("id", "mainsvg")
										.attr("width", svgw).attr("height", svgh).attr("transform", "translate(50,20)");
							
							self.cardTitle = d3.select("#mainCardHeader").selectAll("span")
												.data(self.control.getDisplayVariable())
												.enter()
												.append("span")
												.text(function(d){
													return d;
												})
												.style("color", "black")
												.style("margin-top", "0px");
							self.cardHeader = d3.select("#mainCardHeader")
												.on('mouseover', function() {
														d3.select(this)
														.style('background-color', self.urgencyColor)
													})
												.on("mouseout", function(){
														d3.select(this)
														.style('background-color', "darkgrey");
														console.log(d3.select(this).node().getBoundingClientRect().height);
												});
												

							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);

							var margin = {top: 50, right: 20, bottom: 50, left:30};
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
							      .attr("class", "axis axis--x")
							      .attr("transform", "translate("+ 0+"," + (height+margin.top) + ")")
							      .call(d3.axisBottom(x))
									.selectAll("text")	
								        .style("text-anchor", "end")
								        .attr("dx", "-.8em")
								        .attr("dy", ".15em")
								        .attr("transform", "rotate(-65)");
							g.append("g")
							      .attr("class", "axis axis--y")
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




						}
					}
		);
})(QUALDASH);