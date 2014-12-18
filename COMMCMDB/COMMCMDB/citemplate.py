# -*- coding: utf-8 -*-
from openerp.osv import fields,osv
from openerp import tools
from openerp.modules.registry import RegistryManager
from lxml import etree
from openerp.tools import to_xml
import string

DATATYPE = [('string','String'),('integer','Integer'),('boolean','Boolean')]

def get_tree_low2top(tablename,cr,uid,parent_id,context=None):
    """
从自己向上找，即看自己所在的线上继承了多个元素
"""

    print "parent_id is %s" % parent_id
    cr.execute("SELECT A.* FROM %s as A \
INNER JOIN %s as B \
ON 1=1 \
WHERE A.parent_left < B.parent_left and \
A.parent_left < B.parent_right and \
B.parent_left < A.parent_right and \
B.parent_right < A.parent_right \
AND b.id=%s \
ORDER BY A.id" % (tablename,tablename, parent_id))
    parent_ids = filter(None,map(lambda x:x[0],cr.fetchall()))
    parent_ids.append(parent_id)
    return parent_ids


def get_list_from_nestedlist(item):
    if not item:
        return []
    res = []
    for line in item:
        for i in line:
            res.append(i)
    return res

class Relation(osv.osv):
    _name = "commcmdb.relation"
    
    def name_search(self, cr, uid, name='', args=None, operator='=', context=None, limit=100):
        #print "Relation.name_search context is %s" % context
        template_id = context.get('template_id')
        if not template_id:
            print  super(Relation,self).name_search(cr,uid,name,args,operator,context,limit)
            return super(Relation,self).name_search(cr,uid,name,args,operator,context,limit)
        else:
            citemplateosv = self.pool.get("commcmdb.citemplate.relation")
            cr.execute('select A.id,A.name from commcmdb_relation as A \
                        INNER JOIN \
                        (select distinct \
                        relation_id from commcmdb_citemplate_relation where \
                        targetcitemplate_id = %s or \
                        sourcecitemplate_id = %s) as B\
                        on A.id = B.relation_id',(template_id,template_id))
            return cr.fetchall()
       
    _columns = {
        "name":fields.char(string="名称",size=200,required=True),
        "direction":fields.selection([
                                        ("forward","Forward"),
                                        ("opposite","Opposite"),
                                        ("none","None")
                                     ], string="方向", required=True),
    }
    _defaults = {
        "direction":"none"
    }
Relation()

class C(osv.osv):
    _name = "commcmdb.c"
    
    def _get_open_cid(self,cformat):
        cid = 0
        for item in cformat:
            print item
            if 'open' in item:
                if item['open'] is True:
                    cid = item['tid']
                    break
        return cid
    
    def _get_tree_cformat(self,creads):
        result = []
        for item in creads:
            item ['tid'] = 'c'+str(item ['id'])
            if len(item ['ts']) > 0:
                item ['isParent'] = True
#                 if not is_have_open:
#                     item['open'] = True
#                     is_have_open = True
            item ['pId'] = 0
            del item['ts']
            item['type'] = 'C';
            item['childtype'] = 'T';
            result.append(item)
        return  result
    
    def _get_tree_tformat(self,treads):
        result = []
        for item in treads:
            item['tid'] = 't'+str(item['id'])
            if item['pId'] is not False:
                item['pId'] = 'c'+str(item['pId'][0])
#                 if item['pId'] == copenid and not is_have_open and len(item['is']) > 0:
#                     item['open'] = True
#                     is_have_open = True
            if len(item['is']) > 0:
                item['isParent'] = True
            del item['is']
            item['type'] = 'T';
            item['childtype'] = 'I';
            result.append(item)
        return  result
    
    def _get_tree_iformat(self,ireads):
        result = []
        for item in ireads:
            item['tid'] = 'i'+str(item['id'])
            if item['pId'] is not False:
                item['pId'] = 't'+str(item['pId'][0])
            result.append(item)
            item['type'] = 'I';
        return  result
    
    def get_tree_data(self,cr,uid):
        
