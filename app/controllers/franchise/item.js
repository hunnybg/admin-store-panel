require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var utils = require('../../utils/utils');
var Item = require('mongoose').model('item');
var FranchiseItem = require('mongoose').model('franchise_item');
var User = require('mongoose').model('user');
var Store = require('mongoose').model('store');
var Franchise = require('mongoose').model('franchise');
var Product = require('mongoose').model('product');
var FranchiseProduct = require('mongoose').model('franchise_product');
var Country = require('mongoose').model('country');
var City = require('mongoose').model('city');
var mongoose = require('mongoose');
var Advertise = require('mongoose').model('advertise');
// add item api 
exports.add_item = function (request_data, response_data) {

    var request_data_body = request_data.body;
    //request_data_body.store_id = request_data_body.store_ids;

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

                var item = new FranchiseItem(request_data_body);
                
                item.save(function (error) {
                    for(var i =0; i< item.store_id.length;i++){                    
                        utils.copy_item_franchise(request_data_body.franchise_id, item.store_id[i], item);
                    }
                    if (error) {
                        response_data.json({success: false, error_code: ITEM_ERROR_CODE.ITEM_DATA_ADD_FAILED});
                    } else {

                        response_data.json({success: true, message: ITEM_MESSAGE_CODE.ITEM_ADD_SUCCESSFULLY,
                            item: item});
                    }
                });
            }
        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });
};
// upload item image
exports.upload_item_image = function (request_data, response_data) {
    var request_data_body = request_data.body;
    FranchiseItem.findOne({_id: request_data_body.item_id}, function (error, item) {
        if (item)
        {

            var image_file = request_data.files;
            var file_list_size = 0;

            if (image_file != undefined && image_file.length > 0) {

                file_list_size = image_file.length;

                for (i = 0; i < file_list_size; i++) {
                    image_file[i];
                    var image_name = item._id + utils.generateServerToken(4);
                    var url = utils.getStoreImageFolderPath(FOLDER_NAME.STORE_ITEMS) + image_name + FILE_EXTENSION.ITEM;
                    item.image_url.push(url);
                    utils.storeImageToFolder(image_file[i].path, image_name + FILE_EXTENSION.ITEM, FOLDER_NAME.STORE_ITEMS);
                }
            }
            item.save(function (error) {
                if (error) {
                    response_data.json({success: false, error_code: ITEM_ERROR_CODE.ITEM_IMAGE_UPLOAD_FAILED});
                } else {

                    response_data.json({success: true, message: ITEM_MESSAGE_CODE.ITEM_IMAGE_UPLOAD_SUCCESSFULLY,
                        item: item});
                }
            });
        } else
        {
            response_data.json({success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND});
        }

    });
};
exports.update_item_image = function (request_data, response_data) {
    var request_data_body = request_data.body;
    FranchiseItem.findOne({_id: request_data_body.item_id}, function (error, item) {
        if (item)
        {
            var image_file = request_data.files;
            var file_list_size = 0;

            if (image_file != undefined && image_file.length > 0) {

                file_list_size = image_file.length;

                for (i = 0; i < file_list_size; i++) {
                    image_file[i];
                    var image_name = item._id + utils.generateServerToken(4);
                    var url = utils.getStoreImageFolderPath(FOLDER_NAME.STORE_ITEMS) + image_name + FILE_EXTENSION.ITEM;
                    item.image_url.push(url);
                    utils.storeImageToFolder(image_file[i].path, image_name + FILE_EXTENSION.ITEM, FOLDER_NAME.STORE_ITEMS);
                }
            }
            item.save(function (error) {
                if (error) {
                    response_data.json({success: false, error_code: ITEM_ERROR_CODE.ITEM_IMAGE_UPDATE_SUCCESSFULLY});
                } else {
                    response_data.json({success: true, message: ITEM_MESSAGE_CODE.ITEM_IMAGE_UPDATE_SUCCESSFULLY,
                        item: item});
                }
            });
        } else
        {
            response_data.json({success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND});
        }

    });
};

