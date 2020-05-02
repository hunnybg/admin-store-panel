require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var utils = require('../../utils/utils');
var Provider = require('mongoose').model('provider');
var Store = require('mongoose').model('store');
var User = require('mongoose').model('user');
var Country = require('mongoose').model('country');
var Wallet = require('mongoose').model('wallet');
var wallet_history = require('../../controllers/user/wallet');
var console = require('../../utils/console');


// ADD WALLET
exports.add_wallet_amount = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'type'}, {name: 'wallet'}, {name: 'payment_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var type = Number(request_data_body.type); // 7 = User , 8 = Provider , 2 = Store
            var Table;
            switch (type) {
                case ADMIN_DATA_ID.USER:
                    type = ADMIN_DATA_ID.USER;
                    Table = User;
                    break;
                case ADMIN_DATA_ID.PROVIDER:
                    type = ADMIN_DATA_ID.PROVIDER;
                    Table = Provider;
                    break;
                case ADMIN_DATA_ID.STORE:
                    type = ADMIN_DATA_ID.STORE;
                    Table = Store;
                    break;
                default:
                    Table = User;
                    type = ADMIN_DATA_ID.USER;
                    break;
            }

            Table.findOne({_id: request_data_body.user_id}).then((detail) => {
                if (detail) {
                    if (request_data_body.server_token !== null && detail.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {

                        var payment_id = request_data_body.payment_id;
                        var wallet = utils.precisionRoundTwo(Number(request_data_body.wallet));

                        utils.pay_payment_for_selected_payment_gateway(0, detail._id, payment_id, wallet, detail.wallet_currency_code, function (payment_paid) {

                            if (payment_paid) {

                                Country.findOne({_id: detail.country_id}).then((country) => {

                                    if (country && setting_detail) {
                                        var wallet_currency_code = country.currency_code;

                                        var total_wallet_amount = wallet_history.add_wallet_history(type, detail.unique_id, detail._id, detail.country_id, wallet_currency_code, wallet_currency_code,
                                                1, wallet, detail.wallet, WALLET_STATUS_ID.ADD_WALLET_AMOUNT, WALLET_COMMENT_ID.ADDED_BY_CARD, "Card : " + payment_paid.card_number)

                                        detail.wallet = total_wallet_amount;
                                        detail.save().then(() => {
                                                response_data.json({
                                                    success: true,
                                                    message: USER_MESSAGE_CODE.WALLET_AMOUNT_ADD_SUCCESSFULLY,
                                                    wallet: detail.wallet,
                                                    wallet_currency_code: detail.wallet_currency_code
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
                                response_data.json({success: false, error_code: USER_ERROR_CODE.WALLET_AMOUNT_ADD_FAILED});
                            }

                        });
                    }
                } else
                {
                    response_data.json({success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND});
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

// CHANGE WALLET STATUS
exports.change_user_wallet_status = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            User.findOne({_id: request_data_body.user_id}).then((user) => {
                if (user)
                {
                    if (request_data_body.server_token !== null && user.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});

                    } else
                    {
                        var status = request_data_body.is_use_wallet;
                        user.is_use_wallet = status;
                        user.save().then(() => {
                                response_data.json({success: true, message: USER_MESSAGE_CODE.CHANGE_WALLET_STATUS_SUCCESSFULLY,
                                    is_use_wallet: user.is_use_wallet});
                        }, (error) => {
                            console.log(error)
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
                } else
                {
                    response_data.json({success: false, error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND});
                }
            });
        } else {
            response_data.json(response);
        }
    });
};

// get_wallet_history
exports.get_wallet_history = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'type'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var type = Number(request_data_body.type);
            var Table;
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

            Table.findOne({_id: request_data_body.id}).then((detail) => {
                if (detail) {
                    if (request_data_body.server_token !== null && detail.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {
                        Wallet.find({user_id: request_data_body.id, user_type: type}, null, {sort: {'unique_id': -1}}).then((wallet_history) => {

                            if (wallet_history.length == 0) {
                                response_data.json({success: false, error_code: WALLET_REQUEST_ERROR_CODE.WALLET_HISTORY_NOT_FOUND});
                            } else {
                                response_data.json({success: true,
                                    message: WALLET_REQUEST_MESSAGE_CODE.WALLET_HISTORY_GET_SUCCESSFULLY,
                                    wallet_history: wallet_history
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

// add_wallet_history
exports.add_wallet_history = function (user_type, user_unique_id, user_id, country_id, from_currency_code, to_currency_code,
        current_rate, from_amount, wallet_amount, wallet_status, wallet_comment_id, wallet_description , wallet_information) {


    var wallet_payment_in_user_currency = 0;
    var total_wallet_amount = 0;

    if (wallet_status % 2 == 0)
    {
        wallet_payment_in_user_currency = utils.precisionRoundTwo(from_amount / current_rate);
        total_wallet_amount = wallet_amount - wallet_payment_in_user_currency;
    } else
    {
        current_rate = 1 / current_rate;
        wallet_payment_in_user_currency = utils.precisionRoundTwo(from_amount * current_rate);
        total_wallet_amount = +wallet_amount + +wallet_payment_in_user_currency;
    }
    
    total_wallet_amount = utils.precisionRoundTwo(total_wallet_amount);
    
    var wallet_data = new Wallet({
        user_type: user_type,
        user_unique_id: user_unique_id,
        user_id: user_id,
        country_id: country_id,

        from_currency_code: from_currency_code,
        from_amount: from_amount,
        to_currency_code: to_currency_code,
        current_rate: utils.precisionRound(current_rate,4),

        wallet_amount: wallet_amount,
        added_wallet: wallet_payment_in_user_currency,
        total_wallet_amount: total_wallet_amount,

        wallet_status: wallet_status,
        wallet_comment_id: wallet_comment_id,
        wallet_description: wallet_description,
        wallet_information: wallet_information
        
    });

    wallet_data.save();
    return total_wallet_amount;
};

//exports.add_wallet_history = function (user_type, user_unique_id, user_id, country_id, from_currency_code, to_currency_code,
//        current_rate, from_amount, wallet_amount, wallet_status, wallet_comment_id, wallet_description) {
//    return wallet_history.add_wallet_history(user_type, user_unique_id, user_id, country_id, from_currency_code, to_currency_code,
//        current_rate, from_amount, wallet_amount, wallet_status, wallet_comment_id, wallet_description,"");
//};