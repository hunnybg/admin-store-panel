require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/push_code');
require('../../utils/constants');
var utils = require('../../utils/utils');
var cron = require('./cron_job');
var schedule = require('node-schedule');
var moment = require('moment');
var my_request = require('../../controllers/store/request');
var Country = require('mongoose').model('country');
var Provider = require('mongoose').model('provider');
var Store = require('mongoose').model('store');
var City = require('mongoose').model('city');
var Order = require('mongoose').model('order');
var Order_payment = require('mongoose').model('order_payment');
var Promo_code = require('mongoose').model('promo_code');
var Request = require('mongoose').model('request');
var console = require('../../utils/console');


var run_continue_30_sec_cron = schedule.scheduleJob('*/30 * * * * *', function () {
    Request.find({ delivery_status: ORDER_STATE.WAITING_FOR_DELIVERY_MAN }).then((requests) => {
        var end_time = new Date();
        requests.forEach(function (request) {
            var index = request.date_time.findIndex((x) => x.status == ORDER_STATE.WAITING_FOR_DELIVERY_MAN);
            if (index >= 0) {
                var start_time = request.date_time[index].date;
            }
            var time_diff_sec = utils.getTimeDifferenceInSecond(end_time, start_time);
            var time_left_to_responds_trip = setting_detail.provider_timeout - time_diff_sec;
            if (time_left_to_responds_trip <= -10) {
                my_request.findNearestProvider(request, null);
            }
        });
    }, (error) => {
        console.log(error)
    });
});

exports.schedule_order_push = function () {
    Order.find({ is_schedule_order: true, is_schedule_order_informed_to_store: false, order_status: { $lt: ORDER_STATE.WAITING_FOR_DELIVERY_MAN } }).then((orders) => {
        if (orders.length > 0) {
            orders.forEach(function (order) {
                var order_unique_id = order.unique_id;
                var now = new Date();
                Store.findOne({ _id: order.store_id }).then((store) => {
                    if (store) {
                        var device_token = store.device_token;
                        var device_type = store.device_type;
                        var inform_schedule_order_before_min = store.inform_schedule_order_before_min;
                        var schedule_order_start_at = order.schedule_order_start_at;

                        var time_diff_min = utils.getTimeDifferenceInMinute(schedule_order_start_at, now);

                        if (time_diff_min <= inform_schedule_order_before_min) {
                            utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.STORE, device_type, device_token, STORE_PUSH_CODE.INFORM_SCHEDULE_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_unique_id, "");
                            order.is_schedule_order_informed_to_store = true;
                            order.save();
                        }
                    }
                }, (error) => {
                    console.log(error)
                });
            });
        }
    }, (error) => {
        console.log(error)
    });

};

var run_continue_30_min_cron = schedule.scheduleJob('* */30 * * * *', function () {
    // City.find({}).then((city_details) => {
    //     if (city_details) {
    //         city_details.forEach(function (city_detail) {
    //             var city_timezone = city_detail.timezone;

    //             var city_date_now = new Date();
    //             var city_date_next = city_detail.daily_cron_date;

    //             if(!city_date_next){
    //                 city_date_next = new Date();
    //                 city_date_next = city_date_next.setMinutes(city_date_next.getMinutes()-1);
    //             }

    //             var city_date_now_tag = moment.utc(utils.get_date_now_at_city(city_date_now, city_timezone)).format("DDMMYYYY");
    //             var city_date_next_tag = moment.utc(utils.get_date_now_at_city(city_date_next, city_timezone)).format("DDMMYYYY");

    //             if (city_date_now_tag != city_date_next_tag) {

    //                 Promo_code.find({is_promo_expiry_date: true}).then((promo_codes) => {
    //                     promo_codes.forEach(function (promo_code_detail) {
    //                         if (promo_code_detail.promo_expire_date !== null)
    //                         {
    //                             var expired_date = new Date(promo_code_detail.promo_expire_date);
    //                             var date = new Date(Date.now());

    //                             if (expired_date < date)
    //                             {

    //                                 if (promo_code_detail.is_expired == false)
    //                                 {

    //                                     promo_code_detail.is_expired = true;
    //                                     promo_code_detail.save();

    //                                 }
    //                             }
    //                         }
    //                     });
    //                 }, (error) => {
    //                     console.log(error)
    //                 });

    //                 city_date_next = new Date();
    //                 city_date_next = city_date_next.setMinutes(city_date_next.getMinutes()-1);
    //                 city_date_next = new Date(city_date_next);
    //                 cron.set_online_provider_analytics(city_detail._id, city_timezone, city_date_next);
    //                 provider_auto_transfer(city_detail)
    //                 store_auto_transfer(city_detail)
    //                 city_detail.daily_cron_date = new Date();
    //                 city_detail.save();
    //             }

    //         });
    //     }
    // }, (error) => {
    //     console.log(error)
    // });
    let query = {
        auto_transfer: true,
        account_id: { $ne: '' },
        bank_id: { $ne: '' }
        // account_id: { $exist: true },
        // bank_id: { $exist: true },
    }

    Store.find(query).then((store_details) => {
        if (store_details.length > 0) {
            store_details.forEach((store_detail) => {
                let store_timezone = store_detail.timezone;
                let store_date_now = new Date();
                let store_date_next = store_detail.time_of_transfer;

                if (!store_date_next) {
                    store_date_next = new Date();
                    store_date_next = store_date_next.setMinutes(store_date_next.getMinutes() - 1);
                }

                if(!store_timezone){
                    store_timezone = 'America/St_Johns';
                }

                let store_date_now_tag = moment.utc(utils.get_date_now_at_city(store_date_now, store_timezone)).format("DDMMYYYY");
                let store_date_next_tag = moment.utc(utils.get_date_now_at_city(store_date_next, store_timezone)).format("DDMMYYYY");

                if (store_date_now_tag != store_date_next_tag) {

                    store_date_next = new Date();
                    store_date_next = store_date_next.setMinutes(store_date_next.getMinutes() - 1);
                    store_date_next = new Date(store_date_next);
                    store_detail.daily_cron_date = new Date();
                    store_detail.save();
                    transfer_payment_to_store(store_detail)
                }
            });
        }
    }, (error) => {
        console.log(error)
    });

    Provider.find({ $or: [{ current_request: { $ne: [] } }, { requests: { $ne: [] } }] }).then((provider_list) => {

        provider_list.forEach(function (provider_detail) {
            provider_detail.current_request.forEach(function (current_order_id) {
                remove_current_request_from_provider(provider_detail, current_order_id)
            })
            provider_detail.requests.forEach(function (current_order_id) {
                remove_request_from_provider(provider_detail, current_order_id)
            })
        });
    }, (error) => {
        console.log(error)
    })
});

