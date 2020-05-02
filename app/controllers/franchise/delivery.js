require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var utils = require('../../utils/utils');

var Item = require('mongoose').model('item');
var User = require('mongoose').model('user');
var Store = require('mongoose').model('store');
var Franchise = require('mongoose').model('franchise');
var Product = require('mongoose').model('product');

var Country = require('mongoose').model('country');
var Order = require('mongoose').model('order');
var Provider = require('mongoose').model('provider');
var mongoose = require('mongoose');
var Setting = require('mongoose').model('setting');

// provider_location_track
exports.provider_location_track = function (request_data, response_data) {
    var request_data_body = request_data.body;
    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise) {
        if (franchise)
        {
            if (request_data_body.server_token !== null && franchise.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {
                Order.findOne({_id: request_data_body.order_id}, function (error, order_detail) {

                    Provider.findOne({_id: order_detail.current_provider}, function (error, provider_detail) {

                        response_data.json({
                            success: true,
                            message: ORDER_MESSAGE_CODE.ORDER_CANCEL_OR_REJECT_BY_PROVIDER_SUCCESSFULLY,
                            provider: provider_detail

                        });
                    })
                });
            }
        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });
};

//store_notify_new_order
exports.franchise_notify_new_order = function (request_data, response_data) {
    var request_data_body = request_data.body;
    var franchise_id = request_data_body.franchise_id;
    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {
        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {
                    stores_array = [];
                    if(franchise_detail.store_ids.length == 0){
                        response_data.json({
                            success: false
                        });
                    }
                    for(var i=0;i<franchise_detail.store_ids.length;i++){
                        x = new mongoose.Types.ObjectId(franchise_detail.store_ids[i]);
                        stores_array.push(x); 
                        if(i+1 == franchise_detail.store_ids.length){

                            Setting.findOne({}, {"password": 0, "email": 0}, function (error, setting_detail) {
                                var user_query = {
                                    $lookup:
                                            {
                                                from: "users",
                                                localField: "user_id",
                                                foreignField: "_id",
                                                as: "user_detail"
                                            }
                                };
                                var array_to_json1 = {$unwind: "$user_detail"};
                                 var store_query = {
                                    $lookup:
                                            {
                                                from: "stores",
                                                localField: "store_id",
                                                foreignField: "_id",
                                                as: "store_detail"
                                            }
                                };

                                var array_to_json_store_query = {$unwind: "$store_detail"};
                                var condition = {"$match": {'store_id': {$in: stores_array}}};
                                var condition1 = {"$match": {'order_status': {$eq: ORDER_STATE.WAITING_FOR_ACCEPT_STORE}}};
                                var condition2 = {"$match": {'store_notify': {$eq: 0}}};
                                Order.aggregate([condition, condition1, condition2, user_query,store_query,array_to_json_store_query, array_to_json1], function (error, orders) {
                                    if (error || orders.length == 0) {
                                        response_data.json({
                                            success: false,
                                            /*store_detail: store_detail,
                                            error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                                            setting_detail: setting_detail*/
                                        });
                                    } else {
                                       /* Order.update({
                                            store_notify: 0,
                                            store_id: request_data_body.store_id,
                                            _id: orders[0]._id
                                        }, {store_notify: 1}, {multi: true}, function (error, response) {*/
                                            response_data.json({
                                                success: true,
                                               // store_detail: store_detail,
                                                message: ORDER_MESSAGE_CODE.ORDER_LIST_FOR_DELIVERY_SUCCESSFULLY,
                                                order: orders[0],
                                                setting_detail: setting_detail
                                            });
                                       // });

                                    }
                                });
                            });
                        }
                    }
            }
        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });
};


