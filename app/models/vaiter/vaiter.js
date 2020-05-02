var mongoose = require('mongoose');
var schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var vaiter = new schema({
    unique_id: Number,
    image_url: {type: String, default: ""},
    first_name: {type: String, default: ""},
    last_name: {type: String, default: ""},
    email: {type: String, default: ""},
    phone: {type: String, default: ""},
    password: {type: String, default: ""},
    address: {type: String, default: ""},

    login_by: {type: String, default: ""},
    app_version: {type: String, default: ""},
    
    country_id: {type: schema.Types.ObjectId},
    city_id: {type: schema.Types.ObjectId},

    store_id: {type: schema.Types.ObjectId},
    store_name: {type: String, default: ""},

    country_phone_code: {type: String, default: ""},

    device_token: {type: String, default: ""},
    device_type: {type: String, default: ""},
    server_token: {type: String, default: ""},

    wallet: {type: Number, default: 0},
    wallet_currency_code: {type: String, default: ""},

    requests: [{type: schema.Types.ObjectId}],
    current_request: [{type: schema.Types.ObjectId}],
    total_requests: {type: Number, default: 0},

    hourly_vage: {type: Number, default: 0},
    employee_type: {type: Number, default: 1},

    is_approved: {type: Boolean, default: false},
    is_active_for_job: {type: Boolean, default: false},
    is_online: {type: Boolean, default: false},
    first_login: {type: Boolean, default: true},
    
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    strict: true,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

vaiter.index({country_id: 1}, {background: true});
vaiter.index({city_id: 1}, {background: true});
vaiter.index({email: 1}, {background: true});
vaiter.index({phone: 1}, {background: true});
vaiter.index({current_request: 1}, {background: true});
vaiter.index({requests: 1}, {background: true});

vaiter.plugin(autoIncrement.plugin, {model: 'vaiter', field: 'unique_id', startAt: 1, incrementBy: 1});
module.exports = mongoose.model('vaiter', vaiter);