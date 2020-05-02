require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var utils = require('../../utils/utils');
var mongoose = require('mongoose');
var User = require('mongoose').model('user');
var Store = require('mongoose').model('store');
var City = require('mongoose').model('city');
var Order = require('mongoose').model('order');
var Order_payment = require('mongoose').model('order_payment');
var Promo_code = require('mongoose').model('promo_code');
var Cart = require('mongoose').model('cart');
var console = require('../../utils/console');


// APPLY PROMO CODE 
exports.apply_promo_code = function (request_data, response_data) {

    utils.check_request_params(request_data.body, [{name: 'order_payment_id', type: 'string'}, {name: 'promo_code_name', type: 'string'}], function (response) {
        if (response.success) {
            var request_data_body = request_data.body;
            User.findOne({_id: request_data_body.user_id}).then((user) => {
                if (user) {
                    if (request_data_body.server_token !== null && user.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {
                        var promo_code_name = request_data_body.promo_code_name;
                        if (promo_code_name != undefined)
                        {
                            promo_code_name = (promo_code_name).toUpperCase();
                        }
                        var date_now = new Date();

                        Order_payment.findOne({user_id: user._id, _id: request_data_body.order_payment_id}).then((order_payment) => {
                            if (order_payment) {

                                var total_delivery_price = order_payment.total_delivery_price;
                                var total_order_price = order_payment.total_order_price;

                                var user_pay_payment = order_payment.user_pay_payment;
                                var total_cart_price = order_payment.total_cart_price;
                                Cart.findOne({_id: order_payment.cart_id}).then((cart) => {
                                    if (cart) {
                                        Store.findOne({_id: order_payment.store_id}).then((store) => {
                                            if (store) {
                                                City.findOne({_id: store.city_id}).then((city) => {
                                                    if (city) {
                                                        if (city.is_promo_apply) {

                                                            Promo_code.findOne({country_id: store.country_id, $or: [{city_id: city._id}, {city_id: mongoose.Types.ObjectId(ID_FOR_ALL.ALL_ID)}],

                                                                promo_code_name: promo_code_name, is_active: true, is_approved: true}).then((promo_code) => {

                                                                if (promo_code) {
                                                                    var is_promo_required_uses = promo_code.is_promo_required_uses;
                                                                    var is_promo_expiry_date = promo_code.is_promo_have_date;
                                                                    var is_promo_have_max_discount_limit = promo_code.is_promo_have_max_discount_limit;
                                                                    var is_promo_have_minimum_amount_limit = promo_code.is_promo_have_minimum_amount_limit;
                                                                    var is_promo_apply_on_completed_order = promo_code.is_promo_apply_on_completed_order;
                                                                    var is_promo_have_item_count_limit = promo_code.is_promo_have_item_count_limit;
                                                                    var promo_code_type = promo_code.promo_code_type;
                                                                    var promo_code_value = promo_code.promo_code_value;
                                                                    var promo_code_max_discount_amount = promo_code.promo_code_max_discount_amount;

                                                                    var promo_apply_value = 0;
                                                                    if (promo_code.promo_for == PROMO_FOR.SERVICE) {
                                                                        promo_apply_value = total_delivery_price;
                                                                    } else
                                                                    {
                                                                        promo_apply_value = total_cart_price;
                                                                    }

                                                                    if ((is_promo_have_item_count_limit && cart.total_item_count >= promo_code.promo_code_apply_on_minimum_item_count) || !is_promo_have_item_count_limit) {
                                                                        Order.count({user_id: request_data_body.user_id, order_status_id: ORDER_STATUS_ID.COMPLETED}).then((order_count) => {

                                                                            if ((is_promo_apply_on_completed_order && order_count >= promo_code.promo_apply_after_completed_order) || !is_promo_apply_on_completed_order) {

                                                                                if ((is_promo_required_uses && promo_code.used_promo_code < promo_code.promo_code_uses) || !is_promo_required_uses) {
                                                                                    if ((is_promo_expiry_date && promo_code.promo_expire_date >= date_now) || !is_promo_expiry_date) {
                                                                                        if ((is_promo_have_minimum_amount_limit && promo_apply_value >= promo_code.promo_code_apply_on_minimum_amount) || !is_promo_have_minimum_amount_limit) {

                                                                                            utils.check_promo_for(promo_code, cart, store, function (response) {

                                                                                                if (response.success) {
                                                                                                    utils.check_promo_recursion(promo_code, city.timezone, function (promo_for_response) {

                                                                                                        if (promo_for_response) {
                                                                                                            Order_payment.find({
                                                                                                                user_id: user._id,
                                                                                                                promo_id: promo_code._id
                                                                                                            }, function (error, order_payments) {
                                                                                                                if (order_payments.length > 0) {
                                                                                                                    response_data.json({
                                                                                                                        success: false,
                                                                                                                        error_code: USER_ERROR_CODE.PROMO_CODE_ALREADY_USED
                                                                                                                    });

                                                                                                                } else {

                                                                                                                    if (promo_code.promo_for == PROMO_FOR.SERVICE && order_payment.is_store_pay_delivery_fees) {

                                                                                                                        response_data.json({
                                                                                                                            success: false,
                                                                                                                            error_code: USER_ERROR_CODE.YOUR_DELIVERY_CHARGE_FREE_YOU_CAN_NOT_APPLY_PROMO
                                                                                                                        });

                                                                                                                    } else {


                                                                                                                        var promo_payment = 0;
                                                                                                                        if (promo_code_type == 2) { // type 2 - Absolute
                                                                                                                            promo_payment = promo_code_value;
                                                                                                                        } else { // type 1- Percentage

                                                                                                                            if (promo_code.promo_for == PROMO_FOR.SERVICE) {
                                                                                                                                promo_payment = total_delivery_price * promo_code_value * 0.01;
                                                                                                                            } else if (promo_code.promo_for == PROMO_FOR.DELIVERIES || promo_code.promo_for == PROMO_FOR.STORE) {
                                                                                                                                promo_payment = total_order_price * promo_code_value * 0.01;
                                                                                                                            } else if (promo_code.promo_for == PROMO_FOR.PRODUCT || promo_code.promo_for == PROMO_FOR.ITEM) {
                                                                                                                                promo_payment = response.price_for_promo * promo_code_value * 0.01;
                                                                                                                            }


                                                                                                                            if (is_promo_have_max_discount_limit && promo_payment > promo_code_max_discount_amount) {
                                                                                                                                promo_payment = promo_code.promo_code_max_discount_amount;
                                                                                                                            }
                                                                                                                        }

                                                                                                                        var promo_code_id = promo_code._id;

                                                                                                                        if (promo_code.promo_for == PROMO_FOR.SERVICE) {
                                                                                                                            if (total_delivery_price > promo_payment) {
                                                                                                                                total_delivery_price = total_delivery_price - promo_payment;
                                                                                                                            } else {
                                                                                                                                promo_payment = total_delivery_price;
                                                                                                                                total_delivery_price = 0;
                                                                                                                            }
                                                                                                                        } else {
                                                                                                                            if (total_order_price > promo_payment) {
                                                                                                                                total_order_price = total_order_price - promo_payment;
                                                                                                                            } else {
                                                                                                                                promo_payment = total_order_price;
                                                                                                                                total_order_price = 0;
                                                                                                                            }
                                                                                                                        }

                                                                                                                        user_pay_payment = +total_delivery_price + +total_order_price;
                                                                                                                        user_pay_payment = utils.precisionRoundTwo(Number(user_pay_payment));
                                                                                                                        promo_payment = utils.precisionRoundTwo(Number(promo_payment));

                                                                                                                        // order_payment.total_delivery_price = total_delivery_price;
                                                                                                                        // order_payment.total_order_price = total_order_price;
                                                                                                                        order_payment.user_pay_payment = user_pay_payment;
                                                                                                                        order_payment.promo_id = promo_code_id;
                                                                                                                        if(promo_code.promo_for == PROMO_FOR.SERVICE){
                                                                                                                            order_payment.is_promo_for_delivery_service = true;
                                                                                                                        }else{
                                                                                                                            order_payment.is_promo_for_delivery_service = false;
                                                                                                                        }
                                                                                                                        var other_promo_payment_loyalty = 0;
                                                                                                                        if (promo_code.admin_loyalty_type == 2) { // 2 - Absolute
                                                                                                                            other_promo_payment_loyalty = promo_payment - promo_code.admin_loyalty ;
                                                                                                                        } else {// PERCENTAGE = 1
                                                                                                                            other_promo_payment_loyalty = promo_payment - ( promo_code.admin_loyalty * promo_payment * 0.01 ) ;
                                                                                                                        }
                                                                                                                        if(other_promo_payment_loyalty < 0){
                                                                                                                            other_promo_payment_loyalty = 0;
                                                                                                                        }
                                                                                                                        
                                                                                                                        order_payment.other_promo_payment_loyalty = utils.precisionRoundTwo(Number(other_promo_payment_loyalty));
                                                                                                                        order_payment.promo_payment = promo_payment;

                                                                                                                        promo_code.used_promo_code = promo_code.used_promo_code + 1;

                                                                                                                        order_payment.save(function (error) {

                                                                                                                            if (error) {
                                                                                                                                response_data.json({

                                                                                                                                    success: false,
                                                                                                                                    error_code: USER_ERROR_CODE.PROMO_APPLY_FAILED
                                                                                                                                });
                                                                                                                            } else {
                                                                                                                                promo_code.save();
                                                                                                                                response_data.json({
                                                                                                                                    success: true,
                                                                                                                                    message: USER_MESSAGE_CODE.PROMO_APPLY_SUCCESSFULLY,
                                                                                                                                    order_payment: order_payment
                                                                                                                                });
                                                                                                                            }
                                                                                                                        }, (error) => {
                                                                                                                            console.log(error)
                                                                                                                            response_data.json({
                                                                                                                                success: false,
                                                                                                                                error_code: ERROR_CODE.PROMO_APPLY_FAILED
                                                                                                                            });
                                                                                                                        });
                                                                                                                    }
                                                                                                                }
                                                                                                            });
                                                                                                        } else {

                                                                                                            response_data.json({success: false, error_code: USER_ERROR_CODE.INVALID_OR_EXPIRED_PROMO_CODE})
                                                                                                        }
                                                                                                    });

                                                                                                } else {

                                                                                                    response_data.json({
                                                                                                        success: false,
                                                                                                        error_code: USER_ERROR_CODE.INVALID_OR_EXPIRED_PROMO_CODE
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        } else {

                                                                                            response_data.json({
                                                                                                success: false,
                                                                                                error_code: USER_ERROR_CODE.PROMO_AMOUNT_LESS_THEN_MINIMUM_AMOUNT_LIMIT
                                                                                            });
                                                                                        }

                                                                                    } else {

                                                                                        response_data.json({
                                                                                            success: false,
                                                                                            error_code: USER_ERROR_CODE.INVALID_OR_EXPIRED_PROMO_CODE
                                                                                        });
                                                                                    }

                                                                                } else {

                                                                                    response_data.json({
                                                                                        success: false,
                                                                                        error_code: USER_ERROR_CODE.PROMO_USED_OUT_OF_LIMIT
                                                                                    });
                                                                                }
                                                                            } else {

                                                                                response_data.json({success: false, error_code: USER_ERROR_CODE.INVALID_OR_EXPIRED_PROMO_CODE});
                                                                            }
                                                                        })
                                                                    } else {

                                                                        response_data.json({success: false, error_code: USER_ERROR_CODE.INVALID_OR_EXPIRED_PROMO_CODE});
                                                                    }

                                                                } else {

                                                                    response_data.json({success: false, error_code: USER_ERROR_CODE.INVALID_OR_EXPIRED_PROMO_CODE});
                                                                }
                                                            }, (error) => {
                                                                console.log(error)
                                                                response_data.json({
                                                                    success: false,
                                                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                                });
                                                            });

                                                        } else {

                                                            response_data.json({success: false, error_code: USER_ERROR_CODE.PROMO_CODE_NOT_FOR_CITY});
                                                        }
                                                    } else {

                                                        response_data.json({success: false, error_code: USER_ERROR_CODE.PROMO_APPLY_FAILED});
                                                    }
                                                }, (error) => {
                                                    console.log(error)
                                                    response_data.json({
                                                        success: false,
                                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                    });
                                                });
                                            } else {

                                                response_data.json({success: false, error_code: USER_ERROR_CODE.PROMO_APPLY_FAILED});
                                            }
                                        }, (error) => {
                                            console.log(error)
                                            response_data.json({
                                                success: false,
                                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                            });
                                        });
                                    } else {

                                        response_data.json({success: false, error_code: USER_ERROR_CODE.PROMO_APPLY_FAILED});
                                    }
                                }, (error) => {
                                    console.log(error)
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
                                })
                            } else
                            {

                                response_data.json({success: false, error_code: USER_ERROR_CODE.PROMO_APPLY_FAILED});
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

                    response_data.json({success: false, error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND});
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
