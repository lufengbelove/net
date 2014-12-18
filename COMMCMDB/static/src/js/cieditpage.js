openerp.COMMCMDB.CIEditPage = function(instance) { 
    var _t = instance.web._t,  
        _lt = instance.web._lt;   
    var QWeb = instance.web.qweb;   
  
  	instance.COMMCMDB.CIEdit = instance.web.Widget.extend({ // 自定义首页部件
    	template: "CIEditPage",
    	toString:function(){
    		return "instance.COMMCMDB.CIEdit";
    	},
    	return_template_page:function(){
    		this.do_action({   					            			
                type: 'ir.actions.client',
                tag:'custom.cimanageedit',
                target: 'current',
    		});
    	},
    	createRecord:function(){
    		var self = this;
    		var name = this.$nameInput.get_val();
    		var c_id = this.$c.get_id();
    		var t_id = this.$t.get_id();
    		var i_id = this.$i.get_id();
    		var parent_id = this.$parent.get_id();
    		var is_default = this.$isDefault.get_bool();
    		var description = this.$description.get_text();
    		
    		var args = [{"parent_id":parent_id,
    					"name":name,
    					"c_id":c_id,
    					"t_id":t_id,
    					"i_id":i_id,
    					"description":description,
    					"attributes":[[6,false,[]]],
    					"relations":[]}];
    		this.model.call("create", args, {}).then(function(result) {
    			if(typeof(result) === 'number' && result && result > 0){
    				self.return_template_page();
    			}
			});
    	},
    	saveRecord:function(){
    		
    	},
    	cti_set_null_state:function(){
    		this.$c.set_null_state();
			this.$t.set_null_state();
			this.$i.set_null_state();
    	},
    	get_parent_attr_relation_ids:function(id){
    		var self = this;
    		return this.model.call("read", [[Number(id)],["relations","attributes"]],{} ).then(function(result) {
				var obj = result[0];
				return { pAttrIds:obj.attributes, pRelationIds:obj.relations};
			});
    	},
    	get_parent_attr_detail:function(pId){
    		var self = this;    		
    		return this.get_parent_attr_relation_ids(pId).then(function(obj){
    			if(obj && obj.pAttrIds.length>0){
    				return new instance.web.Model("commcmdb.citemplate.attribute")
    												.call("read",[obj.pAttrIds,["ciattribute_id",
    												                            "englishname",
    												                            "datatype",
    												                            "ciattrgroup_id",
    												                            "defaultvalue",
    												                            "is_clear"]],{});
    			}
    		});
    	},
    	get_parent_relation_detail:function(pId){
    		var self = this;    		
    		return this.get_parent_attr_relation_ids(pId).then(function(obj){
    			if(obj && obj.pRelationIds.length>0){
    				return new instance.web.Model("commcmdb.citemplate.relation")
    												.call("read",[obj.pRelationIds,
    												              			   ["sourcecitemplate_id",
    												                            "targetcitemplate_id",
    												                            "relation_id",]],{});
    			}
    		});
    	},
    	add_parent_attr:function(pId){
    		var self = this;    		
    		this.get_parent_attr_detail(pId).done(function(result){
    			self.$attributesDiv.dataTable.fnClearTable();
    			if(result){    				
                     var parentAttrs = [];
                     for (var i = 0; i < result.length; i++) {
                         var obj = result[i];
                         obj.ciattribute_id = typeof(obj.ciattribute_id) != 'boolean' ? obj.ciattribute_id[1] : null;
                         obj.englishname = typeof(obj.englishname) != 'boolean' ? obj.englishname : null;
                         obj.datatype = typeof(obj.datatype) != 'boolean' ? obj.datatype : null;
                         obj.ciattrgroup = typeof(obj.ciattrgroup_id) != 'boolean' ? obj.ciattrgroup_id[1] : null;
                         obj.defaultvalue = typeof(obj.defaultvalue) != 'boolean' ? obj.defaultvalue : null;
                         obj.is_clear = obj.is_clear ? '是':'否';
                         parentAttrs.push([
                                       obj.ciattribute_id,
                        		 	   obj.englishname,
                        		 	   obj.datatype,
                        		 	   obj.ciattrgroup,
                        		 	   obj.defaultvalue,
                        		 	   obj.is_clear
                        		 	]);
                     }
                     self.$attributesDiv.dataTable.fnAddData(parentAttrs);
                     self.$attributesDiv.set_parentAttr(parentAttrs);
    			}
    		});
    	},
    	add_parent_relation:function(pId){
    		var self = this; 
    		this.get_parent_relation_detail(pId).done(function(result){
    			self.$relationsDiv.dataTable.fnClearTable();
    			if(result){    				
                     var parentRelations = [];
                     for (var i = 0; i < result.length; i++) {
                         var obj = result[i];
                         obj.sourcecitemplate_id = typeof(obj.sourcecitemplate_id) != 'boolean' ? obj.sourcecitemplate_id[1] : null;
                         obj.targetcitemplate_id = typeof(obj.targetcitemplate_id) != 'boolean' ? obj.targetcitemplate_id[1] : null;
                         obj.relation_id = typeof(obj.relation_id) != 'boolean' ? obj.relation_id[1] : null;
                         parentRelations.push([
                                       obj.sourcecitemplate_id,
                        		 	   obj.targetcitemplate_id,
                        		 	   obj.relation_id,
                        		 	]);
                     }
                     self.$relationsDiv.dataTable.fnAddData(parentRelations);
                     self.$relationsDiv.set_parentRelations(parentRelations);
    			}
    		});
    	},
        start: function() {
        	var self = this;
        	this.$edit_header_area = this.$el.find('.edit_header');
        	this.$edit_form_area = this.$el.find('.edit_content .edit_form');
        	var areaHeight = this.$edit_form_area.height();
        	var aTag = new instance.COMMCMDB.aTag(this,{x:0.78,y:12},"CI管理",function(){
        		aTag.$el.append('<span class="oe_fade">/</span>');
        		aTag.$el.append('<span class="oe_breadcrumb_item">new</span>');
        	});
        	this.$aTag = aTag;
        	this.$aTag.appendTo(this.$edit_header_area);
        	
        	this.$saveBtn = new instance.COMMCMDB.Button(this,{x:0.78,y:60,width:8},"Save",function(){
        		if(self.edittype === 'create')self.createRecord();
        		else self.saveRecord();
        	});
        	this.$saveBtn.appendTo(this.$edit_header_area);
        	
        	this.$discardBtn = new instance.COMMCMDB.Button(this,{x:6.5,y:60,width:8},"Discard",function(){
        		self.return_template_page();
        	});
        	this.$discardBtn.appendTo(this.$edit_header_area);
        	
        	this.$codeLebel = new instance.COMMCMDB.Label(this,{ width:16.5,x:1.8,y:4.5 },"CI编号");
        	this.$codeInput = new instance.COMMCMDB.Input(this,{width:30.4,x:19.3,y:5.5});
        	this.$codeLebel.appendTo(this.$edit_form_area);
        	this.$codeInput.appendTo(this.$edit_form_area);
        	
		
			this.$nameLebel = new instance.COMMCMDB.Label(this,{ width:16.5,x:50,y:4.5 },"CI名称");
        	this.$nameInput = new instance.COMMCMDB.Input(this,{width:30.4,x:67,y:5.5});
        	this.$nameLebel.appendTo(this.$edit_form_area);
        	this.$nameInput.appendTo(this.$edit_form_area);





        	this.$c = new  instance.COMMCMDB.Many2OneSelection(this,{width:30.4,x:19.3,y:12.7 },"commcmdb.c");
        	this.$cLebel = new instance.COMMCMDB.Label(this,{width:16.5,x:1.8,y:11.7 },"C分类");
        	this.$cList = new instance.COMMCMDB.Many2OneUi(this,{areaHeight:areaHeight},this.$c);
        	this.$cLebel.appendTo(this.$edit_form_area);
        	this.$c.appendTo(this.$edit_form_area);
        	this.$cList.appendTo(this.$edit_form_area);
        	this.$c.$input.attr('cti_type','c');
        	
        	
        	this.$t = new  instance.COMMCMDB.Many2OneSelection(this,{width:30.4,x:67,y:12.7 },"commcmdb.t",this.$c,"pId");
        	this.$tLebel = new instance.COMMCMDB.Label(this,{width:16.5,x:50,y:11.7 },"T分类");
        	this.$tList = new instance.COMMCMDB.Many2OneUi(this,{areaHeight:areaHeight},this.$t);
        	this.$tLebel.appendTo(this.$edit_form_area);
        	this.$t.appendTo(this.$edit_form_area);
        	this.$tList.appendTo(this.$edit_form_area);
        	this.$t.$input.attr('cti_type','t');
        	
        	this.$i = new  instance.COMMCMDB.Many2OneSelection(this,{width:30.4,x:19.3,y:18.9 },"commcmdb.i",this.$t,"pId");
        	this.$iLebel = new instance.COMMCMDB.Label(this,{width:16.5,x:1.8,y:17.9 },"I分类");
        	this.$iList = new instance.COMMCMDB.Many2OneUi(this,{areaHeight:areaHeight},this.$i);
        	this.$iLebel.appendTo(this.$edit_form_area);
        	this.$i.appendTo(this.$edit_form_area);
        	this.$iList.appendTo(this.$edit_form_area);
        	


			var runLebel = new instance.COMMCMDB.Label(this,{ width:16.5,x:50,y:17.9},"运行状态");
        	var runInput = new instance.COMMCMDB.RunState(this,{width:10,x:67,y:18.9});
        	runLebel.appendTo(this.$edit_form_area);
        	runInput.appendTo(this.$edit_form_area);



			var sourceLebel = new instance.COMMCMDB.Label(this,{ width:16.5,x:1.8,y:24.1},"来源");
        	var sourceInput = new instance.COMMCMDB.SourceFrom(this,{width:30.4,x:19.3,y:25.1});
        	sourceLebel.appendTo(this.$edit_form_area);
        	sourceInput.appendTo(this.$edit_form_area);

		
			this.$descriptionLabel = new instance.COMMCMDB.Label(this,{x:1.8,y:29.3},"备注",function(){});
        	this.$descriptionLabel.appendTo(this.$edit_form_area);
        	
        	this.$description = new instance.COMMCMDB.TextArea(this,{height:12,width:77,x:18.3,y:32.1});
        	this.$description.appendTo(this.$edit_form_area);



        	
        	
        	this.$nootBook = new instance.COMMCMDB.Notebook2(this,{height:18,width:100,x:0,y:46.1});
        	this.$nootBook.appendTo(this.$edit_form_area);


			this.$relativeProcess = new instance.COMMCMDB.RelationProcess(this,{height:42,width:95,x:1.8,y:56.1});
			this.$relativeProcess.appendTo(this.$edit_form_area);

        	this.$attributesDiv = new instance.COMMCMDB.CIEditAttributes(this,{height:42,width:95,x:1.8,y:56.1});
        	this.$attributesDiv.appendTo(this.$edit_form_area);
        	
        	this.$relationsDiv = new instance.COMMCMDB.WorkRelation(this,{height:42,width:95,x:1.8,y:56.1},this._on_add_relation_close);
        	this.$relationsDiv.appendTo(this.$edit_form_area);

			this.$ciexpendDiv = new instance.COMMCMDB.CIAttachment(this,{height:42,width:95,x:1.8,y:56.1});
        	this.$ciexpendDiv.appendTo(this.$edit_form_area);

        	
        	this.$nootBook.show_default_div();

        	this.getParent().$el.click(function(evt){
        		if($(evt.target).parents(".many2oneui").length === 0)
        		{
        			self.$el.find('.many2oneui ul').hide();
        		} 
        	});
        	

        },
//        _on_add_attr_close:function(){
//        	alert('close');
//        },
//        _on_add_relation_close:function(){
//        	
//        },
        init: function (parent,params) {
            this._super(parent);
            this.model = new instance.web.Model("commcmdb.citemplate");
            this.edittype = params.params.edittype || 'edit';
        },
       
    });
    
//ci管理中关联流程的界面显示
    instance.COMMCMDB.RelationProcess = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "RelationProcess",
    	toString:function(){
    		return "instance.COMMCMDB.RelationProcess";
    	},
        init: function (parent,option) {
        	this._super(parent,option);
        	this.parentAttrsRelations = [];
        	this.selectedTemplateIds = [];//保存的是已经选择过的关系id
        	this.selectTemplateIds = [];//保存的是刚刚选择的关系id
        },
        
        refresh_dataTable:function(){
        	var self = this;        	
        	var model = new instance.web.Model('commcmdb.ci.process');
        	model.call("read", [this.selectTemplateIds,["code","work_status","process_category","relation_time","planning"]],{} ).then(function(result) {
        		if(result){
        			//self.dataTable.fnClearTable();
        			var selectProcess = [];
                    for (var i = 0; i < result.length; i++) {
                        var obj = result[i];
                        obj.code = typeof(obj.code) != 'boolean' ? obj.code : null;
                        obj.work_status = typeof(obj.work_status) != 'boolean' ? obj.work_status : null;

                        obj.process_category= typeof(obj.process_category) != 'boolean' ? obj.process_category : null;
                        obj.relation_time = typeof(obj.relation_time) != 'boolean' ? obj.relation_time : null;
                        obj.planning = typeof(obj.planning) != 'boolean' ? obj.planning : null;

                        selectProcess.push([
                                   '本模板',
                                   obj.code,
                                   obj.work_status,
								   obj.process_category,
								   obj.relation_time,
								   obj.planning,
                       		 	]);
                    }
                    var relations = self.parentAttrsRelations.concat(selectProcess);
                    self.selectedTemplateIds =  self.selectedTemplateIds.concat(self.selectTemplateIds);
                    self.selectTemplateIds = [];
                    self.dataTable.fnAddData(relations);
        		}
			});
        },
        start:function(){
        	var self = this;
    		this.set_position();
    		self.$el.find("div.dataTables_length").css('margin-bottom','10px');
    		this.$el.html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="workcodes"></table>' );
    		var dataSet = [];
    		var _on_close = function(){
            	if(self.selectTemplateIds && self.selectTemplateIds.length > 0){
            		self.refresh_dataTable();
            	}
    		};
    		this.dataTable = this.$el.find('#workcodes').dataTable( {
    	        "data": dataSet,
    	        "fnInitComplete": function () {
    	        	self.$el.find("div.dataTables_length").css('margin-bottom','10px');
  //  	        	self.$el.find("div.dataTables_length").prepend('<button class="btn add pull-left" style="margin-right:5px;" type="button">添加</button>');
    	        	self.$el.find("button.add").click(function(){
    	        		self.do_action({
    	        			tag:'custom.cimanageedit',
	                        type: 'ir.actions.client',
	                        target: 'new',
	                        name:'创建工单流程',
	                        params:{client:self}
	            		},{
	            			on_close:_on_close
	                      });
    	            });
    	        },
    	        "columns": [
    	            { "title": "工单号" },
    	            { "title": "工单状态" },
    	            { "title": "流程分类" },
					{ "title": "关联时间" },
					{ "title": "规划人" },
    	        ]
    	    } );
    	},
    });

