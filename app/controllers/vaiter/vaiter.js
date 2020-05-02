require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
require('../../utils/push_code');
var utils = require('../../utils/utils');
var Store = require('mongoose').model('store');
var console = require('../../utils/console');
var Country = require('mongoose').model('country');
var City = require('mongoose').model('city');
var Vaiter = require('mongoose').model('vaiter');
var mongoose = require('mongoose');
var emails = require('../../controllers/email_sms/emails');
var SMS = require('../../controllers/email_sms/sms');
var Request_assistance = require('mongoose').model('request_assistance');
var Order = require('mongoose').model('order');
var User = require('mongoose').model('user');
var moment = require('moment');
var Order_payment = require('mongoose').model('order_payment');
var wallet_history = require('../../controllers/user/wallet');
var Request = require('mongoose').model('request');
var Table_request = require('mongoose').model('table_request');
var Payment_gateway = require('mongoose').model('payment_gateway');

//All APIs by BM - Burhanuddin Makda

vaiter_login = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'email', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let request_data_body = req.body;
            console.log(request_data_body);
            let email = ((request_data_body.email).trim()).toLowerCase();
            let encrypted_password = request_data_body.password;
            if (encrypted_password == undefined || encrypted_password == null || encrypted_password == "") {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.LOGIN_FAILED });
                return;
            }
            if (!email || email == "") {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.LOGIN_FAILED });
                return;
            }
            encrypted_password = utils.encryptPassword(encrypted_password);
            let query = { 'email': email };
            let vaiter_detail = await Vaiter.findOne(query)
            console.log("----------------vaiter_detail-----------------")
            console.log(vaiter_detail)

            if (!vaiter_detail) {
                console.log("----------------not vaiter_detail-----------------")
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            if (encrypted_password == "" || encrypted_password != vaiter_detail.password) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.INVALID_PASSWORD });
                return;
            }

            let country = await Country.findById(vaiter_detail.country_id);
            let store = await Store.findById(vaiter_detail.store_id);
            var server_token = utils.generateServerToken(32);
            vaiter_detail.server_token = server_token;
            var device_token = "";
            var device_type = "";
            if (vaiter_detail.device_token != "" && vaiter_detail.device_token != request_data_body.device_token) {
                device_token = vaiter_detail.device_token;
                device_type = vaiter_detail.device_type;
            }

            vaiter_detail.device_token = request_data_body.device_token;
            vaiter_detail.device_type = request_data_body.device_type;
            vaiter_detail.login_by = request_data_body.login_by;
            vaiter_detail.app_version = request_data_body.app_version;

            await vaiter_detail.save();
            if (device_token != "") {
                utils.sendPushNotification(ADMIN_DATA_ID.VAITER, device_type, device_token, VAITER_PUSH_CODE.LOGIN_IN_OTHER_DEVICE, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
            }

            let payment_gateway = await Payment_gateway.findOne({});    

            res.json({
                success: true,
                message: VAITER_MESSAGE_CODE.LOGIN_SUCCESSFULLY,
                minimum_phone_number_length: country.minimum_phone_number_length,
                maximum_phone_number_length: country.maximum_phone_number_length,
                currency_sign: country.currency_sign,
                vaiter: vaiter_detail,
                store: store,
                payment_gateway: payment_gateway,
                // stripe_key: "pk_test_jrVezASrgInh1YZfH6SHDFKN00wphI2i4x"

            });
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};
module.exports.vaiter_login = vaiter_login;

logout = async (req, res) => {
    utils.check_request_params(req.body, [], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            var request_data_body = req.body;
            let vaiter = await Vaiter.findOne({ _id: request_data_body.vaiter_id })
            if (!vaiter) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.VAITER_DATA_NOT_FOUND });
                return;
            }
            if (request_data_body.server_token == null || vaiter.server_token != request_data_body.server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }
            vaiter.device_token = "";
            vaiter.server_token = "";
            vaiter.is_online = false;
            vaiter.is_active_for_job = false;
            await vaiter.save();
            res.json({
                success: true,
                message: VAITER_MESSAGE_CODE.LOGOUT_SUCCESSFULLY

            });
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};
module.exports.logout = logout;


update_password = async (req, res) => {
    utils.check_request_params(req.body, [
        { name: 'vaiter_id', type: 'string' },
        { name: 'new_password', type: 'string' }], async (response) => {
            if (!response.success) {
                res.json(response);
                return;
            }
            try {
                let { vaiter_id, new_password, server_token } = req.body

                if (!new_password || new_password == "") {
                    res.json({ success: false, error_code: VAITER_ERROR_CODE.INVALID_PASSWORD });
                    return;
                }

                let vaiter_detail = await Vaiter.findById(vaiter_id)

                if (!vaiter_detail) {
                    res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                    return;
                }
                if (!server_token || vaiter_detail.server_token != server_token) {
                    res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    return;
                }

                let new_encrypted_password = utils.encryptPassword(new_password);
                vaiter_detail.password = new_encrypted_password;
                vaiter_detail.first_login = false;
                await vaiter_detail.save();
                res.json({
                    success: true,
                    message: VAITER_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
                    new_password: new_password
                });
            } catch (error) {
                console.log(error);
                res.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            }
        });
};
module.exports.update_password = update_password;

