require('../utils/message_code');
require('../utils/error_code');
require('../utils/constants');
require('../utils/push_code');
var utils = require('../utils/utils');
var emails = require('../controllers/email_sms/emails');
var SMS = require('../controllers/email_sms/sms');
var Setting = require('mongoose').model('setting');
var Email = require('mongoose').model('email_detail');
var Franchise = require('mongoose').model('franchise');
var Store = require('mongoose').model('store');
var Order = require('mongoose').model('order');
var mongoose = require('mongoose');
var Product = require('mongoose').model('product');
var City = require('mongoose').model('city');
var Item = require('mongoose').model('item');
var console = require('../utils/console');


// store_list_search_sort
exports.franchise_list_search_sort = function (request_data, response_data) {
    var request_data_body = request_data.body;
    console.log(request_data_body);
    var city_query = {
        $lookup:
                {
                    from: "cities",
                    localField: "city_id",
                    foreignField: "_id",
                    as: "city_details"
                }
    };
    var array_to_json_city_query = {$unwind: "$city_details"};
    
    var delivery_query = {
        $lookup:
                {
                    from: "deliveries",
                    localField: "store_delivery_id",
                    foreignField: "_id",
                    as: "delivery_details"
                }
    };
    var array_to_json_delivery_query = {$unwind: "$delivery_details"};
    
    var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE_STORE;
    var page = request_data_body.page;
    var sort_field = request_data_body.sort_field;
    var sort_franchises = request_data_body.sort_franchises;
    var search_field = request_data_body.search_field;
    var search_value = request_data_body.search_value;
    search_value = search_value.replace(/^\s+|\s+$/g, '');
    search_value = search_value.replace(/ +(?= )/g, '');
    var store_page_type = request_data_body.store_page_type;


    if (search_field === "name")
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
            query2['city_details.city_name'] = {$regex: new RegExp(search_value, 'i')};
            var search = {"$match": {$or: [query1, query2]}};
        } 
        else {

            query1[search_field] = {$regex: new RegExp(search_value, 'i')};
            query2['city_details.city_name'] = {$regex: new RegExp(search_value, 'i')};
            query3[search_field] = {$regex: new RegExp(full_name[0], 'i')};
            query4['city_details.city_name'] = {$regex: new RegExp(full_name[0], 'i')};
            query5[search_field] = {$regex: new RegExp(full_name[1], 'i')};
            query6['city_details.city_name'] = {$regex: new RegExp(full_name[1], 'i')};
            var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
        }
    } else
    {
        var query = {};
        query[search_field] = {$regex: new RegExp(search_value, 'i')};
        var search = {"$match": query};
    }

    var sort = {"$sort": {}};
    sort["$sort"][sort_field] = parseInt(sort_franchises);
    var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};
    var skip = {};
    skip["$skip"] = (page * number_of_rec) - number_of_rec;
    var limit = {};
    limit["$limit"] = number_of_rec;


    var condition = {$match: {}};
    if (store_page_type == 1) {
        condition = {$match: {'is_approved': {$eq: true}, 'is_business': {$eq: true}}};
    } else if (store_page_type == 2) {
        condition = {$match: {'is_approved': {$eq: false}}};
    } else if (store_page_type == 3) {
        condition = {$match: {'is_business': {$eq: false}, 'is_approved': {$eq: true}}};
    }


    Franchise.aggregate([city_query, array_to_json_city_query,delivery_query,array_to_json_delivery_query
                , search
                , count
    ], function (error, franchises) {

        if (error || franchises.length === 0)
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND, pages: 0});
        } else
        {
            var pages = Math.ceil(franchises[0].total / number_of_rec);

            Franchise.aggregate([condition, city_query, array_to_json_city_query,delivery_query,array_to_json_delivery_query
                        , sort
                        , search, skip, limit
            ], function (error, franchises) {
                if (error || franchises.length == 0) {
                    response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
                    });
                } else
                {

                    response_data.json({success: true,
                        message: STORE_MESSAGE_CODE.STORE_LIST_SUCCESSFULLY, pages: pages,
                        franchises: franchises});
                }
            });
        }
    });
};
exports.store_list_search_sort = function (request_data, response_data) {
    var request_data_body = request_data.body;

    var city_query = {
        $lookup:
                {
                    from: "cities",
                    localField: "city_id",
                    foreignField: "_id",
                    as: "city_details"
                }
    };
    var array_to_json_city_query = {$unwind: "$city_details"};
    
    var delivery_query = {
        $lookup:
                {
                    from: "deliveries",
                    localField: "store_delivery_id",
                    foreignField: "_id",
                    as: "delivery_details"
                }
    };
    var array_to_json_delivery_query = {$unwind: "$delivery_details"};
    
    var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE_STORE;
    var page = request_data_body.page;
    var sort_field = request_data_body.sort_field;
    var sort_store = request_data_body.sort_store;
    var search_field = request_data_body.search_field;
    var search_value = request_data_body.search_value;
    var store_ids = request_data_body.store_ids;
    search_value = search_value.replace(/^\s+|\s+$/g, '');
    search_value = search_value.replace(/ +(?= )/g, '');
    var store_page_type = request_data_body.store_page_type;


    if (search_field === "name")
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
            query2['city_details.city_name'] = {$regex: new RegExp(search_value, 'i')};
            var search = {"$match": {$or: [query1, query2]}};
        } 
        else {

            query1[search_field] = {$regex: new RegExp(search_value, 'i')};
            query2['city_details.city_name'] = {$regex: new RegExp(search_value, 'i')};
            query3[search_field] = {$regex: new RegExp(full_name[0], 'i')};
            query4['city_details.city_name'] = {$regex: new RegExp(full_name[0], 'i')};
            query5[search_field] = {$regex: new RegExp(full_name[1], 'i')};
            query6['city_details.city_name'] = {$regex: new RegExp(full_name[1], 'i')};
            var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
        }
    } else
    {
        var query = {};
        query[search_field] = {$regex: new RegExp(search_value, 'i')};
        var search = {"$match": query};
    }

    var sort = {"$sort": {}};
    sort["$sort"][sort_field] = parseInt(sort_store);
    var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};
    var skip = {};
    skip["$skip"] = (page * number_of_rec) - number_of_rec;
    var limit = {};
    limit["$limit"] = number_of_rec;


    var condition = {$match: {}};
    if (store_page_type == 1) {
        condition = {$match: {'is_approved': {$eq: true}, 'is_business': {$eq: true}}};
    } else if (store_page_type == 2) {
        condition = {$match: {'is_approved': {$eq: false}}};
    } else if (store_page_type == 3) {
        condition = {$match: {'is_business': {$eq: false}, 'is_approved': {$eq: true}}};
    }
    var mongoose = require('mongoose');
    var Schema = mongoose.Types.ObjectId;
    var stores_array = [];
    if(store_ids.length != 0){
            for(var i=0;i<store_ids.length;i++){
                x = new Schema(store_ids[i]);
                stores_array.push(x); 
                if(i+1 == store_ids.length){
                    var condition1 = { $match: { '_id':  { $in: stores_array }  } };
                    console.log(stores_array);
                    Store.aggregate([condition1, city_query, array_to_json_city_query,delivery_query,array_to_json_delivery_query
                                , search
                                , count
                    ], function (error, stores) {

                        if (error || stores.length === 0)
                        {

                            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND, pages: 0});
                        } else
                        {
                            var pages = Math.ceil(stores[0].total / number_of_rec);

                            Store.aggregate([condition1, city_query, array_to_json_city_query,delivery_query,array_to_json_delivery_query
                                        , sort
                                        , search, skip, limit
                            ], function (error, stores) {
                                if (error || stores.length == 0) {
                                    response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
                                    });
                                } else
                                {

                                    response_data.json({success: true,
                                        message: STORE_MESSAGE_CODE.STORE_LIST_SUCCESSFULLY, pages: pages,
                                        stores: stores});
                                }
                            });
                        }
                    });
                }
        }
    }else{
            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
                                    });
    }
};
//approve_decline_store
exports.approve_decline_franchise = function (request_data, response_data) {

    var request_data_body = request_data.body;

    var franchises_id = request_data_body.franchises_id;
    var is_approved = request_data_body.is_approved;

    var store_page_type = request_data_body.store_page_type;
    
    console.log(request_data_body);
    Setting.findOne({}, function (error, setting_detail) {
        var is_mail_notification = setting_detail.is_mail_notification;
        var is_sms_notification = setting_detail.is_sms_notification;
        var is_push_notification = setting_detail.is_push_notification;

        if (store_page_type == 2)
        {
            Franchise.findOneAndUpdate({_id: franchises_id}, {is_approved: true}, {new : true}, function (error, franchises) {

                if (error || !franchises) {

                    response_data.json({success: false, error_code: PROVIDER_ERROR_CODE.UPDATE_FAILED});
                } else {
                    var phone_with_code = franchises.country_phone_code + franchises.phone;
                    var device_type = franchises.device_type;
                    var device_token = franchises.device_token;

                    // email to store approved
                    if (is_mail_notification == true) {
                        Email.findOne({unique_id: EMAIL_UNIQUE_ID.STORE_APPROVED}, function (error, email_detail) {
                            var is_send = email_detail.is_send;
                            if (is_send == true) {
                               // emails.sendStoreApprovedEmail(request_data, franchises, franchises.name);
                            }
                        });
                    }
                    // sms to store approved
                    if (is_sms_notification === true)
                    {
                        //SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.STORE_APPROVED, "");
                    }

                    // push to store approved
                    if (is_push_notification == true) {

                        //utils.sendPushNotification(ADMIN_DATA_ID.STORE, device_type, device_token, STORE_PUSH_CODE.APPROVED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                    }


                    response_data.json({
                        success: true,
                        message: STORE_MESSAGE_CODE.APPROVED_SUCCESSFULLY
                    });
                }
            });
        } else if (store_page_type == 1 || store_page_type == 3)
        {

            Franchise.findOneAndUpdate({_id: franchises_id}, {is_approved: false}, {new : true}, function (error, franchises) {

                if (error || !franchises) {

                    response_data.json({success: false, error_code: PROVIDER_ERROR_CODE.UPDATE_FAILED});
                } else {
                    var phone_with_code = franchises.country_phone_code + franchises.phone;
                    var device_type = franchises.device_type;
                    var device_token = franchises.device_token;

                    // email to store declined
                    if (is_mail_notification == true) {
                        Email.findOne({unique_id: EMAIL_UNIQUE_ID.STORE_DECLINED}, function (error, email_detail) {
                            var is_send = email_detail.is_send;
                            if (is_send == true) {
                                //emails.sendStoreDeclineEmail(request_data, franchises, franchises.name);
                            }
                        });
                    }

                    // sms to store declined
                    if (is_sms_notification === true)
                    {
                        //SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.STORE_DECLINE, "");
                    }

                    // push to store approved
                    if (is_push_notification == true) {
                        //utils.sendPushNotification(ADMIN_DATA_ID.STORE, device_type, device_token, STORE_PUSH_CODE.DECLINED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                    }


                    response_data.json({
                        success: true,
                        message: STORE_MESSAGE_CODE.DECLINED_SUCCESSFULLY
                    });
                }
            });
        }
    });

};
