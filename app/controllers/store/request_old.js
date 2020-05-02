require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/push_code');
require('../../utils/constants');
var console = require('../../utils/console');

var my_request = require('../../controllers/store/request');
var Request = require('mongoose').model('request');
var Review = require('mongoose').model('review');
var utils = require('../../utils/utils');
var moment = require('moment');
var emails = require('../../controllers/email_sms/emails');
var SMS = require('../../controllers/email_sms/sms');
var User = require('mongoose').model('user');
var Country = require('mongoose').model('country');
var Provider = require('mongoose').model('provider');
var Store = require('mongoose').model('store');
var City = require('mongoose').model('city');
var Order = require('mongoose').model('order');
var Order_payment = require('mongoose').model('order_payment');
var Payment_gateway = require('mongoose').model('payment_gateway');
var Cart = require('mongoose').model('cart');
var wallet_history = require('../../controllers/user/wallet');

exports.create_request = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'order_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({_id: request_data_body.store_id}).then((store) => {
                if (store)
                {
                    if (request_data_body.server_token !== null && store.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});

                    } else
                    {
                        Order.findOne({_id: request_data_body.order_id, store_id: store._id}).then((order) => {
                            if (order) {
                                if (order.request_id == null) {
                                    User.findOne({_id: order.user_id}).then((user) => {
                                        Cart.findOne({_id: order.cart_id}).then((cart) => {
                                            var orders_array = {
                                                order_id: order._id,
                                                order_unique_id: order.unique_id,
                                                order_payment_id: order.order_payment_id,
                                                cart_id: order.cart_id
                                            }

                                            var request = new Request({
                                                country_id: order.country_id,
                                                city_id: order.city_id,
                                                timezone: order.timezone,
                                                vehicle_id: null,
                                                orders: orders_array,
                                                user_id: user._id,
                                                user_unique_id: user.unique_id,
                                                request_type: 2,
                                                request_type_id: store._id,
                                                provider_type: 0,
                                                provider_type_id: null,
                                                provider_id: null,
                                                provider_unique_id: 0,
                                                delivery_status: ORDER_STATE.WAITING_FOR_DELIVERY_MAN,
                                                delivery_status_manage_id: ORDER_STATUS_ID.RUNNING,
                                                delivery_status_by: null,
                                                current_provider: null,
                                                estimated_time_for_delivery_in_min: 0,

                                                providers_id_that_rejected_order_request: [],
                                                confirmation_code_for_pick_up_delivery: order.confirmation_code_for_pick_up_delivery,
                                                confirmation_code_for_complete_delivery: order.confirmation_code_for_complete_delivery,

                                                is_forced_assigned: false,
                                                provider_location: [],
                                                provider_previous_location: [],
                                                pickup_addresses: cart.pickup_addresses,
                                                destination_addresses: cart.destination_addresses,
                                                cancel_reasons: [],
                                                cancelled_at: null,
                                                completed_at: null

                                            });

                                            if (request_data_body.estimated_time_for_ready_order != undefined && request_data_body.estimated_time_for_ready_order && request_data_body.estimated_time_for_ready_order > 0) {
                                                var estimated_time_for_ready_order = moment.utc();
                                                estimated_time_for_ready_order = new Date(estimated_time_for_ready_order.format());
                                                estimated_time_for_ready_order.setMinutes(estimated_time_for_ready_order.getMinutes() + Number(request_data_body.estimated_time_for_ready_order))
                                                order.estimated_time_for_ready_order = estimated_time_for_ready_order;
                                                request.estimated_time_for_delivery_in_min = request_data_body.estimated_time_for_ready_order;
                                            } else
                                            {
                                                request.estimated_time_for_delivery_in_min = store.delivery_time_max;
                                            }
                                            order.request_id = request._id;
                                            order.save().then(() => {
                                                    request.save(function (error) {
                                                        if (error) {
                                                            response_data.json({
                                                                success: false,
                                                                error_code: PROVIDER_ERROR_CODE.NO_PROVIDER_FOUND
                                                            });
                                                        } else {
                                                            my_request.findNearestProvider(request, response_data);
                                                        }
                                                    }, (error) => {
                                                        console.log(error);
                                                        response_data.json({
                                                            success: false,
                                                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                        });
                                                    });
                                            }, (error) => {
                                                console.log(error);
                                                response_data.json({
                                                    success: false,
                                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                });
                                            });
                                        });
                                    });
                                } else
                                {
                                    // Reassign Request
                                    Request.findOne({_id: order.request_id}, function (error, request) {
                                        my_request.findNearestProvider(request, response_data);
                                    });
                                }

                            } else {
                                response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
                            }
                        }, (error) => {
                            console.log(error);
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });

                    }
                } else
                {

                    response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
                }

            }, (error) => {
                console.log(error);
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        } else {
            response_data.json(response);
        }
    });
};