// store get order_list for delivery
exports.order_list_for_delivery = function (request_data, response_data) {
    var request_data_body = request_data.body;
    var franchise_id = request_data_body.franchise_id;

    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {
        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {
                stores_array = [];
                    if(franchise_detail.store_ids.length == 0){
                        response_data.json({
                            success: false
                        });
                    }
                    for(var i=0;i<franchise_detail.store_ids.length;i++){
                        x = new mongoose.Types.ObjectId(franchise_detail.store_ids[i]);
                        stores_array.push(x); 
                        if(i+1 == franchise_detail.store_ids.length){
                            var user_query = {
                                $lookup:
                                        {
                                            from: "users",
                                            localField: "user_id",
                                            foreignField: "_id",
                                            as: "user_detail"
                                        }
                            };
                            var array_to_json1 = {$unwind: "$user_detail"};

                            var order_payment_query = {
                                $lookup:
                                        {
                                            from: "order_payments",
                                            localField: "order_payment_id",
                                            foreignField: "_id",
                                            as: "order_payment_detail"
                                        }
                            };
                            var array_to_json2 = {$unwind: "$order_payment_detail"};

                            var provider_query = {
                                $lookup:
                                        {
                                            from: "providers",
                                            localField: "current_provider",
                                            foreignField: "_id",
                                            as: "provider_detail"
                                        }
                            };

                             var store_query = {
                                    $lookup:
                                            {
                                                from: "stores",
                                                localField: "store_id",
                                                foreignField: "_id",
                                                as: "store_detail"
                                            }
                                };

                                var array_to_json_store_query = {$unwind: "$store_detail"};

                            var sort = {"$sort": {}};
                            sort["$sort"]['unique_id'] = parseInt(-1);
                            var condition = {"$match": {'store_id': {$in: stores_array}}};

                            var condition1 = {"$match": {'order_status': {$gt: ORDER_STATE.ORDER_READY}}};
                            var condition2 = {"$match": {'order_status_id': {$eq: ORDER_STATUS_ID.RUNNING}}};
                            Order.aggregate([condition, condition1, condition2, user_query, provider_query, order_payment_query,store_query,array_to_json_store_query, array_to_json1, array_to_json2, sort], function (error, orders) {

                                if (error || orders.length == 0) {
                                    response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
                                } else
                                {

                                    response_data.json({success: true,
                                        message: ORDER_MESSAGE_CODE.ORDER_LIST_FOR_DELIVERY_SUCCESSFULLY,
                                        orders: orders});
                                }
                            });
                        }
                    }
            }
        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });
};

