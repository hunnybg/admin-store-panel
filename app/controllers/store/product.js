require('../../utils/message_code');
require('../../utils/error_code');
var console = require('../../utils/console');

require('../../utils/constants');
var utils = require('../../utils/utils');
var mongoose = require('mongoose');
var Product = require('mongoose').model('product');
var Store = require('mongoose').model('store');
var Item = require('mongoose').model('item');

// add product api 
exports.add_product = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'name', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var name = (request_data_body.name).trim();
            name = name.charAt(0).toUpperCase() + name.slice(1);
            request_data_body.name = name;
            Store.findOne({_id: request_data_body.store_id}).then((store_detail) => {

                if (store_detail) {
                    if (request_data_body.type != ADMIN_DATA_ID.ADMIN && request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});

                    } else {
                        Product.findOne({
                            store_id: request_data_body.store_id,
                            name: {'$regex': request_data_body.name, '$options': 'i'}
                        }).then((product_data) => {
                            if (product_data) {
                                response_data.json({
                                    success: false,
                                    error_code: PRODUCT_ERROR_CODE.PRODUCT_ALREADY_EXIST
                                });
                            } else {

                                var product = new Product(request_data_body);
                                var image_file = request_data.files;
                                if (image_file != undefined && image_file.length > 0) {
                                    var image_name = product._id + utils.generateServerToken(4);
                                    var url = utils.getStoreImageFolderPath(FOLDER_NAME.STORE_PRODUCTS) + image_name + FILE_EXTENSION.PRODUCT;

                                    product.image_url = url;
                                    utils.storeImageToFolder(image_file[0].path, image_name + FILE_EXTENSION.PRODUCT, FOLDER_NAME.STORE_PRODUCTS);

                                }
                                product.save().then(() => {

                                    response_data.json({
                                        success: true, message: PRODUCT_MESSAGE_CODE.PRODUCT_ADD_SUCCESSFULLY,
                                        product: product
                                    });
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
                    }
                } else {
                    response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
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
}


//get_product_list
exports.get_product_list = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({_id: request_data_body.store_id}).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.type != ADMIN_DATA_ID.ADMIN && request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});

                    } else {

                        var product_array = {
                            $lookup:
                                {
                                    from: "specification_groups",
                                    localField: "_id",
                                    foreignField: "product_id",
                                    as: "specifications_details"
                                }
                        };


                        var condition = {"$match": {'store_id': {$eq: mongoose.Types.ObjectId(request_data_body.store_id)}}};

                        Product.aggregate([condition, product_array]).then((products) => {
                            if (products.length == 0) {
                                response_data.json({
                                    success: false,
                                    error_code: PRODUCT_ERROR_CODE.PRODUCT_DATA_NOT_FOUND
                                });
                            } else {

                                var store_condition = {$match: {'store_id': {$eq: mongoose.Types.ObjectId(request_data_body.store_id)}}};

                                Item.aggregate([store_condition, {
                                    $project: {
                                        a: '$name',
                                        b: '$product_id'
                                    }
                                }, {$unwind: '$a', $unwind: '$b'},
                                    {
                                        $group: {
                                            _id: 'a',
                                            item_name: {$addToSet: {item_name: '$a', product_id: '$b'}}
                                        }
                                    }]).then((item_array) => {
                                    if (item_array.length == 0) {
                                        response_data.json({
                                            success: true,
                                            message: PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY,
                                            products: products,
                                            item_array: []
                                        });
                                    } else {
                                        response_data.json({
                                            success: true,
                                            message: PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY,
                                            products: products,
                                            item_array: item_array[0].item_name
                                        });
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
                    }
                } else {

                    response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});

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


//get_product_data
exports.get_product_data = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'product_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({_id: request_data_body.store_id}).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});

                    } else {

                        Product.findOne({_id: request_data_body.product_id}).then((product) => {
                            if (!product) {
                                response_data.json({
                                    success: false,
                                    error_code: PRODUCT_ERROR_CODE.PRODUCT_DATA_NOT_FOUND
                                });
                            } else {

                                var store_condition = {$match: {'store_id': {$eq: mongoose.Types.ObjectId(request_data_body.store_id)}}};
                                var product_condition = {$match: {'_id': {$ne: mongoose.Types.ObjectId(request_data_body.product_id)}}};
                                Product.aggregate([store_condition, product_condition, {$project: {a: '$name'}}, {$unwind: '$a'},
                                    {$group: {_id: 'a', product_name: {$addToSet: '$a'}}}]).then((product_array) => {

                                    if (product_array.length == 0) {
                                        response_data.json({
                                            success: true,
                                            message: PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY,
                                            product: product,
                                            product_array: []
                                        });
                                    } else {
                                        response_data.json({
                                            success: true,
                                            message: PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY,
                                            product: product,
                                            product_array: product_array[0].product_name
                                        });
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
                    }
                } else {
                    response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
                }
            });
        } else {
            response_data.json(response);
        }
    });
};


// update product
exports.update_product = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'product_id', type: 'string'}, {name: 'name', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var product_id = request_data_body.product_id;
            var name = (request_data_body.name).trim();
            name = name.charAt(0).toUpperCase() + name.slice(1);
            request_data_body.name = name;
            Store.findOne({_id: request_data_body.store_id}).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.type != ADMIN_DATA_ID.ADMIN && request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});

                    } else {

                        Product.findOne({
                            _id: {$ne: request_data_body.product_id},
                            store_id: request_data_body.store_id,
                            name: {'$regex': request_data_body.name, '$options': 'i'}
                        }).then((product_detail) => {
                            if (product_detail) {
                                response_data.json({
                                    success: false,
                                    error_code: PRODUCT_ERROR_CODE.PRODUCT_ALREADY_EXIST
                                });
                            } else {

                                Product.findOneAndUpdate({_id: product_id}, request_data_body, {new: true}).then((product_data) => {

                                    if (product_data) {
                                        var image_file = request_data.files;
                                        if (image_file != undefined && image_file.length > 0) {
                                            utils.deleteImageFromFolder(product_data.image_url, FOLDER_NAME.STORE_PRODUCTS);
                                            var image_name = product_data._id + utils.generateServerToken(4);
                                            var url = utils.getStoreImageFolderPath(FOLDER_NAME.STORE_PRODUCTS) + image_name + FILE_EXTENSION.PRODUCT;
                                            utils.storeImageToFolder(image_file[0].path, image_name + FILE_EXTENSION.PRODUCT, FOLDER_NAME.STORE_PRODUCTS);
                                            product_data.image_url = url;
                                            product_data.save();
                                        }

                                        response_data.json({
                                            success: true, message: PRODUCT_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
                                            product: product_data
                                        });

                                    } else {
                                        response_data.json({
                                            success: false,
                                            error_code: PRODUCT_ERROR_CODE.UPDATE_FAILED
                                        });
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
                    }

                } else {

                    response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});

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

// get product item detail
exports.get_product_item_detail = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'product_id', type: 'string'}, {name: 'item_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Product.findOne({
                _id: request_data_body.product_id,
                store_id: request_data_body.store_id
            }).then((product_detail) => {
                if (product_detail) {

                    Item.findOne({
                        _id: request_data_body.item_id,
                        product_id: product_detail._id,
                        store_id: product_detail.store_id
                    }).then((item_detail) => {
                        response_data.json({
                            success: true, message: PRODUCT_MESSAGE_CODE.GET_PRODUCT_ITEM_LIST,
                            product: product_detail,
                            item: item_detail
                        });
                    }, (error) => {
                        console.log(error)
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                        });
                    });

                } else {
                    response_data.json({success: false, error_code: PRODUCT_ERROR_CODE.ITEM_LIST_NOT_FOUND});
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















