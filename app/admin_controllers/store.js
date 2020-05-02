require('../utils/message_code');
require('../utils/error_code');
require('../utils/constants');
require('../utils/push_code');
var utils = require('../utils/utils');
var emails = require('../controllers/email_sms/emails');
var SMS = require('../controllers/email_sms/sms');
var Setting = require('mongoose').model('setting');
var Email = require('mongoose').model('email_detail');
var Store = require('mongoose').model('store');
var Order = require('mongoose').model('order');
var mongoose = require('mongoose');
var Product = require('mongoose').model('product');
var City = require('mongoose').model('city');
var Item = require('mongoose').model('item');
var Review = require('mongoose').model('review');
var console = require('../utils/console');
var Order_payment = require('mongoose').model('order_payment');
var Transfer_History = require('mongoose').model('transfer_history');


// store_list_search_sort
exports.store_list_search_sort = function (request_data, response_data) {
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
            var array_to_json_city_query = { $unwind: "$city_details" };

            var country_query = {
                $lookup:
                {
                    from: "countries",
                    localField: "country_id",
                    foreignField: "_id",
                    as: "country_details"
                }
            };
            var array_to_json = { $unwind: "$country_details" };

            var delivery_query = {
                $lookup:
                {
                    from: "deliveries",
                    localField: "store_delivery_id",
                    foreignField: "_id",
                    as: "delivery_details"
                }
            };
            var array_to_json_delivery_query = { $unwind: "$delivery_details" };

            var number_of_rec = Number(request_data_body.number_of_rec);
            var page = request_data_body.page;
            var sort_field = request_data_body.sort_field;
            var sort_store = request_data_body.sort_store;
            var search_field = request_data_body.search_field;
            var search_value = request_data_body.search_value;
            search_value = search_value.replace(/^\s+|\s+$/g, '');
            search_value = search_value.replace(/ +(?= )/g, '');
            var store_page_type = request_data_body.store_page_type;


            if (search_field === "name") {
                var query1 = {};
                var query2 = {};
                var query3 = {};
                var query4 = {};
                var query5 = {};
                var query6 = {};

                var full_name = search_value.split(' ');
                if (typeof full_name[0] === 'undefined' || typeof full_name[1] === 'undefined') {

                    query1[search_field] = { $regex: new RegExp(search_value, 'i') };
                    query2['city_details.city_name'] = { $regex: new RegExp(search_value, 'i') };
                    var search = { "$match": { $or: [query1, query2] } };
                } else {

                    query1[search_field] = { $regex: new RegExp(search_value, 'i') };
                    query2['city_details.city_name'] = { $regex: new RegExp(search_value, 'i') };
                    query3[search_field] = { $regex: new RegExp(full_name[0], 'i') };
                    query4['city_details.city_name'] = { $regex: new RegExp(full_name[0], 'i') };
                    query5[search_field] = { $regex: new RegExp(full_name[1], 'i') };
                    query6['city_details.city_name'] = { $regex: new RegExp(full_name[1], 'i') };
                    var search = { "$match": { $or: [query1, query2, query3, query4, query5, query6] } };
                }
            } else if (search_field == 'unique_id') {
                var query = {};
                query[search_field] = { $eq: Number(search_value) };
                var search = { "$match": query };
            } else {
                var query = {};
                query[search_field] = { $regex: new RegExp(search_value, 'i') };
                var search = { "$match": query };
            }

            var sort = { "$sort": {} };
            sort["$sort"][sort_field] = parseInt(sort_store);
            var count = { $group: { _id: null, total: { $sum: 1 }, data: { $push: '$data' } } };
            var skip = {};
            skip["$skip"] = (page * number_of_rec) - number_of_rec;
            var limit = {};
            limit["$limit"] = number_of_rec;


            var condition = { $match: {} };
            if (store_page_type == 1) {
                condition = { $match: { 'is_approved': { $eq: true }, 'is_business': { $eq: true } } };
            } else if (store_page_type == 2) {
                condition = { $match: { 'is_approved': { $eq: false } } };
            } else if (store_page_type == 3) {
                condition = { $match: { 'is_business': { $eq: false }, 'is_approved': { $eq: true } } };
            }



            Store.aggregate([condition, city_query, country_query, array_to_json, array_to_json_city_query, delivery_query, array_to_json_delivery_query
                , search
                , count
            ]).then((stores) => {

                if (stores.length === 0) {
                    response_data.json({ success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND, pages: 0 });
                } else {
                    var pages = Math.ceil(stores[0].total / number_of_rec);

                    if (page) {

                        Store.aggregate([condition, city_query, country_query, array_to_json, array_to_json_city_query, delivery_query, array_to_json_delivery_query
                            , sort
                            , search, skip, limit
                        ]).then((stores) => {
                            if (stores.length == 0) {
                                response_data.json({
                                    success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
                                });
                            } else {

                                response_data.json({
                                    success: true,
                                    message: STORE_MESSAGE_CODE.STORE_LIST_SUCCESSFULLY, pages: pages,
                                    stores: stores
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
                        Store.aggregate([condition, city_query, country_query, array_to_json, array_to_json_city_query, delivery_query, array_to_json_delivery_query
                            , sort
                            , search
                        ]).then((stores) => {
                            if (stores.length == 0) {
                                response_data.json({
                                    success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
                                });
                            } else {

                                response_data.json({
                                    success: true,
                                    message: STORE_MESSAGE_CODE.STORE_LIST_SUCCESSFULLY, pages: pages,
                                    stores: stores
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

exports.get_store_data = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'store_id', type: 'string' }], function (response) {
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

            var array_to_json = { $unwind: "$country_details" };

            var city_query = {
                $lookup:
                {
                    from: "cities",
                    localField: "city_id",
                    foreignField: "_id",
                    as: "city_details"
                }
            };

            var array_to_json1 = { $unwind: "$city_details" };

            var delivery_query = {
                $lookup:
                {
                    from: "deliveries",
                    localField: "store_delivery_id",
                    foreignField: "_id",
                    as: "delivery_details"
                }
            };

            var referred_query = {
                $lookup:
                {
                    from: "stores",
                    localField: "referred_by",
                    foreignField: "_id",
                    as: "referred_store_details"
                }
            };

            var array_to_json2 = { $unwind: "$delivery_details" };

            var condition = { "$match": { '_id': { $eq: mongoose.Types.ObjectId(request_data_body.store_id) } } };


            Store.aggregate([condition, country_query, city_query, delivery_query, referred_query, array_to_json, array_to_json1, array_to_json2]).then((store_detail) => {

                if (store_detail.length != 0) {

                    var store_condition = { "$match": { 'store_id': { $eq: mongoose.Types.ObjectId(request_data_body.store_id) } } };
                    var group = {
                        $group: {
                            _id: null,
                            total_orders: { $sum: 1 },
                            accepted_orders: { $sum: { $cond: [{ $and: [{ $gte: ["$order_status", ORDER_STATE.STORE_ACCEPTED] }, { $gte: ["$order_status", ORDER_STATE.STORE_ACCEPTED] }] }, 1, 0] } },
                            completed_orders: { $sum: { $cond: [{ $eq: ["$order_status_id", ORDER_STATUS_ID.COMPLETED] }, 1, 0] } },
                            cancelled_orders: { $sum: { $cond: [{ $eq: ["$order_status_id", ORDER_STATUS_ID.CANCELLED] }, 1, 0] } }
                        }
                    }
                    Order.aggregate([store_condition, group]).then((order_detail) => {

                        if (order_detail.length == 0) {
                            response_data.json({
                                success: true,
                                message: STORE_MESSAGE_CODE.STORE_DATA_SUCCESSFULLY,
                                store_detail: store_detail[0],
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

                            response_data.json({
                                success: true,
                                message: STORE_MESSAGE_CODE.STORE_DATA_SUCCESSFULLY,
                                store_detail: store_detail[0],
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


//// store update

exports.update_store = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'store_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var store_id = request_data_body.store_id;
            var is_approved = request_data_body.is_approved;

            Store.find({ _id: { '$ne': store_id }, phone: request_data_body.phone }).then((store_detail) => {
                if (store_detail.length > 0) {
                    response_data.json({ success: false, error_code: STORE_ERROR_CODE.PHONE_NUMBER_ALREADY_REGISTRED });
                } else {
                    Store.findOneAndUpdate({ _id: store_id }, request_data_body, { new: true }).then((store_data) => {

                        if (store_data) {
                            var device_type = store_data.device_type;
                            var device_token = store_data.device_token;

                            var image_file = request_data.files;
                            if (image_file != undefined && image_file.length > 0) {
                                utils.deleteImageFromFolder(store_data.image_url, FOLDER_NAME.STORE_PROFILES);
                                var image_name = store_data._id + utils.generateServerToken(4);
                                var url = utils.getStoreImageFolderPath(FOLDER_NAME.STORE_PROFILES) + image_name + FILE_EXTENSION.STORE;
                                utils.storeImageToFolder(image_file[0].path, image_name + FILE_EXTENSION.STORE, FOLDER_NAME.STORE_PROFILES);
                                store_data.image_url = url;
                            }

                            if (request_data_body.name != undefined) {
                                var name = (request_data_body.name).trim();
                                name = name.charAt(0).toUpperCase() + name.slice(1);
                                store_data.name = name;

                            }
                            store_data.save();


                            response_data.json({
                                success: true,
                                message: STORE_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
                                store: store_data

                            });

                        } else {
                            response_data.json({ success: false, error_code: STORE_ERROR_CODE.UPDATE_FAILED });

                        }
                    }, (error) => {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                        });
                    });
                }
            }, (error) => {
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


//approve_decline_store
exports.approve_decline_store = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'store_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var store_id = request_data_body.store_id;
            var is_approved = request_data_body.is_approved;
            var store_page_type = request_data_body.store_page_type;

            if (store_page_type == 2) {
                Store.findOneAndUpdate({ _id: store_id }, { is_approved: true }, { new: true }).then((stores) => {

                    if (!stores) {
                        response_data.json({ success: false, error_code: PROVIDER_ERROR_CODE.UPDATE_FAILED });
                    } else {
                        var phone_with_code = stores.country_phone_code + stores.phone;
                        var device_type = stores.device_type;
                        var device_token = stores.device_token;

                        // email to store approved
                        if (setting_detail.is_mail_notification) {
                            emails.sendStoreApprovedEmail(request_data, stores, stores.name);
                        }

                        // sms to store approved
                        if (setting_detail.is_sms_notification) {
                            SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.STORE_APPROVED, "");
                        }

                        // push to store approved
                        if (setting_detail.is_push_notification) {
                            utils.sendPushNotification(ADMIN_DATA_ID.STORE, device_type, device_token, STORE_PUSH_CODE.APPROVED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                        }


                        response_data.json({
                            success: true,
                            message: STORE_MESSAGE_CODE.APPROVED_SUCCESSFULLY
                        });
                    }
                }, (error) => {
                    console.log(error);
                    response_data.json({
                        success: false,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                    });
                });
            } else if (store_page_type == 1 || store_page_type == 3) {

                Store.findOneAndUpdate({ _id: store_id }, { is_approved: false }, { new: true }).then((stores) => {

                    if (!stores) {
                        response_data.json({ success: false, error_code: PROVIDER_ERROR_CODE.UPDATE_FAILED });
                    } else {
                        var phone_with_code = stores.country_phone_code + stores.phone;
                        var device_type = stores.device_type;
                        var device_token = stores.device_token;

                        // email to store declined
                        if (setting_detail.is_mail_notification) {
                            emails.sendStoreDeclineEmail(request_data, stores, stores.name);

                        }
                        // sms to store declined
                        if (setting_detail.is_sms_notification) {
                            SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.STORE_DECLINE, "");
                        }

                        // push to store approved
                        if (setting_detail.is_push_notification) {
                            utils.sendPushNotification(ADMIN_DATA_ID.STORE, device_type, device_token, STORE_PUSH_CODE.DECLINED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                        }


                        response_data.json({
                            success: true,
                            message: STORE_MESSAGE_CODE.DECLINED_SUCCESSFULLY
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
            response_data.json(response);
        }
    });

};

//get_store_list_for_city
exports.get_store_list_for_city = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'city_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            console.log(request_data_body);
            var city_id = request_data_body.city_id;
            if (city_id == "000000000000000000000000") {
                Store.find({ is_business: true }).then((store) => {

                    if (store.length == 0) {
                        response_data.json({ success: false, error_code: DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND });
                    } else {
                        response_data.json({
                            success: true,
                            message: DELIVERY_MESSAGE_CODE.DELIVERY_LIST_SUCCESSFULLY,
                            stores: store
                        });
                    }
                });
            } else {

                Store.find({ is_business: true, city_id: city_id }).then((store) => {

                    if (store.length == 0) {
                        response_data.json({ success: false, error_code: DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND });
                    } else {
                        response_data.json({
                            success: true,
                            message: DELIVERY_MESSAGE_CODE.DELIVERY_LIST_SUCCESSFULLY,
                            stores: store
                        });
                    }
                });
            }
        } else {
            response_data.json(response);
        }
    });
};


//get_store_list_for_country
exports.get_store_list_for_country = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'country_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var country_id = request_data_body.country_id;
            Store.find({ is_business: true, country_id: country_id }).then((store) => {

                if (store.length == 0) {
                    response_data.json({ success: false, error_code: DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND });
                } else {
                    response_data.json({
                        success: true,
                        message: DELIVERY_MESSAGE_CODE.DELIVERY_LIST_SUCCESSFULLY,
                        stores_all: store
                    });
                }
            });
        } else {
            response_data.json(response);
        }
    });
};

exports.get_store_list = function (request_data, response_data) {
    var request_data_body = request_data.body;
    Store.find({}).then((store) => {
        if (store.length == 0) {
            response_data.json({ success: false, error_code: DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND });
        } else {
            response_data.json({
                success: true,
                message: DELIVERY_MESSAGE_CODE.DELIVERY_LIST_SUCCESSFULLY,
                stores: store
            });
        }
    });
};

//product_for_city_store
exports.product_for_city_store = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'city_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            console.log(request_data_body);
            var city_condition = { "$match": { '_id': { $eq: mongoose.Types.ObjectId(request_data_body.city_id) } } };

            var store_query = {
                $lookup:
                {
                    from: "stores",
                    localField: "_id",
                    foreignField: "city_id",
                    as: "store_detail"
                }
            };
            var array_to_json1 = { $unwind: "$store_detail" };

            var product_query = {
                $lookup:
                {
                    from: "products",
                    localField: "store_detail._id",
                    foreignField: "store_id",
                    as: "product_detail"
                }
            };

            City.aggregate([city_condition, store_query, array_to_json1, product_query
            ]).then((city) => {

                if (city.length == 0) {
                    response_data.json({ success: false, error_code: PROMO_CODE_ERROR_CODE.PROMO_CODE_DATA_NOT_FOUND });
                } else {

                    response_data.json({
                        success: true,
                        message: PROMO_CODE_MESSAGE_CODE.PROMO_CODE_LIST_SUCCESSFULLY,
                        city: city
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

//item_for_city_store
exports.item_for_city_store = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'city_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            console.log(request_data_body);
            var city_condition = { "$match": { '_id': { $eq: mongoose.Types.ObjectId(request_data_body.city_id) } } };
            var store_query = {
                $lookup:
                {
                    from: "stores",
                    localField: "_id",
                    foreignField: "city_id",
                    as: "store_detail"
                }
            };
            var array_to_json1 = { $unwind: "$store_detail" };
            var item_query = {
                $lookup:
                {
                    from: "items",
                    localField: "store_detail._id",
                    foreignField: "store_id",
                    as: "item_detail"
                }
            };

            City.aggregate([city_condition, store_query, array_to_json1, item_query
            ]).then((city) => {

                if (city.length == 0) {
                    response_data.json({ success: false, error_code: PROMO_CODE_ERROR_CODE.PROMO_CODE_DATA_NOT_FOUND });
                } else {

                    response_data.json({
                        success: true,
                        message: PROMO_CODE_MESSAGE_CODE.PROMO_CODE_LIST_SUCCESSFULLY,
                        city: city
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

//export_excel_store
exports.export_excel_store = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.find({}).then((stores) => {

                var json2csv = require('json2csv');
                var fs = require('fs');
                var fields = ['unique_id', 'name', 'device_type', 'referral_code',
                    'email', 'country_phone_code',
                    'phone', 'app_version', 'wallet', 'wallet_currency_code', 'address',
                    'is_approved',
                    'is_email_verified', 'is_phone_number_verified', 'is_document_uploaded',
                    'location'
                ];

                var fieldNames = ['Unique ID', 'Name', 'Device Type', 'Referral Code',
                    'Email', 'Country Phone Code',
                    'Phone', 'App Version', 'Wallet', 'Wallet Currency Code', 'Address',
                    'Approved',
                    'Email Verify', 'Phone Number Verify', 'Document Uploaded',
                    'Location'
                ];


                var csv = json2csv({ data: stores, fields: fields, fieldNames: fieldNames });
                var path = './uploads/csv/file.csv';
                fs.writeFile(path, csv, function (error, data) {
                    if (error) {
                        throw error;
                    } else {
                        var new_path = './csv/file.csv';

                        response_data.json({
                            success: true,
                            message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                            path: new_path
                        });

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

exports.get_store_review_history = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'store_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var condition = { $match: { 'store_id': mongoose.Types.ObjectId(request_data_body.store_id) } }

            var user_query = {
                $lookup:
                {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_detail"
                }
            };
            var array_to_json1 = {
                $unwind: {
                    path: "$store_detail",
                    preserveNullAndEmptyArrays: true
                }
            };

            var provider_query = {
                $lookup:
                {
                    from: "providers",
                    localField: "provider_id",
                    foreignField: "_id",
                    as: "provider_detail"
                }
            };
            var array_to_json2 = {
                $unwind: {
                    path: "$provider_detail",
                    preserveNullAndEmptyArrays: true
                }
            };
            Review.aggregate([condition, user_query, array_to_json1, provider_query, array_to_json2]).then((review_list) => {
                response_data.json({ success: true, review_list: review_list })
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


exports.get_store_from_unique_code = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'store_id', type: 'string' }], function (response) {
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

            var array_to_json = { $unwind: "$country_details" };

            var city_query = {
                $lookup:
                {
                    from: "cities",
                    localField: "city_id",
                    foreignField: "_id",
                    as: "city_details"
                }
            };

            var array_to_json1 = { $unwind: "$city_details" };

            var delivery_query = {
                $lookup:
                {
                    from: "deliveries",
                    localField: "store_delivery_id",
                    foreignField: "_id",
                    as: "delivery_details"
                }
            };

            var referred_query = {
                $lookup:
                {
                    from: "stores",
                    localField: "referred_by",
                    foreignField: "_id",
                    as: "referred_store_details"
                }
            };

            var array_to_json2 = { $unwind: "$delivery_details" };

            var condition = { "$match": { '_id': { $eq: mongoose.Types.ObjectId(request_data_body.store_id) } } };


            Store.aggregate([condition, country_query, city_query, delivery_query, referred_query, array_to_json, array_to_json1, array_to_json2]).then((store_detail) => {

                if (store_detail.length != 0) {

                    var store_condition = { "$match": { 'store_id': { $eq: mongoose.Types.ObjectId(request_data_body.store_id) } } };
                    var group = {
                        $group: {
                            _id: null,
                            total_orders: { $sum: 1 },
                            accepted_orders: { $sum: { $cond: [{ $and: [{ $gte: ["$order_status", ORDER_STATE.STORE_ACCEPTED] }, { $gte: ["$order_status", ORDER_STATE.STORE_ACCEPTED] }] }, 1, 0] } },
                            completed_orders: { $sum: { $cond: [{ $eq: ["$order_status_id", ORDER_STATUS_ID.COMPLETED] }, 1, 0] } },
                            cancelled_orders: { $sum: { $cond: [{ $eq: ["$order_status_id", ORDER_STATUS_ID.CANCELLED] }, 1, 0] } }
                        }
                    }
                    Order.aggregate([store_condition, group]).then((order_detail) => {

                        if (order_detail.length == 0) {
                            response_data.json({
                                success: true,
                                message: STORE_MESSAGE_CODE.STORE_DATA_SUCCESSFULLY,
                                store_detail: store_detail[0],
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

                            response_data.json({
                                success: true,
                                message: STORE_MESSAGE_CODE.STORE_DATA_SUCCESSFULLY,
                                store_detail: store_detail[0],
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


get_pay_to_store = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'store_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            var mongoose = require('mongoose');
            let schema = mongoose.Types.ObjectId
            let { store_id } = req.body;
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
            let queryarray = [
                order_query, array_to_json_order_query,
                { $match: { 'order_detail.order_status_id': { $eq: ORDER_STATUS_ID.COMPLETED } } },
                { $match: { 'store_id': { $eq: schema(store_id) } } },
                { $match: { 'is_transfered_to_store': { $eq: false } } },
                { $group: { _id: null, total: { $sum: '$pay_to_store' } } }
            ]

            let pay_to_store = await Order_payment.aggregate(queryarray)

            queryarray[4]['$match']['is_transfered_to_store']['$eq'] = true;
            let paid_to_store = await Order_payment.aggregate(queryarray)
            let paid_to_store_amount = 0;
            let pay_to_store_amount = 0
            if (pay_to_store.length > 0) {
                pay_to_store_amount = pay_to_store[0].total.toFixed(2);
            }
            if (paid_to_store.length > 0) {
                paid_to_store_amount = paid_to_store[0].total.toFixed(2);
            }
            res.json({
                success: true,
                pay_to_store: pay_to_store_amount,
                paid_to_store: paid_to_store_amount
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

module.exports.get_pay_to_store = get_pay_to_store

withdraw_earning = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'store_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { store_id, password, amount } = req.body;
            let encrypted_password = utils.encryptPassword(password);
            let store = await Store.findById(store_id);
            if (encrypted_password == "" || encrypted_password != store.password) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.INVALID_PASSWORD });
                return;
            }
            utils.transfer_amount_to_employee(amount, store.account_id, store.wallet_currency_code, async (response_data) => {
                if (!response_data) {
                    utils.add_transfered_history(ADMIN_DATA_ID.STORE, store._id, store.country_id,
                        amount, store.wallet_currency_code, 0, '', ADMIN_DATA_ID.STORE, response_data.error);
                    res.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_WITHDRAW_EARNING_FAILED
                    })
                    return;
                }

                utils.add_transfered_history(ADMIN_DATA_ID.STORE, store._id, store.country_id,
                    amount, store.wallet_currency_code, 1, response_data.transfer_id, ADMIN_DATA_ID.STORE, null);
                let updated = await Order_payment.update({ is_transfered_to_store: false, store_id: store._id }, { is_transfered_to_store: true }, { multi: true })

                store.last_transferred_date = new Date();
                store.save();
                res.json({
                    success: true,
                    message: STORE_MESSAGE_CODE.STORE_WITHDRAW_EARNING_SUCCESSFULL,
                    updated: updated
                });
            });
        } catch (e) {
            console.log(e, null, 3)
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            })
        }
    })
}

module.exports.withdraw_earning = withdraw_earning


get_transferred_history = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'store_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { store_id, page, number_of_rec } = req.body;

            let store = await Store.findById(store_id);
            if (!store) {
                res.json({ success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND });
                return;
            }

            number_of_rec = Number(number_of_rec);
            page = Number(page);

            let store_query = { $match: { 'user_id': { $eq: store._id } } }
            let sort = { "$sort": {} };
            sort["$sort"]['unique_id'] = parseInt(-1);
            let count = { $group: { _id: null, total: { $sum: 1 }, data: { $push: '$data' } } };
            let skip = {};
            skip["$skip"] = (page * number_of_rec) - number_of_rec;
            let limit = {};
            limit["$limit"] = number_of_rec;

            let transfer_history_count = await Transfer_History.aggregate([store_query, count]);
            if (transfer_history_count.length == 0) {
                res.json({ success: false, error_code: STORE_ERROR_CODE.NO_TRANSFERRED_HISTORY_FOUND })
                return;
            }

            var pages = Math.ceil(transfer_history_count[0].total / number_of_rec);
            if (page) {
                let transfer_history = await Transfer_History.aggregate([store_query, sort, skip, limit])
                if (transfer_history.length === 0) {
                    res.json({ success: false, error_code: STORE_ERROR_CODE.NO_TRANSFERRED_HISTORY_FOUND });
                    return;
                }
                res.json({ success: true, pages: pages, transfer_history: transfer_history });
                return;
            }
            let transfer_history = await Transfer_History.aggregate([store_query, sort])
            if (transfer_history.length === 0) {
                res.json({ success: false, error_code: STORE_ERROR_CODE.NO_TRANSFERRED_HISTORY_FOUND });
                return;
            }
            res.json({ success: true, transfer_history: transfer_history })
        } catch (e) {
            console.log(e, null, 3)
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            })
        }
    })
}
module.exports.get_transferred_history = get_transferred_history