exports.delivery_list_search_sort = function (request_data, response_data) {
    var request_data_body = request_data.body;
    var franchise_id = request_data_body.franchise_id;
    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {
        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {
                stores_array = [];
                    if(franchise_detail.store_ids.length == 0){
                        response_data.json({
                            success: false
                        });
                    }
                    for(var i=0;i<franchise_detail.store_ids.length;i++){
                        x = new mongoose.Types.ObjectId(franchise_detail.store_ids[i]);
                        stores_array.push(x); 
                        if(i+1 == franchise_detail.store_ids.length){
                            var user_query = {
                                $lookup:
                                        {
                                            from: "users",
                                            localField: "user_id",
                                            foreignField: "_id",
                                            as: "user_detail"
                                        }
                            };
                            var array_to_json1 = {$unwind: "$user_detail"};
                            var provider_query = {
                                $lookup:
                                        {
                                            from: "providers",
                                            localField: "current_provider",
                                            foreignField: "_id",
                                            as: "provider_detail"
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
                            var array_to_json_order_payment_query = {$unwind: "$order_payment_detail"};

                            var payment_gateway_query = {
                                $lookup:
                                        {
                                            from: "payment_gateways",
                                            localField: "order_payment_detail.payment_id",
                                            foreignField: "_id",
                                            as: "payment_gateway_detail"
                                        }
                            };
                             var store_query = {
                                    $lookup:
                                            {
                                                from: "stores",
                                                localField: "store_id",
                                                foreignField: "_id",
                                                as: "store_detail"
                                            }
                                };

                                var array_to_json_store_query = {$unwind: "$store_detail"};
                            var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
                            var page = request_data_body.page;

                            var sort_field = request_data_body.sort_field;
                            var sort_order = request_data_body.sort_order;
                            var search_field = request_data_body.search_field;
                            var search_value = request_data_body.search_value;
                            search_value = search_value.replace(/^\s+|\s+$/g, '');
                            search_value = search_value.replace(/ +(?= )/g, '');
                            if (search_field === "user_detail.first_name")
                            {
                                var query1 = {};
                                var query2 = {};
                                var query3 = {};
                                var query4 = {};
                                var query5 = {};
                                var query6 = {};
                                var full_name = search_value.split(' ');
                                if (typeof full_name[0] === 'undefined' || typeof full_name[1] === 'undefined') {

                                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                                    query2['user_detail.last_name'] = {$regex: new RegExp(search_value, 'i')};
                                    var search = {"$match": {$or: [query1, query2]}};
                                } else {

                                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                                    query2['user_detail.last_name'] = {$regex: new RegExp(search_value, 'i')};
                                    query3[search_field] = {$regex: new RegExp(full_name[0], 'i')};
                                    query4['user_detail.last_name'] = {$regex: new RegExp(full_name[0], 'i')};
                                    query5[search_field] = {$regex: new RegExp(full_name[1], 'i')};
                                    query6['user_detail.last_name'] = {$regex: new RegExp(full_name[1], 'i')};
                                    var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
                                }
                            } else if (search_field === "provider_detail.first_name")
                            {
                                var query1 = {};
                                var query2 = {};
                                var query3 = {};
                                var query4 = {};
                                var query5 = {};
                                var query6 = {};
                                var full_name = search_value.split(' ');
                                if (typeof full_name[0] === 'undefined' || typeof full_name[1] === 'undefined') {

                                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                                    query2['provider_detail.last_name'] = {$regex: new RegExp(search_value, 'i')};
                                    var search = {"$match": {$or: [query1, query2]}};
                                } else {

                                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                                    query2['provider_detail.last_name'] = {$regex: new RegExp(search_value, 'i')};
                                    query3[search_field] = {$regex: new RegExp(full_name[0], 'i')};
                                    query4['provider_detail.last_name'] = {$regex: new RegExp(full_name[0], 'i')};
                                    query5[search_field] = {$regex: new RegExp(full_name[1], 'i')};
                                    query6['provider_detail.last_name'] = {$regex: new RegExp(full_name[1], 'i')};
                                    var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
                                }
                            } else
                            {
                                var query = {};
                                query[search_field] = {$regex: new RegExp(search_value, 'i')};
                                var search = {"$match": query};
                            }

                            var sort = {"$sort": {}};
                            sort["$sort"][sort_field] = parseInt(sort_order);
                            var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};
                            var skip = {};
                            skip["$skip"] = (page * number_of_rec) - number_of_rec;
                            var limit = {};
                            limit["$limit"] = number_of_rec;

                            var condition = {"$match": {'store_id': {$in: stores_array}}};
                            var condition1 = {"$match": {'order_status': {$gte: ORDER_STATE.ORDER_READY}}};
                            //{$match: {$and: [{order_status: {$gte: ORDER_STATE.ORDER_READY}}, {order_status: {$ne: ORDER_STATE.STORE_REJECTED}},{order_status: {$ne: ORDER_STATE.STORE_CANCELLED}}]}};
                            var condition2 = {"$match": {'order_status_id': {$eq: ORDER_STATUS_ID.RUNNING}}};

                            Order.aggregate([condition, condition1, condition2, user_query, provider_query, order_payment_query, array_to_json1, array_to_json_order_payment_query,store_query,array_to_json_store_query, payment_gateway_query, search, count], function (err, orders) {
                                if (!orders || orders.length === 0)
                                {
                                    response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND, pages: 0});
                                } else
                                {
                                    var pages = Math.ceil(orders[0].total / number_of_rec);
                                    Order.aggregate([condition, condition1, condition2, user_query, provider_query, order_payment_query, array_to_json1, array_to_json_order_payment_query,store_query,array_to_json_store_query, payment_gateway_query, sort, search, skip, limit], function (error, orders) {
                                        if (error) {
                                            response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
                                        } else
                                        {
                                            response_data.json({success: true,
                                                message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY, pages: pages,
                                                orders: orders});
                                        }
                                    });
                                }
                            });
                        }
                    }
            }
        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });
};