exports.findNearestProvider = function (request, response_data) {


        Order.findOne({_id: request.orders[0].order_id}).then((order_detail) => {
            if (order_detail)
            {
                Order_payment.findOne({_id: order_detail.order_payment_id}).then((order_payment_detail) => {
                    if (order_payment_detail) {
                        Store.findOne({_id: order_detail.store_id}).then((store) => {
                            if (store) {
                                var city_id = order_detail.city_id;
                                Provider.findOne({_id: request.current_provider}).then((provider) => {

                                    City.findOne({_id: city_id}).then((city) => {

                                        Country.findOne({_id: city.country_id}).then((country) => {
                                            var currency = "";
                                            if (country)
                                            {
                                                currency = country.currency_sign;
                                            }
                                            var city_timezone = city.timezone;
                                            var provider_min_wallet_amount_for_received_cash_request = city.provider_min_wallet_amount_for_received_cash_request;
                                            var is_check_provider_wallet_amount_for_received_cash_request = city.is_check_provider_wallet_amount_for_received_cash_request;
                                            var is_payment_mode_cash = order_payment_detail.is_payment_mode_cash;
                                            var providers_id_that_rejected_order_request = request.providers_id_that_rejected_order_request;

                                            if (provider)
                                            {
                                                if (response_data == null)
                                                {
                                                    utils.insert_daily_provider_analytics(city_timezone, provider._id, ORDER_STATE.NOT_ANSWERED, false, null, false, null);

                                                }
                                                providers_id_that_rejected_order_request.push(request.current_provider);
                                                request.providers_id_that_rejected_order_request = providers_id_that_rejected_order_request;
                                            }


                                            var distance = setting_detail.default_search_radius / UNIT.DEGREE_TO_KM;

                                            var provider_query = {};
                                            if (is_check_provider_wallet_amount_for_received_cash_request && is_payment_mode_cash)
                                            {
                                                provider_query = {
                                                    '_id': {$nin: providers_id_that_rejected_order_request},
                                                    location: {$near: store.location, $maxDistance: distance},
                                                    is_online: true,
                                                    is_approved: true,
                                                    is_active_for_job: true,
                                                    city_id: city_id,
                                                    wallet: {$gte: provider_min_wallet_amount_for_received_cash_request}
                                                }

                                            } else
                                            {
                                                provider_query = {
                                                    '_id': {$nin: providers_id_that_rejected_order_request},
                                                    location: {$near: store.location, $maxDistance: distance},
                                                    is_online: true,
                                                    is_approved: true,
                                                    is_active_for_job: true,
                                                    city_id: city_id
                                                }
                                            }

                                            Provider.find(provider_query).exec(function (error, providers) {

                                                var time_left_to_responds_trip = setting_detail.provider_timeout;

                                                if (error || providers.length == 0 || time_left_to_responds_trip <= 0 ) {
                                                    request.delivery_status = ORDER_STATE.NO_DELIVERY_MAN_FOUND;
                                                    request.delivery_status_manage_id = ORDER_STATUS_ID.RUNNING;
                                                    request.providers_id_that_rejected_order_request = [];
                                                    request.provider_id = null;
                                                    request.current_provider = null;
                                                    request.save();

                                                    order_detail.request_id = request._id;
                                                    order_detail.store_notify = 0;
                                                    order_detail.save();

                                                    // send push to store
                                                    var device_type = store.device_type;
                                                    var device_token = store.device_token;
                                                    if (response_data == null) {
                                                        utils.sendPushNotification(ADMIN_DATA_ID.STORE, device_type, device_token, STORE_PUSH_CODE.DELIVERY_MAN_NOT_FOUND, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                                                    }

                                                    if (response_data) {
                                                        response_data.json({
                                                            success: false,
                                                            error_code: PROVIDER_ERROR_CODE.NO_PROVIDER_FOUND
                                                        });
                                                    }

                                                } else
                                                {
                                                    var provider = providers[0];
                                                    var provider_id = provider._id;

                                                    provider.total_requests = provider.total_requests + 1;

                                                    request.provider_type = provider.provider_type;
                                                    request.provider_type_id = provider_id;
                                                    request.provider_location = provider.location;
                                                    request.provider_previous_location = provider.previous_location;

                                                    request.current_provider = provider_id;
                                                    request.delivery_status = ORDER_STATE.WAITING_FOR_DELIVERY_MAN;
                                                    request.delivery_status_manage_id = ORDER_STATUS_ID.RUNNING;
                                                    request.delivery_status_by = null;

                                                    var index = request.date_time.findIndex((x) => x.status == ORDER_STATE.WAITING_FOR_DELIVERY_MAN);
                                                    if (index == -1) {
                                                        request.date_time.push({status: ORDER_STATE.WAITING_FOR_DELIVERY_MAN, date: new Date()});
                                                    } else {
                                                        request.date_time[index].date = new Date();
                                                    }

                                                    request.markModified('date_time');
                                                    request.save().then(() => {
                                                            provider.save();
                                                            var device_type = provider.device_type;
                                                            var device_token = provider.device_token;

                                                            order_detail.request_id = request._id;
                                                            order_detail.save();
                                                            Order_payment.findOne({_id: order_detail.order_payment_id}).then((order_payment) => {
                                                                var total_order_price = 0;
                                                                var total_provider_income = 0;
                                                                if (order_payment)
                                                                {
                                                                    total_order_price = order_payment.total_order_price;
                                                                    total_provider_income = order_payment.total_provider_income;
                                                                }
                                                                // Entry in Provider Analytic Table
                                                                utils.insert_daily_provider_analytics(city_timezone, provider._id, ORDER_STATE.WAITING_FOR_DELIVERY_MAN, false, null, false, null);

                                                                var request_detail = {};
                                                                if (order_detail.estimated_time_for_ready_order != undefined)
                                                                {
                                                                    request_detail = {
                                                                        request_id: request._id,
                                                                        request_count: 0,
                                                                        unique_id: request.unique_id,
                                                                        estimated_time_for_ready_order: order_detail.estimated_time_for_ready_order,
                                                                        pickup_addresses: request.pickup_addresses,
                                                                        total_order_price: total_order_price,
                                                                        total_provider_income: total_provider_income,
                                                                        currency: currency,
                                                                        destination_addresses: request.destination_addresses,
                                                                        created_at: request.created_at,
                                                                        store_name: store.name,
                                                                        store_image: store.image_url

                                                                    }
                                                                } else
                                                                {
                                                                    request_detail = {
                                                                        request_id: request._id,
                                                                        request_count: 0,
                                                                        unique_id: request.unique_id,
                                                                        estimated_time_for_delivery_in_min: request.estimated_time_for_delivery_in_min,
                                                                        pickup_addresses: request.pickup_addresses,
                                                                        total_order_price: total_order_price,
                                                                        total_provider_income: total_provider_income,
                                                                        currency: currency,
                                                                        destination_addresses: request.destination_addresses,
                                                                        created_at: request.created_at,
                                                                        store_name: store.name,
                                                                        store_image: store.image_url
                                                                    }

                                                                }

                                                                utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.PROVIDER, device_type, device_token, PROVIDER_PUSH_CODE.NEW_REQUEST, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, request_detail, time_left_to_responds_trip);
                                                                if (response_data) {
                                                                    response_data.json({
                                                                        success: true,
                                                                        message: ORDER_MESSAGE_CODE.REQUEST_CREATE_SUCCESSFULLY,
                                                                        request: request,
                                                                        provider_detail: provider
                                                                    });
                                                                }
                                                            }, (error) => {
                                                                console.log(error);
                                                                response_data.json({
                                                                    success: false,
                                                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                                });
                                                            });

                                                    }, (error) => {
                                                        console.log(error);
                                                        response_data.json({
                                                            success: false,
                                                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                        });
                                                    });
                                                }
                                            });

                                        });

                                    }, (error) => {
                                        console.log(error);
                                        response_data.json({
                                            success: false,
                                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                        });
                                    });

                                }, (error) => {
                                    console.log(error);
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
                                });
                            }

                        }, (error) => {
                            console.log(error);
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });

                    } else {
                        response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
                    }
                }, (error) => {
                    console.log(error);
                    response_data.json({
                        success: false,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                    });
                });

            } else {
                response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
            }
        }, (error) => {
            console.log(error);
            response_data.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        });

};

exports.change_request_status = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'delivery_status'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Provider.findOne({_id: request_data_body.provider_id}).then((provider) => {
                if (provider)
                {
                    if (request_data_body.server_token !== null && provider.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {
                        var delivery_status = Number(request_data_body.delivery_status);


                        if (delivery_status == ORDER_STATE.DELIVERY_MAN_ACCEPTED) {

                            exports.accept_request(provider, request_data, function (return_data) {
                                response_data.json(return_data);
                            });

                        } else if (delivery_status == ORDER_STATE.DELIVERY_MAN_COMING) {

                            exports.coming_for_pickup(provider, request_data, function (return_data) {
                                response_data.json(return_data);
                            });

                        } else if (delivery_status == ORDER_STATE.DELIVERY_MAN_ARRIVED) {

                            exports.arrived_at_pickup(provider, request_data, function (return_data) {
                                response_data.json(return_data);
                            });

                        } else if (delivery_status == ORDER_STATE.DELIVERY_MAN_PICKED_ORDER) {

                            exports.pickup_order(provider, request_data, function (return_data) {
                                response_data.json(return_data);
                            });

                        } else if (delivery_status == ORDER_STATE.DELIVERY_MAN_STARTED_DELIVERY) {

                            exports.started_for_delivery(provider, request_data, function (return_data) {
                                response_data.json(return_data);
                            });

                        } else if (delivery_status == ORDER_STATE.DELIVERY_MAN_ARRIVED_AT_DESTINATION) {

                            exports.arrived_at_destination(provider, request_data, function (return_data) {
                                response_data.json(return_data);
                            });

                        } else {
                            response_data.json({success: false});
                        }
                    }
                } else
                {
                    response_data.json({success: false, error_code: PROVIDER_ERROR_CODE.PROVIDER_DATA_NOT_FOUND});
                }

            }, (error) => {
                console.log(error);
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        } else {
            response_data.json(response);
        }
    });
};

