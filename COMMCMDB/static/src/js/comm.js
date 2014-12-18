
function copyArray(array){
	var newArray = []
	for(var v in array){
		newArray.push(v);
	}
	return newArray;
}

function printObj(obj){
	for(var i in obj){
		alert(i+":"+obj[i]);
	}
}

function synchronized(fn) {
    var fn_mutex = new $.Mutex();
    return function () {
        var obj = this;
        var args = _.toArray(arguments);
        return fn_mutex.exec(function () {
            if (obj.isDestroyed()) { return $.when(); }
            return fn.apply(obj, args)
        });
    };
}

openerp.COMMCMDB = function(instance) {

    var _t = instance.web._t,  
        _lt = instance.web._lt;   
    var QWeb = instance.web.qweb;   
  
    instance.COMMCMDB = instance.COMMCMDB || {};
    
    
    /* 所有继承这个类的控件默认都是以屏幕左上角为(0,0)点来进行绝对定位的，弹出框是以弹出框左上角为(0,0)点
     * 可在构造函数中设置长宽高以及绝对定位时的left和top(都是百分比，为了自适应)
     * 如果在绝对定位时要改变标点，请在父的<div>中加上style="position:relative;"属性
     * 加了之后就是以父的<div>的左上角为(0,0)点
     */
    instance.COMMCMDB.CommonWidget = instance.web.Widget.extend({ // 自定义首页部件
    	toString:function(){
    		return "instance.COMMCMDB.CommonWidget";
    	},
    	
    	init: function (parent,option) {
            this._super(parent);
            this.width = option.width;
            this.height = option.height; 
            this.x = option.x;
            this.y = option.y;
            this.layout_type = option.layout_type || 'absolute';
        },

        set_position:function(){
        	var self = this;
        	this.$el.css({
        		"position":this.layout_type,
            	"width":self.width+'%',
            	"height":self.height+'%',
            	"left":self.x+'%',
            	"top":self.y+'%',            		  
            });
        },
    });
    
    
    /* input控件
     */
    instance.COMMCMDB.Input = instance.COMMCMDB.CommonWidget.extend({
    	template: 'Input',
    	toString:function(){
    		return "instance.COMMCMDB.Input";
    	},
    	init:function(parent,option){
    		this._super(parent,option);
    	},
    	start:function(){
    		this.set_position();
    		this.$input = this.$el.find('input');
    	},
    	get_val:function(){
    		return this.$input.val();
    	}
    });
    
    
    /* 模仿openerp的针对于many2one类型的字段写的控件，下拉列表显示出这个字段的名称列表
     * 下拉列表(instance.COMMCMDB.Many2OneUi)也是个自定义的控件，需要和本控件绑定起来,可以搜索，有待优化
     * 初始化参数：
     * model:model名,例如要显示C类的下拉列表，则model名就是py文件中定义的commcmdb.c
     * constraint_many2oneSelection:也是本类的实例,表示本字段的值是受制于哪个model，比如T类应该受制于我所选的C类
     * constraintField:在py文件中和我所受制的对象有关系的那个字段
     */
    instance.COMMCMDB.Many2OneSelection = instance.COMMCMDB.CommonWidget.extend({
    	template: 'Many2OneSelection',
    	toString:function(){
    		return "instance.COMMCMDB.Many2OneSelection";
    	},
    	params:{
			"name":"",
			"args":[["id","not in",[]]],
			"operator":"ilike",
			"limit":8
    	},
    	set_null_state:function(){
    		this.id = 0;
    		this.$input.attr('id',0);
    		this.$input.val('');
    	},
    	init:function(parent,option,model,
    			constraint_many2oneSelection,constraintField,disable = false){
    		this._super(parent,option);
    		this.params.context = parent.context;
    		this.id = option.id || 0;
    		this.value = option.value || '';
    		this.model = model;
    		this.constraint = constraint_many2oneSelection || null;
    		this.constraintField = constraintField || null;
    		this.disable = disable;
    		if(this.constraint)this.constraint.set_next_node(this);
    	},
    	/*设定弹出框控件,讲弹出框控件和本控件绑定在一起*/
    	set_many2one_ui:function(many2OneUi){
    		this.many2OneUi = many2OneUi;
    	},
    	start:function(){
    		var self = this;
    		self.set_position();
    		this.$img = this.$el.find('img');
    		this.$input = this.$el.find('input');
    		var model = new instance.web.Model(self.model);
    		
    		if(this.disable){
    			this.$img.hide();
    			this.$input.attr("disabled","disabled");
    		}
    		/* bug:self.params的值每点击一次就改变一次，需要深复制来解决 */
    		var _showLists = function(){
    			self.params.args = [["id","not in",[]]];    			
    			if(self.constraint && self.constraintField){
    				var constraintId = self.constraint.get_id();
    				var domain = [self.constraintField,"=",constraintId];
    				self.params.args.push(domain);
    			}
    			model.call("name_search", [], self.params).then(function(result) {
    				if(self.many2OneUi) self.many2OneUi.set_data(result);    				
    			});
    		};
    		
    		var _onclick = function(){
    			_showLists();
    		};
    		
    		var _onchange = function(){   			
    			var searchstr = $(this).val();
    			if(searchstr === '')self.set_null_state();
    			self.params.name = searchstr;
    			_showLists();
    		};
    		this.$img.click(_onclick);
    		this.$input.keyup(_onchange);
    	},
    	set_next_node:function(nextNode){
    		this.nextNode = nextNode;
    	},
    	set_next_node_null_state:function(){
    		var nextNode = this.nextNode;
    		if(nextNode){
    			nextNode.set_null_state();
    			nextNode.set_next_node_null_state();
    		}
    		
    	},
    	/*
    	 * 返回选择的name的id值,该值是数据库里的值*/
    	get_id:function(){
    		var id = Number(this.$input.attr('id'));
    		return id === 0 ? false : id;
    	},
    	set_id:function(id){
    		this.$input.attr('id',id);
    	},
    	set_name:function(name){
    		this.$input.val(name);
    	},
    	get_name:function(){
    		return this.$input.val();
    	}
    });
    
    /**/
    instance.COMMCMDB.Many2OneUi = instance.COMMCMDB.CommonWidget.extend({
    	template: 'Many2OneUi',
    	toString:function(){
    		return "instance.COMMCMDB.Many2OneUi";
    	},
    	init:function(parent,option,many2OneSelection){
    		this._super(parent,option);
    		this.selection = many2OneSelection;
    		this.limit = option.limit || 5;
    		many2OneSelection.set_many2one_ui(this);
    		this.areaHeight = option.areaHeight || null;
    	},
    	set_position:function(){
        	var selectionHeight = this.selection.$el.height();//PX unit
        	var top = this.areaHeight*(this.selection.y/100)+selectionHeight;
        	this.$el.css({
        		"position":this.layout_type,
            	"width":this.selection.width+0.5+'%',
            	"height":'auto',
            	"left":this.selection.x+'%',
            	"top":top,            		  
            });
        },
        set_data:function(data){
        	var self = this;
        	var str = '';
        	for(var i=0;i<data.length;i++){
        		str += '<li class="ui-menu-item">';
        			str +='<a id="'+data[i][0]+'" class="ui-corner-all">'+data[i][1]+'</a>';
        		str += '</li>';
        		if(i+1 >= self.limit) break;
        	}
        	this.$el.find('ul').html(str).show();
        	this.$el.find("ul a").hover(function(){
        		$(this).addClass('ui-state-focus');
        	},function(){
        		$(this).removeClass('ui-state-focus');
        	}).click(function(){
        		var selectionInput = self.selection.$input;
        		var text = $(this).html();
        		var id = $(this).attr('id');
        		if(id != selectionInput.attr('id'))self.selection.set_next_node_null_state();
        		selectionInput.val(text).attr('id',id).trigger('id_change',[ id ]).trigger('name_change');
        		$(this).parent('li').parent('ul').hide();
        	});
        },
        start:function(){
        	this.set_position();
        }
    });
    
    
    
    /*对话框的footer中的按钮控件，仅能用在对话框的footer里面（即使最下方的灰色区域里）*/
    instance.COMMCMDB.DialogButton = instance.web.Widget.extend({ // 自定义首页部件
    	template: "DialogButton",
    	toString:function(){
    		return "instance.COMMCMDB.DialogButton";
    	},

        init: function (parent,str,onclick) {
            this._super(parent);
            this.str = str;
            this.onclick = onclick;
        },
    	start:function(){
    		this.$el.html(this.$el.attr('str'));
    		this.$el.click(this.onclick);
    	}
    });
    
    /*自定义的按钮控件，可用在任何地方*/
    instance.COMMCMDB.Button = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "Button",
    	toString:function(){
    		return "instance.COMMCMDB.Button";
    	},

        init: function (parent,option, str = '',onclick) {
            this._super(parent,option);
            this.str = str;
            this.onclick = onclick || function(){};
        },
    	start:function(){
    		this.set_position();
    		this.$el.find('button').html(this.str);
    		this.$el.click(this.onclick);
    	}
    });
    
    /*自定义的label控件，可用在任何地方*/
    instance.COMMCMDB.Label = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "Label",
    	toString:function(){
    		return "instance.COMMCMDB.Label";
    	},

        init: function (parent,option, str='',callback){
            this._super(parent,option);
            this.str = str;
            this.option = option;
        	this.callback = callback || null;
        },
    	start:function(){
    		this.set_position();
    		this.$label = this.$el.find("label");
    		this.$label.html(this.str);
    		this.init_style();
    		if(this.callback)this.callback();
    	},
    	init_style:function(){
    		var option = this.option;
    		this.$label.css({    			
    			'font-size':option.fontSize || '13px',
    			'font-family':option.fontFamily || '"Lucida Grande",Helvetica,Verdana,Arial,sans-serif',
    			'color':option.color || 'black'
    		});
    	}
    });
    
    /*openerp的搜索框，重新包装了一下，用法见示例CI模板（tree）的页面*/
    instance.COMMCMDB.SearchBar = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "SearchBar",
    	toString:function(){
    		return "instance.COMMCMDB.SearchBar";
    	},

        init: function (parent,option, model) {
            this._super(parent,option);
            this.option = option;
            this.parent = parent;
            this.dataset = new instance.web.ProxyDataSet(this, model, {});
            this.searchview = new instance.web.SearchView(this,
                    this.dataset, false,  {});
        },
        set_view:function(view){
        	this.view = view;
        },
        do_search: function(domains, contexts, groupbys) {
            var self = this;
            instance.web.pyeval.eval_domains_and_contexts({
                domains:  domains || [],
                contexts: contexts || [],
                group_by_seq:groupbys || []
            }).done(function (results) {
                self.view.view_list.do_search(results.domain, results.context, results.group_by);
            });
        },
    	start:function(){
    		this.set_position();
    		var self = this;
    		this.searchview.on('search_data', self, function(domains, contexts, groupbys) {

    				self.do_search(domains, contexts, groupbys);
          	});
    		this.searchview.on("search_view_loaded", self, function() {
    			
    			if(!self.view) return;
    			self.view.view_list.on('edit:before', self, function (e) {
                    e.cancel = true;
                });
    			self.view.view_list.popup = self.view;
    			self.view.view_list.do_show();
    			self.searchview.do_search();
            });
    		this.searchview.appendTo(this.$el);
    		
    	},
    	hide:function(){
    		this.$el.hide();
    	}
    });
    
    /*别管这个*/
    instance.web.form.CommSelectCreateListView = instance.web.ListView.extend({
    	reload_content: synchronized(function () {
            var self = this;
            self.$el.find('.oe_list_record_selector').prop('checked', false);
            this.records.reset();
            var reloaded = $.Deferred();
            this.$el.find('.oe_list_content').append(
                this.groups.render(function () {
                    if (self.dataset.index == null) {
                        if (self.records.length) {
                            self.dataset.index = 0;
                        }
                    } else if (self.dataset.index >= self.records.length) {
                        self.dataset.index = 0;
                    }
                    var pageLabel = self.getParent().getParent().$pageLabel;
                    var pagination = self.getParent().getParent().$pagination;
                    if(pageLabel){
                    	var size = self.dataset.size();
                    	var length = self.records.length;
                        var limit = self._limit;
                        var offsetPage = self.page;
                        pageLabel.update_label(offsetPage+1,limit,size,length);
                    }
                    if(pagination && pagination.is_need_reload()){
                    	var maxPage = self.get_max_page();
                    	
                    	pagination.reload_widget(maxPage+1);
                    }
                    self.compute_aggregates();
                    reloaded.resolve();
                }));
            this.do_push_state({
                page: this.page,
                limit: this._limit
            });
            
            return reloaded.promise();;
        }),
        set_offset_page:function(page){
        	this.page = page;
        },
    	set_limit:function(limit){
    		this._limit = limit;
    	},
    	get_limit:function(){
    		return this._limit;
    	},
    	get_dataset_size:function(){
    		return this.dataset.size();
    	},
    	get_max_page:function(){
    		var datasetSize = this.dataset.size();
    		var limit = this._limit;
    		var max_page = Math.floor(datasetSize / limit);
    		if((datasetSize % limit) === 0) max_page--;
    		return max_page;
    	},
    	toString:function(){
    		return "instance.web.form.CommSelectCreateListView";
    	},
        do_add_record: function () {
            //this.popup.new_object();
        },
        select_record: function(index) {
            this.popup.select_elements([this.dataset.ids[index]]);
        },
        do_select: function(ids, records) {
            this._super(ids, records);
            this.popup.on_click_element(ids);
        }
    });
    
    /*分页选项控件,每页10页，20页*/
    instance.COMMCMDB.PaginationSelection = instance.COMMCMDB.CommonWidget.extend({
    	template: "PaginationSelection",
    	toString:function(){
    		return "instance.COMMCMDB.PaginationSelection";
    	},
        init: function (parent,option) {
        	this._super(parent,option);
        },
        start:function(){
        	var self = this;
    		this.set_position();
    		var searchview = this.getParent().$searchview;
    		var pageLabel = this.getParent().$pageLabel;
    		if(!searchview || !(searchview instanceof instance.COMMCMDB.SearchBarView))return;
    		var $select = this.$el.find('select')
    		.change(function(){
    			var pagination = self.getParent().$pagination;
    			if(pagination)pagination.set_need_reload(true);
    			var limit = Number($(this).val());
    			searchview.set_limit(limit);
    			searchview.set_offset_page(0);
    			searchview.reload_content();
    		});
    		
    		
    	},
    });
    
    /*分页控件,First,1,2,3,4,5,Next,Last*/
    instance.COMMCMDB.Pagination= instance.COMMCMDB.CommonWidget.extend({
    	template: "Pagination",
    	toString:function(){
    		return "instance.COMMCMDB.Pagination";
    	},
        init: function (parent,option) {
        	this._super(parent,option);
        	this._needReload = true;
        	this.currentIndex = 1;
        },
        start:function(){
    		this.set_position();
    		this.$previousBtn = this.$el.find('#previous');
    		this.$nextBtn = this.$el.find('#next');
    		this.$container = this.$el.find('span');
    		
    	},
    	get_currentBtn:function(){
    		return this.$container.find("a[index='"+this.currentIndex+"']");
    	},
    	set_next_previous_status:function(){
    		var self = this;
    		var $currentBtn = this.get_currentBtn();
    		var container = this.$container;
    		var currentIndex = this.currentIndex;
    		this.$previousBtn.removeClass('disabled');
			this.$nextBtn.removeClass('disabled');
    		if(Number(currentIndex) === 1)this.$previousBtn.addClass('disabled');
    		if(Number(currentIndex) === Number(this.maxPage))this.$nextBtn.addClass('disabled');
    		
    		this.$previousBtn.unbind().click(function(){
    			if(Number(currentIndex) === 1)return;
    			$currentBtn.removeClass('current');
    			self.currentIndex--;
    			if($currentBtn.prev().length === 0){
    				container.find('a:eq(5)').remove();
    				container.prepend('<a class="paginate_button" index="'+self.currentIndex+'">'+self.currentIndex+'</a>');
    				self.get_currentBtn().addClass('current');
    			}
    			else $currentBtn.prev().addClass('current');   				
    			self.refresh();
    		});
    		this.$nextBtn.unbind().click(function(){
    			if(Number(currentIndex) === Number(self.maxPage))return;
    			$currentBtn.removeClass('current');
    			self.currentIndex++;
    			if($currentBtn.next().length === 0){
    				container.find('a:eq(0)').remove();
    				container.append('<a class="paginate_button" index="'+self.currentIndex+'">'+self.currentIndex+'</a>');
    				self.get_currentBtn().addClass('current');
    			}
    			else $currentBtn.next().addClass('current');    				
    			self.refresh();
    		});
    	},
    	refresh:function(){
    		var searchview = this.getParent().$searchview;
			if(searchview){
				   searchview.set_offset_page(Number(this.currentIndex)-1);
				   searchview.reload_content();
				   this.set_next_previous_status();
			}
    	},
    	set_need_reload:function(bool){
    		this._needReload = bool;
    	},
    	is_need_reload:function(){
    		return this._needReload;
    	},
    	reload_widget:function(maxPage){
    		this.$container.html('');
    		this.maxPage = maxPage;
    		var self = this;
    		var str = '';   			   			
    		for(var i = 1;i <= ( maxPage>6 ? 6 : maxPage); i++){
    			str += '<a class="paginate_button" index="'+i+'">'+i+'</a>';
    		}
    		this.$container.html(str)
    					   .find('a:first')
    					   .addClass('current');
    		this.$container.find('a')
    					   .unbind()
    					   .click(function(){
    						   self.$container.find("a[index='"+self.currentIndex+"']").removeClass('current');
    						   $(this).addClass('current');
    						   self.currentIndex = $(this).attr('index');
    						   self.refresh();
    					   });
    		this._needReload = false;
    		this.currentIndex = 1;
    		self.set_next_previous_status();
    	},
    });
    
    /*分页页数显示控件,1-10 共 56条*/
    instance.COMMCMDB.PageLabel= instance.COMMCMDB.CommonWidget.extend({
    	template: "PageLabel",
    	toString:function(){
    		return "instance.COMMCMDB.PageLabel";
    	},
        init: function (parent,option) {
        	this._super(parent,option);
        },
        start:function(){
    		this.set_position();
    	},
    	set_start_value:function(currentPage,limit,recordLength){
    		var result;
    		if(recordLength!=0) result = (Number(currentPage)-1)*Number(limit) + 1;
    		else result = 0;
    		this.$el.find('#start_value').html(result);
    	},
    	set_end_value:function(currentPage,limit,size,recordLength){
    		var result;
    		if(recordLength!=0) {
    			result = Number(currentPage)*Number(limit);
    			if(result>size)result = size;
    		}
    		else result = 0;
    		this.$el.find('#end_value').html(result);
    	},
    	set_size:function(size,recordLength){
    		var result;
    		if(recordLength != 0 ) result = size;
    		else result = 0;
    		this.$el.find('#size').html(result);
    	},
    	update_label:function(currentPage,limit,size,length){
    		this.set_start_value(currentPage,limit,length);
    		this.set_end_value(currentPage,limit,size,length);
    		this.set_size(size,length);
    	}
    });
    
    /*openerp的列表页面，重新包装了一下，用法见CI模板（tree）页面*/
    instance.COMMCMDB.SearchBarView = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "SearchBarView",
    	toString:function(){
    		return "instance.COMMCMDB.SearchBarView";
    	},
        init: function (parent,option, searchBar) {
        	this._super(parent,option);
            this.option = option;
            this.$buttonpane = parent.getParent().$buttons;
            this.elementIds = [];
            this.searchBar = searchBar;
            this.searchBar.set_view(this);
            this.is_allow_click = option.is_allow_click || false;
            this.on_close = option.on_close || function(){};
        },
        start:function(){
        	this.view_list = this.init_viewlist();
    		this.set_position();
    		this.view_list.appendTo(this.$el);
    		
    	},
    	set_offset_page:function(page){
    		this.view_list.set_offset_page(page);
    	},
    	init_viewlist:function(){
    		var view_list = new instance.web.form.CommSelectCreateListView(this,
            		this.searchBar.dataset, false,
                    _.extend({'deletable': false,
                        'selectable': true,
                        'import_enabled': false,
                        '$buttons':this.$page ? this.$page.$el.find('xxx') : null,
                        'disable_editable_mode': true,
                        '$pager': this.$page ? this.$page.$el : null,
                    }, this.option.list_view_options || {}));
    		view_list.set_limit(10);
    		return view_list;
    	},
    	get_max_page:function(){
    		return this.view_list.get_max_page();
    	},
    	get_dataset_size:function(){
    		return this.view_list.get_dataset_size();
    	},
    	get_limit:function(){
    		return this.view_list.get_limit();
    	},
    	reload_content:function(t){
    		this.view_list.reload_content();
    	},
    	set_limit:function(limit){
    		this.view_list.set_limit(limit);
    	},
    	set_page:function(page){
    		this.$page = page;
    	},
    	on_click_element: function(ids) {
    		this.elementIds = ids;
        },
        select_elements: function(element_ids) {
        	if(this.is_allow_click){
        		alert("to the clicked edit form");
//        		this.do_action({   					            			
//        			views: [[false, 'form']],
//                    view_type: 'form',
//                    view_mode: 'form',
//                    res_model: 'commcmdb.citemplate',
//                    type: 'ir.actions.act_window',
//                    target: 'new',
//                    res_id:element_ids[0],
//	        		flags : {	
//	                    action_buttons : true,	
//	                }
//        		},{
//                    on_close:this.on_close
//                });
        	}
        },
        get_ids:function(){
        	return this.elementIds;
        }
    });
    
    
    instance.COMMCMDB.SearchPage = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "SearchPage",
    	toString:function(){
    		return "instance.COMMCMDB.SearchPage";
    	},
        init: function (parent,option, searchView) {
        	this._super(parent,option);
        	this.searchView = searchView;
        	this.searchView.set_page(this);
        },
        start:function(){
    		this.set_position();
    	},
    });
    
    instance.COMMCMDB.aTag = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "aTag",
    	toString:function(){
    		return "instance.COMMCMDB.aTag";
    	},
        init: function (parent,option,str,callback) {
        	this._super(parent,option);
        	this.str = str || "aTag";
        	this.option = option;
        	this.callback = callback || null;
        },
        start:function(){
    		this.set_position();
    		this.$a = this.$el.find('a');
    		this.$a.html(this.str);
    		this.init_style();
    		this.callback();
    	},
    	init_style:function(){
    		var option = this.option;
    		this.$a.css({
    			
    			'font-size':option.fontSize || '18px',
    			'font-family':option.fontFamily || '"Lucida Grande",Helvetica,Verdana,Arial,sans-serif',
    			'color':option.color || '#7D9FCE'
    		});
    	}
    });
    
    instance.COMMCMDB.Bool = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "Bool",
    	toString:function(){
    		return "instance.COMMCMDB.Bool";
    	},
        init: function (parent,option) {
        	this._super(parent,option);
        },
        start:function(){
    		this.set_position();
    		this.$select = this.$el.find('select');
    	},
    	get_bool:function(){
    		var result = false;
    		var val = this.$select.val();
    		if(val === '1')result = true;
    		return result;
    	}
    });
    
    instance.COMMCMDB.TextArea = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "TextArea",
    	toString:function(){
    		return "instance.COMMCMDB.TextArea";
    	},
        init: function (parent,option) {
        	this._super(parent,option);
        },
        start:function(){
    		this.set_position();
    		this.$textarea = this.$el.find('textarea');
    	},
    	get_text:function(){
    		return (this.$textarea.val()!='') ? this.$textarea.val() : false;
    	}
    });
    
    instance.COMMCMDB.Notebook = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "Notebook",
    	toString:function(){
    		return "instance.COMMCMDB.Notebook";
    	},
        init: function (parent,option) {
        	this._super(parent,option);
        },
        start:function(){
        	this.parent = this.getParent().$el;
        	var parent = this.parent;
    		this.set_position();
    		this.$li = this.$el.find('li');
    		var li = this.$li;
    		this.$li.click(function(){
    			var activeClass = 'ui-tabs-active ui-state-active';
    			li.removeClass(activeClass);
    			$(this).addClass(activeClass);
    			var activeDiv = $(this).attr('div_id');
    			parent.find('.tabdiv').hide();
    			parent.find('#'+activeDiv).show();
    		});
    		this.show_default_div();
    	},
    	show_default_div:function(){
    		var activeDiv = this.$el.find('.ui-state-active').attr('div_id');
    		this.parent.find('#'+activeDiv).show();
    	}
    });
    
    instance.COMMCMDB.SelectCreatePopup = instance.web.form.SelectCreatePopup.extend({
    	setup_search_view: function(search_defaults) {
            var self = this;
            if (this.searchview) {
                this.searchview.destroy();
            }
            this.searchview = new instance.web.SearchView(this,
                    this.dataset, false,  search_defaults);
            this.searchview.on('search_data', self, function(domains, contexts, groupbys) {
                if (self.initial_ids) {
                    self.do_search(domains.concat([[["id", "in", self.initial_ids]], self.domain]),
                        contexts.concat(self.context), groupbys);
                    self.initial_ids = undefined;
                } else {
                    self.do_search(domains.concat([self.domain]), contexts.concat(self.context), groupbys);
                }
            });
            this.searchview.on("search_view_loaded", self, function() {
                self.view_list = new instance.web.form.SelectCreateListView(self,
                        self.dataset, false,
                        _.extend({'deletable': false,
                            'selectable': !self.options.disable_multiple_selection,
                            'import_enabled': false,
                            '$buttons': self.$buttonpane,
                            'disable_editable_mode': true,
                            '$pager': self.$('.oe_popup_list_pager'),
                        }, self.options.list_view_options || {}));
                self.view_list.on('edit:before', self, function (e) {
                    e.cancel = true;
                });
                self.view_list.popup = self;
                self.view_list.appendTo($(".oe_popup_list", self.$el)).then(function() {
                    self.view_list.do_show();
                }).then(function() {
                    self.searchview.do_search();
                });
                self.view_list.on("list_view_loaded", self, function() {
                    self.$buttonpane.html(QWeb.render("Comm.SelectCreatePopup.search.buttons", {widget:self}));
                    var $cbutton = self.$buttonpane.find(".oe_selectcreatepopup-search-close");
                    $cbutton.click(function() {
                        self.destroy();
                    });
                    var $sbutton = self.$buttonpane.find(".oe_selectcreatepopup-search-select");
                    $sbutton.click(function() {
                        self.select_elements(self.selected_ids);
                        self.destroy();
                    });

                });
            });
            this.searchview.appendTo($(".oe_popup_search", self.$el));
        },
    });
    
    instance.COMMCMDB.sourceFrom = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "sourceFrom",
    	toString:function(){
    		return "instance.COMMCMDB.sourceFrom";
    	},
        init: function (parent,option) {
        	this._super(parent,option);
        },
        start:function(){
    		this.set_position();
    		this.$select = this.$el.find('select');
    	},
    	get_bool:function(){
    		var result = false;
    		var val = this.$select.val();
    		if(val === '1')result = true;
    		return result;
    	}
    });

	instance.COMMCMDB.runState = instance.COMMCMDB.CommonWidget.extend({ // 自定义首页部件
    	template: "runState",
    	toString:function(){
    		return "instance.COMMCMDB.runState";
    	},
        init: function (parent,option) {
        	this._super(parent,option);
        },
        start:function(){
    		this.set_position();
    		this.$select = this.$el.find('select');
    	},
    	get_bool:function(){
    		var result = false;
    		var val = this.$select.val();
    		if(val === '1')result = true;
    		return result;
    	}
    });
    
    
    
    
	openerp.COMMCMDB.CITemplatePage(instance);
	openerp.COMMCMDB.CreateRelationPage(instance);
	openerp.COMMCMDB.CITemplateEditPage(instance);
	openerp.COMMCMDB.CIManagePage(instance);
	openerp.COMMCMDB.SelectAttrPage(instance);
	openerp.COMMCMDB.SelectRelationPage(instance);
	openerp.COMMCMDB.CIEditPage(instance);
	openerp.COMMCMDB.SelectCIRelationPage(instance);
	openerp.COMMCMDB.CIExpendEditPage(instance);

    
    instance.web.client_actions.add('custom.createrelationpage', 'instance.COMMCMDB.CreateRelation');
    instance.web.client_actions.add('custom.citemplate', 'instance.COMMCMDB.CITemplate');
    instance.web.client_actions.add('custom.citemplateedit', 'instance.COMMCMDB.CITemplateEdit');
    instance.web.client_actions.add('custom.selectattr', 'instance.COMMCMDB.SelectAttr');
    instance.web.client_actions.add('custom.selectrelation', 'instance.COMMCMDB.SelectRelation');
    instance.web.client_actions.add('custom.cimanagepage', 'instance.COMMCMDB.CIManage');
    instance.web.client_actions.add('custom.cimanageedit','instance.COMMCMDB.CIEdit');
	instance.web.client_actions.add('custom.selcirelation','instance.COMMCMDB.SelectCIRelation');
	instance.web.client_actions.add('custom.ciexpendedit','instance.COMMCMDB.CIExpendEdit');
    

}
