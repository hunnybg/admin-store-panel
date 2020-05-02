require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var moment = require('moment');
var moment = require('moment-timezone');
var utils = require('../../utils/utils');
var myEarning = require('../../controllers/store/store_earning');
var Order = require('mongoose').model('order');
var Order_payment = require('mongoose').model('order_payment');
var Country = require('mongoose').model('country');
var Store = require('mongoose').model('store');
var mongoose = require('mongoose');
var Store_analytic_daily = require('mongoose').model('store_analytic_daily');
var console = require('../../utils/console');


exports.get_store_earning = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'start_date', type: 'string' }, { name: 'end_date', type: 'string' }], function (response) {
        if (response.success) {
            var request_data_body = request_data.body;
            Store.findOne({ _id: request_data_body.store_id }).then((store) => {
                if (store) {
                    if (request_data_body.server_token !== null && store.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });

                    } else {

                        var start_date = request_data_body.start_date;
                        var end_date = request_data_body.end_date;

                        if (end_date == '' || end_date == undefined) {
                            end_date = new Date();
                        } else {
                            end_date = new Date(end_date);
                            end_date = end_date.setHours(23, 59, 59, 999);
                            end_date = new Date(end_date);
                        }

                        if (start_date == '' || start_date == undefined) {
                            start_date = new Date(end_date.getTime() - (6 * 24 * 60 * 60 * 1000));
                            start_date = start_date.setHours(0, 0, 0, 0);
                            start_date = new Date(start_date);
                        } else {
                            start_date = new Date(start_date);
                            start_date = start_date.setHours(0, 0, 0, 0);
                            start_date = new Date(start_date);
                        }

                        var filter = { "$match": { $and: [{ "completed_date_in_city_timezone": { $gte: start_date, $lt: end_date } }, { total_store_income: { $ne: 0 } }] } };

                        var user_query = {
                            $lookup:
                            {
                                from: "users",
                                localField: "user_id",
                                foreignField: "_id",
                                as: "user_detail"
                            }
                        };
                        var array_to_json_user_detail = { $unwind: "$user_detail" };
                        var store_query = {
                            $lookup:
                            {
                                from: "stores",
                                localField: "store_id",
                                foreignField: "_id",
                                as: "store_detail"
                            }
                        };
                        var array_to_json_store_detail = {
                            $unwind: {
                                path: "$store_detail",
                                preserveNullAndEmptyArrays: true
                            }
                        };
                        var order_payment_query = {
                            $lookup:
                            {
                                from: "order_payments",
                                localField: "order_payment_id",
                                foreignField: "_id",
                                as: "order_payment_detail"
                            }
                        };
                        var array_to_json_order_payment_query = { $unwind: "$order_payment_detail" };


                        var country_query = {
                            $lookup:
                            {
                                from: "countries",
                                localField: "country_id",
                                foreignField: "_id",
                                as: "country_detail"
                            }
                        };
                        var array_to_json_country_query = { $unwind: "$country_detail" };

                        var request_query = {
                            $lookup:
                            {
                                from: "requests",
                                localField: "request_id",
                                foreignField: "_id",
                                as: "request_detail"
                            }
                        };

                        var array_to_json_request_query = {
                            $unwind: {
                                path: "$request_detail",
                                preserveNullAndEmptyArrays: true
                            }
                        };

                        var provider_query = {
                            $lookup:
                            {
                                from: "providers",
                                localField: "request_detail.provider_id",
                                foreignField: "_id",
                                as: "provider_detail"
                            }
                        };


                        //var array_to_json_provider_query = {$unwind: "$provider_detail"};
                        var payment_gateway_query = {
                            $lookup:
                            {
                                from: "payment_gateways",
                                localField: "order_payment_detail.payment_id",
                                foreignField: "_id",
                                as: "payment_gateway_detail"
                            }
                        };
                        var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
                        var page = request_data_body.page;

                        var sort_field = request_data_body.sort_field;
                        var sort_order = request_data_body.sort_order;
                        var search_field = request_data_body.search_field;
                        var search_value = request_data_body.search_value;
                        search_value = search_value.replace(/^\s+|\s+$/g, '');
                        search_value = search_value.replace(/ +(?= )/g, '');

                        if (search_field === "user_detail.first_name") {
                            var query1 = {};
                            var query2 = {};
                            var query3 = {};
                            var query4 = {};
                            var query5 = {};
                            var query6 = {};
                            var full_name = search_value.split(' ');
                            if (typeof full_name[0] === 'undefined' || typeof full_name[1] === 'undefined') {

                                query1[search_field] = { $regex: new RegExp(search_value, 'i') };
                                query2['user_detail.last_name'] = { $regex: new RegExp(search_value, 'i') };
                                var search = { "$match": { $or: [query1, query2] } };
                            } else {

                                query1[search_field] = { $regex: new RegExp(search_value, 'i') };
                                query2['user_detail.email'] = { $regex: new RegExp(search_value, 'i') };
                                query3[search_field] = { $regex: new RegExp(full_name[0], 'i') };
                                query4['user_detail.email'] = { $regex: new RegExp(full_name[0], 'i') };
                                query5[search_field] = { $regex: new RegExp(full_name[1], 'i') };
                                query6['user_detail.email'] = { $regex: new RegExp(full_name[1], 'i') };
                                var search = { "$match": { $or: [query1, query2, query3, query4, query5, query6] } };
                            }
                        } else if (search_field === "provider_detail.first_name") {
                            var query1 = {};
                            var query2 = {};
                            var query3 = {};
                            var query4 = {};
                            var query5 = {};
                            var query6 = {};
                            var full_name = search_value.split(' ');
                            if (typeof full_name[0] === 'undefined' || typeof full_name[1] === 'undefined') {

                                query1[search_field] = { $regex: new RegExp(search_value, 'i') };
                                query2['provider_detail.last_name'] = { $regex: new RegExp(search_value, 'i') };
                                var search = { "$match": { $or: [query1, query2] } };
                            } else {

                                query1[search_field] = { $regex: new RegExp(search_value, 'i') };
                                query2['provider_detail.email'] = { $regex: new RegExp(search_value, 'i') };
                                query3[search_field] = { $regex: new RegExp(full_name[0], 'i') };
                                query4['provider_detail.email'] = { $regex: new RegExp(full_name[0], 'i') };
                                query5[search_field] = { $regex: new RegExp(full_name[1], 'i') };
                                query6['provider_detail.email'] = { $regex: new RegExp(full_name[1], 'i') };
                                var search = { "$match": { $or: [query1, query2, query3, query4, query5, query6] } };
                            }
                        } else if (search_field === "store_detail.name") {
                            var query1 = {};
                            var query2 = {};
                            var query3 = {};
                            var query4 = {};
                            var query5 = {};
                            var query6 = {};
                            var full_name = search_value.split(' ');
                            if (typeof full_name[0] === 'undefined' || typeof full_name[1] === 'undefined') {

                                query1[search_field] = { $regex: new RegExp(search_value, 'i') };
                                query2['store_detail.name'] = { $regex: new RegExp(search_value, 'i') };
                                var search = { "$match": { $or: [query1, query2] } };
                            } else {

                                query1[search_field] = { $regex: new RegExp(search_value, 'i') };
                                query2['store_detail.email'] = { $regex: new RegExp(search_value, 'i') };
                                query3[search_field] = { $regex: new RegExp(full_name[0], 'i') };
                                query4['store_detail.email'] = { $regex: new RegExp(full_name[0], 'i') };
                                query5[search_field] = { $regex: new RegExp(full_name[1], 'i') };
                                query6['store_detail.email'] = { $regex: new RegExp(full_name[1], 'i') };
                                var search = { "$match": { $or: [query1, query2, query3, query4, query5, query6] } };
                            }
                        } else {
                            var query = {};
                            query[search_field] = { $regex: new RegExp(search_value, 'i') };
                            var search = { "$match": query };
                        }
                        // var filter = {"$match": {}};
                        // filter = {"$match": {"completed_at": {$gte: start_date, $lt: end_date}}};
                        // filter = {"$match": {$and: [{"completed_date_in_city_timezone": {$gte: start_date, $lt: end_date}}, {total_store_income: {$ne: 0}}]}};
                        //
                        var sort = { "$sort": {} };
                        sort["$sort"][sort_field] = parseInt(sort_order);
                        var count = { $group: { _id: null, total: { $sum: 1 }, data: { $push: '$data' } } };
                        var skip = {};
                        skip["$skip"] = (page * number_of_rec) - number_of_rec;
                        var limit = {};
                        limit["$limit"] = number_of_rec;

                        var store_condition = { "$match": { 'store_id': { $eq: mongoose.Types.ObjectId(request_data_body.store_id) } } };
                        var order_status_id_condition = { "$match": { $or: [{ 'order_status_id': { $eq: ORDER_STATUS_ID.COMPLETED } }, { 'order_status': { $eq: ORDER_STATE.CANCELED_BY_USER } }] } };

                        Order.aggregate([store_condition, order_status_id_condition, user_query, order_payment_query, country_query, request_query, array_to_json_order_payment_query, payment_gateway_query, store_query, array_to_json_user_detail, array_to_json_store_detail, array_to_json_country_query, array_to_json_request_query, provider_query
                            , search
                            , filter
                            , count
                        ]).then((orders) => {

                            if (orders.length === 0) {
                                response_data.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND, pages: 0 });
                            } else {
                                var pages = Math.ceil(orders[0].total / number_of_rec);
                                var total_condition = {
                                    $group: {
                                        _id: null,
                                        total_completed_orders: { $sum: { $cond: [{ $eq: ["$order_status", NEW_ORDER_STATE.ORDER_COMPLETED] }, 1, 0] } },
                                        admin_earn_wallet: { $sum: '$order_payment_detail.wallet_payment' },
                                        store_earn: { $sum: '$order_payment_detail.total_store_income' },
                                        total: { $sum: '$order_payment_detail.total' },
                                        pay_to_provider: { $sum: '$order_payment_detail.pay_to_provider' },
                                        pay_to_store: { $sum: '$order_payment_detail.pay_to_store' },
                                        total_item_count: { $sum: '$order_payment_detail.total_item_count' },
                                        store_have_service_payment: { $sum: { '$cond': [{ '$eq': ['$order_payment_detail.is_store_pay_delivery_fees', true] }, '$total_delivery_price', 0] } }

                                    }
                                }

                                Order.aggregate([store_condition, order_status_id_condition, user_query, order_payment_query, country_query, request_query, array_to_json_order_payment_query, payment_gateway_query, store_query, array_to_json_user_detail, array_to_json_store_detail, array_to_json_country_query, array_to_json_request_query, provider_query
                                    , search
                                    , filter
                                    , total_condition
                                ]).then((order_total) => {
                                    if (page) {
                                        Order.aggregate([store_condition, order_status_id_condition, user_query, order_payment_query, country_query, request_query, array_to_json_order_payment_query, payment_gateway_query, store_query, array_to_json_user_detail, array_to_json_store_detail, array_to_json_country_query, array_to_json_request_query, provider_query
                                            , sort
                                            , search
                                            , filter
                                            , skip, limit
                                        ]).then((orders) => {

                                            response_data.json({
                                                success: true,
                                                message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY, pages: pages,
                                                admin_currency: setting_detail.admin_currency,
                                                order_total: order_total[0],
                                                orders: orders
                                            });
                                        }, (error) => {
                                            console.log(error);
                                            response_data.json({
                                                success: false,
                                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                            });
                                        });
                                    } else {
                                        Order.aggregate([store_condition, order_status_id_condition, user_query, order_payment_query, country_query, request_query, array_to_json_order_payment_query, payment_gateway_query, store_query, array_to_json_user_detail, array_to_json_store_detail, array_to_json_country_query, array_to_json_request_query, provider_query
                                            , sort
                                            , search
                                            , filter
                                        ]).then((orders) => {
                                            response_data.json({
                                                success: true,
                                                message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                                                admin_currency: setting_detail.admin_currency,
                                                order_total: order_total[0],
                                                orders: orders
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
                } else {
                    response_data.json({ success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND });
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

exports.store_daily_earning = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'start_date' }], function (response) {
        if (response.success) {
            var request_data_body = request_data.body;
            Store.findOne({ _id: request_data_body.store_id }).then((store) => {
                if (store) {
                    if (request_data_body.server_token !== null && store.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    } else {
                        Country.findOne({ _id: store.country_id }).then((country) => {
                            var currency = "";
                            if (country) {
                                currency = country.currency_sign;
                            }

                            if (typeof request_data_body.start_date == 'object') {
                                var today = new Date(request_data_body.start_date.formatted);
                            } else {
                                var today = new Date(request_data_body.start_date);
                            }


                            if (today == '' || today == undefined) {
                                today = new Date();
                            }

                            var tag_date = moment(today).format(DATE_FORMATE.DDMMYYYY);

                            var start_date = today;
                            start_date = start_date.setHours(0, 0, 0, 0);
                            start_date = new Date(start_date);
                            var end_date = today;
                            end_date = end_date.setHours(23, 59, 59, 999);
                            end_date = new Date(end_date);

                            var store_condition = { "$match": { 'store_id': { $eq: mongoose.Types.ObjectId(request_data_body.store_id) } } };
                            var order_status_id_condition = { "$match": { $or: [{ 'order_status_id': { $eq: ORDER_STATUS_ID.COMPLETED } }, { 'order_status': { $eq: ORDER_STATE.CANCELED_BY_USER } }] } };

                            var filter = { "$match": { $and: [{ "completed_date_in_city_timezone": { $gte: start_date, $lt: end_date } }, { total_store_income: { $ne: 0 } }] } };
                            var payment_gateway_query = {
                                $lookup:
                                {
                                    from: "payment_gateways",
                                    localField: "payment_id",
                                    foreignField: "_id",
                                    as: "payment_gateway_detail"
                                }
                            };

                            Store_analytic_daily.findOne({ store_id: store._id, date_tag: tag_date }).then((store_analytic_daily) => {
                                var store_analytic_daily_data = {};
                                if (store_analytic_daily) {
                                    store_analytic_daily_data = store_analytic_daily;
                                }

                                Order_payment.aggregate([store_condition, filter, payment_gateway_query]).then((order_payments) => {


                                    if (order_payments.length === 0) {
                                        var order_total = {};
                                        response_data.json({
                                            success: true,
                                            message: STORE_MESSAGE_CODE.GET_DAILY_EARNING_SUCCESSFULLY,
                                            currency: currency,
                                            store_analytic_daily: store_analytic_daily_data,
                                            order_total: order_total,
                                            order_payments: order_payments
                                        });
                                    } else {
                                        var total_condition = {
                                            $group: {
                                                _id: null,

                                                total_item_price: { $sum: '$total_cart_price' },
                                                total_store_tax_price: { $sum: '$total_store_tax_price' },
                                                total_order_price: { $sum: '$total_order_price' },
                                                total_store_income: { $sum: '$total_store_income' },
                                                total_admin_profit_on_store: { $sum: '$total_admin_profit_on_store' },

                                                // store_have_order_payment: {$sum: {'$cond': [{'$eq': ['$is_payment_mode_cash', true], '$eq': ['$is_order_price_paid_by_store', false]}, '$total_order_price', 0]}},
                                                store_have_order_payment: { $sum: { $add: [{ $sum: { $cond: [{ $and: [{ $eq: ["$is_payment_mode_cash", true] }, { $eq: ["$is_order_price_paid_by_store", false] }] }, '$total_order_price', 0] } }, { $sum: { $cond: [{ $and: [{ $eq: ["$is_payment_mode_cash", true] }, { $eq: ["$delivery_price_used_type", 2] }] }, "$user_pay_payment", 0] } }] } },
                                                store_have_service_payment: { $sum: { '$cond': [{ '$eq': ['$is_store_pay_delivery_fees', true] }, '$total_delivery_price', 0] } },
                                                total_deduct_wallet_income: { $sum: { '$cond': [{ "$and": [{ '$eq': ['$is_store_income_set_in_wallet', true] }, { '$lt': ['$pay_to_store', 0] }] }, '$store_income_set_in_wallet', 0] } },
                                                total_added_wallet_income: { $sum: { '$cond': [{ "$and": [{ '$eq': ['$is_store_income_set_in_wallet', true] }, { '$gt': ['$pay_to_store', 0] }] }, '$store_income_set_in_wallet', 0] } },

                                                total_earning: { $sum: '$total_store_income' },
                                                total_wallet_income_set: { $sum: { '$cond': [{ '$eq': ['$is_store_income_set_in_wallet', true] }, '$pay_to_store', 0] } },
                                                total_transferred_amount: { $sum: { '$cond': [{ $and: [{ '$eq': ['$is_store_income_set_in_wallet', false] }, { '$eq': ['$is_transfered_to_store', true] }] }, '$pay_to_store', 0] } },
                                                pay_to_store: { $sum: { '$cond': [{ $and: [{ '$eq': ['$is_store_income_set_in_wallet', false] }, { '$eq': ['$is_transfered_to_store', false] }] }, '$pay_to_store', 0] } },

                                            }
                                        }


                                        Order_payment.aggregate([store_condition, filter, total_condition, payment_gateway_query]).then((order_total) => {


                                            response_data.json({
                                                success: true,
                                                message: STORE_MESSAGE_CODE.GET_DAILY_EARNING_SUCCESSFULLY,
                                                currency: currency,
                                                store_analytic_daily: store_analytic_daily_data,
                                                order_total: order_total[0],
                                                order_payments: order_payments
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
                        }, (error) => {
                            console.log(error);
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

exports.store_weekly_earning = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'start_date', type: 'string' }, { name: 'end_date', type: 'string' }], function (response) {
        if (response.success) {
            var request_data_body = request_data.body;
            Store.findOne({ _id: request_data_body.store_id }).then((store) => {
                if (store) {
                    if (request_data_body.type != 1 && request_data_body.server_token !== null && store.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    } else {
                        Country.findOne({ _id: store.country_id }).then((country) => {
                            var currency = "";
                            if (country) {
                                currency = country.currency_sign;
                            }
                            var start_date = new Date(request_data_body.start_date);
                            var end_date = new Date(request_data_body.end_date);
                            start_date = start_date.setHours(0, 0, 0, 0);
                            start_date = new Date(start_date);

                            end_date = end_date.setHours(23, 59, 59, 999);
                            end_date = new Date(end_date);

                            var start_date_time = start_date;

                            var store_condition = { "$match": { 'store_id': { $eq: mongoose.Types.ObjectId(request_data_body.store_id) } } };
                            var filter = { "$match": { $and: [{ "completed_date_in_city_timezone": { $gte: start_date, $lt: end_date } }, { total_store_income: { $ne: 0 } }] } };
                            var order_status_id_condition = { "$match": { $or: [{ 'order_status_id': { $eq: ORDER_STATUS_ID.COMPLETED } }, { 'order_status': { $eq: ORDER_STATE.CANCELED_BY_USER } }] } };

                            var total_condition = {
                                $group: {
                                    _id: null,

                                    total_item_price: { $sum: '$total_cart_price' },
                                    total_store_tax_price: { $sum: '$total_store_tax_price' },
                                    total_order_price: { $sum: '$total_order_price' },
                                    total_store_income: { $sum: '$total_store_income' },
                                    total_admin_profit_on_store: { $sum: '$total_admin_profit_on_store' },

                                    // store_have_order_payment: {$sum: {'$cond': [{'$eq': ['$is_payment_mode_cash', true], '$eq': ['$is_order_price_paid_by_store', false]}, '$total_order_price', 0]}},
                                    store_have_service_payment: { $sum: { '$cond': [{ '$eq': ['$is_store_pay_delivery_fees', true] }, '$total_delivery_price', 0] } },
                                    store_have_order_payment: { $sum: { $add: [{ $sum: { $cond: [{ $and: [{ $eq: ["$is_payment_mode_cash", true] }, { $eq: ["$is_order_price_paid_by_store", false] }] }, '$total_order_price', 0] } }, { $sum: { $cond: [{ $and: [{ $eq: ["$is_payment_mode_cash", true] }, { $eq: ["$delivery_price_used_type", 2] }] }, "$user_pay_payment", 0] } }] } },

                                    total_deduct_wallet_income: { $sum: { '$cond': [{ "$and": [{ '$eq': ['$is_store_income_set_in_wallet', true] }, { '$lt': ['$pay_to_store', 0] }] }, '$store_income_set_in_wallet', 0] } },
                                    total_added_wallet_income: { $sum: { '$cond': [{ "$and": [{ '$eq': ['$is_store_income_set_in_wallet', true] }, { '$gt': ['$pay_to_store', 0] }] }, '$store_income_set_in_wallet', 0] } },

                                    total_earning: { $sum: '$total_store_income' },
                                    total_wallet_income_set: { $sum: { '$cond': [{ '$eq': ['$is_store_income_set_in_wallet', true] }, '$pay_to_store', 0] } },
                                    total_transferred_amount: { $sum: { '$cond': [{ $and: [{ '$eq': ['$is_store_income_set_in_wallet', false] }, { '$eq': ['$is_transfered_to_store', true] }] }, '$pay_to_store', 0] } },
                                    pay_to_store: { $sum: { '$cond': [{ $and: [{ '$eq': ['$is_store_income_set_in_wallet', false] }, { '$eq': ['$is_transfered_to_store', false] }] }, '$pay_to_store', 0] } },

                                }

                            }
                            var daily_condition = {
                                $group: {
                                    _id: null,
                                    date1: { $sum: { $cond: [{ $eq: ["$completed_date_tag", moment(new Date(moment(start_date_time).add(0, 'days'))).format(DATE_FORMATE.DDMMYYYY)] }, '$total_store_income', 0] } },
                                    date2: { $sum: { $cond: [{ $eq: ["$completed_date_tag", moment(new Date(moment(start_date_time).add(1, 'days'))).format(DATE_FORMATE.DDMMYYYY)] }, '$total_store_income', 0] } },
                                    date3: { $sum: { $cond: [{ $eq: ["$completed_date_tag", moment(new Date(moment(start_date_time).add(2, 'days'))).format(DATE_FORMATE.DDMMYYYY)] }, '$total_store_income', 0] } },
                                    date4: { $sum: { $cond: [{ $eq: ["$completed_date_tag", moment(new Date(moment(start_date_time).add(3, 'days'))).format(DATE_FORMATE.DDMMYYYY)] }, '$total_store_income', 0] } },
                                    date5: { $sum: { $cond: [{ $eq: ["$completed_date_tag", moment(new Date(moment(start_date_time).add(4, 'days'))).format(DATE_FORMATE.DDMMYYYY)] }, '$total_store_income', 0] } },
                                    date6: { $sum: { $cond: [{ $eq: ["$completed_date_tag", moment(new Date(moment(start_date_time).add(5, 'days'))).format(DATE_FORMATE.DDMMYYYY)] }, '$total_store_income', 0] } },
                                    date7: { $sum: { $cond: [{ $eq: ["$completed_date_tag", moment(new Date(moment(start_date_time).add(6, 'days'))).format(DATE_FORMATE.DDMMYYYY)] }, '$total_store_income', 0] } }
                                }
                            }
                            var date = {
                                date1: new Date(moment(start_date_time)),
                                date2: new Date(moment(start_date_time).add(1, 'days')),
                                date3: new Date(moment(start_date_time).add(2, 'days')),
                                date4: new Date(moment(start_date_time).add(3, 'days')),
                                date5: new Date(moment(start_date_time).add(4, 'days')),
                                date6: new Date(moment(start_date_time).add(5, 'days')),
                                date7: new Date(moment(start_date_time).add(6, 'days'))

                            }

                            Order_payment.aggregate([store_condition, filter, daily_condition]).then((order_day_total) => {
                                Order_payment.aggregate([store_condition, filter, total_condition]).then((order_total) => {

                                    var order_total_new = {};
                                    var order_day_total_new = {};
                                    if (order_total.length != 0) {
                                        order_total_new = order_total[0];
                                        order_day_total_new = order_day_total[0];

                                    }

                                    myEarning.get_store_weekly_analytics_data(store, end_date, function (store_analytic_weekly) {
                                        response_data.json({
                                            success: true,
                                            message: STORE_MESSAGE_CODE.GET_WEEKLY_EARNING_SUCCESSFULLY,
                                            currency: currency,
                                            store_analytic_weekly: store_analytic_weekly,
                                            order_total: order_total_new,
                                            order_day_total: order_day_total_new,
                                            date: date
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

                        }, (error) => {
                            console.log(error);
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

exports.get_store_weekly_analytics_data = function (store_detail, end_date, return_data) {


    var week_end_date = moment(end_date);
    var week_end_date_for_tag = week_end_date;
    var date_tag_array = [];
    var tag = "";

    for (var i = 0; i < 7; i++) {
        tag = moment(week_end_date_for_tag).format(DATE_FORMATE.DDMMYYYY);
        date_tag_array.push(tag);
        week_end_date_for_tag = moment(week_end_date_for_tag).subtract(1, 'days');
    }

    var store_id = store_detail._id;
    Store_analytic_daily.find({ store_id: store_id, date_tag: { $in: date_tag_array } }).then((store_analytic_dailies) => {


        var received = 0;
        var accepted = 0;
        var rejected = 0;
        var total_orders = 0;
        var cancelled = 0;
        var order_ready = 0;
        var completed = 0;
        var acception_ratio = 0;
        var rejection_ratio = 0;
        var cancellation_ratio = 0;
        var completed_ratio = 0;
        var order_ready_ratio = 0;
        var total_items = 0;
        var store_analytic_daily_count = 0;

        var store_analytic_weekly = {
            received: received,
            total_orders: total_orders,
            accepted: accepted,
            rejected: rejected,
            order_ready: order_ready,
            cancelled: cancelled,
            completed: completed,
            total_items: total_items,
            acception_ratio: acception_ratio,
            cancellation_ratio: cancellation_ratio,
            rejection_ratio: rejection_ratio,
            completed_ratio: completed_ratio,
            order_ready_ratio: order_ready_ratio
        };

        if (store_analytic_dailies.length > 0) {
            var store_analytic_dailies_size = store_analytic_dailies.length;

            store_analytic_dailies.forEach(function (store_analytic_daily) {

                store_analytic_daily_count++;

                if (store_analytic_daily) {

                    received = received + store_analytic_daily.received;
                    accepted = accepted + store_analytic_daily.accepted;
                    rejected = rejected + store_analytic_daily.rejected;
                    total_orders = total_orders + store_analytic_daily.total_orders;
                    order_ready = order_ready + store_analytic_daily.order_ready;
                    cancelled = cancelled + store_analytic_daily.cancelled;
                    completed = completed + store_analytic_daily.completed;
                    total_items = total_items + store_analytic_daily.total_items;

                }

                if (store_analytic_daily_count == store_analytic_dailies_size) {
                    if (Number(received) > 0) {
                        acception_ratio = utils.precisionRoundTwo(Number((accepted * 100) / received));
                        cancellation_ratio = utils.precisionRoundTwo(Number((cancelled * 100) / received));
                        completed_ratio = utils.precisionRoundTwo(Number((completed * 100) / received));
                        rejection_ratio = utils.precisionRoundTwo(Number((rejected * 100) / received));
                        order_ready_ratio = utils.precisionRoundTwo(Number((order_ready * 100) / received));

                    }

                    store_analytic_weekly.received = received;
                    store_analytic_weekly.total_orders = total_orders;
                    store_analytic_weekly.accepted = accepted;
                    store_analytic_weekly.rejected = rejected;
                    store_analytic_weekly.order_ready = order_ready;
                    store_analytic_weekly.cancelled = cancelled;
                    store_analytic_weekly.completed = completed;
                    store_analytic_weekly.total_items = total_items;
                    store_analytic_weekly.acception_ratio = acception_ratio;
                    store_analytic_weekly.cancellation_ratio = cancellation_ratio;
                    store_analytic_weekly.rejection_ratio = rejection_ratio;
                    store_analytic_weekly.completed_ratio = completed_ratio;
                    store_analytic_weekly.order_ready_ratio = order_ready_ratio

                    if (return_data != null)
                        return_data(store_analytic_weekly);


                }
            });
        } else {
            if (return_data != null)
                return_data(store_analytic_weekly);
            else
                return;
        }
    });

};


waiter_tip_earning = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'store_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { store_id, server_token, start_date, end_date, vaiter_id } = req.body;

            let store = await Store.findById(store_id);
            if (!store) {
                res.json({ success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND });
                return;
            }
            if (!server_token || server_token !== store.server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }

            if (!end_date || end_date == '') {
                end_date = new Date();
            } else {
                end_date = new Date(end_date);
                end_date = end_date.setHours(23, 59, 59, 999);
                end_date = new Date(end_date);
            }

            if (!start_date || start_date == '') {
                start_date = new Date(end_date.getTime() - (6 * 24 * 60 * 60 * 1000));
                start_date = start_date.setHours(0, 0, 0, 0);
                start_date = new Date(start_date);
            } else {
                start_date = new Date(start_date);
                start_date = start_date.setHours(0, 0, 0, 0);
                start_date = new Date(start_date);
            }

            let filter = {
                "$match":
                {
                    "$and":
                        [
                            { "completed_date_in_city_timezone": { $gte: start_date, $lt: end_date } },
                            { "tip_amount": { $ne: 0 } },
                            { "tip_for": { $eq: mongoose.Types.ObjectId(vaiter_id) } }
                        ]
                }
            };


            let user_query = {
                "$lookup":
                {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_detail"
                }
            };

            let array_to_json_user_detail = { $unwind: "$user_detail" };

            var group = {
                $group: {
                    _id: 1,
                    total: { $sum: '$tip_amount' },
                    count: { $sum: 1 }
                }
            }


            let order_payments_total = await Order_payment.aggregate([filter, group])

            if (order_payments_total.length == 0) {
                res.json({ success: false })
                return;
            }
            if (order_payments_total[0].total == 0) {
                res.json({ success: false })
                return;
            }

            let project = {
                $project : {
                    'order_unique_id' : 1,
                    'updated_at' : 1,
                    'user_detail.first_name' : 1,
                    'user_detail.last_name' : 1,
                    'user_detail.unique_id' : 1,
                    'order_currency_code' : 1,
                    'user_pay_payment' : 1,
                    'tip_amount' : 1,
                }
            }

            let order_payments = await Order_payment.aggregate([filter, user_query, array_to_json_user_detail , project]);


            console.log(order_payments_total)
            res.json({
                success: true,
                order_payments: order_payments,
                tip_total: order_payments_total[0].total,
                total_orders: order_payments_total[0].count
            })

        } catch (e) {
            console.log(e, null, 3)
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            })
        }
    })
}
module.exports.waiter_tip_earning = waiter_tip_earning