exports.accept_request = function (provider , request_data, response_data) {
    var request_data_body = request_data.body;
    var request_id = request_data_body.request_id;
    var delivery_status = Number(request_data_body.delivery_status);

    Request.findOne({_id: request_id , current_provider : provider._id , provider_id : null , delivery_status_manage_id: ORDER_STATUS_ID.RUNNING}).then((request) => {
      
        if (request) {

            User.findOne({_id: request.user_id}).then((user) => {

                Order.findOne({_id: request.orders[0].order_id}).then((order) => {

                    if (order) {
                        var city_timezone = request.timezone;
                        Store.findOne({_id: order.store_id}).then((store) => {

                            var order_data = {order_id: order._id, order_unique_id: order.unique_id,
                                confirmation_code_for_complete_delivery: order.confirmation_code_for_complete_delivery,
                                store_name: store.name, store_image: store.image_url}

                            request.delivery_status = delivery_status;
                            request.provider_id = provider._id;
                            request.provider_unique_id = provider.unique_id;
                            request.current_provider = provider._id;

                            var index = request.date_time.findIndex((x) => x.status == ORDER_STATE.DELIVERY_MAN_ACCEPTED);
                            if (index == -1) {
                                request.date_time.push({status: ORDER_STATE.DELIVERY_MAN_ACCEPTED, date: new Date()});
                            } else {
                                request.date_time[index].date = new Date();
                            }
                            request.markModified('date_time');
                            request.save().then(() => {

                                    var user_device_type = "";
                                    var user_device_token = "";
                                    if (user) {
                                        user_device_type = user.device_type;
                                        user_device_token = user.device_token;
                                    }

                                    var device_type = store.device_type;
                                    var device_token = store.device_token;
                                    var store_phone_with_code = store.country_phone_code + store.phone;

                                    utils.insert_daily_provider_analytics(city_timezone, provider._id, ORDER_STATE.DELIVERY_MAN_ACCEPTED, false, null, false, null);
                                    provider.total_accepted_requests = provider.total_accepted_requests + 1;
                                    provider.save();

                                    if (setting_detail.is_sms_notification)
                                    {
                                        SMS.sendOtherSMS(store_phone_with_code, SMS_UNIQUE_ID.DELIVERY_MAN_ACCEPTED, "");
                                    }

                                    if (setting_detail.is_mail_notification) {
                                        emails.sendDeliverymanAcceptedEmail(request_data, store);
                                    }

                                    utils.sendPushNotification(ADMIN_DATA_ID.STORE, device_type, device_token, STORE_PUSH_CODE.DELIVERY_MAN_ACCEPTED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                                    utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, user_device_type, user_device_token, USER_PUSH_CODE.DELIVERY_MAN_ACCEPTED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_data, "");

                                    response_data({
                                        success: true,
                                        message: ORDER_MESSAGE_CODE.CHANGE_ORDER_STATUS_SUCCESSFULLY,
                                        delivery_status: request.delivery_status
                                    });

                            }, (error) => {
                                console.log(error);
                                response_data.json({
                                    success: false,
                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                });
                            });
                        });
                    }else{
                        response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_ALREADY_CANCELLED});
                    }

                }, (error) => {
                    console.log(error);
                    response_data.json({
                        success: false,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                    });
                });

            }, (error) => {
                console.log(error);
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        } else
        {
            response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_ALREADY_CANCELLED});
        }

    }, (error) => {
        console.log(error);
        response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
        });
    });

};

exports.coming_for_pickup = function (provider , request_data, response_data) {
    var request_data_body = request_data.body;
    var request_id = request_data_body.request_id;
    var delivery_status = Number(request_data_body.delivery_status);

    Request.findOne({_id: request_id , provider_id : provider._id , delivery_status_manage_id: ORDER_STATUS_ID.RUNNING}).then((request) => {

        if (request) {

            User.findOne({_id: request.user_id}).then((user) => {

                Order.findOne({_id: request.orders[0].order_id}).then((order) => {

                    if (order) {

                        Store.findOne({_id: order.store_id}).then((store) => {

                            var order_data = {order_id: order._id, order_unique_id: order.unique_id,
                                confirmation_code_for_complete_delivery: order.confirmation_code_for_complete_delivery,
                                store_name: store.name, store_image: store.image_url}

                            request.delivery_status = delivery_status;

                            var index = request.date_time.findIndex((x) => x.status == ORDER_STATE.DELIVERY_MAN_COMING);
                            if (index == -1) {
                                request.date_time.push({status: ORDER_STATE.DELIVERY_MAN_COMING, date: new Date()});
                            } else {
                                request.date_time[index].date = new Date();
                            }
                            request.markModified('date_time');
                            request.save().then(() => {

                                    var user_device_type = "";
                                    var user_device_token = "";
                                    if (user) {
                                        user_device_type = user.device_type;
                                        user_device_token = user.device_token;
                                    }

                                    var device_type = store.device_type;
                                    var device_token = store.device_token;
                                    var store_phone_with_code = store.country_phone_code + store.phone;

                                    if (setting_detail.is_sms_notification)
                                    {
                                        SMS.sendOtherSMS(store_phone_with_code, SMS_UNIQUE_ID.DELIVERY_MAN_COMING, "");
                                    }

                                    if (setting_detail.is_mail_notification)
                                    {
                                        emails.sendDeliverymanComingEmail(request_data, store);
                                    }

                                    utils.sendPushNotification(ADMIN_DATA_ID.STORE, device_type, device_token, STORE_PUSH_CODE.DELIVERY_MAN_COMING, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                                    utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, user_device_type, user_device_token, USER_PUSH_CODE.DELIVERY_MAN_COMING, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_data, "");

                                    response_data({
                                        success: true,
                                        message: ORDER_MESSAGE_CODE.CHANGE_ORDER_STATUS_SUCCESSFULLY,
                                        delivery_status: request.delivery_status
                                    });
                            }, (error) => {
                                console.log(error);
                                response_data.json({
                                    success: false,
                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                });
                            });
                        });
                    }else{
                        response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_ALREADY_CANCELLED});
                    }

                }, (error) => {
                    console.log(error);
                    response_data.json({
                        success: false,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                    });
                });

            }, (error) => {
                console.log(error);
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        } else
        {
            response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_ALREADY_CANCELLED});
        }
    }, (error) => {
        console.log(error);
        response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
        });
    });

};

