var sms = require('../admin_controllers/sms'); // include sms controller ////


module.exports = function (app) {
    app.route('/admin/sms_list').get(sms.sms_list);
    app.route('/admin/get_sms_detail').post(sms.get_sms_detail);
    app.route('/admin/update_sms').post(sms.update_sms);


    app.route('/admin/get_sms_gateway_detail').post(sms.get_sms_gateway_detail);

    app.route('/admin/update_sms_configuration').post(sms.update_sms_configuration);

};