get_order_list = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'vaiter_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { vaiter_id, server_token, order_feature_type } = req.body
            let vaiter_detail = await Vaiter.findById(vaiter_id)

            if (!vaiter_detail) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            if (!server_token || vaiter_detail.server_token != server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }
            let store = await Store.findById(vaiter_detail.store_id);
            if (!store) {
                res.json({
                    success: false,
                    error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND
                });
                return;
            }
            let country = await Country.findById(store.country_id)

            var currency = country.currency_sign;

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
                        $eq: mongoose.Types.ObjectId(vaiter_detail.store_id)
                    }
                }
            };
            var order_feature_type_condition = { $match: {} };
            order_feature_type = Number(order_feature_type);
            if (order_feature_type !== 0) {
                order_feature_type_condition = {
                    "$match": {
                        "order_feature_type": {
                            $eq: order_feature_type
                        }
                    }
                }
            }


            var order_status_condition = {
                $match: {
                    $and: [{
                        $or: [
                            { order_status: { $eq: NEW_ORDER_STATE.NEW_ORDER } },
                            { order_status: { $eq: NEW_ORDER_STATE.ORDER_PROCESSING } },
                            { order_status: { $eq: NEW_ORDER_STATE.ORDER_MADE } },
                            { order_status: { $eq: NEW_ORDER_STATE.CANCELLATION_REQUESTED } }
                        ]
                    }, {
                        $or: [
                            { order_status_id: { $eq: ORDER_STATUS_ID.RUNNING } },
                            { order_status_id: { $eq: ORDER_STATUS_ID.WAITING_FOR_CANCEL } },
                        ]
                    }]
                }
            }
            //var request_id_condition = {"$match": {'request_id': null}};
            Order.aggregate([store_condition, order_status_condition, user_query, order_payment_query, order_feature_type_condition, array_to_json_user_query, array_to_json_order_payment_query, cart_query, array_to_json_cart_query, sort]).then((orders) => {
                if (orders.length == 0) {
                    res.json({
                        success: false,
                        error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND
                    });
                    return;
                }
                res.json({
                    success: true,
                    message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                    currency: currency,
                    orders: orders,
                });
            });
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
}
module.exports.get_order_list = get_order_list;

get_order_detail = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'order_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let request_data_body = req.body;
            let vaiter = await Vaiter.findById(request_data_body.vaiter_id)
            if (!vaiter) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            if (request_data_body.server_token == null || vaiter.server_token !== request_data_body.server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }
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

            let order = await Order.aggregate([order_condition, user_query, order_payment_query, store_query, cart_query, request_query, request_query, array_to_json_user_detail, array_to_json_store_detail, country_query, array_to_json_country_query, array_to_json_order_payment_query, array_to_json_cart_query, array_to_json_request_query])
            if (order.length === 0) {
                res.json({
                    success: false,
                    error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND
                });
                return;
            }
            res.json({
                success: true,
                message: ORDER_MESSAGE_CODE.GET_ORDER_DATA_SUCCESSFULLY,
                order: order[0]
            });
        } catch (e) {
            console.log(e)
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};
module.exports.get_order_detail = get_order_detail

request_assistance_list = async (req, res, next) => {
    utils.check_request_params(req.body, [{ name: 'vaiter_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            const { vaiter_id, server_token, request_type = 0 } = req.body; // 0 = Pending , 1 = History
            let vaiter = await Vaiter.findById(vaiter_id);
            if (!vaiter) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            if (!server_token || server_token == '' || vaiter.server_token !== server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }
            const mongoose = require('mongoose');
            let andquery = [{ "store_id": { $eq: mongoose.Types.ObjectId(vaiter.store_id) } }]
            let request_type_query = {};
            if (Number(request_type) == REQUEST_ASSISTANCE_TYPE.PENDING) {
                request_type_query['status'] = { '$eq': REQUEST_ASSISTANCE_STATUS.CREATED };
                andquery.push(request_type_query)
            }
            if (Number(request_type) == REQUEST_ASSISTANCE_TYPE.RESOLVED) {
                request_type_query['status'] = { '$eq': REQUEST_ASSISTANCE_STATUS.VAITER_RESOLVED };
                andquery.push(request_type_query)
            }

            let query = { '$match': { '$and': andquery } }
            let userlookup = {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_detail"
                }
            }
            let userunwind = { $unwind: '$user_detail' };

            let orderlookup = {
                $lookup: {
                    from: "orders",
                    localField: "order_id",
                    foreignField: "_id",
                    as: "order_detail"
                }
            }
            let orderunwind = {
                $unwind: {
                    path: "$order_detail",
                    preserveNullAndEmptyArrays: true
                }
            }

            let vaiterlookup = {
                $lookup: {
                    from: "vaiters",
                    localField: "vaiter_id",
                    foreignField: "_id",
                    as: "vaiter_detail"
                }
            }
            let vaiterunwind = {
                $unwind: {
                    path: "$vaiter_detail",
                    preserveNullAndEmptyArrays: true
                }
            }

            let project = {
                $project: {
                    "_id": 1,
                    "comment": 1,
                    "table_number": 1,
                    'user_detail.first_name': 1,
                    'user_detail.last_name': 1,
                    'user_detail.image_url': 1,
                    'user_detail.email': 1,
                    'user_detail.phone': 1,
                    'order_detail._id': 1,
                    'order_detail.order_status_id': 1,
                    'order_detail.order_status': 1,
                    'order_detail.unique_id': 1,
                    'order_detail.is_dine_in': 1,
                    'order_detail.date_time': 1,
                    'vaiter_detail.first_name': 1,
                    'vaiter_detail.last_name': 1,
                    'vaiter_detail.image_url': 1,
                    'vaiter_detail.email': 1,
                    'vaiter_detail.phone': 1,
                }
            }

            let finalqueries = [query, userlookup, userunwind, orderlookup, orderunwind, vaiterlookup, vaiterunwind, project];
            let request_assistance_data = await Request_assistance.aggregate(finalqueries);
            if (request_assistance_data.length == 0) {
                res.json({
                    success: false,
                    error_code: REQUEST_ASSISTANCE_ERROR_CODE.NO_REQUEST_ASSISTANCE_FOUND,
                });
                return;
            }
            res.json({
                success: true,
                message: REQUEST_ASSISTANCE_MESSAGE_CODE.LIST_SUCCESSFULLY,
                request_assistances: request_assistance_data,
                request_type: request_type
            });

        }
        catch (e) {
            console.log(e)
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                error: e
            });
        }
    })
}
module.exports.request_assistance_list = request_assistance_list;