#         test = self.pool.get("commcmdb.citemplate")
#         testids = test.search(cr,uid,[],None)
#         testreads =  test.read(cr,uid,testids,['name','c_id','t_id','i_id'])
#         print "testreads"
#         print testreads

        
        #return [('%s/%s' % x) if x[0] else x[1] for x in cr.fetchall()]
        
        print "get_tree_data"
        cids = self.search(cr,uid,[],None)
        creads = self.read(cr, uid, cids, ['id','name','ts'])
        cresult = self._get_tree_cformat(creads)
        #print cresult
        
        
        t = self.pool.get("commcmdb.t")
        tids = t.search(cr,uid,[],None)
        treads = t.read(cr,uid,tids,['id','name','pId','is'])
        tresult = self._get_tree_tformat(treads)
        #print tresult
        i = self.pool.get("commcmdb.i")
        iids = i.search(cr,uid,[],None)
        ireads = i.read(cr,uid,iids,['id','name','pId'])
        iresult = self._get_tree_iformat(ireads)
        
        return cresult+tresult+iresult
    _columns = {
        "name":fields.char(string="名称",size=200,required=True),
        "ts": fields.one2many('commcmdb.t', 'pId', string='T(Second Layer)'),
    }

C()


class T(osv.osv):
    _name = "commcmdb.t"
    
    def _name_get_fnc(self, cr, uid, ids, prop, unknow_none, context=None):
        res = self.name_get(cr, uid, ids, context=context)
        return dict(res)
    
    def name_get(self, cr, uid, ids, context=None):
        if isinstance(ids, (list, tuple)) and not len(ids):
            return []
        if isinstance(ids, (long, int)):
            ids = [ids]
        #print "ids is %s " % ids
        reads = self.read(cr, uid, ids, ['name','pId'], context=context)
        res = []
        for record in reads:
            name = record['name']
            if record['pId']:
                name = record['pId'][1]+' / '+name
            res.append((record['id'], name))
        #print res
        return res
    
    _columns = {
        "name":fields.char(string="名称",size=200,required=True),
        "full_name": fields.function(_name_get_fnc, type="char", string='完整CTI名称'),
        "pId":fields.many2one('commcmdb.c',string='C', select=True, ondelete='cascade'),
        "is": fields.one2many('commcmdb.i', 'pId', string='I(Third Layer)'),
    }

T()

class I(osv.osv):
    _name = "commcmdb.i"
    
    def _name_get_fnc(self, cr, uid, ids, prop, unknow_none, context=None):
        res = self.name_get(cr, uid, ids, context=context)
        return dict(res)
    
    def name_get(self, cr, uid, ids, context=None):
        if isinstance(ids, (list, tuple)) and not len(ids):
            return []
        if isinstance(ids, (long, int)):
            ids = [ids]
        #print "ids is %s " % ids
        reads = self.read(cr, uid, ids, ['name','pId'], context=context)
        res = []
        for record in reads:
            name = record['name']
            if record['pId']:
                name = record['pId'][1]+' / '+name
            res.append((record['id'], name))
        #print res
        return res
    
    _columns = {
        "name":fields.char(string="名称",size=200,required=True),
        "full_name": fields.function(_name_get_fnc, type="char", string='完整CTI名称'),
        "pId":fields.many2one('commcmdb.t',string='T', select=True, ondelete='cascade'),
    }

I()

