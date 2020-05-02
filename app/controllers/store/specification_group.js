require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var utils = require('../../utils/utils');
var mongoose = require('mongoose');
var Specification_group = require('mongoose').model('specification_group');
var Store = require('mongoose').model('store');
var Specification = require('mongoose').model('specification');
var console = require('../../utils/console');


// add_specification_group api 
exports.add_specification_group = function (request_data, response_data) {
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

                        var specification_group_name_array = request_data_body.specification_group_name;
                        var size = specification_group_name_array.length;
                        var specification_groups;
                        for (var i = 0; i < size; i++)
                        {
                            request_data_body.name = specification_group_name_array[i];

                            specification_groups = new Specification_group(request_data_body);
                            specification_groups.save();


                        }
                        specification_groups.save().then(() => {
                                Specification_group.find({store_id: request_data_body.store_id}).then((specification_group) => {
                                    response_data.json({success: true, message: SPECIFICATION_GROUP_MESSAGE_CODE.ADD_SUCCESSFULLY
                                        , specification_group: specification_group});

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

////  get_specification_group 
exports.get_specification_group = function (request_data, response_data) {
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

                        var specifications_array = {
                            $lookup:
                                    {
                                        from: "specifications",
                                        localField: "_id",
                                        foreignField: "specification_group_id",
                                        as: "list"
                                    }
                        };

                        var store_condition = {"$match": {'store_id': {$eq: mongoose.Types.ObjectId(request_data_body.store_id)}}};

                        var condition = {"$match": {}};
                        if(request_data_body.specification_group_id){
                            condition = {"$match": {'_id': {$eq: mongoose.Types.ObjectId(request_data_body.specification_group_id)}}};
                        }
                        Specification_group.aggregate([store_condition, condition, specifications_array]).then((specification_group) => {
                            if (specification_group.length == 0) {
                                response_data.json({success: false, error_code: SPECIFICATION_GROUP_ERROR_CODE.LIST_NOT_FOUND});
                            } else {
                                response_data.json({success: true,
                                    message: SPECIFICATION_GROUP_MESSAGE_CODE.LIST_SUCCESSFULLY,
                                    specification_group: specification_group,
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

// delete_specification_group
exports.delete_specification_group = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'specification_group_id'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({_id: request_data_body.store_id}).then((store_detail) => {

                if (store_detail) {
                    if (request_data_body.type != ADMIN_DATA_ID.ADMIN && request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {
                        var json;
                        if(typeof request_data_body.specification_group_id == "object")
                        {
                            json = {_id: {$in:request_data_body.specification_group_id}, store_id: request_data_body.store_id}
                        }
                        else
                        {
                            json = {_id: request_data_body.specification_group_id, store_id: request_data_body.store_id}
                        }

                        Specification_group.remove(json).then(() => {
                                Specification.remove({specification_group_id: request_data_body.specification_group_id, store_id: request_data_body.store_id}).then(() => {
                                    
                                        response_data.json({success: true,
                                            message: SPECIFICATION_MESSAGE_CODE.SPECIFICATION_DELETE_SUCCESSFULLY
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
            });
        } else {
            response_data.json(response);
        }
    });
};

////  get_specification_lists for store panel
exports.get_specification_lists = function (request_data, response_data) {
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

                        var specifications_array = {
                            $lookup:
                                    {
                                        from: "specifications",
                                        localField: "_id",
                                        foreignField: "specification_group_id",
                                        as: "specifications"
                                    }
                        };

                        var store_condition = {"$match": {'store_id': {$eq: mongoose.Types.ObjectId(request_data_body.store_id)}}};
                        var specification_group_condition = {"$match": {'_id': {$eq: mongoose.Types.ObjectId(request_data_body.specification_group_id)}}};

                        Specification_group.aggregate([store_condition, specification_group_condition, specifications_array]).then((specification_group) => {
                            if (specification_group.length == 0) {
                                response_data.json({success: false, error_code: SPECIFICATION_GROUP_ERROR_CODE.LIST_NOT_FOUND});
                            } else {
                                response_data.json({success: true,
                                    message: SPECIFICATION_GROUP_MESSAGE_CODE.LIST_SUCCESSFULLY,
                                    specification_list: specification_group[0],
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