resolve_request_assistance = async (req, res, next) => {
    utils.check_request_params(req.body, [{ name: 'vaiter_id', type: 'string' }, { name: 'request_assistance_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            const { vaiter_id, server_token, request_assistance_id } = req.body;
            let vaiter = await Vaiter.findById(vaiter_id);
            if (!vaiter) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            if (!server_token || server_token == '' || vaiter.server_token !== server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }

            let query = { '_id': request_assistance_id, 'status': 1 }
            let request_assistance_data = await Request_assistance.findOne(query);
            if (!request_assistance_data) {
                res.json({
                    success: false,
                    error_code: REQUEST_ASSISTANCE_ERROR_CODE.REQUEST_ALREADY_RESOLVED,
                });
                return;
            }
            request_assistance_data.vaiter_id = vaiter_id;
            request_assistance_data.status = REQUEST_ASSISTANCE_STATUS.VAITER_RESOLVED;
            await request_assistance_data.save()
            res.json({
                success: true,
                message: REQUEST_ASSISTANCE_MESSAGE_CODE.RESOLVED_SUCCESSFULLY,
                request_assistances: request_assistance_data,
            });

        }
        catch (e) {
            console.log(e)
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                error: e
            });
        }
    })
}
module.exports.resolve_request_assistance = resolve_request_assistance;

set_order_status = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'order_id', type: 'string' }, { name: 'vaiter_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            console.log(req.body);
            let request_data_body = req.body;
            let { order_id, order_status, vaiter_id, server_token } = request_data_body;

            let vaiter = await Vaiter.findById(vaiter_id)
            if (!vaiter) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }

            if (!server_token && vaiter.server_token !== server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }

            let store = await Store.findById(vaiter.store_id);
            order_status = Number(order_status);
            let query = { _id: order_id, store_id: vaiter.store_id }

            switch (order_status) {
                case NEW_ORDER_STATE.ORDER_PROCESSING:
                    order_processing(req, res, query, vaiter, store);
                    break;

                case NEW_ORDER_STATE.ORDER_MADE:
                    order_made(req, res, query, vaiter, store);
                    break;

                case NEW_ORDER_STATE.ORDER_COMPLETED:
                    complete_order(req, res, query, vaiter, store);
                    break;

                default:
                    res.json({ success: false, error_code: ORDER_ERROR_CODE.INVALID_ORDER_STATE });
                    return;
            }
        } catch (e) {
            console.log(e);
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};
module.exports.set_order_status = set_order_status;

order_processing = async (req, res, query, vaiter, store) => {
    query['order_status_id'] = ORDER_STATUS_ID.RUNNING;
    query['order_status'] = NEW_ORDER_STATE.NEW_ORDER;
    console.log(query, null, 3)
    let order = await Order.findOne(query)
    if (!order) {
        res.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_ALREADY_IN_PROCESS });
        return;
    }
    let user = await User.findById(order.user_id);
    if (user) {
        let device_type = user.device_type;
        let device_token = user.device_token;
        let phone_with_code = user.country_phone_code + user.phone;
        let order_data = {
            order_id: order._id,
            unique_id: order.unique_id,
            store_name: store.name,
            store_image: store.image_url
        }
        let vaitername = `${vaiter.first_name} ${vaiter.last_name}`
        order.order_status = NEW_ORDER_STATE.ORDER_PROCESSING;
        // let index = order.date_time.findIndex((x) => x.status == NEW_ORDER_STATE.ORDER_PROCESSING);
        // if (index == -1) {
        order.date_time.push({
            status: NEW_ORDER_STATE.ORDER_PROCESSING, date: new Date(),
            vaiter_id: vaiter._id, vaitername: vaitername, vaiter_uniqueid: vaiter.unique_id
        });
        // } else {
        //     order.date_time[index].date = new Date();
        // }

        await order.save();

        let today_start_date_time = utils.get_date_now_at_city(new Date(), order.timezone);
        let tag_date = moment(today_start_date_time).format(DATE_FORMATE.DDMMYYYY);


        // sms user order Prepare.
        if (setting_detail.is_sms_notification) {
            SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.USER_ORDER_PREPARE, "");
        }
        // mail user order Ready.
        if (setting_detail.is_mail_notification) {
            emails.sendOrderPrepareEmail(req, user);
        }
        utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, device_type, device_token, USER_PUSH_CODE.STORE_START_PREPARING_YOUR_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_data, "");
        res.json({ success: true, message: ORDER_MESSAGE_CODE.SET_ORDER_STATUS_SUCCESSFULLY, order: order });
    }
}

