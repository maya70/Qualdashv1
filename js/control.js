(function($Q){
	'use strict'
	$Q.Control = $Q.defineClass(
					null, 
					function Control(config){
						var self = this;
						self.dataModel = new $Q.Model(self); 
						self.mainView = new $Q.MainView(self); 
						self.displayVariable = "4.04 Death in hospital";
					},
					{
						viewReady: function(view){
							var self = this; 
							self.dataModel.readMinapDummy(); 
						},
						drawBarChart: function(data){
							this.mainView.drawBarChart(data); 
						}, 
						getDisplayVariable: function(){
							return this.displayVariable; 
						}
					}
		);
})(QUALDASH);