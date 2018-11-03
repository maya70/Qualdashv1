(function($Q){
	'use strict'
	$Q.Control = $Q.defineClass(
					null, 
					function Control(config){
						var self = this;
						self.displayVariables = [{	"x": "3.06 Date/time arrival at hospital" ,
													"y":"4.04 Death in hospital",
													"xType": "t",
													"yType": "q"}];
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
						getDisplayVariables: function(){
							var self = this;
							return self.displayVariables; 
						}, 
						addCategorical: function(id, catName){
						  	this.dataModel.addCategorical(id, catName);
						},
						toggleBars: function(){
							this.mainView.toggleBarView(); 
						}
					}
		);
})(QUALDASH);