function remove_request_from_provider(provider_detail, current_order_id) {
    Request.findOne({ _id: current_order_id }).then((order_detail) => {
        if (order_detail && order_detail.delivery_status_manage_id != ORDER_STATUS_ID.IDEAL && order_detail.delivery_status_manage_id != ORDER_STATUS_ID.RUNNING) {
            var index = provider_detail.requests.indexOf(current_order_id)
            if (index != -1) {
                provider_detail.requests.splice(index, 1)
                provider_detail.save();
            }
        }
    }, (error) => {
        console.log(error)
    })
}

function remove_current_request_from_provider(provider_detail, current_order_id) {
    Request.findOne({ _id: current_order_id }).then((order_detail) => {
        if (order_detail && order_detail.delivery_status_manage_id != ORDER_STATUS_ID.IDEAL && order_detail.delivery_status_manage_id != ORDER_STATUS_ID.RUNNING) {
            var index = provider_detail.current_request.indexOf(current_order_id)
            if (index != -1) {
                provider_detail.current_request.splice(index, 1)
                provider_detail.save();
            }
        }
    }, (error) => {
        console.log(error)
    })
}

function provider_auto_transfer(city_detail) {
    var today = new Date(Date.now());
    Country.findOne({ _id: city_detail.country_id }).then((country_detail) => {
        if (country_detail.is_auto_transfer) {
            var auto_transfer_day = country_detail.auto_transfer_day;
            var final_day = new Date(today.setDate(today.getDate() - auto_transfer_day));
            Provider.find({
                provider_type: ADMIN_DATA_ID.ADMIN, city_id: city_detail._id, last_transferred_date: { $lte: final_day }, account_id: { $exist: true }, account_id: { $ne: '' },
                bank_id: { $exist: true }, bank_id: { $ne: '' }
            }).then((provider_list) => {
                provider_list.forEach(function (provider_detail) {
                    transfer_payment_to_provider(provider_detail, country_detail.currencycode, country_detail._id);
                });
            }, (error) => {
                console.log(error)
            });
        }
    }, (error) => {
        console.log(error)
    });
}

function transfer_payment_to_provider(provider_detail, currencycode, country_id) {
    var order_query = {
        $lookup:
        {
            from: "orders",
            localField: "order_id",
            foreignField: "_id",
            as: "order_detail"
        }
    };
    var array_to_json_order_query = { $unwind: "$order_detail" };
    Order_payment.aggregate([
        order_query, array_to_json_order_query,
        { $match: { 'order_detail.order_status_id': { $eq: ORDER_STATUS_ID.COMPLETED } } },
        { $match: { 'provider_id': { $eq: provider_detail._id } } },
        { $match: { 'is_provider_income_set_in_wallet': { $eq: false } } },
        { $match: { 'is_transfered_to_provider': { $eq: false } } },
        { $group: { _id: null, total: { $sum: '$pay_to_provider' } } }
    ]).then((order_payment_list) => {
        if (order_payment_list.length > 0) {
            var amount = order_payment_list[0].total.toFixed(2)
            utils.transfer_amount_to_employee(amount, provider_detail.account_id, currencycode, function (response_data) {
                if (response_data) {
                    utils.add_transfered_history(ADMIN_DATA_ID.PROVIDER, provider_detail._id, country_id,
                        amount, currencycode, 1, response_data.transfer_id, ADMIN_DATA_ID.ADMIN, null);
                    Order_payment.update({ is_provider_income_set_in_wallet: false, is_transfered_to_provider: false, provider_id: provider_detail._id }, { is_transfered_to_provider: true }, { multi: true }, function (error, order_payment_detail) {

                    });
                    provider_detail.last_transferred_date = new Date();
                    provider_detail.save();
                } else {
                    utils.add_transfered_history(ADMIN_DATA_ID.PROVIDER, provider_detail._id, country_id,
                        amount, currencycode, 0, '', ADMIN_DATA_ID.ADMIN, response_data.error);
                }
            });
        }
    }, (error) => {
        console.log(error)
    })
}

