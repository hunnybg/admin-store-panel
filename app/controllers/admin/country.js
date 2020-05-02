require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var utils = require('../../utils/utils');
var console = require('../../utils/console');



var Country = require('mongoose').model('country');

//// get country list
exports.get_country_list = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {
            Country.find({is_business: true}).then((country) => {
                if (country.length == 0) {
                    response_data.json({success: false, error_code: COUNTRY_ERROR_CODE.COUNTRY_DETAILS_NOT_FOUND});
                } else {
                    response_data.json({success: true,
                        message: COUNTRY_MESSAGE_CODE.COUNTRY_LIST_SUCCESSFULLY,
                        countries: country
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