exports.history = function (request_data, response_data) {
    var request_data_body = request_data.body;

    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {
        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {
                stores_array = [];
                    if(franchise_detail.store_ids.length == 0){
                        response_data.json({
                            success: false
                        });
                    }
                    for(var i=0;i<franchise_detail.store_ids.length;i++){
                        x = new mongoose.Types.ObjectId(franchise_detail.store_ids[i]);
                        stores_array.push(x); 
                        if(i+1 == franchise_detail.store_ids.length){
                            if (request_data_body.start_date == '' || request_data_body.end_date == '') {
                                if (request_data_body.start_date == '' && request_data_body.end_date == '') {
                                    var date = new Date(Date.now());
                                    date = date.setHours(0, 0, 0, 0);
                                    start_date = new Date(0);
                                    end_date = new Date(Date.now());
                                } else if (request_data_body.start_date == '') {
                                    start_date = new Date(0);
                                    var end_date = request_data_body.end_date.formatted;
                                    end_date = new Date(end_date);
                                    end_date = end_date.setHours(23, 59, 59, 999);
                                    end_date = new Date(end_date);
                                } else {
                                    var start_date = request_data_body.start_date.formatted;
                                    start_date = new Date(start_date);
                                    start_date = start_date.setHours(0, 0, 0, 0);
                                    start_date = new Date(start_date);
                                    end_date = new Date(Date.now());
                                }
                            } else {

                                var start_date = request_data_body.start_date.formatted;
                                var end_date = request_data_body.end_date.formatted;

                                start_date = new Date(start_date);
                                start_date = start_date.setHours(0, 0, 0, 0);
                                start_date = new Date(start_date);
                                end_date = new Date(end_date);
                                end_date = end_date.setHours(23, 59, 59, 999);
                                end_date = new Date(end_date);
                            }

                            var user_query = {
                                $lookup:
                                        {
                                            from: "users",
                                            localField: "user_id",
                                            foreignField: "_id",
                                            as: "user_detail"
                                        }
                            };
                            var array_to_json_user_detail = {$unwind: "$user_detail"};
                            var provider_query = {
                                $lookup:
                                        {
                                            from: "providers",
                                            localField: "provider_id",
                                            foreignField: "_id",
                                            as: "provider_detail"
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

                            var array_to_json_order_payment_query = {$unwind: "$order_payment_detail"};


                            var payment_gateway_query = {
                                $lookup:
                                        {
                                            from: "payment_gateways",
                                            localField: "order_payment_detail.payment_id",
                                            foreignField: "_id",
                                            as: "payment_gateway_detail"
                                        }
                            };

                            var review_query = {
                                $lookup:
                                        {
                                            from: "reviews",
                                            localField: "_id",
                                            foreignField: "order_id",
                                            as: "review_detail"
                                        }
                            };
                             var store_query = {
                                    $lookup:
                                            {
                                                from: "stores",
                                                localField: "store_id",
                                                foreignField: "_id",
                                                as: "store_detail"
                                            }
                                };

                                var array_to_json_store_query = {$unwind: "$store_detail"};
                            var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
                            var page = request_data_body.page;

                            var sort_field = request_data_body.sort_field;
                            var sort_order = request_data_body.sort_order;
                            var search_field = request_data_body.search_field;
                            var search_value = request_data_body.search_value;
                            search_value = search_value.replace(/^\s+|\s+$/g, '');
                            search_value = search_value.replace(/ +(?= )/g, '');

                            if (search_field === "user_detail.first_name")
                            {
                                var query1 = {};
                                var query2 = {};
                                var query3 = {};
                                var query4 = {};
                                var query5 = {};
                                var query6 = {};
                                var full_name = search_value.split(' ');
                                if (typeof full_name[0] === 'undefined' || typeof full_name[1] === 'undefined') {

                                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                                    query2['user_detail.last_name'] = {$regex: new RegExp(search_value, 'i')};
                                    var search = {"$match": {$or: [query1, query2]}};
                                } else {

                                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                                    query2['user_detail.last_name'] = {$regex: new RegExp(search_value, 'i')};
                                    query3[search_field] = {$regex: new RegExp(full_name[0], 'i')};
                                    query4['user_detail.last_name'] = {$regex: new RegExp(full_name[0], 'i')};
                                    query5[search_field] = {$regex: new RegExp(full_name[1], 'i')};
                                    query6['user_detail.last_name'] = {$regex: new RegExp(full_name[1], 'i')};
                                    var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
                                }
                            } else if (search_field === "provider_detail.first_name")
                            {
                                var query1 = {};
                                var query2 = {};
                                var query3 = {};
                                var query4 = {};
                                var query5 = {};
                                var query6 = {};
                                var full_name = search_value.split(' ');
                                if (typeof full_name[0] === 'undefined' || typeof full_name[1] === 'undefined') {

                                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                                    query2['provider_detail.last_name'] = {$regex: new RegExp(search_value, 'i')};
                                    var search = {"$match": {$or: [query1, query2]}};
                                } else {

                                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                                    query2['provider_detail.last_name'] = {$regex: new RegExp(search_value, 'i')};
                                    query3[search_field] = {$regex: new RegExp(full_name[0], 'i')};
                                    query4['provider_detail.last_name'] = {$regex: new RegExp(full_name[0], 'i')};
                                    query5[search_field] = {$regex: new RegExp(full_name[1], 'i')};
                                    query6['provider_detail.last_name'] = {$regex: new RegExp(full_name[1], 'i')};
                                    var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
                                }
                            } else
                            {
                                var query = {};
                                query[search_field] = {$regex: new RegExp(search_value, 'i')};
                                var search = {"$match": query};
                            }
                            var filter = {"$match": {"completed_at": {$gte: start_date, $lt: end_date}}};
                            var sort = {"$sort": {}};
                            sort["$sort"][sort_field] = parseInt(sort_order);
                            var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};
                            var skip = {};
                            skip["$skip"] = (page * number_of_rec) - number_of_rec;
                            var limit = {};
                            limit["$limit"] = number_of_rec;
                            var condition = {"$match": {'store_id': {$in: stores_array}}};
                            var condition1 = {"$match": {'order_status_id': {$ne: ORDER_STATUS_ID.RUNNING}}};

                            Order.aggregate([condition, condition1, user_query, order_payment_query, provider_query, review_query, array_to_json_user_detail, array_to_json_order_payment_query,store_query,array_to_json_store_query, payment_gateway_query, search, filter, count], function (err, orders) {
                                if (!orders || orders.length === 0)
                                {
                                    response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND, pages: 0});
                                } else
                                {
                                    var pages = Math.ceil(orders[0].total / number_of_rec);
                                    Order.aggregate([condition, condition1, user_query, order_payment_query, provider_query, review_query, array_to_json_user_detail, array_to_json_order_payment_query,store_query,array_to_json_store_query, payment_gateway_query, sort, search, filter, skip, limit], function (error, orders) {
                                        if (error) {
                                            response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
                                        } else
                                        {
                                            response_data.json({success: true,
                                                message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY, pages: pages,
                                                orders: orders});
                                        }
                                    });
                                }
                            });
                        }
                    }
            }
        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });
};





