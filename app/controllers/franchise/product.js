require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var utils = require('../../utils/utils');

var mongoose = require('mongoose');

var Product = require('mongoose').model('product');
var FranchiseProduct = require('mongoose').model('franchise_product');
var Store = require('mongoose').model('store');
var Franchise = require('mongoose').model('franchise');
var Specification = require('mongoose').model('specification');
var Item = require('mongoose').model('item');

// add product api 
exports.add_product = function (request_data, response_data) {
    var request_data_body = request_data.body;
    var store_ids = request_data_body.store_ids;
 
    request_data_body.store_id = store_ids.split(',');
    if(request_data_body.store_id == ''){
        request_data_body.store_id = [];
    }
    var name = (request_data_body.name).trim();
    name = name.charAt(0).toUpperCase() + name.slice(1);
    request_data_body.name = name;

    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {

        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});

            } else
            {         
                FranchiseProduct.findOne({name:request_data_body.name,franchise_id:request_data_body.franchise_id}, function (error, franchise_product) {   
                    if(franchise_product){

                    }else{
                        var franchise_product = new FranchiseProduct(request_data_body);
                        var image_file = request_data.files;
                        if (image_file != undefined && image_file.length > 0) {
                            var image_name = product._id + utils.generateServerToken(4);
                            var url = utils.getStoreImageFolderPath(FOLDER_NAME.STORE_PRODUCTS) + image_name + FILE_EXTENSION.PRODUCT;

                            product.image_url = url;
                            franchise_product.image_url = url;
                            utils.storeImageToFolder(image_file[0].path, image_name + FILE_EXTENSION.PRODUCT, FOLDER_NAME.STORE_PRODUCTS);

                        }
                        franchise_product.save(function (error) {
                            
                            for(var i =0; i< franchise_product.store_id.length;i++){
                                utils.copy_product_franchise(request_data_body.franchise_id, franchise_product.store_id[i], franchise_product);
                            }
                            if (error) {
                                    response_data.json({success: false, error_code: PRODUCT_ERROR_CODE.PRODUCT_DATA_ADD_FAILED});
                                } else {                           
                                    response_data.json({success: true, message: PRODUCT_MESSAGE_CODE.PRODUCT_ADD_SUCCESSFULLY,
                                    franchise_product: franchise_product});
                                }       
                        });
                    }
                });
            }
        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});

        }
    });
}


//get_product_list

exports.get_product_list = function (request_data, response_data) {
    var request_data_body = request_data.body;

    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {
        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});

            } else
            {

                var product_array = {
                    $lookup:
                            {
                                from: "franchise_specification_groups",
                                localField: "_id",
                                foreignField: "product_id",
                                as: "specifications_details"
                            }
                };


                var condition = {"$match": {'franchise_id': {$eq: mongoose.Types.ObjectId(request_data_body.franchise_id)}}};
               
                FranchiseProduct.aggregate([condition, product_array], function (error, products) {
                    if (error || products.length == 0) {
                        response_data.json({success: false, error_code: PRODUCT_ERROR_CODE.PRODUCT_DATA_NOT_FOUND});
                    } else {

                        /*var store_condition = {$match: {'store_id': {$eq: mongoose.Types.ObjectId(request_data_body.store_id)}}};

                        Item.aggregate([store_condition, {$project: {a: '$name', b: '$product_id'}}, {$unwind: '$a', $unwind: '$b'},
                            {$group: {_id: 'a', item_name: {$addToSet: {item_name: '$a', product_id: '$b'}}}}], function (error, item_array) {
                            if (error || item_array.length == 0)
                            {*/
                                response_data.json({success: true,
                                    message: PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY,
                                    products: products,
                                    item_array: []
                                });
                           /* } else
                            {
                                response_data.json({success: true,
                                    message: PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY,
                                    products: products,
                                    item_array: item_array[0].item_name
                                });
                            }
                        });*/
                    }
                });

            }

        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});

        }
    });

};

