var mongoose = require('mongoose');
var schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var store_analytic = new schema({
    unique_id: Number,
    store_id: {type: schema.Types.ObjectId},
    order_status: {type: Number, default: 0},
    total_items: {type: Number, default: 0},
    tag_date: {type: String, default: ""},
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


store_analytic.plugin(autoIncrement.plugin, {model: 'store_analytic', field: 'unique_id', startAt: 1, incrementBy: 1});
module.exports = mongoose.model('store_analytic', store_analytic);