/// get store_product_item_list 
exports.get_for_store_product_item_list = function (request_data, response_data) {
    var request_data_body = request_data.body;
    var franchise_id = request_data_body.franchise_id;
    
    Franchise.findOne({_id: franchise_id}, function (error, detail) {
        if (detail) {
            if (request_data_body.server_token !== null && detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {
                var ads = [];
                Store.findOne({_id: request_data_body.store_id}, function (error, detail) {
                    console.log(request_data_body.store_id);
                Country.findOne({_id: detail.country_id}, function (error, country_data) {
                    if (country_data) {
                        var currency = country_data.currency_sign;
                        var items_array = {
                            $lookup:
                                    {
                                        from: "items",
                                        localField: "_id",
                                        foreignField: "product_id",
                                        as: "items"
                                    }

                        };
                        var condition = {"$match": {'store_id': {$eq: mongoose.Types.ObjectId(request_data_body.store_id)}}};

                        Product.aggregate([condition, items_array], function (error, products) {
                            if (error || products.length == 0) {

                                response_data.json({success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND});
                            } else {

                                response_data.json({success: true,
                                    message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                                    currency: currency,
                                    products: products
                                });

                            }
                        });
                    }

                });
                });
            }
        } else
        {

            response_data.json({success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND});
        }
    });
};
exports.get_store_product_item_list = function (request_data, response_data) {
    var request_data_body = request_data.body;
    var user_id = request_data_body.user_id;
    id = request_data_body.franchise_id;
    /*if (user_id !== undefined)
    {
        table = User;
        var condition1 = {"$match": {'is_visible_in_store': {$eq: true}}};
    } else
    {
        id = request_data_body.store_id;
        table = Store;
        var condition1 = {"$match": {}};
    }*/
    Franchise.findOne({_id: id}, function (error, detail) {
        if (detail) {
            if (request_data_body.server_token !== null && detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {
                var ads = [];
                Country.findOne({_id: detail.country_id}, function (error, country_data) {
                    if (country_data) {
                        var currency = country_data.currency_sign;
                        var items_array = {
                            $lookup:
                                    {
                                        from: "franchise_items",
                                        localField: "_id",
                                        foreignField: "product_id",
                                        as: "items"
                                    }

                        };

                        var condition = {"$match": {'franchise_id': {$eq: mongoose.Types.ObjectId(request_data_body.franchise_id)}}};

                        FranchiseProduct.aggregate([condition, items_array], function (error, products) {
                            if (error || products.length == 0) {

                                response_data.json({success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND});
                            } else {

                                response_data.json({success: true,
                                    message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                                    currency: currency,
                                    products: products
                                });

                            }
                        });
                    }

                });
            }
        } else
        {

            response_data.json({success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND});
        }
    });
};

// get_item_list 
exports.get_item_list = function (request_data, response_data) {
    var request_data_body = request_data.body;
    var franchise_id = request_data_body.franchise_id;
    Franchise.findOne({_id: franchise_id}, function (error, franchise_detail) {
        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {
                Country.findOne({_id: franchise_detail.country_id}, function (error, country_data) {
                    if (country_data) {
                        var currency = country_data.currency_sign;
                        var products_array = {
                            $lookup:
                                    {
                                        from: "franchise_products",
                                        localField: "product_id",
                                        foreignField: "_id",
                                        as: "products_detail"
                                    }
                        };
                        var array_to_json = {$unwind: "$products_detail"};
                        var condition = {"$match": {'franchise_id': {$eq: mongoose.Types.ObjectId(franchise_id)}}};
                        FranchiseItem.aggregate([condition, products_array, array_to_json], function (error, items) {
                            if (error || items.length == 0) {
                                response_data.json({success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND});
                            } else {
                                response_data.json({success: true,
                                    message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                                    currency: currency, items: items
                                });
                            }
                        });
                    }

                });
            }
        } else
        {

            response_data.json({success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND});
        }
    });
};
// get_item_data

exports.get_item_data = function (request_data, response_data) {
    var request_data_body = request_data.body;
    var franchise_id = request_data_body.franchise_id;
    var item_id = request_data_body.item_id;
    Franchise.findOne({_id: franchise_id}, function (error, franchise_detail) {
        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {

                FranchiseItem.findOne({_id: item_id}, function (error, item_data) {
                    if (item_data) {
                        var product_id = item_data.product_id;
                        var specification_array = {
                            $lookup:
                                    {
                                        from: "franchise_specification_groups",
                                        localField: "_id",
                                        foreignField: "product_id",
                                        as: "specifications_detail"
                                    }
                        };
                        var condition = {"$match": {'_id': {$eq: mongoose.Types.ObjectId(product_id)}}};
                        FranchiseProduct.aggregate([condition, specification_array], function (error, product) {
                            if (error || product.length == 0) {
                                response_data.json({success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND});
                            } else {
                                var franchise_condition = {$match: {'franchise_id': {$eq: mongoose.Types.ObjectId(request_data_body.franchise_id)}}};
                                var product_condition = {$match: {'product_id': {$eq: mongoose.Types.ObjectId(product_id)}}};
                                var item_condition = {$match: {'_id': {$ne: mongoose.Types.ObjectId(item_id)}}};

                                FranchiseItem.aggregate([franchise_condition, product_condition, item_condition, {$project: {a: '$name'}}, {$unwind: '$a'},
                                    {$group: {_id: 'a', item_name: {$addToSet: '$a'}}}], function (error, item_array) {


                                    if (error || item_array.length == 0)
                                    {
                                        response_data.json({success: true,
                                            message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                                            item: item_data, product: product[0],
                                            item_array: []
                                        });
                                    } else
                                    {
                                        response_data.json({success: true,
                                            message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                                            item: item_data, product: product[0],
                                            item_array: item_array[0].item_name
                                        });
                                    }
                                });

                            }
                        });
                    } else
                    {
                        response_data.json({success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND});
                    }

                });
            }
        } else
        {

            response_data.json({success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND});
        }
    });
};


