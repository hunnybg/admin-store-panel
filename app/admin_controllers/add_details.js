var User_File_Obj = require('../controllers/user/user');
var Provider_File_Obj = require('../controllers/provider/provider');
var Store_File_Obj = require('../controllers/store/store');
var utils = require('../utils/utils');
var User = require('mongoose').model('user');
var Store = require('mongoose').model('store');
var Provider = require('mongoose').model('provider');
var Country = require('mongoose').model('country');
var City = require('mongoose').model('city');
var Delivery = require('mongoose').model('delivery');
var Provider_vehicle = require('mongoose').model('provider_vehicle');
var console = require('../utils/console');


//add_new_user
exports.add_new_user = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {
            var request_data_body = request_data.body;
            var country_id = request_data_body.country_id;
            var city_id = request_data_body.city_id;
            var type = 7;

            City.findOne({_id: city_id}, function (error, city_detail) {
                if (city_detail) {
                    Country.findOne({_id: country_id}, function (error, country) {
                        if (country) {
                            User.find({country_id: country_id}, function (error, users) {
                                var count = users.length;
                                count = count + 1;

                                request_data_body.phone = utils.generateOtp(country.maximum_phone_number_length);
                                request_data_body.country_id = country_id;
                                request_data_body.first_name = "User" + count;
                                request_data_body.last_name = city_detail.city_name;
                                request_data_body.city = city_detail.city_name;
                                request_data_body.password = "123456"
                                request_data_body.login_by = "manual";
                                request_data_body.social_ids = [];
                                request_data_body.zipcode = "";
                                request_data_body.device_token = "";
                                request_data_body.device_type = "";
                                request_data_body.app_version = "";
                                var city_code = city_detail.city_code;
                                city_code = city_code.replace(/[^a-zA-Z ]/g, "");
                                city_code = city_code.replace(/\s+/g, '');
                                request_data_body.email = ("user" + count + "_" + city_code + "@gmail.com").toLowerCase();
                                request_data_body.country_phone_code = country.country_phone_code;
                                request_data_body.is_email_verified = false;
                                request_data_body.is_phone_number_verified = false;

                                User_File_Obj.user_register(request_data, response_data);
                            });
                        } else {
                            response_data.json({success: false, error_code: 0});
                        }
                    });
                } else {
                    response_data.json({success: false, error_code: 0});
                }
            });
        } else {
            response_data.json(response);
        }
    });
};

//add_new_provider
exports.add_new_provider = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {
            var request_data_body = request_data.body;
            var country_id = request_data_body.country_id;
            var city_id = request_data_body.city_id;
            var type = 8;
            Country.findOne({_id: country_id}, function (error, country) {
                City.findOne({_id: city_id}, function (error, city_detail) {

                    if (city_detail && country) {

                        Provider.find({country_id: country_id}, function (error, providers) {
                            var count = providers.length;
                            count = count + 1;

                            request_data_body.country_id = country_id;
                            request_data_body.city_id = city_id;
                            request_data_body.first_name = "Deliveryman" + count;
                            request_data_body.last_name = city_detail.city_name;
                            request_data_body.city = city_detail.city_name;
                            request_data_body.password = "123456"
                            request_data_body.login_by = "manual";
                            request_data_body.address = "";
                            request_data_body.social_ids = [];
                            request_data_body.device_token = "";
                            request_data_body.device_type = "";
                            request_data_body.app_version = "";
                            var city_code = city_detail.city_code;
                                city_code = city_code.replace(/[^a-zA-Z ]/g, "");
                                city_code = city_code.replace(/\s+/g, '');
                            request_data_body.email = ("deliveryman" + count + "_" + city_code + "@gmail.com").toLowerCase();
                            request_data_body.country_phone_code = country.country_phone_code;
                            request_data_body.is_email_verified = false;
                            request_data_body.is_phone_number_verified = false;
                            request_data_body.is_approved = true;
                            request_data_body.phone = utils.generateOtp(country.maximum_phone_number_length);
                            console.log("provider_register")
                            Provider_File_Obj.provider_register(request_data, response_data);

                        });
                    } else {
                        response_data.json({success: false, error_code: 0});
                    }
                });

            });
        } else {
            response_data.json(response);
        }
    });
};

