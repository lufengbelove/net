# -*- coding: utf-8 -*-
from openerp.osv import fields,osv
from openerp import tools
from openerp.modules.registry import RegistryManager
import string

DATATYPE = [('string','String'),('integer','Integer'),('boolean','Boolean')]
CISTATUS = [("ready","Ready"),("working","Working"),("repairing","Repairing"),("filed","Filed")]

'''
CI表
'''

class CI(osv.osv):
    _name="commcmdb.ci"
    _description = "CI Instance"
    
    def onchange_template_get_inherit_attributes(self,cr,uid,ids,citemplateid,context=None):
        print citemplateid
        result = []

        #parent_ids = get_tree_low2top("commcmdb_ci",cr,uid,parentid,context=context)
        citemplateid_ids = [citemplateid]
        #self._get_inherit_tree(cr, uid,parentid, context=context)
        attr_rep = self.pool.get("commcmdb.citemplate.attribute")
        attr_ids = attr_rep.search(cr,uid,[('citemplate_id','in',citemplateid_ids)],context=context)
        for item in attr_rep.read(cr,uid,attr_ids,[],context=context):
            result.append(item)
          

        #result2[ids] = result
        print "result is %s" % result
        return {
                    "value": {
                        "attributes" : result,
                    },
                    "domain":{
                        "commcmdb.relation": [('id','=','1')]
                    }
                }
        
    def test(self,cr,uid,ids,citemplateid,context=None):
        print "test"
        print citemplateid
 
    
    
    
    _columns = {
		"code":fields.char(string="CI编号",size=64,required=False),
        "name": fields.char(string="CI名称", size=64, required=True, translate=True, select=True),
        "c_id":fields.many2one('commcmdb.c',string='C', select=True, ondelete='cascade'),
        "t_id":fields.many2one('commcmdb.t',string='T', select=True, ondelete='cascade'),
        "i_id":fields.many2one('commcmdb.i',string='I', select=True, ondelete='cascade'),
        "status":fields.selection(CISTATUS, string="状态", required=True ),
        "template_id": fields.many2one('commcmdb.citemplate',string='CI Template', select=True),
        "attributes":fields.one2many("commcmdb.ci.attribute","ci_id",string="Attributes"),
        "targetrelations":fields.one2many("commcmdb.ci.relation","sourceci_id",string="TargetRelations"),
        "sourcerelations":fields.one2many("commcmdb.ci.relation","targetci_id",string="SourceRelations"),
        "remark":fields.text(string="Remark"),
		"sourcefrom":fields.char("来源"),
		"time_create":fields.datetime("创建时间"),
		"ip":fields.char("IP地址"),
    }


    _defaults = {
        "status":"ready"
    }

    
CI()

'''
CI 属性池表
'''

class CIAttribute(osv.osv):
    _name="commcmdb.ci.attribute"
    
    def default_get(self, cr, uid, fields, context=None):
    
        print "defaul_get"
        print fields
        print context
        return {"datatype":"string"}
    
    def _get_test(self, cursor, user_id, context=None):
        print "_get_test"
        print context
        return [('choice1', 'This is the choice 1'),('choice2', 'This is the choice 2')]
    
    def _sel_func(self, cr, uid, context=None):
        print "_sel_func"
        print context

        res = []

        return res

    _columns = {
        "ci_id":fields.many2one("commcmdb.ci",string="Template"),
        "attrgroup_id":fields.many2one("commcmdb.attrgroup",string="Group"),
        "name":fields.char(string="Name",size=200,required=True,help="The name of the attribute"),
        "datatype":fields.selection(DATATYPE, string="Data Type", required=True ),
        "value":fields.char(string="Value",size=500,required=False),
    }

    _defaults = {
        "datatype":"string"
    }

CIAttribute()
'''
CI 关系表
'''

class CIRelation(osv.osv):
    _name="commcmdb.ci.relation"
    _columns = {        
        "relation_id":fields.many2one("commcmdb.relation",string="Relation",required=True),
        "sourceci_id":fields.many2one("commcmdb.ci",string="Source CI"),
        "targetci_id":fields.many2one("commcmdb.ci",string="Target CI"),
    }

CIRelation()

'''
CI管理中关联的流程表
'''


class CIProcess(osv.osv):
	_name = "commcmdb.ci.process"
	_columns = {
			"code":fields.char(string="工单号",size=64,required=False),
			"work_status":fields.char(string="工单状态",),
			"process_category":fields.char(string="流程分类",),
			"relation_time":fields.datetime(string="关联时间",),
			"planning":fields.char(string='规划人',),
			}
CIProcess()

'''
CI 扩展属性表
'''
class CIExpendAttr(osv.osv):
	_name = "commcmdb.ci.expendattr"
	_columns = {
			"ciid":fields.one2many('commcmdb.ci','code',string='CI ID',),
			"attribute_id":fields.one2many('commcmdb.ciattribute','name',string='属性ID'),
			"attribute_group":fields.one2many('commcmdb.ciattribute','ciattrgroup_id',"属性分组"),
			"name":fields.one2many('commcmdb.ciattribute','name',string='属性名'),
			"value":fields.char('值'),
			}
CIExpendAttr()
