require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/push_code');
require('../../utils/constants');
var my_request = require('../../controllers/store/request');
var utils = require('../../utils/utils');
var moment = require('moment');
var emails = require('../../controllers/email_sms/emails');
var SMS = require('../../controllers/email_sms/sms');
var User = require('mongoose').model('user');
var Country = require('mongoose').model('country');
var Provider = require('mongoose').model('provider');
var Store = require('mongoose').model('store');
var City = require('mongoose').model('city');
var wallet_history = require('../../controllers/user/wallet');
var Order = require('mongoose').model('order');
var Order_payment = require('mongoose').model('order_payment');
var Promo_code = require('mongoose').model('promo_code');
var Cart = require('mongoose').model('cart');
var pad = require('pad-left');
var Request = require('mongoose').model('request');
var console = require('../../utils/console');
var Request_assistance = require('mongoose').model('request_assistance');

// user create order
exports.create_order = function (request_data, response_data) {
    console.log(request_data.body)
    utils.check_request_params(request_data.body, [{ name: 'cart_id', type: 'string' }], function (response) {
        if (response.success) {
            var request_data_body = request_data.body;
            var cart_id = request_data_body.cart_id;
            var date_now = new Date(Date.now());
            var order_type = Number(request_data_body.order_type);

            User.findOne({ _id: request_data_body.user_id }).then((user) => {

                if (user && order_type != ADMIN_DATA_ID.STORE && request_data_body.server_token !== null && user.server_token !== request_data_body.server_token) {
                    response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });

                } else {
                    Order_payment.find({ user_id: request_data_body.user_id, cart_id: request_data_body.cart_id, is_payment_paid: false, refund_amount: 0 }).then((order_payments) => {

                        if (order_payments.length > 0) {
                            response_data.json({ success: false, error_code: USER_ERROR_CODE.YOUR_ORDER_PAYMENT_PENDING });

                        } else {
                            Cart.findOne({ _id: cart_id }).then((cart) => {
                                if (cart) {
                                    var order_status = NEW_ORDER_STATE.NEW_ORDER;
                                    var order_status_id = ORDER_STATUS_ID.RUNNING;
                                    var order_status_manage_id = ORDER_STATUS_ID.RUNNING;

                                    if (order_type == ADMIN_DATA_ID.STORE) {
                                        order_type = ADMIN_DATA_ID.STORE;
                                    } else {
                                        order_type = ADMIN_DATA_ID.USER;
                                    }


                                    var is_schedule_order = request_data_body.is_schedule_order;
                                    var schedule_order_start_at = null;
                                    if (is_schedule_order) {
                                        schedule_order_start_at = moment.utc(Number(request_data_body.order_start_at)).format();
                                    }

                                    var delivery_type = DELIVERY_TYPE.STORE;
                                    if (request_data_body.delivery_type) {
                                        delivery_type = request_data_body.delivery_type
                                    }

                                    if (delivery_type == DELIVERY_TYPE.COURIER) {
                                        order_status = ORDER_STATE.ORDER_READY;
                                        order_status_id = ORDER_STATUS_ID.RUNNING;
                                        order_status_manage_id = ORDER_STATUS_ID.COMPLETED;
                                    }

                                    var { order_feature_type, table_number } = request_data_body
                                    if (!table_number) {
                                        table_number = ''
                                    }

                                    var order = new Order({
                                        store_id: cart.store_id,
                                        cart_id: cart._id,
                                        order_payment_id: cart.order_payment_id,
                                        user_id: request_data_body.user_id,
                                        delivery_type: delivery_type,
                                        order_type: order_type,
                                        order_type_id: user._id,
                                        order_status_id: order_status_id,
                                        order_status: order_status,
                                        order_status_manage_id: order_status_manage_id,
                                        confirmation_code_for_pick_up_delivery: utils.generateUniqueCode(6),
                                        confirmation_code_for_complete_delivery: utils.generateUniqueCode(6),
                                        is_schedule_order: is_schedule_order,
                                        schedule_order_start_at: schedule_order_start_at,
                                        order_feature_type: Number(order_feature_type),
                                        table_number: table_number
                                    });

                                    Order_payment.findOne({ _id: cart.order_payment_id }).then((order_payment) => {

                                        if (order_payment) {
                                            Store.findOne({ _id: cart.store_id }).then((store) => {

                                                var store_id = null;
                                                var country_id = order_payment.country_id;
                                                if (store) {
                                                    store_id = store._id;
                                                }
                                                // if (store) {
                                                if (order_type == ADMIN_DATA_ID.STORE && store) {
                                                    order.order_type_id = store._id;

                                                    var index = order.date_time.findIndex((x) => x.status == NEW_ORDER_STATE.NEW_ORDER);
                                                    if (index == -1) {
                                                        order.date_time.push({ status: NEW_ORDER_STATE.NEW_ORDER, date: new Date() });
                                                    } else {
                                                        order.date_time[index].date = new Date();
                                                    }

                                                }

                                                City.findOne({ _id: cart.city_id }).then((city) => {

                                                    if (city) {
                                                        Country.findOne({ _id: country_id }).then((country_detail) => {
                                                            var currency_sign = "";

                                                            if (country_detail) {
                                                                currency_sign = country_detail.currency_sign;
                                                            }

                                                            var tag_date = moment(utils.get_date_now_at_city(date_now, city.timezone)).format(DATE_FORMATE.DDMMYYYY);

                                                            // Entry in Store_analytic daily Table

                                                            if (store) {
                                                                if (order_type == ADMIN_DATA_ID.STORE) {
                                                                    utils.insert_daily_store_analytics(tag_date, store._id, NEW_ORDER_STATE.NEW_ORDER, order_payment.total_item_count, false);
                                                                } else {
                                                                    utils.insert_daily_store_analytics(tag_date, store._id, NEW_ORDER_STATE.NEW_ORDER, order_payment.total_item_count, false);

                                                                }
                                                            }

                                                            var image_file = request_data.files;
                                                            var file_list_size = 0;

                                                            if (image_file != undefined && image_file.length > 0) {
                                                                file_list_size = image_file.length;
                                                                for (i = 0; i < file_list_size; i++) {
                                                                    image_file[i];
                                                                    var image_name = order._id + utils.generateServerToken(4);
                                                                    var url = utils.getStoreImageFolderPath(FOLDER_NAME.CART_ITEMS) + image_name + FILE_EXTENSION.ITEM;
                                                                    order.image_url.push(url);
                                                                    utils.storeImageToFolder(image_file[i].path, image_name + FILE_EXTENSION.ITEM, FOLDER_NAME.CART_ITEMS);
                                                                }
                                                            }

                                                            order.city_id = city._id;
                                                            order.country_id = country_detail._id;
                                                            order.timezone = city.timezone;
                                                            order.order_payment_id = order_payment._id;

                                                            var index = order.date_time.findIndex((x) => x.status == NEW_ORDER_STATE.NEW_ORDER);
                                                            if (index == -1) {
                                                                order.date_time.push({ status: NEW_ORDER_STATE.NEW_ORDER, date: new Date() });
                                                            } else {
                                                                order.date_time[index].date = new Date();
                                                            }

                                                            order.save().then(() => {

                                                                Order.count({
                                                                    store_id: store_id, order_status: NEW_ORDER_STATE.NEW_ORDER

                                                                }).then((order_count_for_store) => {

                                                                    var date1 = moment(date_now);
                                                                    var today_formats = date1.format(DATE_FORMATE.DDMMYYYY);
                                                                    var unique_id = pad(order.unique_id, 7, '0');
                                                                    var invoice_number = INVOICE_CODE.INVOICE_APP_NAME_CODE + " " + INVOICE_CODE.ORDER_EARNING_CODE + " " + today_formats + " " + unique_id;
                                                                    order_payment.invoice_number = invoice_number;

                                                                    order_payment.order_id = order._id;
                                                                    order_payment.order_unique_id = order.unique_id;
                                                                    order_payment.save();

                                                                    cart.order_id = order._id;
                                                                    cart.order_payment_id = order_payment._id;
                                                                    cart.save();

                                                                    if (setting_detail.is_mail_notification && store) {
                                                                        emails.sendNewOrderEmail(request_data, store);

                                                                    }

                                                                    if (setting_detail.is_sms_notification && store) {
                                                                        SMS.sendOtherSMS(store_phone_code, SMS_UNIQUE_ID.NEW_ORDER, "");
                                                                    }




                                                                    user.cart_id = null;
                                                                    user.save();

                                                                    if (order_type == ADMIN_DATA_ID.USER && store) {
                                                                        var store_push_data = {
                                                                            order_id: order._id,
                                                                            unique_id: order.unique_id,
                                                                            order_count: order_count_for_store,
                                                                            currency: currency_sign,
                                                                            pickup_addresses: cart.pickup_addresses,
                                                                            destination_addresses: cart.destination_addresses,
                                                                            total_order_price: order_payment.total_order_price,
                                                                            is_payment_mode_cash: order_payment.is_payment_mode_cash,
                                                                            first_name: user.first_name,
                                                                            last_name: user.last_name,
                                                                            user_image: user.image_url
                                                                        }
                                                                        var store_phone_code = store.country_phone_code + store.phone;
                                                                        utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.STORE, store.device_type, store.device_token, STORE_PUSH_CODE.NEW_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, store_push_data, "");
                                                                    }


                                                                    var orders_array = {
                                                                        order_id: order._id,
                                                                        order_unique_id: order.unique_id,
                                                                        order_payment_id: order.order_payment_id,
                                                                        cart_id: order.cart_id
                                                                    }


                                                                    if (order.delivery_type == DELIVERY_TYPE.COURIER) {
                                                                        var request = new Request({
                                                                            country_id: country_id,
                                                                            city_id: city._id,
                                                                            timezone: city.timezone,
                                                                            vehicle_id: request_data_body.vehicle_id,
                                                                            orders: orders_array,
                                                                            user_id: user._id,
                                                                            user_unique_id: user.unique_id,
                                                                            request_type: 2,
                                                                            request_type_id: cart.store_id,
                                                                            estimated_time_for_delivery_in_min: 0,

                                                                            provider_type: 0,
                                                                            provider_type_id: null,
                                                                            provider_id: null,
                                                                            provider_unique_id: 0,
                                                                            delivery_status: NEW_ORDER_STATE.NEW_ORDER,
                                                                            delivery_status_manage_id: ORDER_STATUS_ID.RUNNING,
                                                                            delivery_status_by: null,
                                                                            current_provider: null,

                                                                            providers_id_that_rejected_order_request: [],
                                                                            confirmation_code_for_pick_up_delivery: order.confirmation_code_for_pick_up_delivery,
                                                                            confirmation_code_for_complete_delivery: order.confirmation_code_for_complete_delivery,

                                                                            is_forced_assigned: false,
                                                                            provider_location: [],
                                                                            provider_previous_location: [],
                                                                            pickup_addresses: cart.pickup_addresses,
                                                                            destination_addresses: cart.destination_addresses,
                                                                            cancel_reasons: [],
                                                                            completed_at: null

                                                                        });

                                                                        request.save().then(() => {
                                                                            order_payment.order_id = order._id;
                                                                            order_payment.order_unique_id = order.unique_id;
                                                                            order_payment.save();
                                                                            order.request_id = request._id;
                                                                            order.save();
                                                                            my_request.findNearestProvider(request, null);
                                                                            response_data.json({
                                                                                success: true, order_id: order._id,
                                                                                message: ORDER_MESSAGE_CODE.ORDER_CREATE_SUCCESSFULLY
                                                                            });

                                                                        }, (error) => {
                                                                            console.log(error)
                                                                            response_data.json({
                                                                                success: false,
                                                                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                                            });
                                                                        });
                                                                    } else {
                                                                        response_data.json({
                                                                            success: true, order_id: order._id,
                                                                            message: ORDER_MESSAGE_CODE.ORDER_CREATE_SUCCESSFULLY
                                                                        });
                                                                    }
                                                                });

                                                            }, (error) => {
                                                                console.log(error)
                                                                Promo_code.findOne({ _id: order_payment.promo_id }).then((promo_code) => {
                                                                    if (promo_code) {
                                                                        promo_code.used_promo_code = promo_code.used_promo_code - 1;
                                                                        promo_code.save();
                                                                    }
                                                                });
                                                                order_payment.promo_id = null;
                                                                order_payment.save();
                                                                var added_wallet = 0;
                                                                added_wallet = +order_payment.wallet_payment + +order_payment.card_payment;

                                                                // Entry in wallet Table //
                                                                if (added_wallet > 0) {
                                                                    var order_wallet_payment = added_wallet;

                                                                    var total_wallet_amount = wallet_history.add_wallet_history(ADMIN_DATA_ID.USER, user.unique_id, user._id, user.country_id,
                                                                        order_payment.order_currency_code, user.wallet_currency_code,
                                                                        order_payment.wallet_to_order_current_rate, order_wallet_payment, user.wallet, WALLET_STATUS_ID.ADD_WALLET_AMOUNT, WALLET_COMMENT_ID.ORDER_REFUND, "Refund Amount Of Order : " + order.unique_id, { _id: order._id, unique_id: order.unique_id })

                                                                    user.wallet = total_wallet_amount;
                                                                    user.save();

                                                                    order_payment.is_order_payment_refund = true;
                                                                    order_payment.refund_amount = added_wallet;
                                                                    order_payment.save();

                                                                    // sms to user refund amount.
                                                                    if (setting_detail.is_sms_notification) {
                                                                        SMS.sendSmsForOTPVerificationAndForgotPassword(user.country_phone_code + user.phone, SMS_UNIQUE_ID.USER_PAYMENT_REFUND, added_wallet);

                                                                    }

                                                                    // email to user refund amount.
                                                                    if (setting_detail.is_mail_notification) {
                                                                        emails.sendUserRefundAmountEmail(request_data, user, added_wallet);

                                                                    }
                                                                }

                                                                response_data.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_FAILED });

                                                            });

                                                        });
                                                    }
                                                }, (error) => {
                                                    console.log(error)
                                                    response_data.json({
                                                        success: false,
                                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                    });
                                                });
                                                // }
                                            }, (error) => {
                                                console.log(error)
                                                response_data.json({
                                                    success: false,
                                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                });
                                            });
                                        } else {
                                            response_data.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_FAILED });

                                        }
                                    }, (error) => {
                                        console.log(error)
                                        response_data.json({
                                            success: false,
                                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                        });
                                    });

                                } else {
                                    response_data.json({ success: false, error_code: CART_ERROR_CODE.CART_NOT_FOUND });
                                }
                            }, (error) => {
                                console.log(error)
                                response_data.json({
                                    success: false,
                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                });
                            });

                        }
                    }, (error) => {
                        console.log(error)
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                        });
                    });

                }
            }, (error) => {
                console.log(error)
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

//store set_order_status ACCEPTED - PREPARING - READY
exports.set_order_status = function (request_data, response_data) {

    utils.check_request_params(request_data.body, [{ name: 'order_id', type: 'string' }], function (response) {
        if (response.success) {
            var request_data_body = request_data.body;
            Store.findOne({ _id: request_data_body.store_id }).then((store) => {
                if (store) {
                    if (request_data_body.server_token !== null && store.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });

                    } else {
                        Order.findOne({ _id: request_data_body.order_id, store_id: request_data_body.store_id, $or: [{ order_status_id: ORDER_STATUS_ID.RUNNING }, { order_status_id: ORDER_STATUS_ID.IDEAL }] }).then((order) => {
                            if (order) {
                                Order_payment.findOne({ _id: order.order_payment_id, store_id: request_data_body.store_id }).then((order_payment) => {


                                    var order_status = Number(request_data_body.order_status);

                                    if (order_status == ORDER_STATE.STORE_ACCEPTED) {
                                        exports.store_accept_order(store, order, request_data, order_payment.total_item_count, function (store_accept_response) {
                                            response_data.json(store_accept_response);
                                        })
                                    } else if (order_status == ORDER_STATE.STORE_PREPARING_ORDER) {
                                        exports.store_preparing_order(store, order, request_data, function (store_preparing_response) {
                                            response_data.json(store_preparing_response);
                                        })
                                    } else if (order_status == ORDER_STATE.ORDER_READY) {
                                        exports.store_ready_order(store, order, request_data, order_payment.total_item_count, function (store_ready_response) {
                                            response_data.json(store_ready_response);
                                        })
                                    }


                                }, (error) => {
                                    console.log(error)
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
                                });
                            } else {
                                response_data.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_ALREADY_CANCELLED });
                            }
                        }, (error) => {
                            console.log(error)
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
                } else {

                    response_data.json({ success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND });
                }
            }, (error) => {
                console.log(error)
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

exports.store_accept_order = function (store, order, request_data, total_item_count, response_data) {

    User.findOne({ _id: order.user_id }).then((user) => {

        if (user) {
            var device_type = user.device_type;
            var device_token = user.device_token;
            var phone_with_code = user.country_phone_code + user.phone;
            var order_data = {
                order_id: order._id,
                unique_id: order.unique_id,
                store_name: store.name,
                store_image: store.image_url
            }

            var order_status = Number(request_data.body.order_status);
            if (order.order_status_id == ORDER_STATUS_ID.IDEAL) {
                order.order_status = ORDER_STATE.STORE_ACCEPTED;
                order.order_status_id = ORDER_STATUS_ID.RUNNING;
                order.order_status_manage_id = ORDER_STATUS_ID.RUNNING;
                order.order_status_by = store._id;
                order.store_notify = 0;

                var index = order.date_time.findIndex((x) => x.status == ORDER_STATE.STORE_ACCEPTED);
                if (index == -1) {
                    order.date_time.push({ status: ORDER_STATE.STORE_ACCEPTED, date: new Date() });
                } else {
                    order.date_time[index].date = new Date();
                }

                order.save().then(() => {

                    var today_start_date_time = utils.get_date_now_at_city(new Date(), order.timezone);
                    var tag_date = moment(today_start_date_time).format(DATE_FORMATE.DDMMYYYY);

                    utils.insert_daily_store_analytics(tag_date, store._id, ORDER_STATE.STORE_ACCEPTED, total_item_count, false);
                    // sms user order booked.
                    if (setting_detail.is_sms_notification) {
                        SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.USER_ORDER_BOOKED, "");
                    }
                    // mail user order booked.
                    if (setting_detail.is_mail_notification) {
                        emails.sendOrderBookedEmail(request_data, user);
                    }
                    utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, device_type, device_token, USER_PUSH_CODE.STORE_ACCEPTED_YOUR_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_data, "");

                    response_data({
                        success: true,
                        message: ORDER_MESSAGE_CODE.SET_ORDER_STATUS_SUCCESSFULLY,
                        order: order
                    });
                }, (error) => {
                    console.log(error)
                    response_data({
                        success: false,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                    });
                });
            } else {
                response_data.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND });
            }
        } else {

        }
    });
}

exports.store_preparing_order = function (store, order, request_data, response_data) {

    User.findOne({ _id: order.user_id }).then((user) => {

        if (user) {

            var device_type = user.device_type;
            var device_token = user.device_token;
            var phone_with_code = user.country_phone_code + user.phone;
            var order_data = {
                order_id: order._id,
                unique_id: order.unique_id,
                store_name: store.name,
                store_image: store.image_url
            }

            order.order_status = ORDER_STATE.STORE_PREPARING_ORDER;

            var index = order.date_time.findIndex((x) => x.status == ORDER_STATE.STORE_PREPARING_ORDER);
            if (index == -1) {
                order.date_time.push({ status: ORDER_STATE.STORE_PREPARING_ORDER, date: new Date() });
            } else {
                order.date_time[index].date = new Date();
            }

            order.save().then(() => {

                var today_start_date_time = utils.get_date_now_at_city(new Date(), order.timezone);
                var tag_date = moment(today_start_date_time).format(DATE_FORMATE.DDMMYYYY);


                // sms user order Prepare.
                if (setting_detail.is_sms_notification) {
                    SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.USER_ORDER_PREPARE, "");
                }
                // mail user order Ready.
                if (setting_detail.is_mail_notification) {
                    emails.sendOrderPrepareEmail(request_data, user);
                }
                utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, device_type, device_token, USER_PUSH_CODE.STORE_START_PREPARING_YOUR_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_data, "");

                response_data({
                    success: true,
                    message: ORDER_MESSAGE_CODE.SET_ORDER_STATUS_SUCCESSFULLY,
                    order: order
                });
            }, (error) => {
                response_data({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        }
    });
}

exports.store_ready_order = function (store, order, request_data, total_item_count, response_data) {

    User.findOne({ _id: order.user_id }).then((user) => {

        if (user) {

            var device_type = user.device_type;
            var device_token = user.device_token;
            var phone_with_code = user.country_phone_code + user.phone;
            var order_data = {
                order_id: order._id,
                unique_id: order.unique_id,
                store_name: store.name,
                store_image: store.image_url
            }

            order.order_status = ORDER_STATE.ORDER_READY;
            order.order_status_manage_id = ORDER_STATUS_ID.COMPLETED;

            var index = order.date_time.findIndex((x) => x.status == ORDER_STATE.ORDER_READY);
            if (index == -1) {
                order.date_time.push({ status: ORDER_STATE.ORDER_READY, date: new Date() });
            } else {
                order.date_time[index].date = new Date();
            }

            order.save().then(() => {

                var today_start_date_time = utils.get_date_now_at_city(new Date(), order.timezone);
                var tag_date = moment(today_start_date_time).format(DATE_FORMATE.DDMMYYYY);


                utils.insert_daily_store_analytics(tag_date, store._id, ORDER_STATE.ORDER_READY, total_item_count, false);
                // sms user order Ready.
                if (setting_detail.is_sms_notification) {
                    SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.USER_ORDER_READY, "");
                }
                // mail user order Ready.
                if (setting_detail.is_mail_notification) {
                    emails.sendOrderReadyEmail(request_data, user);
                    emails.sendStoreOrderReadyEmail(request_data, store);
                }
                // pust to user order Ready.
                utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, device_type, device_token, USER_PUSH_CODE.STORE_READY_YOUR_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_data, "");




                response_data({
                    success: true,
                    message: ORDER_MESSAGE_CODE.SET_ORDER_STATUS_SUCCESSFULLY,
                    order: order
                });
            }, (error) => {
                console.log(error)
                response_data({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
        }
    });
}


//store cancel or reject order
exports.store_cancel_or_reject_order = function (request_data, response_data) {

    utils.check_request_params(request_data.body, [{ name: 'order_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({ _id: request_data_body.store_id }).then((store) => {
                if (store) {
                    if (request_data_body.server_token !== null && store.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    } else {
                        Order.findOne({ _id: request_data_body.order_id, store_id: request_data_body.store_id }).then((order) => {
                            if (order) {
                                var order_status = Number(request_data_body.order_status);

                                if (order_status == ORDER_STATE.STORE_REJECTED) {
                                    exports.store_reject_order(store, order, request_data, function (reject_request_response) {
                                        response_data.json(reject_request_response);
                                    });
                                } else if (order_status == ORDER_STATE.STORE_CANCELLED) {
                                    exports.store_cancel_order(store, order, request_data, function (cancel_request_response) {
                                        response_data.json(cancel_request_response);
                                    });
                                } else {
                                    response_data.json({ success: false });
                                }

                            } else {
                                response_data.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND });
                            }
                        }, (error) => {
                            console.log(error)
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
                } else {
                    response_data.json({ success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND });
                }
            }, (error) => {
                console.log(error)
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

exports.store_cancel_order = function (store, order, request_data, response_data) {

    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            Order_payment.findOne({ _id: order.order_payment_id }).then((order_payment) => {
                if (order_payment) {
                    var cancel_reason = request_data.body.cancel_reason;
                    var city_timezone = order.timezone;
                    var now = new Date();
                    var today_start_date_time = utils.get_date_now_at_city(now, city_timezone);
                    var tag_date = moment(today_start_date_time).format(DATE_FORMATE.DDMMYYYY);

                    order.order_status = ORDER_STATE.STORE_CANCELLED;
                    order.order_status_id = ORDER_STATUS_ID.CANCELLED;
                    order.order_status_manage_id = ORDER_STATUS_ID.CANCELLED;
                    order.order_status_by = store._id;
                    order.cancel_reason = cancel_reason;
                    order.cancelled_at = now;
                    order.completed_at = now;
                    order.completed_date_in_city_timezone = today_start_date_time;
                    order.completed_date_tag = tag_date;

                    var index = order.date_time.findIndex((x) => x.status == ORDER_STATE.STORE_CANCELLED);
                    if (index == -1) {
                        order.date_time.push({ status: ORDER_STATE.STORE_CANCELLED, date: now });
                    } else {
                        order.date_time[index].date = now;
                    }

                    order.save().then((detail) => {

                        var store_phone_code = store.country_phone_code + store.phone;

                        Promo_code.findOne({ _id: order_payment.promo_id }).then((promo_code) => {
                            if (promo_code) {
                                promo_code.used_promo_code = promo_code.used_promo_code - 1;
                                promo_code.save();
                            }
                        });
                        order_payment.promo_id = null;

                        User.findOne({ _id: order.user_id }).then((user) => {
                            var phone_with_code = user.country_phone_code + user.phone;
                            var device_type = user.device_type;
                            var device_token = user.device_token;

                            var added_wallet = order_payment.wallet_payment + +order_payment.card_payment;
                            if (added_wallet > 0) {
                                var total_wallet_amount = wallet_history.add_wallet_history(ADMIN_DATA_ID.USER, user.unique_id, user._id, user.country_id,
                                    order_payment.order_currency_code, user.wallet_currency_code,
                                    order_payment.wallet_to_order_current_rate, added_wallet, user.wallet,
                                    WALLET_STATUS_ID.ADD_WALLET_AMOUNT, WALLET_COMMENT_ID.ORDER_REFUND, "Refund Amount Of Order : " + order.unique_id);

                                user.wallet = total_wallet_amount;
                                user.save();

                                order_payment.is_order_payment_refund = true;
                                order_payment.refund_amount = added_wallet;
                                order_payment.save();

                                if (setting_detail.is_sms_notification) {
                                    // sms to user refund amount.
                                    SMS.sendSmsForOTPVerificationAndForgotPassword(phone_with_code, SMS_UNIQUE_ID.USER_PAYMENT_REFUND, added_wallet);

                                    // sms to store refund amount to user.
                                    SMS.sendSmsForOTPVerificationAndForgotPassword(store_phone_code, SMS_UNIQUE_ID.STORE_PAYMENT_REFUND, added_wallet);
                                }


                                if (setting_detail.is_mail_notification) {
                                    // mail to user refund amount.
                                    emails.sendUserRefundAmountEmail(request_data, user, added_wallet);

                                    // mail to store refund amount.
                                    emails.sendStoreRefundAmountEmail(request_data, store, added_wallet);
                                }
                            }

                            // sms user order Cancelled.
                            if (setting_detail.is_sms_notification) {
                                SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.USER_ORDER_CANCELLED, "");
                            }

                            // mail user order Cancelled.
                            if (setting_detail.is_mail_notification) {
                                emails.sendUserOrderCancelEmail(request_data, user);
                            }
                            // send push to user order Cancelled.
                            utils.sendPushNotification(ADMIN_DATA_ID.USER, device_type, device_token, USER_PUSH_CODE.STORE_CANCELLED_YOUR_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);

                            utils.insert_daily_store_analytics(tag_date, store._id, ORDER_STATE.STORE_CANCELLED, order_payment.total_item_count, true);

                            Request.findOne({ _id: order.request_id }).then((request) => {
                                var current_provider = null;
                                var status_for_delivery = 0;

                                if (request) {
                                    status_for_delivery = request.delivery_status;
                                    current_provider = request.provider_id;
                                    if (!current_provider) {
                                        current_provider = request.current_provider;
                                    }

                                    my_request.cancel_request(request._id, null);
                                }

                                Provider.findOne({ _id: current_provider }).then((provider) => {

                                    if (provider) {
                                        var provider_phone_with_code = provider.country_phone_code + provider.phone;

                                        if (status_for_delivery >= ORDER_STATE.WAITING_FOR_DELIVERY_MAN) {
                                            // sms to provider order Cancelled.
                                            if (setting_detail.is_sms_notification) {
                                                if (provider_phone_with_code != "") {
                                                    SMS.sendOtherSMS(provider_phone_with_code, SMS_UNIQUE_ID.PROVIDER_ORDER_CANCELLED, "");
                                                }
                                            }
                                            // mail to provider order Cancelled.
                                            if (setting_detail.is_mail_notification) {
                                                emails.sendProviderOrderCancelEmail(request_data, provider);
                                            }

                                        }

                                    }

                                    response_data({
                                        success: true,
                                        message: ORDER_MESSAGE_CODE.ORDER_CANCEL_OR_REJECT_BY_STORE_SUCCESSFULLY

                                    });
                                }, (error) => {
                                    console.log(error)
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
                                });
                            }, (error) => {
                                console.log(error)
                                response_data.json({
                                    success: false,
                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                });
                            });
                        });
                    }, (error) => {
                        console.log(error)
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                        });

                    });
                } else {
                    response_data({ success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND });
                }
            }, (error) => {
                console.log(error)
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

exports.store_reject_order = function (store, order, request_data, response_data) {

    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {
            var cancel_reason = request_data.body.cancel_reason;
            Order_payment.findOne({ _id: order.order_payment_id }).then((order_payment) => {
                if (order_payment) {

                    var city_timezone = order.timezone;
                    var now = new Date();
                    var today_start_date_time = utils.get_date_now_at_city(now, city_timezone);
                    var tag_date = moment(today_start_date_time).format(DATE_FORMATE.DDMMYYYY);

                    order.order_status = ORDER_STATE.STORE_REJECTED;
                    order.order_status_id = ORDER_STATUS_ID.REJECTED;
                    order.order_status_manage_id = ORDER_STATUS_ID.REJECTED;
                    order.order_status_by = store._id;
                    order.cancel_reason = cancel_reason;
                    var index = order.date_time.findIndex((x) => x.status == ORDER_STATE.STORE_REJECTED);
                    if (index == -1) {
                        order.date_time.push({ status: ORDER_STATE.STORE_REJECTED, date: now });
                    } else {
                        order.date_time[index].date = now;
                    }
                    order.completed_at = now;
                    order.completed_date_in_city_timezone = today_start_date_time;
                    order.completed_date_tag = tag_date;

                    order.save().then(() => {

                        var store_phone_code = store.country_phone_code + store.phone;

                        Promo_code.findOne({ _id: order_payment.promo_id }).then((promo_code) => {
                            if (promo_code) {
                                promo_code.used_promo_code = promo_code.used_promo_code - 1;
                                promo_code.save();
                            }
                        });
                        order_payment.promo_id = null;
                        order_payment.save();

                        User.findOne({ _id: order.user_id }).then((user) => {

                            var device_type = user.device_type;
                            var device_token = user.device_token;
                            var phone_with_code = user.country_phone_code + user.phone;

                            var order_wallet_payment = order_payment.wallet_payment + +order_payment.card_payment;
                            if (order_wallet_payment > 0) {

                                var total_wallet_amount = wallet_history.add_wallet_history(ADMIN_DATA_ID.USER, user.unique_id, user._id, user.country_id,
                                    order_payment.order_currency_code, user.wallet_currency_code,
                                    order_payment.wallet_to_order_current_rate, order_wallet_payment, user.wallet,
                                    WALLET_STATUS_ID.ADD_WALLET_AMOUNT, WALLET_COMMENT_ID.ORDER_REFUND, "Refund Amount Of Order : " + order.unique_id);

                                user.wallet = total_wallet_amount;
                                user.save();

                                order_payment.is_order_payment_refund = true;
                                order_payment.refund_amount = order_wallet_payment;


                                if (setting_detail.is_sms_notification) {
                                    // sms to user refund amount.
                                    SMS.sendSmsForOTPVerificationAndForgotPassword(phone_with_code, SMS_UNIQUE_ID.USER_PAYMENT_REFUND, order_wallet_payment);

                                    // sms to store refund amount to user.
                                    SMS.sendSmsForOTPVerificationAndForgotPassword(store_phone_code, SMS_UNIQUE_ID.STORE_PAYMENT_REFUND, order_wallet_payment);
                                }


                                if (setting_detail.is_mail_notification) {
                                    // mail to user refund amount.
                                    emails.sendUserRefundAmountEmail(request_data, user, order_wallet_payment);

                                    // mail to store refund amount.
                                    emails.sendStoreRefundAmountEmail(request_data, store, order_wallet_payment);
                                }
                            }

                            // sms to user order Reject.
                            if (setting_detail.is_sms_notification) {
                                SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.USER_ORDER_REJECTED, "");
                            }

                            // mail to User order Reject.
                            if (setting_detail.is_mail_notification) {
                                emails.sendUserOrderRejectEmail(request_data, user);
                            }

                            utils.sendPushNotification(ADMIN_DATA_ID.USER, device_type, device_token, USER_PUSH_CODE.STORE_REJECTED_YOUR_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                            utils.insert_daily_store_analytics(tag_date, store._id, ORDER_STATE.STORE_REJECTED, order_payment.total_item_count, false);

                            response_data({
                                success: true,
                                message: ORDER_MESSAGE_CODE.ORDER_CANCEL_OR_REJECT_BY_STORE_SUCCESSFULLY

                            });
                        }, (error) => {
                            console.log(error)
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }, (error) => {
                        console.log(error)
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                        });
                    });
                } else {
                    response_data({ success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND });
                }
            }, (error) => {
                console.log(error)
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

//user order cancel
exports.user_cancel_order = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'order_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var user_id = request_data_body.user_id;
            var cancel_reason = request_data_body.cancel_reason;
            var now = new Date();

            User.findOne({ _id: user_id }).then((user) => {
                if (user) {
                    if (request_data_body.server_token !== null && user.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    } else {
                        Order.findOne({ _id: request_data_body.order_id, user_id: user_id }).then((order) => {
                            if (order) {
                                var delivery_status = 0;
                                var current_provider = null;

                                Request.findOne({ _id: order.request_id }).then((request) => {
                                    if (request) {
                                        delivery_status = request.delivery_status;
                                        current_provider = request.current_provider;
                                        request.completed_at = now;
                                        request.completed_date_in_city_timezone = utils.get_date_now_at_city(now, order.timezone);
                                        request.completed_date_tag = moment(request.completed_date_in_city_timezone).format(DATE_FORMATE.DDMMYYYY);
                                    }

                                    Provider.findOne({ _id: current_provider }).then((provider) => {

                                        Store.findOne({ _id: order.store_id }).then((store) => {
                                            if(order.order_status !== ORDER_STATE.CANCELED_BY_USER){

                                            }
                                            var order_status = order.order_status;
                                            order.order_status = ORDER_STATE.CANCELED_BY_USER;
                                            order.order_status_by = user._id;
                                            order.order_status_id = ORDER_STATUS_ID.CANCELLED;
                                            order.order_status_manage_id = ORDER_STATUS_ID.CANCELLED;
                                            order.cancel_reason = cancel_reason;

                                            var index = order.date_time.findIndex((x) => x.status == ORDER_STATE.CANCELED_BY_USER);
                                            if (index == -1) {
                                                order.date_time.push({ status: ORDER_STATE.CANCELED_BY_USER, date: new Date() });
                                            } else {
                                                order.date_time[index].date = new Date();
                                            }

                                            order.completed_at = now;
                                            order.completed_date_in_city_timezone = utils.get_date_now_at_city(now, order.timezone);
                                            order.completed_date_tag = moment(order.completed_date_in_city_timezone).format(DATE_FORMATE.DDMMYYYY);

                                            order.save().then(() => {
                                                // sms to store order Cancelled.
                                                if (setting_detail.is_sms_notification && store) {
                                                    var store_phone_code = store.country_phone_code + store.phone;
                                                    SMS.sendOtherSMS(store_phone_code, SMS_UNIQUE_ID.STORE_ORDER_CANCELLED, "");
                                                }
                                                // mail to store order Cancelled.
                                                if (setting_detail.is_mail_notification && store) {
                                                    emails.sendStoreOrderCancelEmail(request_data, store);

                                                }

                                                var provider_phone_with_code = "";
                                                if (provider) {

                                                    if (delivery_status >= ORDER_STATE.WAITING_FOR_DELIVERY_MAN) {
                                                        // sms to provider order Cancelled.
                                                        if (setting_detail.is_sms_notification) {

                                                            provider_phone_with_code = provider.country_phone_code + provider.phone;
                                                            if (provider_phone_with_code != "") {
                                                                SMS.sendOtherSMS(provider_phone_with_code, SMS_UNIQUE_ID.PROVIDER_ORDER_CANCELLED, "");
                                                            }
                                                        }
                                                        // mail to provider order Cancelled.
                                                        if (setting_detail.is_mail_notification) {

                                                            emails.sendProviderOrderCancelEmail(request_data, provider);

                                                        }

                                                        utils.sendPushNotification(ADMIN_DATA_ID.PROVIDER, provider.device_type, provider.device_token, PROVIDER_PUSH_CODE.STORE_CANCELLED_REQUEST, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);

                                                    }
                                                }
                                                if (request) {
                                                    request.current_provider = null;
                                                    request.provider_id = null;
                                                    request.delivery_status = ORDER_STATE.CANCELED_BY_USER;
                                                    request.delivery_status_manage_id = ORDER_STATUS_ID.CANCELLED;
                                                    request.delivery_status_by = null;

                                                    var index = request.date_time.findIndex((x) => x.status == ORDER_STATE.CANCELED_BY_USER);

                                                    if (index == -1) {
                                                        request.date_time.push({ status: ORDER_STATE.CANCELED_BY_USER, date: new Date() });
                                                    } else {
                                                        request.date_time[index].date = new Date();
                                                    }

                                                    request.save();
                                                }
                                                // my_request.cancel_request(request._id, null);

                                                var is_order_cancellation_charge_apply = false;
                                                var order_cancellation_charge_for_above_order_price = 0;
                                                var order_cancellation_charge_type = 0;
                                                var order_cancellation_charge_value = 0;
                                                if (store) {
                                                    is_order_cancellation_charge_apply = store.is_order_cancellation_charge_apply;
                                                    order_cancellation_charge_for_above_order_price = store.order_cancellation_charge_for_above_order_price;
                                                    order_cancellation_charge_type = store.order_cancellation_charge_type;
                                                    order_cancellation_charge_value = store.order_cancellation_charge_value;
                                                }

                                                Order_payment.findOne({ _id: order.order_payment_id }).then((order_payment) => {
                                                    if (order_payment) {

                                                        order_payment.completed_at = now;
                                                        order_payment.completed_date_in_city_timezone = utils.get_date_now_at_city(now, order.timezone);
                                                        order_payment.completed_date_tag = moment(order_payment.completed_date_in_city_timezone).format(DATE_FORMATE.DDMMYYYY);

                                                        var is_payment_mode_cash = order_payment.is_payment_mode_cash;

                                                        var total_wallet_amount = 0;
                                                        var order_wallet_payment = order_payment.wallet_payment;
                                                        if (order_payment.payment_id != null && !is_payment_mode_cash) {
                                                            order_wallet_payment = +order_wallet_payment + +order_payment.card_payment;
                                                        }

                                                        if (order_wallet_payment > 0) {
                                                            total_wallet_amount = wallet_history.add_wallet_history(ADMIN_DATA_ID.USER, user.unique_id, user._id, user.country_id,
                                                                order_payment.order_currency_code, user.wallet_currency_code,
                                                                order_payment.wallet_to_order_current_rate, order_wallet_payment, user.wallet,
                                                                WALLET_STATUS_ID.ADD_WALLET_AMOUNT, WALLET_COMMENT_ID.ORDER_REFUND, "Refund Amount Of Order : " + order.unique_id);

                                                            user.wallet = total_wallet_amount;

                                                            order_payment.is_order_payment_refund = true;
                                                            order_payment.refund_amount = order_wallet_payment;
                                                        }

                                                        var orders = user.orders;
                                                        var index = orders.indexOf(order._id);
                                                        if (index >= 0) {
                                                            orders.splice(index, 1);
                                                            user.orders = orders;
                                                        }
                                                        Promo_code.findOne({ _id: order_payment.promo_id }).then((promo_code) => {
                                                            if (promo_code) {
                                                                promo_code.used_promo_code = promo_code.used_promo_code - 1;
                                                                promo_code.save();
                                                            }
                                                        });
                                                        order_payment.promo_id = null;

                                                        order_payment.pay_to_provider = 0;
                                                        order_payment.pay_to_store = 0;

                                                        order_payment.total_admin_profit_on_store = 0;
                                                        order_payment.total_store_income = 0;
                                                        order_payment.total_admin_profit_on_delivery = 0;
                                                        order_payment.total_provider_income = 0;
                                                        order_payment.is_payment_paid = true;

                                                        order_payment.cash_payment = 0;
                                                        order_payment.card_payment = 0;
                                                        order_payment.wallet_payment = 0;
                                                        order_payment.promo_payment = 0;
                                                        order_payment.user_pay_payment = 0;
                                                        order_payment.total = 0;
                                                        order_payment.is_paid_from_wallet = false;
                                                        order_payment.is_store_pay_delivery_fees = false;
                                                        order_payment.is_order_price_paid_by_store = false,
                                                            order_payment.is_promo_for_delivery_service = false;

                                                        /*Start Cancellation charges */
                                                        City.findOne({ _id: order.city_id }).then((city) => {
                                                            var is_store_earning_add_in_wallet_on_cash_payment_for_city = false;
                                                            var is_store_earning_add_in_wallet_on_other_payment_for_city = false;
                                                            if (city) {
                                                                var is_store_earning_add_in_wallet_on_cash_payment_for_city = city.is_store_earning_add_in_wallet_on_cash_payment;
                                                                var is_store_earning_add_in_wallet_on_other_payment_for_city = city.is_store_earning_add_in_wallet_on_other_payment;
                                                            }
                                                            if (is_order_cancellation_charge_apply && order_status >= ORDER_STATE.ORDER_READY && order_payment.total_order_price > order_cancellation_charge_for_above_order_price) {

                                                                switch (order_cancellation_charge_type) {
                                                                    case ORDER_CANCELLATION_CHARGE_TYPE.PERCENTAGE: /* percentage */
                                                                        order_cancellation_charge_value = (order_payment.total_order_price) * order_cancellation_charge_value * 0.01;
                                                                        break;
                                                                    case ORDER_CANCELLATION_CHARGE_TYPE.ABSOLUTE: /* absolute */
                                                                        order_cancellation_charge_value = order_cancellation_charge_value;
                                                                        break;
                                                                    default: /* percentage */
                                                                        order_cancellation_charge_value = (order_payment.total_order_price) * order_cancellation_charge_value * 0.01;
                                                                        break;
                                                                }
                                                                order_cancellation_charge_value = utils.precisionRoundTwo(Number(order_cancellation_charge_value));

                                                                order_payment.pay_to_store = order_cancellation_charge_value;
                                                                order_payment.total_store_income = order_cancellation_charge_value;
                                                                order_payment.total_admin_profit_on_store = 0;
                                                                order_payment.user_pay_payment = order_cancellation_charge_value;
                                                                order_payment.total = order_cancellation_charge_value;
                                                                order_payment.is_cancellation_fee = true;
                                                                order_payment.order_cancellation_charge = order_cancellation_charge_value;

                                                                if ((setting_detail.is_store_earning_add_in_wallet_on_cash_payment && is_store_earning_add_in_wallet_on_cash_payment_for_city) || (setting_detail.is_store_earning_add_in_wallet_on_other_payment && is_store_earning_add_in_wallet_on_other_payment_for_city)) {
                                                                    order_payment.is_store_income_set_in_wallet = true;
                                                                    order_payment.store_income_set_in_wallet = Math.abs(order_cancellation_charge_value);

                                                                    var store_total_wallet_amount = wallet_history.add_wallet_history(ADMIN_DATA_ID.STORE, store.unique_id, store._id, store.country_id,
                                                                        store.wallet_currency_code, order_payment.order_currency_code,
                                                                        1, Math.abs(order_payment.pay_to_store), store.wallet, WALLET_STATUS_ID.ADD_WALLET_AMOUNT, WALLET_COMMENT_ID.SET_ORDER_PROFIT, "Cancellation profit Of This Order : " + order.unique_id);

                                                                    store.wallet = store_total_wallet_amount;
                                                                    store.save();
                                                                }

                                                                var payment_id = order_payment.payment_id;
                                                                let user_type = 0;
                                                                if(Number(request_data_body.order_type) == ADMIN_DATA_ID.VAITER){
                                                                    user_type = request_data_body.payment_id;
                                                                }
                                                                utils.pay_payment_for_selected_payment_gateway(user_type , user._id, payment_id, order_cancellation_charge_value, user.wallet_currency_code, function (payment_paid) {

                                                                    if (!payment_paid) {
                                                                        order_payment.is_paid_from_wallet = true;
                                                                        order_payment.wallet_payment = order_cancellation_charge_value;
                                                                        order_payment.total_after_wallet_payment = 0;

                                                                        var total_wallet_amount_new = wallet_history.add_wallet_history(ADMIN_DATA_ID.USER, user.unique_id,
                                                                            user._id, user.country_id, user.wallet_currency_code, order_payment.order_currency_code,
                                                                            order_payment.wallet_to_order_current_rate, order_cancellation_charge_value, user.wallet, WALLET_STATUS_ID.REMOVE_WALLET_AMOUNT, WALLET_COMMENT_ID.ORDER_CHARGED, "Cancellation Charge Of Order : " + order.unique_id);

                                                                        user.wallet = total_wallet_amount_new;

                                                                    } else {
                                                                        order_payment.total_after_wallet_payment = order_cancellation_charge_value;
                                                                        order_payment.card_payment = order_cancellation_charge_value;
                                                                    }
                                                                    order_payment.save();
                                                                    user.save();
                                                                });


                                                            } else {
                                                                user.save();
                                                                order_payment.save();
                                                            }
                                                        });
                                                        if (store) {
                                                            utils.sendPushNotification(ADMIN_DATA_ID.STORE, store.device_type, store.device_token, STORE_PUSH_CODE.USER_CANCELLED_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                                                        }
                                                        response_data.json({
                                                            success: true,
                                                            message: ORDER_MESSAGE_CODE.ORDER_CANCEL_SUCCESSFULLY
                                                        });

                                                    } else {
                                                        response_data.json({
                                                            success: true,
                                                            message: ORDER_MESSAGE_CODE.ORDER_CANCEL_SUCCESSFULLY
                                                        });
                                                    }
                                                }, (error) => {
                                                    console.log(error)
                                                    response_data.json({
                                                        success: false,
                                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                    });
                                                });
                                            }, (error) => {
                                                console.log(error)
                                                response_data.json({
                                                    success: false,
                                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                });
                                            });

                                        }, (error) => {
                                            console.log(error)
                                            response_data.json({
                                                success: false,
                                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                            });
                                        });

                                    }, (error) => {
                                        console.log(error)
                                        response_data.json({
                                            success: false,
                                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                        });
                                    });
                                }, (error) => {
                                    console.log(error)
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
                                });

                            } else {
                                response_data.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND });
                            }
                        }, (error) => {
                            console.log(error)
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
                } else {

                    response_data.json({ success: false, error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND });
                }
            }, (error) => {
                console.log(error)
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

user_vaiter_cancel_order = async (req, res) => {

    utils.check_request_params(req.body, [{ name: 'order_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let request_data_body = req.body;
            let user_id = request_data_body.user_id;
            let cancel_reason = request_data_body.cancel_reason;
            let now = new Date();

            let user = await User.findOne({ _id: user_id })
            if (!user) {
                res.json({ success: false, error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND });
                return;
            }

            if (request_data_body.server_token == null || user.server_token !== request_data_body.server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return
            }

            let order = await Order.findOne({ _id: request_data_body.order_id, user_id: user_id , order_status: {$ne : NEW_ORDER_STATE.CANCELLATION_REQUESTED} })
            if (!order) {
                res.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND });
                return;
            }

            let request = await Request.findOne({ _id: order.request_id })
            if (request) {
                request.delivery_status = NEW_ORDER_STATE.CANCELLATION_REQUESTED;
                request.delivery_status_manage_id = ORDER_STATUS_ID.WAITING_FOR_CANCEL;
                request.delivery_status_by = null;

                // var index = request.date_time.findIndex((x) => x.status == NEW_ORDER_STATE.CANCELLATION_REQUESTED);

                // if (index == -1) {
                request.date_time.push({ status: NEW_ORDER_STATE.CANCELLATION_REQUESTED, date: new Date() });
                // } else {
                //     request.date_time[index].date = new Date();
                // }
                await request.save();
            }

            let store = await Store.findOne({ _id: order.store_id });
            order.order_status = NEW_ORDER_STATE.CANCELLATION_REQUESTED;
            order.order_status_by = user._id;
            order.order_status_id = ORDER_STATUS_ID.WAITING_FOR_CANCEL;
            order.order_status_manage_id = ORDER_STATUS_ID.WAITING_FOR_CANCEL;
            order.cancel_reason = cancel_reason;

            // var index = order.date_time.findIndex((x) => x.status == NEW_ORDER_STATE.CANCELLATION_REQUESTED);
            // if (index == -1) {
            order.date_time.push({ status: NEW_ORDER_STATE.CANCELLATION_REQUESTED, date: new Date() });
            // } else {
                // order.date_time[index].date = new Date();
            // }

            // await Request_assistance.findOneAndUpdate({order_id : order._id} , {status: REQUEST_ASSISTANCE_STATUS.RESOLVED_AT_CANCELLED_ORDER},{multi : true});
            await order.save();
            // if (store) {
            //     utils.sendPushNotification(ADMIN_DATA_ID.STORE, store.device_type, store.device_token, STORE_PUSH_CODE.USER_CANCELLED_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
            // }

            //Vaiter Push Notification Remaining
            res.json({
                success: true,
                message: ORDER_MESSAGE_CODE.WAITING_FOR_VAITER_RESPONSE
            });

        } catch (error) {
            console.log(error)
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};

exports.user_vaiter_cancel_order =  user_vaiter_cancel_order;


//user show_invoice
exports.show_invoice = function (request_data, response_data) {

    utils.check_request_params(request_data.body, [{ name: 'order_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            User.findOne({ _id: request_data_body.user_id }).then((user) => {
                if (user) {
                    if (request_data_body.server_token !== null && user.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    } else {
                        Order.findOne({ _id: request_data_body.order_id }).then((order) => {
                            if (order) {
                                Request.findOne({ _id: order.request_id }).then((request) => {
                                    var current_provider = null;
                                    if (request) {
                                        current_provider = request.provider_id;
                                    }

                                    Provider.findOne({ _id: current_provider }).then((provider) => {
                                        if (provider) {
                                            var provider_data = provider;
                                        }

                                        Store.findOne({ _id: order.store_id }).then((store) => {

                                            Country.findOne({ _id: order.country_id }).then((country) => {
                                                var currency = "";
                                                if (country) {
                                                    currency = country.currency_sign;
                                                }
                                                Order_payment.findOne({ _id: order.order_payment_id }).then((order_payment) => {

                                                    order.is_user_show_invoice = request_data_body.is_user_show_invoice;

                                                    var orders = user.orders;
                                                    var index = orders.indexOf(order._id);
                                                    if (index >= 0) {
                                                        orders.splice(index, 1);
                                                        user.orders = orders;
                                                    }

                                                    order.save().then(() => {
                                                        if (store) {
                                                            emails.sendUserInvoiceEmail(request_data, user, provider_data, store, order_payment, currency);
                                                        }
                                                        user.save();
                                                        response_data.json({
                                                            success: true,
                                                            message: ORDER_MESSAGE_CODE.SHOW_INVOICE_SUCCESSFULLY
                                                        });
                                                    }, (error) => {
                                                        console.log(error)
                                                        response_data.json({
                                                            success: false,
                                                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                        });
                                                    });
                                                });

                                            }, (error) => {
                                                console.log(error)
                                                response_data.json({
                                                    success: false,
                                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                });
                                            });
                                        }, (error) => {
                                            console.log(error)
                                            response_data.json({
                                                success: false,
                                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                            });
                                        });

                                    }, (error) => {
                                        console.log(error)
                                        response_data.json({
                                            success: false,
                                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                        });
                                    });
                                }, (error) => {
                                    console.log(error)
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
                                });
                            } else {
                                response_data.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND });
                            }
                        }, (error) => {
                            console.log(error)
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
                } else {
                    response_data.json({ success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND });
                }
            }, (error) => {
                console.log(error)
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

// get_order_detail
exports.get_order_detail = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'order_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var type = Number(request_data_body.type);
            var Table;
            switch (type) {
                case ADMIN_DATA_ID.USER:
                    Table = User;
                    break;
                case ADMIN_DATA_ID.PROVIDER:
                    Table = Provider;
                    break;
                case ADMIN_DATA_ID.STORE:
                    Table = Store;
                    break;
                default:
                    break;
            }

            Table.findOne({ _id: request_data_body.id }).then((detail) => {
                if (detail) {
                    if (request_data_body.server_token !== null && detail.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    } else {

                        Order.findOne({ _id: request_data_body.order_id }).then((order) => {
                            if (order) {
                                User.findOne({ _id: order.user_id }).then((user) => {
                                    Store.findOne({ _id: order.store_id }).then((store) => {
                                        Request.findOne({ _id: order.request_id }).then((request) => {
                                            Provider.findOne({ _id: request.provider_id }).then((provider) => {
                                                var user_detail = {
                                                    first_name: user.first_name,
                                                    last_name: user.last_name,
                                                    image_url: user.image_url
                                                }

                                                var provider_detail = {
                                                    first_name: provider.first_name,
                                                    last_name: provider.last_name,
                                                    image_url: provider.image_url
                                                }

                                                var store_detail = {}

                                                if (store) {
                                                    store_detail = {
                                                        name: store.name,
                                                        image_url: store.image_url
                                                    }
                                                }

                                                response_data.json({
                                                    success: true,
                                                    message: ORDER_MESSAGE_CODE.SHOW_INVOICE_SUCCESSFULLY,
                                                    user_detail: user_detail,
                                                    provider_detail: provider_detail,
                                                    store_detail: store_detail
                                                });
                                            }, (error) => {
                                                console.log(error)
                                                response_data.json({
                                                    success: false,
                                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                });
                                            });
                                        }, (error) => {
                                            console.log(error)
                                            response_data.json({
                                                success: false,
                                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                            });
                                        });
                                    }, (error) => {
                                        console.log(error)
                                        response_data.json({
                                            success: false,
                                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                        });
                                    });
                                }, (error) => {
                                    console.log(error)
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
                                });
                            } else {
                                response_data.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND });
                            }
                        }, (error) => {
                            console.log(error)
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
                } else {

                    response_data.json({ success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND });
                }
            }, (error) => {
                console.log(error)
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


user_refund_order = async (req, res) => {
    
};

module.exports.user_refund_order = user_refund_order
