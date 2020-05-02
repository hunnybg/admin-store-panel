require('../utils/message_code');
require('../utils/error_code');
require('../utils/constants');
require('../utils/push_code');
var utils = require('../utils/utils');
var emails = require('../controllers/email_sms/emails');
var SMS = require('../controllers/email_sms/sms');
var Provider = require('mongoose').model('provider');
var console = require('../utils/console');


// for view all provider_list 
exports.provider_list_for_map = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            Provider.find({is_approved: true}).then((providers) => {
                if (providers.length == 0) {
                    response_data.json({success: false, error_code: PRODUCT_ERROR_CODE.PRODUCT_DATA_NOT_FOUND});
                } else {
                    response_data.json({success: true,
                        message: PROVIDER_MESSAGE_CODE.PROVIDER_LIST_SUCCESSFULLY,
                        providers: providers
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
