var myUtils = require('../../utils/utils');
require('../../utils/constants');
var fs = require("fs");
var moment = require('moment');
var myEmail = require('../../controllers/email_sms/emails');
var Email = require('mongoose').model('email_detail');


// send email //
exports.sendEmail = function (request_data, provider, user, store, email_id, extra_param) {

    var name = "";
    var email = "";
    if (provider != null) {
        name = provider.first_name + " " + provider.last_name;
        email = provider.email;
    } else if (user != null) {
        name = user.first_name + " " + user.last_name;
        email = user.email;
    } else if (store != null) {
        name = store.name;
        email = store.email;
    }

    var test = new Date(Date.now());
    var d = moment(test);
    var date = d.format(DATE_FORMATE.MMM_D_YYYY);
    var ejs = require("ejs");
    try {
        if (email != "") {
            Email.findOne({unique_id: email_id}, function (error, email_data) {
                var template_string = EMAIL_STRING.template_string;
                var app_name_string = EMAIL_STRING.app_name_string;
                var title = email_data.email_title;
                var email_content = email_data.email_content;
                var email_admin_info = email_data.email_admin_info;
                var is_send = email_data.is_send;
                var shifts;
                if (is_send) {
                    if (email_id == EMAIL_UNIQUE_ID.USER_WELCOME || EMAIL_UNIQUE_ID.VAITER_WELCOME || EMAIL_UNIQUE_ID.STORE_WELCOME || EMAIL_UNIQUE_ID.USER_FORGOT_PASSWORD || EMAIL_UNIQUE_ID.VAITER_FORGOT_PASSWORD || EMAIL_UNIQUE_ID.STORE_FORGOT_PASSWORD || EMAIL_UNIQUE_ID.ORDER_PAYMENT_DONE || EMAIL_UNIQUE_ID.ORDER_DIGITAL_CODE || EMAIL_UNIQUE_ID.USER_APPROVED || EMAIL_UNIQUE_ID.USER_DECLINED || EMAIL_UNIQUE_ID.VAITER_APPROVED || EMAIL_UNIQUE_ID.VAITER_DECLINED || EMAIL_UNIQUE_ID.STORE_APPROVED || EMAIL_UNIQUE_ID.STORE_DECLINED || EMAIL_UNIQUE_ID.USER_PAYMENT_REFUND || EMAIL_UNIQUE_ID.STORE_PAYMENT_REFUND) {
                        email_content = email_content.replace("XXXXXX", extra_param);
                    }

                    if(email_id == EMAIL_UNIQUE_ID.VAITER_SHCEDULE_MONTHLY){
                        title = title.replace("Month" , `${extra_param.month_name} Month`);
                        email_content = email_content.replace("%%%NAME%%%", name);
                        shifts = extra_param.shifts;
                    }

                    if(email_id == EMAIL_UNIQUE_ID.STORE_REGISTER){
                        title = "Better way to manage your restaurants"
                    }

                    var template = process.cwd() + '/app/email_template/email.html';
                    fs.readFile(template, 'utf8', function (error, file) {
                        if (error) {
                            return error;
                        } else {
                            var compiledTmpl = ejs.compile(file, {filename: template});
                            var logo_image_url = request_data.protocol + '://' + 'admin.vaiter.io' + "/email_images/mail_logo.png";

                            var background_image_url = request_data.protocol + '://' + 'admin.vaiter.io' +  "/email_images/email_vector.png";
                            var context = {title: title, name: name,
                                app_name_string: app_name_string, template_string: template_string,
                                email_content: email_content, email_admin_info: email_admin_info,
                                logo_image_url: logo_image_url, background_image_url: background_image_url,
                                date: date, shifts: shifts};
                            var htmls = compiledTmpl(context);
                            htmls = htmls.replace(/&lt;/g, "<");
                            htmls = htmls.replace(/&gt;/g, ">");
                            htmls = htmls.replace(/&#34;/g, '"');
                            myUtils.mail_notification(email, email_data.email_title, "", htmls);
                        }
                    });
                }
            });

        }
    } catch (error) {
        console.error('ERROR!');
    }
};

// userForgotPassword
exports.userForgotPassword = function (request_data, user, new_password, type) {
    try {
        console.log("userForgotPassword");
        switch (type) {
            case ADMIN_DATA_ID.USER:
                myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.USER_FORGOT_PASSWORD, new_password);
                break;
            case ADMIN_DATA_ID.VAITER:
                myEmail.sendEmail(request_data, user, null, null, EMAIL_UNIQUE_ID.VAITER_FORGOT_PASSWORD, new_password);
                break;
            case ADMIN_DATA_ID.STORE:
                myEmail.sendEmail(request_data, null, null, user, EMAIL_UNIQUE_ID.USER_FORGOT_PASSWORD, new_password);
                break;
            case ADMIN_DATA_ID.ADMIN:
                myEmail.sendEmail(request_data, null, null, user, EMAIL_UNIQUE_ID.USER_FORGOT_PASSWORD, new_password);
                break;
            default:
                break;
        }


    } catch (error) {
        console.error('ERROR!');
    }
};

