(function($Q){
	'use strict'
	$Q.SubTimeChart = $Q.defineClass(
					null, 
					function SubTimeChart(viewId,vname ,span, data, parent, svgw, svgh){
						var self = this;	
						self.monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
												"Sep", "Oct", "Nov", "Dec" ];
						self.parent = parent; 
						self.data = self.prepData(data, vname, span); 						
						self.palette = self.parent.vis.getPalette(); 
						console.log(self.palette); 
						if(span.indexOf("-") < 0)
							self.drawSimple(viewId, vname, data, parent, svgw, svgh);
						else
							self.drawMultiLevel(viewId, self.data, parent, svgw, svgh);
							
					},
					{
						draw: function(viewId,vname ,span, data, parent, svgw, svgh){
							var self = this; 
							self.data = self.prepData(data, vname, span); 						
							self.drawMultiLevel(viewId, self.data, parent, svgw, svgh);
						},
						getChildStart: function(){
							return "2012";
						},
						getChildEnd: function(){
							return "2014";
						},
						prepData:function(data, yvar, span){
							var self = this;
							//console.log(data); 
							// monthly-annual
							var result = []; 

							if(span.indexOf("-") < 0){
								// prep data for a simple bar chart given a span of a week or a quarter
								console.log(data);
								if(span === "weekly"){
									for(var year in data){
										for(var quar in data[year]){
											for(var mon in data[year][quar]){
												for(var week in data[year][quar][mon]){
													result.push({date: (year+" w"+week) , number: data[year][quar][mon][week][yvar] });
												}
											}
										}
									}
								}
								else if(span === "quarterly"){

								}
							}
							else{
								// mixing different time granularities (MOST common case)
								for(var year in data){
									for(var quar in data[year]){
										for(var mon in data[year][quar]){
											//thisYearInMonths.push(data[year][quar][mon]);
											var sum = 0; 
											for(var week in data[year][quar][mon]){
												sum += data[year][quar][mon][week][yvar]; 
											}
										var temp = {};
										temp['Year'] = year;
										temp['Month'] = self.monthLabels[parseInt(mon)-1];
										temp['Number'] = sum; 
										result.push(temp);

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
						drawSimple: function(viewId, vname, jsonData, parent, svgw, svgh){
							var self = this;
							console.log(jsonData);
							var data = [
  {
    name: "USA",
    values: [
      {date: "January", price: "100"},
      {date: "February", price: "110"},
      {date: "March", price: "145"},
      {date: "April", price: "241"},
      {date: "May", price: "101"},
      {date: "June", price: "90"},
      {date: "July", price: "10"},
      {date: "August", price: "35"},
      {date: "September", price: "21"},
      {date: "October", price: "201"}
    ]
  },
  {
    name: "Canada",
    values: [
      {date: "January", price: "200"},
      {date: "February", price: "120"},
      {date: "March", price: "33"},
      {date: "April", price: "21"},
      {date: "May", price: "51"},
      {date: "June", price: "190"},
      {date: "July", price: "120"},
      {date: "August", price: "85"},
      {date: "September", price: "221"},
      {date: "October", price: "101"}
    ]
  },
  {
    name: "Maxico",
    values: [
      {date: "January", price: "50"},
      {date: "February", price: "10"},
      {date: "March", price: "5"},
      {date: "April", price: "71"},
      {date: "May", price: "20"},
      {date: "June", price: "9"},
      {date: "July", price: "220"},
      {date: "August", price: "235"},
      {date: "September", price: "61"},
      {date: "October", price: "10"}
    ]
  }
];

var self = this; 
							var scale = 0.95;

							//var margin = {top: 30, right: 20, bottom: 30, left: 70}
							var margin = 20; 
							  var  width = 1.5*svgw - margin - margin,
							    height = svgh * scale - margin - margin;
							
//var width = 500;
//var height = 300;
//var margin = 50;
var duration = 250;

var lineOpacity = "0.25";
var lineOpacityHover = "0.85";
var otherLinesOpacityHover = "0.1";
var lineStroke = "1.5px";
var lineStrokeHover = "2.5px";

var circleOpacity = '0.85';
var circleOpacityOnLineHover = "0.25"
var circleRadius = 3;
var circleRadiusHover = 6;


/* Format Data */
var parseDate = d3.timeParse("%B");
data.forEach(function(d) { 
  d.values.forEach(function(d) {
    d.date = parseDate(d.date);
    d.price = +d.price;    
  });
});


/* Scale */
var xScale = d3.scaleTime()
  .domain(d3.extent(data[0].values, d => d.date))
  .range([0, width-margin]);

var yScale = d3.scaleLinear()
  .domain([0, d3.max(data[0].values, d => d.price)])
  .range([height-margin, 0]);

var color = d3.scaleOrdinal(d3.schemeCategory10);

/* Add SVG */
							if(self.svg){								
								parent.ssvgt.select("svg").remove(); 								
							}

							/*var svg = parent.ssvgt.append("svg")			    
							    .attr("width", width + margin.left + margin.right)
							    .attr("height", height + margin.top + margin.bottom)
							  .append("g")
							  .attr("class", "g-time-container"+viewId)
							    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			*/

var svg = parent.ssvgt.append("svg")			    
  .attr("width", (width+margin*2)+"px")
  .attr("height", (height+margin+20)+"px")
  .append('g')
  .attr("transform", "translate("+(margin+30)+","+(margin*2)+")");


/* Add line into SVG */
var line = d3.line()
  .x(d => xScale(d.date))
  .y(d => yScale(d.price));

let lines = svg.append('g')
  .attr('class', 'lines');

lines.selectAll('.line-group')
  .data(data).enter()
  .append('g')
  .attr('class', 'line-group')  
  .on("mouseover", function(d, i) {
      svg.append("text")
        .attr("class", "title-text")
        .style("fill", color(i))        
        .text(d.name)
        .attr("text-anchor", "middle")
        .attr("x", (width-margin)/2)
        .attr("y", 5);
    })
  .on("mouseout", function(d) {
      svg.select(".title-text").remove();
    })
  .append('path')
  .attr('class', 'line')  
  .attr('d', d => line(d.values))
  .style('stroke', (d, i) => color(i))
  .style('opacity', lineOpacity)
  .on("mouseover", function(d) {
      d3.selectAll('.line')
					.style('opacity', otherLinesOpacityHover);
      d3.selectAll('.circle')
					.style('opacity', circleOpacityOnLineHover);
      d3.select(this)
        .style('opacity', lineOpacityHover)
        .style("stroke-width", lineStrokeHover)
        .style("cursor", "pointer");
    })
  .on("mouseout", function(d) {
      d3.selectAll(".line")
					.style('opacity', lineOpacity);
      d3.selectAll('.circle')
					.style('opacity', circleOpacity);
      d3.select(this)
        .style("stroke-width", lineStroke)
        .style("cursor", "none");
    });


/* Add circles in the line */
lines.selectAll("circle-group")
  .data(data).enter()
  .append("g")
  .style("fill", (d, i) => color(i))
  .selectAll("circle")
  .data(d => d.values).enter()
  .append("g")
  .attr("class", "circle")  
  .on("mouseover", function(d) {
      d3.select(this)     
        .style("cursor", "pointer")
        .append("text")
        .attr("class", "text")
        .text(`${d.price}`)
        .attr("x", d => xScale(d.date) + 5)
        .attr("y", d => yScale(d.price) - 10);
    })
  .on("mouseout", function(d) {
      d3.select(this)
        .style("cursor", "none")  
        .transition()
        .duration(duration)
        .selectAll(".text").remove();
    })
  .append("circle")
  .attr("cx", d => xScale(d.date))
  .attr("cy", d => yScale(d.price))
  .attr("r", circleRadius)
  .style('opacity', circleOpacity)
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


/* Add Axis into SVG */
var xAxis = d3.axisBottom(xScale).ticks(12);
var yAxis = d3.axisLeft(yScale).ticks(5);

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${height-margin})`)
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append('text')
  .attr("y", 15)
  .attr("transform", "rotate(-90)")
  .attr("fill", "#000");
  //.text("Total values");

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
