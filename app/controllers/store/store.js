require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var moment = require('moment');
var utils = require('../../utils/utils');
var emails = require('../../controllers/email_sms/emails');
var my_request = require('../../controllers/store/request');
var mongoose = require('mongoose');
var pad = require('pad-left');
var SMS = require('../../controllers/email_sms/sms');
var wallet_history = require('../../controllers/user/wallet');
var Store = require('mongoose').model('store');
var Country = require('mongoose').model('country');
var City = require('mongoose').model('city');
var Cart = require('mongoose').model('cart');
var Provider = require('mongoose').model('provider');
var User = require('mongoose').model('user');
var Order = require('mongoose').model('order');
var Vehicle = require('mongoose').model('vehicle');
var Payment_gateway = require('mongoose').model('payment_gateway');
var Order_payment = require('mongoose').model('order_payment');
var Review = require('mongoose').model('review');
var Referral_code = require('mongoose').model('referral_code');
var Request = require('mongoose').model('request');
var Installation_setting = require('mongoose').model('installation_setting');
var geolib = require('geolib');
var console = require('../../utils/console');

//New
var Store_owner = require('mongoose').model('store_owner');

var Service = require('mongoose').model('service');
// store register api 
exports.store_register = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'name',
        type: 'string'
    }, {
        name: 'city_id',
        type: 'string'
    }, {
        name: 'country_id',
        type: 'string'
    },
    {
        name: 'email',
        type: 'string'
    }, {
        name: 'store_delivery_id',
        type: 'string'
    }, {
        name: 'phone',
        type: 'string'
    }, {
        name: 'country_phone_code',
        type: 'string'
    }, {
        name: 'latitude'
    }, {
        name: 'longitude'
    }
    ], function (response) {
        if (response.success) {
            var request_data_body = request_data.body;
            var social_id = request_data_body.social_id;
            var social_id_array = [];

            if (social_id == undefined || social_id == null || social_id == "") {
                social_id = null;
            } else {
                social_id_array.push(social_id);
            }
            Installation_setting.findOne({}).then((installation_setting) => {

                Country.findOne({
                    _id: request_data_body.country_id
                }).then((country) => {
                    if (country) {
                        City.findOne({
                            _id: request_data_body.city_id
                        }).then((city) => {
                            if (city) {
                                var timezone = city.timezone;
                                Store.findOne({
                                    social_ids: {
                                        $all: social_id_array
                                    }
                                }).then((store_data) => {
                                    if (store_data) {
                                        response_data.json({
                                            success: false,
                                            error_code: STORE_ERROR_CODE.STORE_ALREADY_REGISTER_WITH_SOCIAL
                                        });
                                    } else {
                                        // Store.findOne({
                                        //     email: request_data_body.email
                                        // }).then((store_data) => {

                                        // if (store_data) {
                                        //     if (social_id != null && store_data.social_ids.indexOf(social_id) < 0) {
                                        //         store_data.social_ids.push(social_id);
                                        //         store_data.save();
                                        //         response_data.json({
                                        //             success: true,
                                        //             message: STORE_MESSAGE_CODE.REGISTER_SUCCESSFULLY,
                                        //             timezone: timezone,
                                        //             currency: country.currency_sign,
                                        //             minimum_phone_number_length: country.minimum_phone_number_length,
                                        //             maximum_phone_number_length: country.maximum_phone_number_length,
                                        //             store: store_data
                                        //         });

                                        //     } else {

                                        //         response_data.json({
                                        //             success: false,
                                        //             error_code: STORE_ERROR_CODE.EMAIL_ALREADY_REGISTRED
                                        //         });
                                        //     }
                                        // } else {

                                        Store.findOne({
                                            phone: request_data_body.phone
                                        }).then((store_data) => {

                                            if (store_data) {
                                                if (social_id != null && store_data.social_ids.indexOf(social_id) < 0) {

                                                    store_data.social_ids.push(social_id);
                                                    store_data.save();
                                                    response_data.json({
                                                        success: true,
                                                        message: STORE_MESSAGE_CODE.REGISTER_SUCCESSFULLY,
                                                        timezone: timezone,
                                                        currency: country.currency_sign,
                                                        minimum_phone_number_length: country.minimum_phone_number_length,
                                                        maximum_phone_number_length: country.maximum_phone_number_length,
                                                        store: store_data
                                                    });

                                                } else {

                                                    response_data.json({
                                                        success: false,
                                                        error_code: STORE_ERROR_CODE.PHONE_NUMBER_ALREADY_REGISTRED
                                                    });

                                                }

                                            } else {
                                                var name = (request_data_body.name).trim();
                                                name = name.charAt(0).toUpperCase() + name.slice(1);


                                                var server_token = utils.generateServerToken(32);
                                                Store.findOne({}, {}, {
                                                    sort: {
                                                        'created_at': -1
                                                    }
                                                }, function (err, last_store_data) {
                                                    // res.json(store)

                                                    let last_unique_code = last_store_data.store_unique_code.toLowerCase();
                                                    let [empty_string, decimal_count] = last_unique_code.split("av");
                                                    let store_decimal = parseInt(decimal_count, 16) + 1;
                                                    let new_store_unique_code = `AV${store_decimal.toString(16)}`
                                                    let time_zone = city.timezone;
                                                    let beacon_id = utils.generateBeaconId();

                                                    var store_data = new Store({
                                                        store_type: ADMIN_DATA_ID.ADMIN,
                                                        admin_type: ADMIN_DATA_ID.STORE,
                                                        store_type_id: null,
                                                        store_delivery_id: request_data_body.store_delivery_id,
                                                        name: name,
                                                        email: ((request_data_body.email).trim()).toLowerCase(),
                                                        password: request_data_body.password,
                                                        country_phone_code: request_data_body.country_phone_code,
                                                        website_url: request_data_body.website_url,
                                                        slogan: request_data_body.slogan,
                                                        country_id: request_data_body.country_id,
                                                        store_owner_id: request_data_body.store_owner_id,
                                                        city_id: request_data_body.city_id,
                                                        phone: request_data_body.phone,
                                                        address: request_data_body.address,
                                                        famous_for: request_data_body.famous_for,
                                                        app_version: request_data_body.app_version,
                                                        image_url: "",
                                                        device_token: request_data_body.device_token,
                                                        device_type: request_data_body.device_type,
                                                        server_token: server_token,
                                                        is_email_verified: request_data_body.is_email_verified,
                                                        is_phone_number_verified: request_data_body.is_phone_number_verified,
                                                        offer: request_data_body.offer,
                                                        price_rating: 1,
                                                        social_ids: social_id_array,
                                                        login_by: request_data_body.login_by,
                                                        free_delivery_for_above_order_price: request_data_body.free_delivery_for_above_order_price,
                                                        location: [request_data_body.latitude, request_data_body.longitude],
                                                        store_unique_code: new_store_unique_code.toUpperCase(),
                                                        beacon_id: beacon_id,
                                                        timezone: time_zone,
                                                        city: request_data_body.city,
                                                        state: request_data_body.state,
                                                        country: request_data_body.country,
                                                        zip_code: request_data_body.zip_code,
                                                        is_approved: true
                                                    });

                                                    var image_file = request_data.files;

                                                    if (image_file != undefined && image_file.length > 0) {
                                                        var image_name = store_data._id + utils.generateServerToken(4);
                                                        var url = utils.getStoreImageFolderPath(FOLDER_NAME.STORE_PROFILES) + image_name + FILE_EXTENSION.STORE;

                                                        store_data.image_url = url;
                                                        utils.storeImageToFolder(image_file[0].path, image_name + FILE_EXTENSION.STORE, FOLDER_NAME.STORE_PROFILES);

                                                    }

                                                    if (social_id == undefined || social_id == null || social_id == "") {
                                                        store_data.password = utils.encryptPassword(request_data_body.password);
                                                    }


                                                    var timezone = city.timezone;

                                                    if (country && setting_detail) {

                                                        var referral_code = utils.generateReferralCode(ADMIN_DATA_ID.ADMIN, country.country_code, name, name);
                                                        store_data.referral_code = referral_code;

                                                        var wallet_currency_code = country.currency_code;

                                                        var wallet_to_admin_current_rate = 1;

                                                        var referral_bonus_to_store = country.referral_bonus_to_store;
                                                        var referral_bonus_to_store_friend = country.referral_bonus_to_store_friend;

                                                        store_data.wallet_currency_code = wallet_currency_code;

                                                        var country_id = country._id;

                                                        store_data.save().then(() => {

                                                            var url = 'https://api.branch.io/v1/url/';

                                                            var request = require('request');
                                                            var BRANCH_KEY = installation_setting.branch_io_key;
                                                            request({
                                                                uri: url,
                                                                method: "POST",
                                                                form: {
                                                                    branch_key: BRANCH_KEY,
                                                                    stage: "'" + store_data._id + "'"
                                                                }
                                                            }, function (error, response, body) {
                                                                if (!error && body) {
                                                                    var json = JSON.parse(body);
                                                                    store_data.branchio_url = json.url;
                                                                }
                                                                utils.insert_documets_for_new_users(store_data, null, ADMIN_DATA_ID.STORE, country_id, function (document_response) {
                                                                    store_data.is_document_uploaded = document_response.is_document_uploaded;
                                                                    if (request_data_body.referral_code != "") {

                                                                        Store.findOne({
                                                                            referral_code: request_data_body.referral_code
                                                                        }, function (error, store) {

                                                                            if (store) {
                                                                                var store_refferal_count = store.total_referrals;
                                                                                if (store_refferal_count < country.no_of_store_use_referral) {
                                                                                    store.total_referrals = +store.total_referrals + 1;

                                                                                    // Entry in wallet Table //
                                                                                    var total_wallet_amount = wallet_history.add_wallet_history(ADMIN_DATA_ID.STORE, store.unique_id, store._id, store.country_id, wallet_currency_code, wallet_currency_code,
                                                                                        1, referral_bonus_to_store, store.wallet, WALLET_STATUS_ID.ADD_WALLET_AMOUNT, WALLET_COMMENT_ID.ADDED_BY_REFERRAL, "Using Refferal : " + request_data_body.referral_code);


                                                                                    store.wallet = total_wallet_amount;
                                                                                    store.save();

                                                                                    store_data.is_referral = true;
                                                                                    store_data.referred_by = store._id;

                                                                                    // Entry in wallet Table //

                                                                                    var new_total_wallet_amount = wallet_history.add_wallet_history(ADMIN_DATA_ID.STORE, store_data.unique_id, store_data._id, store_data.country_id, wallet_currency_code, wallet_currency_code,
                                                                                        1, referral_bonus_to_store_friend, store_data.wallet, WALLET_STATUS_ID.ADD_WALLET_AMOUNT, WALLET_COMMENT_ID.ADDED_BY_REFERRAL, "Using Refferal : " + request_data_body.referral_code);

                                                                                    store_data.wallet = new_total_wallet_amount;

                                                                                    store_data.save();


                                                                                    // Entry in referral_code Table //
                                                                                    var referral_code = new Referral_code({
                                                                                        user_type: ADMIN_DATA_ID.STORE,
                                                                                        user_id: store._id,
                                                                                        user_unique_id: store.unique_id,
                                                                                        user_referral_code: store.referral_code,
                                                                                        referred_id: store_data._id,
                                                                                        referred_unique_id: store_data.unique_id,
                                                                                        country_id: store_data.country_id,
                                                                                        current_rate: 1,
                                                                                        referral_bonus_to_user_friend: referral_bonus_to_store_friend,
                                                                                        referral_bonus_to_user: referral_bonus_to_store,

                                                                                    });
                                                                                    utils.getCurrencyConvertRate(1, wallet_currency_code, setting_detail.admin_currency_code, function (response) {

                                                                                        if (response.success) {
                                                                                            wallet_to_admin_current_rate = response.current_rate;
                                                                                        } else {
                                                                                            wallet_to_admin_current_rate = 1;
                                                                                        }

                                                                                        wallet_to_admin_current_rate = wallet_to_admin_current_rate;
                                                                                        referral_code.current_rate = wallet_to_admin_current_rate;
                                                                                        referral_code.save();
                                                                                    });
                                                                                }

                                                                            }
                                                                        });

                                                                    } else {
                                                                        store_data.save();
                                                                    }
                                                                });
                                                                if (setting_detail.is_mail_notification) {
                                                                    //sendStoreRegisterEmail
                                                                    emails.sendStoreRegisterEmail(request_data, store_data, store_data.name);
                                                                }

                                                                response_data.json({
                                                                    success: true,
                                                                    message: STORE_MESSAGE_CODE.REGISTER_SUCCESSFULLY,
                                                                    timezone: timezone,
                                                                    currency: country.currency_sign,
                                                                    minimum_phone_number_length: country.minimum_phone_number_length,
                                                                    maximum_phone_number_length: country.maximum_phone_number_length,
                                                                    store: store_data
                                                                });
                                                            });

                                                        }, (error) => {
                                                            console.log(error)
                                                            response_data.json({
                                                                success: false,
                                                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                            });
                                                        });
                                                    }

                                                })
                                            }
                                        });
                                        // }

                                        // });
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

// store login
exports.store_login = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'store_id',
        type: 'string'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var store_id = request_data_body.store_id;
            var server_token = request_data_body.server_token
            // var encrypted_password = request_data_body.password;
            // if (!encrypted_password) {
            //     encrypted_password = "";
            // }
            // if (encrypted_password) {
            Store.findById(store_id).then((store_detail) => {
                if (store_detail) {
                    // if (server_token != store_detail.server_token) {
                    //     response_data.json({
                    //         success: false,
                    //         error_code: STORE_ERROR_CODE.INVALID_PASSWORD
                    //     });
                    // } else {
                    Country.findOne({
                        _id: store_detail.country_id
                    }).then((country) => {

                        City.findOne({
                            _id: store_detail.city_id
                        }).then((city) => {

                            var timezone = city.timezone;

                            var device_token = "";
                            var device_type = "";
                            if (store_detail.device_token != "" && store_detail.device_token != request_data_body.device_token) {
                                device_token = store_detail.device_token;
                                device_type = store_detail.device_type;
                            }

                            if (request_data_body.device_type == DEVICE_TYPE.ANDROID || request_data_body.device_type == DEVICE_TYPE.IOS) {
                                store_detail.device_token = request_data_body.device_token;

                            } else {
                                Order.update({
                                    store_notify: 0,
                                    store_id: store_detail._id
                                }, {
                                    store_notify: 1
                                }, {
                                    multi: true
                                }, function (error, order) { });
                            }

                            store_detail.device_type = request_data_body.device_type;
                            var server_token = utils.generateServerToken(32);
                            store_detail.server_token = server_token;
                            store_detail.login_by = request_data_body.login_by;
                            store_detail.app_version = request_data_body.app_version;
                            store_detail.save().then(() => {
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

                                    store: store_detail

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


                    // }

                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.NOT_A_REGISTERED
                    });
                }

            }, (error) => {
                console.log(error)
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            });
            // } else {
            //     response_data.json({
            //         success: false,
            //         error_code: STORE_ERROR_CODE.LOGIN_FAILED
            //     });
            // }
        }
        else {
            response_data.json(response);
        }
    });
};

//store_update
exports.store_update = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {
            var request_data_body = request_data.body;
            var store_id = request_data_body.store_id;
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

            Store.findOne({
                _id: store_id
            }).then((store) => {

                if (store) {

                    if (request_data_body.type !== ADMIN_DATA_ID.ADMIN && request_data_body.server_token !== null && store.server_token !== request_data_body.server_token) {

                        response_data.json({
                            success: false,
                            error_code: STORE_ERROR_CODE.INVALID_SERVER_TOKEN
                        });

                    } else if (request_data_body.type !== ADMIN_DATA_ID.ADMIN && social_id == null && old_password != "" && old_password != store.password) {

                        response_data.json({
                            success: false,
                            error_code: STORE_ERROR_CODE.INVALID_PASSWORD
                        });

                    } else if (request_data_body.type !== ADMIN_DATA_ID.ADMIN && social_id != null && store.social_ids.indexOf(social_id) < 0) {

                        response_data.json({
                            success: false,
                            error_code: STORE_ERROR_CODE.STORE_NOT_REGISTER_WITH_SOCIAL
                        });

                    } else {
                        Country.findOne({
                            _id: store.country_id
                        }).then((country) => {
                            City.findOne({
                                _id: store.city_id
                            }).then((city) => {

                                var timezone = city.timezone;
                                var new_email = request_data_body.email;
                                var new_phone = request_data_body.phone;
                                if (request_data_body.new_password != "" && request_data_body.new_password != undefined) {
                                    var new_password = utils.encryptPassword(request_data_body.new_password);
                                    request_data_body.password = new_password;
                                }

                                if (request_data_body.latitude != undefined && request_data_body.longitude != undefined) {
                                    request_data_body.location = [request_data_body.latitude, request_data_body.longitude];
                                }

                                request_data_body.social_ids = store.social_ids;

                                Store.findOne({
                                    _id: {
                                        '$ne': store_id
                                    },
                                    email: new_email
                                }).then((store_details) => {

                                    var is_update = false;
                                    if (store_details) {
                                        if (setting_detail.is_store_mail_verification) {
                                            if (store_details.is_email_verified == false) {
                                                is_update = true;
                                                store_details.email = "notverified" + store_details.email;
                                                store_details.save();

                                            }
                                        }
                                    } else {
                                        is_update = true;
                                    }

                                    if (is_update == true) {
                                        is_update = false;
                                        Store.findOne({
                                            _id: {
                                                '$ne': store_id
                                            },
                                            phone: new_phone
                                        }).then((store_phone_details) => {
                                            if (store_phone_details) {
                                                if (setting_detail.is_store_sms_verification) {
                                                    if (store_phone_details.is_phone_number_verified == false) {
                                                        is_update = true;
                                                        store_phone_details.phone = "00" + store_phone_details.phone;
                                                        store_phone_details.save();

                                                    }
                                                }
                                            } else {
                                                is_update = true;
                                            }
                                            if (is_update == true) {
                                                var social_id_array = [];
                                                if (social_id != null) {
                                                    social_id_array.push(social_id);
                                                }
                                                store_update_query = {
                                                    '_id': store_id
                                                };
                                                delete request_data_body.unique_id;
                                                Store.findOneAndUpdate(store_update_query, request_data_body, {
                                                    new: true
                                                }).then((store_data) => {

                                                    if (store_data) {
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


                                                        if (request_data_body.is_phone_number_verified != undefined) {
                                                            store_data.is_phone_number_verified = request_data_body.is_phone_number_verified;
                                                        } else if (request_data_body.is_email_verified != undefined) {
                                                            store_data.is_email_verified = request_data_body.is_email_verified;
                                                        } else if (request_data_body.is_phone_number_verified != undefined && request_data_body.is_email_verified != undefined) {
                                                            store_data.is_phone_number_verified = request_data_body.is_phone_number_verified;
                                                            store_data.is_email_verified = request_data_body.is_email_verified;
                                                        }
                                                        store_data.save();


                                                        response_data.json({
                                                            success: true,
                                                            message: STORE_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
                                                            timezone: timezone,
                                                            currency: country.currency_sign,
                                                            minimum_phone_number_length: country.minimum_phone_number_length,
                                                            maximum_phone_number_length: country.maximum_phone_number_length,

                                                            store: store_data

                                                        });

                                                    } else {
                                                        response_data.json({
                                                            success: false,
                                                            error_code: STORE_ERROR_CODE.UPDATE_FAILED
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
                                                response_data.json({
                                                    success: false,
                                                    error_code: STORE_ERROR_CODE.PHONE_NUMBER_ALREADY_REGISTRED
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
                                        response_data.json({
                                            success: false,
                                            error_code: STORE_ERROR_CODE.EMAIL_ALREADY_REGISTRED
                                        });
                                    }
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
                    }
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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

/// store_otp_verification
exports.store_otp_verification = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store) => {
                if (store) {
                    if (request_data_body.server_token !== null && store.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });

                    } else {
                        if (request_data_body.is_phone_number_verified != undefined) {
                            store.is_phone_number_verified = request_data_body.is_phone_number_verified;
                            if (store.phone != request_data_body.phone) {
                                Store.findOne({
                                    phone: request_data_body.phone
                                }).then((store_phone_detail) => {
                                    if (store_phone_detail) {
                                        store_phone_detail.phone = "00" + store_phone_detail.phone;
                                        store_phone_detail.save();
                                    }

                                });

                            }
                            store.phone = request_data_body.phone;
                            store.save();

                        } else if (request_data_body.is_email_verified != undefined) {
                            store.is_email_verified = request_data_body.is_email_verified;
                            if (store.email != request_data_body.email) {
                                Store.findOne({
                                    email: request_data_body.email
                                }).then((store_email_detail) => {
                                    if (store_email_detail) {
                                        store_email_detail.email = "notverified" + store_email_detail.email;
                                        store_email_detail.save();
                                    }

                                });

                            }

                            store.email = request_data_body.email;
                            store.save();

                        } else if (request_data_body.is_phone_number_verified != undefined && request_data_body.is_email_verified != undefined) {

                            store.is_phone_number_verified = request_data_body.is_phone_number_verified;
                            if (store.phone != request_data_body.phone) {
                                Store.findOne({
                                    phone: request_data_body.phone
                                }).then((store_phone_detail) => {
                                    if (store_phone_detail) {
                                        store_phone_detail.phone = "00" + store_phone_detail.phone;
                                        store_phone_detail.save();
                                    }

                                });

                            }
                            store.is_email_verified = request_data_body.is_email_verified;
                            if (store.phone != request_data_body.phone) {
                                Store.findOne({
                                    email: request_data_body.email
                                }).then((store_email_detail) => {
                                    if (store_email_detail) {
                                        store_email_detail.email = "notverified" + store_email_detail.email;
                                        store_email_detail.save();
                                    }

                                });

                            }
                            store.phone = request_data_body.phone;
                            store.email = request_data_body.email;
                            store.save();

                        }

                        store.save().then(() => {
                            response_data.json({
                                success: true,
                                message: STORE_MESSAGE_CODE.OTP_VERIFICATION_SUCCESSFULLY
                            });
                        }, (error) => {
                            console.log(error)
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }

                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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

// store get_detail
exports.get_detail = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store) => {
                if (store) {
                    // if (store.is_approved) {
                    if (request_data_body.server_token !== null && store.server_token != request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });
                    } else {
                        Country.findOne({
                            _id: store.country_id
                        }).then((country) => {
                            City.findOne({
                                _id: store.city_id
                            }).then((city) => {

                                var timezone = city.timezone;
                                store.app_version = request_data_body.app_version;
                                if (request_data_body.device_token != undefined) {
                                    store.device_token = request_data_body.device_token;
                                }


                                store.save().then(() => {
                                    response_data.json({
                                        success: true,
                                        message: STORE_MESSAGE_CODE.GET_DETAIL_SUCCESSFULLY,
                                        timezone: timezone,
                                        currency: country.currency_sign,
                                        minimum_phone_number_length: country.minimum_phone_number_length,
                                        maximum_phone_number_length: country.maximum_phone_number_length,
                                        store: store
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
                    }
                    // } else {
                    //     response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
                    // }

                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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

// update device token 
exports.update_device_token = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'device_token',
        type: 'string'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store) => {
                if (store) {
                    if (request_data_body.server_token !== null && store.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });
                    } else {
                        store.device_token = request_data_body.device_token;
                        store.save().then(() => {
                            response_data.json({
                                success: true,
                                message: STORE_MESSAGE_CODE.DEVICE_TOKEN_UPDATE_SUCCESSFULLY
                            });
                        }, (error) => {
                            console.log(error)
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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

// logout api 
exports.logout = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store) => {
                if (store) {
                    if (request_data_body.server_token !== null && store.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });

                    } else {
                        store.device_token = "";
                        store.server_token = "";
                        store.save().then(() => {
                            response_data.json({
                                success: true,
                                message: STORE_MESSAGE_CODE.LOGOUT_SUCCESSFULLY
                            });

                        }, (error) => {
                            console.log(error)
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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

// store get order_list
exports.order_list = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });
                    } else {
                        Country.findOne({
                            _id: store_detail.country_id
                        }).then((country_detail) => {
                            if (country_detail) {
                                var currency = country_detail.currency_sign;
                                var user_query = {
                                    $lookup: {
                                        from: "users",
                                        localField: "user_id",
                                        foreignField: "_id",
                                        as: "user_detail"
                                    }
                                };
                                var array_to_json_user_query = {
                                    $unwind: "$user_detail"
                                };

                                var order_payment_query = {
                                    $lookup: {
                                        from: "order_payments",
                                        localField: "order_payment_id",
                                        foreignField: "_id",
                                        as: "order_payment_detail"
                                    }
                                };
                                var array_to_json_order_payment_query = {
                                    $unwind: "$order_payment_detail"
                                };

                                var cart_query = {
                                    $lookup: {
                                        from: "carts",
                                        localField: "cart_id",
                                        foreignField: "_id",
                                        as: "cart_detail"
                                    }
                                };
                                var array_to_json_cart_query = {
                                    $unwind: "$cart_detail"
                                };

                                var sort = {
                                    "$sort": {}
                                };
                                sort["$sort"]['unique_id'] = parseInt(-1);
                                var store_condition = {
                                    "$match": {
                                        'store_id': {
                                            $eq: mongoose.Types.ObjectId(request_data_body.store_id)
                                        }
                                    }
                                };
                                //var order_status_condition = {$match: {$and: [{order_status: {$lte: ORDER_STATE.ORDER_READY}}, {order_status: {$ne: ORDER_STATE.STORE_REJECTED}}]}};

                                var order_status_condition = {
                                    $match: {
                                        $and: [{
                                            order_status: {
                                                $ne: ORDER_STATE.STORE_REJECTED
                                            }
                                        },
                                        {
                                            order_status: {
                                                $ne: ORDER_STATE.STORE_CANCELLED
                                            }
                                        },
                                        {
                                            order_status: {
                                                $ne: ORDER_STATE.CANCELED_BY_USER
                                            }
                                        },
                                        {
                                            order_status: {
                                                $ne: ORDER_STATE.ORDER_COMPLETED
                                            }
                                        },
                                        {
                                            $or: [{
                                                order_status: {
                                                    $lt: ORDER_STATE.ORDER_READY
                                                }
                                            },
                                            {
                                                request_id: null
                                            }
                                            ]
                                        }
                                        ]
                                    }
                                }
                                //var request_id_condition = {"$match": {'request_id': null}};
                                Order.aggregate([store_condition, order_status_condition, user_query, order_payment_query, array_to_json_user_query, array_to_json_order_payment_query, cart_query, array_to_json_cart_query, sort]).then((orders) => {
                                    if (orders.length == 0) {
                                        response_data.json({
                                            success: false,
                                            error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND
                                        });
                                    } else {
                                        var lookup = {
                                            $lookup: {
                                                from: "vehicles",
                                                localField: "vehicle_id",
                                                foreignField: "_id",
                                                as: "vehicle_detail"
                                            }
                                        };
                                        var unwind = {
                                            $unwind: "$vehicle_detail"
                                        };
                                        var group = {
                                            $group: {
                                                _id: null,
                                                vehicles: {
                                                    $push: {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$admin_type", ADMIN_DATA_ID.STORE]
                                                            },
                                                            then: '$vehicle_detail',
                                                            else: null,
                                                        }
                                                    }
                                                },
                                                admin_vehicles: {
                                                    $push: {
                                                        $cond: {
                                                            if: {
                                                                $eq: ["$admin_type", ADMIN_DATA_ID.ADMIN]
                                                            },
                                                            then: '$vehicle_detail',
                                                            else: null,
                                                        }
                                                    }
                                                },
                                            }
                                        }
                                        var condition = {
                                            $match: {
                                                'city_id': {
                                                    $eq: store_detail.city_id
                                                }
                                            }
                                        };
                                        var type_condition = {
                                            $match: {
                                                $or: [{
                                                    'type_id': {
                                                        $eq: store_detail._id
                                                    }
                                                }, {
                                                    'type_id': {
                                                        $eq: null
                                                    }
                                                }]
                                            }
                                        };
                                        var condition1 = {
                                            $match: {
                                                'is_business': {
                                                    $eq: true
                                                }
                                            }
                                        };
                                        var vehicle_condition = {
                                            $match: {
                                                'vehicle_detail.is_business': {
                                                    $eq: true
                                                }
                                            }
                                        };
                                        var delivery_type_query = {
                                            $match: {
                                                delivery_type: {
                                                    $eq: 1
                                                }
                                            }
                                        };

                                        Service.aggregate([condition, type_condition, condition1, delivery_type_query, lookup, unwind, group]).then((services) => {
                                            if (services.length > 0) {
                                                services[0].admin_vehicles = services[0].admin_vehicles.filter(v => v != null);
                                                services[0].vehicles = services[0].vehicles.filter(v => v != null);
                                                response_data.json({
                                                    success: true,
                                                    message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                                                    currency: currency,
                                                    orders: orders,
                                                    admin_vehicles: services[0].admin_vehicles,
                                                    vehicles: services[0].vehicles
                                                });
                                            } else {
                                                response_data.json({
                                                    success: true,
                                                    message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                                                    currency: currency,
                                                    orders: orders,
                                                    admin_vehicles: [],
                                                    vehicles: []
                                                });
                                            }
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
                        });
                    }
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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

//get_store_data
exports.get_store_data = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store) => {
                if (store) {
                    if (request_data_body.type !== ADMIN_DATA_ID.ADMIN && (request_data_body.server_token !== null && store.server_token !== request_data_body.server_token)) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });

                    } else {
                        var country_query = {
                            $lookup: {
                                from: "countries",
                                localField: "country_id",
                                foreignField: "_id",
                                as: "country_details"
                            }
                        };

                        var array_to_json = {
                            $unwind: "$country_details"
                        };
                        var city_query = {
                            $lookup: {
                                from: "cities",
                                localField: "city_id",
                                foreignField: "_id",
                                as: "city_details"
                            }
                        };

                        var array_to_json1 = {
                            $unwind: "$city_details"
                        };
                        var delivery_query = {
                            $lookup: {
                                from: "deliveries",
                                localField: "store_delivery_id",
                                foreignField: "_id",
                                as: "delivery_details"
                            }
                        };
                        var array_to_json2 = {
                            $unwind: "$delivery_details"
                        };
                        var condition = {
                            "$match": {
                                '_id': {
                                    $eq: mongoose.Types.ObjectId(request_data_body.store_id)
                                }
                            }
                        };

                        Store.aggregate([condition, country_query, city_query, delivery_query, array_to_json, array_to_json1, array_to_json2]).then((store_detail) => {

                            if (store_detail.length != 0) {

                                var store_condition = {
                                    "$match": {
                                        'store_id': {
                                            $eq: mongoose.Types.ObjectId(request_data_body.store_id)
                                        }
                                    }
                                };
                                var group = {
                                    $group: {
                                        _id: null,
                                        total_orders: {
                                            $sum: 1
                                        },
                                        accepted_orders: {
                                            $sum: {
                                                $cond: [{
                                                    $and: [{
                                                        $gte: ["$order_status", ORDER_STATE.STORE_ACCEPTED]
                                                    }, {
                                                        $gte: ["$order_status", ORDER_STATE.STORE_ACCEPTED]
                                                    }]
                                                }, 1, 0]
                                            }
                                        },
                                        completed_orders: {
                                            $sum: {
                                                $cond: [{
                                                    $eq: ["$order_status_id", ORDER_STATUS_ID.COMPLETED]
                                                }, 1, 0]
                                            }
                                        },
                                        cancelled_orders: {
                                            $sum: {
                                                $cond: [{
                                                    $eq: ["$order_status_id", ORDER_STATUS_ID.CANCELLED]
                                                }, 1, 0]
                                            }
                                        }
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
                                });
                            } else {
                                response_data.json({
                                    success: false,
                                    error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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

//update store time
exports.update_store_time = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'store_time'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var store_id = request_data_body.store_id;
            var old_password = request_data_body.old_password;
            var social_id = request_data_body.social_id;

            if (social_id == undefined || social_id == null || social_id == "") {
                social_id = null;
            }

            if (old_password == undefined || old_password == null || old_password == "") {
                old_password = "";
            } else {
                old_password = utils.encryptPassword(old_password);
            }

            Store.findOne({
                _id: request_data_body.store_id
            }).then((store) => {

                if (store) {
                    if (request_data_body.type !== ADMIN_DATA_ID.ADMIN && request_data_body.server_token !== null && store.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });
                    } else if (social_id == null && old_password != "" && old_password != store.password) {

                        response_data.json({
                            success: false,
                            error_code: STORE_ERROR_CODE.INVALID_PASSWORD
                        });

                    } else if (social_id != null && store.social_ids.indexOf(social_id) < 0) {

                        response_data.json({
                            success: false,
                            error_code: STORE_ERROR_CODE.STORE_NOT_REGISTER_WITH_SOCIAL
                        });

                    } else {

                        // request_data_body.store_time.sort(sortStoreTime);
                        Store.findOneAndUpdate({
                            _id: store_id
                        }, request_data_body, {
                            new: true
                        }).then((store_data) => {

                            if (store_data) {
                                response_data.json({
                                    success: true,
                                    message: STORE_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
                                    store: store_data

                                });
                            } else {
                                response_data.json({
                                    success: false,
                                    error_code: STORE_ERROR_CODE.UPDATE_FAILED
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
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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


// order_history
exports.order_history = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'start_date',
        type: 'string'
    }, {
        name: 'end_date',
        type: 'string'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store) => {
                if (store) {
                    if (request_data_body.server_token !== null && store.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });
                    } else {
                        var city_id = store.city_id;
                        City.findOne({
                            _id: city_id
                        }).then((city) => {
                            if (city) {
                                var city_timezone = city.timezone;

                                var start_date = null,
                                    end_date = null;

                                if (request_data_body.start_date == '') {
                                    start_date = new Date(0);
                                } else {
                                    start_date = request_data_body.start_date;
                                }

                                if (request_data_body.end_date == '') {
                                    end_date = new Date();
                                } else {
                                    end_date = request_data_body.end_date;
                                }

                                start_date = new Date(start_date);
                                start_date = start_date.setHours(0, 0, 0, 0);
                                start_date = new Date(start_date);

                                end_date = new Date(end_date);
                                end_date = end_date.setHours(23, 59, 59, 999);
                                end_date = new Date(end_date);


                                var store_condition = {
                                    "$match": {
                                        'store_id': {
                                            $eq: mongoose.Types.ObjectId(request_data_body.store_id)
                                        }
                                    }
                                };
                                var order_status_condition = {
                                    "$match": {
                                        $or: [{
                                            order_status: ORDER_STATE.ORDER_COMPLETED
                                        }, {
                                            order_status: ORDER_STATE.STORE_CANCELLED
                                        }, {
                                            order_status: ORDER_STATE.CANCELED_BY_USER
                                        }, {
                                            order_status: ORDER_STATE.STORE_REJECTED
                                        }]
                                    }
                                };

                                var filter = {
                                    "$match": {
                                        "completed_date_in_city_timezone": {
                                            $gte: start_date,
                                            $lt: end_date
                                        }
                                    }
                                };

                                Order.aggregate([store_condition, filter, order_status_condition,
                                    {
                                        $lookup: {
                                            from: "users",
                                            localField: "user_id",
                                            foreignField: "_id",
                                            as: "user_detail"
                                        }
                                    },
                                    {
                                        "$unwind": "$user_detail"
                                    },
                                    {
                                        $lookup: {
                                            from: "order_payments",
                                            localField: "order_payment_id",
                                            foreignField: "_id",
                                            as: "order_payment_detail"
                                        }
                                    },
                                    {
                                        "$unwind": "$order_payment_detail"
                                    },

                                    {
                                        $lookup: {
                                            from: "cities",
                                            localField: "city_id",
                                            foreignField: "_id",
                                            as: "city_detail"
                                        }
                                    },
                                    {
                                        "$unwind": "$city_detail"
                                    },

                                    {
                                        $lookup: {
                                            from: "countries",
                                            localField: "city_detail.country_id",
                                            foreignField: "_id",
                                            as: "country_detail"
                                        }
                                    },
                                    {
                                        "$unwind": "$country_detail"
                                    },
                                    {
                                        $lookup: {
                                            from: "requests",
                                            localField: "request_id",
                                            foreignField: "_id",
                                            as: "request_detail"
                                        }
                                    },
                                    {
                                        $unwind: {
                                            path: "$request_detail",
                                            preserveNullAndEmptyArrays: true
                                        }
                                    },

                                    {
                                        $project: {
                                            created_at: "$created_at",
                                            order_status: "$order_status",
                                            store_profit: "$order_payment_detail.total_store_income",
                                            total: "$order_payment_detail.total",
                                            total_service_price: "$order_payment_detail.total_service_price",
                                            completed_at: "$completed_at",
                                            unique_id: "$unique_id",
                                            total_order_price: "$order_payment_detail.total_order_price",
                                            currency: "$country_detail.currency_sign",
                                            request_detail: {
                                                created_at: "$request_detail.created_at",
                                                request_unique_id: "$request_detail.unique_id",
                                                delivery_status: "$request_detail.delivery_status",
                                                delivery_status_manage_id: "$request_detail.delivery_status_manage_id",
                                            },
                                            user_detail: {
                                                first_name: "$user_detail.first_name",
                                                last_name: "$user_detail.last_name",
                                                image_url: "$user_detail.image_url"
                                            }
                                        }
                                    },
                                ]).then((orders) => {

                                    if (orders.length == 0) {
                                        response_data.json({
                                            success: false,
                                            error_code: STORE_ERROR_CODE.ORDER_HISTORY_NOT_FOUND
                                        });
                                    } else {
                                        response_data.json({
                                            success: true,
                                            message: STORE_MESSAGE_CODE.ORDER_HISTORY_SUCCESSFULLY,
                                            order_list: orders
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

                    }
                } else {

                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
                    });

                }
            });
        } else {
            response_data.json(response);
        }
    });
};
// store order_history_detail
exports.order_history_detail = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'order_id',
        type: 'string'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store) => {
                if (store) {
                    if (request_data_body.server_token !== null && store.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });

                    } else {
                        Order.findOne({
                            _id: request_data_body.order_id
                        }).then((order_detail) => {
                            if (order_detail) {
                                var country_id = order_detail.country_id;
                                if (order_detail.country_id == null && order_detail.country_id == undefined) {
                                    country_id = store.country_id;
                                }

                                Country.findOne({
                                    _id: country_id
                                }).then((country) => {
                                    var currency = "";
                                    if (country) {
                                        currency = country.currency_sign;
                                    }
                                    User.findOne({
                                        _id: order_detail.user_id
                                    }).then((user_data) => {
                                        var current_provider = null;
                                        Request.findOne({
                                            _id: order_detail.request_id
                                        }).then((request_data) => {
                                            if (request_data) {
                                                current_provider = request_data.current_provider;
                                            }
                                            Provider.findOne({
                                                _id: current_provider
                                            }).then((provider_data) => {
                                                Order_payment.findOne({
                                                    _id: order_detail.order_payment_id
                                                }).then((order_payment) => {
                                                    Payment_gateway.findOne({
                                                        _id: order_payment.payment_id
                                                    }).then((payment_gateway) => {
                                                        var payment_gateway_name = "Cash";
                                                        if (order_payment.is_payment_mode_cash == false) {
                                                            payment_gateway_name = payment_gateway.name;
                                                        }

                                                        var provider_detail = {};
                                                        var user_detail = {};

                                                        if (user_data) {
                                                            user_detail = {
                                                                first_name: user_data.first_name,
                                                                last_name: user_data.last_name,
                                                                image_url: user_data.image_url,
                                                            }
                                                        }

                                                        if (provider_data) {
                                                            provider_detail = {
                                                                first_name: provider_data.first_name,
                                                                last_name: provider_data.last_name,
                                                                image_url: provider_data.image_url
                                                            }
                                                        }


                                                        var order_payment_query = {
                                                            $lookup: {
                                                                from: "order_payments",
                                                                localField: "order_payment_id",
                                                                foreignField: "_id",
                                                                as: "order_payment_detail"
                                                            }
                                                        };
                                                        var array_to_json_order_payment = {
                                                            $unwind: "$order_payment_detail"
                                                        };

                                                        var cart_query = {
                                                            $lookup: {
                                                                from: "carts",
                                                                localField: "cart_id",
                                                                foreignField: "_id",
                                                                as: "cart_detail"
                                                            }
                                                        };

                                                        var array_to_json_cart_query = {
                                                            $unwind: "$cart_detail"
                                                        };


                                                        var store_condition = {
                                                            "$match": {
                                                                'store_id': {
                                                                    $eq: mongoose.Types.ObjectId(request_data_body.store_id)
                                                                }
                                                            }
                                                        };
                                                        var order_condition = {
                                                            "$match": {
                                                                '_id': {
                                                                    $eq: mongoose.Types.ObjectId(request_data_body.order_id)
                                                                }
                                                            }
                                                        };
                                                        //var order_status_condition = {"$match": {'order_status': {$eq: ORDER_STATE.ORDER_COMPLETED}}};
                                                        //var order_status_id_condition = {"$match": {'order_status_id': {$eq: ORDER_STATUS_ID.COMPLETED}}};

                                                        var order_status_condition = {
                                                            $match: {
                                                                $or: [{
                                                                    order_status: {
                                                                        $eq: ORDER_STATE.STORE_REJECTED
                                                                    }
                                                                },
                                                                {
                                                                    order_status: {
                                                                        $eq: ORDER_STATE.CANCELED_BY_USER
                                                                    }
                                                                },
                                                                {
                                                                    order_status: {
                                                                        $eq: ORDER_STATE.STORE_CANCELLED
                                                                    }
                                                                },
                                                                {
                                                                    order_status: {
                                                                        $eq: ORDER_STATE.ORDER_COMPLETED
                                                                    }
                                                                }

                                                                ]
                                                            }
                                                        };

                                                        var order_status_id_condition = {
                                                            $match: {

                                                                $or: [{
                                                                    order_status_id: {
                                                                        $eq: ORDER_STATUS_ID.CANCELLED
                                                                    }
                                                                },
                                                                {
                                                                    order_status_id: {
                                                                        $eq: ORDER_STATUS_ID.REJECTED
                                                                    }
                                                                },
                                                                {
                                                                    order_status_id: {
                                                                        $eq: ORDER_STATUS_ID.COMPLETED
                                                                    }
                                                                },
                                                                ]

                                                            }
                                                        };

                                                        Order.aggregate([order_condition, store_condition, order_status_condition, order_status_id_condition, order_payment_query, cart_query, array_to_json_order_payment, array_to_json_cart_query]).then((orders) => {
                                                            if (orders.length == 0) {
                                                                response_data.json({
                                                                    success: false,
                                                                    error_code: STORE_ERROR_CODE.ORDER_DETAIL_NOT_FOUND
                                                                });
                                                            } else {
                                                                response_data.json({
                                                                    success: true,
                                                                    message: STORE_MESSAGE_CODE.GET_STORE_ORDER_DETAIL_SUCCESSFULLY,
                                                                    currency: currency,
                                                                    user_detail: user_detail,
                                                                    provider_detail: provider_detail,
                                                                    payment_gateway_name: payment_gateway_name,
                                                                    order_list: orders[0]
                                                                });
                                                            }

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
                                }, (error) => {
                                    console.log(error)
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
                                });

                            } else {
                                response_data.json({
                                    success: false,
                                    error_code: STORE_ERROR_CODE.ORDER_DETAIL_NOT_FOUND
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
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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

// store order_payment_status_set_on_cash_on_delivery
exports.order_payment_status_set_on_cash_on_delivery = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'order_payment_id',
        type: 'string'
    }, {
        name: 'is_order_price_paid_by_store'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store) => {

                if (store) {
                    if (request_data_body.server_token !== null && store.server_token != request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });
                    } else {

                        Order_payment.findOne({
                            _id: request_data_body.order_payment_id,
                            store_id: request_data_body.store_id
                        }).then((order_payment) => {
                            if (order_payment) {
                                if (order_payment.is_payment_mode_cash == true) {

                                    order_payment.is_order_price_paid_by_store = request_data_body.is_order_price_paid_by_store;
                                    order_payment.is_order_payment_status_set_by_store = true;

                                    var store_have_service_payment = 0;
                                    var store_have_order_payment = 0;
                                    var total_store_have_payment = 0;
                                    var pay_to_store = 0;

                                    if (store.is_store_pay_delivery_fees && order_payment.total_order_price >= store.free_delivery_for_above_order_price) {
                                        store_have_service_payment = order_payment.total_delivery_price;
                                        store_have_service_payment = utils.precisionRoundTwo(store_have_service_payment);
                                    }

                                    if (order_payment.is_order_price_paid_by_store == false) {
                                        store_have_order_payment = order_payment.total_order_price;
                                        store_have_order_payment = utils.precisionRoundTwo(store_have_order_payment);
                                    }
                                    var other_promo_payment_loyalty = order_payment.other_promo_payment_loyalty;
                                    total_store_have_payment = +store_have_service_payment + +store_have_order_payment;
                                    pay_to_store = order_payment.total_store_income - total_store_have_payment - other_promo_payment_loyalty;

                                    var provider_have_cash_payment = order_payment.cash_payment;
                                    var provider_paid_order_payment = 0;
                                    var total_provider_have_payment = 0;
                                    var pay_to_provider = 0;

                                    if (request_data_body.is_order_price_paid_by_store == false) {

                                        provider_paid_order_payment = order_payment.total_order_price;
                                    } else {
                                        provider_paid_order_payment = 0;
                                    }

                                    total_provider_have_payment = provider_have_cash_payment - provider_paid_order_payment;
                                    pay_to_provider = order_payment.total_provider_income - total_provider_have_payment;

                                    order_payment.pay_to_store = pay_to_store;

                                    order_payment.pay_to_provider = pay_to_provider;

                                    order_payment.save().then(() => {
                                        response_data.json({
                                            success: true,
                                            message: STORE_MESSAGE_CODE.PAY_BY_CASH_ON_DELIVERY_SUCCESSFULLY

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
                                        success: false,
                                        error_code: STORE_ERROR_CODE.PAY_BY_CASH_ON_DELIVERY_FAILED
                                    });

                                }
                            } else {
                                response_data.json({
                                    success: false,
                                    error_code: STORE_ERROR_CODE.PAY_BY_CASH_ON_DELIVERY_FAILED
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

                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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

/// check_order_status
exports.check_order_status = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'order_id',
        type: 'string'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });
                    } else {
                        Order.findOne({
                            _id: request_data_body.order_id,
                            store_id: request_data_body.store_id
                        }).then((order) => {
                            if (order) {
                                var vehicle_detail = {};
                                var provider_detail = {};

                                var bearing = 0;
                                var image_url = "";
                                var first_name = "";
                                var last_name = "";
                                var phone = "";
                                var user_rate = 0;
                                var country_phone_code = "";
                                var location = [];


                                var unique_id = 0;
                                var vehicle_name = "";
                                var description = "";
                                var map_pin_image_url = "";
                                var is_business = false;


                                var current_provider = null;
                                Request.findOne({
                                    _id: order.request_id
                                }).then((request) => {
                                    if (request) {
                                        current_provider = request.current_provider;
                                    }

                                    Country.findOne({
                                        _id: store_detail.country_id
                                    }).then((country_detail) => {
                                        var currency = country_detail.currency_sign;
                                        Cart.findOne({
                                            _id: order.cart_id,
                                            store_id: request_data_body.store_id
                                        }).then((cart) => {
                                            if (cart) {

                                                Order_payment.findOne({
                                                    _id: order.order_payment_id,
                                                    order_id: order._id
                                                }).then((order_payment) => {
                                                    if (order_payment) {
                                                        var order_datail = {
                                                            _id: order._id,
                                                            unique_id: order.unique_id,
                                                            order_payment_id: order.order_payment_id,
                                                            user_id: order.user_id,
                                                            provider_id: current_provider,
                                                            current_provider: order.current_provider,
                                                            is_user_pick_up_order: order_payment.is_user_pick_up_order,
                                                            is_confirmation_code_required_at_pickup_delivery: setting_detail.is_confirmation_code_required_at_pickup_delivery,
                                                            is_confirmation_code_required_at_complete_delivery: setting_detail.is_confirmation_code_required_at_complete_delivery,
                                                            confirmation_code_for_complete_delivery: order.confirmation_code_for_complete_delivery,
                                                            confirmation_code_for_pick_up_delivery: order.confirmation_code_for_pick_up_delivery,
                                                            pickup_addresses: cart.pickup_addresses,
                                                            destination_addresses: cart.destination_addresses,
                                                            currency: currency,
                                                            request_id: order.request_id,
                                                            order_status: order.order_status,
                                                            total_order_price: order_payment.total_order_price,
                                                            created_at: order.created_at,
                                                            provider_location: location,
                                                            bearing: bearing


                                                        }
                                                        Provider.findOne({
                                                            _id: current_provider
                                                        }).then((provider) => {
                                                            if (provider) {


                                                                Vehicle.findOne({
                                                                    _id: provider.vehicle_id
                                                                }).then((vehicle) => {


                                                                    if (provider) {
                                                                        provider_detail = {
                                                                            bearing: provider.bearing,
                                                                            image_url: provider.image_url,
                                                                            first_name: provider.first_name,
                                                                            last_name: provider.last_name,
                                                                            phone: provider.phone,
                                                                            country_phone_code: provider.country_phone_code,
                                                                            user_rate: provider.user_rate,
                                                                            location: provider.location
                                                                        }
                                                                    }

                                                                    if (vehicle) {
                                                                        vehicle_detail = {
                                                                            unique_id: vehicle.unique_id,
                                                                            vehicle_name: vehicle.vehicle_name,
                                                                            description: vehicle.description,
                                                                            image_url: vehicle.image_url,
                                                                            map_pin_image_url: vehicle.map_pin_image_url,
                                                                            is_business: vehicle.is_business
                                                                        }
                                                                    }

                                                                    response_data.json({
                                                                        success: true,
                                                                        message: ORDER_MESSAGE_CODE.GET_ORDER_STATUS_SUCCESSFULLY,
                                                                        order: order_datail,
                                                                        provider_detail: provider_detail,
                                                                        vehicle_detail: vehicle_detail

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
                                                                    success: true,
                                                                    message: ORDER_MESSAGE_CODE.GET_ORDER_STATUS_SUCCESSFULLY,
                                                                    order: order_datail,
                                                                    provider_detail: provider_detail,
                                                                    vehicle_detail: vehicle_detail
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
                                });
                            } else {

                                response_data.json({
                                    success: false,
                                    error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND
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
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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

// store_rating_to_user
exports.store_rating_to_user = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'order_id',
        type: 'string'
    }, {
        name: 'store_review_to_user'
    }, {
        name: 'store_rating_to_user'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });
                    } else {
                        Order.findOne({
                            _id: request_data_body.order_id
                        }).then((order) => {
                            if (order) {
                                Review.findOne({
                                    order_id: order._id
                                }).then((review) => {

                                    if (review) {
                                        var store_rating_to_user = request_data_body.store_rating_to_user;
                                        review.store_rating_to_user = store_rating_to_user;
                                        review.store_review_to_user = request_data_body.store_review_to_user;


                                        var order_status = order.order_status;
                                        if (order_status == ORDER_STATE.ORDER_COMPLETED) {
                                            User.findOne({
                                                _id: order.user_id
                                            }).then((user) => {
                                                if (user) {
                                                    var old_rate = user.store_rate;
                                                    var old_rate_count = user.store_rate_count;
                                                    var new_rate_counter = (old_rate_count + 1);
                                                    var new_rate = ((old_rate * old_rate_count) + store_rating_to_user) / new_rate_counter;
                                                    new_rate = utils.precisionRoundTwo(Number(new_rate));
                                                    user.store_rate = new_rate;
                                                    user.store_rate_count = user.store_rate_count + 1;
                                                    user.save();
                                                    review.save();
                                                    order.is_store_rated_to_user = true;
                                                    order.save().then(() => {
                                                        response_data.json({
                                                            success: true,
                                                            message: STORE_MESSAGE_CODE.GIVE_RATING_TO_USER_SUCCESSFULLY

                                                        });

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

                                            response_data.json({
                                                success: false,
                                                error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND
                                            });
                                        }

                                    } else {
                                        response_data.json({
                                            success: false,
                                            error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND
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
                    }
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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

// store_rating_to_provider
exports.store_rating_to_provider = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'order_id',
        type: 'string'
    }, {
        name: 'store_review_to_provider'
    }, {
        name: 'store_rating_to_provider'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });
                    } else {
                        Order.findOne({
                            _id: request_data_body.order_id
                        }).then((order) => {
                            if (order) {
                                Review.findOne({
                                    order_id: order._id
                                }).then((review) => {

                                    if (review) {
                                        var store_rating_to_provider = request_data_body.store_rating_to_provider;
                                        review.store_rating_to_provider = store_rating_to_provider;
                                        review.store_review_to_provider = request_data_body.store_review_to_provider;

                                        var order_status = order.order_status;
                                        if (order_status == ORDER_STATE.ORDER_COMPLETED) {
                                            Request.findOne({
                                                _id: order.request_id
                                            }).then((request) => {

                                                Provider.findOne({
                                                    _id: request.provider_id
                                                }).then((provider) => {
                                                    if (provider) {
                                                        var old_rate = provider.store_rate;
                                                        var old_rate_count = provider.store_rate_count;
                                                        var new_rate_counter = (old_rate_count + 1);
                                                        var new_rate = ((old_rate * old_rate_count) + store_rating_to_provider) / new_rate_counter;
                                                        new_rate = utils.precisionRoundTwo(Number(new_rate));
                                                        provider.store_rate = new_rate;
                                                        provider.store_rate_count = provider.store_rate_count + 1;
                                                        provider.save();
                                                        review.save();
                                                        order.is_store_rated_to_provider = true;
                                                        order.save().then(() => {

                                                            response_data.json({
                                                                success: true,
                                                                message: STORE_MESSAGE_CODE.GIVE_RATING_TO_PROVIDER_SUCCESSFULLY

                                                            });

                                                        }, (error) => {
                                                            console.log(error)
                                                            response_data.json({
                                                                success: false,
                                                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                            });
                                                        });
                                                    }
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
                                                success: false,
                                                error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND
                                            });
                                        }

                                    } else {
                                        response_data.json({
                                            success: false,
                                            error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND
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
                    }
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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

///// store cancel request
exports.store_cancel_request = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'request_id',
        type: 'string'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });
                    } else {
                        Request.findOne({
                            _id: request_data_body.request_id,
                            delivery_status_manage_id: ORDER_STATUS_ID.RUNNING
                        }).then((request) => {
                            if (request) {
                                Provider.findOne({
                                    _id: request_data_body.provider_id
                                }).then((provider) => {

                                    if (provider) {
                                        var requests = provider.requests;

                                        var index = requests.indexOf(request._id);
                                        if (index >= 0) {
                                            requests.splice(index, 1);
                                            provider.requests = requests;
                                        }

                                        var current_request = provider.current_request;
                                        var current_request_index = current_request.indexOf(request._id);
                                        if (current_request_index >= 0) {
                                            current_request.splice(current_request_index, 1);
                                            provider.current_request = current_request;
                                        }

                                        provider.save();

                                        var device_type = provider.device_type;
                                        var device_token = provider.device_token;

                                        utils.sendPushNotification(ADMIN_DATA_ID.PROVIDER, device_type, device_token, PROVIDER_PUSH_CODE.STORE_CANCELLED_REQUEST, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);


                                        request.current_provider = null;
                                        request.provider_id = null;
                                        request.delivery_status = ORDER_STATE.STORE_CANCELLED_REQUEST;
                                        request.delivery_status_manage_id = ORDER_STATUS_ID.CANCELLED;
                                        request.delivery_status_by = null;
                                        request.providers_id_that_rejected_order_request = [];

                                        var index = request.date_time.findIndex((x) => x.status == ORDER_STATE.STORE_CANCELLED_REQUEST);

                                        if (index == -1) {
                                            request.date_time.push({
                                                status: ORDER_STATE.STORE_CANCELLED_REQUEST,
                                                date: new Date()
                                            });
                                        } else {
                                            request.date_time[index].date = new Date();
                                        }

                                        request.save();

                                        response_data.json({
                                            success: true,
                                            message: STORE_MESSAGE_CODE.CANCEL_REQUEST_SUCESSFULLY,
                                            delivery_status: request.delivery_status
                                        });
                                    } else {
                                        response_data.json({
                                            success: false,
                                            error_code: PROVIDER_ERROR_CODE.PROVIDER_DATA_NOT_FOUND
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
                                response_data.json({
                                    success: false,
                                    error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND
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
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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

// store get_order_detail
exports.get_order_detail = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'order_id',
        type: 'string'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });
                    } else {

                        var order_condition = {
                            "$match": {
                                '_id': {
                                    $eq: mongoose.Types.ObjectId(request_data_body.order_id)
                                }
                            }
                        };
                        var user_query = {
                            $lookup: {
                                from: "users",
                                localField: "user_id",
                                foreignField: "_id",
                                as: "user_detail"
                            }
                        };
                        var array_to_json_user_detail = {
                            $unwind: "$user_detail"
                        };
                        var store_query = {
                            $lookup: {
                                from: "stores",
                                localField: "store_id",
                                foreignField: "_id",
                                as: "store_detail"
                            }
                        };
                        var array_to_json_store_detail = {
                            $unwind: "$store_detail"
                        };

                        var country_query = {
                            $lookup: {
                                from: "countries",
                                localField: "store_detail.country_id",
                                foreignField: "_id",
                                as: "country_detail"
                            }
                        };

                        var array_to_json_country_query = {
                            $unwind: "$country_detail"
                        };

                        var order_payment_query = {
                            $lookup: {
                                from: "order_payments",
                                localField: "order_payment_id",
                                foreignField: "_id",
                                as: "order_payment_detail"
                            }
                        };
                        var array_to_json_order_payment_query = {
                            $unwind: "$order_payment_detail"
                        };


                        var cart_query = {
                            $lookup: {
                                from: "carts",
                                localField: "cart_id",
                                foreignField: "_id",
                                as: "cart_detail"
                            }
                        };

                        var array_to_json_cart_query = {
                            $unwind: "$cart_detail"
                        };
                        var request_query = {
                            $lookup: {
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
                            $lookup: {
                                from: "providers",
                                localField: "request_detail.provider_id",
                                foreignField: "_id",
                                as: "provider_detail"
                            }
                        };


                        Order.aggregate([order_condition, user_query, order_payment_query, store_query, cart_query, request_query, request_query, array_to_json_user_detail, array_to_json_store_detail, country_query, array_to_json_country_query, array_to_json_order_payment_query, array_to_json_cart_query, array_to_json_request_query, provider_query

                        ]).then((order) => {
                            if (order.length === 0) {
                                response_data.json({
                                    success: false,
                                    error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND
                                });
                            } else {
                                response_data.json({
                                    success: true,
                                    message: ORDER_MESSAGE_CODE.GET_ORDER_DATA_SUCCESSFULLY,
                                    order: order[0]
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
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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


// store get_user
exports.get_user = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'email',
        type: 'string'
    }, {
        name: 'phone',
        type: 'string'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });
                    } else {

                        var email = ((request_data_body.email).trim()).toLowerCase();
                        var phone = request_data_body.phone;
                        var country_id = request_data_body.country_id;
                        var query = {
                            $or: [{
                                'email': email
                            }, {
                                'phone': phone
                            }]
                        };
                        User.findOne(query).then((user_detail) => {
                            Country.findOne({
                                _id: country_id
                            }).then((country_detail) => {
                                if (country_detail) {
                                    var minimum_phone_number_length = country_detail.minimum_phone_number_length;
                                    var maximum_phone_number_length = country_detail.maximum_phone_number_length;
                                    var country_phone_code = country_detail.country_phone_code;
                                    var wallet_currency_code = country_detail.currency_code;

                                    if (user_detail) {
                                        console.log("user");
                                        response_data.json({
                                            success: true,
                                            message: USER_MESSAGE_CODE.REGISTER_SUCCESSFULLY,
                                            minimum_phone_number_length: minimum_phone_number_length,
                                            maximum_phone_number_length: maximum_phone_number_length,
                                            user: user_detail
                                        });
                                    } else {
                                        console.log("user not");
                                        var server_token = utils.generateServerToken(32);
                                        var password = "123456";
                                        password = utils.encryptPassword(password);

                                        var first_name = (request_data_body.first_name).trim();
                                        if (first_name != "" && first_name != undefined && first_name != null) {
                                            first_name = first_name.charAt(0).toUpperCase() + first_name.slice(1);
                                        } else {
                                            first_name = "";
                                        }

                                        var last_name = (request_data_body.last_name).trim();
                                        if (last_name != "" && last_name != undefined && last_name != null) {
                                            last_name = last_name.charAt(0).toUpperCase() + last_name.slice(1);
                                        } else {
                                            last_name = "";
                                        }

                                        var user_data = new User({
                                            user_type: ADMIN_DATA_ID.STORE,
                                            admin_type: ADMIN_DATA_ID.USER,
                                            user_type_id: null,
                                            image_url: "",
                                            first_name: first_name,
                                            last_name: last_name,
                                            email: ((request_data_body.email).trim()).toLowerCase(),
                                            password: password,
                                            social_id: "",
                                            login_by: "",
                                            country_phone_code: country_phone_code,
                                            phone: phone,
                                            address: "",

                                            country_id: country_id,
                                            city: "",
                                            device_token: "",
                                            device_type: "",
                                            app_version: "",
                                            is_email_verified: false,
                                            is_phone_number_verified: false,
                                            server_token: server_token,
                                            orders: [],
                                            current_order: null,
                                            promo_count: 0,
                                            referral_code: "",
                                            is_referral: false,
                                            referred_by: null,
                                            total_referrals: 0,
                                            store_rate: 0,
                                            store_rate_count: 0,
                                            provider_rate: 0,
                                            provider_rate_count: 0,
                                            wallet: 0,
                                            wallet_currency_code: wallet_currency_code,
                                            is_use_wallet: false,
                                            is_approved: true,
                                            location: [],
                                            is_document_uploaded: false,
                                            is_user_type_approved: false,
                                            favourite_stores: []

                                        });

                                        user_data.save().then(() => {
                                            utils.insert_documets_for_new_users(user_data, null, ADMIN_DATA_ID.USER, country_id);
                                            if (setting_detail.is_mail_notification) {
                                                emails.sendUserRegisterEmail(request_data, user_data, user_data.first_name + " " + user_data.last_name);

                                            }

                                            response_data.json({
                                                success: true,
                                                message: USER_MESSAGE_CODE.REGISTER_SUCCESSFULLY,
                                                minimum_phone_number_length: minimum_phone_number_length,
                                                maximum_phone_number_length: maximum_phone_number_length,
                                                user: user_data

                                            });

                                        }, (error) => {
                                            console.log(error)
                                            response_data.json({
                                                success: false,
                                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                            });
                                        });
                                    }
                                }
                            });

                        }, (error) => {
                            console.log(error)
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
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


exports.get_country_phone_number_length = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'country_id',
        type: 'string'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Country.findOne({
                _id: request_data_body.country_id
            }).then((country) => {
                if (country) {
                    response_data.json({
                        success: true,
                        message: USER_MESSAGE_CODE.REGISTER_SUCCESSFULLY,
                        minimum_phone_number_length: country.minimum_phone_number_length,
                        maximum_phone_number_length: country.maximum_phone_number_length
                    });
                } else {
                    response_data.json({
                        success: false,
                        error_code: USER_ERROR_CODE.REGISTRATION_FAILED
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

//store complete_order
exports.store_complete_order = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'order_id',
        type: 'string'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var order_id = request_data_body.order_id;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store) => {
                if (store) {
                    if (request_data_body.server_token !== null && store.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });
                    } else {

                        City.findOne({
                            _id: store.city_id
                        }).then((city) => {

                            var is_store_earning_add_in_wallet_on_cash_payment_for_city = city.is_store_earning_add_in_wallet_on_cash_payment;

                            var is_store_earning_add_in_wallet_on_other_payment_for_city = city.is_store_earning_add_in_wallet_on_other_payment;

                            var city_timezone = city.timezone;
                            var now = new Date();
                            var today_start_date_time = utils.get_date_now_at_city(now, city_timezone);
                            var tag_date = moment(today_start_date_time).format(DATE_FORMATE.DDMMYYYY);
                            Order.findOne({
                                _id: order_id,
                                store_id: request_data_body.store_id,
                                order_status_id: ORDER_STATUS_ID.RUNNING
                            }).then((order) => {
                                if (order) {
                                    User.findOne({
                                        _id: order.user_id
                                    }).then((user) => {
                                        var now = new Date();
                                        var user_device_type = user.device_type;
                                        var user_device_token = user.device_token;

                                        order.order_status_id = ORDER_STATUS_ID.COMPLETED;
                                        order.order_status_by = request_data_body.store_id;
                                        order.order_status = ORDER_STATE.ORDER_COMPLETED;
                                        order.completed_at = now;

                                        order.completed_date_tag = tag_date;
                                        order.completed_date_in_city_timezone = today_start_date_time;


                                        var index = order.date_time.findIndex((x) => x.status == ORDER_STATE.ORDER_COMPLETED);
                                        if (index == -1) {
                                            order.date_time.push({
                                                status: ORDER_STATE.ORDER_COMPLETED,
                                                date: new Date()
                                            });
                                        } else {
                                            order.date_time[index].date = new Date();
                                        }

                                        order.save();

                                        Order_payment.findOne({
                                            _id: order.order_payment_id
                                        }).then((order_payment) => {
                                            if (order_payment) {

                                                // Entry in Store_analytic_daily Table
                                                utils.insert_daily_store_analytics(tag_date, order.store_id, ORDER_STATE.ORDER_COMPLETED, order_payment.total_item_count, false);



                                                var payment_gateway_name = "Cash";
                                                var is_payment_mode_cash = order_payment.is_payment_mode_cash;


                                                var store_have_service_payment = 0;
                                                var store_have_order_payment = 0;
                                                var total_store_have_payment = 0;
                                                var pay_to_store = 0;

                                                if (order_payment.is_store_pay_delivery_fees) {
                                                    store_have_service_payment = order_payment.total_delivery_price;
                                                    store_have_service_payment = utils.precisionRoundTwo(store_have_service_payment);
                                                }

                                                if (is_payment_mode_cash && !order_payment.is_order_price_paid_by_store) {
                                                    store_have_order_payment = order_payment.total_order_price;
                                                    store_have_order_payment = utils.precisionRoundTwo(store_have_order_payment);
                                                }

                                                order_payment.total_store_income = order_payment.total_store_income + order_payment.total_provider_income;
                                                order_payment.total_provider_income = 0;

                                                total_store_have_payment = +store_have_service_payment + +store_have_order_payment;
                                                total_store_have_payment = utils.precisionRoundTwo(total_store_have_payment);
                                                var other_promo_payment_loyalty = order_payment.other_promo_payment_loyalty;

                                                pay_to_store = order_payment.total_store_income - other_promo_payment_loyalty;
                                                if (order_payment.is_user_pick_up_order) {
                                                    pay_to_store = order_payment.total_store_income - total_store_have_payment;
                                                } else {
                                                    if (is_payment_mode_cash) {
                                                        pay_to_store = order_payment.total_store_income - order_payment.user_pay_payment;
                                                    } else {
                                                        pay_to_store = order_payment.total_store_income - total_store_have_payment;
                                                    }
                                                }

                                                pay_to_store = utils.precisionRoundTwo(pay_to_store);

                                                order_payment.pay_to_store = pay_to_store;

                                                Payment_gateway.findOne({
                                                    _id: order_payment.payment_id
                                                }).then((payment_gateway) => {

                                                    if (!is_payment_mode_cash) {
                                                        payment_gateway_name = payment_gateway.name;
                                                    }

                                                    if ((setting_detail.is_store_earning_add_in_wallet_on_cash_payment && is_store_earning_add_in_wallet_on_cash_payment_for_city) || (setting_detail.is_store_earning_add_in_wallet_on_other_payment && is_store_earning_add_in_wallet_on_other_payment_for_city)) {
                                                        if (pay_to_store < 0) {

                                                            var store_total_wallet_amount = wallet_history.add_wallet_history(ADMIN_DATA_ID.STORE, store.unique_id, store._id, store.country_id,
                                                                store.wallet_currency_code, order_payment.order_currency_code,
                                                                1, Math.abs(pay_to_store), store.wallet, WALLET_STATUS_ID.REMOVE_WALLET_AMOUNT, WALLET_COMMENT_ID.SET_ORDER_PROFIT, "Profit Of This Order : " + order.unique_id);

                                                            store.wallet = store_total_wallet_amount;
                                                        } else {
                                                            var store_total_wallet_amount = wallet_history.add_wallet_history(ADMIN_DATA_ID.STORE, store.unique_id, store._id, store.country_id,
                                                                store.wallet_currency_code, order_payment.order_currency_code,
                                                                1, pay_to_store, store.wallet, WALLET_STATUS_ID.ADD_WALLET_AMOUNT, WALLET_COMMENT_ID.SET_ORDER_PROFIT, "Profit Of This Order : " + order.unique_id);

                                                            store.wallet = store_total_wallet_amount;
                                                        }

                                                        store.save();
                                                        order_payment.is_store_income_set_in_wallet = true;
                                                        order_payment.store_income_set_in_wallet = Math.abs(pay_to_store);
                                                    }



                                                    // mail to user order Completed.
                                                    if (setting_detail.is_mail_notification) {
                                                        emails.sendUserOrderCompleteEmail(request_data, user);
                                                    }

                                                    order_payment.delivered_at = now;
                                                    order_payment.completed_date_tag = tag_date;
                                                    order_payment.completed_date_in_city_timezone = today_start_date_time;

                                                    order_payment.save();

                                                    // Entry In Review Table //
                                                    var reviews = new Review({
                                                        user_rating_to_provider: 0,
                                                        user_review_to_provider: "",
                                                        user_rating_to_store: 0,
                                                        user_review_to_store: "",
                                                        provider_rating_to_user: 0,
                                                        provider_review_to_user: "",
                                                        provider_rating_to_store: 0,
                                                        provider_review_to_store: "",
                                                        store_rating_to_provider: 0,
                                                        store_review_to_provider: "",
                                                        store_rating_to_user: 0,
                                                        store_review_to_user: "",
                                                        order_id: order._id,
                                                        order_unique_id: order.unique_id,
                                                        user_id: order.user_id,
                                                        store_id: order.store_id,
                                                        provider_id: null,
                                                        number_of_users_like_store_comment: 0,
                                                        number_of_users_dislike_store_comment: 0,
                                                        id_of_users_like_store_comment: [],
                                                        id_of_users_dislike_store_comment: []

                                                    });
                                                    reviews.save();

                                                    var order_data = {
                                                        order_id: order._id,
                                                        unique_id: order.unique_id,
                                                        store_name: store.name,
                                                        store_image: store.image_url
                                                    }

                                                    utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, user_device_type, user_device_token, USER_PUSH_CODE.DELIVERY_MAN_COMPLETE_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_data, "");



                                                    response_data.json({
                                                        success: true,
                                                        message: ORDER_MESSAGE_CODE.ORDER_COMPLETED_SUCCESSFULLY,
                                                        order_id: order._id,
                                                        order_status: order.order_status,
                                                        currency: order.currency,
                                                        payment_gateway_name: payment_gateway_name,
                                                        order_payment: order_payment
                                                    });

                                                });
                                            } else {
                                                response_data.json({
                                                    success: false,
                                                    error_code: ORDER_ERROR_CODE.ORDER_COMPLETE_FAILED
                                                });
                                            }

                                        }, (error) => {
                                            console.log(error)
                                            response_data.json({
                                                success: false,
                                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                            });
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
                        }, (error) => {
                            console.log(error)
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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


exports.store_change_delivery_address = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'latitude'
    }, {
        name: 'longitude'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store) => {
                if (store) {
                    if (request_data_body.server_token !== null && store.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });
                    } else {
                        var city_id = store.city_id;
                        City.findOne({
                            _id: city_id
                        }).then((city) => {
                            var latlong = [request_data_body.latitude, request_data_body.longitude];

                            var cityLatLong = city.city_lat_long;
                            var distanceFromSubAdminCity = utils.getDistanceFromTwoLocation(latlong, cityLatLong);
                            var cityRadius = city.city_radius;
                            if (city.is_use_radius) {
                                if (distanceFromSubAdminCity < cityRadius) {
                                    response_data.json({
                                        success: true,
                                        message: CART_MESSAGE_CODE.DESTINATION_CHANGE_SUCCESSFULLY
                                    });

                                } else {
                                    response_data.json({
                                        success: false,
                                        error_code: CART_ERROR_CODE.CHANGE_DELIVERY_ADDRESS_FAILED
                                    });
                                }
                            } else {
                                var store_zone = geolib.isPointInside({
                                    latitude: latlong[0],
                                    longitude: latlong[1]
                                },
                                    city.city_locations);
                                if (store_zone) {
                                    response_data.json({
                                        success: true,
                                        message: CART_MESSAGE_CODE.DESTINATION_CHANGE_SUCCESSFULLY
                                    });
                                } else {
                                    response_data.json({
                                        success: false,
                                        error_code: CART_ERROR_CODE.CHANGE_DELIVERY_ADDRESS_FAILED
                                    });

                                }
                            }
                        });
                    }
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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

/// store_create_order without ITEM
exports.store_create_order = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'cart_id',
        type: 'string'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var order_type = Number(request_data_body.order_type);

            Store.findOne({
                _id: request_data_body.store_id
            }).then((store) => {
                if (store) {
                    if (request_data_body.server_token !== null && store.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });

                    } else {
                        Cart.findOne({
                            _id: request_data_body.cart_id
                        }).then((cart) => {

                            if (cart) {
                                Order_payment.findOne({
                                    _id: cart.order_payment_id
                                }).then((order_payment) => {
                                    if (order_payment) {

                                        User.findOne({
                                            _id: cart.user_id
                                        }).then((user) => {

                                            var user_id = null;
                                            var user_unique_id = 0;
                                            if (user) {
                                                user_id = user._id;
                                                user_unique_id = user.unique_id;
                                            }
                                            Country.findOne({
                                                _id: store.country_id
                                            }).then((country) => {
                                                City.findOne({
                                                    _id: store.city_id
                                                }).then((city) => {
                                                    var now = new Date();
                                                    var city_timezone = "";
                                                    var country_id = store.country_id;
                                                    var city_id = store.city_id;

                                                    if (city) {
                                                        city_timezone = city.timezone;
                                                        city_id = city._id;
                                                    }
                                                    if (country) {
                                                        country_id = country._id;
                                                    }

                                                    var distance = setting_detail.default_search_radius / UNIT.DEGREE_TO_KM;

                                                    var order = new Order({
                                                        store_id: store._id,
                                                        cart_id: cart._id,
                                                        request_id: null,
                                                        order_payment_id: cart.order_payment_id,
                                                        country_id: country_id,
                                                        city_id: city_id,
                                                        timezone: city_timezone,
                                                        user_id: user_id,
                                                        order_type: order_type,
                                                        order_type_id: store._id,
                                                        order_status_id: ORDER_STATUS_ID.RUNNING,
                                                        order_status: ORDER_STATE.ORDER_READY,
                                                        order_status_manage_id: ORDER_STATUS_ID.COMPLETED,
                                                        order_status_by: null,
                                                        is_schedule_order_informed_to_store: false,
                                                        estimated_time_for_ready_order: null,
                                                        confirmation_code_for_pick_up_delivery: utils.generateUniqueCode(6),
                                                        confirmation_code_for_complete_delivery: utils.generateUniqueCode(6),
                                                        store_notify: 0,
                                                        cancel_reason: "",

                                                        is_store_rated_to_provider: false,
                                                        is_store_rated_to_user: false,

                                                        is_provider_rated_to_store: false,
                                                        is_provider_rated_to_user: false,

                                                        is_user_rated_to_provider: false,
                                                        is_user_rated_to_store: false,
                                                        is_user_show_invoice: false,
                                                        is_provider_show_invoice: false,
                                                        is_schedule_order: false,
                                                        schedule_order_start_at: null,
                                                        schedule_order_server_start_at: null,
                                                        completed_at: null
                                                    });

                                                    order.save().then(() => {
                                                        user.cart_id = null;
                                                        user.save();
                                                        var orders_array = {
                                                            order_id: order._id,
                                                            order_unique_id: order.unique_id,
                                                            order_payment_id: order.order_payment_id,
                                                            cart_id: order.cart_id
                                                        }


                                                        var request = new Request({
                                                            country_id: country_id,
                                                            city_id: city_id,
                                                            timezone: city_timezone,
                                                            vehicle_id: request_data_body.vehicle_id,
                                                            orders: orders_array,
                                                            user_id: user_id,
                                                            user_unique_id: user_unique_id,
                                                            request_type: 2,
                                                            request_type_id: store._id,
                                                            estimated_time_for_delivery_in_min: 0,

                                                            provider_type: 0,
                                                            provider_type_id: null,
                                                            provider_id: null,
                                                            provider_unique_id: 0,
                                                            delivery_status: ORDER_STATE.WAITING_FOR_DELIVERY_MAN,
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
                                                            response_data.json({
                                                                success: true,
                                                                message: ORDER_MESSAGE_CODE.ORDER_CREATE_SUCCESSFULLY
                                                            });
                                                            my_request.findNearestProvider(request, null);

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
                                            success: false,
                                            error_code: ORDER_ERROR_CODE.REQUEST_FAILED
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
                                response_data.json({
                                    success: false,
                                    error_code: CART_ERROR_CODE.CART_NOT_FOUND
                                });
                            }
                        });
                    }
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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

/// store update_order
exports.store_update_order = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'order_id',
        type: 'string'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var total_store_tax_price = 0;
            var total_cart_price = 0;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store) => {
                if (store) {
                    if (request_data_body.server_token !== null && store.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });

                    } else {
                        Order.findOne({
                            _id: request_data_body.order_id,
                            store_id: request_data_body.store_id
                        }).then((order) => {

                            if (order) {
                                Cart.findOne({
                                    _id: order.cart_id
                                }).then((cart_detail) => {
                                    if (cart_detail) {

                                        cart_detail.order_details = request_data_body.order_details;
                                        cart_detail.total_item_count = request_data_body.total_item_count;
                                        total_cart_price = request_data_body.total_cart_price;

                                        if (store.is_use_item_tax) {
                                            if (request_data_body.total_item_tax) {
                                                total_store_tax_price = request_data_body.total_item_tax;
                                            }
                                        } else {
                                            if (total_cart_price) {
                                                total_store_tax_price = total_cart_price * store.item_tax * 0.01;
                                            } else {
                                                total_cart_price = 0;
                                            }
                                        }
                                        total_store_tax_price = utils.precisionRoundTwo(Number(total_store_tax_price));

                                        cart_detail.total_cart_price = total_cart_price;
                                        cart_detail.total_item_tax = total_store_tax_price;
                                        cart_detail.save();


                                        Order_payment.findOne({
                                            _id: order.order_payment_id
                                        }).then((order_payment) => {
                                            if (order_payment) {

                                                var total_item_count = request_data_body.total_item_count;
                                                var order_price = 0;
                                                var total_order_price = 0;
                                                var total_admin_profit_on_store = 0;
                                                var total_store_income = 0;

                                                var total = 0;
                                                var item_tax = store.item_tax;
                                                var admin_profit_mode_on_store = store.admin_profit_mode_on_store;
                                                var admin_profit_value_on_store = store.admin_profit_value_on_store;


                                                var is_store_pay_delivery_fees = false;
                                                var is_payment_mode_cash = order_payment.is_payment_mode_cash;


                                                order_price = +total_cart_price + +total_store_tax_price;
                                                order_price = utils.precisionRoundTwo(Number(order_price));

                                                switch (admin_profit_mode_on_store) {
                                                    case ADMIN_PROFIT_ON_ORDER_ID.PERCENTAGE:
                                                        /* percentage */
                                                        total_admin_profit_on_store = order_price * admin_profit_value_on_store * 0.01;
                                                        break;
                                                    case ADMIN_PROFIT_ON_ORDER_ID.PER_ORDER:
                                                        /* absolute per order */
                                                        total_admin_profit_on_store = admin_profit_value_on_store;
                                                        break;
                                                    case ADMIN_PROFIT_ON_ORDER_ID.PER_ITEMS:
                                                        /* absolute value per items */
                                                        total_admin_profit_on_store = admin_profit_value_on_store * total_item_count;
                                                        break;
                                                    default:
                                                        /* percentage */
                                                        total_admin_profit_on_store = order_price * admin_profit_value_on_store * 0.01;
                                                        break;
                                                }

                                                total_admin_profit_on_store = utils.precisionRoundTwo(Number(total_admin_profit_on_store));
                                                total_store_income = order_price - total_admin_profit_on_store;
                                                total_store_income = utils.precisionRoundTwo(Number(total_store_income));
                                                /* ORDER CALCULATION END */

                                                /* FINAL INVOICE CALCULATION START */
                                                total_delivery_price = order_payment.total_delivery_price;
                                                total_order_price = order_price;

                                                // Store Pay Delivery Fees Condition
                                                if (total_order_price > store.free_delivery_for_above_order_price && store.is_store_pay_delivery_fees == true) {
                                                    is_store_pay_delivery_fees = true;
                                                }

                                                if (is_store_pay_delivery_fees) {
                                                    total = total_order_price;
                                                } else {
                                                    total = +total_delivery_price + +total_order_price;
                                                }

                                                total = utils.precisionRoundTwo(Number(total));
                                                order_payment.total_after_wallet_payment = total;

                                                remaining_payment = total;
                                                order_payment.remaining_payment = remaining_payment;


                                                var store_have_service_payment = 0;
                                                var store_have_order_payment = 0;
                                                var total_store_have_payment = 0;
                                                var pay_to_store = 0;
                                                var total_provider_income = order_payment.total_provider_income;

                                                if (is_store_pay_delivery_fees) {
                                                    store_have_service_payment = total_delivery_price;
                                                    store_have_service_payment = utils.precisionRoundTwo(Number(store_have_service_payment));
                                                }

                                                if (is_payment_mode_cash && !order_payment.is_order_price_paid_by_store) {
                                                    store_have_order_payment = total_order_price;
                                                    store_have_order_payment = utils.precisionRoundTwo(Number(store_have_order_payment));
                                                }

                                                total_store_have_payment = +store_have_service_payment + +store_have_order_payment;
                                                total_store_have_payment = utils.precisionRoundTwo(Number(total_store_have_payment));
                                                var other_promo_payment_loyalty = order_payment.other_promo_payment_loyalty;
                                                pay_to_store = total_store_income - total_store_have_payment - other_promo_payment_loyalty;
                                                pay_to_store = utils.precisionRoundTwo(Number(pay_to_store));
                                                var provider_have_cash_payment = 0;
                                                var provider_paid_order_payment = 0;
                                                var total_provider_have_payment = 0;
                                                var pay_to_provider = 0;
                                                var user_pay_payment = total;

                                                if (is_payment_mode_cash) {
                                                    provider_have_cash_payment = total;

                                                }
                                                if (is_payment_mode_cash && !order_payment.is_order_price_paid_by_store) {
                                                    provider_paid_order_payment = total_order_price;
                                                    provider_paid_order_payment = utils.precisionRoundTwo(Number(provider_paid_order_payment));
                                                    user_pay_payment = total_order_price;
                                                }

                                                total_provider_have_payment = provider_have_cash_payment - provider_paid_order_payment;
                                                total_provider_have_payment = utils.precisionRoundTwo(Number(total_provider_have_payment));
                                                pay_to_provider = total_provider_income - total_provider_have_payment;
                                                pay_to_provider = utils.precisionRoundTwo(Number(pay_to_provider));

                                                order_payment.item_tax = item_tax;
                                                order_payment.pay_to_store = pay_to_store;
                                                order_payment.pay_to_provider = pay_to_provider;
                                                order_payment.total = total;
                                                order_payment.user_pay_payment = user_pay_payment;
                                                order_payment.cash_payment = total;
                                                order_payment.is_store_pay_delivery_fees = is_store_pay_delivery_fees;
                                                order_payment.total_delivery_price = total_delivery_price;
                                                order_payment.total_order_price = total_order_price;
                                                order_payment.total_store_income = total_store_income;
                                                order_payment.total_admin_profit_on_store = total_admin_profit_on_store;


                                                order_payment.total_store_tax_price = total_store_tax_price;
                                                order_payment.total_cart_price = total_cart_price;
                                                order_payment.total_item_count = total_item_count;
                                                order_payment.save(function (error) {
                                                    response_data.json({
                                                        success: true,
                                                        message: STORE_MESSAGE_CODE.STORE_ORDER_UPDATE_SUCCESSFULLY
                                                    });
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
                                        response_data.json({
                                            success: false,
                                            error_code: CART_ERROR_CODE.CART_NOT_FOUND
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
                                response_data.json({
                                    success: false,
                                    error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND
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
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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

// check_request_status
exports.check_request_status = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{
        name: 'order_id',
        type: 'string'
    }, {
        name: 'request_id',
        type: 'string'
    }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({
                _id: request_data_body.store_id
            }).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                        });
                    } else {
                        Request.findOne({
                            _id: request_data_body.request_id
                        }).then((request) => {
                            if (request) {
                                Order.findOne({
                                    _id: request_data_body.order_id,
                                    store_id: request_data_body.store_id
                                }).then((order) => {
                                    if (order) {
                                        var country_id = order.country_id;
                                        if (country_id == null && country_id == undefined) {
                                            country_id = store_detail.country_id;
                                        }
                                        Country.findOne({
                                            _id: country_id
                                        }).then((country_detail) => {
                                            var currency = country_detail.currency_sign;
                                            Cart.findOne({
                                                _id: order.cart_id,
                                                store_id: request_data_body.store_id
                                            }).then((cart) => {
                                                if (cart) {
                                                    Order_payment.findOne({
                                                        _id: order.order_payment_id,
                                                        order_id: order._id
                                                    }).then((order_payment) => {
                                                        if (order_payment) {

                                                            var vehicle_detail = {};
                                                            var provider_detail = {};

                                                            var bearing = 0;
                                                            var image_url = "";
                                                            var first_name = "";
                                                            var last_name = "";
                                                            var phone = "";
                                                            var user_rate = 0;
                                                            var country_phone_code = "";
                                                            var location = [];


                                                            var unique_id = 0;
                                                            var vehicle_name = "";
                                                            var description = "";
                                                            var vehicle_image_url = "";
                                                            var map_pin_image_url = "";
                                                            var is_business = false;

                                                            var request_datail = {
                                                                _id: request._id,
                                                                unique_id: request.unique_id,
                                                                order_id: order._id,
                                                                order_unique_id: order.unique_id,
                                                                order_payment_id: order.order_payment_id,
                                                                user_id: request.user_id,
                                                                provider_id: request.provider_id,
                                                                current_provider: request.current_provider,
                                                                is_user_pick_up_order: order_payment.is_user_pick_up_order,
                                                                is_confirmation_code_required_at_pickup_delivery: setting_detail.is_confirmation_code_required_at_pickup_delivery,
                                                                is_confirmation_code_required_at_complete_delivery: setting_detail.is_confirmation_code_required_at_complete_delivery,
                                                                confirmation_code_for_complete_delivery: request.confirmation_code_for_complete_delivery,
                                                                confirmation_code_for_pick_up_delivery: request.confirmation_code_for_pick_up_delivery,
                                                                pickup_addresses: cart.pickup_addresses,
                                                                destination_addresses: cart.destination_addresses,
                                                                currency: currency,
                                                                delivery_status: request.delivery_status,
                                                                total_order_price: order_payment.total_order_price,
                                                                created_at: request.created_at



                                                            }
                                                            Provider.findOne({
                                                                _id: request.current_provider
                                                            }).then((provider) => {
                                                                if (provider) {
                                                                    Vehicle.findOne({
                                                                        _id: provider.vehicle_id
                                                                    }).then((vehicle) => {
                                                                        if (provider) {
                                                                            bearing = provider.bearing;
                                                                            image_url = provider.image_url;
                                                                            first_name = provider.first_name;
                                                                            last_name = provider.last_name;
                                                                            phone = provider.phone;
                                                                            country_phone_code = provider.country_phone_code;
                                                                            user_rate = provider.user_rate;
                                                                            location = provider.location;
                                                                            bearing = provider.bearing;
                                                                        }

                                                                        if (vehicle) {
                                                                            unique_id = vehicle.unique_id;
                                                                            vehicle_name = vehicle.vehicle_name;
                                                                            description = vehicle.description;
                                                                            vehicle_image_url = vehicle.image_url;
                                                                            map_pin_image_url = vehicle.map_pin_image_url;
                                                                            is_business = vehicle.is_business;

                                                                        }

                                                                        var provider_detail = {
                                                                            image_url: image_url,
                                                                            first_name: first_name,
                                                                            last_name: last_name,
                                                                            phone: phone,
                                                                            country_phone_code: country_phone_code,
                                                                            user_rate: user_rate,
                                                                            provider_location: location,
                                                                            bearing: bearing
                                                                        }

                                                                        var vehicle_detail = {
                                                                            unique_id: unique_id,
                                                                            vehicle_name: vehicle_name,
                                                                            description: description,
                                                                            image_url: vehicle_image_url,
                                                                            map_pin_image_url: map_pin_image_url,
                                                                            is_business: is_business
                                                                        }


                                                                        response_data.json({
                                                                            success: true,
                                                                            message: ORDER_MESSAGE_CODE.GET_REQUEST_STATUS_SUCCESSFULLY,
                                                                            request: request_datail,
                                                                            provider_detail: provider_detail,
                                                                            vehicle_detail: vehicle_detail

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
                                                                        success: true,
                                                                        message: ORDER_MESSAGE_CODE.GET_REQUEST_STATUS_SUCCESSFULLY,
                                                                        request: request_datail,
                                                                        provider_detail: provider_detail,
                                                                        vehicle_detail: vehicle_detail
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
                                                }

                                            }, (error) => {
                                                console.log(error)
                                                response_data.json({
                                                    success: false,
                                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                });
                                            });
                                        });
                                    } else {
                                        response_data.json({
                                            success: false,
                                            error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND
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
                                response_data.json({
                                    success: false,
                                    error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND
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
                } else {
                    response_data.json({
                        success: false,
                        error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
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


exports.check_store_coding = function (req, res) {
    Store.findOne({}, {}, {
        sort: {
            'created_at': -1
        }
    }, function (err, store) {
        res.json(store)
    })
}


store_owner_register = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'name', type: 'string' }, { name: 'email', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { email, password, name } = req.body;
            email = email.toLowerCase().trim();
            let store_already_exist_query = { $or: [{ email: email }, { name: name }] };
            let owner = await Store_owner.findOne(store_already_exist_query);
            if (owner) {
                res.json({
                    success: false,
                    error_code: STORE_ERROR_CODE.EMAIL_ALREADY_REGISTRED
                });
                return;
            }

            let encryted_password = utils.encryptPassword(password);
            let server_token = utils.generateServerToken(32);

            let owner_data = new Store_owner({
                name: name,
                email: email,
                password: encryted_password,
                server_token: server_token
            })
            let new_owner = await owner_data.save();

            res.json({
                success: true,
                message: STORE_MESSAGE_CODE.STORE_OWNER_REGISTERED_SUCCESSFULLY,
                store_owner: new_owner
            })

        } catch (e) {
            console.log(e)
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};
module.exports.store_owner_register = store_owner_register;

store_owner_login = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'email', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { email, password } = req.body;
            email = email.toLowerCase().trim();
            encrypted_password = utils.encryptPassword(password);
            let query = { 'email': email };
            let owner = await Store_owner.findOne(query);

            if (!owner) {
                res.json({
                    success: false,
                    error_code: STORE_ERROR_CODE.NOT_A_REGISTERED
                });
                return;
            }

            if (encrypted_password != owner.password) {
                res.json({
                    success: false,
                    error_code: STORE_ERROR_CODE.INVALID_PASSWORD
                });
                return;
            }

            // let stores = await Store.find({ store_owner_id: owner._id }, { _id: 1, server_token: 1, email: 1, name: 1, store_unique_code: 1 })

            owner.server_token = utils.generateServerToken(32);
            await owner.save();

            res.json({
                success: true,
                message: STORE_MESSAGE_CODE.LOGIN_SUCCESSFULLY,
                store_owner: owner,
                // stores: stores
            })

        } catch (e) {
            console.log(e)
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};
module.exports.store_owner_login = store_owner_login;

store_owner_logout = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'store_owner_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { store_owner_id } = req.body;
            let owner = await Store_owner.findOne({ '_id': store_owner_id });

            if (!owner) {
                res.json({
                    success: false,
                    error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
                });
                return;
            }

            owner.server_token = "";
            await owner.save();

            res.json({
                success: true,
                message: STORE_MESSAGE_CODE.LOGOUT_SUCCESSFULLY,
            })

        } catch (e) {
            console.log(e)
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};
module.exports.store_owner_logout = store_owner_logout;

store_owner_details = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'store_owner_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { store_owner_id, server_token } = req.body;

            let owner = await Store_owner.findById(store_owner_id);

            if (!owner) {
                res.json({
                    success: false,
                    error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
                });
                return;
            }

            if (!server_token || server_token !== owner.server_token) {
                res.json({
                    success: false,
                    error_code: ERROR_CODE.INVALID_SERVER_TOKEN
                });
                return;
            }

            let stores = await Store.find({ store_owner_id: store_owner_id });

            res.json({
                success: true,
                message: STORE_MESSAGE_CODE.LOGIN_SUCCESSFULLY,
                store_owner: owner,
                stores: stores
            })

        } catch (e) {
            console.log(e)
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};
module.exports.store_owner_details = store_owner_details;