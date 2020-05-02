require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var utils = require('../../utils/utils');
var City = require('mongoose').model('city');
var Country = require('mongoose').model('country');
var console = require('../../utils/console');


/// get city list
exports.get_city_list = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Country.findOne({$and: [{$or: [{country_name: request_data_body.country_name}, {country_code: request_data_body.country_code}, {_id: request_data_body.country_id}]}, {is_business: true}]}).then((country_data) => {

                if (country_data)
                {
                    var country_id = country_data._id;
                    City.find({country_id: country_id, is_business: true}, {"city_name": 1,"city_nick_name":1}).then((city) => {
                        if (city.length == 0) {
                            response_data.json({success: false, error_code: CITY_ERROR_CODE.CITY_DETAILS_NOT_FOUND, country_phone_code: country_data.country_phone_code,
                                is_referral_store: country_data.is_referral_store,
                                currency_sign: country_data.currency_sign,
                                country_code: country_data.country_code,
                                minimum_phone_number_length: country_data.minimum_phone_number_length,
                                maximum_phone_number_length: country_data.maximum_phone_number_length
                            });
                        } else if (city) {

                            response_data.json({success: true,
                                message: CITY_MESSAGE_CODE.CITY_LIST_SUCCESSFULLY,
                                cities: city,
                                is_referral_store: country_data.is_referral_store,
                                currency_sign: country_data.currency_sign,
                                country_code: country_data.country_code,
                                country_phone_code: country_data.country_phone_code,
                                minimum_phone_number_length: country_data.minimum_phone_number_length,
                                maximum_phone_number_length: country_data.maximum_phone_number_length
                            });

                        }
                    }, (error) => {
                        console.log(error)
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                        });
                    });
                } else
                {
                    response_data.json({success: false, error_code: COUNTRY_ERROR_CODE.COUNTRY_DETAILS_NOT_FOUND});
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

/// get city list

exports.get_city_full_detail_list = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Country.findOne({$and: [{$or: [{country_name: request_data_body.country_name}, {country_code: request_data_body.country_code}, {_id: request_data_body.country_id}]}, {is_business: true}]}).then((country_data) => {

                if (country_data)
                {
                    var country_id = country_data._id;
                    City.find({country_id: country_id, is_business: true}).then((city) => {
                        if (city.length == 0) {
                            response_data.json({success: false, error_code: CITY_ERROR_CODE.CITY_DETAILS_NOT_FOUND, country_phone_code: country_data.country_phone_code,
                                minimum_phone_number_length: country_data.minimum_phone_number_length,
                                maximum_phone_number_length: country_data.maximum_phone_number_length});
                        } else if (city) {

                            response_data.json({success: true,
                                message: CITY_MESSAGE_CODE.CITY_LIST_SUCCESSFULLY,
                                cities: city,
                                country_phone_code: country_data.country_phone_code,
                                minimum_phone_number_length: country_data.minimum_phone_number_length,
                                maximum_phone_number_length: country_data.maximum_phone_number_length
                            });

                        }
                    }, (error) => {
                        console.log(error)
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                        });
                    });
                } else
                {
                    response_data.json({success: false, error_code: COUNTRY_ERROR_CODE.COUNTRY_DETAILS_NOT_FOUND});
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


exports.all_city_list = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {
            City.find({}).then((city_list) => {
                response_data.json({success: true,
                    city_list: city_list
                });
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