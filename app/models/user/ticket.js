var mongoose = require('mongoose');
var schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var ticket = new schema({
    unique_id: Number,
    user_id: { type: schema.Types.ObjectId },
    status: { type: Number, default: 0 },
    user_type: { type: Number, default: 7 },
    ticket_title: { type: String, default: "" },
    ticket_content: { type: String, default: "" },
    resolved_at: { type: Date, default: "" },
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

ticket.index({ store_id: 1, user_id: 1, status: 1 }, { background: true });
ticket.plugin(autoIncrement.plugin, { model: 'ticket', field: 'unique_id', startAt: 1, incrementBy: 1 });
module.exports = mongoose.model('ticket', ticket);