exports.arrived_at_pickup = function (provider , request_data, response_data) {
    var request_data_body = request_data.body;
    var request_id = request_data_body.request_id;
    var delivery_status = Number(request_data_body.delivery_status);

    Request.findOne({_id: request_id , provider_id : provider._id , delivery_status_manage_id: ORDER_STATUS_ID.RUNNING}).then((request) => {

        if (request) {

            User.findOne({_id: request.user_id}).then((user) => {

                Order.findOne({_id: request.orders[0].order_id}).then((order) => {

                    if (order) {

                        Store.findOne({_id: order.store_id}).then((store) => {

                            var order_data = {order_id: order._id, order_unique_id: order.unique_id,
                                confirmation_code_for_complete_delivery: order.confirmation_code_for_complete_delivery,
                                store_name: store.name, store_image: store.image_url};

                            request.delivery_status = delivery_status;

                            var index = request.date_time.findIndex((x) => x.status == ORDER_STATE.DELIVERY_MAN_ARRIVED);
                            if (index == -1) {
                                request.date_time.push({status: ORDER_STATE.DELIVERY_MAN_ARRIVED, date: new Date()});
                            } else {
                                request.date_time[index].date = new Date();
                            }
                            request.markModified('date_time');
                            request.save().then(() => {

                                    var user_device_type = "";
                                    var user_device_token = "";
                                    if (user) {
                                        user_device_type = user.device_type;
                                        user_device_token = user.device_token;
                                    }

                                    var device_type = store.device_type;
                                    var device_token = store.device_token;
                                    var store_phone_with_code = store.country_phone_code + store.phone;

                                    if (setting_detail.is_sms_notification)
                                    {
                                        SMS.sendOtherSMS(store_phone_with_code, SMS_UNIQUE_ID.DELIVERY_MAN_ARRIVED, "");
                                    }
                                    if (setting_detail.is_mail_notification)
                                    {
                                        emails.sendDeliverymanArrivedEmail(request_data, store);
                                    }

                                    utils.sendPushNotification(ADMIN_DATA_ID.STORE, device_type, device_token, STORE_PUSH_CODE.DELIVERY_MAN_ARRIVED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                                    utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, user_device_type, user_device_token, USER_PUSH_CODE.DELIVERY_MAN_ARRIVED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_data, "");

                                    response_data({
                                        success: true,
                                        message: ORDER_MESSAGE_CODE.CHANGE_ORDER_STATUS_SUCCESSFULLY,
                                        delivery_status: request.delivery_status
                                    });

                            }, (error) => {
                                console.log(error);
                                response_data.json({
                                    success: false,
                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                });
                            });
                        });
                    }else{
                        response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_ALREADY_CANCELLED});
                    }

                }, (error) => {
                    console.log(error);
                    response_data.json({
                        success: false,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                    });
                });

            }, (error) => {
                console.log(error);
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        } else
        {
            response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_ALREADY_CANCELLED});
        }

    }, (error) => {
        console.log(error);
        response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
        });
    });

};

exports.pickup_order = function (provider , request_data, response_data) {
    var request_data_body = request_data.body;
    var request_id = request_data_body.request_id;
    var delivery_status = Number(request_data_body.delivery_status);

    Request.findOne({_id: request_id , provider_id : provider._id , delivery_status_manage_id: ORDER_STATUS_ID.RUNNING}).then((request) => {

        if (request) {

            User.findOne({_id: request.user_id}).then((user) => {

                Order.findOne({_id: request.orders[0].order_id}).then((order) => {

                    if (order) {

                        Order_payment.findOne({_id: request.orders[0].order_payment_id}).then((order_payment) => {
                            Store.findOne({_id: order.store_id}).then((store) => {

                                var order_data = {order_id: order._id, order_unique_id: order.unique_id,
                                    confirmation_code_for_complete_delivery: order.confirmation_code_for_complete_delivery,
                                    store_name: store.name, store_image: store.image_url};

                                if (order.order_status == ORDER_STATE.ORDER_READY) {
                                    request.delivery_status = delivery_status;

                                    var index = request.date_time.findIndex((x) => x.status == ORDER_STATE.DELIVERY_MAN_PICKED_ORDER);
                                    if (index == -1) {
                                        request.date_time.push({status: ORDER_STATE.DELIVERY_MAN_PICKED_ORDER, date: new Date()});
                                    } else {
                                        request.date_time[index].date = new Date();
                                    }
                                    request.markModified('date_time');
                                    var date = new Date();
                                    var min = date.getMinutes();
                                    var create_date_min = (request.created_at).getMinutes();
                                    var main_min = min - create_date_min;
                                    request.estimated_time_for_delivery_in_min = (+order_payment.total_time + +request.estimated_time_for_delivery_in_min) - main_min;

                                    request.save().then(() => {

                                            var user_device_type = "";
                                            var user_device_token = "";
                                            var phone_with_code = "";
                                            if (user) {
                                                user_device_type = user.device_type;
                                                user_device_token = user.device_token;
                                                phone_with_code = user.country_phone_code + user.phone;
                                            }

                                            var device_type = store.device_type;
                                            var device_token = store.device_token;

                                            var provider_phone_with_code = provider.country_phone_code + provider.phone;

                                            if (setting_detail.is_sms_notification)
                                            {
                                                SMS.sendOtherSMS(provider_phone_with_code, SMS_UNIQUE_ID.PROVIDER_ORDER_REMAINING, "");
                                                SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.USER_ORDER_DISPATCH, "");
                                                SMS.sendSmsForOTPVerificationAndForgotPassword(phone_with_code, SMS_UNIQUE_ID.USER_ORDER_DIGITAL_CODE, order.confirmation_code_for_complete_delivery);
                                            }

                                            if (setting_detail.is_mail_notification) {
                                                emails.sendOrderRemainingEmail(request_data, provider);
                                                emails.sendOrderDispatchEmail(request_data, user);
                                                emails.sendOrderDigitalCodeEmail(request_data, user, order.confirmation_code_for_complete_delivery);
                                            }

                                            utils.sendPushNotification(ADMIN_DATA_ID.STORE, device_type, device_token, STORE_PUSH_CODE.DELIVERY_MAN_PICKED_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                                            utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, user_device_type, user_device_token, USER_PUSH_CODE.DELIVERY_MAN_PICKED_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_data, "");


                                            response_data({
                                                success: true,
                                                message: ORDER_MESSAGE_CODE.CHANGE_ORDER_STATUS_SUCCESSFULLY,
                                                delivery_status: request.delivery_status
                                            });

                                    }, (error) => {
                                        console.log(error);
                                        response_data.json({
                                            success: false,
                                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                        });
                                    });
                                } else
                                {
                                    response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_READY});
                                }
                            });

                        }, (error) => {
                            console.log(error);
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        })
                    }else{
                        response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_ALREADY_CANCELLED});
                    }

                }, (error) => {
                    console.log(error);
                    response_data.json({
                        success: false,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                    });
                });

            }, (error) => {
                console.log(error);
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        } else
        {
            response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_ALREADY_CANCELLED});
        }
    }, (error) => {
        console.log(error);
        response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
        });
    });

};

exports.started_for_delivery = function (provider , request_data, response_data) {
    var request_data_body = request_data.body;
    var request_id = request_data_body.request_id;
    var delivery_status = Number(request_data_body.delivery_status);

    Request.findOne({_id: request_id , provider_id : provider._id , delivery_status_manage_id: ORDER_STATUS_ID.RUNNING}).then((request) => {

        if (request) {

            User.findOne({_id: request.user_id}).then((user) => {

                Order.findOne({_id: request.orders[0].order_id}).then((order) => {

                    if (order) {

                        Store.findOne({_id: order.store_id}).then((store) => {

                            var order_data = {order_id: order._id, order_unique_id: order.unique_id,
                                confirmation_code_for_complete_delivery: order.confirmation_code_for_complete_delivery,
                                store_name: store.name, store_image: store.image_url};


                            request.delivery_status = delivery_status;

                            var index = request.date_time.findIndex((x) => x.status == ORDER_STATE.DELIVERY_MAN_STARTED_DELIVERY);
                            if (index == -1) {
                                request.date_time.push({status: ORDER_STATE.DELIVERY_MAN_STARTED_DELIVERY, date: new Date()});
                            } else {
                                request.date_time[index].date = new Date();
                            }
                            request.markModified('date_time');
                            request.save().then(() => {

                                    var user_device_type = "";
                                    var user_device_token = "";
                                    var phone_with_code = "";
                                    if (user) {
                                        user_device_type = user.device_type;
                                        user_device_token = user.device_token;
                                        phone_with_code = user.country_phone_code + user.phone;
                                    }

                                    var device_type = store.device_type;
                                    var device_token = store.device_token;
                                    var store_phone_with_code = store.country_phone_code + store.phone;

                                    if (setting_detail.is_sms_notification)
                                    {
                                        SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.DELIVERY_MAN_ON_THE_WAY, "");
                                        SMS.sendOtherSMS(store_phone_with_code, SMS_UNIQUE_ID.DELIVERY_MAN_STARTED_DELIVERY, "");
                                    }
                                    if (setting_detail.is_mail_notification) {
                                        emails.sendDeliverymanOnTheWayEmail(request_data, user);
                                        emails.sendDeliverymanStartDeliveryEmail(request_data, store);
                                    }

                                    utils.sendPushNotification(ADMIN_DATA_ID.STORE, device_type, device_token, STORE_PUSH_CODE.DELIVERY_MAN_STARTED_DELIVERY, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                                    utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, user_device_type, user_device_token, USER_PUSH_CODE.DELIVERY_MAN_STARTED_DELIVERY, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_data, "");

                                    response_data({
                                        success: true,
                                        message: ORDER_MESSAGE_CODE.CHANGE_ORDER_STATUS_SUCCESSFULLY,
                                        delivery_status: request.delivery_status
                                    });

                            });
                        });
                    }else{
                        response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_ALREADY_CANCELLED});
                    }

                }, (error) => {
                    console.log(error);
                    response_data.json({
                        success: false,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                    });
                });

            }, (error) => {
                console.log(error);
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        } else
        {
            response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_ALREADY_CANCELLED});
        }

    }, (error) => {
        console.log(error);
        response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
        });
    });

};

