require('../utils/message_code');
require('../utils/error_code');
require('../utils/constants');
var utils = require('../utils/utils');
var console = require('../utils/console');

var Referral_code = require('mongoose').model('referral_code');

// get_referral_detail
exports.get_referral_detail = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            if (request_data_body.start_date == '' || request_data_body.end_date == '') {
                if (request_data_body.start_date == '' && request_data_body.end_date == '') {
                    var date = new Date(Date.now());
                    date = date.setHours(0, 0, 0, 0);
                    start_date = new Date(0);
                    end_date = new Date(Date.now());
                } else if (request_data_body.start_date == '') {
                    start_date = new Date(0);
                    var end_date = request_data_body.end_date.formatted;
                    end_date = new Date(end_date);
                    end_date = end_date.setHours(23, 59, 59, 999);
                    end_date = new Date(end_date);
                } else {
                    var start_date = request_data_body.start_date.formatted;
                    start_date = new Date(start_date);
                    start_date = start_date.setHours(0, 0, 0, 0);
                    start_date = new Date(start_date);
                    end_date = new Date(Date.now());
                }
            } else {

                var start_date = request_data_body.start_date.formatted;
                var end_date = request_data_body.end_date.formatted;

                start_date = new Date(start_date);
                start_date = start_date.setHours(0, 0, 0, 0);
                start_date = new Date(start_date);
                end_date = new Date(end_date);
                end_date = end_date.setHours(23, 59, 59, 999);
                end_date = new Date(end_date);
            }

            var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
            var page = request_data_body.page;

            var sort_field = request_data_body.sort_field;
            var sort_referral = request_data_body.sort_referral;
            var search_field = request_data_body.search_field;
            var search_value = request_data_body.search_value;
            search_value = search_value.replace(/^\s+|\s+$/g, '');
            search_value = search_value.replace(/ +(?= )/g, '');

            if (search_field === "user_details.first_name")
            {
                var query1 = {};
                var query2 = {};
                var query3 = {};
                var query4 = {};
                var query5 = {};
                var query6 = {};
                var full_name = search_value.split(' ');
                if (typeof full_name[0] === 'undefined' || typeof full_name[1] === 'undefined') {

                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                    query2['user_details.last_name'] = {$regex: new RegExp(search_value, 'i')};
                    var search = {"$match": {$or: [query1, query2]}};
                } else {

                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                    query2['user_details.last_name'] = {$regex: new RegExp(search_value, 'i')};
                    query3[search_field] = {$regex: new RegExp(full_name[0], 'i')};
                    query4['user_details.last_name'] = {$regex: new RegExp(full_name[0], 'i')};
                    query5[search_field] = {$regex: new RegExp(full_name[1], 'i')};
                    query6['user_details.last_name'] = {$regex: new RegExp(full_name[1], 'i')};
                    var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
                }
            } else if (search_field === "provider_details.first_name")
            {
                var query1 = {};
                var query2 = {};
                var query3 = {};
                var query4 = {};
                var query5 = {};
                var query6 = {};
                var full_name = search_value.split(' ');
                if (typeof full_name[0] === 'undefined' || typeof full_name[1] === 'undefined') {

                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                    query2['provider_details.last_name'] = {$regex: new RegExp(search_value, 'i')};
                    var search = {"$match": {$or: [query1, query2]}};
                } else {

                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                    query2['provider_details.last_name'] = {$regex: new RegExp(search_value, 'i')};
                    query3[search_field] = {$regex: new RegExp(full_name[0], 'i')};
                    query4['provider_details.last_name'] = {$regex: new RegExp(full_name[0], 'i')};
                    query5[search_field] = {$regex: new RegExp(full_name[1], 'i')};
                    query6['provider_details.last_name'] = {$regex: new RegExp(full_name[1], 'i')};
                    var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
                }
            } else if (search_field === "store_details.name")
            {
                var query1 = {};
                var query2 = {};
                var query3 = {};
                var query4 = {};
                var query5 = {};
                var query6 = {};
                var full_name = search_value.split(' ');
                if (typeof full_name[0] === 'undefined' || typeof full_name[1] === 'undefined') {

                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                    query2['store_details.name'] = {$regex: new RegExp(search_value, 'i')};
                    var search = {"$match": {$or: [query1, query2]}};
                } else {

                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                    query2['store_details.email'] = {$regex: new RegExp(search_value, 'i')};
                    query3[search_field] = {$regex: new RegExp(full_name[0], 'i')};
                    query4['store_details.email'] = {$regex: new RegExp(full_name[0], 'i')};
                    query5[search_field] = {$regex: new RegExp(full_name[1], 'i')};
                    query6['store_details.email'] = {$regex: new RegExp(full_name[1], 'i')};
                    var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
                }
            } else
            {
                var query = {};
                query[search_field] = {$regex: new RegExp(search_value, 'i')};
                var search = {"$match": query};
            }
            var filter = {"$match": {"created_at": {$gte: start_date, $lt: end_date}}};
            var sort = {"$sort": {}};
            sort["$sort"][sort_field] = parseInt(sort_referral);
            var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};
            var skip = {};
            skip["$skip"] = (page * number_of_rec) - number_of_rec;
            var limit = {};
            limit["$limit"] = number_of_rec;

            Referral_code.aggregate([
                {
                    $lookup:
                            {
                                from: "users",
                                localField: "referred_id",
                                foreignField: "_id",
                                as: "user_detail"
                            }
                },
                {
                    $lookup:
                            {
                                from: "providers",
                                localField: "referred_id",
                                foreignField: "_id",
                                as: "provider_detail"
                            }
                },
                {
                    $lookup:
                            {
                                from: "stores",
                                localField: "referred_id",
                                foreignField: "_id",
                                as: "store_detail"
                            }
                },

                {
                    $group: {
                        _id: '$user_id',
                        count: {$sum: '$referral_bonus_to_user'},
                        referral_code: {$push: "$$ROOT"}
                    }

                },
                {
                    $lookup:
                            {
                                from: "users",
                                localField: "_id",
                                foreignField: "_id",
                                as: "referred_user_detail"
                            }
                },
                {
                    $lookup:
                            {
                                from: "providers",
                                localField: "_id",
                                foreignField: "_id",
                                as: "referred_provider_detail"
                            }
                },
                {
                    $lookup:
                            {
                                from: "stores",
                                localField: "_id",
                                foreignField: "_id",
                                as: "referred_store_detail"
                            }
                }

            ]).then((referral_codes) => {

                if (referral_codes.length == 0) {

                    response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND, pages: 0});
                } else {

                    var pages = Math.ceil(referral_codes[0].total / number_of_rec);

                    Referral_code.aggregate([
                        {
                            $lookup:
                                    {
                                        from: "users",
                                        localField: "referred_id",
                                        foreignField: "_id",
                                        as: "user_detail"
                                    }
                        },
                        {
                            $lookup:
                                    {
                                        from: "providers",
                                        localField: "referred_id",
                                        foreignField: "_id",
                                        as: "provider_detail"
                                    }
                        },
                        {
                            $lookup:
                                    {
                                        from: "stores",
                                        localField: "referred_id",
                                        foreignField: "_id",
                                        as: "store_detail"
                                    }
                        },
                        {
                            $group: {
                                _id: '$user_id',
                                count: {$sum: '$referral_bonus_to_user'},
                                referral_code: {$push: "$$ROOT"}
                            }

                        },
                        {
                            $lookup:
                                    {
                                        from: "users",
                                        localField: "_id",
                                        foreignField: "_id",
                                        as: "referred_user_detail"
                                    }
                        },
                        {
                            $lookup:
                                    {
                                        from: "providers",
                                        localField: "_id",
                                        foreignField: "_id",
                                        as: "referred_provider_detail"
                                    }
                        },
                        {
                            $lookup:
                                    {
                                        from: "stores",
                                        localField: "_id",
                                        foreignField: "_id",
                                        as: "referred_store_detail"
                                    }
                        }

                    ]).then((referral_codes) => {

                        if (referral_codes.length == 0) {

                            response_data.json({success: false, error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND, pages: 0});
                        } else {
                            response_data.json({success: true,
                                message: ORDER_MESSAGE_CODE.ORDER_LIST_FOR_PROVIDER_SUCCESSFULLY,
                                pages: pages,
                                referral_codes: referral_codes
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