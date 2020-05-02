require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var utils = require('../../utils/utils');
var Specification = require('mongoose').model('specification');
var Store = require('mongoose').model('store');
var console = require('../../utils/console');


// add specification api 
exports.add_specification = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'specification_group_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({_id: request_data_body.store_id}).then((store_detail) => {

                if (store_detail) {
                    if (request_data_body.type != ADMIN_DATA_ID.ADMIN && request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {
                        if (request_data_body.specification_group_id != undefined)
                        {

                            var specification_name_array = request_data_body.specification_name;
                            var size = specification_name_array.length;
                            var specification;
                            for (var i = 0; i < size; i++)
                            {
                                request_data_body.name = specification_name_array[i].name;
                                request_data_body.price = Number(specification_name_array[i].price);
                                console.log(request_data_body)
                                specification = new Specification(request_data_body);

                                if (i == (size - 1)) {
                                    specification.save().then(() => {
                                        Specification.find({specification_group_id: request_data_body.specification_group_id}).then((specifications) => {
                                            response_data.json({success: true, message: SPECIFICATION_MESSAGE_CODE.SPECIFICATION_ADD_SUCCESSFULLY
                                                , specifications: specifications});
                                        });
                                    });
                                } else {
                                    specification.save();
                                }
                            }

                        } else
                        {
                            response_data.json({success: false, error_code: SPECIFICATION_ERROR_CODE.SPECIFICATION_DATA_ADD_FAILED});

                        }

                    }

                } else
                {
                    response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
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

//// get specification list
exports.get_specification_list = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({_id: request_data_body.store_id}).then((store_detail) => {

                if (store_detail) {
                    if (request_data_body.type != ADMIN_DATA_ID.ADMIN && request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {
                        Specification.find({}).then((specifications) => {
                            if (specifications.length == 0) {
                                response_data.json({success: false, error_code: SPECIFICATION_ERROR_CODE.SPECIFICATION_DATA_NOT_FOUND});
                            } else {
                                response_data.json({success: true,
                                    message: SPECIFICATION_MESSAGE_CODE.SPECIFICATION_LIST_SUCCESSFULLY,
                                    specifications: specifications
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

                } else
                {
                    response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
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

// delete specification
exports.delete_specification = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'specification_group_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({_id: request_data_body.store_id}).then((store_detail) => {

                if (store_detail) {
                    if (request_data_body.type != ADMIN_DATA_ID.ADMIN && request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {
                        var specification_id_array = request_data_body.specification_id;

                        Specification.remove({_id: {$in: specification_id_array}, store_id: request_data_body.store_id, specification_group_id: request_data_body.specification_group_id}, function (error) {
                            
                                Specification.find({store_id: request_data_body.store_id, specification_group_id: request_data_body.specification_group_id}).then((specification) => {
                                    response_data.json({success: true,
                                        message: SPECIFICATION_MESSAGE_CODE.SPECIFICATION_DELETE_SUCCESSFULLY,
                                        specifications: specification

                                    });
                                }, (error) => {
                                    console.log(error);
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
                                });

                        }, (error) => {
                            console.log(error);
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }

                } else
                {

                    response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
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














