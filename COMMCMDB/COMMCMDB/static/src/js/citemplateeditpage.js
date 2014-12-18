openerp.COMMCMDB.CITemplateEditPage = function(instance) { 
    var _t = instance.web._t,  
        _lt = instance.web._lt;   
    var QWeb = instance.web.qweb;   
  
    
    instance.COMMCMDB = instance.COMMCMDB || {};
    
//    { "title": "属性名" },
//    { "title": "英文名" },
//    { "title": "数据类型" },
//    { "title": "分组", "class": "center" },
//    { "title": "默认值",  },
//    { "title": "是否清空",  }
    
    instance.COMMCMDB.Attributes = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "Attributes",
    	toString:function(){
    		return "instance.COMMCMDB.Attributes";
    	},
        init: function (parent,option,onclose) {
        	this._super(parent,option);
        	this.selectedAttrIds = [];//保存的是已经选择过的属性id
        	this.selectAttrIds = [];//保存的是刚刚选择的属性id
        },
        get_attributes:function(){
        	var result = [];
        	var nodes = this.dataTable.rows('.selfattr').nodes();
        	for(var i = 0;i<nodes.length;i++){
        		var ciattrgroup_id = $(nodes[i]).find('td:eq(3)').attr('ciattrgroup_id') === '0' ? 
        									false :Number($(nodes[i]).find('td:eq(3)').attr('ciattrgroup_id')) ;
        		var ciattribute_id = Number ( $(nodes[i]).find('td:eq(0)').attr('ciattribute_id') );
        		result.push([0,false,{
        			'ciattribute_id':ciattribute_id,
        			'ciattrgroup_id':ciattrgroup_id
        		}]);
        	}
        	return result;
        },
        add_attr:function(selectAttrIds){
        	if(selectAttrIds && selectAttrIds.length > 0){       		
	        	var self = this; 
	        	var model = new instance.web.Model('commcmdb.ciattribute');
	        	model.call("read", [selectAttrIds,["name","englishname","datatype","defaultvalue","is_clear"]],{} ).then(function(result) {
	        		if(result){
	        			//self.dataTable.clear().draw();
	        			
	        			var selectAttrs = [];
	                    for (var i = 0; i < result.length; i++) {
	                        var obj = result[i];
	                        obj.attrname = typeof(obj.name) != 'boolean' ? obj.name : null;
	                        obj.englishname = typeof(obj.englishname) != 'boolean' ? obj.englishname : null;
	                        obj.datatype = typeof(obj.datatype) != 'boolean' ? obj.datatype : null;
	                        obj.ciattrgroup = null;
	                        obj.defaultvalue = typeof(obj.defaultvalue) != 'boolean' ? obj.defaultvalue : null;
	                        obj.is_clear = obj.is_clear ? '是':'否';
	                        var newLine = self.dataTable.row.add( [
	                                             obj.attrname,
	                                             obj.englishname,
	                                             obj.datatype,
	                                             obj.ciattrgroup,
	                                             obj.defaultvalue,
	                                             obj.is_clear
	                                         ] ).draw();
	                        var index = newLine.index();
	                        var $rowNode = $(self.dataTable.row(index).node());
	                        $rowNode.addClass('selfattr');
	                        $rowNode.find('td:eq(3)').attr('ciattrgroup_id',0);
	                        $rowNode.find('td:eq(0)').attr('ciattribute_id',obj.id);
	                    }
	                    self.selectAttrIds = [];
	        		}
				});
        	}
        },
        start:function(){
    		this.set_position();
    		var self = this;
    		this.$el.html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="attributes"></table>' );
    		var dataSet = [];
    		var _on_close = function(){
            		self.add_attr(self.selectAttrIds);
    		};
    		this.dataTable = this.$el.find('#attributes').DataTable( {
    	        "data": dataSet,
    	        "fnInitComplete": function () {
    	        	self.$el.find("div.dataTables_length").css('margin-bottom','10px');
    	        	self.$el.find("div.dataTables_length").prepend('<button class="btn add pull-left" style="margin-right:5px;" type="button">添加</button>');
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
    	            { "title": "默认值",  },
    	            { "title": "是否清空",  },
    	            {
    	            	"title":"操作",
    	                data: null,
    	                className: "center",
    	                defaultContent: '<a href="javascript:void(0)" class="editor_edit">Edit</a> / <a href="javascript:void(0)" class="editor_remove">Delete</a>'
    	            }
    	        ]
    	    } );
    		
    		this.$el.find('#attributes').on('click', 'a.editor_remove', function (e) {
    			self.dataTable.row($(this).parent().parent()).remove().draw();
//    	        e.preventDefault();
//    	 
//    	        editor
//    	            .message( 'Are you sure you wish to remove this record?' )
//    	            .buttons( { "label": "Delete", "fn": function () { editor.submit() } } )
//    	            .remove( $(this).closest('tr') );
    	    });
    	},
    });
    
    instance.COMMCMDB.Relations = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "Relations",
    	toString:function(){
    		return "instance.COMMCMDB.Relations";
    	},
    	get_relations:function(){
    		var result = [];
        	var nodes = this.dataTable.rows('.selfrelation').nodes();
        	for(var i = 0;i<nodes.length;i++){

        		var targettemplate_id = $(nodes[i]).find('td:eq(1)').attr('targettemplate_id');
        		var relation_id = Number ( $(nodes[i]).find('td:eq(2)').attr('relation_id') );
        		result.push([0,false,{
        			'targetcitemplate_id':Number(targettemplate_id),
        			'relation_id':Number(relation_id)
        		}]);
        	}
        	return result;
        },
        init: function (parent,option) {
        	this._super(parent,option);
        	this.selectedTemplateIds = [];//保存的是已经选择过的关系id
        	this.selectTemplateIds = [];//保存的是刚刚选择的关系id
        },
        add_relation:function(templateIds){
        	var self = this;        	
        	var model = new instance.web.Model('commcmdb.citemplate');
        	model.call("read", [templateIds,["name"]],{} ).then(function(result) {
        		if(result){
        			//self.dataTable.clear().draw();;
                    for (var i = 0; i < result.length; i++) {
                        var obj = result[i];
                        obj.targetTemplateName = typeof(obj.name) != 'boolean' ? obj.name : null;
                        var newLine = self.dataTable.row.add([
                                                              '本模板',
                                                              obj.targetTemplateName,
                                                              self.selectRelationName
                                                  		 	]).draw();
              	        var index = newLine.index();
              	        var $rowNode = $(self.dataTable.row(index).node());
              	        $rowNode.find('td:eq(1)').attr('targettemplate_id',obj.id);
              	        $rowNode.find('td:eq(2)').attr('relation_id',self.selectRelationId);
              	        $rowNode.addClass('selfrelation');
                    }
                    self.selectTemplateIds = [];
        		}
			});
        },
        start:function(){
        	var self = this;
    		this.set_position();
    		self.$el.find("div.dataTables_length").css('margin-bottom','10px');
    		this.$el.html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="relations"></table>' );
    		var dataSet = [];
    		var _on_close = function(){
            		self.add_relation(self.selectTemplateIds);
    		};
    		this.dataTable = this.$el.find('#relations').DataTable( {
    	        "data": dataSet,
    	        "fnInitComplete": function () {
    	        	self.$el.find("div.dataTables_length").css('margin-bottom','10px');
    	        	self.$el.find("div.dataTables_length").prepend('<button class="btn add pull-left" style="margin-right:5px;" type="button">添加</button>');
    	        	self.$el.find("button.add").click(function(){
    	        		self.do_action({
    	        			tag:'custom.selectrelation',
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
    	            { "title": "源模板" },
    	            { "title": "目标模板" },
    	            { "title": "关系" },
    	            {
    	            	"title":"操作",
    	                data: null,
    	                className: "center",
    	                defaultContent: '<a href="" class="editor_edit">Edit</a> / <a href="" class="editor_remove">Delete</a>'
    	            }
    	        ]
    	    } );
    	},
    });
    
    
    /*ci模板维护页面（有树的页面）
     * */
    instance.COMMCMDB.CITemplateEdit = instance.web.Widget.extend({ // 自定义首页部件
    	template: "CustomEditPage",
    	toString:function(){
    		return "instance.COMMCMDB.CITemplateEdit";
    	},
    	return_template_page:function(){
    		this.do_action({   					            			
                type: 'ir.actions.client',
                tag:'custom.citemplate',
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
    		var attributes = this.$attributesDiv.get_attributes();
    		var relations = this.$relationsDiv.get_relations();
    		var args = [{
	    					"parent_id":parent_id,
	    					"name":name,
	    					"c_id":c_id,
	    					"t_id":t_id,
	    					"i_id":i_id,
	    					"description":description,
	    					"attributes":attributes,
	    					"relations":relations
    					}];
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
    			self.$attributesDiv.dataTable.clear().draw();
    			if(result){    				
                     for (var i = 0; i < result.length; i++) {
                         var obj = result[i];
                         obj.ciattribute_id = typeof(obj.ciattribute_id) != 'boolean' ? obj.ciattribute_id[1] : null;
                         obj.englishname = typeof(obj.englishname) != 'boolean' ? obj.englishname : null;
                         obj.datatype = typeof(obj.datatype) != 'boolean' ? obj.datatype : null;
                         obj.ciattrgroup = typeof(obj.ciattrgroup_id) != 'boolean' ? obj.ciattrgroup_id[1] : null;
                         obj.defaultvalue = typeof(obj.defaultvalue) != 'boolean' ? obj.defaultvalue : null;
                         obj.is_clear = obj.is_clear ? '是':'否';
                        
                         var newLine = self.$attributesDiv.dataTable.row.add([
                                                               obj.ciattribute_id,
                                                		 	   obj.englishname,
                                                		 	   obj.datatype,
                                                		 	   obj.ciattrgroup,
                                                		 	   obj.defaultvalue,
                                                		 	   obj.is_clear
                                                		 	]).draw();
                         var index = newLine.index();
                         var $rowNode = $(self.$attributesDiv.dataTable.row(index).node());
	                     $rowNode.find('td:eq(6)').html('');
                     }
    			}
    		});
    	},
    	add_parent_relation:function(pId){
    		var self = this; 
    		this.get_parent_relation_detail(pId).done(function(result){
    			self.$relationsDiv.dataTable.clear().draw();
    			if(result){    				
                     for (var i = 0; i < result.length; i++) {
                         var obj = result[i];
                         obj.sourcecitemplate_name = typeof(obj.sourcecitemplate_id) != 'boolean' ? obj.sourcecitemplate_id[1] : null;
                         obj.targetcitemplate_name = typeof(obj.targetcitemplate_id) != 'boolean' ? obj.targetcitemplate_id[1] : null;
                         obj.relation_name = typeof(obj.relation_id) != 'boolean' ? obj.relation_id[1] : null;
                         var newLine = self.$relationsDiv.dataTable.row.add([
                                                               obj.sourcecitemplate_name,
                                                               obj.targetcitemplate_name,
                                                               obj.relation_name,
                                                 		 	]).draw();
                         var index = newLine.index();
                         var $rowNode = $(self.$relationsDiv.dataTable.row(index).node());
	                     $rowNode.find('td:eq(3)').html('');
                     }
    			}
    		});
    	},
        start: function() {
        	var self = this;
        	this.$edit_header_area = this.$el.find('.edit_header');
        	this.$edit_form_first_area = this.$el.find('.edit_content .edit_form .first');
        	this.$edit_form_second_area = this.$el.find('.edit_content .edit_form .second');
        	var areaHeight = this.$edit_form_first_area.height();
        	var aTag = new instance.COMMCMDB.aTag(this,{x:0.78,y:12},"CI Template",function(){
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
        	
        	this.$nameLebel = new instance.COMMCMDB.Label(this,{ width:16.5,x:1.8,y:4.5 },"模板名称");
        	this.$nameInput = new instance.COMMCMDB.Input(this,{width:30.4,x:19.3,y:5.5});
        	this.$nameLebel.appendTo(this.$edit_form_first_area);
        	this.$nameInput.appendTo(this.$edit_form_first_area);
        	
        	this.$c = new  instance.COMMCMDB.Many2OneSelection(this,{width:30.4,x:68,y:5.5 },"commcmdb.c",null,null,true);
        	this.$cLebel = new instance.COMMCMDB.Label(this,{width:16.5,x:50.6,y:4.5 },"C分类");
        	this.$cList = new instance.COMMCMDB.Many2OneUi(this,{areaHeight:areaHeight},this.$c);
        	this.$cLebel.appendTo(this.$edit_form_first_area);
        	this.$c.appendTo(this.$edit_form_first_area);
        	this.$cList.appendTo(this.$edit_form_first_area);
        	this.$c.$input.attr('cti_type','c');
        	
        	
        	this.$t = new  instance.COMMCMDB.Many2OneSelection(this,{width:30.4,x:19.3,y:18 },"commcmdb.t",this.$c,"pId");
        	this.$tLebel = new instance.COMMCMDB.Label(this,{width:16.5,x:1.8,y:16 },"T分类");
        	this.$tList = new instance.COMMCMDB.Many2OneUi(this,{areaHeight:areaHeight},this.$t);
        	this.$tLebel.appendTo(this.$edit_form_first_area);
        	this.$t.appendTo(this.$edit_form_first_area);
        	this.$tList.appendTo(this.$edit_form_first_area);
        	this.$t.$input.attr('cti_type','t');
        	
        	this.$i = new  instance.COMMCMDB.Many2OneSelection(this,{width:30.4,x:68,y:18 },"commcmdb.i",this.$t,"pId");
        	this.$iLebel = new instance.COMMCMDB.Label(this,{width:16.5,x:50.6,y:16 },"I分类");
        	this.$iList = new instance.COMMCMDB.Many2OneUi(this,{areaHeight:areaHeight},this.$i);
        	this.$iLebel.appendTo(this.$edit_form_first_area);
        	this.$i.appendTo(this.$edit_form_first_area);
        	this.$iList.appendTo(this.$edit_form_first_area);
        	
        	this.$el.find('input[cti_type]').on('id_change',function(e,id){
        		var ctiType = $(this).attr('cti_type');
        		var cti = self.$parent.ctiPath[ctiType]; 
        		var pathNumber = self.$parent.ctiPath.number;
        		if(!cti || ( (cti === 't') && pathNumber >= 1))return;
        		if(Number(cti) !== Number(id))self.$parent.set_null_state();
        	});
        	
        	this.$parent = new  instance.COMMCMDB.Many2OneSelection(this,{width:30.4,x:19.3,y:31.5 },"commcmdb.citemplate");
        	this.$parentLebel = new instance.COMMCMDB.Label(this,{width:16.5,x:1.8,y:27.5},"父模板");
        	this.$parentList = new instance.COMMCMDB.Many2OneUi(this,{areaHeight:areaHeight},this.$parent);
        	this.$parentLebel.appendTo(this.$edit_form_first_area);
        	this.$parent.appendTo(this.$edit_form_first_area);
        	this.$parentList.appendTo(this.$edit_form_first_area);
        	this.$parent.ctiPath = {number:0};
        	this.$parent.$input.on('id_change',function(e,id){
        		self.add_parent_attr(id);
        		self.add_parent_relation(id);
//        		self.cti_set_null_state();
//        		self.model.call("get_parent_cti", [],{parentId:id} ).then(function(result) {
//        			var obj = result[0];
//        			if(obj){
//	        			var c_id = obj.c_id === null ? false:obj.c_id;
//	        			var t_id = obj.t_id === null ? false:obj.t_id;
//	        			var i_id = obj.i_id === null ? false:obj.i_id;
//	        			var c_name = obj.c_name === null ? false:obj.c_name;
//	        			var t_name = obj.t_name === null ? false:obj.t_name;
//	        			var i_name = obj.i_name === null ? false:obj.i_name;
//	        			if(!c_id)return;        			
//	        			self.$parent.ctiPath['c'] = c_id;
//	        			self.$parent.ctiPath.number = 1;
//	        			self.$c.set_id(c_id);
//	        			self.$c.set_name(c_name);
//	        			if(!t_id)return;
//	        			self.$parent.ctiPath['t'] = t_id;
//	        			self.$parent.ctiPath.number = 2;
//	        			self.$t.set_id(t_id);
//	        			self.$t.set_name(c_name+'/'+t_name);
//	        			if(!i_id)return;
//	        			self.$i.set_id(i_id);
//	        			self.$i.set_name(c_name+'/'+t_name+'/'+i_name);
//        			}
//    			});
        	});  
        	


        	this.$isDefaultLabel = new instance.COMMCMDB.Label(this,{width:16.5,x:50.6,y:28.5 },"默认模板");
        	this.$isDefaultLabel.appendTo(this.$edit_form_first_area);
        	
        	this.$isDefault = new instance.COMMCMDB.Bool(this,{width:16.5,x:68,y:31.5 });
        	this.$isDefault.appendTo(this.$edit_form_first_area);
        	
        	this.$descriptionLabel = new instance.COMMCMDB.Label(this,{x:1.8,y:40,fontSize:'18px',color:'#7D9FCE'},"描述",function(){});
        	this.$descriptionLabel.appendTo(this.$edit_form_first_area);
        	
        	this.$description = new instance.COMMCMDB.TextArea(this,{height:36,width:95,x:1.8,y:55});
        	this.$description.appendTo(this.$edit_form_first_area);
        	
        	
        	
        	
        	this.$nootBook = new instance.COMMCMDB.Notebook(this,{height:18,width:100,x:0,y:0});
        	this.$nootBook.appendTo(this.$edit_form_second_area);
        	
        	this.$attributesDiv = new instance.COMMCMDB.Attributes(this,{height:42,width:95,x:1.8,y:20.1,layout_type:'static',});
        	this.$attributesDiv.appendTo(this.$edit_form_second_area);
        	
        	this.$relationsDiv = new instance.COMMCMDB.Relations(this,{height:42,width:95,layout_type:'static'},this._on_add_relation_close);
        	this.$relationsDiv.appendTo(this.$edit_form_second_area);
        	
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
    
    
}