class CITemplate(osv.osv):
    _name="commcmdb.citemplate"
    _description = "CI Template"
    
    def get_list(self,cr,uid):
        cr.execute('SELECT PTemplate.name,Template.name,C.name,T.name,I.name FROM commcmdb_citemplate as Template \
                    LEFT JOIN commcmdb_c as C ON Template.c_id=C.id\
                    LEFT JOIN commcmdb_t as T ON Template.t_id=T.id\
                    LEFT JOIN commcmdb_i as I ON Template.i_id=I.id\
                    LEFT JOIN commcmdb_citemplate as PTemplate ON Template.parent_id=PTemplate.id')
        result = cr.fetchall()
        #print result
        return result
    
    def get_parent_cti(self,cr,uid,parentId):
        print "get_parent_cti"
        cr.execute('SELECT C.id as c_id,C.name as c_name,\
                           T.id as t_id,T.name as t_name,\
                           I.id as i_id,I.name as i_name \
                           FROM commcmdb_citemplate as Template \
                           LEFT JOIN commcmdb_c as C ON Template.c_id=C.id\
                           LEFT JOIN commcmdb_t as T ON Template.t_id=T.id\
                           LEFT JOIN commcmdb_i as I ON Template.i_id=I.id\
                           WHERE Template.id = %s'%parentId)
        result = cr.dictfetchall()
        return result
    
    def get_parent_attr(self,cr,uid,parentId):
        print "get_parent_attr"
        cr.execute('SELECT e.name FROM(SELECT a.ciattribute_id FROM commcmdb_citemplate_attribute as a INNER JOIN\
                (SELECT attribute_id FROM citemplate_attribute_rel  WHERE citemplate_id = %s) as b\
                 ON a.id = b.attribute_id ) as d\
                 LEFT JOIN commcmdb_ciattribute as e ON d.ciattribute_id = e.id'%parentId)
        result = cr.fetchall()
        print result;
        return result
    
    def default_get(self, cr, uid, fields, context=None):
        print "commcmdb.addrelations.wizard:default_get"
        c_id = context.get('c_id')
        t_id = context.get('t_id')
        i_id = context.get('i_id')
        return {
                "c_id":c_id,
                "t_id":t_id,
                "i_id":i_id
        }
    
    def create_relations(self,cr,uid,sourcecitemplate_id,relation_id,template_ids):
        relation = self.pool.get("commcmdb.citemplate.relation")
        for item in template_ids:
            relation.create(cr, uid, { 
                                       'relation_id': relation_id,
                                       'sourcecitemplate_id': sourcecitemplate_id,
                                       'targetcitemplate_id': item,
                }, context=None)
        
    
    def get_wizard(self, cr, uid, ids, context):
#         <record id="action_test_page" model="ir.actions.client">
#                 <field name="name">Inbox</field>
#                 <field name="tag">spa_crm.homepage</field>
#             </record>
        print context
        print "get_wizard"
        return {
            'name':'添加关系',
            'tag':'custom.createrelationpage',
            'type': 'ir.actions.client',
            'target':'new',
            'context':context,            
        }
    
    # the override reason is to show the all relations
    def read(self,cr, uid, ids, fields=None, context=None):
        print "commcmdb.citemplate:read"
        result = super(CITemplate, self).read(cr, uid, ids, fields,context)
        if("relations" in fields):
            relation = self.pool.get("commcmdb.citemplate.relation")
            relationids = relation.search(cr,uid,['|',('sourcecitemplate_id','=',ids[0]),('targetcitemplate_id','=',ids[0])],context=context)
            result[0]['relations'] = relationids
        return result
    
    def write(self,cr, uid, ids, values, context=None):
        #{'relations': [[4, 39, False], [2, 7, False]]}#
        #values仅会是更改过后的字段,比如示例中，表示relations(one2many)被修改了,2表示删除,4表示更新,39和7都是所关联的relation的id
        #这里仅考虑删除的操作，必须要过滤掉更新的数组元素，否则，点击保存按钮后源id都会变为当前模板的id,即过滤掉[4，39，False]
        print "commcmdb.citemplate:write"
        temp = []
        #if values['relations'] is not None:
        if 'relations' in values:
            for i in range(0,len(values['relations'])):
                if( values['relations'][i][0]!=4):
                    temp.append(values['relations'][i])
            print temp
            values['relations'] = temp
        result = super(CITemplate, self).write(cr, uid, ids, values,context)
        return result


    
    def button_test(self, cr, uid, ids, context=None):
        print "button_test"
    def name_get(self, cr, uid, ids, context=None):
        print "CITemplate.name_get"
        if isinstance(ids, (list, tuple)) and not len(ids):
            return []
        if isinstance(ids, (long, int)):
            ids = [ids]
        #print "ids is %s " % ids
        reads = self.read(cr, uid, ids, ['name','parent_id'], context=context)
        res = []
        for record in reads:
            name = record['name']
            if record['parent_id']:
                name = record['parent_id'][1]+' / '+name
            res.append((record['id'], name))
        #print res
        return res

    def _name_get_fnc(self, cr, uid, ids, prop, unknow_none, context=None):
        print "CITemplate._name_get_fnc"
        res = self.name_get(cr, uid, ids, context=context)
        return dict(res)
    
    
    def _get_inherited_relations(self, cr, uid, ids, field_name, arg, context=None):
        print "CITemplate._get_inherited_relations"
        if context is None:
            context = {}
        #print "_get_inherited_relations"
        parent_id = self.read(cr, uid, ids, ['parent_id'], context)[0]['parent_id']
        #print "parent_id"
        #print parent_id # (1, u'test')
        if parent_id != False:
            result = {}
            list_o = []
            relation = self.pool.get("commcmdb.citemplate.relation")
            relationids = relation.search(cr,uid,['|',('sourcecitemplate_id','=',parent_id[0]),('targetcitemplate_id','=',parent_id[0])],context=context)
            return {
                        ids[0]:relationids
                    }
        else:
            return {}
    

 


    def _check_recursion(self, cr, uid, ids, context=None):
        level = 100
        while len(ids):
            cr.execute('select distinct parent_id from commcmdb_citemplate where id IN %s',(tuple(ids),))
            ids = filter(None, map(lambda x:x[0], cr.fetchall()))
            if not level:
                return False
            level -= 1
        return True
    
    def get_inherit_attributes(self,cr,uid,ids,name,arg,context=None):
        pass
