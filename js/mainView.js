(function($Q){
	'use strict'
	$Q.MainView = $Q.defineClass(
					null, 
					function MainView(control){
						var self = this;
						self.control = control;
						self.iter = 0; 												
						self.toggle = "grouped";
						self.control.viewReady(self); 
						self.expanded = {}; 
						self.cat = {}; 
						self.cards = [];
						self.availViews = [{"value": "bar", "text": "Bar Chart"}, 
											{"value": "line", "text": "Line Chart"}, 
											{"value": "scatter", "text": "Scatter Plot"}, 
											{"value": "pie", "text": "Pie Chart"}]; 
					},
					{
						createQualCards: function(dataViews){
							var self = this; 
							self.dataViews = dataViews; 
							self.availMetrics = self.control.getAvailMetrics(); 
							self.meta = self.control.getMetaData(); 
							self.metaHier = self.control.buildMetaHier(); 
							
							for(var i=0; i< dataViews.length; i++){
								self.expanded[i] = false; 
								self.setupPopover(i);
								self.createQualCard(i);
								self.setupControls(); 
							}
							self.initGrid(); 
							self.populateCards(dataViews);
	
						},
						createQualCard: function(viewId){
							var self = this;
							self.cards.push(new $Q.QualCard(self, viewId));
						},
						
						setupPopover: function(viewId){
							var self = this; 
							self.pop = d3.select("body").append("div")
											.attr("id", "pp"+viewId)
											.attr("class", "hidden");
							self.pop.append("div")
											.attr("class","popover-heading" )
											.text("Add/Remove Grouping Variables");
							var pbody = self.pop.append("div")
											.attr("class", "popover-body")
											.attr("id", "cat-popover"); 

							var tabvar = pbody.append("ul")
												.attr("class", "nav nav-tabs");
							var qvar = tabvar.append("li")
										.attr("class", "active")
										.append("a")
											.attr("data-toggle", "tab")
											.attr("href", "#qvar"+viewId)
											.text("Quantiative");

							var nvar = tabvar.append("li")										
										.append("a")
											.attr("data-toggle", "tab")
											.attr("href", "#nvar"+viewId)
											.text("Categorical");
							var tabs = pbody.append("div")
								.attr("class", "tab-content");

							var qtab = tabs.append("div")
										.attr("id", "qvar"+viewId)
										.attr("class", "tab-pane fade in active");

							var ntab = tabs.append("div")
										.attr("id", "nvar"+viewId)
										.attr("class", "tab-pane fade");
							var qvarselect=	qtab.append("select")
												.attr("name", "varselector")
												.attr("class", "form-control")
												.style("vertical-align", "top")
												.attr("id", "qvarsel"+viewId)
												.style("font-size", "9pt")
												.style("horizontal-align", "left")
												.style("min-width", "65%")
												.style("margin-left",0)
												.on("change", function(d){
													//////console.log(this.value);
												});
								for(var m = 0; m < self.meta.length; m++){
								if(self.meta[m]['fieldType'] === "q")
								{
									qvarselect.append("option")
												.attr("value", self.meta[m]['fieldName'])
												.text(self.meta[m]['fieldName'])
												.style("font-size", "9pt");
									}	
								}

								qtab.append("button")
									.attr("type", "submit")						
									.attr("class", "btn_vg_parse hide-vl")
									.text( "Add")
									.attr("id", "quantity-but"+viewId);
							
							var nvarselect=	ntab.append("select")
												.attr("name", "varselector")
												.attr("class", "form-control")
												.style("vertical-align", "top")
												.attr("id", "nvarsel"+viewId)
												.style("font-size", "9pt")
												.style("horizontal-align", "left")
												.style("min-width", "65%")
												.style("margin-left",0)
												.on("change", function(d){
													//////console.log(this.value);
												});
								//var allVars = self.control.getAvailVars(); 
								
								for(var m = 0; m < self.meta.length; m++){
								if(self.meta[m]['fieldType'] === "n")
								{
									nvarselect.append("option")
												.attr("value", self.meta[m]['fieldName'])
												.text(self.meta[m]['fieldName'])
												.style("font-size", "9pt");
									}	
								}

								ntab.append("button")
									.attr("type", "submit")						
									.attr("class", "btn_vg_parse hide-vl")
									.text( "Split")
									.attr("id", "group-but"+viewId);
							
							$(document).on('click', '#group-but'+viewId, function(){
								//////console.log($('#varsel'+viewId +' option:selected').val());
								self.addGroup(viewId, $('#nvarsel'+viewId +' option:selected').val()); 
								self.popSettings.each(function () {
							        //if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
							            $(this).popover('hide');
							          //  return;
							        //}
							    });
							});

							$(document).on('click', '#quantity-but'+viewId, function(){
								//////console.log($('#varsel'+viewId +' option:selected').val());
								self.addGroup(viewId, $('#qvarsel'+viewId +' option:selected').val()); 
								self.popSettings.each(function () {
							        //if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
							            $(this).popover('hide');
							          //  return;
							        //}
							    });
							});


							self.pop2 = d3.select("body").append("div")
											.attr("id", "aa"+viewId)
											.attr("class", "hidden");
							self.pop2.append("div")
											.attr("class","popover-heading" )
											.text("Axis Controls");
							var pbody2 = self.pop2.append("div")
											.attr("class", "popover-body")
											.attr("id", "cat-popover"); 
							
							$(':not(#anything)').on('click', function (e) {
							    self.popSettings.each(function () {
							        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
							            $(this).popover('hide');
							            return;
							        }
							    });
							});
														
						},
						drawCircles: function(pbody){
							var self = this;
							var width = 100, 
								height = 100; 
							var color = d3.scaleLinear()
									    .domain([0, 5])
									    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
									    .interpolate(d3.interpolateHcl);
							var format = d3.format(",d"); 
							var pack = data => d3.pack()
											    .size([width, height])
											    .padding(3)
											  (d3.hierarchy(data)
											    .sum(d => d.size)
											    .sort((a, b) => b.value - a.value));
						},
						addGroup: function(viewId, gvar){
							//console.log(gvar);
							//console.log(viewId); 
							//TODO: remove the following line
							//var gvar = "Record Created By";  // I'm hard coding a grouping variable for now
							var self = this; 
							self.control.addCategorical(viewId, gvar); 
						},
						
						getMetricDataView: function(txt){
							var self = this; 
							var views = self.control.getDataViews();
							for(var v=0; v < views.length; v++){
								if(views[v]['metric'] === txt)
									return views[v];
							}
							return -1; 
						},
						
						initGrid: function(){
							var self = this; 
							self.grid = new Muuri('.grid', {
							                dragEnabled: true,
							                dragStartPredicate: function (item, event) {
							                	//////console.log(event.target); 
							                    if (event.target.matches('[data-toggle="popover"]') 
							                    	|| (event.target.matches('[class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se"]')) ) {
							                      return false;
							                      }
							                    return Muuri.ItemDrag.defaultStartPredicate(item, event);
							                    }
							                });
							//$('.item-content').resizable();

							self.grid.on('dragEnd', function (item, event) {
							  //$(".item-content").css('background-color', 'green');
							  //$(".item-content").css('opacity', 0.5);
							  //$(".item-content").css('z-index', 1);

							  //$(item.getElement()).css('background-color', 'yellow');
							  $(item.getElement()).css('opacity', 1.0);
							  //$(item.getElement()).css('z-index', 1);
							  console.log($(item.getElement()).css('z-index')); 
							  //////console.log(item.getElement());
							  
							});

						},
						refreshGrid: function(singleCard) {
							var self = this;
							self.grid.refreshItems().layout();	
							if(!singleCard)
								self.cards.forEach(function(card){
									card.resizeVis(1); 
								});
							//for(var i=0; i< self.dataViews.length; i++)
							//		self.resizeVis(i); 
						},
						setupControls: function(){
							var self = this;
							self.popSettings= jQuery("[data-toggle=popover]").popover({
						        html : true,
						        container: '#home',
						        content: function() {
						          var content = $(this).attr("data-popover-content");						    
						          return $(content).children(".popover-body").html();
						        },
						        title: function() {
						          var title = $(this).attr("data-popover-content");
						          return $(title).children(".popover-heading").html();
								   }
						    });							
						},
						
						populateCards: function(dataViews){
							var self = this;
							//////console.log(dataView);
							self.cards.forEach(function(card, i){
								card.populateCard(dataViews[i]);
							});
						}
					}
		);
})(QUALDASH);