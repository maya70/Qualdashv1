(function($Q){
	'use strict'
	$Q.MainView = $Q.defineClass(
					null, 
					function MainView(control){
						var self = this;
						self.control = control;
						self.control.viewReady(self); 
						self.expanded = {}; 						
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
								self.setupControls(i); 
							}
							self.initGrid(); 
							self.populateCards(dataViews);
	
						},
						createQualCard: function(viewId){
							var self = this;
							self.cards.push(new $Q.QualCard(self, viewId));
						},
						setTableTabs: function(keys){
							var self = this;
							var tabs = d3.select("#tableTabs");

							keys.forEach(function(key){
								tabs.append("li")
												.append("a")
													.attr("data-toggle", "tab")
													.attr("href", "#home")
													.style("border", "1px solid #ccc")
													.style("background-color", "#f1f1f1")
													.text(key); 
							});
						},
						updateDataViews: function(viewId, slaves){
							var self = this; 
							self.dataViews[viewId]['slaves']['cats'] = slaves[viewId]['cats'];
							self.dataViews[viewId]['slaves']['quants'] = slaves[viewId]['quants'];
							self.dataViews[viewId]['slaves']['data'] = slaves[viewId]['data'];
						},
						getSlaves: function(viewId){
							var self = this;
							return self.dataViews[viewId]['slaves'];
						},
						setupPopover: function(viewId){
							var self = this; 
							self.pop = d3.select("body").append("div")
											.attr("id", "pp"+viewId)
											.attr("class", "hidden");
							self.pop.append("div")
											.attr("class","popover-heading" )
											.text("Add/Remove Categorical Variables");
							var pbody = self.pop.append("div")
											.attr("class", "popover-body")
											.attr("id", "cat-popover"); 

							/*var tabvar = pbody.append("ul")
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
							*/
							var row = pbody.append("div")
											.attr("class", "row");

							var nvarselectdiv=	row.append("div")
												.attr("class", "col-xs-5");

							var nvarselect = nvarselectdiv.append("select")
												.attr("multiple", "multiple")
												.attr("name", "dbvars")
												.attr("id", "nvar-in"+viewId)												
												.style("vertical-align", "top")												
												.style("font-size", "9pt")
												.style("horizontal-align", "left")
												.style("max-width", "120px")
												.style("min-height", "230px")
												.style("margin-left",0);
												

							var butcol = row.append("div")
											.attr("class", "col-xs-2");
							var butRight = butcol.append("button")
									.attr("type", "button")
									.attr("class", "btn btn-block")
									.attr("id", "right-btn"+viewId)
									.style("min-width", "30px")
									.on("click", function(){
										
									});		


								butRight.append("i")
										.attr("class", "glyphicon glyphicon-chevron-right")
										.attr("max-width", "20px");
							var butLeft = butcol.append("button")
									.attr("type", "button")
									.attr("class", "btn btn-block")
									.attr("id", "left-btn"+viewId)
									.style("min-width", "30px")
									.on("click", function(){

									});										
								butLeft.append("i")
										.attr("class", "glyphicon glyphicon-chevron-left")
										.attr("max-width", "20px");
							var nvarselectOutDiv = row.append("div")
														.attr("class", "col-xs-5");
							var nvarselectOut = nvarselectOutDiv.append("select")
													.attr("multiple", "multiple")
													.attr("name", "selvars")														
													.attr("id", "nvar-out"+viewId)
													.style("vertical-align", "top")														
													.style("font-size", "9pt")
													.style("horizontal-align", "left")
													.style("max-width", "120px")
													.style("min-height", "230px")
													.style("margin-left",0);
													
							
							self.updateMultiSelects(viewId);

							$(document).on('click', '#right-btn'+viewId, function(){	
								moveItems("#nvar-in"+viewId, "#nvar-out"+viewId);								
							});
							
							$(document).on('click', '#left-btn'+viewId, function(){	
								moveItems("#nvar-out"+viewId, "#nvar-in"+viewId);
							});
						

							pbody.append("button")
								.attr("type", "submit")						
								.attr("class", "btn_vg_parse hide-vl")
								.text( "Update")
								.attr("id", "group-but"+viewId)
								.attr("disabled", "true")
								.style("horizontal-align", "center")
								.style("min-width", "300px")
								.style("margin-top", "20px");

							function moveItems(origin, dest) {
							    $(origin).find(':selected').appendTo(dest);		
							    document.getElementById("group-but"+viewId).disabled = false;					    
							}

							
							$(document).on('click', '#group-but'+viewId, function(){
								//////console.log($('#varsel'+viewId +' option:selected').val());
								//self.addGroup(viewId, $('#nvarsel'+viewId +' option:selected').val()); 
								var outcats = [];
								var outcatsel = $("#nvar-out"+viewId+" option").each(function(opt){
									var vv = $(this).val();
									outcats.push(vv);
								});		
								var cardCats = self.control.getCardCats(viewId);
									for(var iter = 0; iter < cardCats.length; iter++){
										var index = outcats.length-1;
										outcats.splice(index, 1);
									}
								var selectionSize = $('#nvar-out'+viewId).has('option').length; 
								if( selectionSize > 0 && outcats.length < 6 ) {						
									
									self.control.setCardCats(viewId, outcats);
									self.updateMultiSelects(viewId);
									self.cards[viewId].updateCats(outcats);
									self.popSettings.each(function () {
								        //if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
								            $(this).popover('hide');
								          //  return;
								        //}
								    });
								}
								else
									alert("[Invalid action] Please select at least one and at most five variables.");
							});

							$(document).on('click', '#quantity-but'+viewId, function(){
								var outQs = [];
								var movedItems = [];
								if(self.justMoved && self.justMoved[viewId]){
									self.justMoved[viewId].each(function(item){
										movedItems.push($(this).val()); 
									});
									console.log(movedItems); 
								}
								var inQsel = $("#qvar-in"+viewId+" option");
								var outQsel = $("#qvar-out"+viewId+" option").each(function(opt){
									var vv = $(this).val();
									if(outQs.indexOf(vv)<0 && movedItems.indexOf(vv)<0)
										outQs.push(vv);
								});								
								var cardQs = self.control.getCardQs(viewId);
								
								/*for(var iter = 0; iter < cardQs.length; iter++){
									var index = outQs.length-1;
									outQs.splice(index, 1);
								}*/
								
								
								self.control.setCardQs(viewId, outQs);
								self.updateQMultiSelects(viewId);
								self.cards[viewId].updateQs(outQs);
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
											.text("Add/Remove Quantiative Variables");
							var pbody2 = self.pop2.append("div")
											.attr("class", "popover-body")
											.attr("id", "q-popover"); 

							var qrow = pbody2.append("div")
											.attr("class", "row");

							var qvarselectdiv=	qrow.append("div")
												.attr("class", "col-xs-5");

							var qvarselect = qvarselectdiv.append("select")
												.attr("multiple", "multiple")
												.attr("name", "dbvars")
												.attr("id", "qvar-in"+viewId)												
												.style("vertical-align", "top")												
												.style("font-size", "9pt")
												.style("horizontal-align", "left")
												.style("max-width", "120px")
												.style("min-height", "230px")
												.style("margin-left",0);
												

							var qbutcol = qrow.append("div")
											.attr("class", "col-xs-2");
							var qbutRight = qbutcol.append("button")
									.attr("type", "button")
									.attr("class", "btn btn-block")
									.attr("id", "qright-btn"+viewId)
									.style("min-width", "30px");
									

								qbutRight.append("i")
										.attr("class", "glyphicon glyphicon-chevron-right")
										.attr("max-width", "20px");
							var qbutLeft = qbutcol.append("button")
									.attr("type", "button")
									.attr("class", "btn btn-block")
									.attr("id", "qleft-btn"+viewId)
									.style("min-width", "30px");
																			
								qbutLeft.append("i")
										.attr("class", "glyphicon glyphicon-chevron-left")
										.attr("max-width", "20px");
							var qvarselectOutDiv = qrow.append("div")
														.attr("class", "col-xs-5");
							var qvarselectOut = qvarselectOutDiv.append("select")
													.attr("multiple", "multiple")
													.attr("name", "selvars")														
													.attr("id", "qvar-out"+viewId)
													.style("vertical-align", "top")														
													.style("font-size", "9pt")
													.style("horizontal-align", "left")
													.style("max-width", "120px")
													.style("min-height", "230px")
													.style("margin-left",0);
													
							
							//self.updateMultiSelects(viewId);

							$(document).on('click', '#qright-btn'+viewId, function(){	
								moveItems("#qvar-in"+viewId, "#qvar-out"+viewId);
							});
							
							$(document).on('click', '#qleft-btn'+viewId, function(){
							    self.justMoved = {};
							    self.justMoved[viewId] = $("#qvar-out"+viewId).find(':selected');
								moveItems("#qvar-out"+viewId, "#qvar-in"+viewId);
							});
						

							pbody2.append("button")
								.attr("type", "submit")						
								.attr("class", "btn_vg_parse hide-vl")
								.text( "Update")
								.attr("id", "quantity-but"+viewId)
								.style("horizontal-align", "center")
								.style("min-width", "300px")
								.style("margin-top", "20px");


							self.pop3 = d3.select("body").append("div")
											.attr("id", "grantpp"+viewId)
											.attr("class", "hidden");
							self.pop3.append("div")
											.attr("class","popover-heading" )
											.text("Change Time View");
							var pbody3 = self.pop3.append("div")
											.attr("class", "popover-body")
											.attr("id", "time-popover"); 
							var psel = pbody3.append("select")
								//.attr("type", "submit")						
								.attr("id", "time-sel"+viewId)
								.style("horizontal-align", "center")
								.style("min-width", "300px")
								.style("margin-top", "20px");

							
							psel.append("option")
								.attr("value", "multiples")
								.text("Small Multiples"); 
							psel.append("option")
								.attr("value", "series")
								.text("Time Series");

							$(document).on('change', '#time-sel'+viewId, function(){
									//console.log(this.value);
									self.cards[viewId].updateTimeView(this.value); 
							});
							
							$(':not(#anything)').on('click', function (e) {
							    self.popSettings.each(function () {
							        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
							            $(this).popover('hide');
							            return;
							        }
							    });
							});
														
						},
						updateQMultiSelects: function(viewId){
							var self = this; 
							var cardQs = self.control.getCardQs(viewId);
							console.log(cardQs);

							var qvarselect = d3.select("#qvar-in"+viewId);
							var qvarselectOut = d3.select("#qvar-out"+viewId);
							//console.log(self.meta);
							qvarselect.selectAll("option").remove();
							qvarselectOut.selectAll("option").remove(); 
							var inobj = {},
								outobj = {};								

							for(var m = 0; m < self.meta.length; m++){
								if(self.meta[m]['fieldType'] === "q")
								{
									var newvar = self.meta[m]['fieldName'];
									if(cardQs.indexOf(newvar) < 0){
										if(self.control.variableInData(newvar) && !inobj[newvar]){
											inobj[newvar] = 1;
										qvarselect.append("option")
											.attr("class", "dbvar-options")
											.attr("value", newvar)
											.text(newvar)
											.style("font-size", "9pt");	
											}
										}
									else {
										if(!outobj[newvar]){
											outobj[newvar] = 1; 
											qvarselectOut.append("option")
												.attr("value", newvar)
												.attr("class","selvar-options")
												.text(newvar)
												.style("font-size", "9pt");
										}
							
									}
								}	
							}
							// append derived quantities to the rigt or left depending on whether they are displayed in tabs
							if(cardQs.constructor == Array){
								cardQs.forEach(function(cq){
									if(!outobj[cq]){
										outobj[cq] = 1;
										qvarselectOut.append("option")
												.attr("value", cq)
												.attr("class","selvar-options")
												.text(cq)
												.style("font-size", "9pt");
											}

									});
								}
							else{
								if(!outobj[cardQs]){
										outobj[cardQs] = 1; 
										qvarselectOut.append("option")
												.attr("value", cardQs)
												.attr("class","selvar-options")
												.text(cardQs)
												.style("font-size", "9pt");
									}
							}


						},
						updateMultiSelects: function(viewId){
							var self = this;
							var cardCats = self.control.getCardCats(viewId);
							var nvarselect = d3.select("#nvar-in"+viewId);
							var nvarselectOut = d3.select("#nvar-out"+viewId);
							var inobj = {},
								outobj = {};
							//console.log(self.meta);
							nvarselect.selectAll("option").remove();
							nvarselectOut.selectAll("option").remove(); 

							for(var m = 0; m < self.meta.length; m++){

								if(self.meta[m]['fieldType'] === "n" || self.meta[m]['fieldType'] === "o")
								{
									var newvar = self.meta[m]['fieldName'];									
									if(cardCats.indexOf(newvar) < 0){
										if(self.control.variableInData(newvar) && !inobj[newvar]){
											inobj[newvar] = 1;
											nvarselect.append("option")
												.attr("class", "dbvar-options")
												.attr("value", newvar)
												.text(newvar)
												.style("font-size", "9pt");	
										}
									}
									else if(!outobj[newvar]){
										outobj[newvar] = 1; 
										nvarselectOut.append("option")
											.attr("value", newvar)
											.attr("class","selvar-options")
											.text(newvar)
											.style("font-size", "9pt");
							
									}
								}	
							}

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
						getMetricById: function(id){
							return this.availMetrics[id]; 
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
							             
							                    if (event.target.matches('[data-toggle="popover"]') 
							                    	|| (event.target.matches('[class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se"]'))
							                    	|| (event.target.matches('[class="draw-area"]'))
							                    	|| (event.target.matches('[class="vis-element"]')) ) {
							                      return false;
							                      }
							                      if($(event.target).is("svg") || $(event.target).is("rect") || $(event.target).is("text") 
							                      	  || $(event.target).is("path"))
							                      	return false; 

							                      //console.log(event.target); 
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
							  //console.log($(item.getElement()).css('z-index')); 
							  //////console.log(item.getElement());
							  
							});

						},
						refreshGrid1x1: function(){
							var self = this; 
							self.grid.refreshItems().layout();	
							self.cards.forEach(function(card){
								if(!card.getExpansionState()){
									card.setExpansion(); 									
									}
									card.resizeVis(); 
								});
						},
						refreshGrid32x23: function(){
							var self = this; 
							self.grid.refreshItems().layout();	
							self.cards.forEach(function(card){
								 if(card.getExpansionState()){
									card.resetExpansion(); 									
									}
									card.resizeVis(); 
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
						drawCatBar: function(displayId, data, cat, levels, trellis) {
							var self = this;
							self.cards[displayId].drawCatBar(displayId, data, cat, levels, trellis);

						},
						setupControls: function(viewId){
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
						    }).on("click", function(){
						    	//console.log("HURRAH");
						    	//console.log($(this).attr("id")); 
						    	var id = $(this).attr("id");
						    	if(id === ("split-btn"+viewId))
						    		self.updateMultiSelects(viewId); 
						    	else if(id === ("axes-btn"+viewId))
						    		self.updateQMultiSelects(viewId); 
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