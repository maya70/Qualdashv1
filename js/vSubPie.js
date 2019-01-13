(function($Q){
	'use strict'
	$Q.SubPieChart = $Q.defineClass(
					null, 
					function SubPieChart(viewId, data, parent, svgw, svgh){
						var self = this;									
						self.draw(viewId, data, parent, svgw, svgh);
							
					},
					{
						draw: function(viewId, data, parent, svgw, svgh){
							var self = this;
							//////////console.log(data);
							self.parent = parent; 
							self.id = viewId;
							self.data = [];
							for(var key in data){
								self.data.push({'date': key, 'number': data[key].length});
							}
							if(self.parent.g1){
								var undef;
								d3.selectAll(".slave-draw-area-1"+self.id).remove(); 
								//self.parent.g1 = undef; 
							}

							//self.svg = pSVG;
							self.parent.g1 = self.parent.ssvg1.append("g").attr("class", "slave-draw-area-1"+self.id);

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
										  .domain(self.data.map(d => d.date))
										  .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), self.data.length).reverse());
										  //.range(d3.quantize(t => d3.interpolateRgb("steelblue", "brown"), data.length).reverse());
	 					    const arcs = pie(self.data);

							const g = self.parent.g1.append("g")
						      .attr("transform", "translate("+((width / 2)+margin.left)+","+((height / 2)+margin.top)+")")
						      .attr("text-anchor", "middle")
							  .style("font", "12px sans-serif");
						  
							/*g.append("circle")
									.attr("fill", "red")
									.attr("cx", 0)
									.attr("cy", 0)
									.attr("r", 30);*/

							  g.selectAll("path")
							    .data(arcs)
							    .enter().append("path")
							      .attr("fill", d => 
							      	 color(d.data.date))
							      .attr("stroke", "white")
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
											//console.log(d); 
											if(d.data.number === 0)
												return '';
											else 
												return d.data.date;
										});
									
							function midAngle(d){
								return d.startAngle + (d.endAngle - d.startAngle)/2;
							}
							var newarc = d3.arc()
										.innerRadius(radius / 4)
										.outerRadius(radius/2);

							text.transition().duration(1000)
								.attrTween("transform", function(d) {
									//this._current = this._current || d;
									//var interpolate = d3.interpolate(this._current, d);
									//this._current = interpolate(0);
									
									return function(t) {
										//var d2 = interpolate(t);
										//var pos = arc.centroid(d2);
										//pos[1] *= 2.0; 
										//pos[0] =  Math.atan(midAngle(d2));
												//radius * (midAngle(d2) < Math.PI ? 1 : -1);
										var midAngle = d.endAngle < Math.PI ? d.startAngle/2 + d.endAngle/2 : d.startAngle/2  + d.endAngle/2 + Math.PI; 
										return (Math.abs(d.endAngle - d.startAngle) >= (Math.PI/8) )? 
												"translate("+ newarc.centroid(d) +") rotate(-90) rotate("+ (midAngle* 180/Math.PI) + ")"
												: "translate(0,0)";
									};
								})
								.style("opacity", function(d){
									return (Math.abs(d.endAngle - d.startAngle) >= (Math.PI/8) )? 1: 0 ;
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
							/* 
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
							*/
							
						}
					});
 })(QUALDASH);