#         print "CITemplate.get_inherit_attributes"
#         res = {}
#         for template in self.browse(cr,uid,ids,context=context):
#             if not template.parent_id:
#                 continue
#             parent_ids = get_tree_low2top("commcmdb_citemplate",cr,uid,template.parent_id.id,context=context)
#             if not parent_ids:
#                 continue
#             attrs = self.read(cr,uid,parent_ids,["id","attributes"],context=context)
#             temp = [item["attributes"] for item in attrs]
#             attr_ids = get_list_from_nestedlist(temp)
#             res[template.id] = attr_ids
#         return res


    
    def _get_inherit_attributes(self,cr,uid,ids,parentid,context=None):
        pass
#         print "CITemplate._get_inherit_attributes"
#         cr.execute('select A.id,A.name from commcmdb_relation as A \
#                         INNER JOIN \
#                         (select distinct \
#                         relation_id from commcmdb_citemplate_relation where \
#                         targetcitemplate_id = %s or \
#                         sourcecitemplate_id = %s) as B\
#                         on A.id = B.relation_id',(template_id,template_id))
#         return cr.fetchall()
    
    def _get_attributeids(self,cr,uid,ids,templateid,context=None):
        print "CITemplate._get_attributeids"
        cr.execute('select A.attribute_id from citemplate_attribute_rel as A \
                        WHERE A.citemplate_id = %s',(templateid,))
        attribute_ids = filter(None,map(lambda x:x[0],cr.fetchall()))
        return attribute_ids
    
    def onchange_parent_get_inherit_attributes(self,cr,uid,ids,parentid,context=None):
        pass