// order_list_search_sort
exports.order_list_search_sort = function (request_data, response_data) {
    var request_data_body = request_data.body;
    var franchise_id = request_data_body.franchise_id;
    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {
        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {
                    stores_array = [];
                    if(franchise_detail.store_ids.length == 0){
                        response_data.json({
                            success: false
                        });
                    }
                    for(var i=0;i<franchise_detail.store_ids.length;i++){
                        x = new mongoose.Types.ObjectId(franchise_detail.store_ids[i]);
                        stores_array.push(x); 
                        if(i+1 == franchise_detail.store_ids.length){
                            Setting.findOne({}, function (error, setting_detail) {
                                var is_confirmation_code_required_at_complete_delivery = setting_detail.is_confirmation_code_required_at_complete_delivery;
                                var is_confirmation_code_required_at_pickup_delivery = setting_detail.is_confirmation_code_required_at_pickup_delivery;


                                var user_query = {
                                    $lookup:
                                            {
                                                from: "users",
                                                localField: "user_id",
                                                foreignField: "_id",
                                                as: "user_detail"
                                            }
                                };
                                var array_to_json1 = {$unwind: "$user_detail"};
                                var order_payment_query = {
                                    $lookup:
                                            {
                                                from: "order_payments",
                                                localField: "order_payment_id",
                                                foreignField: "_id",
                                                as: "order_payment_detail"
                                            }
                                };

                                var array_to_json_order_payment_query = {$unwind: "$order_payment_detail"};

                                var store_query = {
                                    $lookup:
                                            {
                                                from: "stores",
                                                localField: "store_id",
                                                foreignField: "_id",
                                                as: "store_detail"
                                            }
                                };

                                var array_to_json_store_query = {$unwind: "$store_detail"};

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
                                if (search_field === "user_detail.first_name")
                                {
                                    var query1 = {};
                                    var query2 = {};
                                    var query3 = {};
                                    var query4 = {};
                                    var query5 = {};
                                    var query6 = {};
                                    var full_name = search_value.split(' ');
                                    if (typeof full_name[0] === 'undefined' || typeof full_name[1] === 'undefined') {

                                        query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                                        query2['user_detail.last_name'] = {$regex: new RegExp(search_value, 'i')};
                                        var search = {"$match": {$or: [query1, query2]}};
                                    } else {

                                        query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                                        query2['user_detail.last_name'] = {$regex: new RegExp(search_value, 'i')};
                                        query3[search_field] = {$regex: new RegExp(full_name[0], 'i')};
                                        query4['user_detail.last_name'] = {$regex: new RegExp(full_name[0], 'i')};
                                        query5[search_field] = {$regex: new RegExp(full_name[1], 'i')};
                                        query6['user_detail.last_name'] = {$regex: new RegExp(full_name[1], 'i')};
                                        var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
                                    }
                                } else
                                {
                                    var query = {};
                                    query[search_field] = {$regex: new RegExp(search_value, 'i')};
                                    var search = {"$match": query};
                                }

                                var sort = {"$sort": {}};
                                sort["$sort"][sort_field] = parseInt(sort_order);
                                var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};
                                var skip = {};
                                skip["$skip"] = (page * number_of_rec) - number_of_rec;
                                var limit = {};
                                limit["$limit"] = number_of_rec;
                                var condition = {"$match": {'store_id': {$in: stores_array}}};
                                var condition1 = {"$match": {'order_status': {$lte: ORDER_STATE.WAITING_FOR_DELIVERY_MAN}}};
                                Order.aggregate([condition, condition1, user_query, array_to_json1, order_payment_query, array_to_json_order_payment_query,store_query,array_to_json_store_query, payment_gateway_query, search, count], function (err, orders) {
                                    if (!orders || orders.length === 0)
                                    {
                                        response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND, pages: 0});
                                    } else
                                    {
                                        var pages = Math.ceil(orders[0].total / number_of_rec);
                                        Order.aggregate([condition, condition1, user_query, array_to_json1, order_payment_query, array_to_json_order_payment_query,store_query,array_to_json_store_query, payment_gateway_query, sort, search, skip, limit], function (error, orders) {
                                            if (error) {
                                                response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
                                            } else
                                            {

                                                response_data.json({success: true,
                                                    message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY, pages: pages,
                                                    is_confirmation_code_required_at_complete_delivery:is_confirmation_code_required_at_complete_delivery,
                                                    is_confirmation_code_required_at_pickup_delivery:is_confirmation_code_required_at_pickup_delivery,
                                                    orders: orders});
                                            }
                                        });
                                    }
                                });

                            })
                        }
                    }

            }
        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });
};