order_made = async (req, res, query, vaiter, store) => {
    query['order_status_id'] = ORDER_STATUS_ID.RUNNING;
    query['order_status'] = NEW_ORDER_STATE.ORDER_PROCESSING
    let order = await Order.findOne(query);
    if (!order) {
        res.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_ALREADY_MADE });
        return;
    }
    let order_payment = await Order_payment.findOne({ _id: order.order_payment_id, store_id: vaiter.store_id })

    let user = await User.findById(order.user_id);

    let device_type = user.device_type;
    let device_token = user.device_token;
    let phone_with_code = user.country_phone_code + user.phone;
    let order_data = {
        order_id: order._id,
        unique_id: order.unique_id,
        store_name: store.name,
        store_image: store.image_url
    }

    order.order_status = NEW_ORDER_STATE.ORDER_MADE;
    let vaitername = `${vaiter.first_name} ${vaiter.last_name}`;
    // let index = order.date_time.findIndex((x) => x.status == NEW_ORDER_STATE.ORDER_MADE);
    // if (index == -1) {
    order.date_time.push({
        status: NEW_ORDER_STATE.ORDER_MADE, date: new Date(),
        vaiter_id: vaiter._id, vaitername: vaitername, vaiter_uniqueid: vaiter.unique_id
    });
    // } else {
    //     order.date_time[index].date = new Date();
    // }

    await order.save();

    var today_start_date_time = utils.get_date_now_at_city(new Date(), order.timezone);
    var tag_date = moment(today_start_date_time).format(DATE_FORMATE.DDMMYYYY);

    utils.insert_daily_store_analytics(tag_date, store._id, NEW_ORDER_STATE.ORDER_MADE, order_payment.total_item_count, false);
    // sms user order Ready.
    if (setting_detail.is_sms_notification) {
        SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.USER_ORDER_READY, "");
    }
    // mail user order Ready.
    if (setting_detail.is_mail_notification) {
        emails.sendOrderReadyEmail(req, user);
        emails.sendStoreOrderReadyEmail(req, store);
    }
    // pust to user order Ready.
    utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, device_type, device_token, USER_PUSH_CODE.STORE_READY_YOUR_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_data, "");

    res.json({ success: true, message: ORDER_MESSAGE_CODE.SET_ORDER_STATUS_SUCCESSFULLY, order: order });

}

