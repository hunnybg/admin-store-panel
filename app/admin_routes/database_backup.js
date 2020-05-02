var database_backup = require('../admin_controllers/database_backup'); // include add_details controller ////


module.exports = function (app) {
    
    app.route('/admin/add_database_backup').post(database_backup.add_database_backup);
    app.route('/admin/list_database_backup').post(database_backup.list_database_backup);
    app.route('/admin/restore_database_backup').post(database_backup.restore_database_backup);
    
};