// admin get_order_data
exports.get_order_data = function (request_data, response_data) {
    var request_data_body = request_data.body;
    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {
        if (franchise_detail) {
            if (request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {

                stores_array = [];
                    if(franchise_detail.store_ids.length == 0){
                        response_data.json({
                            success: false
                        });
                    }
                    for(var i=0;i<franchise_detail.store_ids.length;i++){
                        x = new mongoose.Types.ObjectId(franchise_detail.store_ids[i]);
                        stores_array.push(x); 
                        if(i+1 == franchise_detail.store_ids.length){
                            var store_condition = {"$match": {'store_id': {$in: stores_array}}};
                            var order_condition = {"$match": {'_id': {$eq: mongoose.Types.ObjectId(request_data_body.order_id)}}};


                            var user_query = {
                                $lookup:
                                        {
                                            from: "users",
                                            localField: "user_id",
                                            foreignField: "_id",
                                            as: "user_detail"
                                        }
                            };
                            var array_to_json_user_detail = {$unwind: "$user_detail"};
                            var store_query = {
                                $lookup:
                                        {
                                            from: "stores",
                                            localField: "store_id",
                                            foreignField: "_id",
                                            as: "store_detail"
                                        }
                            };
                            var array_to_json_store_detail = {$unwind: "$store_detail"};
                            var order_payment_query = {
                                $lookup:
                                        {
                                            from: "order_payments",
                                            localField: "order_payment_id",
                                            foreignField: "_id",
                                            as: "order_payment_detail"
                                        }
                            };
                            var array_to_json_order_payment_query = {$unwind: "$order_payment_detail"};
                            var provider_query = {
                                $lookup:
                                        {
                                            from: "providers",
                                            localField: "current_provider",
                                            foreignField: "_id",
                                            as: "provider_detail"
                                        }
                            };

                            Order.aggregate([order_condition, store_condition, user_query, order_payment_query, store_query, provider_query, array_to_json_user_detail, array_to_json_store_detail, array_to_json_order_payment_query

                            ], function (error, order) {

                                if (error || order.length === 0)
                                {
                                    response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
                                } else
                                {

                                    response_data.json({success: true,
                                        message: ORDER_MESSAGE_CODE.GET_ORDER_DATA_SUCCESSFULLY,
                                        order: order[0]
                                    });
                                }
                            });
                        }
                    }

            }
        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });

};