var vaiter = require('../../controllers/vaiter/vaiter'); // include provider controller ////

//All APIs by Burhan Makda

module.exports = function (app) {
    app.route('/vaiter/login').post(vaiter.vaiter_login);
    app.route('/vaiter/logout').post(vaiter.logout);
    app.route('/vaiter/update_password').post(vaiter.update_password);
    app.route('/vaiter/request_assistance_list').post(vaiter.request_assistance_list);
    app.route('/vaiter/resolve_request_assistance').post(vaiter.resolve_request_assistance);
    app.route('/vaiter/get_order_list').post(vaiter.get_order_list);
    app.route('/vaiter/get_order_detail').post(vaiter.get_order_detail);
    app.route('/vaiter/set_order_status').post(vaiter.set_order_status);
    app.route('/vaiter/cancel_order_accept').post(vaiter.cancel_order_accept);
    app.route('/vaiter/cancel_order_rejected').post(vaiter.cancel_order_rejected);
    app.route('/vaiter/forgot_password').post(vaiter.forgot_password);
    app.route('/vaiter/get_feature_list').post(vaiter.get_feature_list);
    app.route('/vaiter/update_feature_list').post(vaiter.update_feature_list);
    app.route('/vaiter/search_vaiter').post(vaiter.search_vaiter);
    app.route('/vaiter/table_request_list').post(vaiter.table_request_list);  
    app.route('/vaiter/resolve_table_request').post(vaiter.resolve_table_request);  
    
}