complete_order = async (req, res, query, vaiter, store) => {
    try {
        query['order_status_id'] = ORDER_STATUS_ID.RUNNING;
        query['order_status'] = NEW_ORDER_STATE.ORDER_MADE;
        console.log(query, null, 3)
        let vaiter_id = vaiter._id;
        let order = await Order.findOne(query)
        if (!order) {
            res.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_MADE_REMAINING });
            return;
        }

        let user = await User.findById(order.user_id)
        let city = await City.findById(store.city_id)
        let order_payment = await Order_payment.findById(order.order_payment_id);
        let vaitername = `${vaiter.first_name} ${vaiter.last_name}`

        if (!order_payment) {
            res.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_COMPLETE_FAILED });
            return;
        }

        let is_store_earning_add_in_wallet_on_cash_payment_for_city = city.is_store_earning_add_in_wallet_on_cash_payment;
        let is_store_earning_add_in_wallet_on_other_payment_for_city = city.is_store_earning_add_in_wallet_on_other_payment;
        let city_timezone = city.timezone;
        let now = new Date();
        let today_start_date_time = utils.get_date_now_at_city(now, city_timezone);
        let tag_date = moment(today_start_date_time).format(DATE_FORMATE.DDMMYYYY);
        let user_device_type = user.device_type;
        let user_device_token = user.device_token;

        order.order_status_id = ORDER_STATUS_ID.COMPLETED;
        order.order_status_by = vaiter_id;
        order.order_status = NEW_ORDER_STATE.ORDER_COMPLETED;
        order.completed_at = now;
        order.completed_date_tag = tag_date;
        order.completed_date_in_city_timezone = today_start_date_time;

        let index = order.date_time.findIndex((x) => x.status == NEW_ORDER_STATE.ORDER_COMPLETED);
        if (index == -1) {
            order.date_time.push({
                status: NEW_ORDER_STATE.ORDER_COMPLETED, date: new Date(),
                vaiter_id: vaiter_id, vaitername: vaitername, vaiter_uniqueid: vaiter.unique_id
            });
        } else {
            order.date_time[index].date = new Date();
        }

        await order.save();

        // Entry in Store_analytic_daily Table
        utils.insert_daily_store_analytics(tag_date, order.store_id, NEW_ORDER_STATE.ORDER_COMPLETED, order_payment.total_item_count, false);

        let payment_gateway_name = "Stripe";
        let store_have_service_payment = 0;
        let store_have_order_payment = 0;
        let total_store_have_payment = 0;
        let pay_to_store = 0;

        if (order_payment.is_store_pay_delivery_fees) {
            store_have_service_payment = order_payment.total_delivery_price;
            store_have_service_payment = utils.precisionRoundTwo(store_have_service_payment);
        }

        order_payment.total_store_income = order_payment.total_store_income + order_payment.total_provider_income;
        order_payment.total_provider_income = 0;
        total_store_have_payment = +store_have_service_payment + +store_have_order_payment;
        total_store_have_payment = utils.precisionRoundTwo(total_store_have_payment);
        let other_promo_payment_loyalty = order_payment.other_promo_payment_loyalty;
        pay_to_store = order_payment.total_store_income - other_promo_payment_loyalty - total_store_have_payment;
        pay_to_store = utils.precisionRoundTwo(pay_to_store);
        order_payment.pay_to_store = pay_to_store;

        if ((setting_detail.is_store_earning_add_in_wallet_on_cash_payment && is_store_earning_add_in_wallet_on_cash_payment_for_city) || (setting_detail.is_store_earning_add_in_wallet_on_other_payment && is_store_earning_add_in_wallet_on_other_payment_for_city)) {
            if (pay_to_store < 0) {

                let store_total_wallet_amount = wallet_history.add_wallet_history(ADMIN_DATA_ID.STORE, store.unique_id, store._id, store.country_id,
                    store.wallet_currency_code, order_payment.order_currency_code,
                    1, Math.abs(pay_to_store), store.wallet, WALLET_STATUS_ID.REMOVE_WALLET_AMOUNT, WALLET_COMMENT_ID.SET_ORDER_PROFIT, "Profit Of This Order : " + order.unique_id);

                store.wallet = store_total_wallet_amount;
            } else {
                let store_total_wallet_amount = wallet_history.add_wallet_history(ADMIN_DATA_ID.STORE, store.unique_id, store._id, store.country_id,
                    store.wallet_currency_code, order_payment.order_currency_code,
                    1, pay_to_store, store.wallet, WALLET_STATUS_ID.ADD_WALLET_AMOUNT, WALLET_COMMENT_ID.SET_ORDER_PROFIT, "Profit Of This Order : " + order.unique_id);

                store.wallet = store_total_wallet_amount;
            }

            store.save();
            order_payment.is_store_income_set_in_wallet = true;
            order_payment.store_income_set_in_wallet = Math.abs(pay_to_store);
        }

        if (setting_detail.is_mail_notification) {
            emails.sendUserOrderCompleteEmail(req, user);
        }

        order_payment.delivered_at = now;
        order_payment.completed_date_tag = tag_date;
        order_payment.completed_date_in_city_timezone = today_start_date_time;
        order_payment.tip_for = vaiter._id
        order_payment.save();

        let order_data = {
            order_id: order._id,
            unique_id: order.unique_id,
            store_name: store.name,
            store_image: store.image_url
        }
        utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, user_device_type, user_device_token, USER_PUSH_CODE.DELIVERY_MAN_COMPLETE_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_data, "");
        res.json({ success: true, message: ORDER_MESSAGE_CODE.ORDER_COMPLETED_SUCCESSFULLY, order: order });
    } catch (e) {
        console.log(e)
        res.json({ success: false, error_code: ERROR_CODE.SOMETHING_WENT_WRONG });
    }
};

