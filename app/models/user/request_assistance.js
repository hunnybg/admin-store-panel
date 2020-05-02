var mongoose = require('mongoose');
var schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var request_assistance = new schema({
    unique_id: Number,
    store_id: { type: schema.Types.ObjectId },
    user_id: { type: schema.Types.ObjectId },
    order_id: { type: schema.Types.ObjectId, default: null },
    vaiter_id: { type: schema.Types.ObjectId, default: null },
    comment: { type: String, default: "" },
    status: { type: Number, default: 1 },
    table_number: { type: String, default: "" },
    created_at: {
        type: Date,
        default: Date.now
    },
}, {
    strict: true,
    timestamps: {
        createdAt: 'created_at',
    }
});

request_assistance.index({ store_id: 1, user_id: 1, status: 1 }, { background: true });
request_assistance.plugin(autoIncrement.plugin, { model: 'request_assistance', field: 'unique_id', startAt: 1, incrementBy: 1 });
module.exports = mongoose.model('request_assistance', request_assistance);
