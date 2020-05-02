var stores = require('../../controllers/store/store'); // include store controller ////


module.exports = function (app) {
    app.route('/api/store/register').post(stores.store_register);
    app.route('/api/store/login').post(stores.store_login);
    app.route('/api/store/update').post(stores.store_update);
    app.route('/api/store/order_list').post(stores.order_list);
    app.route('/api/store/update_store_time').post(stores.update_store_time);
    app.route('/api/store/logout').post(stores.logout);
    app.route('/api/store/update_device_token').post(stores.update_device_token);
    app.route('/api/store/otp_verification').post(stores.store_otp_verification);
    
    app.route('/api/store/get_detail').post(stores.get_detail);
    app.route('/api/store/order_payment_status_set_on_cash_on_delivery').post(stores.order_payment_status_set_on_cash_on_delivery);
    app.route('/api/store/check_order_status').post(stores.check_order_status);
    app.route('/api/store/get_store_data').post(stores.get_store_data);
    app.route('/api/store/order_history').post(stores.order_history);
    app.route('/api/store/order_history_detail').post(stores.order_history_detail);
   
    app.route('/api/store/rating_to_provider').post(stores.store_rating_to_provider);
    app.route('/api/store/rating_to_user').post(stores.store_rating_to_user);
    app.route('/api/store/cancel_request').post(stores.store_cancel_request);
    app.route('/api/store/get_order_detail').post(stores.get_order_detail);
    app.route('/api/store/get_user').post(stores.get_user);
    app.route('/api/store/get_country_phone_number_length').post(stores.get_country_phone_number_length);

    app.route('/api/store/complete_order').post(stores.store_complete_order);
    
    app.route('/api/store/create_order').post(stores.store_create_order);
    app.route('/api/store/store_change_delivery_address').post(stores.store_change_delivery_address);
    
    app.route('/api/store/update_order').post(stores.store_update_order);
    
    // NEW API
    app.route('/api/store/check_request_status').post(stores.check_request_status);
    app.route('/api/store/check_store_coding').post(stores.check_store_coding);
    app.route('/api/store/owner_register').post(stores.store_owner_register);
    app.route('/api/store/owner_login').post(stores.store_owner_login);
    app.route('/api/store/owner_logout').post(stores.store_owner_logout);
    app.route('/api/store/owner_details').post(stores.store_owner_details);
};





