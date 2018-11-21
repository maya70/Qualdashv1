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
							self.allVars =  Object.keys(rawData[0]); 
							self.mainView.createQualCards(dataViews);
						},
						getAvailVars: function(){
							var self = this;
							return self.allVars; 
						},
						getAvailMetrics: function(){
							var self = this; 
							return self.dataModel.availMetrics; 
						},
						drawBarChart: function(displayId, data, cat, levels, trellis){
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
						addCategorical: function(id, catName){
						  	this.dataModel.addCategorical(id, catName);
						},
						toggleBars: function(displayId){
							this.mainView.toggleBarView(); 
						}
					}
		);
})(QUALDASH);