//ci管理中关系的界面显示
 	 instance.COMMCMDB.WorkRelation = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "WorkRelation",
    	toString:function(){
    		return "instance.COMMCMDB.WorkRelation";
    	},
        init: function (parent,option) {
        	this._super(parent,option);
        	this.parentAttrsRelations = [];
        	this.selectedTemplateIds = [];//保存的是已经选择过的关系id
        	this.selectTemplateIds = [];//保存的是刚刚选择的关系id
        },
        set_parentRelations:function(parentRelations){
        	this.parentAttrsRelations = parentRelations;
        },
        refresh_dataTable:function(){
        	var self = this;        	
        	var model = new instance.web.Model('commcmdb.ci');
        	model.call("read", [this.selectTemplateIds,["name"]],{} ).then(function(result) {
        		if(result){
        			//self.dataTable.fnClearTable();
        			var selectRelations = [];
                    for (var i = 0; i < result.length; i++) {
                        var obj = result[i];
                        obj.name = typeof(obj.name) != 'boolean' ? obj.name : null;

                        selectRelations.push([
                                   '本模板',
                                   obj.name,
                                   self.relationName 
                       		 	]);
                    }
                    var relations = self.parentAttrsRelations.concat(selectRelations);
                    self.selectedTemplateIds =  self.selectedTemplateIds.concat(self.selectTemplateIds);
                    self.selectTemplateIds = [];
                    self.dataTable.fnAddData(relations);
        		}
			});
        },
        start:function(){
        	var self = this;
    		this.set_position();
    		self.$el.find("div.dataTables_length").css('margin-bottom','10px');
    		this.$el.html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="cirelations"></table>' );
    		var dataSet = [];
    		var _on_close = function(){
            	if(self.selectTemplateIds && self.selectTemplateIds.length > 0){
            		self.refresh_dataTable();
            	}
    		};
    		this.dataTable = this.$el.find('#cirelations').dataTable( {
    	        "data": dataSet,
    	        "fnInitComplete": function () {
    	        	self.$el.find("div.dataTables_length").css('margin-bottom','10px');
    	        	self.$el.find("div.dataTables_length").prepend('<button class="btn add pull-left" style="margin-right:5px;" type="button">创建</button>');
    	        	self.$el.find("button.add").click(function(){
    	        		self.do_action({
    	        			tag:'custom.selcirelation',
	                        type: 'ir.actions.client',
	                        target: 'new',
	                        name:'创建关系',
	                        params:{client:self}
	            		},{
	            			on_close:_on_close
	                      });
    	            });
    	        },
    	        "columns": [
    	            { "title": "源CI" },
    	            { "title": "目标CI" },
    	            { "title": "关系" },
    	        ]
    	    } );
    	},
    });