// item in stock
exports.is_item_in_stock = function (request_data, response_data) {
    var request_data_body = request_data.body;
    var item_id = request_data_body.item_id;
    FranchiseItem.findOne({_id: item_id}, function (error, item) {
        if (item) {
            item.is_item_in_stock = request_data_body.is_item_in_stock;
            item.save(function (error) {
                if (error) {
                    response_data.json({success: false, error_code: ITEM_ERROR_CODE.ITEM_STATUS_CHANGE_FAILED});
                } else {

                    response_data.json({success: true,
                        message: ITEM_MESSAGE_CODE.ITEM_STATE_CHANGE_SUCCESSFULLY
                    });
                }
            });
        } else
        {
            response_data.json({success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND});
        }

    });
};

// update item
exports.update_item = function (request_data, response_data) {
    var request_data_body = request_data.body;
    console.log(request_data_body);
    var item_id = request_data_body.item_id;
    
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
                FranchiseItem.findOneAndUpdate({_id: item_id}, request_data_body, {new : true}, function (error, item_data) {

                    if (item_data)
                    {console.log("sucess");
                        for(var i =0; i< item_data.store_id.length;i++){                    
                            utils.copy_item_franchise(request_data_body.franchise_id, item_data.store_id[i], item_data);
                        }
                        response_data.json({success: true, message: ITEM_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
                            item: item_data});
                    } else
                    {
                        console.log("error");
                        response_data.json({success: false, error_code: ITEM_ERROR_CODE.UPDATE_FAILED});
                    }

                });
            }

        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });
};






////// delete_item_image
exports.delete_item_image = function (request_data, response_data) {
    var request_data_body = request_data.body;


    Franchise.findOne({_id: request_data_body.franchise_id}, function (error, franchise_detail) {
        if (franchise_detail) {
            if (request_data_body.server_token !== null && franchise_detail.server_token !== request_data_body.server_token)
            {
                response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
            } else
            {

                FranchiseItem.findOne({_id: request_data_body._id}, function (error, item) {
                    if (item)
                    {


                        var image_file = request_data_body.image_url;
                        var file_list_size = 0;
                        if (image_file != undefined && image_file.length > 0) {

                            file_list_size = image_file.length;
                            for (i = 0; i < file_list_size; i++) {

                                image_file[i];

                                var image_url = item.image_url;
                                var index = image_url.indexOf(image_file[i]);
                                image_url.splice(index, 1);
                                item.image_url = image_url;
                                utils.deleteImageFromFolder(image_file[i], FOLDER_NAME.STORE_ITEMS);

                            }
                        }

                        item.save(function (error) {
                            if (error) {
                                response_data.json({success: false, error_code: ITEM_ERROR_CODE.ITEM_IMAGE_UPDATE_SUCCESSFULLY});
                            } else {

                                response_data.json({success: true, message: ITEM_MESSAGE_CODE.ITEM_IMAGE_UPDATE_SUCCESSFULLY,
                                    item: item});
                            }
                        });
                    } else
                    {
                        response_data.json({success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND});
                    }

                });
            }
        } else
        {

            response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
        }
    });
};