// function store_auto_transfer(city_detail) {
//     var today = new Date(Date.now());
//     Country.findOne({ _id: city_detail.country_id }).then((country_detail) => {
//         if (country_detail.is_auto_transfer) {
//             var auto_transfer_day = country_detail.auto_transfer_day;
//             var final_day = new Date(today.setDate(today.getDate() - auto_transfer_day));
//             Store.find({
//                 store_type: ADMIN_DATA_ID.ADMIN, city_id: city_detail._id, last_transferred_date: { $lte: final_day }, account_id: { $exist: true }, account_id: { $ne: '' },
//                 bank_id: { $exist: true }, bank_id: { $ne: '' }
//             }).then((store_list) => {
//                 store_list.forEach(function (store_detail) {
//                     transfer_payment_to_store(store_detail, country_detail.currencycode, country_detail._id);
//                 });
//             });
//         }
//     }, (error) => {
//         console.log(error)
//     });
// }

// function store_auto_transfer(store_detail) {
//     var today = new Date(Date.now());
//     Country.findOne({ _id: city_detail.country_id }).then((country_detail) => {
//         if (country_detail.is_auto_transfer) {
//             var auto_transfer_day = country_detail.auto_transfer_day;
//             var final_day = new Date(today.setDate(today.getDate() - auto_transfer_day));
//             Store.find({
//                 store_type: ADMIN_DATA_ID.ADMIN, city_id: city_detail._id, last_transferred_date: { $lte: final_day }, account_id: { $exist: true }, account_id: { $ne: '' },
//                 bank_id: { $exist: true }, bank_id: { $ne: '' }
//             }).then((store_list) => {
//                 store_list.forEach(function (store_detail) {
//                     transfer_payment_to_store(store_detail, country_detail.currencycode, country_detail._id);
//                 });
//             });
//         }
//     }, (error) => {
//         console.log(error)
//     });
// }

function transfer_payment_to_store(store_detail) {
    let country_id = store_detail.country_id;
    let currencycode = store_detail.wallet_currency_code;
    var order_query = {
        $lookup:
        {
            from: "orders",
            localField: "order_id",
            foreignField: "_id",
            as: "order_detail"
        }
    };
    var array_to_json_order_query = { $unwind: "$order_detail" };
    Order_payment.aggregate([
        order_query, array_to_json_order_query,
        { $match: { 'order_detail.order_status_id': { $eq: ORDER_STATUS_ID.COMPLETED } } },
        { $match: { 'store_id': { $eq: store_detail._id } } },
        { $match: { 'is_transfered_to_store': { $eq: false } } },
        { $group: { _id: null, total: { $sum: '$pay_to_store' } } }
    ]).then((order_payment_list) => {
        if (order_payment_list.length > 0) {
            var amount = order_payment_list[0].total.toFixed(2)
            utils.transfer_amount_to_employee(amount, store_detail.account_id, currencycode, function (response_data) {
                if (response_data) {
                    utils.add_transfered_history(ADMIN_DATA_ID.STORE, store_detail._id, country_id,
                        amount, currencycode, 1, response_data.transfer_id, ADMIN_DATA_ID.ADMIN, null);
                    Order_payment.update({ store_id: store_detail._id, is_transfered_to_store: false }, { is_transfered_to_store: true }, { multi: true }, function (error, order_payment_detail) {

                    })
                    store_detail.last_transferred_date = new Date();
                    store_detail.save();
                } else {
                    utils.add_transfered_history(ADMIN_DATA_ID.STORE, store_detail._id, country_id,
                        amount, currencycode, 0, '', ADMIN_DATA_ID.ADMIN, response_data.error);
                }
            });
        }
    }, (error) => {
        console.log(error)
    })
}

exports.set_online_provider_analytics = function (city_id, city_timezone, last_day_time) {
    Provider.find({ is_online: true, city_id: city_id }).then((providers) => {
        providers.forEach(function (provider) {
            if (provider) {
                var is_active_time = false;
                if (provider.is_active_for_job) {
                    is_active_time = true;
                }
                utils.insert_daily_provider_analytics_with_date(last_day_time, city_timezone, provider._id, 0, true, provider.start_online_time, is_active_time, provider.start_active_job_time);

                provider.start_online_time = new Date();
                utils.insert_daily_provider_analytics(city_timezone, provider._id, 0, true, null, is_active_time, null);

                if (provider.is_active_for_job) {
                    provider.start_active_job_time = new Date();

                }
                provider.save();
            }
        });
    }, (error) => {
        console.log(error)
    });

};