exports.arrived_at_destination = function (provider , request_data, response_data) {
    var request_data_body = request_data.body;
    var request_id = request_data_body.request_id;
    var delivery_status = Number(request_data_body.delivery_status);

    Request.findOne({_id: request_id , provider_id : provider._id , delivery_status_manage_id: ORDER_STATUS_ID.RUNNING}).then((request) => {

        if (request) {

            User.findOne({_id: request.user_id}).then((user) => {

                Order.findOne({_id: request.orders[0].order_id}).then((order) => {

                    if (order) {

                        Store.findOne({_id: order.store_id}).then((store) => {

                            var order_data = {order_id: order._id, order_unique_id: order.unique_id,
                                confirmation_code_for_complete_delivery: order.confirmation_code_for_complete_delivery,
                                store_name: store.name, store_image: store.image_url};

                            request.delivery_status = delivery_status;

                            var index = request.date_time.findIndex((x) => x.status == ORDER_STATE.DELIVERY_MAN_ARRIVED_AT_DESTINATION);
                            if (index == -1) {
                                request.date_time.push({status: ORDER_STATE.DELIVERY_MAN_ARRIVED_AT_DESTINATION, date: new Date()});
                            } else {
                                request.date_time[index].date = new Date();
                            }
                            request.markModified('date_time');
                            request.save().then(() => {

                                var user_device_type = "";
                                var user_device_token = "";
                                var phone_with_code = "";
                                if (user) {
                                    user_device_type = user.device_type;
                                    user_device_token = user.device_token;
                                    phone_with_code = user.country_phone_code + user.phone;
                                }

                                var device_type = store.device_type;
                                var device_token = store.device_token;
                                var store_phone_with_code = store.country_phone_code + store.phone;

                                if (setting_detail.is_sms_notification)
                                {
                                    SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.DELIVERY_MAN_ARRIVED_AT_DESTINATION, "");
                                    SMS.sendOtherSMS(store_phone_with_code, SMS_UNIQUE_ID.DELIVERY_MAN_REACHED_AT_DESTINATION, "");
                                }

                                if (setting_detail.is_mail_notification) {
                                    emails.sendDeliverymanArrivedAtDestinationEmail(request_data, user);
                                    emails.sendDeliverymanReachedAtDestinationEmail(request_data, store);
                                }

                                utils.sendPushNotification(ADMIN_DATA_ID.STORE, device_type, device_token, STORE_PUSH_CODE.DELIVERY_MAN_ARRIVED_AT_DESTINATION, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                                utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, user_device_type, user_device_token, USER_PUSH_CODE.DELIVERY_MAN_ARRIVED_AT_DESTINATION, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_data, "");

                                response_data({
                                    success: true,
                                    message: ORDER_MESSAGE_CODE.CHANGE_ORDER_STATUS_SUCCESSFULLY,
                                    delivery_status: request.delivery_status
                                });

                            }, (error) => {
                                console.log(error);
                                response_data.json({
                                    success: false,
                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                });
                            });
                        });
                    }else{
                        response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_ALREADY_CANCELLED});
                    }

                }, (error) => {
                    console.log(error);
                    response_data.json({
                        success: false,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                    });
                });

            }, (error) => {
                console.log(error);
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        } else
        {
            response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_ALREADY_CANCELLED});
        }
    }, (error) => {
        console.log(error);
        response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
        });
    });

};

