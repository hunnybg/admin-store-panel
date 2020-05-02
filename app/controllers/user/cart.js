require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/push_code');
require('../../utils/constants');
var User = require('mongoose').model('user');
var Provider = require('mongoose').model('provider');
var Store = require('mongoose').model('store');
var Order_payment = require('mongoose').model('order_payment');
var Cart = require('mongoose').model('cart');
var Country = require('mongoose').model('country');
var City = require('mongoose').model('city');
var Payment_gateway = require('mongoose').model('payment_gateway');
var Promo_code = require('mongoose').model('promo_code');
var utils = require('../../utils/utils');
var my_cart = require('../../controllers/user/cart');
var geolib = require('geolib');
var console = require('../../utils/console');

// user add_item_in_cart
exports.add_item_in_cart = function (request_data, response_data) {
    console.log(JSON.parse(JSON.stringify(request_data.body.destination_addresses[0])) , null , 4)
    console.log(JSON.parse(JSON.stringify(request_data.body.destination_addresses[0])) , null , 4)
    utils.check_request_params(request_data.body, [{name: 'pickup_addresses'}, {name: 'destination_addresses'}], function (response) {
        if (response.success) {
            var request_data_body = request_data.body;
            var cart_unique_token = request_data_body.cart_unique_token;
            var user_type = Number(request_data_body.user_type);
            if(request_data_body.user_id == ''){
                request_data_body.user_id = null
            }
            User.findOne({_id: request_data_body.user_id}).then((user) => {
                if (user && request_data_body.server_token !== null && user.server_token !== request_data_body.server_token)
                {
                    response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                } else
                {

                    var cart_id = null;
                    if (request_data_body.cart_id != undefined) {
                        cart_id = request_data_body.cart_id;
                    } else
                    {
                        cart_id = null;
                    }
                    var user_id = null;

                    var delivery_type = DELIVERY_TYPE.STORE;
                    if(request_data_body.delivery_type){
                        delivery_type = request_data_body.delivery_type;
                    }
                    if(delivery_type == DELIVERY_TYPE.COURIER){
                        request_data_body.store_id = null;
                    }

                    Store.findOne({_id: request_data_body.store_id, is_business: true}).then((store) => {
                        // if (store) {
                            var country_id = request_data_body.country_id;
                            var city_id = request_data_body.city_id;
                            var store_id = null;

                            if(store){
                                country_id = store.country_id;
                                city_id = store.city_id;
                                store_id = store._id;

                                store_tax_address = {
                                    city: store.city,
                                    state: store.state,
                                    country: store.country,
                                    zip_code: store.zip_code,
                                    address: store.address
                                }

                                request_data_body.pickup_addresses[0].address = store.address;
                                request_data_body.pickup_addresses[0].location = store.location;
                                request_data_body.pickup_addresses[0].user_details.country_phone_code = store.country_phone_code;
                                request_data_body.pickup_addresses[0].user_details.email = store.email;
                                request_data_body.pickup_addresses[0].user_details.name = store.name;
                                request_data_body.pickup_addresses[0].user_details.phone = store.phone;                                
                            }

                            Country.findOne({_id: country_id}).then((country_detail) => {

                                var country_phone_code = '';
                                var wallet_currency_code = '';
                                var country_code = '';

                                if (country_detail)
                                {
                                    country_id = country_detail._id;
                                    country_phone_code = country_detail.country_phone_code;
                                    wallet_currency_code = country_detail.currency_code;
                                    country_code = country_detail.country_code;
                                }

                                var phone = request_data_body.destination_addresses[0].user_details.phone;
                                var email = request_data_body.destination_addresses[0].user_details.email;
                                var first_name = request_data_body.destination_addresses[0].user_details.first_name;
                                var last_name = request_data_body.destination_addresses[0].user_details.last_name;
                                var query = {$or: [{'email': email}, {'phone': phone}]};

                                User.findOne(query).then((user_phone_data) => {

                                    if (user_type == ADMIN_DATA_ID.STORE && request_data_body.destination_addresses.length > 0)
                                    {
                                        if (user_phone_data)
                                        {
                                            user_phone_data.cart_id = cart_id;
                                            user_phone_data.save();
                                            user = user_phone_data;
                                        } else
                                        {

                                            var server_token = utils.generateServerToken(32);
                                            var password = "123456";
                                            password = utils.encryptPassword(password);

                                            // var first_name = request_data_body.destination_addresses[0].user_details.name.trim();
                                            // if (first_name != "" && first_name != undefined && first_name != null) {
                                                
                                            first_name = first_name.charAt(0).toUpperCase() + first_name.slice(1);
                                                last_name = last_name.charAt(0).toUpperCase() + first_name.slice(1);
                                                // } else {
                                                // first_name = "";
                                            // }
                                            var referral_code = utils.generateReferralCode(ADMIN_DATA_ID.ADMIN, country_detail.country_code, first_name, '');
                                            var user_data = new User({
                                                user_type: ADMIN_DATA_ID.STORE,
                                                admin_type: ADMIN_DATA_ID.USER,
                                                first_name: first_name,
                                                last_name: last_name,
                                                email: email,
                                                password: password,
                                                country_phone_code: country_phone_code,
                                                phone: phone,
                                                country_id: country_id,
                                                server_token: server_token,
                                                referral_code: referral_code,
                                                wallet_currency_code: wallet_currency_code,
                                                cart_id: cart_id
                                            });
                                            user_id = user_data._id;
                                            cart_id = user_data.cart_id;
                                            cart_unique_token = null;
                                            console.log("New User")
                                            console.log(user_data , null ,4)
                                            utils.insert_documets_for_new_users(user_data, null, ADMIN_DATA_ID.USER, country_id, function(document_response){
                                                user_data.is_document_uploaded = document_response.is_document_uploaded;
                                                user_data.save();
                                                user = user_data;
                                            });
                                            
                                        }
                                    }

                                    if (user)
                                    {
                                        cart_id = user.cart_id;
                                        user_id = user._id;
                                        cart_unique_token = null;
                                    }
                                    

                                    Cart.findOne({$or: [{_id: cart_id}, {cart_unique_token: cart_unique_token}]}).then((cart) => {
                                        if (cart && (!cart.store_id || cart.store_id.equals(store_id) || !store_id ) ) {

                                            if (request_data_body.user_id != "" && request_data_body.user_id != null)
                                            {
                                                cart.cart_unique_token = "";
                                            }

                                            cart.delivery_type = delivery_type;
                                            cart.user_id = user_id;
                                            cart.user_type_id = user_id;
                                            cart.user_type = request_data_body.user_type;
                                            cart.city_id = city_id;
                                            cart.destination_addresses = request_data_body.destination_addresses;
                                            cart.order_details = request_data_body.order_details;
                                            cart.pickup_addresses = request_data_body.pickup_addresses;
                                            cart.store_id = store_id;

                                            var total_cart_price = request_data_body.total_cart_price;
                                            var total_item_tax = 0;
                                            cart.total_cart_price = total_cart_price;

                                            if(store){
                                                if (store.is_use_item_tax) {
                                                    if (request_data_body.total_item_tax) {
                                                        total_item_tax = request_data_body.total_item_tax;
                                                    }
                                                } else {
                                                    if(total_cart_price){
                                                        total_item_tax = total_cart_price * store.item_tax * 0.01;
                                                    } else {
                                                        total_cart_price = 0;
                                                    }
                                                }
                                            }

                                            total_item_tax = utils.precisionRoundTwo(Number(total_item_tax));
                                            cart.total_item_tax = total_item_tax;
                                            cart.save().then(() => {
                                                response_data.json({success: true, store_tax_address : store_tax_address ,message: CART_MESSAGE_CODE.CART_UPDATED_SUCCESSFULLY,
                                                    cart_id: cart._id,
                                                    city_id: city_id,
                                                    user_id: user_id
                                                });
                                            }, (error) => {
                                                console.log(error)
                                                response_data.json({
                                                    success: false,
                                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                });
                                            });

                                            //response_data.json({success: false, error_code: STORE_ERROR_CODE.MISMATCH_STORE_ID});

                                        } else {
                                            var total_cart_price = request_data_body.total_cart_price;
                                            var total_item_tax = 0;
                                            if(store){
                                                if (store.is_use_item_tax) {
                                                    if (request_data_body.total_item_tax) {
                                                        total_item_tax = request_data_body.total_item_tax;
                                                    }
                                                } else {
                                                    if(total_cart_price){
                                                        total_item_tax = total_cart_price * store.item_tax * 0.01;
                                                    } else {
                                                        total_cart_price = 0;
                                                    }
                                                }
                                            }

                                            total_item_tax = utils.precisionRoundTwo(Number(total_item_tax));


                                            var cart = new Cart({
                                                cart_unique_token: request_data_body.cart_unique_token,
                                                user_id: user_id,
                                                user_type: request_data_body.user_type,
                                                delivery_type: delivery_type,
                                                user_type_id: user_id,
                                                store_id: store_id,
                                                order_payment_id: null,
                                                order_id: null,
                                                city_id: city_id,
                                                pickup_addresses: request_data_body.pickup_addresses,
                                                destination_addresses: request_data_body.destination_addresses,
                                                order_details: request_data_body.order_details,
                                                total_cart_price: total_cart_price,
                                                total_item_tax: total_item_tax,
                                                seat_number : request_data_body.seat_number
                                            });

                                            if (request_data_body.user_id != "" && request_data_body.user_id != undefined)
                                            {
                                                cart.cart_unique_token = "";
                                            }

                                            cart.save().then(() => {
                                                if (user)
                                                {
                                                    user.cart_id = cart._id;
                                                    user.save();
                                                }

                                                response_data.json({success: true, store_tax_address : store_tax_address , message: CART_MESSAGE_CODE.CART_ADDED_SUCCESSFULLY,
                                                    cart_id: cart._id,
                                                    city_id: city_id,
                                                    user_id: user_id
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
                                }, (error) => {
                                    console.log(error)
                                    response_data.json({
                                        success: false,
                                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                    });
                                });
                            }, (error) => {
                                console.log(error)
                                response_data.json({
                                    success: false,
                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                });
                            });
                        // } else
                        // {
                        //     response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_BUSINESS_OFF});
                        // }
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
        } else {
            response_data.json(response);
        }
    });
};

// get cart 
exports.get_cart = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [{name: 'cart_unique_token', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var cart_unique_token = request_data_body.cart_unique_token;
            if(request_data_body.user_id == ''){
                request_data_body.user_id = null
            }

            User.findOne({_id: request_data_body.user_id}).then((user) => {

                if (user && request_data_body.server_token !== null && user.server_token !== request_data_body.server_token)
                {
                    response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                } else
                {
                    var cart_id = null;
                    var user_id = null;

                    if (user)
                    {
                        cart_id = user.cart_id;
                        user_id = user._id;
                        cart_unique_token = null;
                    }

                    Cart.findOne({$or: [{_id: cart_id}, {cart_unique_token: cart_unique_token}]}).then((cart_detail) => {
                        if (cart_detail) {

                            cart_id = cart_detail._id;

                            Store.findOne({_id: cart_detail.store_id}).then((store) => {
                                if (store)
                                {
                                    if (store.is_business)
                                    {
                                        Country.findOne({_id: store.country_id}).then((country) => {

                                            var currency = "";
                                            if (country)
                                            {
                                                currency = country.currency_sign;
                                            }

                                            Cart.aggregate([

                                                {$match: {'_id': {$eq: cart_id}}},
                                                {$unwind: "$order_details"},
                                                {$unwind: "$order_details.items"},
                                                {$lookup: {
                                                        from: "items",
                                                        localField: "order_details.items.unique_id",
                                                        foreignField: "unique_id",
                                                        as: "order_details.items.item_details"
                                                    }
                                                },
                                                {
                                                    $match: {$and: [{"order_details.items.item_details.is_item_in_stock": true},
                                                            {"order_details.items.item_details.is_visible_in_store": true}]
                                                    }
                                                },
                                                {$unwind: "$order_details.items.item_details"},
                                                {$group: {
                                                        _id: {order_id: '$_id', unique_id: "$order_details.unique_id"},
                                                        "items": {$push: "$order_details.items"}
                                                    }
                                                },
                                                {$lookup: {
                                                        from: "products",
                                                        localField: "_id.unique_id",
                                                        foreignField: "unique_id",
                                                        as: "_id.product_detail"
                                                    }
                                                },
                                                {
                                                    $match: {
                                                        "_id.product_detail.is_visible_in_store": true
                                                    }
                                                },
                                                {$unwind: "$_id.product_detail"},
                                                {$project: {
                                                        "order_detail.unique_id": "$_id.unique_id",
                                                        "order_detail.product_detail": "$_id.product_detail",
                                                        "order_detail.items": "$items"
                                                    }
                                                },
                                                {$group: {
                                                        _id: '$_id.order_id',
                                                        order_details: {$push: "$order_detail"}
                                                    }
                                                }
                                            ]).then((cart) => {
                                                if (cart.length == 0) {
                                                    response_data.json({success: false, error_code: CART_ERROR_CODE.CART_NOT_FOUND});
                                                } else
                                                {
                                                    response_data.json({success: true,
                                                        message: CART_MESSAGE_CODE.CART_GET_SUCCESSFULLY,
                                                        currency: currency,
                                                        cart_id: cart_detail._id,
                                                        city_id: cart_detail.city_id,
                                                        store_id: store._id,
                                                        store_time: store.store_time,
                                                        is_use_item_tax: store.is_use_item_tax,
                                                        item_tax: store.item_tax,
                                                        name: store.name,
                                                        max_item_quantity_add_by_user: store.max_item_quantity_add_by_user,
                                                        destination_addresses: cart_detail.destination_addresses,
                                                        pickup_addresses: cart_detail.pickup_addresses,
                                                        cart: cart[0]});
                                                }
                                            }, (error) => {
                                                response_data.json({
                                                    success: false,
                                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                                });
                                            });
                                        }, (error) => {
                                            console.log(error)
                                            response_data.json({
                                                success: false,
                                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                            });
                                        });
                                    } else
                                    {
                                        if (user)
                                        {
                                            user.cart_id = null;
                                            user.save();
                                        }
                                        response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_BUSINESS_OFF});
                                    }

                                } else
                                {
                                    response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
                                }
                            }, (error) => {
                                console.log(error)
                                response_data.json({
                                    success: false,
                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                });
                            });
                        } else
                        {
                            response_data.json({success: false, error_code: CART_ERROR_CODE.CART_NOT_FOUND});
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

        } else {
            response_data.json(response);
        }
    });
};

// clear_cart
exports.clear_cart = function (request_data, response_data) {

    utils.check_request_params(request_data.body, [{name: 'cart_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var cart_id = request_data_body.cart_id;
            if(request_data_body.user_id == ''){
                request_data_body.user_id = null
            }
            
            User.findOne({_id: request_data_body.user_id}).then((user) => {

                if (user && request_data_body.server_token !== null && user.server_token !== request_data_body.server_token)
                {
                    response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                } else
                {
                    Cart.findOne({_id: cart_id}).then((cart) => {
                        if (cart) {
                            if (cart.order_payment_id != null) {
                                var order_payment_id = cart.order_payment_id;
                                Order_payment.findOne({_id: order_payment_id}).then((order_payment) => {
                                    if (order_payment)
                                    {
                                        var promo_id = order_payment.promo_id;
                                        if (promo_id != null) {
                                            Promo_code.findOne({_id: promo_id}).then((promo_code) => {
                                                if (promo_code) {
                                                    promo_code.used_promo_code = promo_code.used_promo_code - 1;
                                                    promo_code.save();
                                                    user.promo_count = user.promo_count - 1;
                                                    user.save();
                                                }
                                            });
                                        }

                                        Order_payment.remove({_id: order_payment_id}).then(() => {});
                                    }
                                }, (error) => {
                                    console.log(error)
                                });
                            }
                            Cart.remove({_id: cart_id}).then(() => {
                                
                                    if (user)
                                    {
                                        user.cart_id = null;
                                        user.save();
                                    }
                                    response_data.json({success: true,
                                        message: CART_MESSAGE_CODE.CART_DELETE_SUCCESSFULLY,
                                    });
                            }, (error) => {
                                console.log(error)
                                response_data.json({
                                    success: false,
                                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                                });
                            });
                        }else{
                            response_data.json({success: false, error_code: CART_ERROR_CODE.CART_DELETE_FAILED});
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
        } else {
            response_data.json(response);
        }
    });
};

// get_payment_gateway
exports.get_payment_gateway = function (request_data, response_data) {

    utils.check_request_params(request_data.body, [{name: 'city_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var city_id = request_data_body.city_id;
            var type = Number(request_data_body.type); // 7 = User , 8 = Provider , 2 = Store
            var Table;
            switch (type) {
                case ADMIN_DATA_ID.USER:
                    Table = User;
                    break;
                case ADMIN_DATA_ID.PROVIDER:
                    Table = Provider;
                    break;
                case ADMIN_DATA_ID.STORE:
                    Table = Store;
                    break;
                default:
                    Table = User;
                    break;
            }

            Table.findOne({_id: request_data_body.user_id}).then((detail) => {

                if (detail) {
                    if (request_data_body.server_token !== null && detail.server_token !== request_data_body.server_token)
                    {
                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
                    } else
                    {
                        if (city_id != "" && city_id != undefined && city_id != null)
                        {
                            my_cart.get_payment_gateway_from_city(request_data, detail, city_id, response_data);
                        } else
                        {

                            var country = request_data_body.country;
                            var country_code = request_data_body.country_code;
                            var country_code_2 = request_data_body.country_code_2;

                            Country.findOne({$and: [{$or: [{country_name: country}, {country_code: country_code}, {country_code_2: country_code_2}]}, {is_business: true}]}).then((country_data) => {

                                if (!country_data)
                                {
                                    my_cart.get_payment_gateway_from_city(request_data, detail, null, response_data);
                                } else {
                                    var city_lat_long = [request_data_body.latitude, request_data_body.longitude];
                                    var country_id = country_data._id;

                                    City.find({country_id: country_id, is_business: true}).then((cityList) => {

                                        var size = cityList.length;
                                        var count = 0;
                                        if (size == 0) {
                                            my_cart.get_payment_gateway_from_city(request_data, detail, null, response_data);
                                        } else {
                                            var finalCityId = null;
                                            var finalDistance = 1000000;
                                            cityList.forEach(function (city_detail) {
                                                count++;
                                                var cityLatLong = city_detail.city_lat_long;
                                                var distanceFromSubAdminCity = utils.getDistanceFromTwoLocation(city_lat_long, cityLatLong);
                                                var cityRadius = city_detail.city_radius;
                                                if (city_detail.is_use_radius) {
                                                    if (distanceFromSubAdminCity < cityRadius) {
                                                        if (distanceFromSubAdminCity < finalDistance) {
                                                            finalDistance = distanceFromSubAdminCity;
                                                            finalCityId = city_detail._id;
                                                        }
                                                    }
                                                } else
                                                {
                                                    var store_zone = geolib.isPointInside(
                                                        {latitude: city_lat_long[0], longitude: city_lat_long[1]},
                                                        city_detail.city_locations);
                                                    if (store_zone) {
                                                        finalCityId = city_detail._id;
                                                        count = size;
                                                    }
                                                }

                                                if (count == size) {
                                                    if (finalCityId != null) {
                                                        my_cart.get_payment_gateway_from_city(request_data, detail, finalCityId, response_data);
                                                    } else {
                                                        my_cart.get_payment_gateway_from_city(request_data, detail, null, response_data);
                                                    }
                                                }

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
                    }

                } else
                {
                    response_data.json({success: false, error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND});
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

//get_payment_gateway_from_city
exports.get_payment_gateway_from_city = function (request_data, detail, city_id, response_data) {

    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var type = Number(request_data_body.type); // 7 = User , 8 = Provider , 2 = Store

            if (city_id != "" && city_id != undefined && city_id != null) {

                City.findOne({_id: city_id}).then((city) => {
                    if (city) {
                        Payment_gateway.find({'_id': {$in: city.payment_gateway}, is_payment_visible: true}).then((payment_gateway) => {
                            if (city.is_other_payment_mode == false || payment_gateway.length == 0) {
                                payment_gateway = [];
                            }
                            if (type == ADMIN_DATA_ID.USER)
                            {
                                response_data.json({success: true,
                                    message: PAYMENT_GATEWAY_MESSAGE_CODE.LIST_SUCCESSFULLY,
                                    wallet_currency_code: detail.wallet_currency_code,
                                    is_use_wallet: detail.is_use_wallet,
                                    is_cash_payment_mode: city.is_cash_payment_mode,
                                    wallet: detail.wallet, payment_gateway: payment_gateway});
                            } else
                            {
                                response_data.json({success: true,
                                    message: PAYMENT_GATEWAY_MESSAGE_CODE.LIST_SUCCESSFULLY,
                                    wallet_currency_code: detail.wallet_currency_code,
                                    is_cash_payment_mode: city.is_cash_payment_mode,
                                    wallet: detail.wallet, payment_gateway: payment_gateway});
                            }
                        }, (error) => {
                            console.log(error)
                            response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                            });
                        });
                    } else
                    {

                        var payment_gateway = [];
                        response_data.json({success: true,
                            message: PAYMENT_GATEWAY_MESSAGE_CODE.LIST_SUCCESSFULLY,
                            wallet_currency_code: detail.wallet_currency_code,
                            is_use_wallet: detail.is_use_wallet,
                            is_cash_payment_mode: false,
                            wallet: detail.wallet, payment_gateway: payment_gateway});
                    }
                }, (error) => {
                    console.log(error)
                    response_data.json({
                        success: false,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                    });
                });
            } else {

                var payment_gateway = [];
                response_data.json({success: true,
                    message: PAYMENT_GATEWAY_MESSAGE_CODE.LIST_SUCCESSFULLY,
                    wallet_currency_code: detail.wallet_currency_code,
                    is_use_wallet: detail.is_use_wallet,
                    is_cash_payment_mode: false,
                    wallet: detail.wallet, payment_gateway: payment_gateway});
            }
        } else {
            response_data.json(response);
        }
    });
};

exports.check_delivery_available = function (request_data, response_data) {

    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            City.findOne({_id: request_data_body.city_id}, function(error, city_detail){
                if(city_detail){

                    var store_zone = geolib.isPointInside(
                            {latitude: request_data_body.latitude, longitude: request_data_body.longitude},
                            city_detail.city_locations);
                    var distance = utils.getDistanceFromTwoLocation(city_detail.city_lat_long, [request_data_body.latitude, request_data_body.longitude]);

                    if ((city_detail.is_use_radius && distance <= city_detail.city_radius) || store_zone) {
                        
                        response_data.json({success: true, message: CART_MESSAGE_CODE.DESTINATION_CHANGE_SUCCESSFULLY });
                        
                    } else {
                        response_data.json({success: false, error_code: CART_ERROR_CODE.YOUR_DELIVERY_ADDRESS_OUT_OF_AREA});
                    }
                } else {

                }
            })
        } else {
            response_data.json(response);
        }
    });
};


//change_delivery_address
exports.change_delivery_address = function (request_data, response_data) {

    utils.check_request_params(request_data.body, [{name: 'cart_id', type: 'string'}], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            var mongoose = require('mongoose');
            var Schema = mongoose.Types.ObjectId;

            var cartid_condition = {$match: {'_id': {$eq: Schema(request_data_body.cart_id)}}};
            var store_lookup = {
                $lookup: {
                    from: "stores",
                    localField: "store_id",
                    foreignField: "_id",
                    as: "store_detail"
                }
            };
            var store_unwind = {$unwind: "$store_detail"};
            var city_lookup = {
                $lookup:
                    {
                        from: "cities",
                        localField: "store_detail.city_id",
                        foreignField: "_id",
                        as: "city_detail"
                    }
            };
            var city_unwind = {$unwind: "$city_detail"};

            Cart.aggregate([cartid_condition, store_lookup, store_unwind, city_lookup, city_unwind]).then((cart) => {

                if (cart.length == 0) {
                    response_data.json({success: false, error_code: CART_ERROR_CODE.CART_NOT_FOUND});
                } else {
                    var city = cart[0].city_detail;
                    var store = cart[0].store_detail;
                    var distance = utils.getDistanceFromTwoLocation(city.city_lat_long, request_data_body.destination_addresses[0].location);

                    Cart.findOne({_id: request_data_body.cart_id}).then((cart_detail) => {
                        var store_zone = geolib.isPointInside(
                            {latitude: request_data_body.destination_addresses[0].location[0], longitude: request_data_body.destination_addresses[0].location[1]},
                            city.city_locations);

                        if ((city.is_use_radius && distance <= city.city_radius) || store_zone) {
                            distance = utils.getDistanceFromTwoLocation(store.location, request_data_body.destination_addresses[0].location);
                            if (store.is_provide_delivery_anywhere || (!store.is_provide_delivery_anywhere && distance < store.delivery_radius)) {
                                cart_detail.destination_addresses = request_data_body.destination_addresses;
                                cart_detail.save().then(() => {
                                    
                                        response_data.json({success: true, message: CART_MESSAGE_CODE.DESTINATION_CHANGE_SUCCESSFULLY
                                        });
                                    
                                });
                            } else {
                                response_data.json({success: false, error_code: CART_ERROR_CODE.YOUR_DELIVERY_ADDRESS_OUT_OF_STORE_AREA});
                            }
                        } else {
                            response_data.json({success: false, error_code: CART_ERROR_CODE.YOUR_DELIVERY_ADDRESS_OUT_OF_AREA});
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
        } else {
            response_data.json(response);
        }
    });
};

exports.country_city_list = function (request_data, response_data) {

    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var city_lookup = {
                $lookup:
                    {
                        from: "cities",
                        localField: "_id",
                        foreignField: "country_id",
                        as: "city_list"
                    }
            };

            Country.aggregate([city_lookup]).then((country_list) => {
                response_data.json({country_list: country_list});
            }, (error) => {
                console.log(error)
                response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                });
            })
        } else {
            response_data.json(response);
        }
    });

};