cancel_order_accept = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'order_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let request_data_body = req.body;
            let { order_id, vaiter_id, server_token } = request_data_body;

            let vaiter = await Vaiter.findById(vaiter_id);
            if (!vaiter) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            let vaitername = `${vaiter.first_name} ${vaiter.last_name}`;

            if (!server_token && vaiter.server_token !== server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }
            let query = { _id: order_id, order_status: NEW_ORDER_STATE.CANCELLATION_REQUESTED, order_status_id: ORDER_STATUS_ID.WAITING_FOR_CANCEL }
            let order = await Order.findOne(query);
            if (!order) {
                res.json({ success: false, error_code: ORDER_ERROR_CODE.THIS_ORDER_CANNOT_BE_CANCELLED });
                return;
            }
            let order_payment = await Order_payment.findById(order.order_payment_id);
            if (!order_payment) {
                res.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_CANCEL_FAILED });
                return;
            }

            let user = await User.findById(order.user_id);
            let store = await Store.findById(vaiter.store_id);
            let request = await Request.findById(order.request_id);
            let now = new Date();

            let { payment_id, stripe_response } = order_payment;
            console.log(order_payment.stripe_response)
            if (!stripe_response) {
                console.log("Cash Trip...")
                res.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_CANCEL_FAILED });
                return;
            }
            utils.user_cancel_order_refund(payment_id, stripe_response.id, stripe_response.amount, async (return_data) => {
                if (!return_data.success) {
                    let refund = { date: date, response: return_data }
                    order_payment.refund_response.push({ refund });
                    await order_payment.save();
                    console.log(return_data.error);
                    res.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_CANCEL_FAILED, error: return_data.error });
                    return;
                }
                try {
                    if (request) {
                        request.completed_at = now;
                        request.completed_date_in_city_timezone = utils.get_date_now_at_city(now, order.timezone);
                        request.completed_date_tag = moment(request.completed_date_in_city_timezone).format(DATE_FORMATE.DDMMYYYY);
                        request.current_provider = null;
                        request.provider_id = null;
                        request.delivery_status = NEW_ORDER_STATE.CANCELLATION_CONFIRMED;
                        request.delivery_status_manage_id = ORDER_STATUS_ID.CANCELLED;
                        request.delivery_status_by = null;
                        var index = request.date_time.findIndex((x) => x.status == NEW_ORDER_STATE.CANCELLATION_CONFIRMED);
                        if (index == -1) {
                            request.date_time.push({
                                status: NEW_ORDER_STATE.CANCELLATION_CONFIRMED, date: new Date(),
                                vaiter_id: vaiter._id, vaitername: vaitername, vaiter_uniqueid: vaiter.unique_id
                            });
                        } else {
                            request.date_time[index].date = new Date();
                        }
                        request.save();
                    }

                    order.order_status = NEW_ORDER_STATE.CANCELLATION_CONFIRMED;
                    order.order_status_by = user._id;
                    order.order_status_id = ORDER_STATUS_ID.CANCELLED;
                    order.order_status_manage_id = ORDER_STATUS_ID.CANCELLED;

                    var index = order.date_time.findIndex((x) => x.status == NEW_ORDER_STATE.CANCELLATION_CONFIRMED);
                    if (index == -1) {
                        order.date_time.push({
                            status: NEW_ORDER_STATE.CANCELLATION_CONFIRMED, date: new Date(),
                            vaiter_id: vaiter._id, vaitername: vaitername, vaiter_uniqueid: vaiter.unique_id
                        });
                    } else {
                        order.date_time[index].date = new Date();
                    }

                    order.completed_at = now;
                    order.completed_date_in_city_timezone = utils.get_date_now_at_city(now, order.timezone);
                    order.completed_date_tag = moment(order.completed_date_in_city_timezone).format(DATE_FORMATE.DDMMYYYY);

                    await order.save()
                    // sms to store order Cancelled.
                    if (setting_detail.is_sms_notification && store) {
                        var store_phone_code = store.country_phone_code + store.phone;
                        SMS.sendOtherSMS(store_phone_code, SMS_UNIQUE_ID.STORE_ORDER_CANCELLED, "");
                    }
                    // mail to store order Cancelled.
                    if (setting_detail.is_mail_notification && store) {
                        emails.sendStoreOrderCancelEmail(req, store);

                    }

                    order_payment.completed_at = now;
                    order_payment.completed_date_in_city_timezone = utils.get_date_now_at_city(now, order.timezone);
                    order_payment.completed_date_tag = moment(order_payment.completed_date_in_city_timezone).format(DATE_FORMATE.DDMMYYYY);

                    var is_payment_mode_cash = order_payment.is_payment_mode_cash;

                    var order_wallet_payment = order_payment.wallet_payment;
                    if (order_payment.payment_id != null && !is_payment_mode_cash) {
                        order_wallet_payment = +order_wallet_payment + +order_payment.card_payment;
                    }

                    var orders = user.orders;
                    var index = orders.indexOf(order._id);
                    if (index >= 0) {
                        orders.splice(index, 1);
                        user.orders = orders;
                        await user.save()
                    }

                    order_payment.promo_id = null;

                    order_payment.pay_to_provider = 0;
                    order_payment.pay_to_store = 0;

                    order_payment.total_admin_profit_on_store = 0;
                    order_payment.total_store_income = 0;
                    order_payment.total_admin_profit_on_delivery = 0;
                    order_payment.total_provider_income = 0;
                    order_payment.is_payment_paid = true;

                    order_payment.cash_payment = 0;
                    order_payment.card_payment = 0;
                    order_payment.wallet_payment = 0;
                    order_payment.promo_payment = 0;
                    order_payment.user_pay_payment = 0;
                    // order_payment.total = 0;
                    order_payment.refund_amount = order_payment.total;
                    order_payment.is_paid_from_wallet = false;
                    order_payment.is_store_pay_delivery_fees = false;
                    order_payment.is_order_price_paid_by_store = false,
                        order_payment.is_promo_for_delivery_service = false;

                    await order_payment.save();

                    //Refund User Payment
                    res.json({ success: true, message: ORDER_MESSAGE_CODE.ORDER_CANCEL_SUCCESSFULLY });

                    if (store) {
                        utils.sendPushNotification(ADMIN_DATA_ID.STORE, store.device_type, store.device_token, STORE_PUSH_CODE.USER_CANCELLED_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                    }
                } catch (e) {
                    console.log(e)
                    res.json({ success: false, error_code: ERROR_CODE.SOMETHING_WENT_WRONG });
                }
            })
        } catch (e) {
            console.log(e);
            res.json({ success: false, error_code: ERROR_CODE.SOMETHING_WENT_WRONG });
        }
    });
};
module.exports.cancel_order_accept = cancel_order_accept;

