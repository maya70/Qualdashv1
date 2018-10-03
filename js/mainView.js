(function($Q){
	'use strict'
	$Q.MainView = $Q.defineClass(
					null, 
					function MainView(control){
						var self = this;
						//$Q.Model_readMinapDummy(); 
						self.control = control;
						self.setupControls(); 
						self.urgencyColor = "#63F3B9";
						self.control.viewReady(self); 
					},
					{
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
						drawBarChart: function(data){
							var self = this;
							var svgw = 300;
							var svgh = 300; 
							var drawArea = d3.select("#draw-area-1");
							var parentArea = drawArea.select(function(){
								return this.parentNode; 
							});
							console.log(parentArea.node().getBoundingClientRect());
							self.svg = d3.select("#draw-area-1").append("svg")
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
														.style('background-color', "white")
													})
												.on("mouseout", function(){
														d3.select(this)
														.style('background-color', self.urgencyColor);
														console.log(d3.select(this).node().getBoundingClientRect().height);
												});
												

							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);

							var margin = {top: 50, right: 20, bottom: 50, left:30};
							var width = svgw - margin.left - margin.right; 
							var height = svgh - margin.top - margin.bottom;

							/*self.cardHeader.append("svg").attr("width", svgw).attr("height", "50px")	
									.append("text")
							 		.attr("id", "title")
									//.attr("transform", "translate("+ (width/2) +", "+(margin.top/2) +")")
									.attr("x", (width/2))
									.attr("y", svgh)
									.style("text-anchor", "middle")
									.style("font-size", 10)
									.text(self.control.getDisplayVariable());

							/*d3.selectAll("#title").each( function(sel){
															console.log(d3.select(this).attr("x")); 
															self.svg.append("rect")
																.attr("x", d3.select(this).attr("x"))
																.attr("y", 10)
																.attr("height", 50)
																.attr("width", this.getComputedTextLength() )
																.style("fill", "white")
																;
														    }); */



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