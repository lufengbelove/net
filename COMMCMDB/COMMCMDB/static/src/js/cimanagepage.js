/*CI管理页面,comm.js是公用控件的js文件，
 * citemplatepage.js页面是ci模板管理页面（有树的页面），
 * 你参照它，将ci管理页面做出来(高级搜索条件功能先不做)，
 * 模板文件也请新建一个模板XML文件,不要和我的混合
 * 有不懂的就问*/
openerp.COMMCMDB.CIManagePage = function(instance) { 
    var _t = instance.web._t,  
        _lt = instance.web._lt;   
    var QWeb = instance.web.qweb;   
    instance.COMMCMDB = instance.COMMCMDB || {};
    	                                                  	        		          
	instance.COMMCMDB.CIManage = instance.web.Widget.extend({
		template:"CIManagePage",
		toString:function(){
			return "instance.COMMCMDB.CIManage";
		},
        start: function() {
        	this._init_ctitree();
        	this._init_template_list();
        	this._init_search_bar();
        	
        },
        init: function (parent) {
            this._super(parent);
            this.ctimodel = "commcmdb.c";
            
        },
        _init_search_bar:function(){


			var numLebel = new instance.COMMCMDB.Label(this,{ width:5,x:3,y:15 },"CI编号");
        	var numInput = new instance.COMMCMDB.Input(this,{width:10,x:10,y:15});
        	numLebel.appendTo(this.$el.find('.search_option'));
        	numInput.appendTo(this.$el.find('.search_option'));
        	this.$numInput = numInput;
			
			
			var nameLebel = new instance.COMMCMDB.Label(this,{ width:5,x:25,y:15},"CI名称");
        	var nameInput = new instance.COMMCMDB.Input(this,{width:10,x:32,y:15});
        	nameLebel.appendTo(this.$el.find('.search_option'));
        	nameInput.appendTo(this.$el.find('.search_option'));
        	this.$nameInput = nameInput;

			var ipLebel = new instance.COMMCMDB.Label(this,{ width:5,x:45,y:15},"IP地址");
        	var ipInput = new instance.COMMCMDB.Input(this,{width:10,x:52,y:15});
        	ipLebel.appendTo(this.$el.find('.search_option'));
        	ipInput.appendTo(this.$el.find('.search_option'));
        	this.$ipInput = ipInput;

			var runLebel = new instance.COMMCMDB.Label(this,{ width:10,x:65,y:15},"运行状态");
        	var runInput = new instance.COMMCMDB.RunState(this,{width:10,x:77,y:15});
        	runLebel.appendTo(this.$el.find('.search_option'));
        	runInput.appendTo(this.$el.find('.search_option'));
        	this.$runInput = runInput;

        	var area = this.$el.find('.search_option');
        	var areaHeight= area.height();
        	var c = new  instance.COMMCMDB.Many2OneSelection(this,{id:this.id, value:this.name,width:10,x:10,y:40 },"commcmdb.c");
        	var cLebel = new instance.COMMCMDB.Label(this,{width:5,x:3,y:40 },"C分类");
        	var cList = new instance.COMMCMDB.Many2OneUi(this,{areaHeight:areaHeight},c);
        	c.appendTo(area);
        	cLebel.appendTo(area);
        	cList.appendTo(area);
        	this.$c = c;
        	var t = new  instance.COMMCMDB.Many2OneSelection(this,{id:this.id, value:this.name,width:10,x:32,y:40},"commcmdb.t",c,"pId");
        	var tLebel = new instance.COMMCMDB.Label(this,{ width:5,x:25,y:40 },"T分类");
        	var tList = new instance.COMMCMDB.Many2OneUi(this,{areaHeight:areaHeight},t);
        	t.appendTo(this.$el.find('.search_option'));
        	tLebel.appendTo(this.$el.find('.search_option'));
        	tList.appendTo(this.$el.find('.search_option'));
        	this.$t = t;
        	
        	var i = new  instance.COMMCMDB.Many2OneSelection(this,{id:this.id, value:this.name,width:10,x:52,y:40},"commcmdb.i",t,"pId");
        	var iLebel = new instance.COMMCMDB.Label(this,{ width:5,x:45,y:40},"I分类");
        	var iList = new instance.COMMCMDB.Many2OneUi(this,{areaHeight:areaHeight},i);
        	i.appendTo(this.$el.find('.search_option'));
        	iLebel.appendTo(this.$el.find('.search_option'));
        	iList.appendTo(this.$el.find('.search_option'));
        	this.$i = i;

			var sourceLebel = new instance.COMMCMDB.Label(this,{ width:10,x:65,y:40},"来源");
        	var sourceInput = new instance.COMMCMDB.SourceFrom(this,{width:10,x:77,y:40});
        	sourceLebel.appendTo(this.$el.find('.search_option'));
        	sourceInput.appendTo(this.$el.find('.search_option'));
        	this.$sourceInput = sourceInput;

			var startLebel = new instance.COMMCMDB.Label(this,{ width:8,x:1,y:65 },"开始时间");
        	var startInput = new instance.COMMCMDB.Input(this,{width:10,x:10,y:65});
        	startLebel.appendTo(this.$el.find('.search_option'));
        	startInput.appendTo(this.$el.find('.search_option'));
        	this.$startInput = startInput;
			
			
			var endLebel = new instance.COMMCMDB.Label(this,{ width:8,x:22,y:65},"结束时间");
        	var endInput = new instance.COMMCMDB.Input(this,{width:10,x:32,y:65});
        	endLebel.appendTo(this.$el.find('.search_option'));
        	endInput.appendTo(this.$el.find('.search_option'));
        	this.$endInput = endInput;


        	
        	//        	
        	var searchBtn = new instance.COMMCMDB.Button(this,{x:92,y:75,width:8},"查询",function(){
				var domain = [];
        		var cId = self.$c.get_id();
        		var tId = self.$t.get_id();
        		var iId = self.$i.get_id();
				var cicode = self.$numInput.get_val();
				var ciname = self.$nameInput.get_val();
				var ciip = self.$ipInput.get_val();
				var cisource = self.$("#source_input").find("option:selected").text();
				var cirunstate = self.$("#run_state").find("option:selected").text();
        	//	var templateName = self.$nameInput.get_val();
        		if(cId != '')domain.push(['c_id','=',cId]);
        		if(tId != '')domain.push(['t_id','=',tId]);
        		if(iId != '')domain.push(['i_id','=',iId]);
				if(cicode != '')domain.push(['code','ilike',cicode]);
				if(ciname != '')domain.push(['name','ilike',ciname]);
				if(cisource != '')domain.push(['sourcefrom','ilike',cisource]);
				if(cirunstate != '')domain.push(['status','=',cirunstate]);
				if(ciip != '')domain.push(['ip','ilike',ciip]);
        	//	if(templateName != '')domain.push(['name','ilike',templateName]);        		
        		self.do_search(domain);
        	});

        	searchBtn.appendTo(this.$el.find('.search_option'));

			/*
        	var area = this.$el.find('.search_option');
        	var areaHeight= area.height();
        	var c = new  instance.COMMCMDB.Many2OneSelection(this,{id:this.id, value:this.name,width:20,x:10,y:18 },"commcmdb.c");
        	var cLebel = new instance.COMMCMDB.Label(this,{width:5,x:3,y:15 },"C分类");
        	var cList = new instance.COMMCMDB.Many2OneUi(this,{areaHeight:areaHeight},c);
        	c.appendTo(area);
        	cLebel.appendTo(area);
        	cList.appendTo(area);
        	this.$c = c;
        	
        	var t = new  instance.COMMCMDB.Many2OneSelection(this,{id:this.id, value:this.name,width:20,x:42,y:18},"commcmdb.t",c,"pId");
        	var tLebel = new instance.COMMCMDB.Label(this,{ width:5,x:35,y:15 },"T分类");
        	var tList = new instance.COMMCMDB.Many2OneUi(this,{areaHeight:areaHeight},t);
        	t.appendTo(this.$el.find('.search_option'));
        	tLebel.appendTo(this.$el.find('.search_option'));
        	tList.appendTo(this.$el.find('.search_option'));
        	this.$t = t;
        	
        	var i = new  instance.COMMCMDB.Many2OneSelection(this,{id:this.id, value:this.name,width:20,x:74,y:18},"commcmdb.i",t,"pId");
        	var iLebel = new instance.COMMCMDB.Label(this,{ width:5,x:67,y:15 },"T分类");
        	var iList = new instance.COMMCMDB.Many2OneUi(this,{areaHeight:areaHeight},i);
        	i.appendTo(this.$el.find('.search_option'));
        	iLebel.appendTo(this.$el.find('.search_option'));
        	iList.appendTo(this.$el.find('.search_option'));
        	this.$i = i;
        	
        	
        	var nameLebel = new instance.COMMCMDB.Label(this,{ width:5,x:3,y:57 },"模板名称");
        	var nameInput = new instance.COMMCMDB.Input(this,{width:20,x:10,y:60});
        	
        	nameLebel.appendTo(this.$el.find('.search_option'));
        	nameInput.appendTo(this.$el.find('.search_option'));
        	this.$nameInput = nameInput;


        	var searchBtn = new instance.COMMCMDB.Button(this,{x:92,y:75,width:8},"搜索",function(){
        		var domain = [];
        		var cId = self.$c.get_id();
        		var tId = self.$t.get_id();
        		var iId = self.$i.get_id();
        		var templateName = self.$nameInput.get_val();
        		if(cId != '')domain.push(['c_id','=',cId]);
        		if(tId != '')domain.push(['t_id','=',tId]);
        		if(iId != '')domain.push(['i_id','=',iId]);
        		if(templateName != '')domain.push(['name','ilike',templateName]);        		
        		self.do_search(domain);
        	});
        	searchBtn.appendTo(this.$el.find('.search_option'));

			*/
////        	
        	var self = this;
        	this.getParent().$el.click(function(evt){
        		if($(evt.target).parents(".many2oneui").length === 0)
        		{
        			self.$el.find('.many2oneui ul').hide();
        		} 
        	});

        	
        },

	   _remove_ci:function(){
			var searchbar = new instance.COMMCMDB.SearchBar(this,{x:50,y:0},"commcmdb.ci");
        	var searchview = new instance.COMMCMDB.SearchBarView(this,{
        				x:3,
        				y:16,
        				layout_type:'static',
        				width:98.5,
        				is_allow_click:true,
        				on_close:function(){
        					self.reload_list();
        				}},searchbar);
			alert(searchview);
			var selectedIds = self.$searchview.get_ids();
        	self.remove_templates(selectedIds);


		},

       _init_template_list:function(){
        	
        	var self = this;
        	var searchBtn = new instance.COMMCMDB.Button(this,{x:3,y:30,width:9},"创建",function(){
        		alert('应跳创建模板页面');
        	});
        	searchBtn.appendTo(this.$el.find('.listview .btnarea'));
        	
			
					/*
        	var self = this;
        	var searchBtn = new instance.COMMCMDB.Button(this,{x:13,y:30,width:8},"删除",function(){
        		//self.$searchview.set_limit(5);
        		var selectedIds = self.$searchview.get_ids();
        		self.remove_templates(selectedIds);
        	});
        	searchBtn.appendTo(this.$el.find('.listview .btnarea'));
        	*/

        	var pageLabel = new instance.COMMCMDB.PageLabel(this,{x:3,y:25});
        	pageLabel.appendTo(this.$el.find('.listview .pagearea'));
        	this.$pageLabel = pageLabel;
//      	
        	
        	var searchbar = new instance.COMMCMDB.SearchBar(this,{x:50,y:0},"commcmdb.ci");
        	var searchview = new instance.COMMCMDB.SearchBarView(this,{
        				x:3,
        				y:16,
        				layout_type:'static',
        				width:98.5,
        				is_allow_click:true,
        				on_close:function(){
        					self.reload_list();
        				}},searchbar);

        	searchview.appendTo(this.$el.find('.listview .listarea'));
        	searchbar.appendTo(this.$el.find('.listview .btnarea'));
                	
        	this.$searchview = searchview;
        	this.$searchbar = searchbar;

        	$("#delete_data").click(function(){
				var selectedIds = self.$searchview.get_ids();
				self.remove_templates(selectedIds);

			});	
        	
			$("#import_data").click(function(){
				var selectedIds = self.$searchview.get_ids();
				alert(selectedIds);

			});

			$("#export_data").click(function(){
				var selectedIds = self.$searchview.get_ids();
				alert(selectedIds);

			});
//        	
        	searchbar.hide();
        	var paginationSelection = new instance.COMMCMDB.PaginationSelection(this,{x:89.4,y:30,width:10});
        	paginationSelection.appendTo(this.$el.find('.listview .btnarea'));
        	this.$paginationSelection = paginationSelection;
//        	
        	var pagination = new instance.COMMCMDB.Pagination(this,{x:65,y:8,layout_type:'static',});
        	pagination.appendTo(this.$el.find('.listview .pagearea'));
        	this.$pagination = pagination;
        	
        },
        remove_templates:function(templateId){
        	var self = this;
        	var model = new instance.web.Model("commcmdb.ci");
			model.call("unlink", [templateId], {}).then(function(result) {
				if(typeof(result) === 'boolean' && result){
					self.do_search([]);
				}
			});
        },
        reload_list:function(){
        	for(var i=0;i <this.getChildren().length; i++){
    			var widget = this.getChildren()[i];
    			widget.destroy();
    			i--;
    		}
    		this._init_template_list();
        },
        set_cti:function(nodepath){
        	var c = this.$c;
        	var t = this.$t;
        	var i = this.$i;
        	var domain = [];
        	c.set_null_state();
        	t.set_null_state();
        	i.set_null_state();
        	for(var j = 0; j<nodepath.length; j++ ){
    			var node = this.$tree.getNodeByTId(nodepath[j]);
    			if(node.type === 'C') {
    				c.set_id(node.id);
    				c.set_name(node.name);
    				domain.push(['c_id','=',node.id]);
    			}
    			else if(node.type === 'T') {
    				t.set_id(node.id);
    				t.set_name(node.getParentNode().name+"/"+node.name);
    				domain.push(['t_id','=',node.id]);
    			}
    			else if(node.type === 'I') {
    				i.set_id(node.id);
    				i.set_name(node.getParentNode().getParentNode().name+"/"+
    						node.getParentNode().name+"/"+node.name);
    				domain.push(['i_id','=',node.id]);
    			}
    		}
        	this.do_search(domain);
        },
        do_search: function(domain) {
        	var pagination = this.$pagination;
        	if(pagination)pagination.set_need_reload(true);
            var searchbar = this.$searchbar;
            searchbar.searchview.trigger('search_data', [domain], [], []);
        },
        /*保存点击过的节点的展开路径，保存在cookie中*/
        save_selectednode_tid_path:function(treeNode){
        	var grandpaNode;
			var parentNode = treeNode.getParentNode();
			var path;
			if(parentNode){
				if(( grandpaNode = parentNode.getParentNode() )){
					path = [grandpaNode.tId,parentNode.tId,treeNode.tId];
				}
				else path = [parentNode.tId,treeNode.tId];    	        					
			}
			else path = [treeNode.tId];
			this.session.set_cookie('selected_tid_path',path);
        },
        /*
         * 每次刷新前，展开之前点击过的节点，并选中它
         * */
        expand_selected_node:function(path){
    		for(var i = 0; i<path.length; i++ ){
    			var node = this.$tree.getNodeByTId(path[i]);
    			if(i != (path.length-1) )this.$tree.expandNode(node, true, false, true);
    			else this.$tree.selectNode(node);
    		}
        },
        /* 若之前没有点击任何节点，则展开默认的节点,
         * 第一个C的第一个T的第一个I节点 */
        expand_default_node:function(){
        	var tree = this.$tree;
        	var cNodes;
        	var tNodes;
        	var iNodes;
        	if( !(cNodes = tree.getNodes()) )return;
        	tree.expandNode(cNodes[0]);
        	if( !(tNodes = cNodes[0].children) )return;
        	tree.expandNode(tNodes[0]);
        	if( !(iNodes = tNodes[0].children) )return;
        	tree.selectNode(iNodes[0]);
        	this.do_search(iNodes[0]);
        },
        _init_ctitree:function(){
        	var selectedPath = this.session.get_cookie('selected_tid_path');
        	var self = this;
        	var model = new instance.web.Model("commcmdb.c");    		
    			model.call("get_tree_data", [], {}).then(function(result) {
    				var setting = {
    	        			data: {
    	        				simpleData: {
    	        					enable: true,
    	        					idKey: "tid",
    	        				}
    	        			},
    	        			callback: {
    	        				onClick:function(event, treeId, treeNode){
    	        					self.save_selectednode_tid_path(treeNode);
    	        					var selected_path = self.session.get_cookie('selected_tid_path');
    	        					self.set_cti(selected_path);

    	        				},
    	        				beforeRemove:function(treeId,treeNode)
    	        				{
    	        					var alert_message = '确认要删除该节点么?';
    	        					if(confirm(alert_message))
    	        					{
    	        						var modelname = '';
    	        						var nodeid = treeNode.id;
    	        						if(treeNode.type === 'C')modelname = "commcmdb.c";
    	        						if(treeNode.type === 'T')modelname = "commcmdb.t";
    	        						if(treeNode.type === 'I')modelname = "commcmdb.i";
    	        						var model = new instance.web.Model(modelname);
    	        						model.call("unlink", [[nodeid]], {}).then(function(result) {
    	        		    				if(typeof(result) === 'boolean' && result){
    	        		    					self._init_ctitree();
    	        		    				}
    	        		    			});
    	        					}
    	        					return false;
    	        				},
    	        			}
    	        		};
    	        	self.$tree = $.fn.zTree.init(self.$el.find("#ctitree"), setting, result);
    	        	if(selectedPath){
    	        		self.expand_selected_node(selectedPath);
    	        	}
    	        	else self.expand_default_node();
    			});
		},
	});
    
}
