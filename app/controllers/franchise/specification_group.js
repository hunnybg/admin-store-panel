require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var utils = require('../../utils/utils');
var mongoose = require('mongoose');
var Specification_group = require('mongoose').model('specification_group');
var FranchiseSpecification_group = require('mongoose').model('franchise_specification_group');
var Store = require('mongoose').model('store');
var Franchise = require('mongoose').model('franchise');
var Specification = require('mongoose').model('specification');
var FranchiseSpecification = require('mongoose').model('franchise_specification');
var Product = require('mongoose').model('product');
// add_specification_group api 
exports.add_specification_group = function (request_data, response_data) {
    var request_data_body = request_data.body;
    //var store_ids = request_data_body.store_ids;
    
    console.log(request_data_body);
    /*request_data_body.store_id = store_ids.split(',');
    if(request_data_body.store_id == ''){
        request_data_body.store_id = [];
    }*/
    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {

        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {
                Product.find({franchise_product_id: request_data_body.product_id}, function (error, product_detail) {
                    
                    if(product_detail.length > 0){
                        var store_id = [];
                        for(var b=0;b<product_detail.length;){
                            
                            store_id.push(product_detail[b].store_id);
                           
                            b++;
                            if(b == product_detail.length){
                                var specification_group_name_array = request_data_body.specification_group_name;
                                var size = specification_group_name_array.length;
                                var specification_groups;
                                
                                for (var i = 0; i < size; i++)
                                {
                                    request_data_body.name = specification_group_name_array[i];

                                    specification_groups = new FranchiseSpecification_group(request_data_body);
                                    specification_groups.save();

                                    for(var j =0; j< store_id.length;j++){
                                        utils.copy_specification_group_franchise(request_data_body.franchise_id, store_id[j], specification_groups);
                                    }

                                }
                                specification_groups.save(function (error) {
                                    
                                    if (error)
                                    {
                                        response_data.json({success: false, error_code: SPECIFICATION_GROUP_ERROR_CODE.ADD_FAILED});
                                    } else {

                                        FranchiseSpecification_group.find({product_id: request_data_body.product_id}, function (error, specification_group) {
                                            response_data.json({success: true, message: SPECIFICATION_GROUP_MESSAGE_CODE.ADD_SUCCESSFULLY
                                                , specification_group: specification_group});

                                        });
                                    }
                                });
                            }
                        }
                    }else{
                        var specification_group_name_array = request_data_body.specification_group_name;
                                var size = specification_group_name_array.length;
                                var specification_groups;
                                
                                for (var i = 0; i < size; i++)
                                {
                                    request_data_body.name = specification_group_name_array[i];

                                    specification_groups = new FranchiseSpecification_group(request_data_body);
                                    specification_groups.save();
                                    

                                }
                                specification_groups.save(function (error) {
                                    
                                    if (error)
                                    {
                                        response_data.json({success: false, error_code: SPECIFICATION_GROUP_ERROR_CODE.ADD_FAILED});
                                    } else {

                                        FranchiseSpecification_group.find({product_id: request_data_body.product_id}, function (error, specification_group) {
                                            response_data.json({success: true, message: SPECIFICATION_GROUP_MESSAGE_CODE.ADD_SUCCESSFULLY
                                                , specification_group: specification_group});

                                        });
                                    }
                                });
                    }
                });

//                specification_group = new Specification_group(request_data_body);
//                specification_group.save(function (error) {
//                    if (error)
//                    {
//                        response_data.json({success: false, error_code: SPECIFICATION_GROUP_ERROR_CODE.ADD_FAILED});
//                    } else {
//
//                        response_data.json({success: true, message: SPECIFICATION_GROUP_MESSAGE_CODE.ADD_SUCCESSFULLY
//                            , specification_group: specification_group});
//                    }
//
//                });
            }

        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });
};

