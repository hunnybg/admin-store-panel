require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var console = require('../../utils/console');

var utils = require('../../utils/utils');
var Bank_detail = require('mongoose').model('bank_detail');
var Vaiter = require('mongoose').model('vaiter');
var User = require('mongoose').model('user');
var Store = require('mongoose').model('store');
var Payment_gateway = require('mongoose').model('payment_gateway');
var Country = require('mongoose').model('country');
var City = require('mongoose').model('city');

// add_bank_detail
exports.add_bank_detail = function (request_data, response_data) {
    console.log("------add_bank_detail-------");
    console.log(request_data.body);
    utils.check_request_params(request_data.body, [{ name: 'bank_account_holder_name', type: 'string' }, { name: 'bank_holder_type' }, { name: 'bank_holder_id', type: 'string' },
    { name: 'account_number', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var bank_account_holder_name = request_data_body.bank_account_holder_name;
            var bank_holder_type = Number(request_data_body.bank_holder_type);
            var social_id = request_data_body.social_id;
            var encrypted_password = request_data_body.password;
            encrypted_password = utils.encryptPassword(encrypted_password);
            var Table;
            switch (bank_holder_type) {
                case ADMIN_DATA_ID.USER:
                    Table = User;
                    break;
                case ADMIN_DATA_ID.VAITER:
                    Table = VAITER;
                    break;
                case ADMIN_DATA_ID.STORE:
                    Table = Store;
                    break;
                default:
                    break;
            }

            Table.findOne({ _id: request_data_body.bank_holder_id }).then((detail) => {

                if (detail) {
                    if (social_id == undefined || social_id == null || social_id == "") {
                        social_id = null;
                    }
                    if (social_id == null && encrypted_password != "" && encrypted_password != detail.password) {
                        response_data.json({ success: false, error_code: VAITER_ERROR_CODE.INVALID_PASSWORD });
                    } else if (social_id != null && detail.social_ids.indexOf(social_id) < 0) {
                        response_data.json({ success: false, error_code: VAITER_ERROR_CODE.VAITER_NOT_REGISTER_WITH_SOCIAL });
                    } else {
                        Country.findOne({ _id: detail.country_id }).then((country_detail) => {

                            if (!country_detail) {
                                response_data.json({ success: false, error_code: BANK_DETAIL_ERROR_CODE.BANK_DETAIL_ADD_FAILED, stripe_error: error.message });

                            } else {
                                City.findOne({ _id: detail.city_id }).then((city_detail) => {

                                    var city_name = "Toronto";
                                    if (city_detail) {
                                        city_name = city_detail.city_name;
                                    }
                                    console.log(request_data_body.bank_account_holder_name)
                                    console.log(request_data_body.account_number)
                                    console.log(request_data_body.account_holder_type)
                                    // console.log(request_data_body.routing_nu/mber)

                                    var country_code = country_detail.country_code;
                                    var currency_code = country_detail.currency_code;

                                    var first_name;
                                    var last_name;
                                    if (bank_holder_type == ADMIN_DATA_ID.STORE) {
                                        first_name = "Store - ";
                                        last_name = detail.name
                                    } else {
                                        first_name = detail.first_name;
                                        last_name = detail.last_name;
                                    }
                                    Payment_gateway.findOne({}).then((payment_gateway) => {
                                        if (payment_gateway) {
                                            var stripe_key = payment_gateway.payment_key;
                                            var stripe = require("stripe")(stripe_key);
                                            stripe.tokens.create({
                                                bank_account: {
                                                    country: country_code, // country_detail.alpha2
                                                    currency: currency_code,
                                                    account_holder_name: request_data_body.bank_account_holder_name,
                                                    account_holder_type: 'individual',
                                                    routing_number: request_data_body.routing_number,
                                                    account_number: request_data_body.account_number
                                                }
                                            }, function (error, token) {
                                                if (error) {
                                                    var error = error;
                                                    console.log("-----5-------");
                                                    console.log(error);
                                                    response_data.json({ success: false, error_code: BANK_DETAIL_ERROR_CODE.BANK_DETAIL_ADD_FAILED, stripe_error: error.message });

                                                } else {


                                                    var pictureData = request_data_body.document;
                                                    var pictureData_buffer = new Buffer(pictureData, 'base64');
                                                    stripe.fileUploads.create({
                                                        file: {
                                                            data: pictureData_buffer,
                                                            name: "document.jpg",
                                                            type: "application/octet-stream",
                                                        },
                                                        purpose: "identity_document",
                                                    }, function (error, fileUpload) {
                                                        var error = error;
                                                        if (error || !fileUpload) {
                                                            console.log("--------4-------");
                                                            console.log(error.message);
                                                            response_data.json({ success: false, error_code: BANK_DETAIL_ERROR_CODE.BANK_DETAIL_ADD_FAILED, stripe_error: error.message });

                                                        } else {
                                                            var dob = request_data_body.dob
                                                            dob = dob.split('-');
                                                            var phone_number = detail.country_phone_code + detail.phone;
                                                            stripe.accounts.create({
                                                                type: 'custom',
                                                                country: country_code, // country_detail.alpha2
                                                                email: detail.email,
                                                                requested_capabilities: ['card_payments'],
                                                                business_type: 'individual',
                                                                business_profile: {
                                                                    mcc: "1520",
                                                                    name: null,
                                                                    product_description: "We sell transportation services to passengers, and we charge once the job is complete",
                                                                    support_email: detail.email,
                                                                    support_phone: phone_number
                                                                },
                                                                individual: {
                                                                    first_name: first_name,
                                                                    last_name: last_name,
                                                                    email: detail.email,
                                                                    // ssn_last_4: request_data_body.personal_id_number,
                                                                    phone: phone_number,
                                                                    gender: request_data_body.gender,
                                                                    dob: {
                                                                        day: dob[0],
                                                                        month: dob[1],
                                                                        year: dob[2]
                                                                    },
                                                                    address: {
                                                                        city: city_name,
                                                                        country: country_code,
                                                                        line1: request_data_body.address,
                                                                        line2: request_data_body.address,
                                                                        postal_code: request_data_body.postal_code,
                                                                        state: request_data_body.state,
                                                                    },
                                                                    verification: {
                                                                        document: {
                                                                            back: fileUpload.id
                                                                            // front : fileUpload.id
                                                                        }
                                                                    }
                                                                }

                                                            }, function (error, account) {
                                                                var error = error;
                                                                if (error || !account) {
                                                                    console.log("---------3--------");
                                                                    console.log(error);
                                                                    response_data.json({ success: false, error_code: BANK_DETAIL_ERROR_CODE.BANK_DETAIL_ADD_FAILED, stripe_error: error.message });

                                                                } else {
                                                                    stripe.accounts.createExternalAccount(
                                                                        account.id,
                                                                        {
                                                                            external_account: token.id,
                                                                            default_for_currency: true
                                                                        },
                                                                        function (error, bank_account) {
                                                                            var error = error;
                                                                            if (error || !bank_account) {
                                                                                console.log("--------2--------");
                                                                                console.log(error);
                                                                                response_data.json({ success: false, error_code: BANK_DETAIL_ERROR_CODE.BANK_DETAIL_ADD_FAILED, stripe_error: error.message });

                                                                            } else {

                                                                                detail.account_id = account.id;
                                                                                detail.bank_id = bank_account.id;
                                                                                detail.save();

                                                                                stripe.accounts.update(account.id, {
                                                                                    tos_acceptance: {
                                                                                        date: Math.floor(Date.now() / 1000),
                                                                                        ip: request_data.connection.remoteAddress // Assumes you're not using a proxy
                                                                                    }
                                                                                }, function (error, update_bank_account) {

                                                                                    if (error || !update_bank_account) {
                                                                                        var error = error;
                                                                                        console.log("---------1--------");
                                                                                        console.log(error);
                                                                                        response_data.json({ success: false, error_code: BANK_DETAIL_ERROR_CODE.BANK_DETAIL_ADD_FAILED, stripe_error: error.message });

                                                                                    } else {
                                                                                        Bank_detail.find({ bank_holder_id: request_data_body.bank_holder_id, bank_holder_type: bank_holder_type }).then((bank_details) => {
                                                                                            //

                                                                                            var bank_detail = new Bank_detail({
                                                                                                bank_holder_type: bank_holder_type,
                                                                                                account_holder_type: request_data_body.account_holder_type,
                                                                                                bank_holder_id: request_data_body.bank_holder_id,
                                                                                                bank_account_holder_name: bank_account_holder_name,
                                                                                                routing_number: request_data_body.routing_number,
                                                                                                account_number: request_data_body.account_number,
                                                                                                account_id: account.id,
                                                                                                bank_id: bank_account.id


                                                                                            });

                                                                                            if (bank_details.length > 0) {
                                                                                                bank_detail.is_selected = false;
                                                                                                bank_detail.save();
                                                                                            } else {
                                                                                                bank_detail.is_selected = true;
                                                                                                bank_detail.save();
                                                                                            }

                                                                                            bank_detail.save().then(() => {
                                                                                                detail.selected_bank_id = bank_detail._id;
                                                                                                detail.save();
                                                                                                console.log("----6------");;
                                                                                                response_data.json({
                                                                                                    success: true, message: BANK_DETAIL_MESSAGE_CODE.BANK_DETAIL_ADD_SUCCESSFULLY,
                                                                                                    bank_detail: bank_detail
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
                                                                                });
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

// get bank detail
exports.get_bank_detail = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'bank_holder_type' }, { name: 'bank_holder_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var bank_holder_type = Number(request_data_body.bank_holder_type);
            var Table;
            switch (bank_holder_type) {
                case ADMIN_DATA_ID.USER:
                    Table = User;
                    break;
                case ADMIN_DATA_ID.VAITER:
                    Table = VAITER;
                    break;
                case ADMIN_DATA_ID.STORE:
                    Table = Store;
                    break;
                default:
                    break;
            }

            Table.findOne({ _id: request_data_body.bank_holder_id }).then((detail) => {

                if (detail) {
                    if (request_data_body.server_token !== null && detail.server_token != request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    } else {

                        Bank_detail.find({ bank_holder_type: bank_holder_type, bank_holder_id: request_data_body.bank_holder_id }).then((bank_detail) => {
                            if (bank_detail.length == 0) {
                                response_data.json({ success: false, error_code: BANK_DETAIL_ERROR_CODE.BANK_DETAIL_NOT_FOUND });
                            } else {
                                response_data.json({
                                    success: true, message: BANK_DETAIL_MESSAGE_CODE.BANK_DETAIL_LIST_SUCCESSFULLY,
                                    bank_detail: bank_detail
                                });
                            }
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





// Delete bank detail
exports.delete_bank_detail = function (request_data, response_data) {
    console.log("---delete bank detail--------------------")
    console.log(request_data.body)
    utils.check_request_params(request_data.body, [{ name: 'bank_holder_id', type: 'string' }, { name: 'bank_holder_type', }, { name: 'bank_detail_id', type: 'string' }], function (response) {
        // console.log(response.success)
        if (response.success) {

            var request_data_body = request_data.body;
            var bank_holder_type = Number(request_data_body.bank_holder_type);
            var social_id = request_data_body.social_id;
            var encrypted_password = request_data_body.password;
            encrypted_password = utils.encryptPassword(encrypted_password);
            var Table;
            switch (bank_holder_type) {
                case ADMIN_DATA_ID.USER:
                    Table = User;
                    break;
                case ADMIN_DATA_ID.VAITER:
                    Table = VAITER;
                    break;
                case ADMIN_DATA_ID.STORE:
                    Table = Store;
                    break;
                default:
                    break;
            }
            // console.log(Table)
            Table.findOne({ _id: request_data_body.bank_holder_id }).then((detail) => {
                if (detail) {
                    if (social_id == undefined || social_id == null || social_id == "") {
                        social_id = null;
                    }
                    if (social_id == null && encrypted_password != "" && encrypted_password != detail.password) {
                        response_data.json({ success: false, error_code: VAITER_ERROR_CODE.INVALID_PASSWORD });
                    } else if (social_id != null && detail.social_ids.indexOf(social_id) < 0) {
                        response_data.json({ success: false, error_code: VAITER_ERROR_CODE.VAITER_NOT_REGISTER_WITH_SOCIAL });
                    } else {
                        var bank_detail_id = request_data_body.bank_detail_id;
                        Bank_detail.findOne({ _id: bank_detail_id, bank_holder_type: bank_holder_type, bank_holder_id: request_data_body.bank_holder_id }).then((bank_detail) => {
                            if (bank_detail) {
                                Payment_gateway.findOne({}).then((payment_gateway) => {
                                    if (payment_gateway) {
                                        var stripe_key = payment_gateway.payment_key;
                                        var stripe = require("stripe")(stripe_key);
                                        stripe.accounts.del(bank_detail.account_id, function (error, stripe_delete) {
                                            var error = error;
                                            console.log("stripe account delete error")
                                            console.log(error)
                                            if (error || !stripe_delete) {
                                                response_data.json({ success: false, error_code: BANK_DETAIL_ERROR_CODE.BANK_DETAIL_DELETE_FAILED });
                                            } else {
                                                Bank_detail.remove({ _id: bank_detail_id, bank_holder_type: bank_holder_type }).then(() => {

                                                    Bank_detail.find({ bank_holder_type: bank_holder_type, bank_holder_id: request_data_body.bank_holder_id }).then((bank_detail) => {

                                                        response_data.json({
                                                            success: true,
                                                            message: BANK_DETAIL_MESSAGE_CODE.BANK_DETAIL_DELETE_SUCCESSFULLY,
                                                            bank_detail: bank_detail
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
                                        });

                                    }
                                });
                            } else {
                                response_data.json({ success: false, error_code: BANK_DETAIL_ERROR_CODE.BANK_DETAIL_DELETE_FAILED });

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

// select_bank_detail
exports.select_bank_detail = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'bank_holder_type' }, { name: 'bank_holder_id', type: 'string' }, { name: 'bank_detail_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var bank_holder_type = Number(request_data_body.bank_holder_type);
            var Table;
            switch (bank_holder_type) {
                case ADMIN_DATA_ID.USER:
                    Table = User;
                    break;
                case ADMIN_DATA_ID.VAITER:
                    Table = VAITER;
                    break;
                case ADMIN_DATA_ID.STORE:
                    Table = Store;
                    break;
                default:
                    break;
            }

            Table.findOne({ _id: request_data_body.bank_holder_id }).then((detail) => {

                if (detail) {
                    if (request_data_body.server_token !== null && detail.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    } else {
                        Bank_detail.findOne({ _id: request_data_body.bank_detail_id, bank_holder_type: bank_holder_type, bank_holder_id: request_data_body.bank_holder_id }).then((bank_detail) => {

                            if (!bank_detail) {
                                response_data.json({ success: false, error_code: BANK_DETAIL_ERROR_CODE.BANK_DETAIL_NOT_FOUND });
                            } else {
                                bank_detail.is_selected = true;
                                bank_detail.save().then(() => {
                                    Bank_detail.findOneAndUpdate({ _id: { $nin: request_data_body.bank_detail_id }, bank_holder_type: bank_holder_type, bank_holder_id: request_data_body.bank_holder_id, is_selected: true }, { is_selected: false }).then((bank_details) => {

                                        detail.selected_bank_id = bank_detail._id;
                                        detail.save();
                                        response_data.json({
                                            success: true, message: BANK_DETAIL_MESSAGE_CODE.BANK_DETAIL_SELECT_SUCCESSFULLY
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
                        }, (error) => {
                            console.log(error);
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
                } else {

                    response_data.json({ success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND });
                }
            });
        } else {
            response_data.json(response);
        }
    });
};
