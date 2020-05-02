var vaiter = require('../admin_controllers/vaiter'); // include provider controller ////

module.exports = function (app) {
    app.route('/store/add_new_vaiter').post(vaiter.add_new_vaiter);
    app.route('/store/get_vaiters').post(vaiter.get_vaiters);
    app.route('/store/vaiter_approve_decline').post(vaiter.vaiter_approve_decline);
    app.route('/store/update_vaiter').post(vaiter.update_vaiter);
    
    app.route('/store/delete/vaiter').post(vaiter.delete_vaiter);
    app.route('/store/get_request_assistance_list').post(vaiter.get_request_assistance_list);
    app.route('/store/get_table_request_list').post(vaiter.get_table_request_list);

    app.route('/store/get_vaiter_list').post(vaiter.get_vaiter_list);
};