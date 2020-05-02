var mongoose = require('mongoose');
var schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var shift_time = new schema({
    unique_id: Number,
    vaiter_id: { type: schema.Types.ObjectId },
    store_id: { type: schema.Types.ObjectId },
    shift_time_from: { type: String, default: "" },
    shift_time_till: { type: String, default: "" },
    day: { type: Number, default: 0 },
    month: { type: Number, default: 0 },
    year: { type: Number, default: 0 },
    deleted: { type: Boolean, default: false },
    date_of_shift: { type: Date },
    timezone: { type: String, default: "" },
    total_time_in_hour: { type: Number, default: 0 },
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

shift_time.index({ year: 1, month: 1 }, { background: true });
shift_time.plugin(autoIncrement.plugin, { model: 'shift_time', field: 'unique_id', startAt: 1, incrementBy: 1 });
module.exports = mongoose.model('shift_time', shift_time);