////  get_specification_group 
exports.get_specification_group = function (request_data, response_data) {
    var request_data_body = request_data.body;
    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {

        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {

                var specifications_array = {
                    $lookup:
                            {
                                from: "franchise_specifications",
                                localField: "_id",
                                foreignField: "specification_group_id",
                                as: "list"
                            }
                };

                var product_condition = {"$match": {'product_id': {$eq: mongoose.Types.ObjectId(request_data_body.product_id)}}};




                FranchiseSpecification_group.aggregate([product_condition, specifications_array], function (error, specification_group) {
                    if (error || specification_group.length == 0) {
                        response_data.json({success: false, error_code: SPECIFICATION_GROUP_ERROR_CODE.LIST_NOT_FOUND});
                    } else {
                        response_data.json({success: true,
                            message: SPECIFICATION_GROUP_MESSAGE_CODE.LIST_SUCCESSFULLY,
                            specification_group: specification_group,
                        });
                    }
                });



//                Specification_group.find({product_id: request_data_body.product_id}, function (error, specification_group) {
//                    if (error || specification_group.length == 0) {
//                        response_data.json({success: false, error_code: SPECIFICATION_GROUP_ERROR_CODE.LIST_NOT_FOUND});
//                    } else {
//                        response_data.json({success: true,
//                            message: SPECIFICATION_GROUP_MESSAGE_CODE.LIST_SUCCESSFULLY,
//                            specification_group: specification_group
//                        });
//                    }
//                });
            }

        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });
};



// delete_specification_group
exports.delete_specification_group = function (request_data, response_data) {
    var request_data_body = request_data.body;
    
    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {

        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {
               
                
                
                var json;
                if(typeof request_data_body.specification_group_id == "object")
                {
                    json = {_id: {$in:request_data_body.specification_group_id}, product_id: request_data_body.product_id, franchise_id: request_data_body.franchise_id}
                    json1 = {franchise_specificationgroup_id: {$in:request_data_body.specification_group_id}}
                }
                else
                {
                    json = {_id: request_data_body.specification_group_id, product_id: request_data_body.product_id, franchise_id: request_data_body.franchise_id}
                    json1 = {franchise_specificationgroup_id: request_data_body.specification_group_id}

                }

                FranchiseSpecification_group.remove(json, function (error) {
                    Specification_group.remove(json1, function (error) {
                        
                        if (error) {
                            response_data.json({success: false, error_code: SPECIFICATION_ERROR_CODE.SPECIFICATION_DATA_NOT_FOUND});
                        } else {
                            var spec_array = [];
                            FranchiseSpecification.find({specification_group_id: request_data_body.specification_group_id, product_id: request_data_body.product_id, franchise_id: request_data_body.franchise_id}, function (error, spec) {
                                for(var i=0;i<spec.length;i++){
                                    spec_array.push(spec._id);
                                    if(i+1 == spec.length){
                                        Specification.remove({franchise_specification_id: {$in:spec_array}}, function (error) {

                                        })
                                    }
                                }
                                FranchiseSpecification.remove({specification_group_id: request_data_body.specification_group_id, product_id: request_data_body.product_id, franchise_id: request_data_body.franchise_id}, function (error) {

                                    if (error) {
                                        response_data.json({success: false, error_code: SPECIFICATION_ERROR_CODE.SPECIFICATION_DATA_NOT_FOUND});
                                    } else {
                                        response_data.json({success: true,
                                            message: SPECIFICATION_MESSAGE_CODE.SPECIFICATION_DELETE_SUCCESSFULLY
                                        });
                                    }
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



////  get_specification_lists for store panel
exports.get_specification_lists = function (request_data, response_data) {
    var request_data_body = request_data.body;
    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {

        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {

                var specifications_array = {
                    $lookup:
                            {
                                from: "franchise_specifications",
                                localField: "_id",
                                foreignField: "specification_group_id",
                                as: "specifications"
                            }
                };

                var product_condition = {"$match": {'product_id': {$eq: mongoose.Types.ObjectId(request_data_body.product_id)}}};
                var specification_group_condition = {"$match": {'_id': {$eq: mongoose.Types.ObjectId(request_data_body.specification_group_id)}}};




                FranchiseSpecification_group.aggregate([product_condition,specification_group_condition, specifications_array], function (error, specification_group) {
                    if (error || specification_group.length == 0) {
                        response_data.json({success: false, error_code: SPECIFICATION_GROUP_ERROR_CODE.LIST_NOT_FOUND});
                    } else {
                        response_data.json({success: true,
                            message: SPECIFICATION_GROUP_MESSAGE_CODE.LIST_SUCCESSFULLY,
                            specification_list: specification_group[0],
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








