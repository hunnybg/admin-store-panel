var mongoose = require('mongoose');
var schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var table_request = new schema({
    unique_id: Number,
    store_id: { type: schema.Types.ObjectId },
    user_id: { type: schema.Types.ObjectId },
    from_vaiter: { type: Boolean, default: false },
    vaiter_id: { type: schema.Types.ObjectId, default: null },
    status: { type: Number, default: 1 },
    table_number: { type: String, default: "" },
    user_name: { type: String, default: "" },
    number_of_people: { type: Number, default: 1 },
    resolved_at: {type: Date, default: "" },
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

table_request.index({ store_id: 1, user_id: 1, status: 1 }, { background: true });
table_request.plugin(autoIncrement.plugin, { model: 'table_request', field: 'unique_id', startAt: 1, incrementBy: 1 });
module.exports = mongoose.model('table_request', table_request);