exports.get_product_data = function (request_data, response_data) {
    var request_data_body = request_data.body;

    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {
        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});

            } else
            {

                FranchiseProduct.findOne({_id: request_data_body.product_id}, function (error, product) {
                    if (error || !product) {
                        response_data.json({success: false, error_code: PRODUCT_ERROR_CODE.PRODUCT_DATA_NOT_FOUND});
                    } else {

                        var store_condition = {$match: {'franchise_id': {$eq: mongoose.Types.ObjectId(request_data_body.franchise_id)}}};
                        var product_condition = {$match: {'_id': {$ne: mongoose.Types.ObjectId(request_data_body.product_id)}}};
                        FranchiseProduct.aggregate([store_condition, product_condition, {$project: {a: '$name'}}, {$unwind: '$a'},
                            {$group: {_id: 'a', product_name: {$addToSet: '$a'}}}], function (err, product_array) {

                            if (error || product_array.length == 0)
                            {
                                response_data.json({success: true,
                                    message: PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY,
                                    product: product,
                                    product_array: []
                                });
                            } else
                            {
                                response_data.json({success: true,
                                    message: PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY,
                                    product: product,
                                    product_array: product_array[0].product_name
                                });
                            }
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

// get product data
exports.get_product_data_old = function (request_data, response_data) {
    var request_data_body = request_data.body;

    Store.findOne({_id: request_data_body.store_id}, function (error, store_detail) {
        if (store_detail) {
            if (request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});

            } else
            {

                Product.findOne({_id: request_data_body.product_id}, function (error, product) {
                    if (error || !product) {
                        response_data.json({success: false, error_code: PRODUCT_ERROR_CODE.PRODUCT_DATA_NOT_FOUND});
                    } else {
                        response_data.json({success: true,
                            message: PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY,
                            product: product
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


// update product
exports.get_product_store_data = function (request_data, response_data) {
    var request_data_body = request_data.body;

    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {
        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});

            } else
            {

                var store_array = {
                    $lookup:
                            {
                                from: "stores",
                                localField: "store_id",
                                foreignField: "_id",
                                as: "store_list"
                            }
                };
                var array_to_json_store_array = {$unwind: "$store_list"};

                var condition = {"$match": {'franchise_product_id': {$eq: mongoose.Types.ObjectId(request_data_body.product_id)}}};
               
                Product.aggregate([condition, store_array, array_to_json_store_array], function (error, products) {
                    
                    if (error || products.length == 0) {
                        response_data.json({success: false, error_code: PRODUCT_ERROR_CODE.PRODUCT_DATA_NOT_FOUND});
                    } else {

                                response_data.json({success: true,
                                    message: PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY,
                                    products: products
                                });                         
                    }
                });

            }

        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});

        }
    });

}
exports.update_product = function (request_data, response_data) {
    var request_data_body = request_data.body;
    var product_id = request_data_body.product_id;
    var store_ids = request_data_body.store_ids; 
    request_data_body.store_id = store_ids.split(',');
    if(request_data_body.store_id == ''){
        request_data_body.store_id = [];
    }
    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {
        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});

            } else
            {

                var name = (request_data_body.name).trim();
                name = name.charAt(0).toUpperCase() + name.slice(1);
                request_data_body.name = name;

                FranchiseProduct.findOneAndUpdate({_id: product_id}, request_data_body, {new : true}, function (error, product_data) {

                    if (product_data)
                    {
                        var image_file = request_data.files;
                        if (image_file != undefined && image_file.length > 0) {
                            utils.deleteImageFromFolder(product_data.image_url, FOLDER_NAME.STORE_PRODUCTS);
                            var image_name = product_data._id + utils.generateServerToken(4);
                            var url = utils.getStoreImageFolderPath(FOLDER_NAME.STORE_PRODUCTS) + image_name + FILE_EXTENSION.PRODUCT;
                            utils.storeImageToFolder(image_file[0].path, image_name + FILE_EXTENSION.PRODUCT, FOLDER_NAME.STORE_PRODUCTS);
                            product_data.image_url = url;
                            product_data.save();
                            for(var i =0; i< product_data.store_id.length;i++){
                                utils.copy_product_franchise(request_data_body.franchise_id, product_data.store_id[i], product_data);
                            }
                        }else{
                            for(var i =0; i< product_data.store_id.length;i++){
                                utils.copy_product_franchise(request_data_body.franchise_id, product_data.store_id[i], product_data);
                            }
                        }
                        
                        response_data.json({success: true, message: PRODUCT_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
                            product: product_data});

                    } else
                    {
                        response_data.json({success: false, error_code: PRODUCT_ERROR_CODE.UPDATE_FAILED});

                    }

                });
            }

        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});

        }
    });

};


















