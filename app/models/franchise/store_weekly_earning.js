var mongoose = require('mongoose');
var schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var store_weekly_earning = new schema({

    unique_id: Number,
    store_id: {type: schema.Types.ObjectId},
    store_unique_id: Number,
    statement_number: {type: String, default: ""},

    total_item_price: {type: Number, default: 0},
    order_price: {type: Number, default: 0},
    total_store_tax_price: {type: Number, default: 0},
    total_order_price: {type: Number, default: 0},

    total_wallet: {type: Number, default: 0},
    total_admin_profit: {type: Number, default: 0},
    total_store_profit: {type: Number, default: 0},

    total_store_earning: {type: Number, default: 0},
    store_have_order_payment: {type: Number, default: 0},
    store_have_service_payment: {type: Number, default: 0},
    total_pay_to_store: {type: Number, default: 0},

    average_current_rate: {type: Number, default: 1},
    total_admin_profit_in_admin_currency: {type: Number, default: 0},
    total_store_profit_in_admin_currency: {type: Number, default: 0},

    total_paid: {type: Number, default: 0},
    total_remaining_to_paid: {type: Number, default: 0},
    is_weekly_invoice_paid: {type: Boolean, default: false},

    total_delivery_price: {type: Number, default: 0},
    total: {type: Number, default: 0},

    total_wallet_income_set: {type: Number, default: 0},
    total_wallet_income_set_in_cash_order: {type: Number, default: 0},
    total_wallet_income_set_in_other_order: {type: Number, default: 0},

    start_date: {type: Date},
    end_date: {type: Date},
    date: {type: Date},
    start_date_tag: {type: String, default: ""},
    end_date_tag: {type: String, default: ""},
    date_tag: {type: String, default: ""},
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





store_weekly_earning.plugin(autoIncrement.plugin, {model: 'store_weekly_earning', field: 'unique_id', startAt: 1, incrementBy: 1});
module.exports = mongoose.model('store_weekly_earning', store_weekly_earning);