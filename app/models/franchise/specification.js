var mongoose = require('mongoose');
var schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var franchise_specification = new schema({
    unique_id: Number,
    product_id: {type: schema.Types.ObjectId},
    store_id: [{type: schema.Types.ObjectId}],
    franchise_id: {type: schema.Types.ObjectId},
    name: {type: String, default: ""},
    price: {type: Number, default: 0},
    is_default_selected: {type: Boolean, default: false},
    is_user_selected: {type: Boolean, default: false},
    specification_group_id: {type: schema.Types.ObjectId},
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



franchise_specification.plugin(autoIncrement.plugin, {model: 'franchise_specification', field: 'unique_id', startAt: 1, incrementBy: 1});

module.exports = mongoose.model('franchise_specification', franchise_specification);