//add_new_store
exports.add_new_store = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {
            var request_data_body = request_data.body;
            var country_id = request_data_body.country_id;
            var city_id = request_data_body.city_id;
            var store_delivery_id = request_data_body.store_delivery_id;
            var type = 2;

            Country.findOne({_id: country_id}, function (error, country) {
                City.findOne({_id: city_id}, function (error, city_detail) {
                    Delivery.findOne({_id: store_delivery_id}, function (error, delivery_detail) {

                        if (city_detail && country) {

                            Store.find({country_id: country_id}, function (error, stores) {
                                var count = stores.length;
                                count = count + 1;

                                request_data_body.store_delivery_id = store_delivery_id;
                                request_data_body.latitude = city_detail.city_lat_long[0];
                                request_data_body.longitude = city_detail.city_lat_long[1];

                                request_data_body.country_id = country_id;
                                request_data_body.city_id = city_id;
                                request_data_body.name = "Store " + count;
                                request_data_body.city = city_detail.city_name;
                                request_data_body.password = "123456"
                                request_data_body.login_by = "manual";
                                request_data_body.address = city_detail.city_name;
                                request_data_body.social_ids = [];
                                request_data_body.vehicle_model = "Swift LDI";
                                request_data_body.vehicle_number = "5420";

                                request_data_body.device_token = "";
                                request_data_body.device_type = "";
                                request_data_body.app_version = "";

                                var city_code = city_detail.city_code;
                                city_code = city_code.replace(/[^a-zA-Z ]/g, "");
                                city_code = city_code.replace(/\s+/g, '');

                                request_data_body.email = ("store" + count + "_" + city_code + "@" + (delivery_detail.delivery_name).replace(/\s+/g, '') + ".com").toLowerCase();
                                request_data_body.country_phone_code = country.country_phone_code;
                                request_data_body.is_email_verified = false;
                                request_data_body.is_phone_number_verified = false;
                                request_data_body.is_business = true;
                                request_data_body.is_approved = true;
                                request_data_body.phone = utils.generateOtp(country.maximum_phone_number_length);

                                Store_File_Obj.store_register(request_data, response_data);
                            });
                        } else {
                            response_data.json({success: false, error_code: 0});
                        }
                    });
                });

            });
        } else {
            response_data.json(response);
        }
    });
};


// GET STORE LIST 
exports.get_store_list = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {
            Store.find({}, function (error, stores) {
                if (error || stores.length == 0) {
                    response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
                } else {
                    response_data.json({success: true,
                        message: STORE_MESSAGE_CODE.STORE_DATA_SUCCESSFULLY,
                        stores: stores
                    });
                }
            });
        } else {
            response_data.json(response);
        }
    });
};

//get_providers
exports.get_providers = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {
            Provider.find({}, function (error, providers) {
                if (error || providers.length == 0) {
                    response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
                } else {
                    response_data.json({success: true,
                        message: STORE_MESSAGE_CODE.STORE_DATA_SUCCESSFULLY,
                        providers: providers
                    });
                }
            });
        } else {
            response_data.json(response);
        }
    });
};

//add_provider_vehicle_data
exports.add_provider_vehicle_data = function (request_data, response_data) {
    utils.check_request_params(request_data.body, [], function (response) {
        if (response.success) {

            var request_data_body = request_data.body;
            console.log(request_data_body)
            Provider.findOne({_id: request_data_body.provider_id}, function (error, provider) {
                console.log(request_data_body.provider_id);
                var provider_vehicle = new Provider_vehicle({
                    country_id: provider.country_id,
                    vehicle_id: "59a7dde53e05c20f39e9726a",
                    service_id: null,
                    admin_service_id: null,
                    admin_vehicle_id: "59a7dde53e05c20f39e9726a",
                    provider_id: provider._id,
                    provider_unique_id: provider.unique_id,
                    vehicle_year: "2012",
                    vehicle_model: "LDI",
                    vehicle_name: "Bike",
                    vehicle_plate_no: "4325",
                    vehicle_color: "White",
                    is_approved: true,
                    is_document_uploaded: true

                });
                provider_vehicle.save();
                provider.vehicle_ids.push(provider_vehicle._id);
                provider.vehicle_id = "59a7dde53e05c20f39e9726a";
                provider.is_approved = true;
                provider.selected_vehicle_id = provider_vehicle._id;
                provider.save(function (error) {
                    if (error) {
                        throw error;
                    } else {
                        response_data.json({success: true,
                            message: STORE_MESSAGE_CODE.STORE_DATA_SUCCESSFULLY
                        });
                    }
                });
            });
        } else {
            response_data.json(response);
        }
    });
};