#         print "CITemplate.onchange_parent_get_inherit_attributes"
#         relationresult = []
#         attrsresult = []
#         parent_ids = [parentid]
#         relation = self.pool.get("commcmdb.citemplate.relation")
#         relationids = relation.search(cr,uid,['|',('sourcecitemplate_id','=',parentid),('targetcitemplate_id','=',parentid)],context=context)
#         for item in relation.read(cr,uid,relationids,[],context=context):
#             item['isinherited'] = True
#             if(len(item['targetcitemplate_id'])>1):
#                 item['targetcitemplate_id'] = item['targetcitemplate_id'][0]
#             if(len(item['relation_id'])>1):
#                 item['relation_id'] = item['relation_id'][0]
#             relationresult.append(item)
#         # get attributes #
#         attribute_ids = self._get_attributeids(cr, uid, ids, parentid, context)
#         # get targetrelations
# 
#         
#         cresult = self.read(cr, uid, parent_ids, ['c_id'], context)[0]["c_id"]
#         tresult = self.read(cr, uid, parent_ids, ['t_id'], context)[0]["t_id"]
#         iresult = self.read(cr, uid, parent_ids, ['i_id'], context)[0]["i_id"]
#         if cresult:
#             cresult = cresult[0]
#         if tresult:
#             tresult = tresult[0]
#         if iresult:
#             iresult = iresult[0]
# 
#         return {
#                     "value": {
#                         "c_id":cresult,
#                         "t_id":tresult,
#                         "i_id":iresult,
#                         "attributes" :attribute_ids,
#                         "relations":relationresult
#                     }
#                 }
            
    _columns = {
        'name': fields.char(string='名称', size=64, required=True, translate=True, select=True),
        "c_id":fields.many2one('commcmdb.c',string='C类', select=True, ondelete='cascade'),
        "t_id":fields.many2one('commcmdb.t',string='T类', select=True, ondelete='cascade'),
        "i_id":fields.many2one('commcmdb.i',string='I类', select=True, ondelete='cascade'),
        "full_name": fields.function(_name_get_fnc, type="char", string='完整模板名称'),#the name with parents e.x parent1/parent2/self
        "parent_id": fields.many2one('commcmdb.citemplate',string='父模板', select=True, ondelete='cascade'),
        "is_default":fields.boolean("is_default"),
        "description":fields.text(string="Description"),
        "attributes":fields.one2many('commcmdb.citemplate.attribute', "citemplate_id",string="Attributes"),
        #"attributes":fields.many2many('commcmdb.citemplate.attribute', 'citemplate_attribute_rel', 'citemplate_id', 'attribute_id', 'Attributes'),
        "relations":fields.one2many("commcmdb.citemplate.relation","sourcecitemplate_id",string="Relations"),#this field will show the all relations
#         "relations_ids": fields.function(_get_relations,fnct_inv=_write_relations,type='one2many', relation="commcmdb.citemplate.relation", string="Relations"),
        "sequence": fields.integer(string='Sequence', select=True),
        "parent_left": fields.integer('Left parent', select=True),
        "parent_right": fields.integer('Right parent', select=True),
        
        
    }

    _constraints = [
        (_check_recursion, '错误！您不能循环创建目录.', ['parent_id'])
    ]

    _parent_name = "parent_id"
    _parent_store = True
    _parent_order = 'sequence, name'
    _order = "parent_left"
    
CITemplate()

# class CTI(osv.osv):
#     _name = "commcmdb.cti"
#    
#     def name_get(self, cr, uid, ids, context=None):
#         if isinstance(ids, (list, tuple)) and not len(ids):
#             return []
#         if isinstance(ids, (long, int)):
#             ids = [ids]
#         #print "ids is %s " % ids
#         reads = self.read(cr, uid, ids, ['name','parent_id'], context=context)
#         res = []
#         for record in reads:
#             name = record['name']
#             if record['parent_id']:
#                 name = record['parent_id'][1]+' / '+name
#             res.append((record['id'], name))
#         #print res
#         return res
#     
#     def _name_get_fnc(self, cr, uid, ids, prop, unknow_none, context=None):
#         res = self.name_get(cr, uid, ids, context=context)
#         return dict(res)
#     
#     def _check_recursion(self, cr, uid, ids, context=None):
#         level = 100
#         while len(ids):
#             cr.execute('select distinct parent_id from commcmdb_cti where id IN %s',(tuple(ids),))
#             ids = filter(None, map(lambda x:x[0], cr.fetchall()))
#             if not level:
#                 return False
#             level -= 1
#         return True
#     
#     _columns = {
#         'name': fields.char(string='Name', size=64, required=True, translate=True, select=True),
#         "full_name": fields.function(_name_get_fnc, type="char", string='完整CTI名称'),#the name with parents e.x parent1/parent2/self
#         "parent_id": fields.many2one('commcmdb.cti',string='Parent', select=True, ondelete='cascade'),
#         "children": fields.one2many('commcmdb.cti', 'parent_id', string='Children'),
#         "sequence": fields.integer(string='Sequence', select=True),
#         "parent_left": fields.integer('Left parent', select=True),
#         "parent_right": fields.integer('Right parent', select=True),
#     }
#     
#     _constraints = [
#         (_check_recursion, '错误！您不能循环创建目录.', ['parent_id'])
#     ]
#     
#     _parent_name = "parent_id"
#     _parent_store = True
#     _parent_order = 'sequence, name'
#     _order = "parent_left"
# CTI()