// providerForgotPassword
exports.providerForgotPassword = function (request_data, provider, new_password) {
    try {
        myEmail.sendEmail(request_data, provider, null, null, EMAIL_UNIQUE_ID.VAITER_FORGOT_PASSWORD, new_password);
    } catch (error) {
        console.error('ERROR!');
    }
};

// storeForgotPassword
exports.storeForgotPassword = function (request_data, store, new_password) {
    try {
        myEmail.sendEmail(request_data, null, null, store, EMAIL_UNIQUE_ID.STORE_FORGOT_PASSWORD, new_password);
    } catch (error) {
        console.error('ERROR!');
    }
};

// sendUserRegisterEmail
exports.sendUserRegisterEmail = function (request_data, user, name) {
    try {
        myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.USER_WELCOME, name);
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendVaiterRegisterEmail
exports.sendVaiterRegisterEmail = function (request_data, provider, name) {
    try {
        myEmail.sendEmail(request_data, provider, null, null, EMAIL_UNIQUE_ID.VAITER_WELCOME, name);
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendStoreRegisterEmail
exports.sendStoreRegisterEmail = function (request_data, store, name) {
    try {
        myEmail.sendEmail(request_data, null, null, store, EMAIL_UNIQUE_ID.STORE_WELCOME, name);
    } catch (error) {
        console.log('ERROR!');
    }
};


// sendUserApprovedEmail
exports.sendUserApprovedEmail = function (request_data, user, name) {
    try {
        console.log("sendUserApprovedEmail");
        myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.USER_APPROVED, name);
    } catch (error) {
        console.log(" catch sendUserApprovedEmail");
        console.log('ERROR!');
    }
};

// sendVaiterApprovedEmail
exports.sendVaiterApprovedEmail = function (request_data, provider, name) {
    try {
        myEmail.sendEmail(request_data, provider, null, null, EMAIL_UNIQUE_ID.VAITER_APPROVED, name);
    } catch (error) {
        console.log('ERROR!');
    }
};

exports.sendVaiterApprovedEmail = function (request_data, vaiter, name) {
    try {
        myEmail.sendEmail(request_data, vaiter, null, null, EMAIL_UNIQUE_ID.VAITER_APPROVED, name);
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendStoreApprovedEmail
exports.sendStoreApprovedEmail = function (request_data, store, name) {
    try {
        console.log("sendStoreApprovedEmail");
        myEmail.sendEmail(request_data, null, null, store, EMAIL_UNIQUE_ID.STORE_APPROVED, name);
    } catch (error) {
        console.log(" catch sendStoreApprovedEmail");
        console.log('ERROR!');
    }
};

// sendUserDeclineEmail
exports.sendUserDeclineEmail = function (request_data, user, name) {
    try {
        myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.USER_DECLINED, name);
    } catch (error) {
        console.log('ERROR!');
    }
};


// sendVaiterDeclineEmail
exports.sendVaiterDeclineEmail = function (request_data, provider, name) {
    try {
        myEmail.sendEmail(request_data, provider, null, null, EMAIL_UNIQUE_ID.VAITER_DECLINED, name);
    } catch (error) {
        console.log('ERROR!');
    }
};


// sendStoreDeclineEmail
exports.sendStoreDeclineEmail = function (request_data, store, name) {
    try {
        myEmail.sendEmail(request_data, null, null, store, EMAIL_UNIQUE_ID.STORE_DECLINED, name);
    } catch (error) {
        console.log('ERROR!');
    }
};


// emailForOTPVerification
exports.emailForOTPVerification = function (request_data, email, otp_for_email, email_id) {
    var request_data_body = request_data.body;
    var email = request_data_body.email;
    try {
        if (email != "") {
            Email.findOne({unique_id: email_id}, function (error, email_data) {
                var template_string = EMAIL_STRING.template_string;
                var app_name_string = EMAIL_STRING.app_name_string;
                var title = email_data.email_title;
                var email_content = email_data.email_content;
                var email_admin_info = email_data.email_admin_info;
                var is_send = email_data.is_send;
                if (is_send) {
                    if (email_id == EMAIL_UNIQUE_ID.USER_OTP_VERIFICATION || email_id == EMAIL_UNIQUE_ID.VAITER_OTP_VERIFICATION || email_id == EMAIL_UNIQUE_ID.STORE_OTP_VERIFICATION) {
                        email_content = email_content.replace("XXXXXX", otp_for_email);
                    }
                    var ejs = require("ejs");
                    var template = process.cwd() + '/app/email_template/email.html';
                    fs.readFile(template, 'utf8', function (error, file) {
                        if (error) {
                            console.log('ERROR!');
                            return error;
                        } else {
                            var compiledTmpl = ejs.compile(file, {filename: template});
                            var logo_image_url = request_data.protocol + '://' + request_data.get('host') + "/email_images/mail_logo.png";
                            var background_image_url = request_data.protocol + '://' + request_data.get('host') + "/email_images/email_vector.png";
                            var context = {title: title, template_string: template_string,
                                app_name_string: app_name_string,
                                email_content: email_content, email_admin_info: email_admin_info, logo_image_url: logo_image_url, background_image_url: background_image_url};
                            var htmls = compiledTmpl(context);
                            htmls = htmls.replace(/&lt;/g, "<");
                            htmls = htmls.replace(/&gt;/g, ">");
                            htmls = htmls.replace(/&#34;/g, '"');
                            myUtils.mail_notification(email, email_data.email_title, "", htmls);
                        }
                    });
                }
            });

        }
    } catch (error) {
        console.log('ERROR!');
    }

};

// sendUserOrderPaymentPaidEmail
exports.sendUserOrderPaymentPaidEmail = function (request_data, user, amount) {
    try {
        myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.ORDER_PAYMENT_DONE, amount);
    } catch (error) {
        console.log('ERROR!');
    }

};


// sendUserOrderPaymentPaidEmail
exports.sendStoreOrderPaymentPaidEmail = function (request_data, store, amount) {
    try {
        myEmail.sendEmail(request_data, null, null, store, EMAIL_UNIQUE_ID.STORE_ORDER_PAYMENT_DONE, amount);
    } catch (error) {
        console.log('ERROR!');
    }

};





// sendOrderBookedEmail
exports.sendOrderBookedEmail = function (request_data, user) {
    try {
        myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.ORDER_BOOKED, "");
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendOrderReadyEmail
exports.sendOrderReadyEmail = function (request_data, user) {
    try {
        myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.ORDER_READY, "");
    } catch (error) {
        console.log('ERROR!');
    }
};



// sendOrderPrepareEmail
exports.sendOrderPrepareEmail = function (request_data, user) {
    try {
        myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.USER_ORDER_PREPARE, "");
    } catch (error) {
        console.log('ERROR!');
    }
};



// sendVaiterOnTheWayEmail to user
exports.sendVaiterOnTheWayEmail = function (request_data, user) {
    try {
        myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.DELIVERY_MAN_ON_THE_WAY, "");
    } catch (error) {
        console.log('ERROR!');
    }
};


// sendVaiterStartDeliveryEmail to store
exports.sendVaiterStartDeliveryEmail = function (request_data, store) {
    try {
        myEmail.sendEmail(request_data, null, null, store, EMAIL_UNIQUE_ID.DELIVERY_MAN_STARTED_DELIVERY, "");
    } catch (error) {
        console.log('ERROR!');
    }
};





// sendVaiterArrivedAtDestinationEmail to user
exports.sendVaiterArrivedAtDestinationEmail = function (request_data, user) {
    try {
        myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.DELIVERY_MAN_ARRIVED_AT_DESTINATION, "");
    } catch (error) {
        console.log('ERROR!');
    }
};


