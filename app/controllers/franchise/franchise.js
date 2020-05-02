require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');

var moment = require('moment');
var utils = require('../../utils/utils');
var emails = require('../../controllers/email_sms/emails');
var SMS = require('../../controllers/email_sms/sms');
var Setting = require('mongoose').model('setting');
var Email = require('mongoose').model('email_detail');
var mongoose = require('mongoose');

var Store = require('mongoose').model('store');
var Franchise = require('mongoose').model('franchise');
var Country = require('mongoose').model('country');
var City = require('mongoose').model('city');
var Provider = require('mongoose').model('provider');
var User = require('mongoose').model('user');
var Order = require('mongoose').model('order');
var Vehicle = require('mongoose').model('vehicle');
var Payment_gateway = require('mongoose').model('payment_gateway');
var Order_payment = require('mongoose').model('order_payment');
var Review = require('mongoose').model('review');
var Referral_code = require('mongoose').model('referral_code');
var Wallet = require('mongoose').model('wallet');
var Store_analytic = require('mongoose').model('store_analytic');

// store register api 
exports.franchise_register = function (request_data, response_data) {
    console.log("franchise_register");
    console.log(request_data.body);
    var request_data_body = request_data.body;
    var social_id = request_data_body.social_id;
    var social_id_array = [];

    if (social_id == undefined || social_id == null || social_id == "")
    {
        social_id = null;
    } else
    {
        social_id_array.push(social_id);
    }
    Country.findOne({_id: request_data_body.country_id}, function (error, country) {
        if (country) {
            City.findOne({_id: request_data_body.city_id}, function (error, city) {
                if (city) {
                    var timezone = city.timezone;
                    Franchise.findOne({social_ids: {$all: social_id_array}}, function (error, franchise_data) {
                        if (error) {

                            response_data.json({success: false, error_code: STORE_ERROR_CODE.REGISTRATION_FAILED});

                        } else if (franchise_data) {

                            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_ALREADY_REGISTER_WITH_SOCIAL});



                        } else {


                            Franchise.findOne({email: request_data_body.email}, function (error, franchise_data) {

                                if (error) {

                                    response_data.json({success: false, error_code: STORE_ERROR_CODE.REGISTRATION_FAILED});

                                } else if (franchise_data) {

                                    if (social_id != null && franchise_data.social_ids.indexOf(social_id) < 0)
                                    {

                                        franchise_data.social_ids.push(social_id);
                                        franchise_data.save();
                                        response_data.json({
                                            success: true,
                                            message: STORE_MESSAGE_CODE.REGISTER_SUCCESSFULLY,
                                            timezone: timezone,
                                            currency: country.currency_sign,
                                            minimum_phone_number_length: country.minimum_phone_number_length,
                                            maximum_phone_number_length: country.maximum_phone_number_length,
                                            franchise: franchise_data
                                        });

                                    } else
                                    {

                                        response_data.json({success: false, error_code: STORE_ERROR_CODE.EMAIL_ALREADY_REGISTRED});
                                    }
                                } else {

                                    Franchise.findOne({phone: request_data_body.phone}, function (error, franchise_data) {

                                        if (error) {

                                            response_data.json({success: false, error_code: STORE_ERROR_CODE.REGISTRATION_FAILED});

                                        } else if (franchise_data) {
                                            if (social_id != null && franchise_data.social_ids.indexOf(social_id) < 0)
                                            {

                                                franchise_data.social_ids.push(social_id);
                                                franchise_data.save();
                                                response_data.json({
                                                    success: true,
                                                    message: STORE_MESSAGE_CODE.REGISTER_SUCCESSFULLY,
                                                    timezone: timezone,
                                                    currency: country.currency_sign,
                                                    minimum_phone_number_length: country.minimum_phone_number_length,
                                                    maximum_phone_number_length: country.maximum_phone_number_length,
                                                    franchise: franchise_data
                                                });

                                            } else
                                            {

                                                response_data.json({success: false, error_code: STORE_ERROR_CODE.PHONE_NUMBER_ALREADY_REGISTRED});

                                            }



                                        } else {
                                            var name = (request_data_body.name).trim();
                                            name = name.charAt(0).toUpperCase() + name.slice(1);


                                            var server_token = utils.generateServerToken(32);


                                            var franchise_data = new Franchise({
                                                admin_type: ADMIN_DATA_ID.FRANCHISE,
                                                store_delivery_id: request_data_body.store_delivery_id,
                                                name: name,
                                                email: ((request_data_body.email).trim()).toLowerCase(),
                                                password: request_data_body.password,
                                                country_phone_code: request_data_body.country_phone_code,
                                                website_url: request_data_body.website_url,
                                                slogan: request_data_body.slogan,
                                                country_id: request_data_body.country_id,
                                                city_id: request_data_body.city_id,
                                                phone: request_data_body.phone,
                                                address: request_data_body.address,
                                                famous_for: request_data_body.famous_for,
                                                image_url: "",
                                                device_token: request_data_body.device_token,
                                                device_type: request_data_body.device_type,
                                                server_token: server_token,
                                                is_email_verified: request_data_body.is_email_verified,
                                                is_phone_number_verified: request_data_body.is_phone_number_verified,
                                                social_ids: social_id_array,
                                                login_by: request_data_body.login_by,
                                                is_approved: false,
                                                is_business: false,
                                                is_document_uploaded: false,
                                                
                                                location: [request_data_body.latitude, request_data_body.longitude]
                                            });

                                            var image_file = request_data.files;

                                            if (image_file != undefined && image_file.length > 0) {
                                                var image_name = franchise_data._id + utils.generateServerToken(4);
                                                var url = utils.getStoreImageFolderPath(FOLDER_NAME.STORE_PROFILES) + image_name + FILE_EXTENSION.STORE;

                                                franchise_data.image_url = url;
                                                utils.storeImageToFolder(image_file[0].path, image_name + FILE_EXTENSION.STORE, FOLDER_NAME.STORE_PROFILES);

                                            }

                                            if (social_id == undefined || social_id == null || social_id == "")
                                            {
                                                franchise_data.password = utils.encryptPassword(request_data_body.password);
                                            }
                                            // City.findOne({_id: store_data.city_id}, function (error, city) {

                                            var timezone = city.timezone;


                                            Setting.findOne({}, function (error, setting_detail) {

                                                if (country && setting_detail) {

                                                    
                                                    franchise_data.save(function (error) {
                                                        if (error) {
                                                            response_data.json({success: false, error_code: STORE_ERROR_CODE.REGISTRATION_FAILED});
                                                        } else {

                                                            Setting.findOne({}, function (error, setting_detail) {
                                                                var is_mail_notification = setting_detail.is_mail_notification;
                                                                if (is_mail_notification == true) {
                                                                    Email.findOne({unique_id: EMAIL_UNIQUE_ID.STORE_WELCOME}, function (error, email_detail) {
                                                                        var is_send = email_detail.is_send;
                                                                        if (is_send == true) {
                                                                            //emails.sendStoreRegisterEmail(request_data, franchise_data, franchise_data.name);
                                                                        }
                                                                    });
                                                                }
                                                            });

                                                            response_data.json({
                                                                success: true,
                                                                message: STORE_MESSAGE_CODE.REGISTER_SUCCESSFULLY,
                                                                timezone: timezone,
                                                                currency: country.currency_sign,
                                                                minimum_phone_number_length: country.minimum_phone_number_length,
                                                                maximum_phone_number_length: country.maximum_phone_number_length,
                                                                franchise: franchise_data
                                                            });
                                                        }
                                                    });


                                                }
                                            });
                                            //});
                                            //});
                                        }

                                    });

                                }

                            });
                        }

                    });

                }
            });
        }
    });

};
exports.approve_decline_business_store = function (request_data, response_data) {

    var request_data_body = request_data.body;

    var store_id = request_data_body.store_id;
    var is_approved = request_data_body.is_approved;

    var store_page_type = request_data_body.store_page_type;
    
    console.log(request_data_body);
    Setting.findOne({}, function (error, setting_detail) {
        var is_mail_notification = setting_detail.is_mail_notification;
        var is_sms_notification = setting_detail.is_sms_notification;
        var is_push_notification = setting_detail.is_push_notification;

        if (store_page_type == 2)
        {
            Store.findOneAndUpdate({_id: store_id}, {is_business: true}, {new : true}, function (error, stores) {

                if (error || !stores) {

                    response_data.json({success: false, error_code: PROVIDER_ERROR_CODE.UPDATE_FAILED});
                } else {
                    var phone_with_code = stores.country_phone_code + stores.phone;
                    var device_type = stores.device_type;
                    var device_token = stores.device_token;

                    // email to store approved
                    if (is_mail_notification == true) {
                        Email.findOne({unique_id: EMAIL_UNIQUE_ID.STORE_APPROVED}, function (error, email_detail) {
                            var is_send = email_detail.is_send;
                            if (is_send == true) {
                                emails.sendStoreApprovedEmail(request_data, stores, stores.name);
                            }
                        });
                    }
                    // sms to store approved
                    if (is_sms_notification === true)
                    {
                        SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.STORE_APPROVED, "");
                    }

                    // push to store approved
                    if (is_push_notification == true) {

                        utils.sendPushNotification(ADMIN_DATA_ID.STORE, device_type, device_token, STORE_PUSH_CODE.APPROVED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                    }


                    response_data.json({
                        success: true,
                        message: STORE_MESSAGE_CODE.APPROVED_SUCCESSFULLY
                    });
                }
            });
        } else if (store_page_type == 1 || store_page_type == 3)
        {

            Store.findOneAndUpdate({_id: store_id}, {is_business: false}, {new : true}, function (error, stores) {

                if (error || !stores) {

                    response_data.json({success: false, error_code: PROVIDER_ERROR_CODE.UPDATE_FAILED});
                } else {
                    var phone_with_code = stores.country_phone_code + stores.phone;
                    var device_type = stores.device_type;
                    var device_token = stores.device_token;

                    // email to store declined
                    if (is_mail_notification == true) {
                        Email.findOne({unique_id: EMAIL_UNIQUE_ID.STORE_DECLINED}, function (error, email_detail) {
                            var is_send = email_detail.is_send;
                            if (is_send == true) {
                                emails.sendStoreDeclineEmail(request_data, stores, stores.name);
                            }
                        });
                    }

                    // sms to store declined
                    if (is_sms_notification === true)
                    {
                        SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.STORE_DECLINE, "");
                    }

                    // push to store approved
                    if (is_push_notification == true) {
                        utils.sendPushNotification(ADMIN_DATA_ID.STORE, device_type, device_token, STORE_PUSH_CODE.DECLINED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
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
exports.logout = function (request_data, response_data) {
    var request_data_body = request_data.body;
    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise) {
        if (franchise)
        {
            if (request_data_body.server_token !== null && franchise.server_token !== request_data_body.server_token) {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});

            } else
            {

                franchise.device_token = "";
                franchise.server_token = "";
                franchise.save(function (error) {
                    if (error) {
                        response_data.json({success: false, error_code: STORE_ERROR_CODE.LOGOUT_FAILED});
                    } else {
                        response_data.json({
                            success: true,
                            message: STORE_MESSAGE_CODE.LOGOUT_SUCCESSFULLY
                        });
                    }

                });
            }
        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});

        }
    });
};
exports.franchise_update = function (request_data, response_data) {

    var request_data_body = request_data.body;
    var franchise_id = request_data_body.franchise_id;
    var old_password = request_data_body.old_password;
    var social_id = request_data_body.social_id;

    if (social_id == undefined || social_id == null || social_id == "") {
        social_id = null;
    }

    if (old_password == undefined && old_password == null && old_password == "") {
        old_password = "";
    } else {
        old_password = utils.encryptPassword(old_password);
    }

    Franchise.findOne({_id: franchise_id}, function (error, franchise) {

        if (franchise) {

            if (request_data_body.server_token !== null && franchise.server_token !== request_data_body.server_token) {

                response_data.json({success: false, error_code: STORE_ERROR_CODE.INVALID_SERVER_TOKEN});

            } else if (social_id == null && old_password != "" && old_password != franchise.password) {

                response_data.json({success: false, error_code: STORE_ERROR_CODE.INVALID_PASSWORD});

            } else if (social_id != null && franchise.social_ids.indexOf(social_id) < 0) {

                response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_NOT_REGISTER_WITH_SOCIAL});

            } else
            {
                Setting.findOne({}, function (error, setting_data) {

                    var is_franchise_mail_verification = setting_data.is_user_mail_verification;
                    var is_franchise_sms_verification = setting_data.is_user_sms_verification;

                    Country.findOne({_id: franchise.country_id}, function (error, country) {
                        City.findOne({_id: franchise.city_id}, function (error, city) {

                            var timezone = city.timezone;
                            var new_email = request_data_body.email;
                            var new_phone = request_data_body.phone;

                            var new_password = request_data_body.new_password;
                            if (new_password != "" && new_password != undefined && undefined != null)
                            {
                                var new_password = utils.encryptPassword(request_data_body.new_password);
                                request_data_body.password = new_password;
                            }

                            if (request_data_body.latitude != undefined && request_data_body.longitude != undefined) {
                                request_data_body.location = [request_data_body.latitude, request_data_body.longitude];
                            }

                            request_data_body.social_ids = franchise.social_ids;

                            Franchise.findOne({_id: {'$ne': franchise_id}, email: new_email}, function (error, franchise_details) {

                                var is_update = false;
                                if (franchise_details) {
                                    if (is_franchise_mail_verification == true) {
                                        if (franchise_details.is_email_verified == false) {
                                            is_update = true;
                                            franchise_details.email = "notverified" + franchise_details.email;
                                            franchise_details.save();

                                        }
                                    }
                                } else {
                                    is_update = true;
                                }

                                if (is_update == true)
                                {
                                    is_update = false;
                                    Franchise.findOne({_id: {'$ne': franchise_id}, phone: new_phone}, function (error, franchise_phone_details) {
                                        if (franchise_phone_details) {
                                            if (is_franchise_sms_verification == true) {
                                                if (franchise_phone_details.is_phone_number_verified == false) {
                                                    is_update = true;
                                                    franchise_phone_details.phone = "00" + franchise_phone_details.phone;
                                                    franchise_phone_details.save();

                                                }
                                            }
                                        } else {
                                            is_update = true;
                                        }
                                        if (is_update == true)
                                        {
                                            var social_id_array = [];
                                            if (social_id != null) {
                                                social_id_array.push(social_id);
                                            }
                                            var franchise_update_query = {$or: [{'password': old_password}, {social_ids: {$all: social_id_array}}]};
                                            franchise_update_query = {$and: [{'_id': franchise_id}, franchise_update_query]};

                                            Franchise.findOneAndUpdate(franchise_update_query, request_data_body, {new : true}, function (error, franchise_data) {

                                                if (franchise_data)
                                                {

                                                    var image_file = request_data.files;
                                                    if (image_file != undefined && image_file.length > 0) {
                                                        utils.deleteImageFromFolder(franchise_data.image_url, FOLDER_NAME.STORE_PROFILES);
                                                        var image_name = franchise_data._id + utils.generateServerToken(4);
                                                        var url = utils.getStoreImageFolderPath(FOLDER_NAME.STORE_PROFILES) + image_name + FILE_EXTENSION.STORE;
                                                        utils.storeImageToFolder(image_file[0].path, image_name + FILE_EXTENSION.STORE, FOLDER_NAME.STORE_PROFILES);
                                                        franchise_data.image_url = url;
                                                    }
                                                    if (request_data_body.name != undefined)
                                                    {
                                                        var name = (request_data_body.name).trim();
                                                        name = name.charAt(0).toUpperCase() + name.slice(1);
                                                        franchise_data.name = name;

                                                    }
                                                    //store_data.email = request_data_body.email;

                                                    if (request_data_body.is_phone_number_verified != undefined) {
                                                        franchise_data.is_phone_number_verified = request_data_body.is_phone_number_verified;
                                                    } else if (request_data_body.is_email_verified != undefined)
                                                    {
                                                        franchise_data.is_email_verified = request_data_body.is_email_verified;
                                                    } else if (request_data_body.is_phone_number_verified != undefined && request_data_body.is_email_verified != undefined)
                                                    {
                                                        franchise_data.is_phone_number_verified = request_data_body.is_phone_number_verified;
                                                        franchise_data.is_email_verified = request_data_body.is_email_verified;
                                                    }
                                                    franchise_data.save();


                                                    response_data.json({
                                                        success: true,
                                                        message: STORE_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
                                                        timezone: timezone,
                                                        currency: country.currency_sign,
                                                        minimum_phone_number_length: country.minimum_phone_number_length,
                                                        maximum_phone_number_length: country.maximum_phone_number_length,

                                                        franchise: franchise_data

                                                    });

                                                } else
                                                {
                                                    response_data.json({success: false, error_code: STORE_ERROR_CODE.UPDATE_FAILED});
                                                }

                                            });
                                        } else
                                        {
                                            response_data.json({success: false, error_code: STORE_ERROR_CODE.PHONE_NUMBER_ALREADY_REGISTRED});
                                        }
                                    });
                                } else {
                                    response_data.json({success: false, error_code: STORE_ERROR_CODE.EMAIL_ALREADY_REGISTRED});
                                }
                            });
                        });
                    });
                });
            }
        } else
        {
            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });
};
exports.get_order_detail = function (request_data, response_data) {
    var request_data_body = request_data.body;
    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {
        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {

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
                                localField: "provider_id",
                                foreignField: "_id",
                                as: "provider_detail"
                            }
                };
                //var array_to_json_provider_query = {$unwind: "$provider_detail"};

//    var vehicle_query = {
//        $lookup:
//                {
//                    from: "vehicles",
//                    localField: "provider_detail.vehicle_id",
//                    foreignField: "_id",
//                    as: "vehicle_detail"
//                }
//    };

                Order.aggregate([order_condition, user_query, order_payment_query, store_query, provider_query, array_to_json_user_detail, array_to_json_store_detail, array_to_json_order_payment_query

                ], function (error, order) {

                    if (error || order.length === 0)
                    {
                        response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND, pages: 0});
                    } else
                    {
                        response_data.json({success: true,
                            message: ORDER_MESSAGE_CODE.GET_ORDER_DATA_SUCCESSFULLY,
                            order: order[0]
                        });
                    }
                });

            }
        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });

};
exports.get_franchise_data = function (request_data, response_data) {
    var request_data_body = request_data.body;

    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise) {

        if (franchise)
        {
            if (request_data_body.server_token !== null && franchise.server_token !== request_data_body.server_token) {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});

            } else
            {

                var country_query = {$lookup:
                            {
                                from: "countries",
                                localField: "country_id",
                                foreignField: "_id", as: "country_details"
                            }
                };

                var array_to_json = {$unwind: "$country_details"};

                var city_query = {
                    $lookup:
                            {
                                from: "cities",
                                localField: "city_id",
                                foreignField: "_id",
                                as: "city_details"}
                };

                var array_to_json1 = {$unwind: "$city_details"};

                var delivery_query = {$lookup:
                            {
                                from: "deliveries",
                                localField: "store_delivery_id",
                                foreignField: "_id", as: "delivery_details"}
                };

                var array_to_json2 = {$unwind: "$delivery_details"};

                var condition = {"$match": {'_id': {$eq: mongoose.Types.ObjectId(request_data_body.franchise_id)}}};

                Franchise.aggregate([condition, country_query, city_query, delivery_query, array_to_json, array_to_json1, array_to_json2], function (error, franchise_detail) {


                    if (franchise_detail.length != 0) {
                        if(franchise.store_ids.length > 0){

                            var mongoose = require('mongoose');
                            var Schema = mongoose.Types.ObjectId;
                            var stores_array = [];
                            for(var i=0;i<franchise.store_ids.length;i++){
                                x = new Schema(franchise.store_ids[i]);
                                stores_array.push(x); 
                                if(i+1 == franchise.store_ids.length){
                                    var franchise_condition = {"$match": {'store_id': {$in: stores_array}}};
                                    var group = {
                                        $group: {
                                            _id: null,
                                            total_orders: {$sum: 1},
                                            accepted_orders: {$sum: {$cond: [{$and: [{$gte: ["$order_status", ORDER_STATE.STORE_ACCEPTED]}, {$gte: ["$order_status", ORDER_STATE.STORE_ACCEPTED]}]}, 1, 0]}},
                                            completed_orders: {$sum: {$cond: [{$eq: ["$order_status_id", ORDER_STATUS_ID.COMPLETED]}, 1, 0]}},
                                            cancelled_orders: {$sum: {$cond: [{$eq: ["$order_status_id", ORDER_STATUS_ID.CANCELLED]}, 1, 0]}}
                                        }
                                    }
                                    Order.aggregate([franchise_condition, group], function (error, order_detail) {

                                        if (error || order_detail.length == 0) {
                                            response_data.json({success: true,
                                                message: STORE_MESSAGE_CODE.STORE_DATA_SUCCESSFULLY,
                                                franchise_detail: franchise_detail[0],
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
                                                message: STORE_MESSAGE_CODE.STORE_DATA_SUCCESSFULLY,
                                                franchise_detail: franchise_detail[0],
                                                order_detail: order_detail[0]
                                            });
                                        }
                                    });
                                }
                            }
                        }else{
                            response_data.json({success: true,
                                        message: STORE_MESSAGE_CODE.STORE_DATA_SUCCESSFULLY,
                                        franchise_detail: franchise_detail[0],
                                        order_detail: {
                                            total_orders: 0,
                                            accepted_orders: 0,
                                            completed_orders: 0,
                                            cancelled_orders: 0,
                                            completed_order_percentage: 0
                                        }
                                    });
                        }
                    } else
                    {
                        response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
                    }
                });
            }
        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });
};
exports.get_store_data = function (request_data, response_data) {
    var request_data_body = request_data.body;
    var store_ids = request_data_body.store_ids;
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
    var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};
    var mongoose = require('mongoose');
    var Schema = mongoose.Types.ObjectId;
    var stores_array = [];
    for(var i=0;i<store_ids.length;i++){
        x = new Schema(store_ids[i]);
        stores_array.push(x); 
        if(i+1 == store_ids.length){
            var condition1 = { $match: { '_id':  { $in: stores_array }  } };
            console.log(stores_array);
            Store.aggregate([condition1, city_query, array_to_json_city_query,delivery_query,array_to_json_delivery_query
                        , count
            ], function (error, stores) {

                if (error || stores.length === 0)
                {

                    response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
                } else
                {

                    Store.aggregate([condition1, city_query, array_to_json_city_query,delivery_query,array_to_json_delivery_query], function (error, stores) {
                        if (error || stores.length == 0) {
                            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
                            });
                        } else
                        {

                            response_data.json({success: true,
                                message: STORE_MESSAGE_CODE.STORE_LIST_SUCCESSFULLY,
                                stores: stores});
                        }
                    });
                }
            });
        }
    }
};
// store login
exports.franchise_login = function (request_data, response_data) {
    var request_data_body = request_data.body;
    var email = ((request_data_body.email).trim()).toLowerCase();
    var social_id = request_data_body.social_id;
    var encrypted_password = request_data_body.password;
console.log(request_data_body);
    if (social_id == undefined || social_id == null || social_id == "")
    {
        social_id = "";
    }

    if (encrypted_password == undefined || encrypted_password == null || encrypted_password == "") {
        encrypted_password = "";
    } else {
        encrypted_password = utils.encryptPassword(encrypted_password);
    }

    var query = {$or: [{'email': email}, {'phone': email}, {social_ids: {$all: [social_id]}}]};

    Franchise.findOne(query, function (error, franchise_detail) {

        if (social_id == undefined || social_id == null || social_id == "") {
            social_id = null;
        }

        if (error || (social_id == null && email == "")) {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.LOGIN_FAILED});

        } else if (franchise_detail) {
            if (social_id == null && encrypted_password != "" && encrypted_password != franchise_detail.password) {

                response_data.json({success: false, error_code: STORE_ERROR_CODE.INVALID_PASSWORD});

            } else if (social_id != null && franchise_detail.social_ids.indexOf(social_id) < 0) {

                response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_NOT_REGISTER_WITH_SOCIAL});

            } else {
                Country.findOne({_id: franchise_detail.country_id}, function (error, country) {

                    City.findOne({_id: franchise_detail.city_id}, function (error, city) {

                        var timezone = city.timezone;

                        var device_token = "";
                        var device_type = "";
                        if (franchise_detail.device_token != "" && franchise_detail.device_token != request_data_body.device_token) {
                            device_token = franchise_detail.device_token;
                            device_type = franchise_detail.device_type;
                        }

                        if (request_data_body.device_type == DEVICE_TYPE.ANDROID || request_data_body.device_type == DEVICE_TYPE.IOS)
                        {
                            franchise_detail.device_token = request_data_body.device_token;

                        } else
                        {
                            Order.update({franchise_notify: 0, franchise_id: franchise_detail._id}, {franchise_notify: 1}, {multi: true}, function (error, order) {
                            });
                        }

                        franchise_detail.device_type = request_data_body.device_type;
                        var server_token = utils.generateServerToken(32);
                        franchise_detail.server_token = server_token;
                        franchise_detail.login_by = request_data_body.login_by;
                        franchise_detail.app_version = request_data_body.app_version;
                        franchise_detail.save(function (error) {
                            if (error) {
                                response_data.json({success: false, error_code: STORE_ERROR_CODE.LOGIN_FAILED});
                            } else {
                                if (device_token != "") {
                                    utils.sendPushNotification(ADMIN_DATA_ID.STORE, device_type, device_token, STORE_PUSH_CODE.LOGIN_IN_OTHER_DEVICE, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                                }
                                response_data.json({
                                    success: true,
                                    message: STORE_MESSAGE_CODE.LOGIN_SUCCESSFULLY,
                                    timezone: timezone,
                                    currency: country.currency_sign,
                                    minimum_phone_number_length: country.minimum_phone_number_length,
                                    maximum_phone_number_length: country.maximum_phone_number_length,

                                    franchise: franchise_detail

                                });
                            }

                        });
                    });
                });
            }

        } else {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.NOT_A_REGISTERED});

        }

    });
};
