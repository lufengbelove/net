openerp.COMMCMDB.SelectAttrPage = function(instance) { 
    var _t = instance.web._t,  
        _lt = instance.web._lt;   
    var QWeb = instance.web.qweb;   
  
    
    instance.COMMCMDB = instance.COMMCMDB || {};
    
    instance.COMMCMDB.SelectAttr = instance.web.Widget.extend({ // 自定义首页部件
    	template: "Custom",
    	toString:function(){
    		return "instance.COMMCMDB.SelectAttr";
    	},
        start: function() {
        	this.$el.height(400);
        	
        	var searchbar = new instance.COMMCMDB.SearchBar(this,{x:55,y:1},"commcmdb.ciattribute");
        	
        	var searchview = new instance.COMMCMDB.SearchBarView(this,{
        				x:1,
        				y:7.2,
        				width:98.5,
        				is_allow_click:false,
        				on_close:function(){
        					
        				}},searchbar);
        	var searchpage = new instance.COMMCMDB.SearchPage(this,{x:1,y:1},searchview);
        	searchpage.appendTo(this.$el);
        	searchview.appendTo(this.$el);
        	searchbar.appendTo(this.$el);
        
        
        	var self = this;
        	
        	var okbtn = new instance.COMMCMDB.DialogButton(this.getParent().$buttons,"确定",function(){
        		//self.client.
        		var attIds = searchview.get_ids();
        		self.client.selectAttrIds = attIds;
        		self.getParent().destroy();
        	});
        	okbtn.appendTo(this.getParent().$buttons);


        },
        init: function (parent, action) {
            this._super(parent);
            this.client = action.params.client;//表示的是谁调用了这个action，用于和调用者进行数据的传递
            this.context = action.context;
        },
    });
    
    
    
    
}