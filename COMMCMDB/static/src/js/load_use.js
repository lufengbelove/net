instance.web.form.SelectTemplatesPopupButton = instance.web.form.FormWidget.extend({
        template: 'selectTemplatesPopupButton',
        init: function(field_manager,node) {
        	this._super(field_manager, node);
        },
        start: function() {
        	this.$el.click(this.on_click);
        },
        on_click: function() {
        	
        	//this.getParent().getParent().getParent().close();
//        	this.getParent().$buttons.hide();
//        	this.getParent().$pager.hide();
//        	var self = this.getParent().getParent().getParent();


        	var formview = this.getParent();
        	var relation_id = formview.fields['relation_id'].get_value();
//        	if(!relation_id)
//        		formview.do_warn(_t("The following fields are invalid:relation_id"));
//        		return;
        	var pop = new instance.web.form.SelectCreatePopup(this);
            pop.select_element(
                'commcmdb.citemplate',
                {
                    title: _t("Add: ") + 'CITemplate',
                    //no_create: this.m2m_field.options.no_create,
                }
            );
            
            pop.on("elements_selected", this, function(element_ids) {
            	var self=this;
            	var model = new instance.web.Model("commcmdb.citemplate");
            	var formview = this.getParent();//FormView instance
            	var sourcecitemplate_id = formview.fields['sourcecitemplate_id'].get_value();
            	var relation_id = formview.fields['relation_id'].get_value();     
            	model.call("create_relations", [], 
            			{sourcecitemplate_id:sourcecitemplate_id,
            			 relation_id:relation_id,
            			 template_ids:element_ids}).then(function(result) {
            				 self.getParent().getParent().getParent().destroy();	 
                });
            });
            
        },
    });

/*给form视图中加控件（一个控件对应一个标签），此控件只能在form视图中用,暂时没用到*/
instance.web.form.tags = new instance.web.Registry({
    'CIRelationsSelectCreatePopup' : 'instance.web.form.CIRelationsSelectCreatePopup',
    'button' : 'instance.web.form.WidgetButton',
    'selecttemplatespopupbutton':'instance.web.form.SelectTemplatesPopupButton',
});