require('../utils/message_code');
require('../utils/error_code');
require('../utils/constants');
require('../utils/push_code');
var utils = require('../utils/utils');
var Store = require('mongoose').model('store');
var console = require('../utils/console');
var Country = require('mongoose').model('country');
var City = require('mongoose').model('city');
var Vaiter = require('mongoose').model('vaiter');
var mongoose = require('mongoose');
var emails = require('../controllers/email_sms/emails');
var SMS = require('../controllers/email_sms/sms');
var Request_assistance = require('mongoose').model('request_assistance');
var Table_request = require('mongoose').model('table_request');

//All APIs by Burhanuddin Makda

add_new_vaiter = async (req, res) => {
    utils.check_request_params(req.body, [], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            console.log(req.body)
            var { store_id, password, email, phone } = req.body;
            let store_data = await Store.findById(store_id);
            if (!store_data) {
                res.json({ success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND });
                return;
            }
            let enc_pass = await utils.encryptPassword(password);
            delete req.body.password
            let query = { "$or": [, { "phone": phone }] }
            let already_used_email = await Vaiter.findOne({ "email": email });
            if (already_used_email) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.EMAIL_ALREADY_REGISTRED });
                return;
            }
            let already_used_phone = await Vaiter.findOne({ "phone": phone });
            if (already_used_phone) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.PHONE_NUMBER_ALREADY_REGISTRED });
                return;
            }
            var image_file = req.files;
            let vaiter = await new Vaiter(req.body);
            let server_token = await utils.generateServerToken(32);

            vaiter.password = enc_pass;
            vaiter.country_id = store_data.country_id;
            vaiter.city_id = store_data.city_id;
            vaiter.store_id = store_id;
            vaiter.store_name = store_data.name;

            vaiter.country_phone_code = store_data.country_phone_code;
            vaiter.wallet_currency_code = store_data.wallet_currency_code;
            vaiter.server_token = server_token;
            var image_file = req.files;
            if (image_file != undefined && image_file.length > 0) {
                var image_name = vaiter._id + utils.generateServerToken(4);
                var url = utils.getStoreImageFolderPath(FOLDER_NAME.VAITER_PROFILES) + image_name + FILE_EXTENSION.VAITER;
                utils.storeImageToFolder(image_file[0].path, image_name + FILE_EXTENSION.VAITER, FOLDER_NAME.VAITER_PROFILES);
                vaiter.image_url = url;
            } else {
                vaiter.image_url = '';
            }
            var first_name = (req.body.first_name).trim();
            first_name = first_name.charAt(0).toUpperCase() + first_name.slice(1);
            var last_name = (req.body.last_name).trim();
            last_name = last_name.charAt(0).toUpperCase() + last_name.slice(1);
            vaiter.first_name = first_name;
            vaiter.last_name = last_name;
            await vaiter.save();
            res.json({
                success: true,
                message: VAITER_MESSAGE_CODE.REGISTER_SUCCESSFULLY,
                vaiter: vaiter,
            })

        } catch (e) {
            console.log(e)
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                error: e
            });
        }
    })
}
module.exports.add_new_vaiter = add_new_vaiter;