//ci管理中 扩展属性的界面显示
	instance.COMMCMDB.CIEditAttributes = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "CIEditAttributes",
    	toString:function(){
    		return "instance.COMMCMDB.CIEditAttributes";
    	},
        init: function (parent,option,onclose) {
        	this._super(parent,option);
        	this.parentAttrs = [];
        	this.selectedAttrIds = [];//保存的是已经选择过的属性id
        	this.selectAttrIds = [];//保存的是刚刚选择的属性id
        },
        refresh_dataTable:function(){
        	var self = this;        	
        	var model = new instance.web.Model('commcmdb.ciattribute');
        	model.call("read", [this.selectAttrIds,["name","englishname","datatype","defaultvalue","attrgroup_id"]],{} ).then(function(result) {
        		if(result){
        			//self.dataTable.fnClearTable();
        			var selectAttrs = [];
                    for (var i = 0; i < result.length; i++) {
                        var obj = result[i];
                        obj.attrname = typeof(obj.name) != 'boolean' ? obj.name : null;
                        obj.englishname = typeof(obj.englishname) != 'boolean' ? obj.englishname : null;
                        obj.datatype = typeof(obj.datatype) != 'boolean' ? obj.datatype : null;
                        obj.defaultvalue = typeof(obj.defaultvalue) != 'boolean' ? obj.defaultvalue : null;
                        obj.attrgroup_id = typeof(obj.attrgroup_id) != 'boolean' ? obj.attrgroup_id : null;
                        selectAttrs.push([
                                   obj.attrname,
                       		 	   obj.englishname,
                       		 	   obj.datatype,
                       		 	   obj.defaultvalue,
                       		 	   obj.attrgroup_id,
                       		 	]);
                    }
                    //var attrs = self.parentAttrs.concat(selectAttrs);
                    self.selectedAttrIds.concat(self.selectAttrIds);
                    self.selectAttrIds = [];
                    self.dataTable.fnAddData(selectAttrs);
        		}
//				var obj = result[0];
//				return { pAttrIds:obj.attributes, pRelationIds:obj.relations};
			});
        },
        set_parentAttr:function(parentAttrs){
        	this.parentAttrs = parentAttrs;
        },
        start:function(){
    		this.set_position();
    		var self = this;
    		this.$el.html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="ciattributes"></table>' );
    		var dataSet = [];
    		var _on_close = function(){
            	if(self.selectAttrIds && self.selectAttrIds.length > 0){
            		self.refresh_dataTable();
            	}
    		};


			self.$el.find("div.dataTables_length").css('margin-bottom','10px');
    	    self.$el.find("#ciattributes").prepend('<button class="btn add pull-left" style="margin-right:5px;" type="button">创建</button>');

			
			var paginationSelection = new instance.COMMCMDB.PaginationSelection(this,{x:10,y:0});
        	paginationSelection.appendTo(this.$el.find('#ciattributes'));
        	this.$paginationSelection = paginationSelection;


			var searchbar = new instance.COMMCMDB.SearchBar(this,{width:20,x:80,y:0},"commcmdb.ci.expendattr");
        	var searchview = new instance.COMMCMDB.SearchBarView(this,{
        				x:0,
        				y:12,
        				layout_type:'absolute',
        				width:100,
        				is_allow_click:true,
        				on_close:function(){
        					self.reload_list();
        				}},searchbar);

        	searchview.appendTo(this.$el.find('#ciattributes'));
        	searchbar.appendTo(this.$el.find('#ciattributes'));
	
        	this.$searchview = searchview;
        	this.$searchbar = searchbar;

        	
        	var pageLabel = new instance.COMMCMDB.PageLabel(this,{x:0,y:85});
        	pageLabel.appendTo(this.$el.find('#ciattributes'));
        	this.$pageLabel = pageLabel;

			var pagination = new instance.COMMCMDB.Pagination(this,{x:65,y:82,});
        	pagination.appendTo(this.$el.find('#ciattributes'));
        	this.$pagination = pagination;


        		//	searchbar.show();
/*
    		this.dataTable = this.$el.find('#ciattributes').dataTable( {
    	        "data": dataSet,
    	        "fnInitComplete": function () {
    	        	self.$el.find("div.dataTables_length").css('margin-bottom','10px');
    	        	self.$el.find("div.dataTables_length").prepend('<button class="btn add pull-left" style="margin-right:5px;" type="button">编辑</button>');
    	        	self.$el.find("button.add").click(function(){
						
    	        		self.do_action({
    	        			tag:'custom.selectattr',
	                        type: 'ir.actions.client',
	                        target: 'new',
	                        name:'添加扩展属性',
	                        params:{client:self}
	            		},{
	            			on_close:_on_close
	                      });
						  

    	            });
    	        },
    	        "columns": [
    	            { "title": "属性名" },
    	            { "title": "英文名" },
    	            { "title": "数据类型" },
    	            { "title": "分组", "class": "center" },
    	            { "title": "值",  },
    	        ]
    	    } );
			*/
    	},
    });
    
