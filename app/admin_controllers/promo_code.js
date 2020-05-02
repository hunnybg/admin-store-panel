require('../utils/message_code');
require('../utils/error_code');
require('../utils/constants');
var utils = require('../utils/utils');
var Promo_code = require('mongoose').model('promo_code');
var Order_payment = require('mongoose').model('order_payment');
var Country = require('mongoose').model('country');
var City = require('mongoose').model('city');
var mongoose = require('mongoose');
var console = require('../utils/console');


//add_promo_code_data
exports.add_promo_code_data = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var promo_code_name = (request_data_body.promo_code_name).toUpperCase();
            request_data_body.promo_code_name = promo_code_name;
            var is_promo_have_date = request_data_body.is_promo_have_date;
            if (is_promo_have_date == true)
            {
                var promo_start_date = request_data_body.promo_start_date;
                var promo_expire_date = request_data_body.promo_expire_date;

                if (promo_start_date != undefined && promo_start_date != null) {
                    promo_start_date = request_data_body.promo_start_date.formatted;
                }
                if (promo_expire_date != undefined && promo_expire_date != null) {
                    promo_expire_date = request_data_body.promo_expire_date.formatted;
                }
                promo_start_date = new Date(promo_start_date);
                promo_start_date = promo_start_date.setHours(0, 0, 0, 0);
                promo_start_date = new Date(promo_start_date);
                promo_expire_date = new Date(promo_expire_date);
                promo_expire_date = promo_expire_date.setHours(23, 59, 59, 999);
                promo_expire_date = new Date(promo_expire_date);
                request_data_body.promo_start_date = promo_start_date;
                request_data_body.promo_expire_date = promo_expire_date;
            }


            var created_by = ADMIN_DATA_ID.ADMIN;
            request_data_body.created_by = created_by;
            request_data_body.created_id = request_data_body.admin_id;
            var promo_code = new Promo_code(request_data_body);
            promo_code.save().then(() => {
                    response_data.json({success: true, message: PROMO_CODE_MESSAGE_CODE.PROMO_CODE_ADD_SUCCESSFULLY});
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

// list for view all promo_code
exports.promo_code_list = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var country_query = {
                $lookup:
                        {
                            from: "countries",
                            localField: "country_id",
                            foreignField: "_id",
                            as: "country_details"
                        }
            };
            var array_to_json1 = {$unwind: "$country_details"};

            var city_query = {
                $lookup:
                        {
                            from: "cities",
                            localField: "city_id",
                            foreignField: "_id",
                            as: "city_details"
                        }
            };
            //var array_to_json2 = {$unwind: "$city_details"};

            var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
            var page = request_data_body.page;
            var sort_field = request_data_body.sort_field;
            var sort_promo_code = request_data_body.sort_promo_code;
            var search_field = request_data_body.search_field;
            var search_value = request_data_body.search_value;
            search_value = search_value.replace(/^\s+|\s+$/g, '');
            search_value = search_value.replace(/ +(?= )/g, '');


            if (search_field === "promo_code_name")
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
                    query2['promo_code_name'] = {$regex: new RegExp(search_value, 'i')};
                    var search = {"$match": {$or: [query1, query2]}};
                } else {

                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                    query2['country_details.country_name'] = {$regex: new RegExp(search_value, 'i')};
                    query3[search_field] = {$regex: new RegExp(full_name[0], 'i')};
                    query4['country_details.country_name'] = {$regex: new RegExp(full_name[0], 'i')};
                    query5[search_field] = {$regex: new RegExp(full_name[1], 'i')};
                    query6['country_details.country_name'] = {$regex: new RegExp(full_name[1], 'i')};
                    var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
                }
            } else if (search_field === "city_details.city_name")
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
                    query2['city_details.city_name'] = {$regex: new RegExp(search_value, 'i')};
                    var search = {"$match": {$or: [query1, query2]}};
                } else {

                    query1[search_field] = {$regex: new RegExp(search_value, 'i')};
                    query2['city_details.city_name'] = {$regex: new RegExp(search_value, 'i')};
                    query3[search_field] = {$regex: new RegExp(full_name[0], 'i')};
                    query4['city_details.city_name'] = {$regex: new RegExp(full_name[0], 'i')};
                    query5[search_field] = {$regex: new RegExp(full_name[1], 'i')};
                    query6['city_details.city_name'] = {$regex: new RegExp(full_name[1], 'i')};
                    var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
                }
            } else
            {
                var query = {};
                query[search_field] = {$regex: new RegExp(search_value, 'i')};
                var search = {"$match": query};
            }

            var sort = {"$sort": {}};
            sort["$sort"][sort_field] = parseInt(sort_promo_code);
            var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};
            var skip = {};
            skip["$skip"] = (page * number_of_rec) - number_of_rec;
            var limit = {};
            limit["$limit"] = number_of_rec;



            Promo_code.aggregate([country_query, city_query, array_to_json1
                        , search, count
            ]).then((promo_codes) => {

                if (promo_codes.length == 0) {
                    response_data.json({success: false, error_code: PROMO_CODE_ERROR_CODE.PROMO_CODE_DATA_NOT_FOUND});
                } else
                {
                    var pages = Math.ceil(promo_codes[0].total / number_of_rec);
                    Promo_code.aggregate([country_query, city_query, array_to_json1
                                , sort, search, skip, limit
                    ]).then((promo_codes) => {
                        if (promo_codes.length == 0) {

                            response_data.json({success: false, error_code: PROMO_CODE_ERROR_CODE.PROMO_CODE_DATA_NOT_FOUND});
                        }
                        {
                            response_data.json({success: true,
                                message: PROMO_CODE_MESSAGE_CODE.PROMO_CODE_LIST_SUCCESSFULLY,
                                pages: pages,
                                promo_codes: promo_codes});
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
        } else {
            response_data.json(response);
        }
    });
};


exports.promocode_active_deactive = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {
            var request_data_body = request_data.body;
            var promo_id = request_data_body.promo_id;
            var state = request_data_body.state;
            Promo_code.findOne({_id: promo_id}).then((promo_code) => {

                if (!promo_code) {
                    response_data.json({success: false, error_code: PROVIDER_ERROR_CODE.UPDATE_FAILED});
                } else {
                    promo_code.is_active = state;
                    promo_code.save();
                    response_data.json({
                        success: true,
                        message: PROVIDER_MESSAGE_CODE.DECLINED_SUCCESSFULLY
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


// update promo_code
exports.update_promo_code = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var promo_id = request_data_body.promo_id;
            var  is_promo_have_date = request_data_body.is_promo_have_date;


            if (is_promo_have_date == true)
            {
                var promo_start_date = request_data_body.promo_start_date;
                var promo_expire_date = request_data_body.promo_expire_date;

                if (promo_start_date != undefined && promo_start_date != null) {
                    promo_start_date = request_data_body.promo_start_date.formatted;
                }
                if (promo_expire_date != undefined && promo_expire_date != null) {
                    promo_expire_date = request_data_body.promo_expire_date.formatted;
                }
                promo_start_date = new Date(promo_start_date);
                promo_start_date = promo_start_date.setHours(0, 0, 0, 0);
                promo_start_date = new Date(promo_start_date);
                promo_expire_date = new Date(promo_expire_date);
                promo_expire_date = promo_expire_date.setHours(23, 59, 59, 999);
                promo_expire_date = new Date(promo_expire_date);

                request_data_body.promo_start_date = promo_start_date;
                request_data_body.promo_expire_date = promo_expire_date;
            }
            else {
                delete request_data_body.promo_start_date;
                delete request_data_body.promo_expire_date;
            }

            Promo_code.findOneAndUpdate({_id: promo_id}, request_data_body, {new : true}).then((promo_code_data) => {


                if (promo_code_data)
                {
                    response_data.json({success: true, message: PROMO_CODE_MESSAGE_CODE.UPDATE_SUCCESSFULLY});

                } else
                {
                    response_data.json({success: false, error_code: PROMO_CODE_ERROR_CODE.UPDATE_FAILED});

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

// get_promo_detail
exports.get_promo_detail = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var promo_condition = {"$match": {'_id': {$eq: mongoose.Types.ObjectId(request_data_body.promo_id)}}};
            var country_query = {
                $lookup:
                        {
                            from: "countries",
                            localField: "country_id",
                            foreignField: "_id",
                            as: "country_details"
                        }
            };
            var array_to_json1 = {$unwind: "$country_details"};

            var city_query = {
                $lookup:
                        {
                            from: "cities",
                            localField: "city_id",
                            foreignField: "_id",
                            as: "city_details"
                        }
            };

            Promo_code.aggregate([promo_condition, country_query, city_query, array_to_json1]).then((promo_code) => {
                if (promo_code.length == 0) {
                    response_data.json({success: false, error_code: SERVICE_ERROR_CODE.SERVICE_DATA_NOT_FOUND});
                } else
                {
                    response_data.json({success: true,
                        message: PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY,
                        promo_code: promo_code[0]});
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


// get_promo_uses_detail
exports.get_promo_uses_detail = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Promo_code.findOne({_id: request_data_body.promo_id}).then((promo_code) => {
                if (promo_code)
                {
                    Country.findOne({_id: promo_code.country_id}).then((country_details) => {

                        City.findOne({_id: promo_code.city_id}).then((city_details) => {

                            var city_name = "All";
                            if (city_details) {
                                city_name = city_details.city_name;
                            }
                            var promo_condition = {"$match": {'promo_id': {$eq: mongoose.Types.ObjectId(request_data_body.promo_id)}}};
                            var user_query = {
                                $lookup:
                                        {
                                            from: "users",
                                            localField: "user_id",
                                            foreignField: "_id",
                                            as: "user_details"
                                        }
                            };
                            var array_to_json1 = {$unwind: "$user_details"};

                            var order_query = {
                                $lookup:
                                        {
                                            from: "orders",
                                            localField: "order_id",
                                            foreignField: "_id",
                                            as: "order_details"
                                        }
                            };
                            var array_to_json2 = {$unwind: "$order_details"};

                            var promo_code_query = {
                                $lookup:
                                        {
                                            from: "promo_codes",
                                            localField: "promo_id",
                                            foreignField: "_id",
                                            as: "promo_code_details"
                                        }
                            };
                            var array_to_json3 = {$unwind: "$promo_code_details"};

                            var city_query = {
                                $lookup:
                                        {
                                            from: "cities",
                                            localField: "promo_code_details.city_id",
                                            foreignField: "_id",
                                            as: "city_details"
                                        }
                            };


                            Order_payment.aggregate([promo_condition, user_query, promo_code_query, order_query, array_to_json1, array_to_json2, array_to_json3, city_query]).then((order_payment) => {


                                if (order_payment.length == 0) {
                                    response_data.json({success: false,
                                        error_code: SERVICE_ERROR_CODE.SERVICE_DATA_NOT_FOUND,
                                        country_details: country_details,
                                        promo_code: promo_code,
                                        city_name: city_name
                                    });
                                } else
                                {

                                    response_data.json({success: true,
                                        message: PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY,
                                        order_payment: order_payment,
                                        country_details: country_details,
                                        promo_code: promo_code,
                                        city_name: city_name
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



/// check_promo_code
exports.check_promo_code = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var promo_code_name = ((request_data_body.promo_code_name).trim()).toUpperCase();

            Promo_code.findOne({country_id: request_data_body.country_id, promo_code_name: promo_code_name, city_id: request_data_body.city_id}).then((promo_code) => {
                if (!promo_code) {
                    console.log("not promo");
                    response_data.json({success: true,
                        message: PROMO_CODE_MESSAGE_CODE.UPDATE_SUCCESSFULLY

                    });
                } else {
                    console.log("promo available");
                    response_data.json({success: false, error_code: PROMO_CODE_ERROR_CODE.UPDATE_FAILED});

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