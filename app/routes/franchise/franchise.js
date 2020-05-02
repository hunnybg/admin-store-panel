var franchises = require('../../controllers/franchise/franchise'); // include store controller ////


module.exports = function (app) {
    app.route('/api/franchise/register').post(franchises.franchise_register);
    app.route('/api/franchise/login').post(franchises.franchise_login);
    app.route('/api/franchise/get_franchise_data').post(franchises.get_franchise_data);
    app.route('/api/franchise/get_store_data').post(franchises.get_store_data);
    app.route('/api/franchise/logout').post(franchises.logout);
    app.route('/api/franchise/approve_decline_business_store').post(franchises.approve_decline_business_store);
    app.route('/api/franchise/update').post(franchises.franchise_update);
    app.route('/api/franchise/get_order_detail').post(franchises.get_order_detail);
    
    /*app.route('/api/store/order_list').post(stores.order_list);
    app.route('/api/store/update_store_time').post(stores.update_store_time);
    app.route('/api/store/update_device_token').post(stores.update_device_token);
    app.route('/api/store/otp_verification').post(stores.store_otp_verification);
    //app.route('/api/store/apply_referral').post(stores.apply_referral);
    app.route('/api/store/get_detail').post(stores.get_detail);
    app.route('/api/store/order_payment_status_set_on_cash_on_delivery').post(stores.order_payment_status_set_on_cash_on_delivery);
    app.route('/api/store/check_order_status').post(stores.check_order_status);
    app.route('/api/store/get_store_data').post(stores.get_store_data);
    app.route('/api/store/order_history').post(stores.order_history);
    app.route('/api/store/order_history_detail').post(stores.order_history_detail);
    app.route('/api/store/get_near_by_provider').post(stores.get_near_by_provider);
    app.route('/api/store/rating_to_provider').post(stores.store_rating_to_provider);
    app.route('/api/store/rating_to_user').post(stores.store_rating_to_user);
    app.route('/api/store/cancel_request').post(stores.store_cancel_request);
    app.route('/api/store/get_user').post(stores.get_user);
    app.route('/api/store/get_country_phone_number_length').post(stores.get_country_phone_number_length);

    app.route('/api/store/complete_order').post(stores.store_complete_order);*/


};