# class CITemplateAttribute(osv.osv):
#     
#     def onchange_get_ciattribute_related(self,cr,uid,ids,parentid,context=None):
#         ciattribute = self.pool.get("commcmdb.ciattribute")
#         result =  ciattribute.read(cr, uid, [parentid], ['datatype','value','ciattrgroup_id'], context=context)[0]
#         datatype = result['datatype']
#         value = result['value']
#         ciattrgroup_id = result['ciattrgroup_id']
#         return {
#             "value": {
#                     "datatype":datatype,
#                     "value":value,
#                     "ciattrgroup_id":ciattrgroup_id
#             }
#         }
#     _name="commcmdb.citemplate.attribute"    
#     _columns = {
#         "attrgroup_id":fields.many2one("commcmdb.attrgroup",string="CI模板属性组",ondelete='cascade'),
#         "ciattribute_id":fields.many2one("commcmdb.ciattribute",string="CI 属性",ondelete='cascade'),
#         "ciattrgroup_id":fields.related('ciattribute_id','ciattrgroup_id',relation='commcmdb.ciattrgroup',type='many2one',string='CI 属性组'),
#         "datatype": fields.related('ciattribute_id','datatype',type='selection', selection=DATATYPE,string='数据类型'),
#         "value": fields.related('ciattribute_id','value',type='char', string='默认值'),
#         "citemplates":fields.many2many('commcmdb.citemplate', 'citemplate_attribute_rel', 'attribute_id', 'citemplate_id', 'CI Templates'),
# #         "name":fields.char(string="Name",size=200,required=True,help="The name of the attribute"),
# #         "datatype":fields.selection(DATATYPE, string="数据类型", required=True ),
# #         "value":fields.char(string="Value",size=500,required=False),
#     }
    
class CITemplateAttribute(osv.osv):
    
    _name="commcmdb.citemplate.attribute"    
    _columns = {
        "ciattribute_id":fields.many2one("commcmdb.ciattribute",string="CI 属性",ondelete='cascade'),
        "ciattrgroup_id":fields.related('ciattribute_id','ciattrgroup_id',relation='commcmdb.ciattrgroup',type='many2one',string='CI 属性组'),
        "datatype": fields.related('ciattribute_id','datatype',type='selection', selection=DATATYPE,string='数据类型'),
        "defaultvalue": fields.related('ciattribute_id','defaultvalue',type='char', string='默认值'),
        "englishname": fields.related('ciattribute_id','englishname',type='char', string='英文名字'),
        "is_clear": fields.related('ciattribute_id','is_clear',type='boolean', string='是否清空'),
        "citemplate_id":fields.many2one('commcmdb.citemplate', string="CI 模板",ondelete='cascade'),    
        #"citemplate":fields.many2many('commcmdb.citemplate', 'citemplate_attribute_rel', 'attribute_id', 'citemplate_id', 'CI Templates'),
    }

CITemplateAttribute()

class CITemplateRelation(osv.osv):
    _name = "commcmdb.citemplate.relation"
    def remove(self,cr,uid,ids,context=None):
        print "remove"
    def onchange_get_direction(self,cr,uid,ids,parentid,context=None):
        relation_rep = self.pool.get("commcmdb.relation")
        direction =  relation_rep.read(cr, uid, [parentid], ['direction'], context=context)[0]['direction']
        print "a"
        print direction
        return {
            "value": {
                    "direction":direction
            }
        }
        