exports.complete_request = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'request_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var request_id = request_data_body.request_id;

            Provider.findOne({_id: request_data_body.provider_id}).then((provider) => {
                if (provider)
                {
                    if (request_data_body.server_token !== null && provider.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {
                        City.findOne({_id: provider.city_id}).then((city) => {

                            var is_provider_earning_add_in_wallet_on_cash_payment_for_city = city.is_provider_earning_add_in_wallet_on_cash_payment;
                            var is_store_earning_add_in_wallet_on_cash_payment_for_city = city.is_store_earning_add_in_wallet_on_cash_payment;
                            var is_provider_earning_add_in_wallet_on_other_payment_for_city = city.is_provider_earning_add_in_wallet_on_other_payment;
                            var is_store_earning_add_in_wallet_on_other_payment_for_city = city.is_store_earning_add_in_wallet_on_other_payment;


                            var city_timezone = city.timezone;
                            var now = new Date();
                            var today_start_date_time = utils.get_date_now_at_city(now, city_timezone);
                            var tag_date = moment(today_start_date_time).format(DATE_FORMATE.DDMMYYYY);

                            Request.findOne({_id: request_id, provider_id: request_data_body.provider_id, delivery_status_manage_id: ORDER_STATUS_ID.RUNNING}).then((request) => {
                                if (request) {
                                    User.findOne({_id: request.user_id}).then((user) => {
                                        var user_device_type = user.device_type;
                                        var user_device_token = user.device_token;

                                        Order.findOne({_id: request.orders[0].order_id}).then((order_detail) => {
                                            if (order_detail) {
                                                var country_id = order_detail.country_id;

                                                Store.findOne({_id: order_detail.store_id}).then((store) => {

                                                    if (country_id == null && country_id == undefined)
                                                    {
                                                        country_id = store.country_id;
                                                    }

                                                    Country.findOne({_id: country_id}).then((country) => {

                                                        var currency = "";
                                                        if (country) {
                                                            currency = country.currency_sign;
                                                        }

                                                        var device_type = store.device_type;
                                                        var device_token = store.device_token;
                                                        var phone_with_code = store.country_phone_code + store.phone;


                                                        request.delivery_status_manage_id = ORDER_STATUS_ID.COMPLETED;
                                                        request.delivery_status_by = request_data_body.provider_id;
                                                        request.delivery_status = ORDER_STATE.ORDER_COMPLETED;
                                                        request.completed_at = now;
                                                        request.completed_date_tag = tag_date;
                                                        request.completed_date_in_city_timezone = today_start_date_time;

                                                        var index = request.date_time.findIndex((x) => x.status == ORDER_STATE.ORDER_COMPLETED);
                                                        if (index == -1) {
                                                            request.date_time.push({status: ORDER_STATE.ORDER_COMPLETED, date: new Date()});
                                                        } else {
                                                            request.date_time[index].date = new Date();
                                                        }
                                                        request.markModified('date_time');
                                                        request.save();

                                                        order_detail.order_status_manage_id = ORDER_STATUS_ID.COMPLETED;
                                                        order_detail.order_status_id = ORDER_STATUS_ID.COMPLETED;
                                                        order_detail.order_status_by = request_data_body.provider_id;
                                                        order_detail.order_status = ORDER_STATE.ORDER_COMPLETED;
                                                        order_detail.completed_at = now;
                                                        order_detail.completed_date_tag = tag_date;
                                                        order_detail.completed_date_in_city_timezone = today_start_date_time;

                                                        var index = order_detail.date_time.findIndex((x) => x.status == ORDER_STATE.ORDER_COMPLETED);
                                                        if (index == -1) {
                                                            order_detail.date_time.push({status: ORDER_STATE.ORDER_COMPLETED, date: new Date()});
                                                        } else {
                                                            order_detail.date_time[index].date = new Date();
                                                        }
                                                        // Provider Analytic Table //
                                                        utils.insert_daily_provider_analytics(city_timezone, provider._id, ORDER_STATE.ORDER_COMPLETED, false, null, false, null);

                                                        order_detail.save();
                                                        Order_payment.findOne({_id: order_detail.order_payment_id}).then((order_payment) => {
                                                            if (order_payment) {
                                                                utils.insert_daily_store_analytics(tag_date, order_detail.store_id, ORDER_STATE.ORDER_COMPLETED, order_payment.total_item_count, false);

                                                                var payment_gateway_name = "Cash";
                                                                var is_payment_mode_cash = order_payment.is_payment_mode_cash;

                                                                var store_have_service_payment = 0;
                                                                var store_have_order_payment = 0;
                                                                var total_store_have_payment = 0;
                                                                var pay_to_store = 0;
                                                                var provider_have_cash_payment = 0;
                                                                var provider_paid_order_payment = 0;
                                                                var total_provider_have_payment = 0;
                                                                var pay_to_provider = 0;
                                                                
                                                                if (store.is_store_pay_delivery_fees && order_payment.total_order_price >= store.free_delivery_for_above_order_price) {
                                                                    store_have_service_payment = order_payment.total_delivery_price;
                                                                    store_have_service_payment = utils.precisionRoundTwo(store_have_service_payment);
                                                                }

                                                                if (is_payment_mode_cash) {
                                                                    provider_have_cash_payment = order_payment.cash_payment;
                                                                    if (!order_payment.is_order_price_paid_by_store) {
                                                                        store_have_order_payment = order_payment.total_order_price;
                                                                        store_have_order_payment = utils.precisionRoundTwo(store_have_order_payment);
                                                                        provider_paid_order_payment = order_payment.total_order_price;
                                                                        provider_paid_order_payment = utils.precisionRoundTwo(provider_paid_order_payment);
                                                                    }
                                                                }
                                                                var other_promo_payment_loyalty = order_payment.other_promo_payment_loyalty;
                                                                total_store_have_payment = +store_have_service_payment + +store_have_order_payment;
                                                                total_store_have_payment = utils.precisionRoundTwo(total_store_have_payment);
                                                                pay_to_store = order_payment.total_store_income - total_store_have_payment - other_promo_payment_loyalty;
                                                                pay_to_store = utils.precisionRoundTwo(pay_to_store);

                                                                total_provider_have_payment = provider_have_cash_payment - provider_paid_order_payment;
                                                                total_provider_have_payment = utils.precisionRoundTwo(total_provider_have_payment);
                                                                pay_to_provider = order_payment.total_provider_income - total_provider_have_payment;
                                                                pay_to_provider = utils.precisionRoundTwo(pay_to_provider);

                                                                order_payment.pay_to_store = pay_to_store;
                                                                order_payment.pay_to_provider = pay_to_provider;
                                                                order_payment.completed_at = now;
                                                                order_payment.completed_date_tag = tag_date;
                                                                order_payment.completed_date_in_city_timezone = today_start_date_time;

                                                                Payment_gateway.findOne({_id: order_payment.payment_id}).then((payment_gateway) => {

                                                                    if (!is_payment_mode_cash) {
                                                                        payment_gateway_name = payment_gateway.name;
                                                                    }
                                                                    if ((setting_detail.is_provider_earning_add_in_wallet_on_cash_payment && is_provider_earning_add_in_wallet_on_cash_payment_for_city) || (setting_detail.is_provider_earning_add_in_wallet_on_other_payment && is_provider_earning_add_in_wallet_on_other_payment_for_city))
                                                                    {
                                                                        if (pay_to_provider<0) {
                                                                            var total_wallet_amount = wallet_history.add_wallet_history(ADMIN_DATA_ID.PROVIDER, provider.unique_id, provider._id, provider.country_id,
                                                                                provider.wallet_currency_code, order_payment.order_currency_code,
                                                                                1, Math.abs(pay_to_provider), provider.wallet, WALLET_STATUS_ID.REMOVE_WALLET_AMOUNT, WALLET_COMMENT_ID.SET_ORDER_PROFIT, "Profit Of This Order : " + order_detail.unique_id);

                                                                            provider.wallet = total_wallet_amount;
                                                                        } else
                                                                        {
                                                                            var total_wallet_amount = wallet_history.add_wallet_history(ADMIN_DATA_ID.PROVIDER, provider.unique_id, provider._id, provider.country_id,
                                                                                provider.wallet_currency_code, order_payment.order_currency_code,
                                                                                1, pay_to_provider, provider.wallet, WALLET_STATUS_ID.ADD_WALLET_AMOUNT, WALLET_COMMENT_ID.SET_ORDER_PROFIT, "Profit Of This Order : " + order_detail.unique_id);

                                                                            provider.wallet = total_wallet_amount;

                                                                        }
                                                                        provider.save();
                                                                        order_payment.is_provider_income_set_in_wallet = true;
                                                                        order_payment.provider_income_set_in_wallet = Math.abs(pay_to_provider);
                                                                    }
                                                                    if ((setting_detail.is_store_earning_add_in_wallet_on_cash_payment && is_store_earning_add_in_wallet_on_cash_payment_for_city) || (setting_detail.is_store_earning_add_in_wallet_on_other_payment && is_store_earning_add_in_wallet_on_other_payment_for_city))
                                                                    {
                                                                        if (pay_to_store<0) {

                                                                            var store_total_wallet_amount = wallet_history.add_wallet_history(ADMIN_DATA_ID.STORE, store.unique_id, store._id, store.country_id,
                                                                                store.wallet_currency_code, order_payment.order_currency_code,
                                                                                1, Math.abs(pay_to_store), store.wallet, WALLET_STATUS_ID.REMOVE_WALLET_AMOUNT, WALLET_COMMENT_ID.SET_ORDER_PROFIT, "Profit Of This Order : " + order_detail.unique_id);

                                                                            store.wallet = store_total_wallet_amount;
                                                                        } else
                                                                        {
                                                                            var store_total_wallet_amount = wallet_history.add_wallet_history(ADMIN_DATA_ID.STORE, store.unique_id, store._id, store.country_id,
                                                                                store.wallet_currency_code, order_payment.order_currency_code,
                                                                                1, pay_to_store, store.wallet, WALLET_STATUS_ID.ADD_WALLET_AMOUNT, WALLET_COMMENT_ID.SET_ORDER_PROFIT, "Profit Of This Order : " + order_detail.unique_id);

                                                                            store.wallet = store_total_wallet_amount;
                                                                        }

                                                                        store.save();
                                                                        order_payment.is_store_income_set_in_wallet = true;
                                                                        order_payment.store_income_set_in_wallet = Math.abs(pay_to_store);
                                                                    }

                                                                    if (setting_detail.is_sms_notification)
                                                                    {
                                                                        SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.STORE_ORDER_COMPLETED, "");
                                                                    }

                                                                    if (setting_detail.is_mail_notification) {
                                                                        emails.sendUserOrderCompleteEmail(request_data, user);
                                                                        emails.sendStoreOrderCompleteEmail(request_data, store);
                                                                        emails.sendStoreInvoiceEmail(request_data, user, provider, store, order_payment, currency);
                                                                        emails.sendProviderOrderDeliveredEmail(request_data, provider);
                                                                    }

                                                                    order_payment.delivered_at = now;
                                                                    order_payment.provider_id = provider._id;
                                                                    order_payment.save();


                                                                    // Entry In Review Table //
                                                                    var reviews = new Review({
                                                                        order_id: order_detail._id,
                                                                        order_unique_id: order_detail.unique_id,
                                                                        user_id: order_detail.user_id,
                                                                        store_id: order_detail.store_id,
                                                                        provider_id: provider._id
                                                                    });
                                                                    reviews.save();

                                                                    var order_data = {
                                                                        order_id: order_detail._id,
                                                                        unique_id: order_detail.unique_id,
                                                                        store_name: store.name,
                                                                        store_image: store.image_url
                                                                    }

                                                                    utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, user_device_type, user_device_token, USER_PUSH_CODE.DELIVERY_MAN_COMPLETE_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_data, "");
                                                                    utils.sendPushNotification(ADMIN_DATA_ID.STORE, device_type, device_token, STORE_PUSH_CODE.DELIVERY_MAN_COMPLETE_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                                                                    response_data.json({
                                                                        success: true,
                                                                        message: ORDER_MESSAGE_CODE.ORDER_COMPLETED_SUCCESSFULLY,
                                                                        request_id: request._id,
                                                                        delivery_status: request.delivery_status,
                                                                        order_id: order_detail._id,
                                                                        order_status: order_detail.order_status,
                                                                        currency: currency,
                                                                        payment_gateway_name: payment_gateway_name,
                                                                        order_payment: order_payment
                                                                    });

                                                                });

                                                            } else {
                                                                response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_COMPLETE_FAILED});
                                                            }

                                                        }, (error) => {
                                                            console.log(error);
                                                            response_data.json({
                                                                success: false,
                                                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                            });
                                                        });

                                                    });

                                                }, (error) => {
                                                    console.log(error);
                                                    response_data.json({
                                                        success: false,
                                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                    });
                                                });
                                            }

                                        }, (error) => {
                                            console.log(error);
                                            response_data.json({
                                                success: false,
                                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                            });
                                        });

                                    }, (error) => {
                                        console.log(error);
                                        response_data.json({
                                            success: false,
                                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                        });
                                    });

                                } else
                                {
                                    response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
                                }

                            }, (error) => {
                                console.log(error);
                                response_data.json({
                                    success: false,
                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                });
                            });

                        });
                    }
                } else
                {
                    response_data.json({success: false, error_code: PROVIDER_ERROR_CODE.PROVIDER_DATA_NOT_FOUND});
                }
            }, (error) => {
                console.log(error);
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        } else {
            response_data.json(response);
        }
    });
};

