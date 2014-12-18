openerp.COMMCMDB.SelectCIRelationPage = function(instance) {
    var _t = instance.web._t,  
        _lt = instance.web._lt;   
    var QWeb = instance.web.qweb;   
  
    
    instance.COMMCMDB = instance.COMMCMDB || {};
    
    instance.COMMCMDB.SelectCIRelation = instance.web.Widget.extend({ // 自定义首页部件
    	template: "Custom",
    	toString:function(){
    		return "instance.COMMCMDB.SelectCIRelation";
    	},
        start: function() {
        	this.$el.height(400);
        	var areaHeight = this.$el.height();
        	this.searchbar = new instance.COMMCMDB.SearchBar(this,{x:55,y:18},"commcmdb.ci");
        	
        	this.searchview = new instance.COMMCMDB.SearchBarView(this,{
        				x:1,
        				y:25.2,
        				width:98.5,
        				is_allow_click:false,
        				on_close:function(){
        					
        				}},this.searchbar);
        	this.searchpage = new instance.COMMCMDB.SearchPage(this,{x:1,y:18},this.searchview);
        	this.searchpage.appendTo(this.$el);
        	this.searchview.appendTo(this.$el);
        	this.searchbar.appendTo(this.$el);

			     	
        	this.relation = new  instance.COMMCMDB.Many2OneSelection(this,{ height:22,width:20,x:12.5,y:5.5 },"commcmdb.ci");
        	this.relationlebel = new instance.COMMCMDB.Label(this,{ width:10,x:1,y:4.5 },"源CI");
        	this.relationlist = new instance.COMMCMDB.Many2OneUi(this,{areaHeight:areaHeight},this.relation);
        	this.relationlebel.appendTo(this.$el);
        	this.relation.appendTo(this.$el);
        	this.relationlist.appendTo(this.$el);

	     	
        	this.relation = new  instance.COMMCMDB.Many2OneSelection(this,{ height:22,width:20,x:54.5,y:5.5 },"commcmdb.relation");
        	this.relationlebel = new instance.COMMCMDB.Label(this,{ width:10,x:40,y:4.5 },"关系");
        	this.relationlist = new instance.COMMCMDB.Many2OneUi(this,{areaHeight:areaHeight},this.relation);
        	this.relationlebel.appendTo(this.$el);
        	this.relation.appendTo(this.$el);
        	this.relationlist.appendTo(this.$el);

/**
			this.sourceCI = new instance.COMMCMDB.Many2OneSelection(this,{height:22,width:20,x:12.5,y:5.5},"commcmdb.ci.relation");	
			this.sourceLebel = new instance.COMMCMDB.Label(this,{width:10,x:1,y:4.5},"源CI");
			this.sourceList = new instance.COMMCMDB.Many2OneUi(this,{areaHeight:areaHeight},this.sourceci_id);
			this.sourceLebel.appendTo(this.$el);
			this.sourceCI.appendTo(this.$el);
			this.sourceList.appendTo(this.$el);

*/     	
        	var self = this;
        	
        	var okbtn = new instance.COMMCMDB.DialogButton(this.getParent().$buttons,"确定",function(){
        		var templateIds = self.searchview.get_ids();
        		var relationId = self.relation.get_id();
        		var relationName = self.relation.get_name();
        		self.client.selectTemplateIds = templateIds;
        		self.client.relationId = relationId;
        		self.client.relationName = relationName;
        		self.getParent().destroy();
        	});
        	okbtn.appendTo(this.getParent().$buttons);
        	this.getParent().$el.click(function(evt){
        		if($(evt.target).parents(".many2oneui").length === 0)
        		{
        			self.$el.find('.many2oneui ul').hide();
        		} 
        	});

        },
        init: function (parent, action) {
            this._super(parent);
            this.client = action.params.client;//表示的是谁调用了这个action，用于和调用者进行数据的传递
            this.context = action.context;
        },
    });
    
    
    
    
}