// sendVaiterReachedAtDestinationEmail to store
exports.sendVaiterReachedAtDestinationEmail = function (request_data, store) {
    try {
        myEmail.sendEmail(request_data, null, null, store, EMAIL_UNIQUE_ID.DELIVERY_MAN_REACHED_AT_DESTINATION, "");
    } catch (error) {
        console.log('ERROR!');
    }
};

//////////////

// sendVaiterAcceptedEmail to store
exports.sendVaiterAcceptedEmail = function (request_data, store) {
    try {
        myEmail.sendEmail(request_data, null, null, store, EMAIL_UNIQUE_ID.DELIVERY_MAN_ACCEPTED, "");
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendVaiterComingEmail to store
exports.sendVaiterComingEmail = function (request_data, store) {
    try {
        myEmail.sendEmail(request_data, null, null, store, EMAIL_UNIQUE_ID.DELIVERY_MAN_COMING, "");
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendVaiterArrivedEmail to store
exports.sendVaiterArrivedEmail = function (request_data, store) {
    try {
        myEmail.sendEmail(request_data, null, null, store, EMAIL_UNIQUE_ID.DELIVERY_MAN_ARRIVED, "");
    } catch (error) {
        console.log('ERROR!');
    }
};
/////////////





// sendOrderDispatchEmail
exports.sendOrderDispatchEmail = function (request_data, user) {
    try {
        myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.ORDER_DISPATCH, "");
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendOrderDigitalCodeEmail
exports.sendOrderDigitalCodeEmail = function (request_data, user, unique_code) {
    try {
        myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.ORDER_DIGITAL_CODE, unique_code);
    } catch (error) {
        console.log('ERROR!');
    }
};


// sendUserRefundAmountEmail
exports.sendUserRefundAmountEmail = function (request_data, user, amount) {
    try {
        myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.USER_PAYMENT_REFUND, amount);
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendStoreRefundAmountEmail
exports.sendStoreRefundAmountEmail = function (request_data, store, amount) {
    try {
        myEmail.sendEmail(request_data, null, null, store, EMAIL_UNIQUE_ID.STORE_PAYMENT_REFUND, amount);
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendUserOrderCompleteEmail
exports.sendUserOrderCompleteEmail = function (request_data, user) {
    try {
        myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.USER_ORDER_COMPLETED, "");
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendUserOrderCancelEmail
exports.sendUserOrderCancelEmail = function (request_data, user) {
    try {
        myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.USER_ORDER_CANCELLED, "");
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendUserOrderRejectEmail
exports.sendUserOrderRejectEmail = function (request_data, user) {
    try {
        myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.USER_ORDER_REJECTED, "");
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendVaiterOrderCancelEmail
exports.sendVaiterOrderCancelEmail = function (request_data, provider) {
    try {
        myEmail.sendEmail(request_data, provider, null, null, EMAIL_UNIQUE_ID.VAITER_ORDER_CANCELLED, "");
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendOrderRemainingEmail
exports.sendOrderRemainingEmail = function (request_data, provider) {
    try {
        myEmail.sendEmail(request_data, provider, null, null, EMAIL_UNIQUE_ID.ORDER_REMAINING, "");
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendVaiterOrderDeliveredEmail
exports.sendVaiterOrderDeliveredEmail = function (request_data, provider) {
    try {
        myEmail.sendEmail(request_data, provider, null, null, EMAIL_UNIQUE_ID.ORDER_DELIVERED, "");
    } catch (error) {
        console.log('ERROR!');
    }
};


// sendStoreOrderCompleteEmail
exports.sendStoreOrderCompleteEmail = function (request_data, store) {
    try {
        myEmail.sendEmail(request_data, null, null, store, EMAIL_UNIQUE_ID.STORE_ORDER_COMPLETED, "");
    } catch (error) {
        console.log('ERROR!');
    }
};



// sendNewOrderEmail
exports.sendNewOrderEmail = function (request_data, store) {
    try {
        myEmail.sendEmail(request_data, null, null, store, EMAIL_UNIQUE_ID.NEW_ORDER, "");
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendStoreOrderReadyEmail
exports.sendStoreOrderReadyEmail = function (request_data, store) {
    try {
        myEmail.sendEmail(request_data, null, null, store, EMAIL_UNIQUE_ID.STORE_ORDER_READY, "");
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendOrderAssignEmail
exports.sendOrderAssignEmail = function (request_data, provider) {
    try {
        myEmail.sendEmail(request_data, provider, null, null, EMAIL_UNIQUE_ID.ORDER_ASSIGN, "");
    } catch (error) {
        console.log('ERROR!');
    }
};


// sendStoreOrderCancelEmail
exports.sendStoreOrderCancelEmail = function (request_data, store) {
    try {
        myEmail.sendEmail(request_data, null, null, store, EMAIL_UNIQUE_ID.STORE_ORDER_CANCELLED, "");
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendStoreDocumentExpiredEmail
exports.sendStoreDocumentExpiredEmail = function (request_data, store) {
    try {
        myEmail.sendEmail(request_data, null, null, store, EMAIL_UNIQUE_ID.DOCUMENT_EXPIRED, "");
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendVaiterDocumentExpiredEmail
exports.sendVaiterDocumentExpiredEmail = function (request_data, provider) {
    try {
        myEmail.sendEmail(request_data, provider, null, null, EMAIL_UNIQUE_ID.DOCUMENT_EXPIRED, "");
    } catch (error) {
        console.log('ERROR!');
    }
};

// sendUserDocumentExpiredEmail
exports.sendUserDocumentExpiredEmail = function (request_data, user) {
    try {
        myEmail.sendEmail(request_data, null, user, null, EMAIL_UNIQUE_ID.DOCUMENT_EXPIRED, "");
    } catch (error) {
        console.log('ERROR!');
    }
};


exports.sendVaiterMonthSchedule = function (request_data, vaiter , shedule_details) {
    try {
        myEmail.sendEmail(request_data, vaiter, null, null, EMAIL_UNIQUE_ID.VAITER_SHCEDULE_MONTHLY, shedule_details);
    } catch (error) {
        console.log('ERROR!');
    }
};


// sendUserInvoiceEmail 
exports.sendUserInvoiceEmail = function (request_data, user, provider, store, order_payment, currency) {

    var provider_unique_id = 0;
    var provider_name = "";
    var provider_address = "";

    if (provider) {
        provider_unique_id = provider.unique_id;
        provider_name = provider.first_name + " " + provider.last_name;
        provider_address = provider.address;

    }

    var store_unique_id = store.unique_id;
    var store_name = store.name;
    var store_address = store.address;

    var user_name = user.first_name + " " + user.last_name;
    var user_email = user.email;

    var title = "User Invoice";
    var pattern = "User Invoice";

    var template_string = EMAIL_STRING.template_string;

    var test = new Date(Date.now());
    var d = moment(test);
    var date = d.format(DATE_FORMATE.MMM_D_YYYY);
    var ejs = require("ejs");

    try {
        if (user_email != "") {
            var template = process.cwd() + '/app/email_template/user_invoice_email.html';
            fs.readFile(template, 'utf8', function (error, file) {
                if (error) {
                    return error;
                } else {

                    if (order_payment.is_payment_mode_cash == true)
                    {
                        payment_mode = "Cash";
                        payment = order_payment.cash_payment;
                    } else
                    {
                        payment_mode = "Card";
                        payment = order_payment.card_payment;
                    }

                    if (order_payment.is_distance_unit_mile == true)
                    {
                        distance_unit = "mile";
                    } else
                    {
                        distance_unit = "km";
                    }
                    var compiledTmpl = ejs.compile(file, {filename: template});

                    var hour_icon = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/time.png";
                    var distance_icon = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/distance.png";
                    var credit_card = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/cash.png";
                    var support_icon = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/support.png";
                    var calendar_icon = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/calendar.png";
                    var main_icon = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/user_icon.png";

                    var context = {date: date,
                        title: title,
                        template_string: template_string,
                        calendar_icon: calendar_icon,
                        credit_card: credit_card,
                        distance_icon: distance_icon,
                        hour_icon: hour_icon,
                        support_icon: support_icon,
                        main_icon: main_icon,

                        payment_mode: payment_mode,
                        distance_unit: distance_unit,
                        currency: currency,

                        payment: payment,
                        provider_unique_id: provider_unique_id,
                        provider_name: provider_name,
                        provider_address: provider_address,
                        store_unique_id: store_unique_id,
                        store_name: store_name,
                        store_address: store_address,
                        total_time: order_payment.total_time,
                        total_distance: order_payment.total_distance,
                        total_service_price: order_payment.total_service_price,
                        total_admin_tax_price: order_payment.total_admin_tax_price,
                        total_surge_price: order_payment.total_surge_price,
                        promo_payment: order_payment.promo_payment,

                        total_store_tax_price: order_payment.total_store_tax_price,
                        total_cart_price: order_payment.total_cart_price,
                        wallet_payment: order_payment.wallet_payment,
                        cash_payment: order_payment.cash_payment,
                        card_payment: order_payment.card_payment,
                        total: order_payment.total,
                        total_order_price: order_payment.total_order_price,
                        total_delivery_price: order_payment.total_delivery_price,

                        is_promo_for_delivery_service: order_payment.is_promo_for_delivery_service,
                        is_distance_unit_mile: order_payment.is_distance_unit_mile,
                        is_payment_mode_cash: order_payment.is_payment_mode_cash
                    };
                    var htmls = compiledTmpl(context);
                    htmls = htmls.replace(/&lt;/g, "<");
                    htmls = htmls.replace(/&gt;/g, ">");
                    htmls = htmls.replace(/&#34;/g, '"');

                    myUtils.mail_notification(user_email, title, pattern, htmls);

                }
            });
        }

    } catch (error) {
        console.error('ERROR!');
    }


};


// sendVaiterInvoiceEmail
exports.sendVaiterInvoiceEmail = function (request_data, user, provider, store, order_payment, currency) {

    var user_unique_id = user.unique_id;
    var user_name = user.first_name + " " + user.last_name;
    var user_address = user.address;
    var store_unique_id = 0;
    var store_name = "";
    var store_address = "";

    if (store)
    {
        store_unique_id = store.unique_id;
        store_name = store.name;
        store_address = store.address;
    }



    var provider_name = provider.first_name + " " + provider.last_name;
    var provider_email = provider.email;

    var title = "Vaiter Invoice";
    var pattern = "Vaiter Invoice";

    var test = new Date(Date.now());
    var d = moment(test);
    var date = d.format(DATE_FORMATE.MMM_D_YYYY);
    var ejs = require("ejs");

    try {
        if (provider_email != "") {


            var template = process.cwd() + '/app/email_template/deliveryman_invoice_email.html';
            fs.readFile(template, 'utf8', function (error, file) {
                if (error) {
                    return error;
                } else {

                    if (order_payment.is_payment_mode_cash == true)
                    {
                        payment_mode = "Cash";
                    } else
                    {
                        payment_mode = "Card";
                    }

                    if (order_payment.is_distance_unit_mile == true)
                    {
                        distance_unit = "mile";
                    } else
                    {
                        distance_unit = "km";
                    }
                    var compiledTmpl = ejs.compile(file, {filename: template});

                    var hour_icon = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/time.png";
                    var distance_icon = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/distance.png";
                    var credit_card = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/cash.png";
                    var support_icon = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/support.png";
                    var calendar_icon = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/calendar.png";
                    var main_icon = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/delivery_icon.png";
                    var template_string = EMAIL_STRING.template_string;

                    var context = {date: date,
                        template_string: template_string,
                        title: title,
                        calendar_icon: calendar_icon,
                        credit_card: credit_card,
                        distance_icon: distance_icon,
                        hour_icon: hour_icon,
                        support_icon: support_icon,
                        main_icon: main_icon,

                        payment_mode: payment_mode,
                        distance_unit: distance_unit,
                        currency: currency,

                        user_unique_id: user_unique_id,
                        user_name: user_name,
                        user_address: user_address,
                        store_unique_id: store_unique_id,
                        store_name: store_name,
                        store_address: store_address,
                        total_time: order_payment.total_time,
                        total_distance: order_payment.total_distance,

                        total_service_price: order_payment.total_service_price,
                        total_admin_tax_price: order_payment.total_admin_tax_price,
                        total_surge_price: order_payment.total_surge_price,
                        promo_payment: order_payment.promo_payment,

                        total_store_tax_price: order_payment.total_store_tax_price,
                        total_cart_price: order_payment.total_cart_price,
                        wallet_payment: order_payment.wallet_payment,
                        cash_payment: order_payment.cash_payment,
                        card_payment: order_payment.card_payment,
                        total: order_payment.total,
                        pay_to_provider: order_payment.pay_to_provider,
                        provider_have_cash_payment: order_payment.provider_have_cash_payment,

                        provider_paid_order_payment: order_payment.provider_paid_order_payment,
                        total_provider_income: order_payment.total_provider_income,
                        total_order_price: order_payment.total_order_price,
                        total_delivery_price: order_payment.total_delivery_price,
                        is_promo_for_delivery_service: order_payment.is_promo_for_delivery_service,
                        is_distance_unit_mile: order_payment.is_distance_unit_mile,
                        is_payment_mode_cash: order_payment.is_payment_mode_cash
                    };


                    var htmls = compiledTmpl(context);
                    htmls = htmls.replace(/&lt;/g, "<");
                    htmls = htmls.replace(/&gt;/g, ">");
                    htmls = htmls.replace(/&#34;/g, '"');
                    myUtils.mail_notification(provider_email, title, pattern, htmls);

                }
            });

        }
    } catch (error) {
        console.error('ERROR!');
    }


};




// sendStoreInvoiceEmail
exports.sendStoreInvoiceEmail = function (request_data, user, provider, store, order_payment, currency) {

    var user_unique_id = user.unique_id;
    var user_name = user.first_name + " " + user.last_name;
    var user_address = user.address;

    var store_email = store.email;

    var provider_unique_id = provider.unique_id;
    var provider_name = provider.first_name + " " + provider.last_name;
    var provider_address = provider.address;



    var title = "Store Invoice";
    var pattern = "Store Invoice";
    var template_string = EMAIL_STRING.template_string;

    var test = new Date(Date.now());
    var d = moment(test);
    var date = d.format(DATE_FORMATE.MMM_D_YYYY);
    var ejs = require("ejs");

    try {
        if (store_email != "") {

            var template = process.cwd() + '/app/email_template/store_invoice_email.html';
            fs.readFile(template, 'utf8', function (error, file) {
                if (error) {
                    return error;
                } else {

                    if (order_payment.is_payment_mode_cash == true)
                    {
                        payment_mode = "Cash";
                        payment = order_payment.cash_payment;
                    } else
                    {
                        payment_mode = "Card";
                        payment = order_payment.card_payment;
                    }

                    if (order_payment.is_distance_unit_mile == true)
                    {
                        distance_unit = "mile";
                    } else
                    {
                        distance_unit = "km";
                    }
                    var compiledTmpl = ejs.compile(file, {filename: template});

                    var hour_icon = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/time.png";
                    var distance_icon = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/distance.png";
                    var credit_card = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/cash.png";
                    var support_icon = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/support.png";
                    var calendar_icon = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/calendar.png";
                    var main_icon = request_data.protocol + '://' + request_data.get('host') + "/email_images/invoice/store_icon.png";

                    var context = {date: date,
                        title: title,
                        template_string: template_string,

                        calendar_icon: calendar_icon,
                        credit_card: credit_card,
                        distance_icon: distance_icon,
                        hour_icon: hour_icon,
                        support_icon: support_icon,
                        main_icon: main_icon,

                        payment_mode: payment_mode,
                        distance_unit: distance_unit,
                        currency: currency,

                        user_unique_id: user_unique_id,
                        user_name: user_name,
                        user_address: user_address,
                        provider_unique_id: provider_unique_id,
                        provider_name: provider_name,
                        provider_address: provider_address,
                        total_time: order_payment.total_time,
                        total_distance: order_payment.total_distance,

                        total_service_price: order_payment.total_service_price,
                        total_admin_tax_price: order_payment.total_admin_tax_price,
                        total_surge_price: order_payment.total_surge_price,
                        promo_payment: order_payment.promo_payment,

                        total_store_tax_price: order_payment.total_store_tax_price,
                        total_cart_price: order_payment.total_cart_price,
                        wallet_payment: order_payment.wallet_payment,
                        cash_payment: order_payment.cash_payment,
                        card_payment: order_payment.card_payment,
                        total: order_payment.total,
                        pay_to_store: order_payment.pay_to_store,

                        total_store_income: order_payment.total_store_income,
                        store_have_order_payment: order_payment.store_have_order_payment,
                        store_have_service_payment: order_payment.store_have_service_payment,

                        total_order_price: order_payment.total_order_price,
                        total_delivery_price: order_payment.total_delivery_price,

                        is_promo_for_delivery_service: order_payment.is_promo_for_delivery_service,
                        is_distance_unit_mile: order_payment.is_distance_unit_mile,
                        is_payment_mode_cash: order_payment.is_payment_mode_cash
                    };
                    var htmls = compiledTmpl(context);
                    htmls = htmls.replace(/&lt;/g, "<");
                    htmls = htmls.replace(/&gt;/g, ">");
                    htmls = htmls.replace(/&#34;/g, '"');

                    myUtils.mail_notification(store_email, title, pattern, htmls);

                }
            });



        }
    } catch (error) {
        console.error('ERROR!');
    }


};




//////// VAITER WEEKLY INVOICE
// sendVaiterWeeklyInvoiceEmail 
exports.sendVaiterWeeklyInvoiceEmail = function (request_data, provider, provider_weekly_earning) {

    var provider_name = provider.first_name + " " + provider.last_name;
    var provider_email = provider.email;
    var provider_phone = provider.country_phone_code + provider.phone;
    var provider_unique_id = provider.unique_id;

    var title = "Vaiter Weekly Invoice";
    var pattern = "Vaiter Weekly Invoice";
    var template_string = EMAIL_STRING.template_string;

    var test = new Date(Date.now());
    var d = moment(test);
    var date = d.format(DATE_FORMATE.MMM_D_YYYY);

    var s_date = moment(provider_weekly_earning.start_date).format(DATE_FORMATE.MMM_D_YYYY);

    var e_date = moment(provider_weekly_earning.end_date).format(DATE_FORMATE.MMM_D_YYYY);

    console.log("s_date" + s_date);
    console.log("e_date" + e_date);
    var ejs = require("ejs");

    try {
        if (provider_email != "") {
            var template = process.cwd() + '/app/email_template/deliveryman_weekly_invoice_email.html';
            fs.readFile(template, 'utf8', function (error, file) {
                if (error) {
                    return error;
                } else {

                    var compiledTmpl = ejs.compile(file, {filename: template});
                    //console.log(request_data.protocol);
                    //console.log(request_data.get('host'));

                    var hour_icon = "https://edelivery.elluminatiinc.com/email_images/invoice/time.png";
                    var distance_icon = "https://edelivery.elluminatiinc.com/email_images/invoice/distance.png";
                    var credit_card = "https://edelivery.elluminatiinc.com/email_images/invoice/cash.png";
                    var support_icon = "https://edelivery.elluminatiinc.com/email_images/invoice/support.png";
                    var calendar_icon = "https://edelivery.elluminatiinc.com/email_images/invoice/calendar.png";
                    var main_icon = "https://edelivery.elluminatiinc.com/email_images/invoice/delivery_icon.png";


                    var context = {date: date,
                        title: title,
                        template_string: template_string,
                        calendar_icon: calendar_icon,
                        credit_card: credit_card,
                        distance_icon: distance_icon,
                        hour_icon: hour_icon,
                        support_icon: support_icon,
                        main_icon: main_icon,

                        provider_unique_id: provider_unique_id,
                        provider_name: provider_name,
                        provider_email: provider_email,
                        provider_phone: provider_phone,

                        statement_number: provider_weekly_earning.statement_number,
                        start_date: s_date,
                        end_date: e_date,

                        total_order_price: provider_weekly_earning.total_order_price,
                        total_provider_profit: provider_weekly_earning.total_provider_profit,
                        total_provider_earning: provider_weekly_earning.total_provider_earning,

                        total_wallet_income_set: provider_weekly_earning.total_wallet_income_set,
                        total_pay_to_provider: provider_weekly_earning.total_pay_to_provider,
                        total_provider_paid_order_payment: provider_weekly_earning.total_provider_paid_order_payment,

                        total_provider_have_cash_payment: provider_weekly_earning.total_provider_have_cash_payment,
                        total_provider_have_cash_payment_on_hand: provider_weekly_earning.total_provider_have_cash_payment_on_hand,
                        total_wallet_income_set_in_other_order: provider_weekly_earning.total_wallet_income_set_in_other_order,
                        total_wallet_income_set_in_cash_order: provider_weekly_earning.total_wallet_income_set_in_cash_order,

                    };


                    var htmls = compiledTmpl(context);
                    htmls = htmls.replace(/&lt;/g, "<");
                    htmls = htmls.replace(/&gt;/g, ">");
                    htmls = htmls.replace(/&#34;/g, '"');

                    myUtils.mail_notification(provider_email, title, pattern, htmls);

                }
            });

        }

    } catch (error) {
        console.error('ERROR!');
    }


};

//////// STORE WEEKLY INVOICE
// sendStoreWeeklyInvoiceEmail 
exports.sendStoreWeeklyInvoiceEmail = function (request_data, store, store_weekly_earning) {

    var store_name = store.name;
    var store_email = store.email;
    var store_phone = store.country_phone_code + store.phone;
    var store_unique_id = store.unique_id;
    var store_address = store.address;

    var title = "Store Weekly Invoice";
    var pattern = "Store Weekly Invoice";
    var template_string = EMAIL_STRING.template_string;

    var test = new Date(Date.now());
    var d = moment(test);
    var date = d.format(DATE_FORMATE.MMM_D_YYYY);

    var s_date = moment(store_weekly_earning.start_date).format(DATE_FORMATE.MMM_D_YYYY);

    var e_date = moment(store_weekly_earning.end_date).format(DATE_FORMATE.MMM_D_YYYY);

    console.log("s_date" + s_date);
    console.log("e_date" + e_date);
    var ejs = require("ejs");

    try {

        if (store_email != "")
        {
            var template = process.cwd() + '/app/email_template/store_weekly_invoice_email.html';
            fs.readFile(template, 'utf8', function (error, file) {
                if (error) {
                    return error;
                } else {

                    var compiledTmpl = ejs.compile(file, {filename: template});
                    var hour_icon = "https://edelivery.elluminatiinc.com/email_images/invoice/time.png";
                    var distance_icon = "https://edelivery.elluminatiinc.com/email_images/invoice/distance.png";
                    var credit_card = "https://edelivery.elluminatiinc.com/email_images/invoice/cash.png";
                    var support_icon = "https://edelivery.elluminatiinc.com/email_images/invoice/support.png";
                    var calendar_icon = "https://edelivery.elluminatiinc.com/email_images/invoice/calendar.png";
                    var main_icon = "https://edelivery.elluminatiinc.com/email_images/invoice/delivery_icon.png";


                    var context = {date: date,
                        title: title,
                        template_string: template_string,
                        calendar_icon: calendar_icon,
                        credit_card: credit_card,
                        distance_icon: distance_icon,
                        hour_icon: hour_icon,
                        support_icon: support_icon,
                        main_icon: main_icon,

                        store_unique_id: store_unique_id,
                        store_name: store_name,
                        store_email: store_email,
                        store_phone: store_phone,
                        store_address: store_address,

                        statement_number: store_weekly_earning.statement_number,
                        start_date: s_date,
                        end_date: e_date,

                        total_store_profit: store_weekly_earning.total_store_profit,
                        store_have_service_payment: store_weekly_earning.store_have_service_payment,
                        store_have_order_payment: store_weekly_earning.store_have_order_payment,

                        total_wallet_income_set_in_other_order: store_weekly_earning.total_wallet_income_set_in_other_order,
                        total_wallet_income_set_in_cash_order: store_weekly_earning.total_wallet_income_set_in_cash_order,
                        total_store_earning: store_weekly_earning.total_store_earning,

                        total_wallet_income_set: store_weekly_earning.total_wallet_income_set,
                        total_pay_to_store: store_weekly_earning.total_pay_to_store



                    };


                    var htmls = compiledTmpl(context);
                    htmls = htmls.replace(/&lt;/g, "<");
                    htmls = htmls.replace(/&gt;/g, ">");
                    htmls = htmls.replace(/&#34;/g, '"');

                    myUtils.mail_notification(store_email, title, pattern, htmls);

                }
            });

        }
    } catch (error) {
        console.error('ERROR!');
    }


};








// sendOrderRemainingEmail
//exports.sendOrderRemainingEmail = function (request_data, provider) {
//    try {
//        myEmail.sendEmail(request_data, provider, null, null, EMAIL_UNIQUE_ID.ORDER_REMAINING, "");
//    } catch (error) {
//        console.log('ERROR!');
//    }
//};




// send email //
//exports.adminsendEmail = function (request_data, detail, extra_param) {
//
//    var name = "";
//    var email = "";
//    var title = "Admin send email";
//    name = detail.name;
//    email = detail.email;
//    try {
//        myUtils.mail_notification(email, title, extra_param, "");
//    } catch (error) {
//        console.error('ERROR!');
//    }
//};