cancel_order_rejected = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'order_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let request_data_body = req.body;
            let { order_id, vaiter_id, server_token } = request_data_body;

            let vaiter = await Vaiter.findById(vaiter_id);
            if (!vaiter) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            let vaitername = `${vaiter.first_name} ${vaiter.last_name}`;

            if (!server_token && vaiter.server_token !== server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }
            let query = { _id: order_id, order_status: NEW_ORDER_STATE.CANCELLATION_REQUESTED, order_status_id: ORDER_STATUS_ID.WAITING_FOR_CANCEL }
            let order = await Order.findOne(query);
            if (!order) {
                res.json({ success: false, error_code: ORDER_ERROR_CODE.THIS_ORDER_CANCEL_CANNOT_BE_RJECTED });
                return;
            }
            let order_payment = await Order_payment.findById(order.order_payment_id);
            if (!order_payment) {
                res.json({ success: false, error_code: ORDER_ERROR_CODE.ORDER_CANCEL_FAILED });
                return;
            }
            let user = await User.findById(order.user_id);
            let store = await Store.findById(vaiter.store_id);

            let rejected_status = {
                status: NEW_ORDER_STATE.CANCELLATION_REJECTED, date: new Date(),
                vaiter_id: vaiter._id, vaitername: vaitername, vaiter_uniqueid: vaiter.unique_id
            }

            let previous_state_index = order.date_time.length;
            let previous_state = order.date_time[previous_state_index - 2];
            console.log(previous_state)
            previous_state.date_time = new Date();
            previous_state.vaiter_id = vaiter._id;
            previous_state.vaitername = vaitername;
            previous_state.vaiter_uniqueid = vaiter.unique_id;
            order.date_time.push(rejected_status);
            order.date_time.push(previous_state);

            order.order_status = previous_state.status;
            order.order_status_id = ORDER_STATUS_ID.RUNNING;
            await order.save();

            let device_type = user.device_type;
            let device_token = user.device_token;
            // let phone_with_code = user.country_phone_code + user.phone;
            let order_data = {
                order_id: order._id,
                unique_id: order.unique_id,
                store_name: store.name,
                store_image: store.image_url
            }


            var today_start_date_time = utils.get_date_now_at_city(new Date(), order.timezone);
            var tag_date = moment(today_start_date_time).format(DATE_FORMATE.DDMMYYYY);

            utils.insert_daily_store_analytics(tag_date, store._id, previous_state.status, order_payment.total_item_count, false);
            // sms user order Ready.
            // if (setting_detail.is_sms_notification) {
            //     SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.USER_ORDER_READY, "");
            // }
            // mail user order Ready.
            // if (setting_detail.is_mail_notification) {
            //     emails.sendOrderReadyEmail(req, user);
            //     emails.sendStoreOrderReadyEmail(req, store);
            // }
            // pust to user order Ready.
            utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, device_type, device_token, USER_PUSH_CODE.VAITER_REJECTED_CANCEL_ORDER, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_data, "");
            res.json({ success: true, message: ORDER_MESSAGE_CODE.VAITER_REJECTED_CANCEL_ORDER_SUCCESSFULLY, order: order });
        } catch (e) {
            console.log(e);
            res.json({ success: false, error_code: ERROR_CODE.SOMETHING_WENT_WRONG });
        }
    });
};
module.exports.cancel_order_rejected = cancel_order_rejected;

forgot_password = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'email', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { email } = req.body;
            email = ((email).trim()).toLowerCase();
            let vaiter_detail = await Vaiter.findOne({ 'email': email });

            if (!vaiter_detail) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NO_VAITER_FOUND });
                return;
            }
            let code = utils.generateOtp(8);
            var server_token = utils.generateServerToken(32);
            vaiter_detail.server_token = server_token;
            await vaiter_detail.save();
            emails.userForgotPassword(req, vaiter_detail, code, ADMIN_DATA_ID.VAITER);
            res.json({ success: true, code: code, vaiter_id: vaiter_detail._id, server_token: server_token, message: VAITER_MESSAGE_CODE.GET_OTP_SUCCESSFULLY })


        } catch (e) {
            console.log(e);
            res.json({ success: false, error_code: ERROR_CODE.SOMETHING_WENT_WRONG });
        }
    });
};
module.exports.forgot_password = forgot_password;


get_feature_list = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'vaiter_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { vaiter_id, server_token } = req.body;
            let vaiter_detail = await Vaiter.findById(vaiter_id);

            if (!vaiter_detail) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NO_VAITER_FOUND });
                return;
            }

            if (!server_token && vaiter_detail.server_token !== server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }
            let store = await Store.findById(vaiter_detail.store_id);
            res.json({ success: true, feature_list: STORE_FEATURES, features_available: store.features_available, message: VAITER_MESSAGE_CODE.GET_FEATURES_LIST_SUCCESSFULLY });
            return;
        } catch (e) {
            console.log(e);
            res.json({ success: false, error_code: ERROR_CODE.SOMETHING_WENT_WRONG });
        }
    });
};
module.exports.get_feature_list = get_feature_list;


update_feature_list = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'vaiter_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { vaiter_id, server_token, features_available } = req.body;
            let vaiter_detail = await Vaiter.findById(vaiter_id);

            if (!vaiter_detail) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NO_VAITER_FOUND });
                return;
            }

            if (!server_token && vaiter_detail.server_token !== server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }
            let { employee_type } = vaiter_detail



            if (employee_type == VAITER_TYPES.MANAGER) {
                let store = await Store.findById(vaiter_detail.store_id);
                store.features_available = features_available;
                await store.save();
                res.json({ success: true, features_available: store.features_available, message: VAITER_MESSAGE_CODE.UPDATE_FEATURES_LIST_SUCCESSFULLY });
                return;
            }
            res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_AUTHORIZED });
        } catch (e) {
            console.log(e);
            res.json({ success: false, error_code: ERROR_CODE.SOMETHING_WENT_WRONG });
        }
    });
};
module.exports.update_feature_list = update_feature_list;


