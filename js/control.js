(function($Q){
	'use strict'
	$Q.Control = $Q.defineClass(
					null, 
					function Control(config){
						var self = this;
						self.displayVariable = "4.04 Death in hospital";
						self.dataModel = new $Q.Model(self); 
						self.mainView = new $Q.MainView(self); 
					
					},
					{
						viewReady: function(view){
							var self = this; 
							self.dataModel.readMinapDummy(); 
						},
						drawBarChart: function(data, cat, levels, trellis){
							if(!cat)
								this.mainView.drawBarChart(data); 
							else if(!trellis)
								this.mainView.drawCatBar(data, cat, levels,0);
							else
								this.mainView.drawBarTrellis(data, cat, levels); 
						}, 
						getDisplayVariable: function(){
							var self = this;

							return self.displayVariable; 
						}, 
						addCategorical: function(catName){
						  	this.dataModel.addCategorical(catName);
						},
						toggleBars: function(){
							this.mainView.toggleBarView(); 
						}
					}
		);
})(QUALDASH);