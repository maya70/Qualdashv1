(function($Q){
	'use strict'
	$Q.SubTimeChart = $Q.defineClass(
					null, 
					function SubTimeChart(viewId, span, data, parent, svgw, svgh){
						var self = this;	
						self.monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
												"Sep", "Oct", "Nov", "Dec" ];
						self.parent = parent; 
						self.data = self.prepData(data, "der_smr"); 
						self.draw(viewId, self.data, parent, svgw, svgh);
							
					},
					{
						prepData:function(data, yvar){
							var self = this;
							console.log(data); 
							// monthly-annual
							var result = []; 

							for(var year in data){
								var thisYearInMonths = []; 
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
						draw: function(viewId, newdata, parent, svgw, svgh){
							var self = this; 
							var scale = 0.95;

							
		var jsonData = [{"Year":2011,"Month":"Jan","Number":0.320},
			{"Year":2011,"Month":"Feb","Number":0.10},
			{"Year":2011,"Month":"Mar","Number":0.365},
			{"Year":2011,"Month":"Apr","Number":0.385},
			{"Year":2011,"Month":"May","Number":0.10},
			{"Year":2011,"Month":"Jun","Number":0.10},
			{"Year":2011,"Month":"Jul","Number":0.10},
			{"Year":2012,"Month":"Jan","Number":0.380},
			{"Year":2012,"Month":"Feb","Number":0.180},
			{"Year":2012,"Month":"Mar","Number":0.275},
			{"Year":2012,"Month":"Apr","Number":0.10},
			{"Year":2012,"Month":"May","Number":0.410},
			{"Year":2012,"Month":"Jun","Number":0.410},
			{"Year":2012,"Month":"Jul","Number":0.410},
			{"Year":2013,"Month":"Jan","Number":0.320},
			{"Year":2013,"Month":"Feb","Number":0.170},
			{"Year":2013,"Month":"Mar","Number":0.10},
			{"Year":2013,"Month":"Apr","Number":0.10},
			{"Year":2013,"Month":"May","Number":0.390},
			{"Year":2013,"Month":"Jun","Number":0.390},
			{"Year":2013,"Month":"Jul","Number":0.390},
			{"Year":2014,"Month":"Jan","Number":0.420},
			{"Year":2014,"Month":"Feb","Number":0.125},
			{"Year":2014,"Month":"Mar","Number":0.310},
			{"Year":2014,"Month":"Apr","Number":0.450},
			{"Year":2014,"Month":"May","Number":0.410},
			{"Year":2014,"Month":"Jun","Number":0.410},
			{"Year":2014,"Month":"Jul","Number":0.410}];
			
		// Positioning and sizing our chart based upon window size and setting margins of 50px on all four sides, 
		// including axes, area fill and setting domain/range for data  
		function draw(){
			var margin = {top: 30, right: 20, bottom: 30, left: 40},
			    width = svgw - margin.left - margin.right,
			    height = svgh * scale - margin.top - margin.bottom;
			var averages = [];
			self.yMax = Math.max.apply(Math, jsonData.map(function(o) { 
				return o.Number; }))
			console.log("MAX Y: "+ self.yMax); 

			var data = getData(jsonData);
			console.log(data);
		// PSA: What was previously called 'd3.scale.linear()' in V3 is now just 'd3.scaleLinear()' in V4; still used to create new linear scale.
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

			var svg = parent.ssvgt.append("svg")			    
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			  .append("g")
			  .attr("class", "g-time-container"+viewId)
			  .datum(data)
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			svg.append("path")
			    .attr("class", "area")
			    .attr("d", area);
// appending svg g, then apppending text element to that, then assigning the month labels to the text element to insert them essentially as annotated text into the d3 chart
// Wouldn't this have been oh-so-much easier to use d3.annnotations? If only I'd been so clever as Susie Lu.
			for(var i=0; i < self.numMonthsInData; i++){
				svg.append("g")
					.attr("class", "g-time-group-"+viewId)
					.attr("transform", "translate("+(width/12 + width*i/self.numMonthsInData)+",0)")
					.append("text")
					.text(self.monthLabels[i]);
			}
			
			var xAxis = svg.append("g")
			    .attr("class", "x axis")
			    .attr("transform", "translate(0," + height + ")")
			    .call(d3.axisBottom(x));
// using selectAll to remove pre-populated linear data ticks on x-axis 
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
				.range([height, 0]);
			var yAxis = svg.append("g")
			    .attr("class", "y axis1")
			    .call(d3.axisLeft(yScale).ticks(6));
			    
// since the x-axis labels we want to display in this instance are not linear/ordinal, there is no need to set a domain. Because we have five buckets/date ranges to display, we;re simply adding the tick marks now

			var xScale1 = d3.scaleLinear()
				.range([0, width]);
			var xAxis1 = svg.append("g")
			    .attr("class", "x axis2")
			    .attr("transform", "translate(0," + height + ")")
			    .call(d3.axisBottom(xScale1)
			    	.tickFormat("")
			    	.ticks(5));
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
                   		return d ? height - d.y * height : null;
                   	})
                    .attr("r", function(d) {
                   		return d ? 3 : 0;
                   	})
                    .style("fill", "#fff")
                  .attr("stroke", "#989A98")
                  .attr("stroke-width", 1)
                   	.on("mouseover", function(d) {
			            div.transition()		
			                .duration(200)		
			                .style("opacity", .9);		
			            div	.html(parseFloat(d.y * self.yMax))	
			                .style("left", (d3.event.pageX) + "px")		
			                .style("top", (d3.event.pageY - 28) + "px");	
			            })					
			        .on("mouseout", function(d) {		
			            div.transition()		
			                .duration(500)		
			                .style("opacity", 0);	
			        });		
			        // Conditional statement to append axis labels at dynamically calculated positions; 
			        //this allows us both to center the labels at the start and end points of the data rather than on the tickmarks, 
			        //as well as to adjust the '15' label positioning slightly to the left when the size of the viewport 
			        // is less than 768 so as to prevent overlap.    	        
		for(var i = 0 ; i < self.numMonthsInData ; i ++){
		        d3.select(".g-time-container"+viewId).append("text")
		        	.text("Q1")
		        	.attr("x", width*i/self.numMonthsInData + width/50)
		        	.attr("y", height + 25);				
			}
			for(var i = 0 ; i < self.numMonthsInData ; i ++){
				if (width < 768) {
					d3.select(".g-time-container"+viewId).append("text")
			        	.text("Q4")
			        	.attr("x", width*i/self.numMonthsInData + width*7/50)
			        	.attr("y", height + 25);						
				}else{
					d3.select(".g-time-container"+viewId).append("text")
			        	.text("'15")
			        	.attr("x", width*i/self.numMonthsInData + width*8/50)
			        	.attr("y", height + 25);
				}				
			}
// we use svg g to append the axis tickmarks, setting a different x-axis coordinate 
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
				self.numMonthsInData = 7; 
				self.numYearsInData = 5; 
				var twoData = [];
				var yScale = d3.scaleLinear()
			        .domain([0, self.yMax])
					.range([height, 0]);
				
				for(var m = 0; m < self.numMonthsInData; m++)
					twoData.push([]);

				for(var i = 0 ; i < jsonData.length ; i ++){
					var monId = self.monthLabels.indexOf(jsonData[i].Month);
					twoData[monId].push(jsonData[i].Number); 					
				}
				for(var i = 0 ; i < self.numMonthsInData ; i ++){
					twoData[i].push(null);
				}
				data.push(null);
				var val = 1/((jsonData.length-1) * 2);
				
				for(var i = 0 ; i < self.numMonthsInData ; i ++)
				{
					for(var j = 0 ; j < self.numYearsInData ; j ++)
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
		
		// moment of truth: let's execute the chart and draw it

		draw();

		
						}
					});
 })(QUALDASH);