get_vaiters = async (req, res) => {
    utils.check_request_params(req.body, [], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            var request_data_body = req.body;
            var city_query = {
                $lookup:
                {
                    from: "cities",
                    localField: "city_id",
                    foreignField: "_id",
                    as: "city_details"
                }
            };
            var array_to_json_city_query = { $unwind: "$city_details" };
            var number_of_rec = Number(request_data_body.number_of_rec);
            var page = request_data_body.page;
            var sort_field = request_data_body.sort_field;
            var sort_vaiter = request_data_body.sort_vaiter;
            var search_field = request_data_body.search_field;
            var search_value = request_data_body.search_value;
            search_value = search_value.replace(/^\s+|\s+$/g, '');
            search_value = search_value.replace(/ +(?= )/g, '');
            var vaiter_page_type = request_data_body.vaiter_page_type;

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
            sort["$sort"][sort_field] = parseInt(sort_vaiter);
            var count = { $group: { _id: null, total: { $sum: 1 }, data: { $push: '$data' } } };
            var skip = {};
            skip["$skip"] = (page * number_of_rec) - number_of_rec;
            var limit = {};
            limit["$limit"] = number_of_rec;

            var condition = { $match: {} };
            if (vaiter_page_type == 1) {
                condition = { $match: { 'is_online': { $eq: true }, 'is_approved': { $eq: true } } };

            } else if (vaiter_page_type == 2) {
                condition = { $match: { 'is_approved': { $eq: true } } };

            } else if (vaiter_page_type == 3) {

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

            var array_to_json2 = { $unwind: "$country_details" };

            var store_query = {
                $lookup:
                {
                    from: "stores",
                    localField: "store_id",
                    foreignField: "_id",
                    as: "store_details"
                }
            };

            var store_query_array_to_json2 = { $unwind: "$store_details" };

            var type_id_condition = { $match: {} }
            if (request_data_body.store_id) {
                type_id_condition = { $match: { store_id: { $eq: mongoose.Types.ObjectId(request_data_body.store_id) } } }
            }

            let vaiters = await Vaiter.aggregate([condition, type_id_condition, city_query, array_to_json_city_query, country_query, array_to_json2, store_query, store_query_array_to_json2, search, count])
            if (vaiters.length === 0) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.DATA_NOT_FOUND, pages: 0 });
                return;
            }
            var pages = Math.ceil(vaiters[0].total / number_of_rec);
            if (page) {
                let vaiter_data = await Vaiter.aggregate([condition, type_id_condition, city_query, array_to_json_city_query, country_query, array_to_json2, store_query, store_query_array_to_json2, sort, search, skip, limit])
                if (vaiter_data.length === 0) {
                    res.json({ success: false, error_code: VAITER_ERROR_CODE.DATA_NOT_FOUND });
                    return;
                }
                res.json({ success: true, pages: pages, vaiters: vaiter_data });
                return;
            }
            let vaiter_data = await Vaiter.aggregate([condition, type_id_condition, city_query, array_to_json_city_query, country_query, array_to_json2, store_query, store_query_array_to_json2, sort, search])
            if (vaiter_data.length === 0) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.DATA_NOT_FOUND });
                return;
            }
            res.json({
                success: true,
                message: VAITER_MESSAGE_CODE.VAITER_LIST_SUCCESSFULLY,
                vaiters: vaiter_data,
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
}
module.exports.get_vaiters = get_vaiters;

vaiter_approve_decline = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'vaiter_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            var request_data_body = req.body;
            var vaiter_id = request_data_body.vaiter_id;
            var vaiter_page_type = request_data_body.vaiter_page_type;
            let vaiter = await Vaiter.findOne({ _id: vaiter_id });
            if (!vaiter) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.VAITER_DATA_NOT_FOUND });
                return;
            }
            var phone_with_code = vaiter.country_phone_code + vaiter.phone;
            var device_type = vaiter.device_type;
            var device_token = vaiter.device_token;

            if (vaiter_page_type == 3) {
                vaiter.is_approved = true;
                await vaiter.save();
                if (setting_detail.is_mail_notification) {
                    emails.sendVaiterApprovedEmail(req, vaiter, vaiter.first_name + " " + vaiter.last_name);
                }
                if (setting_detail.is_sms_notification) {
                    SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.VAITER_APPROVED, "");
                }
                if (setting_detail.is_push_notification) {
                    utils.sendPushNotification(ADMIN_DATA_ID.VAITER, device_type, device_token, VAITER_PUSH_CODE.APPROVED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                }
                res.json({
                    success: true,
                    message: VAITER_MESSAGE_CODE.APPROVED_SUCCESSFULLY

                });
                return;
            }
            else if (vaiter_page_type == 1 || vaiter_page_type == 2) {
                vaiter.is_approved = false;
                vaiter.is_active_for_job = false;
                vaiter.is_online = false;
                await vaiter.save();

                if (setting_detail.is_mail_notification) {
                    emails.sendVaiterDeclineEmail(req, vaiter, vaiter.first_name + " " + vaiter.last_name);
                }
                if (setting_detail.is_sms_notification) {
                    SMS.sendOtherSMS(phone_with_code, SMS_UNIQUE_ID.VAITER_DECLINE, "");
                }
                if (setting_detail.is_push_notification) {
                    utils.sendPushNotification(ADMIN_DATA_ID.VAITER, device_type, device_token, VAITER_PUSH_CODE.DECLINED, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                }
                res.json({
                    success: true,
                    message: VAITER_MESSAGE_CODE.DECLINED_SUCCESSFULLY
                });
            }
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
}
module.exports.vaiter_approve_decline = vaiter_approve_decline;

