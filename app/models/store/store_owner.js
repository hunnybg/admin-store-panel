var mongoose = require('mongoose');
var schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var store_owner = new schema({
    // store_owner TYPE INFORMATION
    unique_id: Number,
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    password: { type: String, default: "" },
    server_token: { type: String, default: "" },
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

store_owner.index({ email: 1 }, { background: true });

store_owner.plugin(autoIncrement.plugin, { model: 'store_owner', field: 'unique_id', startAt: 1, incrementBy: 1 });
module.exports = mongoose.model('store_owner', store_owner);