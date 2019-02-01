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
							self.audit = self.dataModel.getAudit(); 					
							if(self.audit === "minap")
								self.dataModel.readMinapData(); 
							else 
								self.dataModel.readPicanetData(); 
						},
						getMetaData: function(){
							var self = this; 
							return self.dataModel.getMetaData(); 
						},
						dataReady: function(dataViews, rawData){
							var self = this;	
							self.dataViews = dataViews; 						
							self.allVars =  Object.keys(rawData[0]); 
							self.mainView.createQualCards(dataViews);
						},
						getTimeHier: function(){
							var self = this;
							return self.dataModel.getTimeHier(); 
						},
						prepTimeData: function(tspan, viewId, vname ){
							var self = this;
							return self.dataModel.prepTimeData(tspan, viewId, vname);

						},
						buildMetaHier: function(){
							return this.dataModel.buildMetaHierarchy(); 
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
							//var view = self.mainView.getChartType(displayId); 

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
						getCardCats: function(viewId){
							var self = this;
							return (self.audit === "picanet")? $Q.Picanet["displayVariables"][viewId]["categories"] 
																	: $Q.Minap["displayVariables"][viewId]["categories"];
						},
						updateMetrics: function(viewId, value){
							var self = this;
							console.log(value); 
							self.dataModel.updateMetrics(viewId, value); 
						},
						getEHR: function(){
							return this.dataModel.getEHR(); 
						},
						refreshGrid: function(){
							var self = this;
							self.mainView.refreshGrid(); 
						}
						
					}
		);
})(QUALDASH);