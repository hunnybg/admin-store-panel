require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var User = require('mongoose').model('user');
var Store = require('mongoose').model('store');
var Provider = require('mongoose').model('provider');
var Card = require('mongoose').model('card');
var Payment_gateway = require('mongoose').model('payment_gateway');
var utils = require('../../utils/utils');
var console = require('../../utils/console');


exports.add_card = function (request_data, response_data) {

    utils.check_request_params(request_data.body, [{name: 'payment_id', type: 'string'}, {name: 'payment_token', type: 'string'},
        {name: 'last_four', type: 'string'}], function (response) {
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
                    type = ADMIN_DATA_ID.USER;
                    Table = User;
                    break;
            }

            Table.findOne({_id: request_data_body.user_id}).then((detail) => {
                if (detail) {
                    if (request_data_body.server_token !== null && detail.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {
                        Payment_gateway.findOne({_id: request_data_body.payment_id}).then((payment_gateway) => {
                            if (payment_gateway)
                            {
                                var payment_gateway_name = (payment_gateway.name).toLowerCase();
                                // if (payment_gateway_name === 'stripe')
                                // {
                                    var email = detail.email;
                                    var stripe_key = payment_gateway.payment_key;
                                    var stripe = require("stripe")(stripe_key);
                                    var payment_token = request_data_body.payment_token;

                                    stripe.customers.create({
                                        description: email,
                                        source: payment_token // obtained with Stripe.js

                                    }, function (error, customer) {
                                        if (!customer) {
                                            response_data.json({success: false, error_code: CARD_ERROR_CODE.INVALID_PAYMENT_TOKEN});
                                        } else {

                                            Card.find({user_id: request_data_body.user_id,user_type:type}).then((card_data) => {
                                                var customer_id = customer.id;
                                                var card = new Card({
                                                    card_expiry_date: request_data_body.card_expiry_date,
                                                    card_holder_name: request_data_body.card_holder_name,
                                                    payment_id: request_data_body.payment_id,
                                                    user_type:type,
                                                    user_id: request_data_body.user_id,
                                                    last_four: request_data_body.last_four,
                                                    payment_token: request_data_body.payment_token,
                                                    card_type: request_data_body.card_type,
                                                    customer_id: customer_id
                                                })

                                                if (card_data.length > 0) {
                                                    card.is_default = false;
                                                } else {
                                                    card.is_default = true;
                                                }

                                                card.save().then(() => {
                                                        response_data.json({
                                                            success: true,
                                                            message: CARD_MESSAGE_CODE.CARD_ADD_SUCCESSFULLY,
                                                            card: card

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
                                    });
                                // }
                            }
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

exports.get_card_list = function (request_data, response_data) {

    utils.check_request_params(request_data.body, [], function (response) {
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
                    type = ADMIN_DATA_ID.USER;
                    Table = User;
                    break;
            }

            Table.findOne({_id: request_data_body.user_id}).then((detail) => {
                if (detail) {
                    if (request_data_body.server_token !== null && detail.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {

                        Card.find({user_id: request_data_body.user_id,user_type:type}).then((cards) => {
                            if (cards.length == 0) {
                                response_data.json({success: false, error_code: CARD_ERROR_CODE.CARD_DATA_NOT_FOUND});
                            } else {

                                response_data.json({success: true,
                                    message: CARD_MESSAGE_CODE.CARD_LIST_SUCCESSFULLY,
                                    cards: cards
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

exports.delete_card = function (request_data, response_data) {

    utils.check_request_params(request_data.body, [{name: 'card_id', type: 'string'}], function (response) {
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
                    type = ADMIN_DATA_ID.USER;
                    Table = User;
                    break;
            }

            Table.findOne({_id: request_data_body.user_id}).then((detail) => {
                if (detail) {
                    if (request_data_body.server_token !== null && detail.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {
                        Card.remove({_id: request_data_body.card_id, user_id: request_data_body.user_id,user_type:type}).then(() => {
                            response_data.json({success: true,
                                message: CARD_MESSAGE_CODE.CARD_DELETE_SUCCESSFULLY
                            });
                        }, (error) => {
                            console.log(error)
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });

                    }

                }else
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

exports.select_card = function (request_data, response_data) {

    utils.check_request_params(request_data.body, [{name: 'card_id', type: 'string'}], function (response) {
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
                    type = ADMIN_DATA_ID.USER;
                    Table = User;
                    break;
            }

            Table.findOne({_id: request_data_body.user_id}).then((detail) => {
                if (detail) {
                    if (request_data_body.server_token !== null && detail.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {

                        Card.findOneAndUpdate({_id: {$nin: request_data_body.card_id}, user_id: request_data_body.user_id,user_type:type, is_default: true}, {is_default: false}).then((card) => {

                        });
                        Card.findOne({_id: request_data_body.card_id, user_id: request_data_body.user_id,user_type:type}).then((card) => {

                            if (card) {
                                card.is_default = true;
                                card.save().then(() => {
                                    response_data.json({
                                        success: true, message: CARD_MESSAGE_CODE.CARD_SELECTED_SUCCESSFULLY,
                                        card: card
                                    });
                                }, (error) => {
                                    console.log(error)
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
                                });

                            } else
                            {
                                response_data.json({success: false, error_code: CARD_ERROR_CODE.CARD_DATA_NOT_FOUND});
                            }
                        }, (error) => {
                            console.log(error)
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });

                        });

                    }

                }else
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

