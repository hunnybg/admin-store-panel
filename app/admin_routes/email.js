var email = require('../admin_controllers/email'); // include email controller ////


module.exports = function (app) {
    app.route('/admin/email_list').get(email.email_list);
    app.route('/admin/get_email_detail').post(email.get_email_detail);
    app.route('/admin/update_email').post(email.update_email);
    
    app.route('/admin/update_email_configuration').post(email.update_email_configuration);

};





