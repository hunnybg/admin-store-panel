require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var utils = require('../../utils/utils');

var Specification = require('mongoose').model('specification');
var FranchiseSpecification = require('mongoose').model('franchise_specification');
var Store = require('mongoose').model('store');
var Product = require('mongoose').model('product');
var Franchise = require('mongoose').model('franchise');

// add specification api 
exports.add_specification = function (request_data, response_data) {
    var request_data_body = request_data.body;
    var store_id = [];
    console.log(request_data_body);
    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {

        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {
                Product.find({franchise_product_id: request_data_body.product_id}, function (error, product_detail) {
                    if (request_data_body.specification_group_id != undefined)
                    {
                        if(product_detail.length > 0){
                            for(var b=0;b<product_detail.length;b++){
                                store_id.push(product_detail[b].store_id); 
                                if(b+1 == product_detail.length){           
                                    var specification_name_array = request_data_body.specification_name;
                                    var size = specification_name_array.length;
                                    var specification;
                                    //console.log("store_id: ");
                                    //console.log(store_id);
                                    for (var i = 0; i < size; i++)
                                    {
                                        request_data_body.name = specification_name_array[i];
                                        specification = new FranchiseSpecification(request_data_body);
                                        for(var j =0; j< store_id.length;j++){
                                            utils.copy_specification_franchise(request_data_body.franchise_id, store_id[j], specification);
                                        }
                                        if (i == (size - 1)) {
                                            specification.save(function (error) {
                                                FranchiseSpecification.find({product_id: request_data_body.product_id, specification_group_id: request_data_body.specification_group_id}, function (error, specifications) {
                                                    response_data.json({success: true, message: SPECIFICATION_MESSAGE_CODE.SPECIFICATION_ADD_SUCCESSFULLY
                                                        , specifications: specifications});
                                                });
                                            });
                                        } else {
                                            specification.save();
                                        }
                                    }
                                }
                            }
                        }else{

                                    var specification_name_array = request_data_body.specification_name;
                                    var size = specification_name_array.length;
                                    var specification;
                                    //console.log("store_id: ");
                                    //console.log(store_id);
                                    for (var i = 0; i < size; i++)
                                    {
                                        request_data_body.name = specification_name_array[i];
                                        specification = new FranchiseSpecification(request_data_body);
                                        for(var j =0; j< store_id.length;j++){
                                            utils.copy_specification_franchise(request_data_body.franchise_id, store_id[j], specification);
                                        }
                                        if (i == (size - 1)) {
                                            specification.save(function (error) {
                                                FranchiseSpecification.find({product_id: request_data_body.product_id, specification_group_id: request_data_body.specification_group_id}, function (error, specifications) {
                                                    response_data.json({success: true, message: SPECIFICATION_MESSAGE_CODE.SPECIFICATION_ADD_SUCCESSFULLY
                                                        , specifications: specifications});
                                                });
                                            });
                                        } else {
                                            specification.save();
                                        }
                                    }
                                
                        }
                    } else
                    {
                        response_data.json({success: false, error_code: SPECIFICATION_ERROR_CODE.SPECIFICATION_DATA_ADD_FAILED});

                    }
                });

            }

        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });
};
//// get specification list
exports.get_specification_list = function (request_data, response_data) {
    var request_data_body = request_data.body;
    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {

        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {
                FranchiseSpecification.find({product_id: request_data_body.product_id}, function (error, specifications) {
                    if (error || specifications.length == 0) {
                        response_data.json({success: false, error_code: SPECIFICATION_ERROR_CODE.SPECIFICATION_DATA_NOT_FOUND});
                    } else {
                        response_data.json({success: true,
                            message: SPECIFICATION_MESSAGE_CODE.SPECIFICATION_LIST_SUCCESSFULLY,
                            specifications: specifications
                        });
                    }
                });
            }

        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });
};

// delete specification
exports.delete_specification = function (request_data, response_data) {
    var request_data_body = request_data.body;
    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {

        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {



                var specification_id_array = request_data_body.specification_id;

                FranchiseSpecification.remove({_id: {$in: specification_id_array}, product_id: request_data_body.product_id, franchise_id: request_data_body.franchise_id,specification_group_id: request_data_body.specification_group_id}, function (error) {
                    Specification.remove({franchise_specification_id: {$in: specification_id_array}}, function (error) {
                        if (error) {
                            response_data.json({success: false, error_code: SPECIFICATION_ERROR_CODE.SPECIFICATION_DATA_NOT_FOUND});
                        } else {
                            FranchiseSpecification.find({product_id: request_data_body.product_id, franchise_id: request_data_body.franchise_id,specification_group_id: request_data_body.specification_group_id}, function (error, specification) {

                                response_data.json({success: true,
                                    message: SPECIFICATION_MESSAGE_CODE.SPECIFICATION_DELETE_SUCCESSFULLY,
                                    specifications: specification

                                });
                            });
                        }
                    });
                });
            }

        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });

};














