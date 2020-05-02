require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var utils = require('../../utils/utils');
var cron = require('../../controllers/user/cron_job');
var emails = require('../../controllers/email_sms/emails');
var SMS = require('../../controllers/email_sms/sms');
var Setting = require('mongoose').model('setting');
var User = require('mongoose').model('user');
var Store = require('mongoose').model('store');
var Provider = require('mongoose').model('provider');
var Country = require('mongoose').model('country');
var Admin = require('mongoose').model('admin');
var City = require('mongoose').model('city');
var console = require('../../utils/console');
var fs = require('fs');
var Product = require('mongoose').model('product');
var Item = require('mongoose').model('item');
var Specification_group = require('mongoose').model('specification_group');
var Specification = require('mongoose').model('specification');
var mongoose = require('mongoose');
    
exports.update_wallet = function (request_data, response_data) {
    utils.updateWallet(request_data, response_data);
    response_data.json({success: true});
}    

exports.update_store_time = function (request_data, response_data) {
    //utils.updateStoreTime(request_data, response_data);
    response_data.json({success: true});
}

exports.insert_daily_weekly_data = function (request_data, response_data) {
    var request_data_body = request_data.body;
    console.log("insert_daily_weekly_data");
    var city_id = request_data_body.city_id;
    var add_data_type = request_data_body.add_data_type; // 0 for Daily and 1 for weekly
    var today_end_date = request_data_body.today_end_date;


    City.findOne({_id: city_id}).then((city_detail) => {
        if (city_detail) {
            var city_timezone = city_detail.timezone;
            if (add_data_type == "1" || add_data_type == 1) {
                console.log("ADD WEEKLY DATA");
                //cron.setWeeklyData(city_detail._id,today_end_date,city_timezone);
            } else {
                console.log("ADD DAILY DATA");
                cron.setDailyAnalytics(city_detail._id, today_end_date, city_timezone); 
            }
            response_data.json({success: true});
        } else {
            response_data.json({success: false});
        }
    }, (error) => {
        console.log(error);
        response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
        });
    });


};
var xlsx = require('node-xlsx');



exports.updateItemNewTable = function (request_data, response_data) {
    utils.updateItemNewTable(request_data, response_data);
    //response_data.json({success: true,SETTINGS_DETAILS:SETTINGS_DETAILS});
};


exports.updateDatabaseTable = function (request_data, response_data) {

    var request_data_body = request_data.body;
    var present_store_id = request_data_body.present_store_id;
    var new_store_id = request_data_body.new_store_id;
    var type = 2;

    utils.updateNewTable(request_data, response_data);
    response_data.json({success: true});
};

//// get setting detail
exports.get_setting_detail = function (request_data, response_data) {
    Setting.findOne({},{"password": 0, "email": 0}).then((setting) => {
        if (!setting) {
            response_data.json({success: false, error_code: SETTING_ERROR_CODE.SETTING_DETAILS_NOT_FOUND});
        } else {
            response_data.json({success: true,
                message: SETTING_MESSAGE_CODE.SETTING_DETAIL_LIST_SUCCESSFULLY,
                setting: setting
            });
        }
    }, (error) => {
        console.log(error);
        response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
        });
    });
};

//// get_setting_detail_for_mail_config
exports.get_setting_detail_for_mail_config = function (request_data, response_data) {
    Setting.findOne({}).then((setting) => {
        if (!setting) {
            response_data.json({success: false, error_code: SETTING_ERROR_CODE.SETTING_DETAILS_NOT_FOUND});
        } else {
            response_data.json({success: true,
                message: SETTING_MESSAGE_CODE.SETTING_DETAIL_LIST_SUCCESSFULLY,
                setting: setting
            });
        }
    }, (error) => {
        console.log(error);
        response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
        });
    });
};