update_vaiter = async (req, res) => {
    utils.check_request_params(req.body, [{ name: 'vaiter_id', type: 'string' }], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            var request_data_body = req.body;
            var vaiter_id = request_data_body.vaiter_id;

            let phonecondition = await Vaiter.find({ _id: { '$ne': vaiter_id }, phone: request_data_body.phone })

            if (phonecondition.length > 0) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.PHONE_NUMBER_ALREADY_REGISTRED });
                return;
            }

            let emailcondition = await Vaiter.find({ _id: { '$ne': vaiter_id }, email: request_data_body.email.trim().toLowerCase() })

            if (emailcondition.length > 0) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.EMAIL_ALREADY_REGISTRED });
                return;
            }

            let vaiter_data = await Vaiter.findOneAndUpdate({ _id: vaiter_id }, request_data_body, { new: true })
            if (!vaiter_data) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.UPDATE_FAILED });
                return;
            }

            var image_file = req.files;
            if (image_file != undefined && image_file.length > 0) {
                utils.deleteImageFromFolder(vaiter_data.image_url, FOLDER_NAME.VAITER_PROFILES);
                var image_name = vaiter_data._id + utils.generateServerToken(4);
                var url = utils.getStoreImageFolderPath(FOLDER_NAME.VAITER_PROFILES) + image_name + FILE_EXTENSION.VAITER;
                utils.storeImageToFolder(image_file[0].path, image_name + FILE_EXTENSION.VAITER, FOLDER_NAME.VAITER_PROFILES);
                vaiter_data.image_url = url;
            }
            var first_name = (request_data_body.first_name).trim();
            first_name = first_name.charAt(0).toUpperCase() + first_name.slice(1);
            var last_name = (request_data_body.last_name).trim();
            last_name = last_name.charAt(0).toUpperCase() + last_name.slice(1);
            vaiter_data.first_name = first_name;
            vaiter_data.last_name = last_name;
            vaiter_data.save();

            res.json({
                success: true,
                message: VAITER_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
                vaiter: vaiter_data

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
module.exports.update_vaiter = update_vaiter;

delete_vaiter = async (req, res) => {
    try {
        let id = req.body.id;
        let vaiter = await Vaiter.findById(id)
        let device_token = vaiter.device_token;

        if (device_token != "") {
            utils.sendPushNotification(ADMIN_DATA_ID.VAITER, device_type, device_token, VAITER_PUSH_CODE.LOGIN_IN_OTHER_DEVICE, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
        }

        let deleted = await Vaiter.deleteOne({ _id: id })
        res.json({
            success: true,
            data: deleted
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: VAITER_MESSAGE_CODE.VAITER_DELETED_SUCCESSFULLY,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
        });
    }
};

module.exports.delete_vaiter = delete_vaiter

get_request_assistance_list = async (req, res) => {
    utils.check_request_params(req.body, [], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            const request_data_body = req.body;

            let { store_id, number_of_rec, page, sort_field, sort_ra, search_field, search_value, ra_page_type } = request_data_body

            number_of_rec = Number(number_of_rec);
            search_value = search_value.replace(/^\s+|\s+$/g, '');

            const mongoose = require('mongoose');
            let andquery = [];
            if (store_id) {
                andquery = [{ "store_id": { $eq: mongoose.Types.ObjectId(store_id) } }]
            }
            let ra_page_type_query = {};
            if (Number(ra_page_type) == REQUEST_ASSISTANCE_TYPE.PENDING) {
                ra_page_type_query['status'] = { '$eq': REQUEST_ASSISTANCE_STATUS.CREATED };
                andquery.push(ra_page_type_query)
            }
            if (Number(ra_page_type) == REQUEST_ASSISTANCE_TYPE.RESOLVED) {
                ra_page_type_query['status'] = { '$eq': REQUEST_ASSISTANCE_STATUS.VAITER_RESOLVED };
                andquery.push(ra_page_type_query)
            }

            let type_query = { '$match': { '$and': andquery } }
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
            let storelookup = {
                $lookup: {
                    from: "stores",
                    localField: "store_id",
                    foreignField: "_id",
                    as: "store_details"
                }
            }
            let storeunwind = { $unwind: "$store_details" }

            if (search_field === "user_detail.first_name") {
                var query1 = {};
                var query2 = {};
                var query3 = {};
                var query4 = {};
                var query5 = {};
                var query6 = {};




                var full_name = search_value.split(' ');
                if (typeof full_name[0] === 'undefined' || typeof full_name[1] === 'undefined') {

                    query1[search_field] = { $regex: new RegExp(search_value, 'i') };
                    query2['user_detail.last_name'] = { $regex: new RegExp(search_value, 'i') };
                    var search = { "$match": { $or: [query1, query2] } };
                } else {
                    query1[search_field] = { $regex: new RegExp(search_value, 'i') };
                    query2['user_detail.last_name'] = { $regex: new RegExp(search_value, 'i') };
                    query3[search_field] = { $regex: new RegExp(full_name[0], 'i') };
                    query4['user_detail.last_name'] = { $regex: new RegExp(full_name[0], 'i') };
                    query5[search_field] = { $regex: new RegExp(full_name[1], 'i') };
                    query6['user_detail.last_name'] = { $regex: new RegExp(full_name[1], 'i') };
                    var search = { "$match": { $or: [query1, query2, query3, query4, query5, query6] } };
                }
            } else if (search_field == 'user_detail.unique_id' || search_field == 'vaiter_detail.unique_id') {
                var query = {};
                query[search_field] = { $eq: Number(search_value) };
                var search = { "$match": query };
            } else {
                var query = {};
                query[search_field] = { $regex: new RegExp(search_value, 'i') };
                var search = { "$match": query };
            }



            var sort = { "$sort": {} };
            sort["$sort"][sort_field] = parseInt(sort_ra);
            var count = { $group: { _id: null, total: { $sum: 1 }, data: { $push: '$data' } } };
            var skip = {};
            skip["$skip"] = (page * number_of_rec) - number_of_rec;
            var limit = {};
            limit["$limit"] = number_of_rec;

            let finalqueries = [type_query, userlookup, userunwind, orderlookup, orderunwind, vaiterlookup, vaiterunwind, storelookup, storeunwind, search, count];
            let request_assistances = await Request_assistance.aggregate(finalqueries)
            if (request_assistances.length === 0) {
                res.json({ success: false, error_code: REQUEST_ASSISTANCE_ERROR_CODE.NO_REQUEST_ASSISTANCE_FOUND, pages: 0 });
                return;
            }
            var pages = Math.ceil(request_assistances[0].total / number_of_rec);
            if (page) {
                let finalquerywithlimit = [type_query, userlookup, userunwind, orderlookup, orderunwind, vaiterlookup, vaiterunwind, storelookup, storeunwind, sort, search, skip, limit];
                let ra_data = await Request_assistance.aggregate(finalquerywithlimit)
                if (ra_data.length === 0) {
                    res.json({ success: false, error_code: REQUEST_ASSISTANCE_ERROR_CODE.NO_REQUEST_ASSISTANCE_FOUND });
                    return;
                }
                res.json({ success: true, pages: pages, request_assistances: ra_data });
                return;
            }
            let finalquerieswithoutlimit = [type_query, userlookup, userunwind, orderlookup, orderunwind, vaiterlookup, vaiterunwind, storelookup, storeunwind, sort, search];
            let ra_data = await Request_assistance.aggregate(finalquerieswithoutlimit)
            if (ra_data.length === 0) {
                res.json({ success: false, error_code: REQUEST_ASSISTANCE_ERROR_CODE.NO_REQUEST_ASSISTANCE_FOUND });
                return;
            }
            res.json({
                success: true,
                message: REQUEST_ASSISTANCE_MESSAGE_CODE.LIST_SUCCESSFULLY,
                vaiters: ra_data,
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
module.exports.get_request_assistance_list = get_request_assistance_list;

get_table_request_list = async (req, res) => {
    utils.check_request_params(req.body, [], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            const request_data_body = req.body;

            let { store_id, number_of_rec, page, sort_field, sort_table_request, search_field, search_value, table_request_page_type } = request_data_body

            number_of_rec = Number(number_of_rec);
            search_value = search_value.replace(/^\s+|\s+$/g, '');

            const mongoose = require('mongoose');
            let andquery = [];
            if (store_id) {
                andquery = [{ "store_id": { $eq: mongoose.Types.ObjectId(store_id) } }]
            }
            let table_request_page_type_query = {};
            if (Number(table_request_page_type) == TABLE_REQUEST_TYPE.PENDING) {
                table_request_page_type_query['status'] = { '$eq': TABLE_REQUEST_STATUS.CREATED };
                andquery.push(table_request_page_type_query)
            }
            if (Number(table_request_page_type) == TABLE_REQUEST_TYPE.RESOLVED) {
                table_request_page_type_query['status'] = { '$eq': TABLE_REQUEST_STATUS.VAITER_RESOLVED };
                andquery.push(table_request_page_type_query)
            }

            let type_query = { '$match': { '$and': andquery } }
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
            let storelookup = {
                $lookup: {
                    from: "stores",
                    localField: "store_id",
                    foreignField: "_id",
                    as: "store_details"
                }
            }
            let storeunwind = { $unwind: "$store_details" }

            if (search_field === "user_detail.first_name") {
                var query1 = {};
                var query2 = {};
                var query3 = {};
                var query4 = {};
                var query5 = {};
                var query6 = {};
                var query7 = {};



                var full_name = search_value.split(' ');
                if (typeof full_name[0] === 'undefined' || typeof full_name[1] === 'undefined') {

                    query1[search_field] = { $regex: new RegExp(search_value, 'i') };
                    query2['user_detail.last_name'] = { $regex: new RegExp(search_value, 'i') };
                    query3['user_name'] = { $regex: new RegExp(search_value, 'i') };
                    var search = { "$match": { $or: [query1, query2, query3] } };
                } else {
                    query1[search_field] = { $regex: new RegExp(search_value, 'i') };
                    query2['user_detail.last_name'] = { $regex: new RegExp(search_value, 'i') };
                    query3[search_field] = { $regex: new RegExp(full_name[0], 'i') };
                    query4['user_detail.last_name'] = { $regex: new RegExp(full_name[0], 'i') };
                    query5[search_field] = { $regex: new RegExp(full_name[1], 'i') };
                    query6['user_detail.last_name'] = { $regex: new RegExp(full_name[1], 'i') };
                    query7['user_name'] = { $regex: new RegExp(search_value, 'i') };
                    var search = { "$match": { $or: [query1, query2, query3, query4, query5, query6, query7] } };
                }
            } else if (search_field == 'user_detail.unique_id' || search_field == 'vaiter_detail.unique_id') {
                var query = {};
                query[search_field] = { $eq: Number(search_value) };
                var search = { "$match": query };
            } else {
                var query = {};
                query[search_field] = { $regex: new RegExp(search_value, 'i') };
                var search = { "$match": query };
            }



            var sort = { "$sort": {} };
            sort["$sort"][sort_field] = parseInt(sort_table_request);
            var count = { $group: { _id: null, total: { $sum: 1 }, data: { $push: '$data' } } };
            var skip = {};
            skip["$skip"] = (page * number_of_rec) - number_of_rec;
            var limit = {};
            limit["$limit"] = number_of_rec;

            let finalqueries = [type_query, userlookup, userunwind, vaiterlookup, vaiterunwind, storelookup, storeunwind, search, count];
            let table_request = await Table_request.aggregate(finalqueries)
            if (table_request.length === 0) {
                res.json({ success: false, error_code: TABLE_REQUEST_ERROR_CODE.NO_TABLE_REQUEST_FOUND, pages: 0 });
                return;
            }
            var pages = Math.ceil(table_request[0].total / number_of_rec);
            if (page) {
                let finalquerywithlimit = [type_query, userlookup, userunwind, vaiterlookup, vaiterunwind, storelookup, storeunwind, sort, search, skip, limit];
                let table_request_data = await Table_request.aggregate(finalquerywithlimit)
                if (table_request_data.length === 0) {
                    res.json({ success: false, error_code: TABLE_REQUEST_ERROR_CODE.NO_TABLE_REQUEST_FOUND });
                    return;
                }
                res.json({ success: true, pages: pages, table_requests: table_request_data, message: TABLE_REQUEST_MESSAGE_CODE.LIST_SUCCESSFULLY });
                return;
            }
            let finalquerieswithoutlimit = [type_query, userlookup, userunwind, vaiterlookup, vaiterunwind, storelookup, storeunwind, sort, search];
            let table_request_data = await Table_request.aggregate(finalquerieswithoutlimit)
            if (table_request_data.length === 0) {
                res.json({ success: false, error_code: TABLE_REQUEST_ERROR_CODE.NO_TABLE_REQUEST_FOUND });
                return;
            }
            res.json({
                success: true,
                message: TABLE_REQUEST_MESSAGE_CODE.LIST_SUCCESSFULLY,
                table_requests: table_request_data,
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
module.exports.get_table_request_list = get_table_request_list;


get_vaiter_list = async (req, res) => {
    utils.check_request_params(req.body, [], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { store_id } = req.body;
            let vaiters = await Vaiter.find({ store_id: store_id });
            if (vaiters.length == 0) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.DATA_NOT_FOUND });
                return;
            }
            res.json({ success: true, vaiters: vaiters });
        } catch (e) {
            console.log(e)
            res.status(400).json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                error: e
            });
        }
    })
};
module.exports.get_vaiter_list = get_vaiter_list;