//ci管理中附件的界面显示
 	 instance.COMMCMDB.CIAttachment = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "CIAttachment",
    	toString:function(){
    		return "instance.COMMCMDB.CIAttachment";
    	},
        init: function (parent,option) {
        	this._super(parent,option);
        	this.parentAttrsRelations = [];
        	this.selectedTemplateIds = [];//保存的是已经选择过的关系id
        	this.selectTemplateIds = [];//保存的是刚刚选择的关系id
        },
        set_parentRelations:function(parentRelations){
        	this.parentAttrsRelations = parentRelations;
        },
        refresh_dataTable:function(){
        	var self = this;        	
        	var model = new instance.web.Model('ir.attachment');
        	model.call("read", [this.selectTemplateIds,["name","user_id","create_date"]],{} ).then(function(result) {
        		if(result){
        			//self.dataTable.fnClearTable();
        			var selectRelations = [];
                    for (var i = 0; i < result.length; i++) {
                        var obj = result[i];
                        obj.name = typeof(obj.name) != 'boolean' ? obj.name : null;
                        obj.user_id = typeof(obj.user_id) != 'boolean' ? obj.user_id : null;
                        obj.create_date = typeof(obj.name) != 'boolean' ? obj.create_date : null;

                        selectRelations.push([
                                   obj.name,
                                   obj.user_id,
								   obj.create_date,
                       		 	]);
                    }
                    var relations = self.parentAttrsRelations.concat(selectRelations);
                    self.selectedTemplateIds =  self.selectedTemplateIds.concat(self.selectTemplateIds);
                    self.selectTemplateIds = [];
                    self.dataTable.fnAddData(relations);
        		}
			});
        },
        start:function(){
        	var self = this;
    		this.set_position();
    		self.$el.find("div.dataTables_length").css('margin-bottom','10px');
    		this.$el.html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="ciattachments"></table>' );
    		var dataSet = [];
    		var _on_close = function(){
            	if(self.selectTemplateIds && self.selectTemplateIds.length > 0){
            		self.refresh_dataTable();
            	}
    		};

    	   

    		this.dataTable = this.$el.find('#ciattachments').dataTable( {
    	        "data": dataSet,
    	        "fnInitComplete": function () {
    	        	self.$el.find("div.dataTables_length").css('margin-bottom','10px');
    	        	self.$el.find("div.dataTables_length").prepend('<button class="btn add pull-left" style="margin-right:5px;" type="button">创建</button>');
    	        	self.$el.find("button.add").click(function(){
    	        		self.do_action({
    	        			tag:'custom.ciexpendedit',
	                        type: 'ir.actions.client',
	                        target: 'new',
	                        name:'创建关系',
	                        params:{client:self}
	            		},{
	            			on_close:_on_close
	                      });
    	            });
    	        },
    	        "columns": [
    	            { "title": "附件名" },
    	            { "title": "上传者" },
    	            { "title": "上传时间" },
    	        ]
    	    } );
    	},
    });
	
}