#     def fields_view_get(self, cr, uid, view_id=None, view_type='form', context=None, toolbar=False, submenu=False):
#         print 'context is %s ' % context
#         if context is None:
#             context = {}
#         result = super(CITemplateRelation, self).fields_view_get(cr, uid, view_id,  view_type=view_type, context=context, toolbar=toolbar, submenu=submenu)  
#         doc = etree.XML(result['arch'])
#         relationtype = context.get('relationtype')
#         if view_type == 'tree' :
#             if relationtype == 'sourcerelation':
#                 for node in doc.xpath("//field[@name='targetcitemplate_id']"):
#                     node.getparent().remove(node)
#             elif relationtype == 'targetrelation':
#                 for node in doc.xpath("//field[@name='sourcecitemplate_id']"):
#                     node.getparent().remove(node)
#                 #doc.remove(node)
#         result['arch'] = etree.tostring(doc)
#         return result

    _columns = {
        "relation_id":fields.many2one("commcmdb.relation",string="关系名",required=True,ondelete='cascade'),
        "direction": fields.related('relation_id','direction', type='selection', selection=[
                                        ("forward","Forward"),
                                        ("opposite","Opposite"),
                                        ("none","None")
                                     ],string='方向'),
                
        "sourcecitemplate_id":fields.many2one("commcmdb.citemplate",string="源模板",ondelete='cascade'),
        "targetcitemplate_id":fields.many2one("commcmdb.citemplate",string="目标模板",ondelete='cascade'),
        "isinherited":fields.boolean("isinherited")
    }
    _defaults = {
        "isinherited":False
    }
CITemplateRelation()



# for template attr group #
class AttrGroup(osv.osv):
    _name = "commcmdb.attrgroup"        
    _columns = {
        "name": fields.char(string='名称', size=64, required=True, translate=True, select=True),
#         "childs": fields.one2many('commcmdb.attrgroup', 'parent_id', string='Children Groups'),
    }

AttrGroup()

# for global CI 属性组 #
class CIAttGroup(osv.osv):
    _name = "commcmdb.ciattrgroup"        
    _columns = {
        "name": fields.char(string='名称', size=64, required=True, translate=True, select=True),
    }

CIAttGroup()


class CIAttribute(osv.osv):
    _name="commcmdb.ciattribute" 
    _columns = {
        "ciattrgroup_id":fields.many2one("commcmdb.ciattrgroup",string="CI 属性组",ondelete='cascade'),
        "name":fields.char(string="名称",size=200,required=True,help="The name of the attribute"),
        "englishname":fields.char(string="english名称",size=200,help="The name of the attribute"),
        "datatype":fields.selection(DATATYPE, string="数据类型"),
        "defaultvalue":fields.char(string="默认值",size=500),
        "is_clear":fields.boolean("is_clear"),
    }

    _defaults = {
        "datatype":"string",
        "is_clear":False
    }

CIAttribute()

class addrelations_wizard(osv.TransientModel): 
    _name = 'commcmdb.addrelations.wizard'
    
    def default_get(self, cr, uid, fields, context=None):
        print "commcmdb.addrelations.wizard:default_get"
        sourcecitemplateid = context.get('sourcecitemplateid')
        return {
                "sourcecitemplate_id":sourcecitemplateid
        }
    
    _columns = { 
        "relation_id":fields.many2one("commcmdb.relation",string="关系名",required=True,ondelete='cascade'),
        "sourcecitemplate_id":fields.many2one("commcmdb.citemplate",string="源模板",ondelete='cascade',required=True),
    } 
    
    def shownext(self,cr,uid,ids,context=None): 
        print "shownext"
        return {
            'name': 'Inbox',
            'tag':'spa_crm.homepage',
            'type': 'ir.actions.client',
            'target':'new'
        }     
addrelations_wizard()


