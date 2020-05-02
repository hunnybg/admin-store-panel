var config = require('./config'),
    mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var autoIncrement = require('mongoose-auto-increment');

module.exports = function () {
    /// for mongoose 4
    // var db = mongoose.connect(config.db, {useMongoClient: true});
    // autoIncrement.initialize(db);

    //// for mongoose 5
    var db = mongoose.connect(config.db , (err)=>{
        if(err){
            console.log(err);
            process.exit(1);
        }
    });
    autoIncrement.initialize(mongoose.connection);

    require('../app/models/admin/settings');
    require('../app/models/admin/delivery');
    require('../app/models/admin/vehicle');
    require('../app/models/admin/country');
    require('../app/models/admin/city');
    require('../app/models/admin/service');
    require('../app/models/admin/installation_setting');
    require('../app/models/admin/promo_code');

    require('../app/models/admin/document');
    require('../app/models/admin/payment_gateway');
    require('../app/models/admin/sms_gateway');
    require('../app/models/admin/admin');
    require('../app/models/admin/database_backup');
    require('../app/models/admin/wallet_history');
    require('../app/models/admin/delivery_type');
    require('../app/models/admin/document_uploaded_list');
    require('../app/models/admin/cityzone');
    require('../app/models/admin/zonevalue');
    require('../app/models/admin/wallet_request');
    require('../app/models/admin/image_setting');
    require('../app/models/admin/transfer_history');
    require('../app/models/admin/mass_notification');
    require('../app/models/user/user');
    require('../app/models/user/card');
    require('../app/models/user/order');
    require('../app/models/user/cart');
    require('../app/models/user/review');
    require('../app/models/user/order_payment');
    require('../app/models/user/referral_code');



    require('../app/models/provider/provider');
    require('../app/models/provider/bank_detail');
    require('../app/models/provider/provider_analytic_daily');
    require('../app/models/provider/provider_vehicle');




    require('../app/models/store/franchise');
    require('../app/models/store/store');
    require('../app/models/store/product');
    require('../app/models/store/specification');
    require('../app/models/store/specification_group');
    require('../app/models/store/item');
    require('../app/models/store/store_analytic_daily');
    require('../app/models/store/advertise');
    require('../app/models/store/request');

    require('../app/models/email_sms/email');
    require('../app/models/email_sms/sms');

    //Request Assistance Model New 11-11-19 By BM
    require('../app/models/user/request_assistance');
    //Vaiter Model New 15-11-19 By BM
    require('../app/models/vaiter/vaiter');
    //Time Shift Model New 11-02-20 By BM
    require('../app/models/vaiter/shift_time');
    //Table Request Model New 24-02-20 By BM
    require('../app/models/user/table_request');
    //Ticket Model New 06-03-20 By BM
    require('../app/models/user/ticket');
    //Store Owner Model New 14-04-20 By BM
    require('../app/models/store/store_owner');

    return db;
};