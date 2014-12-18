openerp.COMMCMDB.CreateRelationPage = function(instance) { 
    var _t = instance.web._t,  
        _lt = instance.web._lt;   
    var QWeb = instance.web.qweb;   
  
    
    instance.COMMCMDB = instance.COMMCMDB || {};
    
    instance.COMMCMDB.CreateRelation = instance.web.Widget.extend({ // 自定义首页部件
    	template: "Custom",
    	toString:function(){
    		return "instance.COMMCMDB.CreateRelationPage";
    	},
        start: function() {
        	this.$el.height(400);
        	
        	var citemplate = new  instance.COMMCMDB.Many2OneSelection(this,{ height:22,width:250,x:174,y:30 },"commcmdb.citemplate");
        	var citemplatelebel = new instance.COMMCMDB.Label(this,{ height:22,width:150,x:15,y:26 },"源模板");
        	var citemplatelist = new instance.COMMCMDB.Many2OneUi(this,{ height:280 },citemplate);
        	citemplate.appendTo(this.$el);
        	citemplatelebel.appendTo(this.$el);
        	citemplatelist.appendTo(this.$el);
        	
        	var relation = new  instance.COMMCMDB.Many2OneSelection(this,{ height:22,width:250,x:604,y:30 },"commcmdb.relation");
        	var relationlebel = new instance.COMMCMDB.Label(this,{ height:22,width:150,x:445,y:26 },"关系名");
        	var relationlist = new instance.COMMCMDB.Many2OneUi(this,{ height:280 },relation);
        	relation.appendTo(this.$el);
        	relationlebel.appendTo(this.$el);
        	relationlist.appendTo(this.$el);
        	
        	var searchbar = new instance.COMMCMDB.SearchBar(this,{x:460,y:80},"commcmdb.citemplate");
        	var searchview = new instance.COMMCMDB.SearchBarView(this,{x:10,y:130,width:"97%"},searchbar);
        	var searchpage = new instance.COMMCMDB.SearchPage(this,{x:780,y:105},searchview);

        	searchpage.appendTo(this.$el);
        	searchview.appendTo(this.$el);
        	searchbar.appendTo(this.$el);
        	
        	var self = this;
        	this.getParent().$el.click(function(evt){
        		if($(evt.target).parents(".many2oneui").length === 0)
        		{
        			self.$el.find('.many2oneui ul').hide();
        		} 
        	});
        	
        	var okbtn = new instance.COMMCMDB.DialogButton(this.getParent().$buttons,"确定",function(){
            	var relation_id = relation.get_id();
            	var sourcecitemplate_id = citemplate.get_id();
            	var targetcitemplate_ids = searchview.get_ids();
                var model = new instance.web.Model("commcmdb.citemplate");     
                model.call("create_relations", [], 
                			{sourcecitemplate_id:sourcecitemplate_id,
                			 relation_id:relation_id,
                			 template_ids:targetcitemplate_ids}).then(function(result) {
                				 self.getParent().destroy();	 
                });
        	});
        	okbtn.appendTo(this.getParent().$buttons);


        },
        init: function (parent, action) {
            this._super(parent);
            this.context = action.context;
        },
    });
    
    
    
    
}