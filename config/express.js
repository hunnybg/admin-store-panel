var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var session = require("express-session");
var path = require("path");
var compression = require('compression');
var async = require("async");
var app = express();
var cors = require('cors')
function parallel(middlewares) {
    return function (req, res, next) {
        async.each(middlewares, function (mw, cb) {
            mw(req, res, cb);
        }, next);
    };
}

module.exports = function () {
    if (process.env.NODE_ENV == 'development') {
        app.use(session({ resave: true, saveUninitialized: true, secret: 'SOMERANDOMSECRETHERE', maxAge: '1h' }));
    } else if (process.env.NODE_ENV == 'production') {
        var RedisStore = require('connect-redis')(session);
        var redis = require("redis");
        var client = redis.createClient();

        ///// FOR SESSION SET /////
        app.use(session({ resave: true, saveUninitialized: true, secret: 'SOMERANDOMSECRETHERE', maxAge: '1h', store: new RedisStore({ host: 'localhost', port: 6379, client: client, ttl: 1440 }) }));
    }
    app.use(parallel([
        express.static(path.join(__dirname, '../dist')),
        express.static(path.join(__dirname, '../uploads')),
        compression(),
        bodyParser.json({ limit: '50mb' }),
        bodyParser.urlencoded({ limit: '50mb', extended: true }),
        multer({ dest: __dirname + '/uploads/' }).any()
    ]));
    var Store = require('mongoose').model('store');
    var Admin = require('mongoose').model('admin');
    var Document_uploaded_list = require('mongoose').model('document_uploaded_list');
    var User = require('mongoose').model('user');
    var Provider = require('mongoose').model('provider');

    var whitelist = ['http://localhost:4200', 'http://192.168.0.144:4200']
    var corsOptionsDelegate = function (req, callback) {
        var corsOptions;
        //   console.log(whitelist.indexOf(req.header('Origin')));
        if (whitelist.indexOf(req.header('Origin')) !== -1) {
            corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
        } else {
            corsOptions = { origin: false } // disable CORS for this request
        }
        callback(null, corsOptions) // callback expects two parameters: error and options
    }

    app.use(cors(corsOptionsDelegate));

    app.all('/store_documents/*', function (request_data, response_data, next) {

        if (request_data.headers.type == "admin") {
            Admin.findOne({ server_token: request_data.headers.token }, function (error, admin) {
                if (admin) {
                    next();
                } else {
                    response_data.json();
                }
            });
        } else {
            var id = request_data.url;
            id = id.split('/');
            id = id[2].split('.')
            id = id[0].slice(0, -4);
            Document_uploaded_list.findById(id, function (error, document) {

                if (document) {
                    Store.findById(document.user_id, function (error, store) {
                        if (store) {
                            if (store.server_token == request_data.headers.token) {
                                next();
                            } else {
                                response_data.json();
                            }
                        } else {

                            response_data.json();
                        }
                    })
                } else {
                    response_data.json();
                }
            });
        }
    });

    app.all('/provider_documents/*', function (request_data, response_data, next) {

        if (request_data.headers.type == "admin") {
            Admin.findOne({ server_token: request_data.headers.token }, function (error, admin) {
                if (admin) {
                    next();
                } else {
                    response_data.json();
                }
            })
        } else {
            var id = request_data.url;
            id = id.split('/');
            id = id[2].split('.')
            id = id[0].slice(0, -4);
            Document_uploaded_list.findById(id, function (error, document) {

                if (document) {
                    Provider.findById(document.user_id, function (error, provider) {
                        if (provider) {
                            if (provider.server_token == request_data.headers.token) {
                                next();
                            } else {
                                response_data.json();
                            }
                        } else {
                            response_data.json();
                        }
                    })
                } else {
                    response_data.json();
                }
            });
        }
    });

    app.all('/user_documents/*', function (request_data, response_data, next) {

        if (request_data.headers.type == "admin") {
            Admin.findOne({ server_token: request_data.headers.token }, function (error, admin) {
                if (admin) {
                    next();
                } else {
                    response_data.json();
                }
            })
        } else {
            var id = request_data.url;
            id = id.split('/');
            id = id[2].split('.')
            id = id[0].slice(0, -4);
            Document_uploaded_list.findById(id, function (error, document) {

                if (document) {
                    User.findById(document.user_id, function (error, user) {
                        if (user) {
                            if (user.server_token == request_data.headers.token) {
                                next();
                            } else {
                                response_data.json();
                            }
                        } else {
                            response_data.json();
                        }
                    })
                } else {
                    response_data.json();
                }
            });
        }
    });

    // USER API //
    require('../app/routes/user/user')(app);
    require('../app/routes/user/card')(app);
    require('../app/routes/user/order')(app);
    require('../app/routes/user/wallet')(app);
    require('../app/routes/user/cart')(app);
    require('../app/routes/user/promo_code')(app);
    require('../app/routes/user/cron_job')(app);


    // PROVIDER API //
    require('../app/routes/provider/provider')(app);
    require('../app/routes/provider/provider_earning')(app);
    require('../app/routes/provider/bank_detail')(app);
    require('../app/routes/provider/provider_vehicle')(app);


    // STORE API //
    require('../app/routes/store/store')(app);
    require('../app/routes/store/delivery')(app);
    require('../app/routes/store/product')(app);
    require('../app/routes/store/specification')(app);
    require('../app/routes/store/specification_group')(app);
    require('../app/routes/store/item')(app);
    require('../app/routes/store/store_earning')(app);
    require('../app/routes/store/request')(app);
    require('../app/routes/store/store_promo_code')(app);

    // ADMIN API FOR APP //
    require('../app/routes/admin/admin')(app);


    // ADMIN PANEL //
    require('../app/admin_routes/country')(app);
    require('../app/admin_routes/city')(app);
    require('../app/admin_routes/vehicle')(app);
    require('../app/admin_routes/service')(app);
    require('../app/admin_routes/payment_gateway')(app);
    require('../app/admin_routes/delivery')(app);
    require('../app/admin_routes/document')(app);
    require('../app/admin_routes/view_document')(app);
    require('../app/admin_routes/promo_code')(app);
    require('../app/admin_routes/provider')(app);
    require('../app/admin_routes/user')(app);
    require('../app/admin_routes/store')(app);
    require('../app/admin_routes/setting')(app);
    require('../app/admin_routes/history')(app);
    require('../app/admin_routes/order')(app);
    require('../app/admin_routes/admin')(app);
    require('../app/admin_routes/database_backup')(app);
    require('../app/admin_routes/sms')(app);
    require('../app/admin_routes/email')(app);
    require('../app/admin_routes/order_earning')(app);
    require('../app/admin_routes/earning')(app);
    require('../app/admin_routes/referral_code')(app);
    require('../app/admin_routes/wallet')(app);
    require('../app/admin_routes/review')(app);
    require('../app/admin_routes/provider_weekly_earning')(app);
    require('../app/admin_routes/store_weekly_earning')(app);
    require('../app/admin_routes/provider_map')(app);
    require('../app/admin_routes/store_map')(app);
    require('../app/admin_routes/dashboard')(app);
    require('../app/admin_routes/ads')(app);
    require('../app/admin_routes/add_details')(app);
    require('../app/admin_routes/wallet_request')(app);
    require('../app/admin_routes/provider_vehicle')(app);
    require('../app/admin_routes/cancellation_charge')(app);
    require('../app/admin_routes/transaction_history')(app);

    require('../app/admin_routes/mass_notification')(app);
    require('../app/admin_routes/vaiter')(app);


    require('../app/routes/vaiter/vaiter')(app);
    require('../app/routes/vaiter/shift_time')(app);
    require('../app/admin_routes/shift_time')(app);

    // Catch all other routes and return the index file
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });

    return app;
};