exports.show_request_invoice = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'request_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Provider.findOne({_id: request_data_body.provider_id}).then((provider) => {
                if (provider) {
                    if (request_data_body.server_token !== null && provider.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {

                        Request.findOne({_id: request_data_body.request_id}).then((request) => {
                            if (request) {
                                User.findOne({_id: request.user_id}).then((user) => {

                                    Order.findOne({_id: request.orders[0].order_id}).then((order) => {
                                        if (order)
                                        {
                                            var country_id = order.country_id;
                                            Store.findOne({_id: order.store_id}).then((store) => {
                                                if (country_id == null && country_id == undefined) {
                                                    country_id = store.country_id;
                                                }
                                                Country.findOne({_id: country_id}).then((country) => {
                                                    var currency = "";
                                                    if (country)
                                                    {
                                                        currency = country.currency_sign;
                                                    }

                                                    Order_payment.findOne({_id: order.order_payment_id}).then((order_payment) => {

                                                        order.is_provider_show_invoice = request_data_body.is_provider_show_invoice;
                                                        provider.total_completed_requests = provider.total_completed_requests + 1;
                                                        provider.save();

                                                        emails.sendProviderInvoiceEmail(request_data, user, provider, store, order_payment, currency);
                                                        order.save();

                                                        response_data.json({success: true,
                                                            message: ORDER_MESSAGE_CODE.SHOW_INVOICE_SUCCESSFULLY});

                                                    }, (error) => {
                                                        console.log(error);
                                                        response_data.json({
                                                            success: false,
                                                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                        });
                                                    });

                                                });

                                            }, (error) => {
                                                console.log(error);
                                                response_data.json({
                                                    success: false,
                                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                });
                                            });
                                        }

                                    }, (error) => {
                                        console.log(error);
                                        response_data.json({
                                            success: false,
                                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                        });
                                    });

                                }, (error) => {
                                    console.log(error);
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
                                });

                            } else
                            {
                                response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
                            }

                        }, (error) => {
                            console.log(error);
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
                } else
                {
                    response_data.json({success: false, error_code: PROVIDER_ERROR_CODE.PROVIDER_DATA_NOT_FOUND});
                }

            }, (error) => {
                console.log(error);
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        } else {
            response_data.json(response);
        }
    });
};

exports.provider_get_invoice = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'request_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var request_id = request_data_body.request_id;
            Provider.findOne({_id: request_data_body.provider_id}).then((provider) => {
                if (provider) {
                    if (request_data_body.server_token !== null && provider.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {
                        Request.findOne({_id: request_id}).then((request) => {
                            if (request)
                            {
                                Order.findOne({_id: request.orders[0].order_id}).then((order) => {
                                    if (order) {
                                        var country_id = order.country_id;
                                        Store.findOne({_id: order.store_id}).then((store) => {
                                            if (order.country_id == null && order.country_id == undefined) {
                                                country_id = store.country_id;
                                            }
                                            Country.findOne({_id: country_id}).then((country) => {
                                                var currency = country.currency_sign;

                                                Order_payment.findOne({_id: request.orders[0].order_payment_id}).then((order_payment_detail) => {
                                                    if (order_payment_detail)
                                                    {
                                                        Provider.findOne({_id: request.current_provider}).then((provider_data) => {

                                                            var provider_detail = {};
                                                            if (provider_data)
                                                            {
                                                                provider_detail = provider_data;
                                                            }

                                                            Payment_gateway.findOne({_id: order_payment_detail.payment_id}).then((payment_gateway) => {
                                                                var payment_gateway_name = "Cash";
                                                                if (order_payment_detail.is_payment_mode_cash == false) {
                                                                    payment_gateway_name = payment_gateway.name;
                                                                }

                                                                response_data.json({success: true,
                                                                    message: USER_MESSAGE_CODE.GET_INVOICE_SUCCESSFULLY,
                                                                    payment_gateway_name: payment_gateway_name,
                                                                    currency: currency,
                                                                    provider_detail: provider_detail,
                                                                    request: request,
                                                                    order_payment: order_payment_detail

                                                                });

                                                            }, (error) => {
                                                                console.log(error);
                                                                response_data.json({
                                                                    success: false,
                                                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                                });
                                                            });

                                                        });

                                                    } else
                                                    {
                                                        response_data.json({success: false, error_code: USER_ERROR_CODE.INVOICE_NOT_FOUND});
                                                    }

                                                }, (error) => {
                                                    console.log(error);
                                                    response_data.json({
                                                        success: false,
                                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                    });
                                                });

                                            });

                                        }, (error) => {
                                            console.log(error);
                                            response_data.json({
                                                success: false,
                                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                            });
                                        });
                                    }

                                }, (error) => {
                                    console.log(error);
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
                                });
                            }

                        }, (error) => {
                            console.log(error);
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
                } else
                {
                    response_data.json({success: false, error_code: PROVIDER_ERROR_CODE.PROVIDER_DATA_NOT_FOUND});
                }

            }, (error) => {
                console.log(error);
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        } else {
            response_data.json(response);
        }
    });
};

exports.provider_cancel_or_reject_request = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'request_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Provider.findOne({_id: request_data_body.provider_id}).then((provider) => {
                if (provider)
                {
                    if (request_data_body.server_token !== null && provider.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {
                        var delivery_status = Number(request_data_body.delivery_status);


                        if (delivery_status == ORDER_STATE.DELIVERY_MAN_REJECTED) {

                            exports.provider_reject_request(provider, request_data, function (return_data) {
                                response_data.json(return_data);
                            });

                        } else if (delivery_status == ORDER_STATE.DELIVERY_MAN_CANCELLED) {

                            exports.provider_cancel_request(provider, request_data, function (return_data) {
                                response_data.json(return_data);
                            });

                        } else {
                            response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
                        }
                    }
                } else
                {
                    response_data.json({success: false, error_code: PROVIDER_ERROR_CODE.PROVIDER_DATA_NOT_FOUND});
                }

            }, (error) => {
                console.log(error);
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        } else {
            response_data.json(response);
        }
    });
};

