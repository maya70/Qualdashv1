(function($Q){
	'use strict'
	$Q.SubTimeChart = $Q.defineClass(
					null, 
					function SubTimeChart(viewId,vname ,gran, data, parent, svgw, svgh, viewType, tDaily, palette){
						var self = this;	
						self.monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
												"Sep", "Oct", "Nov", "Dec" ];
						self.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
						self.quarters = ["Q1", "Q2", "Q3", "Q4"];
						self.parent = parent; 
						self.daily = tDaily;  						
						self.data = self.prepData(data, vname, gran, viewType); 
						self.gran = gran; 
						self.palette = self.parent.vis.getPalette(); 
						console.log(self.palette); 
						if(self.numYears >= 2){
							//if(gran.indexOf("-") < 0)
							if(viewType === "series")
								self.drawSimple(viewId, vname, data, parent, svgw, svgh);
							else
							{
								if(self.numYears > 2)
									self.drawMultiLevel(viewId, self.data, parent, svgw, svgh);
								else
									self.displayMessage(parent,svgw, svgh);
								}
						}
						else
							self.displayMessage(parent,svgw, svgh);
							
					},
					{
						drawCustomT: function(viewId,vname ,gran, data, parent, svgw, svgh, viewType){
							var self = this; 
							self.gran = gran; 
							var margin = 20; 
							var scale = 0.95;
							var width = 1.7*svgw - margin - margin,
							    height = svgh * scale - margin - margin;
							var duration = 250;

								var lineOpacity = (self.gran.indexOf("daily") < 0)? "0.25": 0.8;
								var lineOpacityHover = "0.85";
								var otherLinesOpacityHover = "0.1";
								var lineStroke = "2.5px";
								var lineStrokeHover = "3.5px";

								var circleOpacity = '0.85';
								var circleOpacityOnLineHover = "0.25"
								var circleRadius = (self.gran.indexOf("daily") < 0)? 3: 1;
								var circleRadiusHover = 6;

							var bisectDate = d3.bisector(function(d) { return new Date(d['date']); }).left;
							
							function custom_sort(a,b){
							      return new Date(a.date).getTime() - new Date(b.date).getTime(); 
							        }
		
							var day_data = prep_daily_data();
							day_data.sort(custom_sort);
							
							var auditVars = parent.parent.control.audit === "picanet"? $Q.Picanet: $Q.Minap;
							
							var parseDate = d3.timeParse("%B");

							// generate weekly data
							var week_data = create_time_unit_data(parse_for_week);

							  function prep_daily_data(){
							  	var day_data = [];
							  	for(var key in self.daily){
							  		day_data.push({'date': key , 'value': self.daily[key][vname] });
							  	}
							  	return day_data; 
							  }

							  function parse_for_week(date) {
							    return (new Date(date)).getDay();
							  }

							  ///////////////////////
							  // generate monthly data
							  var month_data = create_time_unit_data(parse_for_month);

							  function parse_for_month(date) {
							    return (new Date(date)).getDate() - 1;
							  }

							  ///////////////////////
							  var quarter_data = create_time_unit_data(parse_for_quarter);

							  function parse_for_quarter(date) {
							  	var d = new Date(date);
							  	var day_in_quarter = Math.floor(d.getMonth() / 3) * (d.getDate() - 1);
							  	return day_in_quarter;
  								
							  }
							  ///////////////////////

							  var annual_data = create_time_unit_data(parse_for_year);

							  function parse_for_year(date){
							  	var d = new Date(date);
							  	return (d.getDate() - 1) * d.getMonth(); 
							  }

							  ///////////////////////
							  // helper functions
							  function create_time_unit_data(parse_date) {
							    var new_data = JSON.parse(JSON.stringify(day_data));
							    new_data.forEach(function(d, i) {
							      var offset = parse_date(d.date);
							      if(offset == 0 || i == 0 || i == day_data.length - 1) { // it's a new date_unit, or this is the first or last date in the array
							        d['start'] = true;
							      } else {
							        d['start'] = false;

							        // add this value to the start of the week
							        var tar_idx = i - offset;
							        if(tar_idx < 0) { tar_idx = 0; }
							        new_data[tar_idx].value += d.value;

							        // then nil out
							        d.value = -1;
							      }
							    });

							    fill_in_gaps(new_data);
							    return new_data;
							  }

							  function fill_in_gaps(data_array) {
							    // go back in and fill in the missing dates
							    data_array.forEach(function(d, i) {
							      if(d.start == false) {
							        var prev_val, next_val, prev_dist, next_dist;
							        for(var idx = i; idx>=0; idx--) {
							          if(data_array[idx].start == true) {
							            prev_val = data_array[idx].value;
							            prev_dist = i - idx;
							            break;
							          }
							        }

							        for(var idx = i; idx < data_array.length; idx++) {
							          if(data_array[idx].start == true) {
							            next_val = data_array[idx].value;
							            next_dist = idx - i;
							            break;
							          }
							        }

							        d.value = prev_val + ((next_val - prev_val) * (prev_dist/ (prev_dist + next_dist)));
							      }
							    });
							  }

							  ///////////////////////
							  // Time unit selection buttons
							  var all_data = 
							    { 'daily': day_data,
							     'weekly': week_data,
							     'monthly': month_data,
							     'quarterly': quarter_data,
							     'annual': annual_data
							  	};
							  var curr_data = all_data[gran];


							  var availYears = {};
							  console.log(self.data);
							  self.data = [];
							  curr_data.forEach(function(datum){
							  	  var d = new Date(datum.date);
							  	  if(!availYears[d.getFullYear()]){
							  	  	availYears[d.getFullYear()] = 1;
							  	  	self.data.push({'name': d.getFullYear()+"", 'values':[datum]});
							  	  }
							  	  else{
							  	  	// find the index of the corresponding year array in self.data
							  	  	self.data.forEach(function(year){
							  	  		if(year.name === (d.getFullYear()+"")){
							  	  			year.values.push(datum);
							  	  		}
							  	  	});
							  	  }
							  });
							  console.log(self.data);

							  if(self.svg){								
								parent.ssvgt.select("svg").remove(); 								
								}	

								self.svg = parent.ssvgt.append("svg")			    
										  //.attr("width", (width+margin*2)+"px")
										  .attr("width", "100%")
										  .attr("height", (height+margin+20)+"px")
										  .append('g')
										  .attr("transform", "translate("+(margin+30)+","+(margin*2)+")");

								var xScale = d3.scaleTime()
								  //.domain(d3.extent(self.data[0].values, d => new Date(d.date)))
								  .domain(d3.extent(day_data, function(d) { 
								  	return  new Date(d.date); }))
								  .range([0, width-margin-40]);

								var yScale = d3.scaleLinear()
								  //.domain([0, d3.max(self.data[0].values, d => d.value)])
								  .domain([0, d3.max(curr_data, function(d) { 
								  	return d.value; })])
								  .range([height-margin-20, 0]);

								var color = d3.scaleSequential(d3.interpolateViridis); //d3.scaleOrdinal(d3.schemeCategory10);

								color.domain([1,4]);

								var xAxis = d3.axisBottom(xScale).ticks(12);
								var yAxis = d3.axisLeft(yScale).ticks(5);

								self.svg.append("g")
									  .attr("class", "x axis")
									  .attr("transform", `translate(0, ${height-margin-20})`)
									  .call(xAxis);


								self.svg.append("g")
									  .attr("class", "y axis")
									  .call(yAxis)
									  .append('text')
									  .attr("y", 15)
									  .attr("transform", "rotate(-90)")
									  .attr("fill", "#000");
								 ///////////////////////
  																
							    var lineGenerator = d3.line()
													  .x(d => xScale(new Date(d.date)))
													  .y(d => yScale(d.value));

								/*var lines = self.svg.selectAll(".line")
							        .data([curr_data])

							    lines.enter().append("path")
							        .attr("class", "line")
							        .attr("d", lineGenerator);

							    lines.transition()
							        .duration(1000)
							        .attr("d", lineGenerator);*/

							    let lines = self.svg.append('g')
 											 .attr('class', 'lines');

lines.selectAll('.line-group')
  .data(self.data).enter()
  .append('g')
  .attr('class', 'line-group')  
  .on("mouseover", function(d, i) {
      self.svg.append("text")
        .attr("class", "title-text")
        //.style("fill", color(i))        
        .style("fill", "#1f78b4")
        .text(d.name)
        .attr("text-anchor", "middle")
        .attr("x", (width-margin)/2)
        .attr("y", 5);
    })
  .on("mouseout", function(d) {
      self.svg.select(".title-text").remove();
    })
  .append('path')
  .attr('class', 'line')  
  .attr('d', d => lineGenerator(d.values))
  .style('stroke', (d, i) => color(i))
  .style('stroke', "black")
  .style('opacity', function(d) {
  		return lineOpacity;
	})
  //.style('fill', 'none')
  .on("mouseover", function(d) {

      d3.selectAll('.line')
					.style('opacity', function(d) {
						if(this.id !== "vline"+viewId)
						return otherLinesOpacityHover; 
					});
      d3.selectAll('.circle')
					.style('opacity', circleOpacityOnLineHover);
      d3.select(this)
        .style('opacity', lineOpacityHover)
        .style("stroke-width", lineStrokeHover)
        .style("cursor", "pointer");
    })
  .on("mouseout", function(d) {
  	//if(self.gran.indexOf("daily") < 0){
      d3.selectAll(".line")
					.style('opacity', function(d) {
						if(this.id !== "vline"+viewId)
						return lineOpacity; 
					});
      d3.selectAll('.circle')
					.style('opacity', circleOpacity);
      d3.select(this)
        .style("stroke-width", lineStroke)
        .style("cursor", "none");
    	//}
    });





							    

						},
						draw: function(viewId,vname ,gran, data, parent, svgw, svgh, viewType){
							var self = this; 
							self.gran = gran; 
							var auditVars = parent.parent.control.audit === "picanet"? $Q.Picanet: $Q.Minap;

							self.data = self.prepData(data, vname, gran, viewType); 	
							if(self.svg){								
								parent.ssvgt.select("svg").remove(); 								
							}	
							if(self.numYears >= 2){
								if(viewType === "multiples")				
								{
									if(self.numYears > 2)
										self.drawMultiLevel(viewId, self.data, parent, svgw, svgh);
									else
										self.displayMessage(parent,svgw, svgh);
								}
								else if(viewType === "series")
									self.drawSimple(viewId, vname, data, parent, svgw, svgh);
							}
							else
								self.displayMessage(parent,svgw, svgh);
						},
						getChildStart: function(){
							return this.data[0]["Year"];
						},
						getChildEnd: function(){
							return this.data[this.data.length-1]["Year"];
						},
						prepData:function(data, yvar, gran, viewType, viewGran){
							var self = this;
							
							var result = []; 
							self.numYears = 0;
							//if(gran.indexOf("-") < 0){
							if(viewType === "series"){
								// prep data for a simple bar chart given a gran of a week or a quarter		
								console.log(data);
								// get the granularity
								// TODO: update this from GUI
								var grans = gran.split("-");
								var granT = grans[0];
								var granT2 = (grans.length > 1)? grans[1]: ""; 
								if(granT === "monthly")  // most common case
								{
									for(var year in data){
										self.numYears++; 
										result.push({'name': year, 'values': []});
										self.months.forEach(function(month){
											result[result.length-1]['values'].push({'date': month, 'value': 0});
										});
										for(var quarter in data[year]){
											for(var mon in data[year][quarter]){
												var sum = 0; 
												for(var week in data[year][quarter][mon]){
													sum += data[year][quarter][mon][week][yvar]; 
												}
												var temp = {};
												result[result.length-1]['values'][parseInt(mon)-1]['value'] = sum; 
											}
										}
									}

								}
								else if(granT === "daily" ){
									
										for(var year in data){
											self.numYears++; 
											result.push({'name': year, 'values': []});
											for(var key in self.daily){
												var curYear = new Date(key).getFullYear()+"";
												if(year === curYear){
													// get month and day only
													var date = new Date(key);
													var mon_day = self.months[date.getMonth()] + " " + date.getDate(); 
													result[result.length-1]['values'].push({'date': mon_day, 'value': self.daily[key][yvar]});
												}
											}
									    }
									
									/*if(granT2 === ""){
										// get the most recent year
										var latest = 0; 
										var index = -1;
										result.forEach(function(entry, idx){
											if(parseInt(entry['name']) > latest){
												latest = parseInt(entry['name']);
												index = idx; 
											}
										}); 
										var temp = result[index];
										result = [temp]; 

									}*/
									
								}
								else if(granT === "quarterly"){
									for(var year in data){
										self.numYears++; 
										result.push({'name': year, 'values': []});
										self.quarters.forEach(function(quart){
											result[result.length-1]['values'].push({'date': quart, 'value': 0});
										});
										for(var quarter in data[year]){
											var sum = 0; 
											for(var mon in data[year][quarter]){
												for(var week in data[year][quarter][mon]){
													sum += data[year][quarter][mon][week][yvar]; 
												}												
											}
											var temp = {};
											result[result.length-1]['values'][parseInt(quarter)-1]['value'] = sum; 
										}
									}
								}
								

								
							}



							else{
								// prepare data for small multiples -- no longer supported
								
								for(var year in data){
									self.numYears++; 
									self.monthLabels.forEach(function(month){
										result.push({'Year': year , 'Month': month , 'Number': 0 });
									});
									for(var quar in data[year]){
										for(var mon in data[year][quar]){
											//thisYearInMonths.push(data[year][quar][mon]);
											var sum = 0; 
											for(var week in data[year][quar][mon]){
												sum += data[year][quar][mon][week][yvar]; 
											}

										//var temp = {};
										//temp['Year'] = year;
										//temp['Month'] = self.monthLabels[parseInt(mon)-1];
										//temp['Number'] = sum; 
										//result.push(temp);
										var idx = (self.numYears-1) * self.monthLabels.length + parseInt(mon)-1; 
										result[idx]['Number'] = sum; 

										}
									}
																	
								}
							}
							console.log(result); 
							return result; 
						},
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
						foundMatch: function(datum, cat, piedata){
							var self = this; 
							for(var i=0; i < piedata[cat].length; i++)
								if(piedata[cat][i] === datum)
									return true; 
							return false; 
						},
						prepDataSimple: function(vname, jsonData){
							var self = this;
							
						},
						displayMessage: function(parent, svgw, svgh){
							var self = this;
							var margin = 20; 
							var scale = 0.95;
							var  width = 1.5*svgw - margin - margin,
							     height = svgh * scale - margin - margin;
							if(self.svg){								
								parent.ssvgt.select("svg").remove(); 								
							}
							self.svg = parent.ssvgt.append("svg")			    
							  .attr("width", (width+margin*2)+"px")
							  .attr("height", (height+margin+20)+"px")
							  .append('g')
							  .attr("transform", "translate("+(margin+30)+","+(margin*2)+")");

							 self.svg.append("text")
							 			.attr("x", svgw*0.3)
							 			.attr("y", svgh*0.3)
							 			.text("No sufficient historic data to generate this view.");

						},
						drawSimple: function(viewId, vname, jsonData, parent, svgw, svgh){
							

							var self = this; 
							var scale = 0.95;

							//var margin = {top: 30, right: 20, bottom: 30, left: 70}
							var margin = 20; 
							var  width = 1.7*svgw - margin - margin,
							    height = svgh * scale - margin - margin;
							

								var duration = 250;

								var lineOpacity = (self.gran.indexOf("daily") < 0)? "0.25": 0.8;
								var lineOpacityHover = "0.85";
								var otherLinesOpacityHover = "0.1";
								var lineStroke = "2.5px";
								var lineStrokeHover = "3.5px";

								var circleOpacity = '0.85';
								var circleOpacityOnLineHover = "0.25"
								var circleRadius = (self.gran.indexOf("daily") < 0)? 3: 1;
								var circleRadiusHover = 6;


								/* Format Data */
								var parseDate = d3.timeParse("%B");
								if(self.gran === "monthly"){
									parseDate = d3.timeParse("%B");
								}
								else if(self.gran === "daily")
									parseDate = d3.timeParse("%B %d");
									
								self.data.forEach(function(d) { 
									  d.values.forEach(function(d) {
									    d.date = parseDate(d.date);
									    d.value = +d.value;    
									  });
									});
		
								
								/*else{
									self.data.forEach(function(d) { 
									  d.values.forEach(function(d) {
									    d.date = new Date(d.date);
									    d.value = +d.value;    
									  });
									});							
								}*/
								
						function custom_sort(a,b){
							      return new Date(a.date).getTime() - new Date(b.date).getTime(); 
							        }

						self.data.forEach(function(datum){
							datum['values'].sort(custom_sort);
						});

						/* Scale */
						var xScale = d3.scaleTime()
						  .domain(d3.extent(self.data[0].values, d => d.date))
						  .range([0, width-margin-70]);

						var yScale = d3.scaleLinear()
						  //.domain([0, d3.max(self.data[0].values, d => d.value)])
						  .domain([0, d3.max(self.data, function(array){
						  	return d3.max(array.values, d => d.value );
						  })])
						  .range([height-margin-20, 0]);

						var color = d3.scaleSequential(d3.interpolateViridis); //d3.scaleOrdinal(d3.schemeCategory10);
						color.domain([1,4]);

						/* Add SVG */
						if(self.svg){								
							parent.ssvgt.select("svg").remove(); 								
						}

					self.svg = parent.ssvgt.append("svg")			    
					  .attr("width", "100%")
					  .attr("height", (height+margin+20)+"px")
					  .append('g')
					  .attr("transform", "translate("+(margin+30)+","+(margin*2)+")");

					/* Add line into SVG */
					var line = d3.line()
					  .x(d => xScale(d.date))
					  .y(d => yScale(d.value));

					let lines = self.svg.append('g')
					  .attr('class', 'lines');

					lines.selectAll('.line-group')
					  .data(self.data).enter()
					  .append('g')
					  .attr('class', 'line-group')  
					  .on("mouseover", function(d, i) {
					      self.svg.append("text")
					        .attr("class", "title-text")
					        .style("fill", color(i))        
					        //.style("fill", "#1f78b4")
					        .text(d.name)
					        .attr("text-anchor", "middle")
					        .attr("x", (width-margin)/2)
					        .attr("y", 5);
					    })
					  .on("mouseout", function(d) {
					      self.svg.select(".title-text").remove();
					    })
					  .append('path')
					  .attr('class', 'line')  
					  .attr('d', d => line(d.values))
					  .style('stroke', (d, i) => color(i))
					  .style('opacity', function(d) {
					  		return lineOpacity;
						})
					  .style('fill', 'none')
					  .style("stroke-dasharray", function(d,i) {
					  	//if(self.gran.indexOf("daily") < 0)
					  	return ("3," + ((2-i)*2));
					  	//else return "none"; 
						})
					  .on("mouseover", function(d) {

					      d3.selectAll('.line')
										.style('opacity', function(d) {
											if(this.id !== "vline"+viewId)
											return otherLinesOpacityHover; 
										});
					      d3.selectAll('.circle')
										.style('opacity', circleOpacityOnLineHover);
					      d3.select(this)
					        .style('opacity', lineOpacityHover)
					        .style("stroke-width", lineStrokeHover)
					        .style("cursor", "pointer");
					    })
					  .on("mouseout", function(d) {
					  	//if(self.gran.indexOf("daily") < 0){
					      d3.selectAll(".line")
										.style('opacity', function(d) {
											if(this.id !== "vline"+viewId)
											return lineOpacity; 
										});
					      d3.selectAll('.circle')
										.style('opacity', circleOpacity);
					      d3.select(this)
					        .style("stroke-width", lineStroke)
					        .style("cursor", "none");
					    	//}
					    });


/* Add circles in the line */
lines.selectAll("circle-group")
  .data(self.data).enter()
  .append("g")
  //.style("fill", (d, i) => color(i))
  .style("fill", (d, i) => self.palette[vname])
  .style("stroke", "black")
  .style("opacity", 1.0)
  .selectAll("circle")
  .data(d => d.values).enter()
  .append("g")
  .attr("class", "circle")  
  .on("mouseover", function(datum) {
      d3.select(this)     
        .style("cursor", "pointer")
        .style("opacity", 1.0)
        .append("text")
        .attr("class", "text")
        //.text(`${d.value}` + `${d.date}` )
        .text(function(ddatum){
			var dd = new Date(ddatum.date);
			console.log(d3.select(this.parent).attr("d"));
        	return "x:"+ (dd.getDate()+ "-"+dd.getMonth()+ "-"+ dd.getFullYear()); 
        })
        .attr("x", d => xScale(d.date) + 5)
        .attr("y", d => yScale(d.value) - 10);
       d3.select(this)
       	.append("text")
       	.attr("class", "text")
       	.text(function(d){
       		return "y:" + d.value;
       	})
       	.attr("x", d => xScale(d.date) + 5)
        .attr("y", d => yScale(d.value) - 3);
    })
  .on("mouseout", function(d) {
      d3.select(this)
        .style("cursor", "none")  
        .style("opacity", 0.2)
        .transition()
        .duration(duration)
        .selectAll(".text").remove();
    })
  .append("circle")
  .attr("class","timeCircle"+viewId)
  .attr("cx", d => xScale(d.date))
  .attr("cy", d => yScale(d.value))
  .attr("r", function(d) {
  		return circleRadius;
  })
  .style('opacity', function(d){
  	if(self.gran.indexOf("daily") < 0)
  		return circleOpacity;
  	else return 0.2;
  })
  .on("mouseover", function(d) {
        d3.select(this)
          .transition()
          .duration(duration)
          .attr("r", circleRadiusHover);
      })
    .on("mouseout", function(d) {
        d3.select(this) 
          .transition()
          .duration(duration)
          .attr("r", circleRadius);  
      });


/* Add Axis */
var xAxis = d3.axisBottom(xScale).ticks(12);
var yAxis = d3.axisLeft(yScale).ticks(5);

self.svg.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${height-margin-20})`)
  .call(xAxis)
  .selectAll("text")	
	.text(function(d, i){
		return $Q.months[i]; 
	})
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

self.svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append('text')
  .attr("y", 15)
  .attr("transform", "rotate(-90)")
  .attr("fill", "#000");
  //.text("Total values");

   
  var legend = self.svg.append("g")
  				.attr("class", "time-legend")
  				.attr("transform", "translate("+ (width-margin - 50) + ", 10)");

 

  self.data.forEach(function(year, i){
  	legend.append("line")
  			.attr("x1", 0 )
  			.attr("x2", 10)
  			.attr("y1", i*20)
  			.attr("y2", i*20)
  			.style('stroke', color(i))  			
  			.style("stroke-dasharray",("3," + ((2-i)*2)));

  	legend.append("text")
  			.attr("x", 12)
  			.attr("y", i*20)
  			.attr("d", year['name'] )
  			.text(year['name'])
  			.on("click", function(d){  
  			     legend.selectAll('text').style('opacity', 0.4);
  			     d3.select(this).style('opacity', 1.0);						
  				 d3.selectAll('.line')
					.style('opacity', function(l){
						if(l.name !== year['name'])
							return 0;
						console.log(l.name);
					});
				d3.selectAll(".timeCircle"+viewId)
				  .style("opacity", function(c){
				  	return 0; 
				  });


  			}); 
  });

						},


						drawMultiLevel: function(viewId, jsonData, parent, svgw, svgh){
							var self = this; 
							var scale = 0.95;

							var margin = {top: 30, right: 20, bottom: 30, left: 70},
							    width = 1.5*svgw - margin.left - margin.right,
							    height = svgh * scale - margin.top - margin.bottom;
							var averages = [];
							self.yMax = Math.max.apply(Math, jsonData.map(function(o) { 
								return o.Number; }));
							self.yMin = Math.min.apply(Math, jsonData.map(function(o) { 
								return o.Number; }));
							//console.log("MAX Y: "+ self.yMax); 
							//console.log("MAX Y: "+ self.yMin); 

							var data = getData(jsonData);
							console.log(data);
						
						// define line and area wherever data is not null
							var x = d3.scaleLinear()
							    .range([0, width]);

							var y = d3.scaleLinear()				
							    .range([height, 0]);
							
							var line = d3.line()
							    .defined(function(d) { return d; })
							    .x(function(d) { return x(d.x); })
							    .y(function(d) { return y(d.y); });

							var area = d3.area()
							    .defined(line.defined())
							    .x(line.x())
							    .y1(line.y())
							    .y0(y(0));

							var div = d3.select("body").append("div")	
							    .attr("class", "tooltip")				
							    .style("opacity", 0);

							if(self.svg){								
								parent.ssvgt.select("svg").remove(); 								
							}

							var svg = parent.ssvgt.append("svg")			    
							    .attr("width", width + margin.left + margin.right)
							    .attr("height", height + margin.top + margin.bottom)
							  .append("g")
							  .attr("class", "g-time-container"+viewId)
							  .datum(data)
							    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

							self.svg = svg; 

							svg.append("path")
							    .attr("class", "area")
							    .attr("d", area);
							// adding text labels
							for(var i=0; i < self.numMonthsInData; i++){
								svg.append("g")
									.attr("class", "g-time-group-"+viewId)
									.attr("transform", "translate("+((width*0.3/self.numMonthsInData)+width*i/self.numMonthsInData)+",0)")
									.append("text")
									.text(self.monthLabels[i]);
							}
							
							var xAxis = svg.append("g")
							    .attr("class", "x axis")
							    .attr("transform", "translate(0," + height + ")")
							    .call(d3.axisBottom(x));

				// Remove pre-populated linear data ticks on x-axis 
							xAxis.selectAll("text").remove();
							xAxis.selectAll("g").remove();

							var yAxis = svg.append("g")
							    .attr("class", "y axis")
							    .call(d3.axisLeft(y));

							yAxis.selectAll("text").remove();
							yAxis.selectAll("g").remove();			    

							svg.append("path")
							    .attr("class", "line")
							    .attr("d", line)
							    .attr("stroke-width", 2)
							    .attr("stroke", "#ccc");


								     //Appends chart headline
					  d3.select(".g-hed").text("Time scales");
					  //Appends chart intro text
					  //d3.select(".g-intro").text("Chart intro text goes here. Write a short sentence describing the chart here.");
					  // Setting y-axis scale to be linear with an appropriate domain beginning, as is mandatory, with 0 set as baseline, then appending svg g onto the left yAxis with 6 tickmarks at equal intervals
								
								var yScale = d3.scaleLinear()
							        .domain([0, self.yMax])
									.range([(height), 0]);
								var yAxis = svg.append("g")
								    .attr("class", "y axis1")
								    .call(d3.axisLeft(yScale).ticks(6));
								    
					// since the x-axis labels we want to display in this instance are not linear/ordinal, there is no need to set a domain. Because we have five buckets/date ranges to display, we;re simply adding the tick marks now

								var xScale1 = d3.scaleLinear()
									.domain([0,self.numMonthsInData])
									.range([0, width]);
								var xAxis1 = svg.append("g")
								    .attr("class", "x axis2")
								    .attr("transform", "translate(0," + height + ")")
								    .call(d3.axisBottom(xScale1)
								    	.tickFormat("")
								    	.ticks(self.numMonthsInData));
					//dynamically calculated mean/average per each month added as a line on y-axis - using svg g to append the lines to all five chart sections whose x-axis positioning is calculated by x1 and x2 based on width of chart overall; then dynamically calculating averages of data to define the position on y-axis
								
								for(var i=0; i < self.numMonthsInData; i++){
							        d3.select(".g-time-container"+viewId).append("line")
							            .attr("x1", width*i/self.numMonthsInData)
							            .attr("x2", width*(i+1)/self.numMonthsInData)
							            .attr("y1", averages[i])
							            .attr("y2", averages[i])
							            .attr("stroke", "#979797")
							            .attr("stroke-width", 2);	              
								}
						            
					// let's plot some circles based upon the data points for 'Number' to give users a visual cue where they can hover or touch for details-on-demand

								var circles = svg.selectAll("circle")
					                   .data(data)
					                   .enter()
					                   .append("circle")

								var circleAttributes = circles
					                    .attr("cx", function(d) {
					                   		return d ? d.x * width : null;
					                   	})
					                    .attr("cy", function(d) {
					                   		//return d ? height - d.y * height : null;
					                   		return d? yScale(d.y* self.yMax) : null; 
					                   	})
					                    .attr("r", function(d) {
					                   		return d ? 3 : 0;
					                   	})
					                    .style("fill", "#fff")
					                  .attr("stroke", "#989A98")
					                  .attr("stroke-width", 1)
					                   	.on("mouseover", function(d) {
					                   		var dlabel = (parseFloat(d.y * self.yMax) < 1)? 0: parseFloat(d.y * self.yMax); 
								            div.transition()		
								                .duration(200)		
								                .style("opacity", .9);		
								            div	.html(dlabel)	
								                .style("left", (d3.event.pageX) + "px")		
								                .style("top", (d3.event.pageY - 28) + "px");	
								            })					
								        .on("mouseout", function(d) {		
								            div.transition()		
								                .duration(500)		
								                .style("opacity", 0);	
								        });		
							
							// x axis grouped labels	        
							for(var i = 0 ; i < self.numMonthsInData ; i ++){
							        d3.select(".g-time-container"+viewId).append("text")
							        	.text(self.getChildStart())
							        	.attr("transform", "translate("+ (width*(i+.1)/self.numMonthsInData) + ","+(height + 28) +")rotate(-65)");				
								}
								for(var i = 0 ; i < self.numMonthsInData ; i ++){
									//if (width < 768) {
										d3.select(".g-time-container"+viewId).append("text")
								        	.text(self.getChildEnd())
								        	.attr("transform", "translate("+ (width*(i+.7)/self.numMonthsInData) + ","+(height + 28) +")rotate(-65)");										
													
								}
							
							// x axis separators
							for(var i=1; i <=self.numMonthsInData; i++ ){
								d3.select(".g-time-container"+viewId).append("line")
						            .attr("x1", width*i/self.numMonthsInData)
						            .attr("x2", width*i/self.numMonthsInData)
						            .attr("y1", 0)
						            .attr("y2", height)
						            .attr("stroke", "#ccc")
						            .attr("stroke-width", 2);
						        }
									// Segmenting the dataset according the value for 'Month" field, then using `break;` to add padding between each segment.

								function getData(jsonData){
									var data = [];
									self.numMonthsInData = 12; 
									self.numYearsInData = 3; 
									var twoData = [];
									var yScale = d3.scaleLinear()
								        .domain([0, self.yMax])
										.range([height, 0]);
									
									for(var m = 0; m < self.numMonthsInData; m++)
										twoData.push([]);

									for(var i = 0 ; i < jsonData.length ; i ++){
										var monId = self.monthLabels.indexOf(jsonData[i].Month);
										var num = jsonData[i].Number? jsonData[i].Number: 0.01;
										twoData[monId].push(num); 					
									}
									for(var i = 0 ; i < self.numMonthsInData ; i ++){
										twoData[i].push(null);
									}
									data.push(null);
									var val = 1/((jsonData.length-1) * 2);
									
									for(var i = 0 ; i < self.numMonthsInData ; i ++)
									{
										for(var j = 0 ; j <= self.numYearsInData ; j ++)
										{		
											if (twoData[i][j]) {
												data.push({x: val, y: twoData[i][j] / self.yMax});
												val += 1/(jsonData.length + 0.5);
											} else {
												data.push(null);
												val += 1/((jsonData.length + 1) * 10);
											}
											
										}
									}
									for(var i = 0 ; i < self.numMonthsInData ; i ++)
									{
										averages[i] =  yScale(twoData[i].reduce(sum,0)/self.numYearsInData) ; //height - twoData[i].reduce(sum, 0)*height / 3000;
									} 
									return data;
								}
								function sum(a, b)
								{
									return a+b;
								}			
							

			
						}
					});
 })(QUALDASH);
