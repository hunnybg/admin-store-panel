require('../utils/message_code');
require('../utils/error_code');
require('../utils/constants');
require('../utils/push_code');
var utils = require('../utils/utils');
var emails = require('../controllers/email_sms/emails');
var wallet_history = require('../controllers/user/wallet');
var SMS = require('../controllers/email_sms/sms');
var User = require('mongoose').model('user');
var Country = require('mongoose').model('country');
var mongoose = require('mongoose');
var Provider = require('mongoose').model('provider');
var User = require('mongoose').model('user');
var Store = require('mongoose').model('store');
var Review = require('mongoose').model('review');
var console = require('../utils/console');
var Vaiter = require('mongoose').model('vaiter');
var Ticket = require('mongoose').model('ticket');

// for view all user_list

// user_list_search_sort
exports.user_list_search_sort = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var number_of_rec = Number(request_data_body.number_of_rec);
            var page = request_data_body.page;
            var search_field = request_data_body.search_field;
            var search_value = request_data_body.search_value;
            search_value = search_value.replace(/^\s+|\s+$/g, '');
            search_value = search_value.replace(/ +(?= )/g, '');
            var user_page_type = request_data_body.user_page_type;
            if (search_field === "first_name") {
                var query1 = {};
                var query2 = {};
                var query3 = {};
                var query4 = {};
                var query5 = {};
                var query6 = {};


                var full_name = search_value.split(' ');
                if (typeof full_name[0] === 'undefined' || typeof full_name[1] === 'undefined') {

                    query1[search_field] = { $regex: new RegExp(search_value, 'i') };
                    query2['last_name'] = { $regex: new RegExp(search_value, 'i') };

                    var search = { "$match": { $or: [query1, query2] } };

                } else {

                    query1[search_field] = { $regex: new RegExp(search_value, 'i') };
                    query2['last_name'] = { $regex: new RegExp(search_value, 'i') };
                    query3[search_field] = { $regex: new RegExp(full_name[0], 'i') };
                    query4['last_name'] = { $regex: new RegExp(full_name[0], 'i') };
                    query5[search_field] = { $regex: new RegExp(full_name[1], 'i') };
                    query6['last_name'] = { $regex: new RegExp(full_name[1], 'i') };

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
            sort["$sort"]["unique_id"] = parseInt(-1);
            var count = { $group: { _id: null, total: { $sum: 1 }, data: { $push: '$data' } } };
            var skip = {};
            skip["$skip"] = (page * number_of_rec) - number_of_rec;
            var limit = {};
            limit["$limit"] = number_of_rec;

            var condition = { $match: {} };
            if (user_page_type == 1) {
                condition = { $match: { 'is_approved': { $eq: true } } };
            } else if (user_page_type == 2) {
                condition = { $match: { 'is_approved': { $eq: false } } };
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
            var array_to_json = { $unwind: "$country_details" };

            var referred_query = {
                $lookup:
                {
                    from: "users",
                    localField: "referred_by",
                    foreignField: "_id",
                    as: "referred_user_details"
                }
            };
            var array_to_json1 = {
                $unwind: {
                    path: "$referred_user_details",
                    preserveNullAndEmptyArrays: true
                }
            };

            console.log(search)

            User.aggregate([condition, country_query, array_to_json, referred_query, array_to_json1
                , search
                , count
            ]).then((users) => {

                if (users.length === 0) {

                    response_data.json({ success: false, error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND, pages: 0 });
                } else {

                    var pages = Math.ceil(users[0].total / number_of_rec);
                    if (page) {
                        User.aggregate([condition, country_query, array_to_json, referred_query, array_to_json1
                            , sort
                            , search, skip, limit
                        ]).then((users) => {
                            if (users.length == 0) {
                                response_data.json({
                                    success: false, error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND
                                });
                            } else {
                                response_data.json({
                                    success: true,
                                    message: USER_MESSAGE_CODE.USER_LIST_SUCCESSFULLY, pages: pages,
                                    users: users
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
                        User.aggregate([condition, country_query, array_to_json, referred_query, array_to_json1
                            , sort
                            , search
                        ]).then((users) => {
                            if (users.length == 0) {
                                response_data.json({
                                    success: false, error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND
                                });
                            } else {
                                console.log(users.length);
                                response_data.json({
                                    success: true,
                                    message: USER_MESSAGE_CODE.USER_LIST_SUCCESSFULLY, pages: pages,
                                    users: users
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

//get_user_detail
exports.get_user_detail = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'user_id', type: 'string' }], function (response) {
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

            var referred_query = {
                $lookup:
                {
                    from: "users",
                    localField: "referred_by",
                    foreignField: "_id",
                    as: "referred_user_details"
                }
            };
            var condition = { "$match": { '_id': { $eq: mongoose.Types.ObjectId(request_data_body.user_id) } } };

            User.aggregate([condition, country_query, referred_query, array_to_json]).then((user) => {
                if (user.length == 0) {
                    response_data.json({ success: false, error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND });

                } else {
                    response_data.json({
                        success: true,
                        message: USER_MESSAGE_CODE.USER_DETAIL_SUCCESSFULLY,
                        user: user[0]
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

/// update_user
exports.update_user = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var user_id = request_data_body.user_id;

            User.find({ _id: { '$ne': user_id }, phone: request_data_body.phone }).then((user_detail) => {

                if (user_detail.length > 0) {
                    response_data.json({ success: false, error_code: USER_ERROR_CODE.PHONE_NUMBER_ALREADY_REGISTRED });
                } else {

                    User.findOneAndUpdate({ _id: user_id }, request_data_body, { new: true }).then((user_data) => {

                        if (user_data) {
                            var image_file = request_data.files;
                            if (image_file != undefined && image_file.length > 0) {
                                utils.deleteImageFromFolder(user_data.image_url, FOLDER_NAME.USER_PROFILES);
                                var image_name = user_data._id + utils.generateServerToken(4);
                                var url = utils.getStoreImageFolderPath(FOLDER_NAME.USER_PROFILES) + image_name + FILE_EXTENSION.USER;
                                utils.storeImageToFolder(image_file[0].path, image_name + FILE_EXTENSION.USER, FOLDER_NAME.USER_PROFILES);
                                user_data.image_url = url;
                                user_data.save();
                            }



                            var first_name = (request_data_body.first_name).trim();
                            first_name = first_name.charAt(0).toUpperCase() + first_name.slice(1);

                            var last_name = (request_data_body.last_name).trim();
                            last_name = last_name.charAt(0).toUpperCase() + last_name.slice(1);

                            user_data.first_name = first_name;
                            user_data.last_name = last_name;
                            user_data.save();


                            response_data.json({
                                success: true,
                                message: USER_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
                                user: user_data

                            });

                        } else {
                            response_data.json({ success: false, error_code: USER_ERROR_CODE.UPDATE_FAILED });

                        }
                    });
                }
            });
        } else {
            response_data.json(response);
        }
    });
};

//approve_decline_user
exports.approve_decline_user = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'user_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var user_id = request_data_body.user_id;
            var is_approved = request_data_body.is_approved;
            var user_page_type = request_data_body.user_page_type;
            console.log(request_data_body);
            if (user_page_type == 2) {

                User.findOneAndUpdate({ _id: user_id }, { is_approved: true }, { new: true }).then((users) => {
                    if (!users) {
                        response_data.json({ success: false, error_code: PROVIDER_ERROR_CODE.UPDATE_FAILED });
                    } else {

                        var phone_with_code = users.country_phone_code + users.phone;
                        var device_type = users.device_type;
                        var device_token = users.device_token;
                        // email to user approved
                        if (setting_detail.is_mail_notification) {
                            emails.sendUserApprovedEmail(request_data, users, users.first_name + " " + users.last_name);

                        }
                        // sms to user approved
                        if (setting_detail.is_sms_notification) {
                            SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.USER_APPROVED, "");
                        }
                        // push to user approved
                        if (setting_detail.is_push_notification) {
                            utils.sendPushNotification(ADMIN_DATA_ID.USER, device_type, device_token, USER_PUSH_CODE.APPROVED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                        }

                        response_data.json({
                            success: true,
                            message: USER_MESSAGE_CODE.APPROVED_SUCCESSFULLY
                        });
                    }
                }, (error) => {
                    console.log(error);
                    response_data.json({
                        success: false,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                    });
                });


            } else if (user_page_type == 1) {

                User.findOneAndUpdate({ _id: user_id }, { is_approved: false }, { new: true }).then((users) => {

                    if (!users) {

                        response_data.json({ success: false, error_code: PROVIDER_ERROR_CODE.UPDATE_FAILED });
                    } else {

                        var phone_with_code = users.country_phone_code + users.phone;
                        var device_type = users.device_type;
                        var device_token = users.device_token;
                        // email to user decline
                        if (setting_detail.is_mail_notification) {
                            emails.sendUserDeclineEmail(request_data, users, users.first_name + " " + users.last_name);

                        }
                        // sms to user decline
                        if (setting_detail.is_sms_notification) {
                            SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.USER_DECLINE, "");
                        }
                        // push to user decline
                        if (setting_detail.is_push_notification) {
                            utils.sendPushNotification(ADMIN_DATA_ID.USER, device_type, device_token, USER_PUSH_CODE.DECLINED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                        }

                        response_data.json({
                            success: true,
                            message: USER_MESSAGE_CODE.DECLINED_SUCCESSFULLY
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


// admin add user wallet
exports.add_wallet = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'type' }, { name: 'wallet' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var type = Number(request_data_body.type);
            var Table;
            switch (type) {
                case ADMIN_DATA_ID.USER:
                    Table = User;
                    var id = request_data_body.user_id;
                    break;
                case ADMIN_DATA_ID.VAITER:
                    Table = Vaiter;
                    var id = request_data_body.vaiter_id;
                    break;
                case ADMIN_DATA_ID.STORE:
                    Table = Store;
                    var id = request_data_body.store_id;
                    break;
                default:
                    break;
            }
            Table.findOne({ _id: id }).then((detail) => {
                if (detail) {
                    Country.findOne({ _id: detail.country_id }).then((country) => {

                        if (country && setting_detail) {

                            var wallet_currency_code = country.currency_code;

                            var wallet = utils.precisionRoundTwo(Number(request_data_body.wallet));
                            var total_wallet_amount = 0;
                            if (wallet > 0) {
                                total_wallet_amount = wallet_history.add_wallet_history(type, detail.unique_id, detail._id, detail.country_id, wallet_currency_code, wallet_currency_code,
                                    1, wallet, detail.wallet, WALLET_STATUS_ID.ADD_WALLET_AMOUNT, WALLET_COMMENT_ID.SET_BY_ADMIN, "By Admin");
                            } else {
                                total_wallet_amount = wallet_history.add_wallet_history(type, detail.unique_id, detail._id, detail.country_id, wallet_currency_code, wallet_currency_code,
                                    1, Math.abs(wallet), detail.wallet, WALLET_STATUS_ID.REMOVE_WALLET_AMOUNT, WALLET_COMMENT_ID.SET_BY_ADMIN, "By Admin");
                            }
                            detail.wallet = total_wallet_amount;
                            detail.save().then(() => {
                                response_data.json({
                                    success: true,
                                    message: USER_MESSAGE_CODE.WALLET_AMOUNT_ADD_SUCCESSFULLY

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
                    response_data.json({ success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND });
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



// admin send sms
exports.send_sms = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'type' }, { name: 'content', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var type = Number(request_data_body.type);

            switch (type) {
                case ADMIN_DATA_ID.USER:
                    Table = User;
                    var id = request_data_body.user_id;
                    break;
                case ADMIN_DATA_ID.PROVIDER:
                    Table = Provider;
                    var id = request_data_body.provider_id;
                    break;
                case ADMIN_DATA_ID.STORE:
                    Table = Store;
                    var id = request_data_body.store_id;
                    break;
                default:
                    break;
            }
            Table.findOne({ _id: id }).then((detail) => {
                if (detail) {
                    var phone_with_code = detail.country_phone_code + detail.phone;


                    var sms_content = request_data_body.content;
                    utils.sendSMS(phone_with_code, sms_content);


                    response_data.json({
                        success: true,
                        message: USER_MESSAGE_CODE.SEND_SMS_SUCCESSFULLY

                    });

                } else {
                    response_data.json({ success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND });
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

// admin send notification
exports.send_notification = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var type = Number(request_data_body.type);

            switch (type) {
                case ADMIN_DATA_ID.USER:
                    Table = User;
                    var id = request_data_body.user_id;
                    break;
                case ADMIN_DATA_ID.PROVIDER:
                    Table = Provider;
                    var id = request_data_body.provider_id;
                    break;
                case ADMIN_DATA_ID.STORE:
                    Table = Store;
                    var id = request_data_body.store_id;
                    break;
                default:
                    break;
            }
            Table.findOne({ _id: id }).then((detail) => {
                if (detail) {
                    var device_type = detail.device_type;
                    var device_token = detail.device_token;

                    var notification_content = request_data_body.content;
                    utils.sendPushNotification(type, device_type, device_token, notification_content, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);


                    response_data.json({
                        success: true,
                        message: USER_MESSAGE_CODE.SEND_NOTIFICATION_SUCCESSFULLY

                    });
                } else {
                    response_data.json({ success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND });
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


//export_excel_user
exports.export_excel_user = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            User.find({}).then((users) => {

                var json2csv = require('json2csv');
                var fs = require('fs');
                var fields = ['unique_id', 'first_name', 'last_name', 'device_type', 'referral_code',
                    'email', 'country_phone_code',
                    'phone', 'app_version', 'wallet', 'wallet_currency_code', 'address',
                    'is_approved',
                    'is_email_verified', 'is_phone_number_verified', 'is_document_uploaded',
                    'location'
                ];
                var fieldNames = ['Unique ID', 'First Name', 'Last Name', 'Device Type', 'Referral Code',
                    'Email', 'Country Phone Code',
                    'Phone', 'App Version', 'Wallet', 'Wallet Currency Code', 'Address',
                    'Approved',
                    'Email Verify', 'Phone Number Verify', 'Document Uploaded',
                    'Location'
                ];


                var csv = json2csv({ data: users, fields: fields, fieldNames: fieldNames });
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

exports.get_user_referral_history = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'type' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var type = Number(request_data_body.type);
            var Table;
            switch (type) {
                case ADMIN_DATA_ID.USER:
                    Table = User;
                    var id = request_data_body.user_id;
                    break;
                case ADMIN_DATA_ID.PROVIDER:
                    Table = Provider;
                    var id = request_data_body.provider_id;
                    break;
                case ADMIN_DATA_ID.STORE:
                    Table = Store;
                    var id = request_data_body.store_id;
                    break;
                default:
                    break;
            }
            Table.find({ referred_by: request_data_body.id }, { first_name: 1, last_name: 1, unique_id: 1, image_url: 1 }).then((referral_history) => {

                response_data.json({ success: true, referral_history: referral_history })
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

exports.get_user_review_history = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'user_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var condition = { $match: { 'user_id': mongoose.Types.ObjectId(request_data_body.user_id) } }

            var store_query = {
                $lookup:
                {
                    from: "stores",
                    localField: "store_id",
                    foreignField: "_id",
                    as: "store_detail"
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
            Review.aggregate([condition, store_query, array_to_json1, provider_query, array_to_json2]).then((review_list) => {
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


get_ticket_list = async (req, res) => {
    utils.check_request_params(req.body, [], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            const request_data_body = req.body;

            let { number_of_rec, page, sort_field, sort_ticket, search_field, search_value, ticket_page_type, user_type, user_id } = request_data_body

            number_of_rec = Number(number_of_rec);
            search_value = search_value.replace(/^\s+|\s+$/g, '');

            let userlookup = {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_detail"
                }
            }
            let userunwind = {
                $unwind: {
                    path: "$user_detail",
                    preserveNullAndEmptyArrays: true
                }
            };

            let storelookup = {
                $lookup: {
                    from: "stores",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "store_detail"
                }
            }
            let storeunwind = {
                $unwind: {
                    path: "$store_detail",
                    preserveNullAndEmptyArrays: true
                }
            }

            let request_type_query = { $match: {} };
            if (Number(ticket_page_type) == TICKET_TYPE.PENDING) {
                request_type_query['$match']['status'] = { '$eq': TICKET_STATUS.CREATED };
            }
            if (Number(ticket_page_type) == TICKET_TYPE.RESOLVED) {
                request_type_query['$match']['status'] = { '$eq': TICKET_STATUS.RESOLVED };
            }

            let user_type_query = { $match: {} };
            if (Number(user_type) == ADMIN_DATA_ID.STORE) {
                let mongoose = require('mongoose');
                let schema = mongoose.Types.ObjectId;
                user_type_query['$match']['user_id'] = { '$eq': schema(user_id) };
            }

            if (search_field === "user_detail.first_name") {
                var query1 = {};
                var query2 = {};
                var query3 = {};
                var query4 = {};
                var query5 = {};
                var query6 = {};
                var query7 = {};
                var query8 = {};
                var query9 = {};

                var full_name = search_value.split(' ');
                if (typeof full_name[0] === 'undefined' || typeof full_name[1] === 'undefined') {

                    query1[search_field] = { $regex: new RegExp(search_value, 'i') };
                    query2['user_detail.last_name'] = { $regex: new RegExp(search_value, 'i') };

                    query3['store_detail.name'] = { $regex: new RegExp(search_value, 'i') };

                    var search = { "$match": { $or: [query1, query2, query3] } };
                } else {
                    query1[search_field] = { $regex: new RegExp(search_value, 'i') };
                    query2['user_detail.last_name'] = { $regex: new RegExp(search_value, 'i') };
                    query3[search_field] = { $regex: new RegExp(full_name[0], 'i') };
                    query4['user_detail.last_name'] = { $regex: new RegExp(full_name[0], 'i') };
                    query5[search_field] = { $regex: new RegExp(full_name[1], 'i') };
                    query6['user_detail.last_name'] = { $regex: new RegExp(full_name[1], 'i') };

                    query7['store_detail.name'] = { $regex: new RegExp(search_value, 'i') };
                    query8['store_detail.name'] = { $regex: new RegExp(full_name[0], 'i') };
                    query9['store_detail.name'] = { $regex: new RegExp(full_name[1], 'i') };

                    var search = { "$match": { $or: [query1, query2, query3, query4, query5, query6, query7, query8, query9]} };
                }
            } else if (search_field == 'user_detail.unique_id' || search_field == 'store_detail.unique_id') {
                var query = {};
                query[search_field] = { $eq: Number(search_value) };
                var search = { "$match": query };
            } else {
                var query = {};
                query[search_field] = { $regex: new RegExp(search_value, 'i') };
                var search = { "$match": query };
            }



            var sort = { "$sort": {} };
            sort["$sort"][sort_field] = parseInt(sort_ticket);
            var count = { $group: { _id: null, total: { $sum: 1 }, data: { $push: '$data' } } };
            var skip = {};
            skip["$skip"] = (page * number_of_rec) - number_of_rec;
            var limit = {};
            limit["$limit"] = number_of_rec;

            let finalqueries = [request_type_query, user_type_query, userlookup, userunwind, storelookup, storeunwind, search, count];
            let tickets = await Ticket.aggregate(finalqueries)
            if (tickets.length === 0) {
                res.json({ success: false, error_code: TICKET_ERROR_CODE.NO_TICKET_FOUND, pages: 0 });
                return;
            }
            var pages = Math.ceil(tickets[0].total / number_of_rec);
            if (page) {
                let finalquerywithlimit = [request_type_query, user_type_query, userlookup, userunwind, storelookup, storeunwind, sort, search, skip, limit];
                let ticket_data = await Ticket.aggregate(finalquerywithlimit)
                if (ticket_data.length === 0) {
                    res.json({ success: false, error_code: TICKET_ERROR_CODE.NO_TICKET_FOUND });
                    return;
                }
                res.json({ success: true, pages: pages, tickets: ticket_data, message: TICKET_MESSAGE_CODE.LIST_SUCCESSFULLY });
                return;
            }
            let finalquerieswithoutlimit = [request_type_query, user_type_query, userlookup, userunwind, storelookup, storeunwind, sort, search];
            let ticket_data = await Ticket.aggregate(finalquerieswithoutlimit)
            if (ticket_data.length === 0) {
                res.json({ success: false, error_code: TICKET_MESSAGE_CODE.LIST_SUCCESSFULLY });
                return;
            }
            res.json({
                success: true,
                message: TABLE_REQUEST_MESSAGE_CODE.LIST_SUCCESSFULLY,
                tickets: ticket_data,
            });
        } catch (e) {
            console.log(e)
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                error: e
            });
        }
    })
};
module.exports.get_ticket_list = get_ticket_list;


resolve_ticket = async (req, res) => {
    utils.check_request_params(req.body, [], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            const { id } = req.body;
            let query = { '_id': id, 'status': TICKET_STATUS.CREATED }
            let ticket = await Ticket.findOne(query);
            if (!ticket) {
                res.json({
                    success: false,
                    error_code: TICKET_ERROR_CODE.TICKET_ALREADY_RESOLVED,
                });
                return;
            }
            ticket.status = TICKET_STATUS.RESOLVED;
            ticket.resolved_at = new Date();
            await ticket.save();

            res.json({
                success: true,
                message: TICKET_MESSAGE_CODE.RESOLVED_SUCCESSFULLY,
                ticket: ticket,
            });
        } catch (e) {
            console.log(e)
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                error: e
            });
        }
    })
};
module.exports.resolve_ticket = resolve_ticket;