search_vaiter = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'search_value', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { search_value } = req.body;
            search_value = search_value.replace(/^\s+|\s+$/g, '');
            search_value = search_value.replace(/ +(?= )/g, '');
            search_value.toLowerCase()
            let query = {};


            let full_name = search_value.split(' ');
            if (full_name.length == 1) {
                query = {
                    $or: [
                        { email: search_value },
                        { "first_name": { $regex: new RegExp(search_value), $options: 'i' } },
                        { "last_name": { $regex: new RegExp(search_value), $options: 'i' } }
                    ]
                }
            } else {
                query = {
                    $or: [
                        { email: search_value },
                        {
                            "$and": [
                                { "first_name": { $regex: new RegExp(full_name[0]), $options: 'i' } },
                                { "last_name": { $regex: new RegExp(full_name[1]), $options: 'i' } },
                            ]
                        },
                        {
                            "$and": [
                                { "first_name": { $regex: new RegExp(full_name[1]), $options: 'i' } },
                                { "last_name": { $regex: new RegExp(full_name[0]), $options: 'i' } },
                            ]
                        }
                    ]
                }
            }

            let project = { _id: 1, first_name: 1, last_name: 1, email: 1, phone: 1, image_url: 1, employee_type: 1 }
            let vaiter = await Vaiter.findOne(query, project)
            if (vaiter) {
                res.json({ success: true, vaiter: vaiter, message: VAITER_MESSAGE_CODE.GET_DETAIL_SUCCESSFULLY })
                return;
            }
            res.json({ success: false, error_code: VAITER_ERROR_CODE.DATA_NOT_FOUND })
        } catch (e) {
            console.log(e);
            res.json({ success: false, error_code: ERROR_CODE.SOMETHING_WENT_WRONG });
        }
    });
};
module.exports.search_vaiter = search_vaiter;


table_request_list = async (req, res, next) => {
    utils.check_request_params(req.body, [{ name: 'vaiter_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            const { vaiter_id, server_token, request_type = 0 } = req.body; // 0 = Pending , 1 = History
            let vaiter = await Vaiter.findById(vaiter_id);
            if (!vaiter) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            if (!server_token || server_token == '' || vaiter.server_token !== server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }
            const mongoose = require('mongoose');
            let andquery = [{ "store_id": { $eq: mongoose.Types.ObjectId(vaiter.store_id) } }]
            let request_type_query = {};
            request_type_query['status'] = { '$eq': TABLE_REQUEST_STATUS.CREATED };
            andquery.push(request_type_query)

            let query = { '$match': { '$and': andquery } }

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

            let project = {
                $project: {
                    "_id": 1,
                    "number_of_people": 1,
                    "status": 1,
                    "created_at": 1,
                    "from_vaiter": 1,
                    "user_name": 1,
                    'user_detail.first_name': 1,
                    'user_detail.last_name': 1,
                    'user_detail.image_url': 1,
                    'user_detail.email': 1,
                    'user_detail.phone': 1,
                }
            }

            let sort = {
                $sort: {
                    "created_at": -1
                }
            }

            let finalqueries = [query, userlookup, userunwind, project, sort];
            let table_requests = await Table_request.aggregate(finalqueries);
            if (table_requests.length == 0) {
                res.json({
                    success: false,
                    error_code: TABLE_REQUEST_ERROR_CODE.NO_TABLE_REQUEST_FOUND,
                });
                return;
            }
            res.json({
                success: true,
                message: TABLE_REQUEST_MESSAGE_CODE.LIST_SUCCESSFULLY,
                table_requests: table_requests,
            });

        }
        catch (e) {
            console.log(e)
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                error: e
            });
        }
    })
}
module.exports.table_request_list = table_request_list;

resolve_table_request = async (req, res, next) => {
    utils.check_request_params(req.body, [{ name: 'vaiter_id', type: 'string' }, { name: 'table_request_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            const { vaiter_id, server_token, table_request_id, table_number } = req.body;
            let vaiter = await Vaiter.findById(vaiter_id);
            if (!vaiter) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            if (!server_token || server_token == '' || vaiter.server_token !== server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }

            let query = { '_id': table_request_id, 'status': TABLE_REQUEST_STATUS.CREATED }
            let table_request = await Table_request.findOne(query);
            if (!table_request) {
                res.json({
                    success: false,
                    error_code: TABLE_REQUEST_ERROR_CODE.REQUEST_ALREADY_RESOLVED,
                });
                return;
            }
            table_request.vaiter_id = vaiter_id;
            table_request.status = TABLE_REQUEST_STATUS.VAITER_RESOLVED;
            table_request.table_number = table_number;
            table_request.resolved_at = new Date();
            await table_request.save();

            if (!table_request.from_vaiter) {
                let user = await User.findById(table_request.user_id);
                let { device_type, device_token } = user;
                if (device_token != "") {
                    let data = {
                        table_number: table_number,
                        store_id: table_request.store_id
                    }
                    utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, device_type, device_token, USER_PUSH_CODE.TABLE_REQUEST_RESOLVED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, data, "");
                }
            }

            res.json({
                success: true,
                message: TABLE_REQUEST_MESSAGE_CODE.RESOLVED_SUCCESSFULLY,
                table_request: table_request,
            });
        }
        catch (e) {
            console.log(e)
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                error: e
            });
        }
    })
}
module.exports.resolve_table_request = resolve_table_request;