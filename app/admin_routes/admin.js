var admin = require('../admin_controllers/admin'); // include admin controller ////


module.exports = function (app) {
    app.route('/admin/add').post(admin.add_admin);
    app.route('/admin/lists').get(admin.admin_list);
    
    app.route('/admin/get_detail').post(admin.get_admin_detail);
    app.route('/admin/update').post(admin.update_admin);
    app.route('/admin/delete').post(admin.delete_admin);
    app.route('/login').post(admin.login);
    app.route('/admin/check_auth').post(admin.check_auth);
    
};