exports.provider_cancel_request = function (provider , request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var request_id = request_data_body.request_id;

            Request.findOne({_id: request_id, provider_id: provider._id, delivery_status_manage_id: ORDER_STATUS_ID.RUNNING}).then((request) => {
                if (request) {
                    Order.findOne({_id: request.orders[0].order_id}).then((order) => {
                        if (order) {
                            Store.findOne({_id: order.store_id}).then((store) => {
                                request.delivery_status = ORDER_STATE.DELIVERY_MAN_CANCELLED;
                                request.delivery_status_manage_id = ORDER_STATUS_ID.CANCELLED;
                                request.delivery_status_by = null;
                                request.provider_id = null;
                                request.current_provider = null;

                                request.cancel_reasons.push(request_data_body.cancel_reasons);

                                var index = request.date_time.findIndex((x) => x.status == ORDER_STATE.DELIVERY_MAN_CANCELLED);
                                if (index == -1) {
                                    request.date_time.push({status: ORDER_STATE.DELIVERY_MAN_CANCELLED, date: new Date()});
                                } else {
                                    request.date_time[index].date = new Date();
                                }
                                request.markModified('date_time');

                                request.save().then(() => {
                                        utils.insert_daily_provider_analytics(request.timezone, provider._id, ORDER_STATE.DELIVERY_MAN_CANCELLED, false, null, false, null);
                                        provider.total_cancelled_requests = provider.total_cancelled_requests + 1;
                                        provider.save();
                                        if (setting_detail.is_sms_notification)
                                        {
                                            var store_phone_with_code = store.country_phone_code + store.phone;
                                            SMS.sendOtherSMS(store_phone_with_code, SMS_UNIQUE_ID.STORE_ORDER_CANCELLED, "");
                                        }
                                        if (setting_detail.is_mail_notification && store)
                                        {
                                            emails.sendStoreOrderCancelEmail(request_data, store);
                                        }

                                        // my_request.findNearestProvider(request, null);

                                        response_data({
                                            success: true,
                                            message: ORDER_MESSAGE_CODE.ORDER_CANCEL_OR_REJECT_BY_PROVIDER_SUCCESSFULLY

                                        });

                                }, (error) => {
                                    console.log(error);
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
                                });
                            });

                        }else{
                            response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
                        }

                    }, (error) => {
                        console.log(error);
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                        });
                    });
                }else{
                    response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
                }

            }, (error) => {
                console.log(error);
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        } else {
            response_data.json(response);
        }
    });
};

exports.provider_reject_request = function (provider , request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var request_id = request_data_body.request_id;

            Request.findOne({_id: request_id, current_provider: provider._id, provider_id: null, delivery_status_manage_id: ORDER_STATUS_ID.RUNNING}).then((request) => {
                if (request) {
                    Order.findOne({_id: request.orders[0].order_id}).then((order) => {
                        if (order) {

                            var city_timezone = request.timezone;

                            request.delivery_status = ORDER_STATE.DELIVERY_MAN_REJECTED;
                            request.delivery_status_manage_id = ORDER_STATUS_ID.REJECTED;
                            request.delivery_status_by = null;
                            request.cancel_reasons.push(request_data_body.cancel_reasons);

                            request.save().then(() => {
                                    utils.insert_daily_provider_analytics(city_timezone, provider._id, ORDER_STATE.DELIVERY_MAN_REJECTED, false, null, false, null);

                                    provider.total_rejected_requests = provider.total_rejected_requests + 1;
                                    provider.save();

                                    my_request.findNearestProvider(request, null);

                                    response_data({
                                        success: true,
                                        message: ORDER_MESSAGE_CODE.ORDER_CANCEL_OR_REJECT_BY_PROVIDER_SUCCESSFULLY

                                    });

                            }, (error) => {
                                console.log(error);
                                response_data.json({
                                    success: false,
                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                });
                            });

                        }else{
                            response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
                        }

                    }, (error) => {
                        console.log(error);
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                        });
                    });
                } else
                {
                    response_data({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
                }

            }, (error) => {
                console.log(error);
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        } else {
            response_data.json(response);
        }
    });
};

exports.cancel_request = function (request_id , return_data) {


    Request.findOne({_id: request_id}).then((request) => {
        if (request) {
            var provider_id = request.provider_id;
            if (!provider_id) {
                provider_id = request.current_provider;
            }

            Provider.findOne({_id: provider_id}).then((provider) => {

                request.current_provider = null;
                request.provider_id = null;
                request.delivery_status = ORDER_STATE.STORE_CANCELLED_REQUEST;
                request.delivery_status_manage_id = ORDER_STATUS_ID.CANCELLED;
                request.delivery_status_by = null;

                var index = request.date_time.findIndex((x) => x.status == ORDER_STATE.STORE_CANCELLED_REQUEST);
                if (index == -1) {
                    request.date_time.push({status: ORDER_STATE.STORE_CANCELLED_REQUEST, date: new Date()});
                } else {
                    request.date_time[index].date = new Date();
                }
                request.markModified('date_time');

                request.save().then(() => {
                        if (provider) {
                            utils.sendPushNotification(ADMIN_DATA_ID.PROVIDER, provider.device_type, provider.device_token, PROVIDER_PUSH_CODE.STORE_CANCELLED_REQUEST, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                        }
                        if (return_data) {
                            return_data({success: true,
                                message: STORE_MESSAGE_CODE.CANCEL_REQUEST_SUCESSFULLY,
                                delivery_status: request.delivery_status
                            });
                        }
                }, (error) => {
                    console.log(error);
                    response_data.json({
                        success: false,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                    });
                });
            }, (error) => {
                console.log(error);
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        } else {
            if (return_data) {
                return_data({success: false});
            }
        }
    }, (error) => {
        console.log(error);
        response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
        });
    });

};