{
    "name":"COMMCMDB",
    "version":"1.0",
    "author":"rujun.feng",
    "category":"Sales",
    "website":"http://www.wedoapp.com",
    "description":"CMDB FOR COMM",
    "data":[
        "commcmdb_view.xml",
        "commcmdb_view_lufeng.xml",
        "commcmdb_demo.xml",
        "ciinstance_demo.xml"
    ],
    "js": [
           'static/src/js/jquery.ztree.all-3.5.min.js',
           'static/src/js/comm.js',
           'static/src/js/citemplatepage.js',
           'static/src/js/createrelationpage.js',
           'static/src/js/citemplateeditpage.js',
           'static/src/js/cimanagepage.js',  
           'static/src/js/selectattrpage.js',
           'static/src/js/selectrelationpage.js',    
		   'static/src/js/selectcirelationpage.js',
		   'static/src/js/ciexpendedit.js',
           'static/src/datatable/js/jquery.dataTables.min.js'],
    "qweb": ['static/src/xml/*.xml'],  
    "css": ['static/src/css/*.css',
            'static/src/datatable/css/jquery.dataTables.min.css'],
    "depends":[
        "web",
    ],
    "installable":True,
}
