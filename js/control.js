(function($Q){
	'use strict'
	$Q.Control = $Q.defineClass(
					null, 
					function Control(config){
						var self = this;
						self.dataModel = new $Q.Model(self); 
						self.mainView = new $Q.MainView(self); 
					
					},
					{
						viewReady: function(view){
							var self = this; 
							self.dataModel.readMinapDummy(); 
						},
						dataReady: function(dataViews, rawData){
							var self = this;	
							self.dataViews = dataViews; 						
							self.allVars =  Object.keys(rawData[0]); 
							self.mainView.createQualCards(dataViews);
						},
						getDataViews: function(){
							return this.dataViews; 
						},
						getAvailVars: function(){
							var self = this;
							return self.allVars; 
						},
						getAvailMetrics: function(){
							var self = this; 
							return self.dataModel.availMetrics; 
						},						
						drawChart: function(displayId, data, cat, levels, trellis){
							var self = this;
							// get type of chart from view
							var view = self.mainView.getChartType(displayId); 

							// tell view to draw bar chart
							if(!cat)
								this.mainView.drawBarChart(displayId, data); 
							else if(!trellis)
								this.mainView.drawCatBar(displayId, data, cat, levels,0);
							else
								this.mainView.drawBarTrellis(displayId, data, cat, levels); 
						}, 
						//getDisplayVariables: function(){
						//	var self = this;
						//	return self.displayVariables; 
						//}, 
						addCategorical: function(viewId, catName){
						  	this.dataModel.addCategorical(viewId, catName);
						},
						resetCategoricals: function(viewId){
							this.dataModel.resetCategoricals(viewId); 
						},
						toggleBars: function(displayId){
							this.mainView.toggleBarView(); 
						}
					}
		);
})(QUALDASH);