// check_detail
exports.check_detail = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {
            var request_data_body = request_data.body;
            var type = request_data_body.type;
            var Table;
            switch (type) {
                case "user":
                    Table = User;
                    break;
                case "provider":
                    Table = Provider;
                    break;
                case "store":
                    Table = Store;
                    break;
                case "admin":
                    Table = Admin;
                    break;
                default:
                    break;
            }
            Table.findOne({_id: request_data_body.id}).then((detail) => {
                if (detail) {
                    if (request_data_body.server_token !== null && detail.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.TOKEN_EXPIRED});
                    } else
                    {
                        response_data.json({success: true,
                            message: MESSAGE_CODE.DETAIL_VALID
                        });
                    }
                } else
                {
                    response_data.json({success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND});
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

// new_password
exports.new_password = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var type = request_data_body.type;
            switch (type) {
                case "user":
                    Table = User;
                    break;
                case "provider":
                    Table = Provider;
                    break;
                case "store":
                    Table = Store;
                    break;
                case "admin":
                    Table = Admin;
                    break;
                default:
                    break;
            }
            Table.findOne({_id: request_data_body.id}).then((detail) => {
                if (detail) {
                    if (request_data_body.server_token !== null && detail.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {
                        detail.password = utils.encryptPassword(request_data_body.password);
                        detail.server_token = utils.generateServerToken(32);

                        detail.save(function (error) {


                            if (error) {
                                response_data.json({success: false, error_code: ERROR_CODE.SET_PASSWORD_FAILED});
                            } else {


                                response_data.json({success: true,
                                    message: MESSAGE_CODE.PASSWORD_SET_SUCESSFULLY

                                });
                            }
                        });
                    }
                } else
                {
                    response_data.json({success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND});
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

// check_referral 
exports.check_referral = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var type = Number(request_data_body.type); // 7 = User , 8 = Provider , 2 = Store

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

            Table.findOne({referral_code: request_data_body.referral_code}).then((detail) => {
                if (detail)
                {
                    // details.forEach(function (detail) {
                    if (detail.country_id == request_data_body.country_id)
                    {

                        Country.findOne({_id: detail.country_id}, function (error, country) {


                            var refferal_count = detail.total_referrals;
                            var no_of_use_referral = 0;

                            switch (type) {
                                case ADMIN_DATA_ID.USER:
                                    no_of_use_referral = country.no_of_user_use_referral;
                                    break;
                                case ADMIN_DATA_ID.PROVIDER:
                                    no_of_use_referral = country.no_of_provider_use_referral;
                                    break;
                                case ADMIN_DATA_ID.STORE:
                                    no_of_use_referral = country.no_of_store_use_referral;
                                    break;
                                default:
                                    break;
                            }


                            if (refferal_count < no_of_use_referral) {

                                response_data.json({
                                    success: true, message: USER_MESSAGE_CODE.VALID_REFERRAL_CODE
                                });
                            } else {
                                response_data.json({success: false, error_code: USER_ERROR_CODE.REFERRAL_CODE_OUT_OF_USES_LIMIT_IN_YOUR_COUNTRY});

                            }
                        });

                    } else
                    {
                        response_data.json({success: false, error_code: USER_ERROR_CODE.INVALID_REFERRAL_FOR_YOUR_COUNTRY});

                    }
                } else
                {
                    response_data.json({success: false, error_code: USER_ERROR_CODE.INVALID_REFERRAL});
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


// forgot_password
exports.forgot_password = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var type = Number(request_data_body.type); // 7 = User , 8 = Provider , 2 = Store

            switch (type) {
                case ADMIN_DATA_ID.USER:
                    Table = User;
                    string = "user";
                    break;
                case ADMIN_DATA_ID.PROVIDER:
                    Table = Provider;
                    string = "provider";
                    break;
                case ADMIN_DATA_ID.STORE:
                    Table = Store;
                    string = "store";
                    break;
                case ADMIN_DATA_ID.ADMIN:
                    Table = Admin;
                    string = "admin";
                    break;
                default:
                    break;
            }

            Table.findOne({email: request_data_body.email}).then((detail) => {
                if (detail) {
                    var token = utils.getEmailTokenUsingID(detail._id);
                    var email_token = token.email_token;
                    var server_token = token.server_token;
                    detail.server_token = server_token;

                    var password_link = request_data.protocol + '://' + request_data.get('host') + "/" + string + "/new_password/" + email_token;
                    emails.userForgotPassword(request_data, detail, password_link, type);

                    detail.save(function (error) {
                        if (error) {
                            response_data.json({success: false, error_code: ERROR_CODE.SET_PASSWORD_FAILED});
                        } else {
                            response_data.json({success: true,
                                message: MESSAGE_CODE.PASSWORD_SET_SUCESSFULLY
                            });
                        }
                    });

                } else
                {
                    response_data.json({success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND});
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



exports.otp_verification = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var type = Number(request_data_body.type); //7 = User  8 = Provider  2 = Store
            var email = request_data_body.email;
            var phone = request_data_body.phone;
            var country_phone_code = request_data_body.country_phone_code;

            var phone_with_code = country_phone_code + phone;
            var error_code = 0;
            var otp_for_email = "";
            var otp_for_sms = "";

            switch (type) {
                case ADMIN_DATA_ID.USER:
                    User.findOne({email: email}).then((user_email_data) => {
                        User.findOne({phone: phone}).then((user_phone_data) => {


                            if (setting_detail.is_user_mail_verification && email != undefined)
                            {
                                if (user_email_data && user_email_data.is_email_verified == true)
                                {
                                    error_code = USER_ERROR_CODE.EMAIL_ALREADY_REGISTRED;

                                } else
                                {
                                    otp_for_email = utils.generateOtp(6);

                                }

                            }

                            if (setting_detail.is_user_sms_verification && phone != undefined)
                            {
                                if (user_phone_data && user_phone_data.is_phone_number_verified == true)
                                {
                                    if (error_code == 0)
                                    {
                                        error_code = USER_ERROR_CODE.PHONE_NUMBER_ALREADY_REGISTRED;
                                    } else
                                    {
                                        error_code = USER_ERROR_CODE.EMAIL_AND_PHONE_ALREADY_REGISTERED;
                                    }
                                } else
                                {
                                    otp_for_sms = utils.generateOtp(6);
                                }
                            }

                            if (error_code == 0) {


                                if (phone != undefined)
                                {
                                    // sms user OTP verification
                                    if (setting_detail.is_sms_notification) {
                                        SMS.sendSmsForOTPVerificationAndForgotPassword(phone_with_code, SMS_UNIQUE_ID.USER_OTP, otp_for_sms);
                                    }
                                }
                                if (email != undefined)
                                {
                                    // mail user OTP verification
                                    if (setting_detail.is_mail_notification) {

                                        emails.emailForOTPVerification(request_data, email, otp_for_email, EMAIL_UNIQUE_ID.USER_OTP_VERIFICATION);

                                    }


                                }
                                response_data.json({success: true, message: USER_MESSAGE_CODE.GET_OTP_SUCCESSFULLY, otp_for_email: otp_for_email, otp_for_sms: otp_for_sms});
                            } else {
                                response_data.json({success: false, error_code: error_code});
                            }

                        });
                    });

                    break;
                case ADMIN_DATA_ID.PROVIDER:
                    Provider.findOne({email: email}).then((provider_email_data) => {
                        Provider.findOne({phone: phone}).then((provider_phone_data) => {

                            if (setting_detail.is_provider_mail_verification && email != undefined)
                            {
                                if (provider_email_data && provider_email_data.is_email_verified == true)
                                {
                                    error_code = PROVIDER_ERROR_CODE.EMAIL_ALREADY_REGISTRED;

                                } else
                                {
                                    otp_for_email = utils.generateOtp(6);

                                }

                            }

                            if (setting_detail.is_provider_sms_verification && phone != undefined)
                            {
                                if (provider_phone_data && provider_phone_data.is_phone_number_verified == true)
                                {
                                    if (error_code == 0)
                                    {
                                        error_code = PROVIDER_ERROR_CODE.PHONE_NUMBER_ALREADY_REGISTRED;
                                    } else
                                    {
                                        error_code = PROVIDER_ERROR_CODE.EMAIL_AND_PHONE_ALREADY_REGISTERED;
                                    }
                                } else
                                {
                                    otp_for_sms = utils.generateOtp(6);
                                }
                            }

                            if (error_code == 0) {

                                if (phone != undefined)
                                {
                                    /// sms provider OTP verification
                                    if (setting_detail.is_sms_notification) {
                                        SMS.sendSmsForOTPVerificationAndForgotPassword(phone_with_code, SMS_UNIQUE_ID.PROVIDER_OTP, otp_for_sms);
                                    }
                                }
                                if (email != undefined)
                                {
                                    // mail provider OTP verification
                                    if (setting_detail.is_mail_notification) {

                                        emails.emailForOTPVerification(request_data, email, otp_for_email, EMAIL_UNIQUE_ID.PROVIDER_OTP_VERIFICATION);

                                    }


                                }
                                response_data.json({success: true, message: PROVIDER_MESSAGE_CODE.GET_OTP_SUCCESSFULLY, otp_for_email: otp_for_email, otp_for_sms: otp_for_sms});
                            } else {
                                response_data.json({success: false, error_code: error_code});
                            }


                        });
                    });

                    break;
                case ADMIN_DATA_ID.STORE:

                    Store.findOne({email: email}).then((store_email_data) => {
                        Store.findOne({phone: phone}).then((store_phone_data) => {
                            if (setting_detail.is_store_mail_verification && email != undefined)
                            {
                                if (store_email_data && store_email_data.is_email_verified == true)
                                {
                                    error_code = STORE_ERROR_CODE.EMAIL_ALREADY_REGISTRED;
                                } else
                                {
                                    otp_for_email = utils.generateOtp(6);
                                }
                            }

                            if (setting_detail.is_store_sms_verification && phone != undefined)
                            {
                                if (store_phone_data && store_phone_data.is_phone_number_verified == true)
                                {
                                    if (error_code == 0)
                                    {
                                        error_code = STORE_ERROR_CODE.PHONE_NUMBER_ALREADY_REGISTRED;
                                    } else
                                    {
                                        error_code = STORE_ERROR_CODE.EMAIL_AND_PHONE_ALREADY_REGISTERED;
                                    }
                                } else
                                {
                                    otp_for_sms = utils.generateOtp(6);
                                }
                            }

                            if (error_code == 0) {

                                if (phone != undefined)
                                {
                                    // sms store OTP verification
                                    if (setting_detail.is_sms_notification) {
                                        SMS.sendSmsForOTPVerificationAndForgotPassword(phone_with_code, SMS_UNIQUE_ID.STORE_OTP, otp_for_sms);
                                    }
                                }
                                if (email != undefined)
                                {
                                    // mail store OTP verification
                                    if (setting_detail.is_mail_notification) {

                                        emails.emailForOTPVerification(request_data, email, otp_for_email, EMAIL_UNIQUE_ID.STORE_OTP_VERIFICATION);

                                    }
                                }
                                response_data.json({success: true, message: STORE_MESSAGE_CODE.GET_OTP_SUCCESSFULLY, otp_for_email: otp_for_email, otp_for_sms: otp_for_sms});
                            } else {
                                response_data.json({success: false, error_code: error_code});
                            }


                        });
                    });

                    break;
                default:
                    break;
            }
        } else {
            response_data.json(response);
        }
    });
};

exports.upload_store_data_excel = function (request_data, response_data) {
   
    var type = Number(request_data.body.type);
    var store_id = request_data.body.store_id;
 
    if(request_data.files.length>0){
        var obj = xlsx.parse(fs.readFileSync(request_data.files[0].path));
        var array_of_data =  obj[0].data;
        switch (type) {
            case IMPORT_STORE_DATA.PRODUCT:
                exports.add_product_data(array_of_data, store_id, response_data)
                break;
            case IMPORT_STORE_DATA.ITEM:
                exports.add_item_data(array_of_data, store_id, response_data)
                break;
            case IMPORT_STORE_DATA.SPECIFICATION_GROUP:
                exports.add_specification_group_data(array_of_data, store_id, response_data)
                break;
            case IMPORT_STORE_DATA.SPECIFICATION:
                exports.add_specification_data(array_of_data, store_id, response_data)
                break;
            case IMPORT_STORE_DATA.ITEM_SPECIFICATION:
                exports.add_item_specification_data(array_of_data, store_id, response_data)
                break;
            case IMPORT_STORE_DATA.UPDATE_ITEM_SPECIFICATION:
                exports.update_item_specification_data(array_of_data, store_id, response_data)
                break;
            default:
                response_data.json({success: false});
        }
    } else {
        response_data.json({success: false});
    }
};

exports.add_product_data = function (array_of_data, store_id, res) {

    var size = array_of_data.length;
    var data = [];
    for (var i = 1; i < size; i++) {
        if (array_of_data[i].length > 0) {
            data = array_of_data[i];
            var p = new Product({
                name: data[1],
                is_visible_in_store: true,
                store_id: store_id
            });
            p.save(function (error) {
                console.log(error)
            });
        }
    }

    res.json({"success": true});
}

exports.add_item_data = function (array_of_data, store_id, res) {

    var size = array_of_data.length;
    var i = 0;
    var products = [];
    var product_unique_id = -1;
    var product = null;

    for (i = 1; i < size; i++) {
        product_unique_id = array_of_data[i][0];
        if (product_unique_id) {
            product = products.find(product => product.product_unique_id === product_unique_id);
            if (product) {
                product.items.push(array_of_data[i]);
            } else {
                var items = [];
                items.push(array_of_data[i]);
                product = {product_unique_id: product_unique_id, product_name: array_of_data[i][1], items: items};
                products.push(product);
            }
        }
    }
    size = products.length;
    for (i = 0; i < size; i++) {
        add_item_data_inside_product(products[i].product_unique_id, products[i].product_name, products[i].items, store_id);
    }

    res.json({"success": true});
}

function add_item_data_inside_product( id , name , items , store_id) {
    console.log("add_item_data_inside_product")
    Product.findOne({store_id: store_id,
        $or: [{unique_id_for_store_data: id}, {name: name}]
    }).then((product_data) => {

        var size = items.length;
        var data = [];
        for (var i = 0; i < size; i++) {
            data = items[i];

            var p = new Item({
                product_id: product_data._id,
                name: data[3],
                details: data[4],
                price: data[5],
                tax: data[6],
                unique_id_for_store_data : data[2],
                store_id: store_id
            });
            p.save(function (error) {
                console.log(error)
            });
        }
    }, (error) => {

    });

}

exports.add_specification_group_data = function (array_of_data, store_id, res) {

    var size = array_of_data.length;
    var data = [];
    for (var i = 1; i < size; i++) {
        if (array_of_data[i].length > 0) {
            data = array_of_data[i];
            var sg = new Specification_group({
                name: data[1],
                unique_id_for_store_data: data[0],
                store_id: store_id
            });
            sg.save();
        }
    }

    res.json({"success": true});
}

exports.add_specification_data = function (array_of_data, store_id, res) {

    var size = array_of_data.length;
    var i = 0;
    var specification_groups = [];
    var specification_group_unique_id = -1;
    var specification_group = null;

    for ( i = 1; i < size; i++) {
        specification_group_unique_id = array_of_data[i][0] ;
        if (specification_group_unique_id) {
            specification_group = specification_groups.find(product => product.specification_group_unique_id === specification_group_unique_id);
            if (specification_group) {
                specification_group.specifications.push(array_of_data[i]);
            } else {
                var specifications = [];
                specifications.push(array_of_data[i]);
                specification_group = {specification_group_unique_id: specification_group_unique_id, specification_group_unique_name: array_of_data[i][1], specifications: specifications};
                specification_groups.push(specification_group);
            }
        }
    }
    size = specification_groups.length;
    for ( i = 0; i < size; i++) {
        add_specification_data_inside_specification_group(specification_groups[i].specification_group_unique_id , specification_groups[i].specification_group_unique_name, specification_groups[i].specifications, store_id);
    }

    res.json({"success": true});
}

function add_specification_data_inside_specification_group( id , name , items, store_id ) {

    Specification_group.findOne({store_id: store_id,
        $or: [{unique_id_for_store_data: id}]
    }).then((specification_group) => {
        var size = items.length;
        var data = [];
        for (var i = 0; i < size; i++) {
            data = items[i];

            var sp = new Specification({
                specification_group_id: specification_group._id,
                name: data[3],
                price: data[4],
                unique_id_for_store_data: data[2],
                store_id: store_id
            });
            sp.save();
        }
    }, (error) => {

    });

}

// ADD ITEM SPECIFICATION
exports.add_item_specification_data = function (array_of_data, store_id,  res) {

    var size = array_of_data.length;
    var i = 0;
    var items = [] ;
    var item_id = -1;
    var item = null;

    for (i = 1; i < size; i++) {
        item_id = array_of_data[i][0];
        if (item_id) {
            item = items.find(product => product.item_id === item_id);
            if (item) {
                item.item_data.push(array_of_data[i]);
            } else {
                var item_data = [];
                item_data.push(array_of_data[i]);
                item = {item_id: item_id, item_name: array_of_data[i][1], item_data: item_data};
                items.push(item);
            }
        }

    }
    size = items.length;
    for ( i = 0; i < size; i++) {
        copy_specifications_group_in_items(items[i].item_id , items[i].item_name, items[i].item_data, store_id );
    }

    res.json({"success": true});
}

function copy_specifications_group_in_items(item_id, item_name, item_data, store_id) {
    Item.findOne({store_id: store_id, unique_id_for_store_data: item_id}, function (error, item) {

        var specifications_unique_id_count = 0;
        if(item){
            specifications_unique_id_count = item.specifications_unique_id_count;
        }
        var size = item_data.length;
        var specification_groups = [];
        var specification_group = null;
        var specification_group_unique_id = -1;
        var i = 0;
        var specification_group_id = [];

        for (i = 0; i < size; i++) {
            specification_group_unique_id = item_data[i][2];
            specification_group = specification_groups.find(product => product.specification_group_unique_id === specification_group_unique_id);

            if (specification_group) {
                specification_group.specifications.push(item_data[i]);
            } else {
                var specifications = [];
                specifications.push(item_data[i]);
                specifications_unique_id_count++;
                specification_group = { specification_group_unique_id: specification_group_unique_id, specification_group_unique_name: item_data[i][3], specifications: specifications , specifications_unique_id_count : specifications_unique_id_count};
                specification_groups.push(specification_group);
                specification_group_id.push(specification_group_unique_id)
            }
        }

        var specification_lookup = {
            $lookup: {
                from: "specifications",
                localField: "_id",
                foreignField: "specification_group_id",
                as: "specification_list"
            }
        }
        var store_condition = {$match: {'store_id': mongoose.Types.ObjectId(store_id)}}
        var unique_id_condition = {$match: {'unique_id_for_store_data': {$in: specification_group_id}}}
        Specification_group.aggregate([store_condition, unique_id_condition, specification_lookup], function (error, specification_group_list) {
                specification_groups.forEach(function (sp_gp) {
                    var index = specification_group_list.findIndex((specification_group)=>specification_group.unique_id_for_store_data == sp_gp.specification_group_unique_id)
                    console.log("index: "+ index)
                    var specification_list = specification_group_list[index].specification_list;

                    var range = sp_gp.specifications[0][4];
                    var max_range = sp_gp.specifications[0][5];
                    var is_required = false;
                    var type = 2;

                    if (range == 1 && max_range == 0) {
                        type = 1;
                        is_required = true;
                    }

                    var create_new_specification_group_for_item = {
                        'unique_id': sp_gp.specifications_unique_id_count,
                        'type': type,
                        'max_range': max_range,
                        'range': range,
                        'name': sp_gp.specifications[0][3],
                        'is_required': is_required,
                        '_id': specification_group_list[index]._id.toString(),
                        'list': []};
                    var list = [];
                    sp_gp.specifications.forEach(function (sp_list) {
                        var list_index = specification_list.findIndex((list)=>list.unique_id_for_store_data == Number(sp_list[6]));
                        if(list_index !== -1){
                            var new_list = {
                                specification_group_id: create_new_specification_group_for_item._id.toString(),
                                _id: specification_list[list_index]._id.toString(),
                                is_user_selected: true,
                                is_default_selected: sp_list[9],
                                price: sp_list[8],
                                name: sp_list[7],
                                unique_id: sp_list.unique_id };
                            list.push(new_list)
                        }
                    });
                    create_new_specification_group_for_item.list = list;

                    item.specifications.push(create_new_specification_group_for_item);
                })
            item.specifications_unique_id_count = specifications_unique_id_count;
            item.save();
        })

    });
}

exports.update_item_specification_data = function (array_of_data, store_id,  res) {

    var size = array_of_data.length;
    var i = 0;
    var items = [] ;
    var item_id = -1;
    var item = null;

    for (i = 1; i < size; i++) {
        item_id = array_of_data[i][0];
        if (item_id) {
            item = items.find(product => product.item_id === item_id);
            if (item) {
                item.item_data.push(array_of_data[i]);
            } else {
                var item_data = [];
                item_data.push(array_of_data[i]);
                item = {item_id: item_id, item_name: array_of_data[i][1], item_data: item_data};
                items.push(item);
            }
        }

    }
    size = items.length;
    for ( i = 0; i < size; i++) {
        update_specifications_group_in_items(items[i].item_id , items[i].item_name, items[i].item_data, store_id );
    }

    res.json({"success": true});
}

function update_specifications_group_in_items(item_id, item_name, item_data, store_id) {
    Item.findOne({store_id: store_id, unique_id_for_store_data: item_id}, function (error, item) {

        var specifications_unique_id_count = 0;
        if(item){
            specifications_unique_id_count = item.specifications_unique_id_count;
        }
        item.specifications = [];
        var size = item_data.length;
        var specification_groups = [];
        var specification_group = null;
        var specification_group_unique_id = -1;
        var i = 0;
        var specification_group_id = [];

        for (i = 0; i < size; i++) {
            specification_group_unique_id = item_data[i][2];
            specification_group = specification_groups.find(product => product.specification_group_unique_id === specification_group_unique_id);

            if (specification_group) {
                specification_group.specifications.push(item_data[i]);
            } else {
                var specifications = [];
                specifications.push(item_data[i]);
                specifications_unique_id_count++;
                specification_group = { specification_group_unique_id: specification_group_unique_id, specification_group_unique_name: item_data[i][3], specifications: specifications , specifications_unique_id_count : specifications_unique_id_count};
                specification_groups.push(specification_group);
                specification_group_id.push(specification_group_unique_id)
            }
        }

        var specification_lookup = {
            $lookup: {
                from: "specifications",
                localField: "_id",
                foreignField: "specification_group_id",
                as: "specification_list"
            }
        }
        var store_condition = {$match: {'store_id': mongoose.Types.ObjectId(store_id)}}
        var unique_id_condition = {$match: {'unique_id_for_store_data': {$in: specification_group_id}}}
        Specification_group.aggregate([store_condition, unique_id_condition, specification_lookup], function (error, specification_group_list) {
            specification_groups.forEach(function (sp_gp) {
                var index = specification_group_list.findIndex((specification_group)=>specification_group.unique_id_for_store_data == sp_gp.specification_group_unique_id)
                console.log("index: "+ index)
                var specification_list = specification_group_list[index].specification_list;

                var range = sp_gp.specifications[0][4];
                var max_range = sp_gp.specifications[0][5];
                var is_required = false;
                var type = 2;

                if (range == 1 && max_range == 0) {
                    type = 1;
                    is_required = true;
                }

                var create_new_specification_group_for_item = {
                    'unique_id': sp_gp.specifications_unique_id_count,
                    'type': type,
                    'max_range': max_range,
                    'range': range,
                    'name': sp_gp.specifications[0][3],
                    'is_required': is_required,
                    '_id': specification_group_list[index]._id.toString(),
                    'list': []};
                var list = [];
                sp_gp.specifications.forEach(function (sp_list) {
                    var list_index = specification_list.findIndex((list)=>list.unique_id_for_store_data == Number(sp_list[6]));
                    if(list_index !== -1){
                        var new_list = {
                            specification_group_id: create_new_specification_group_for_item._id.toString(),
                            _id: specification_list[list_index]._id.toString(),
                            is_user_selected: true,
                            is_default_selected: sp_list[9],
                            price: sp_list[8],
                            name: sp_list[7],
                            unique_id: sp_list.unique_id };
                        list.push(new_list)
                    }
                });
                create_new_specification_group_for_item.list = list;

                item.specifications.push(create_new_specification_group_for_item);
            })
            item.specifications_unique_id_count = specifications_unique_id_count;
            item.save();
        })

    });
}