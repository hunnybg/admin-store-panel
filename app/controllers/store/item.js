require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
var console = require('../../utils/console');

var utils = require('../../utils/utils');
var Item = require('mongoose').model('item');
var User = require('mongoose').model('user');
var Store = require('mongoose').model('store');
var Product = require('mongoose').model('product');
var Country = require('mongoose').model('country');
var mongoose = require('mongoose');
var Schema = mongoose.Types.ObjectId;

// add item api 
exports.add_item = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'product_id', type: 'string' }, { name: 'name', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var name = (request_data_body.name).trim();
            name = name.charAt(0).toUpperCase() + name.slice(1);
            request_data_body.name = name;
            Store.findOne({ _id: request_data_body.store_id }).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.type != ADMIN_DATA_ID.ADMIN && request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    } else {

                        Item.findOne({ store_id: request_data_body.store_id, product_id: request_data_body.product_id, name: request_data_body.name }).then((item_data) => {
                            if (item_data) {
                                response_data.json({ success: false, error_code: ITEM_ERROR_CODE.ITEM_ALREADY_EXIST });

                            } else {
                                var item = new Item(request_data_body);
                                item.save().then(() => {
                                    response_data.json({
                                        success: true, message: ITEM_MESSAGE_CODE.ITEM_ADD_SUCCESSFULLY,
                                        item: item
                                    });
                                }, (error) => {
                                    console.log(error);
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
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
                } else {
                    response_data.json({ success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND });
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

// upload item image
exports.upload_item_image = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'item_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Item.findOne({ _id: request_data_body.item_id }).then((item) => {
                if (item) {
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
                    item.save().then(() => {

                        response_data.json({
                            success: true, message: ITEM_MESSAGE_CODE.ITEM_IMAGE_UPLOAD_SUCCESSFULLY,
                            item: item
                        });
                    }, (error) => {
                        console.log(error);
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                        });
                    });
                } else {
                    response_data.json({ success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND });
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

//update_item_image
exports.update_item_image = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'item_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Item.findOne({ _id: request_data_body.item_id }).then((item) => {
                if (item) {
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
                    item.save().then(() => {
                        response_data.json({
                            success: true, message: ITEM_MESSAGE_CODE.ITEM_IMAGE_UPDATE_SUCCESSFULLY,
                            item: item
                        });
                    }, (error) => {
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                        });
                    });
                } else {
                    response_data.json({ success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND });
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

/// get store_product_item_list 
exports.get_store_product_item_list = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var user_id = request_data_body.user_id;
            var table;
            var features_available = []
            if (user_id !== undefined) {
                id = request_data_body.user_id;
                table = User;
                var condition1 = { "$match": { 'is_visible_in_store': { $eq: true } } };
            } else {
                id = request_data_body.store_id;
                table = Store;
                var condition1 = { "$match": {} };
            }
            var condition2 = { "$match": {} };
            if (request_data_body.product_id) {
                condition2 = { "$match": { _id: Schema(request_data_body.product_id) } };
            }
            table.findOne({ _id: id }).then((detail) => {
                if (detail) {
                    if (Number(request_data_body.type) != ADMIN_DATA_ID.ADMIN && request_data_body.server_token !== null && detail.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    } else {

                        if (request_data_body.store_id) {
                            features_available = detail.features_available
                        }
                        Country.findOne({ _id: detail.country_id }).then((country_data) => {
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
                                var condition = { "$match": { 'store_id': { $eq: mongoose.Types.ObjectId(request_data_body.store_id) } } };

                                Product.aggregate([condition, condition1, condition2, items_array]).then((products) => {
                                    if (products.length == 0) {

                                        response_data.json({ success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND });
                                    } else {

                                        response_data.json({
                                            success: true,
                                            message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                                            currency: currency,
                                            products: products,
                                            features_available: features_available
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
                        }, (error) => {
                            console.log(error);
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });

                    }
                } else {
                    response_data.json({ success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND });
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

// get_item_list 
exports.get_item_list = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var store_id = request_data_body.store_id;
            Store.findOne({ _id: store_id }).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.type != ADMIN_DATA_ID.ADMIN && request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    } else {
                        Country.findOne({ _id: store_detail.country_id }).then((country_data) => {
                            if (country_data) {
                                var currency = country_data.currency_sign;
                                var products_array = {
                                    $lookup:
                                    {
                                        from: "products",
                                        localField: "product_id",
                                        foreignField: "_id",
                                        as: "products_detail"
                                    }
                                };
                                var array_to_json = { $unwind: "$products_detail" };
                                var condition = { "$match": { 'store_id': { $eq: mongoose.Types.ObjectId(store_id) } } };
                                Item.aggregate([condition, products_array, array_to_json]).then((items) => {
                                    if (items.length == 0) {
                                        response_data.json({ success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND });
                                    } else {
                                        response_data.json({
                                            success: true,
                                            message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                                            currency: currency, items: items
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
                        }, (error) => {
                            console.log(error);
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
                } else {

                    response_data.json({ success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND });
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

// get_item_data
exports.get_item_data = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'item_id', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var store_id = request_data_body.store_id;
            var item_id = request_data_body.item_id;
            Store.findOne({ _id: store_id }).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    } else {

                        Item.findOne({ _id: item_id }).then((item_data) => {
                            if (item_data) {
                                var product_id = item_data.product_id;
                                var specification_array = {
                                    $lookup:
                                    {
                                        from: "specification_groups",
                                        localField: "_id",
                                        foreignField: "product_id",
                                        as: "specifications_detail"
                                    }
                                };
                                var condition = { "$match": { '_id': { $eq: mongoose.Types.ObjectId(product_id) } } };
                                Product.aggregate([condition, specification_array]).then((product) => {
                                    if (product.length == 0) {
                                        response_data.json({ success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND });
                                    } else {
                                        var store_condition = { $match: { 'store_id': { $eq: mongoose.Types.ObjectId(request_data_body.store_id) } } };
                                        var product_condition = { $match: { 'product_id': { $eq: mongoose.Types.ObjectId(product_id) } } };
                                        var item_condition = { $match: { '_id': { $ne: mongoose.Types.ObjectId(item_id) } } };

                                        Item.aggregate([store_condition, product_condition, item_condition, { $project: { a: '$name' } }, { $unwind: '$a' },
                                            { $group: { _id: 'a', item_name: { $addToSet: '$a' } } }]).then((items_array) => {


                                                if (item_array.length == 0) {
                                                    response_data.json({
                                                        success: true,
                                                        message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                                                        item: item_data, product: product[0],
                                                        item_array: []
                                                    });
                                                } else {
                                                    response_data.json({
                                                        success: true,
                                                        message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                                                        item: item_data, product: product[0],
                                                        item_array: item_array[0].item_name
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
                                }, (error) => {
                                    console.log(error);
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
                                });
                            } else {
                                response_data.json({ success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND });
                            }
                        }, (error) => {
                            console.log(error);
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
                } else {

                    response_data.json({ success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND });
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


// item in stock
exports.is_item_in_stock = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'item_id', type: 'string' }, { name: 'is_item_in_stock' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var item_id = request_data_body.item_id;
            Item.findOne({ _id: item_id }).then((item) => {
                if (item) {
                    item.is_item_in_stock = request_data_body.is_item_in_stock;
                    item.save().then(() => {

                        response_data.json({
                            success: true,
                            message: ITEM_MESSAGE_CODE.ITEM_STATE_CHANGE_SUCCESSFULLY
                        });
                    }, (error) => {
                        console.log(error);
                        response_data.json({
                            success: false,
                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                        });
                    });
                } else {
                    response_data.json({ success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND });
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

exports.delete_item = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'item_id', type: 'string' }, { name: 'name', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var item_id = request_data_body.item_id;
            Store.findOne({ _id: request_data_body.store_id }).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.type != ADMIN_DATA_ID.ADMIN && request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    } else {
                        Item.findOneAndRemove({ _id: item_id }, function (error, item_data) {

                        })
                    }

                } else {
                    response_data.json({ success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND });
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

// update item
exports.update_item = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'item_id', type: 'string' }, { name: 'name', type: 'string' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var item_id = request_data_body.item_id;
            var name = (request_data_body.name).trim();
            name = name.charAt(0).toUpperCase() + name.slice(1);
            request_data_body.name = name;
            console.log(request_data_body);
            Store.findOne({ _id: request_data_body.store_id }).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.type != ADMIN_DATA_ID.ADMIN && request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    } else {
                        Item.findOne({ _id: { $ne: request_data_body.item_id }, store_id: request_data_body.store_id, product_id: request_data_body.product_id, name: { '$regex': request_data_body.name, '$options': 'i' } }).then((item_detail) => {
                            if (item_detail) {
                                response_data.json({ success: false, error_code: ITEM_ERROR_CODE.ITEM_ALREADY_EXIST });

                            } else {
                                Item.findOneAndUpdate({ _id: item_id }, request_data_body, { new: true }).then((item_data) => {

                                    if (item_data) {
                                        response_data.json({
                                            success: true, message: ITEM_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
                                            item: item_data
                                        });
                                    } else {

                                        response_data.json({ success: false, error_code: ITEM_ERROR_CODE.UPDATE_FAILED });
                                    }
                                }, (error) => {
                                    console.log(error);
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
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

                } else {
                    response_data.json({ success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND });
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

////// delete_item_image
exports.delete_item_image = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            Store.findOne({ _id: request_data_body.store_id }).then((store_detail) => {
                if (store_detail) {
                    if (request_data_body.type != ADMIN_DATA_ID.ADMIN && request_data_body.server_token !== null && store_detail.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    } else {

                        Item.findOne({ _id: request_data_body._id }).then((item) => {
                            if (item) {
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

                                item.save().then(() => {

                                    response_data.json({
                                        success: true, message: ITEM_MESSAGE_CODE.ITEM_IMAGE_UPDATE_SUCCESSFULLY,
                                        item: item
                                    });

                                }, (error) => {
                                    console.log(error);
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
                                });
                            } else {
                                response_data.json({ success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND });
                            }
                        }, (error) => {
                            console.log(error);
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    }
                } else {
                    response_data.json({ success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND });
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

// get_item_detail
exports.get_item_detail = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{ name: 'type' }], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var type = Number(request_data_body.type);
            var Table;
            switch (type) {
                case ADMIN_DATA_ID.USER:
                    Table = User;
                    break;
                case ADMIN_DATA_ID.STORE:
                    Table = Store;
                    break;
                default:
                    break;
            }

            Table.findOne({ _id: request_data_body.id }).then((detail) => {
                if (detail) {
                    if (request_data_body.server_token !== null && detail.server_token !== request_data_body.server_token) {
                        response_data.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                    } else {

                        Item.find({ '_id': { $in: request_data_body.item_array } }).then((items) => {
                            if (items.length == 0) {

                                response_data.json({ success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND });
                            } else {

                                response_data.json({
                                    success: true, message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                                    items: items
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
                } else {
                    response_data.json({ success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND });
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

exports.update_sequence_number = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            if (request_data_body.type == 1) {
                request_data_body.filtered_product_list.forEach(function (product_data, index) {
                    Product.findOneAndUpdate({ _id: product_data._id }, { sequence_number: product_data.sequence_number }, function (error, new_product_data) {
                        if (index == request_data_body.filtered_product_list.length - 1) {
                            response_data.json({ success: true });
                        }
                    })
                })
            } else {
                request_data_body.filtered_item_list.forEach(function (item_data, index) {
                    Item.findOneAndUpdate({ _id: item_data._id }, { sequence_number: item_data.sequence_number }, function (error, new_item_data) {
                        if (index == request_data_body.filtered_item_list.length - 1) {
                            response_data.json({ success: true });
                        }
                    })
                })
            }
        } else {
            response_data.json(response);
        }
    });
};