var providers = require('../../controllers/provider/provider'); // include provider controller ////


module.exports = function (app) {
    app.route('/api/provider/register').post(providers.provider_register);
    
    app.route('/api/provider/login').post(providers.provider_login);
    app.route('/api/provider/update').post(providers.provider_update);
    app.route('/api/provider/logout').post(providers.logout);
    app.route('/api/provider/get_detail').post(providers.get_detail);
    app.route('/api/provider/update_device_token').post(providers.update_device_token);
    app.route('/api/provider/change_status').post(providers.change_status);
    app.route('/api/provider/otp_verification').post(providers.provider_otp_verification);
    app.route('/api/provider/rating_to_store').post(providers.provider_rating_to_store);
    app.route('/api/provider/rating_to_user').post(providers.provider_rating_to_user);
    app.route('/api/provider/get_order_status').post(providers.get_order_status);
    app.route('/api/provider/update_location').post(providers.update_location);
    
    
    
    // NEW API
    app.route('/api/provider/get_requests').post(providers.get_requests);
    app.route('/api/provider/get_active_requests').post(providers.get_active_requests);
    app.route('/api/provider/get_request_count').post(providers.get_request_count);
    
    
    app.route('/api/provider/request_history_detail').post(providers.request_history_detail);

    app.route('/api/provider/request_history').post(providers.request_history);
    app.route('/api/provider/get_request_status').post(providers.get_request_status);
};





