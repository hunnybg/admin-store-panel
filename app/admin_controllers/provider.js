require('../utils/message_code');
require('../utils/error_code');
require('../utils/constants');
require('../utils/push_code');
var utils = require('../utils/utils');
var emails = require('../controllers/email_sms/emails');
var SMS = require('../controllers/email_sms/sms');
var Provider = require('mongoose').model('provider');
var mongoose = require('mongoose');
var Bank_detail = require('mongoose').model('bank_detail');
var Request = require('mongoose').model('request');
var Review = require('mongoose').model('review');
var Store = require('mongoose').model('store');
var console = require('../utils/console');
var Provider_File_Obj = require('../controllers/provider/provider');

// for view all provider_list
exports.provider_list = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var city_array = {
                $lookup:
                        {
                            from: "cities",
                            localField: "city_id",
                            foreignField: "_id",
                            as: "city_details"
                        }
            };

            var array_to_json = {$unwind: "$city_details"};



            var type_array = {
                $lookup:
                        {
                            from: "services",
                            localField: "service_id",
                            foreignField: "_id",
                            as: "type_details"
                        }
            };

            var array_to_json1 = {$unwind: "$type_details"};

            var country_query = {
                $lookup:
                    {
                        from: "countries",
                        localField: "country_id",
                        foreignField: "_id",
                        as: "country_details"
                    }
            };
            var array_to_json2 = {$unwind: "$country_details"};

            Provider.aggregate([city_array, array_to_json, type_array, country_query, array_to_json2, array_to_json1]).then((providers) => {
                if (providers.length == 0) {
                    response_data.json({success: false, error_code: PROVIDER_ERROR_CODE.PROVIDER_DATA_NOT_FOUND
                    });
                } else {
                    response_data.json({success: true,
                        message: PROVIDER_MESSAGE_CODE.PROVIDER_LIST_SUCCESSFULLY,
                        providers: providers

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
            response_data.json(response);
        }
    });
};

// provider_list_search_sort
exports.provider_list_search_sort = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

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
            var number_of_rec = Number(request_data_body.number_of_rec);
            var page = request_data_body.page;
            var sort_field = request_data_body.sort_field;
            var sort_provider = request_data_body.sort_provider;
            var search_field = request_data_body.search_field;
            var search_value = request_data_body.search_value;
            search_value = search_value.replace(/^\s+|\s+$/g, '');
            search_value = search_value.replace(/ +(?= )/g, '');
            var provider_page_type = request_data_body.provider_page_type;

            if (search_field === "first_name")
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
                    query2['last_name'] = {$regex: new RegExp(search_value, 'i')};
                    var search = {"$match": {$or: [query1, query2]}};
                } else {

                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                    query2['last_name'] = {$regex: new RegExp(search_value, 'i')};
                    query3[search_field] = {$regex: new RegExp(full_name[0], 'i')};
                    query4['last_name'] = {$regex: new RegExp(full_name[0], 'i')};
                    query5[search_field] = {$regex: new RegExp(full_name[1], 'i')};
                    query6['last_name'] = {$regex: new RegExp(full_name[1], 'i')};
                    var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
                }
             } else if(search_field == 'unique_id'){
                var query = {};
                query[search_field] = {$eq: Number(search_value)};
                var search = {"$match": query};
            } else
            {
                var query = {};
                query[search_field] = {$regex: new RegExp(search_value, 'i')};
                var search = {"$match": query};
            }

            var sort = {"$sort": {}};
            sort["$sort"][sort_field] = parseInt(sort_provider);
            var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};
            var skip = {};
            skip["$skip"] = (page * number_of_rec) - number_of_rec;
            var limit = {};
            limit["$limit"] = number_of_rec;

            var condition = {$match: {}};
            if (provider_page_type == 1) {
                condition = {$match: {'is_online': {$eq: true}, 'is_approved': {$eq: true}}};

            } else if (provider_page_type == 2) {
                condition = {$match: {'is_approved': {$eq: true}}};

            } else if (provider_page_type == 3) {

                condition = {$match: {'is_approved': {$eq: false}}};

            }
            var country_query = {
                $lookup:
                    {
                        from: "countries",
                        localField: "country_id",
                        foreignField: "_id",
                        as: "country_details"
                    }
            };
            var array_to_json2 = {$unwind: "$country_details"};

            var type_id_condition = {$match: {}}
            console.log(request_data_body)
            if(request_data_body.store_id){
                type_id_condition = {$match: {provider_type_id: {$eq: mongoose.Types.ObjectId(request_data_body.store_id)}}}
            }
            console.log(skip)

            Provider.aggregate([condition, type_id_condition, city_query, array_to_json_city_query, country_query, array_to_json2, search, count]).then((providers) => {
                if (providers.length === 0)
                {
                    response_data.json({success: false, error_code: PROVIDER_ERROR_CODE.PROVIDER_DATA_NOT_FOUND, pages: 0});
                } else
                {
                    var pages = Math.ceil(providers[0].total / number_of_rec);

                    if (page)
                    {
                        Provider.aggregate([condition, type_id_condition, city_query, array_to_json_city_query, country_query, array_to_json2, sort, search, skip, limit]).then((providers) => {
                            if (providers.length === 0) {
                                response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
                            } else
                            {
                                response_data.json({success: true,
                                    message: PROVIDER_MESSAGE_CODE.PROVIDER_LIST_SUCCESSFULLY, pages: pages,
                                    providers: providers});
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
                        Provider.aggregate([condition, type_id_condition, city_query, array_to_json_city_query, country_query, array_to_json2, sort, search]).then((providers) => {
                            if (providers.length === 0) {
                                response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND});
                            } else
                            {
                                response_data.json({success: true,
                                    message: PROVIDER_MESSAGE_CODE.PROVIDER_LIST_SUCCESSFULLY, pages: pages,
                                    providers: providers});
                            }
                        }, (error) => {
                            console.log(error);
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
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


//get_provider_detail
exports.get_provider_detail = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'provider_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var country_query = {
                $lookup:
                        {
                            from: "countries",
                            localField: "country_id",
                            foreignField: "_id",
                            as: "country_details"
                        }
            };

            var array_to_json = {$unwind: "$country_details"};

            var city_query = {
                $lookup:
                        {
                            from: "cities",
                            localField: "city_id",
                            foreignField: "_id",
                            as: "city_details"
                        }
            };

            var array_to_json1 = {$unwind: "$city_details"};

            var referred_query = {
                $lookup:
                        {
                            from: "providers",
                            localField: "referred_by",
                            foreignField: "_id",
                            as: "referred_provider_details"
                        }
            };

            var vehicle_query = {
                $lookup:
                        {
                            from: "vehicles",
                            localField: "vehicle_id",
                            foreignField: "_id",
                            as: "vehicles_details"
                        }
            };

            var condition = {"$match": {'_id': {$eq: mongoose.Types.ObjectId(request_data_body.provider_id)}}};
            Provider.aggregate([condition, country_query, city_query, referred_query, array_to_json, array_to_json1, vehicle_query]).then((provider) => {

                if (provider.length != 0) {

                    var provider_condition = {"$match": {'current_provider': {$eq: mongoose.Types.ObjectId(request_data_body.provider_id)}}};
                    var group = {
                        $group: {
                            _id: null,
                            total_orders: {$sum: 1},
                            accepted_orders: {$sum: {$cond: [{$and: [{$gte: ["$delivery_status", ORDER_STATE.DELIVERY_MAN_ACCEPTED]}, {$gte: ["$delivery_status", ORDER_STATE.DELIVERY_MAN_ACCEPTED]}]}, 1, 0]}},
                            completed_orders: {$sum: {$cond: [{$eq: ["$delivery_status_manage_id", ORDER_STATUS_ID.COMPLETED]}, 1, 0]}},
                            cancelled_orders: {$sum: {$cond: [{$eq: ["$delivery_status_manage_id", ORDER_STATUS_ID.CANCELLED]}, 1, 0]}}
                        }
                    }
                    Request.aggregate([provider_condition, group]).then((order_detail) => {

                        if (order_detail.length == 0) {
                            response_data.json({success: true,
                                message: PROVIDER_MESSAGE_CODE.PROVIDER_DETAIL_SUCCESSFULLY,
                                provider: provider[0],
                                order_detail: {
                                    total_orders: 0,
                                    accepted_orders: 0,
                                    completed_orders: 0,
                                    cancelled_orders: 0,
                                    completed_order_percentage: 0
                                }
                            });
                        } else {
                            var completed_order_percentage = order_detail[0].completed_orders * 100 / order_detail[0].total_orders;
                            order_detail[0].completed_order_percentage = completed_order_percentage;
                            response_data.json({success: true,
                                message: PROVIDER_MESSAGE_CODE.PROVIDER_DETAIL_SUCCESSFULLY,
                                provider: provider[0],
                                order_detail: order_detail[0]
                            });
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

/// update_provider
exports.update_provider = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'provider_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var provider_id = request_data_body.provider_id;
            var is_approved = request_data_body.is_approved;

            Provider.find({_id: {'$ne': provider_id}, phone: request_data_body.phone}).then((provider_detail) => {

                if (provider_detail.length > 0)
                {
                    response_data.json({success: false, error_code: USER_ERROR_CODE.PHONE_NUMBER_ALREADY_REGISTRED});
                } else
                {
                    if (request_data_body.vehicle_id == 'null') {
                        delete request_data_body.vehicle_id;
                    }

                    Provider.findOneAndUpdate({_id: provider_id}, request_data_body, {new : true}).then((provider_data) => {
                        if (provider_data)
                        {
                            var device_type = provider_data.device_type;
                            var device_token = provider_data.device_token;

                            var image_file = request_data.files;
                            if (image_file != undefined && image_file.length > 0) {
                                utils.deleteImageFromFolder(provider_data.image_url, FOLDER_NAME.PROVIDER_PROFILES);
                                var image_name = provider_data._id + utils.generateServerToken(4);
                                var url = utils.getStoreImageFolderPath(FOLDER_NAME.PROVIDER_PROFILES) + image_name + FILE_EXTENSION.PROVIDER;
                                utils.storeImageToFolder(image_file[0].path, image_name + FILE_EXTENSION.PROVIDER, FOLDER_NAME.PROVIDER_PROFILES);
                                provider_data.image_url = url;
                                provider_data.save();
                            }
                            var first_name = (request_data_body.first_name).trim();
                            first_name = first_name.charAt(0).toUpperCase() + first_name.slice(1);
                            var last_name = (request_data_body.last_name).trim();
                            last_name = last_name.charAt(0).toUpperCase() + last_name.slice(1);
                            provider_data.first_name = first_name;
                            provider_data.last_name = last_name;
                            provider_data.save();

                            response_data.json({
                                success: true,
                                message: PROVIDER_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
                                provider: provider_data

                            });
                        } else
                        {

                            response_data.json({success: false, error_code: PROVIDER_ERROR_CODE.UPDATE_FAILED});
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
        } else {
            response_data.json(response);
        }
    });
};



exports.provider_approve_decline = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'provider_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var provider_id = request_data_body.provider_id;
            var provider_page_type = request_data_body.provider_page_type;
            Provider.findOne({_id: provider_id}).then((provider) => {
                if (provider) {

                    var phone_with_code = provider.country_phone_code + provider.phone;
                    var device_type = provider.device_type;
                    var device_token = provider.device_token;
                    var is_document_uploaded = provider.is_document_uploaded;
                    var vehicle_ids = provider.vehicle_ids;

                    if (provider_page_type == 3) {
                        if (is_document_uploaded || !setting_detail.is_upload_provider_documents)
                        {
                            if (vehicle_ids.length > 0)
                            {
                                if(provider.selected_vehicle_id){
                                    provider.is_approved = true;
                                    provider.save().then(() => {
                                            // email to provider approve
                                            if (setting_detail.is_mail_notification) {
                                                emails.sendProviderApprovedEmail(request_data, provider, provider.first_name + " " + provider.last_name);
                                            }
                                            // sms to provider approve
                                            if (setting_detail.is_sms_notification)
                                            {
                                                SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.PROVIDER_APPROVED, "");
                                            }
                                            // push to provider approve
                                            if (setting_detail.is_push_notification) {
                                                utils.sendPushNotification(ADMIN_DATA_ID.PROVIDER, device_type, device_token, PROVIDER_PUSH_CODE.APPROVED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                                            }

                                            response_data.json({
                                                success: true,
                                                message: PROVIDER_MESSAGE_CODE.APPROVED_SUCCESSFULLY

                                            });
                                    }, (error) => {
                                        console.log(error);
                                        response_data.json({
                                            success: false,
                                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                        });
                                    });
                                } else {
                                    response_data.json({success: false, error_code: PROVIDER_ERROR_CODE.VEHICLE_TYPE_NOT_ASSIGNED_OR_NOT_APPROVED});
                                }

                            } else
                            {
                                response_data.json({success: false, error_code: PROVIDER_ERROR_CODE.ADD_VEHICLE_FIRST});

                            }


                        } else {

                            response_data.json({success: false, error_code: PROVIDER_ERROR_CODE.DOCUMENT_UPLOAD_FIRST});
                        }

                    } else if (provider_page_type == 1 || provider_page_type == 2)
                    {
                        provider.is_approved = false;
                        provider.is_active_for_job = false;
                        provider.is_online = false;
                        provider.save().then(() => {
                                // email to provider decline
                                if (setting_detail.is_mail_notification)
                                {
                                    emails.sendProviderDeclineEmail(request_data, provider, provider.first_name + " " + provider.last_name);
                                }
                                // sms to provider decline
                                if (setting_detail.is_sms_notification)
                                {
                                    SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.PROVIDER_DECLINE, "");
                                }
                                // push to provider decline
                                if (setting_detail.is_push_notification)
                                {
                                    utils.sendPushNotification(ADMIN_DATA_ID.PROVIDER, device_type, device_token, PROVIDER_PUSH_CODE.DECLINED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                                }


                                response_data.json({
                                    success: true,
                                    message: PROVIDER_MESSAGE_CODE.DECLINED_SUCCESSFULLY


                                });
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


// get_bank_detail
exports.get_bank_detail = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Bank_detail.findOne({bank_holder_id: request_data_body.id}).then((bank_detail) => {
                if (!bank_detail)
                {
                    response_data.json({success: false, error_code: USER_ERROR_CODE.WALLET_AMOUNT_ADD_FAILED});

                } else
                {
                    response_data.json({
                        success: true,
                        message: USER_MESSAGE_CODE.WALLET_AMOUNT_ADD_SUCCESSFULLY,
                        bank_detail: bank_detail

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
            response_data.json(response);
        }
    });
};


exports.new_get_bank_detail = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Bank_detail.find({bank_holder_id: request_data_body.id}).then((bank_detail) => {
                if (!bank_detail)
                {
                    response_data.json({success: false, error_code: USER_ERROR_CODE.WALLET_AMOUNT_ADD_FAILED});

                } else
                {
                    response_data.json({
                        success: true,
                        message: USER_MESSAGE_CODE.WALLET_AMOUNT_ADD_SUCCESSFULLY,
                        bank_detail: bank_detail

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
            response_data.json(response);
        }
    });
};
// get_provider_list_for_city
exports.get_provider_list_for_city = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'city_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var city_id = request_data_body.city_id;
            Provider.find({city_id: city_id}).then((provider_detail) => {
                response_data.json({
                    success: true,
                    message: ORDER_MESSAGE_CODE.ORDER_CANCEL_OR_REJECT_BY_PROVIDER_SUCCESSFULLY,
                    providers: provider_detail
                });
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

//export_excel_provider
exports.export_csv_provider = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Provider.find({}).then((providers) => {

                    var json2csv = require('json2csv');
                    var fs = require('fs');
                    var fields = ['unique_id', 'first_name', 'last_name', 'device_type', 'referral_code',
                        'email', 'country_phone_code',
                        'phone', 'app_version', 'wallet', 'wallet_currency_code', 'address',
                        'is_approved', 'is_active_for_job', 'is_online', 'is_in_delivery',
                        'is_email_verified', 'is_phone_number_verified', 'is_document_uploaded',
                        'location'
                    ];

                    var fieldNames = ['Unique ID', 'First Name', 'Last Name', 'Device Type', 'Referral Code',
                        'Email', 'Country Phone Code',
                        'Phone', 'App Version', 'Wallet', 'Wallet Currency Code', 'Address',
                        'Approved', 'Active', 'Online', 'In Delivery',
                        'Email Verify', 'Phone Number Verify', 'Document Uploaded',
                        'Location'
                    ];

                    var csv = json2csv({data: providers, fields: fields, fieldNames: fieldNames});
                    var path = './uploads/csv/file.csv';
                    fs.writeFile(path, csv, function (error, data) {
                        if (error) {
                            throw error;
                        } else {
                            var new_path = './csv/file.csv';

                            response_data.json({success: true,
                                message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                                path: new_path});

                        }
                    });
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

exports.get_provider_review_history = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'provider_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var condition = {$match: {'provider_id': mongoose.Types.ObjectId(request_data_body.provider_id)}}

            var store_query = {
                $lookup:
                    {
                        from: "stores",
                        localField: "store_id",
                        foreignField: "_id",
                        as: "store_detail"
                    }
            };
            var array_to_json1 = { $unwind: {
                    path: "$store_detail",
                    preserveNullAndEmptyArrays: true
                }
            };

            var user_query = {
                $lookup:
                    {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user_query"
                    }
            };
            var array_to_json2 = { $unwind: {
                    path: "$user_query",
                    preserveNullAndEmptyArrays: true
                }
            };
            Review.aggregate([condition, store_query, array_to_json1, user_query, array_to_json2]).then((review_list) => {
                response_data.json({success: true, review_list: review_list})
            }, (error) => {
                console.log(error);
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            })
        } else {
            response_data.json(response);
        }
    });
};

exports.add_new_provider = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {
            var request_data_body = request_data.body;
            Store.findOne({_id: request_data.body.store_id}, function (error, store_detail) {
                var country_id = store_detail.country_id;
                var city_id = store_detail.city_id;
                request_data.body.country_id = country_id;
                request_data.body.city_id = city_id;
                request_data.body.country_phone_code = store_detail.country_phone_code;
                request_data.body.login_by = "manual";
                request_data.body.provider_type_id = request_data.body.store_id;
                request_data.body.provider_type = ADMIN_DATA_ID.STORE;
                Provider_File_Obj.provider_register(request_data, response_data);
            });
        } else {
            response_data.json(response);
        }
    });
};